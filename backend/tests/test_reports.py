"""
Tests for the reports API — Phase 4 (reports-base).

Covers tasks T-15 – T-20.
"""
import pytest
from datetime import date

from apps.quality.models import Lot, QualityForm
from apps.audit.services import log_audit_event
from apps.users.models import Role, UserMembership

LOTS_SUMMARY_URL = "/api/v1/reports/lots/summary/"
FORMS_SUMMARY_URL = "/api/v1/reports/forms/summary/"
ACTIVITY_URL = "/api/v1/reports/activity/"
DASHBOARD_URL = "/api/v1/reports/dashboard/"


# ── local fixtures ────────────────────────────────────────────────────────────

@pytest.fixture
def manager_role_rpt(db, seeded_roles):
    return Role.objects.get(code="manager")


@pytest.fixture
def manager_membership_rpt(db, user, tenant, manager_role_rpt):
    return UserMembership.objects.create(
        user=user, tenant=tenant, role=manager_role_rpt, is_active=True
    )


def make_lot_rpt(tenant, user=None, status="pending"):
    return Lot.objects.create(
        tenant=tenant,
        species="Salmon",
        origin="Test",
        entry_date=date.today(),
        quantity_kg="100.00",
        created_by=user,
        status=status,
    )


def make_form_rpt(lot, tenant, user=None, form_type="recepcion_materia_prima", status="draft"):
    return QualityForm.objects.create(
        tenant=tenant,
        lot=lot,
        form_type=form_type,
        status=status,
        filled_by=user,
    )


# ── helper ────────────────────────────────────────────────────────────────────

def _auth(api_client, auth_token, tenant):
    api_client.credentials(
        HTTP_AUTHORIZATION=f"Token {auth_token.key}",
        HTTP_X_TENANT_SLUG=tenant.slug,
    )


# ── tests ─────────────────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_lot_summary_counts(api_client, auth_token, manager_membership_rpt, tenant, user):
    make_lot_rpt(tenant, user=user, status="pending")
    make_lot_rpt(tenant, user=user, status="pending")
    make_lot_rpt(tenant, user=user, status="approved")

    _auth(api_client, auth_token, tenant)
    response = api_client.get(LOTS_SUMMARY_URL)

    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 3
    assert data["by_status"]["pending"] == 2
    assert data["by_status"]["approved"] == 1


@pytest.mark.django_db
def test_lot_summary_unauthenticated(api_client, tenant):
    response = api_client.get(LOTS_SUMMARY_URL)
    assert response.status_code == 401


@pytest.mark.django_db
def test_form_summary_counts(api_client, auth_token, manager_membership_rpt, tenant, user):
    lot = make_lot_rpt(tenant, user=user)
    make_form_rpt(lot, tenant, user=user, status="draft")
    make_form_rpt(lot, tenant, user=user, status="submitted")

    _auth(api_client, auth_token, tenant)
    response = api_client.get(FORMS_SUMMARY_URL)

    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    assert data["by_status"]["draft"] == 1
    assert data["by_status"]["submitted"] == 1


@pytest.mark.django_db
def test_activity_feed_limit(api_client, auth_token, manager_membership_rpt, tenant, user):
    for _ in range(25):
        log_audit_event(tenant=tenant, actor=user, action="test")

    _auth(api_client, auth_token, tenant)
    response = api_client.get(ACTIVITY_URL)

    assert response.status_code == 200
    assert len(response.data) == 20


@pytest.mark.django_db
def test_dashboard_all_sections_present(api_client, auth_token, manager_membership_rpt, tenant):
    _auth(api_client, auth_token, tenant)
    response = api_client.get(DASHBOARD_URL)

    assert response.status_code == 200
    data = response.json()
    assert "lot_summary" in data
    assert "form_summary" in data
    assert "recent_activity" in data


@pytest.mark.django_db
def test_reports_cross_tenant_isolation(
    api_client, auth_token, manager_membership_rpt, tenant, tenant_b
):
    # 5 lots for tenant B — tenant A user should not see them
    for _ in range(5):
        make_lot_rpt(tenant_b)

    _auth(api_client, auth_token, tenant)
    response = api_client.get(LOTS_SUMMARY_URL)

    assert response.status_code == 200
    assert response.json()["total"] == 0
