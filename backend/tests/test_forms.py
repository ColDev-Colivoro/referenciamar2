"""
Tests for the forms API — Phase 4 (forms-vertical-slice).

Covers 10 scenarios: list, create, detail, status transitions, permissions, audit.
"""
import pytest
from datetime import date

from apps.quality.models import Lot, QualityForm, FormField
from apps.users.models import Role, UserMembership
from apps.audit.models import AuditEvent

FORMS_URL = "/api/v1/lots/{lot_id}/forms/"
FORM_DETAIL_URL = "/api/v1/lots/{lot_id}/forms/{form_id}/"
FORM_STATUS_URL = "/api/v1/lots/{lot_id}/forms/{form_id}/status/"


# ── local fixtures ────────────────────────────────────────────────────────────

@pytest.fixture
def manager_role_forms(db, seeded_roles):
    return Role.objects.get(code="manager")


@pytest.fixture
def quality_manager_role_forms(db, seeded_roles):
    return Role.objects.get(code="quality_manager")


@pytest.fixture
def monitor_role_forms(db, seeded_roles):
    return Role.objects.get(code="monitor")


@pytest.fixture
def manager_membership_forms(db, user, tenant, manager_role_forms):
    return UserMembership.objects.create(
        user=user, tenant=tenant, role=manager_role_forms, is_active=True
    )


@pytest.fixture
def quality_manager_membership_forms(db, user, tenant, quality_manager_role_forms):
    return UserMembership.objects.create(
        user=user, tenant=tenant, role=quality_manager_role_forms, is_active=True
    )


@pytest.fixture
def monitor_membership_forms(db, user, tenant, monitor_role_forms):
    return UserMembership.objects.create(
        user=user, tenant=tenant, role=monitor_role_forms, is_active=True
    )


def make_lot_for_forms(tenant, user=None):
    return Lot.objects.create(
        tenant=tenant,
        species="Salmon",
        origin="Puerto Montt",
        entry_date=date.today(),
        quantity_kg="100.00",
        created_by=user,
    )


def make_form(lot, tenant, user=None, status="draft"):
    return QualityForm.objects.create(
        tenant=tenant,
        lot=lot,
        form_type="recepcion_materia_prima",
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
def test_list_forms_authenticated(api_client, auth_token, manager_membership_forms, tenant, user):
    lot = make_lot_for_forms(tenant, user)
    make_form(lot, tenant, user)
    make_form(lot, tenant, user)
    _auth(api_client, auth_token, tenant)
    response = api_client.get(FORMS_URL.format(lot_id=lot.id))
    assert response.status_code == 200
    assert len(response.json()) == 2


@pytest.mark.django_db
def test_list_forms_unauthenticated(api_client, tenant):
    lot = Lot.objects.create(
        tenant=tenant,
        species="Salmon",
        origin="Puerto Montt",
        entry_date=date.today(),
        quantity_kg="100.00",
    )
    response = api_client.get(FORMS_URL.format(lot_id=lot.id))
    assert response.status_code == 401


@pytest.mark.django_db
def test_create_form_valid_returns_201(api_client, auth_token, manager_membership_forms, tenant, user):
    lot = make_lot_for_forms(tenant, user)
    _auth(api_client, auth_token, tenant)
    payload = {
        "form_type": "recepcion_materia_prima",
        "fields": [
            {"field_name": "Temperatura", "field_type": "number", "value": "4.5"}
        ],
    }
    response = api_client.post(FORMS_URL.format(lot_id=lot.id), payload, format="json")
    assert response.status_code == 201
    data = response.json()
    assert "fields" in data
    assert len(data["fields"]) == 1


@pytest.mark.django_db
def test_create_form_invalid_form_type_returns_400(api_client, auth_token, manager_membership_forms, tenant, user):
    lot = make_lot_for_forms(tenant, user)
    _auth(api_client, auth_token, tenant)
    payload = {"form_type": "invalid_type"}
    response = api_client.post(FORMS_URL.format(lot_id=lot.id), payload, format="json")
    assert response.status_code == 400


@pytest.mark.django_db
def test_get_form_detail_200(api_client, auth_token, manager_membership_forms, tenant, user):
    lot = make_lot_for_forms(tenant, user)
    form = make_form(lot, tenant, user)
    _auth(api_client, auth_token, tenant)
    response = api_client.get(FORM_DETAIL_URL.format(lot_id=lot.id, form_id=form.id))
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert "form_type" in data
    assert "status" in data
    assert "fields" in data


@pytest.mark.django_db
def test_submit_form_valid_transition(api_client, auth_token, manager_membership_forms, tenant, user):
    lot = make_lot_for_forms(tenant, user)
    form = make_form(lot, tenant, user, status="draft")
    _auth(api_client, auth_token, tenant)
    response = api_client.patch(
        FORM_STATUS_URL.format(lot_id=lot.id, form_id=form.id),
        {"status": "submitted"},
        format="json",
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "submitted"
    assert data["submitted_at"] is not None


@pytest.mark.django_db
def test_submit_form_invalid_transition_returns_400(api_client, auth_token, manager_membership_forms, tenant, user):
    lot = make_lot_for_forms(tenant, user)
    form = make_form(lot, tenant, user, status="draft")
    _auth(api_client, auth_token, tenant)
    response = api_client.patch(
        FORM_STATUS_URL.format(lot_id=lot.id, form_id=form.id),
        {"status": "approved"},
        format="json",
    )
    assert response.status_code == 400


@pytest.mark.django_db
def test_approve_form_quality_manager(api_client, auth_token, quality_manager_membership_forms, tenant, user):
    lot = make_lot_for_forms(tenant, user)
    form = make_form(lot, tenant, user, status="submitted")
    _auth(api_client, auth_token, tenant)
    response = api_client.patch(
        FORM_STATUS_URL.format(lot_id=lot.id, form_id=form.id),
        {"status": "approved"},
        format="json",
    )
    assert response.status_code == 200
    assert response.json()["status"] == "approved"


@pytest.mark.django_db
def test_approve_form_monitor_returns_403(api_client, auth_token, monitor_membership_forms, tenant, user):
    lot = make_lot_for_forms(tenant, user)
    form = make_form(lot, tenant, user, status="submitted")
    _auth(api_client, auth_token, tenant)
    response = api_client.patch(
        FORM_STATUS_URL.format(lot_id=lot.id, form_id=form.id),
        {"status": "approved"},
        format="json",
    )
    assert response.status_code == 403


@pytest.mark.django_db
def test_audit_logged_on_form_create(api_client, auth_token, manager_membership_forms, tenant, user):
    lot = make_lot_for_forms(tenant, user)
    _auth(api_client, auth_token, tenant)
    payload = {
        "form_type": "recepcion_materia_prima",
        "fields": [],
    }
    response = api_client.post(FORMS_URL.format(lot_id=lot.id), payload, format="json")
    assert response.status_code == 201
    assert AuditEvent.objects.filter(action="form.create", tenant=tenant).count() == 1
