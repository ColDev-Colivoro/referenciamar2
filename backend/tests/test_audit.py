"""
Tests for the audit API — Phase 4 (audit-base).

Covers: list, filters, pagination, tenant isolation, and audit logging on lot actions.
"""
import pytest
from datetime import date

from apps.audit.models import AuditEvent
from apps.audit.services import log_audit_event
from apps.users.models import Role, UserMembership

AUDIT_URL = "/api/v1/audit/"
LOTS_URL = "/api/v1/lots/"


# ── local fixtures ────────────────────────────────────────────────────────────

@pytest.fixture
def manager_role(db, seeded_roles):
    return Role.objects.get(code="manager")


@pytest.fixture
def write_membership_for_audit(db, user, tenant, manager_role):
    """Manager membership — used for lot-create / status-change tests."""
    return UserMembership.objects.create(
        user=user, tenant=tenant, role=manager_role, is_active=True
    )


# ── helper ────────────────────────────────────────────────────────────────────

def make_audit_event(tenant, actor, action="test.action", metadata=None):
    return log_audit_event(
        tenant=tenant,
        actor=actor,
        action=action,
        metadata=metadata or {},
    )


def _auth(api_client, auth_token, tenant):
    api_client.credentials(
        HTTP_AUTHORIZATION=f"Token {auth_token.key}",
        HTTP_X_TENANT_SLUG=tenant.slug,
    )


# ── list tests ────────────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_list_audit_tenant_admin_200(api_client, auth_token, admin_membership, tenant):
    make_audit_event(tenant, None)
    make_audit_event(tenant, None)
    make_audit_event(tenant, None)
    _auth(api_client, auth_token, tenant)
    response = api_client.get(AUDIT_URL)
    assert response.status_code == 200
    data = response.json()
    assert data["count"] >= 3


@pytest.mark.django_db
def test_list_audit_unauthenticated_401(api_client, tenant):
    response = api_client.get(AUDIT_URL)
    assert response.status_code == 401


@pytest.mark.django_db
def test_list_audit_monitor_403(api_client, auth_token, monitor_membership, tenant):
    _auth(api_client, auth_token, tenant)
    response = api_client.get(AUDIT_URL)
    assert response.status_code == 403


@pytest.mark.django_db
def test_list_audit_tenant_isolation(
    api_client, auth_token, admin_membership, tenant, tenant_b
):
    make_audit_event(tenant, None, action="tenant_a.event")
    make_audit_event(tenant, None, action="tenant_a.event")
    make_audit_event(tenant_b, None, action="tenant_b.event")
    _auth(api_client, auth_token, tenant)
    response = api_client.get(AUDIT_URL)
    assert response.status_code == 200
    data = response.json()
    actions = [item["action"] for item in data["results"]]
    assert "tenant_b.event" not in actions
    assert actions.count("tenant_a.event") == 2


@pytest.mark.django_db
def test_list_audit_filter_by_action(api_client, auth_token, admin_membership, tenant):
    make_audit_event(tenant, None, action="lots.create")
    make_audit_event(tenant, None, action="lots.create")
    make_audit_event(tenant, None, action="lots.update")
    _auth(api_client, auth_token, tenant)
    response = api_client.get(AUDIT_URL + "?action=lots.create")
    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 2
    for item in data["results"]:
        assert item["action"] == "lots.create"


@pytest.mark.django_db
def test_list_audit_pagination(api_client, auth_token, admin_membership, tenant):
    for i in range(55):
        make_audit_event(tenant, None, action=f"test.event.{i}")
    _auth(api_client, auth_token, tenant)
    response = api_client.get(AUDIT_URL)
    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 55
    assert len(data["results"]) == 50


# ── audit logging on lot actions ──────────────────────────────────────────────

@pytest.mark.django_db
def test_audit_logged_on_lot_create(
    api_client, auth_token, write_membership_for_audit, tenant
):
    _auth(api_client, auth_token, tenant)
    payload = {
        "species": "Salmon",
        "origin": "Puerto Montt",
        "entry_date": str(date.today()),
        "quantity_kg": "150.00",
    }
    response = api_client.post(LOTS_URL, payload, format="json")
    assert response.status_code == 201
    assert AuditEvent.objects.filter(action="lots.create", tenant=tenant).count() == 1


@pytest.mark.django_db
def test_audit_logged_on_lot_status_change(
    api_client, auth_token, write_membership_for_audit, tenant, user
):
    from apps.quality.models import Lot

    lot = Lot.objects.create(
        tenant=tenant,
        species="Salmon",
        origin="Puerto Montt",
        entry_date=date.today(),
        quantity_kg="100.00",
        created_by=user,
        status="pending",
    )
    _auth(api_client, auth_token, tenant)
    response = api_client.patch(
        f"{LOTS_URL}{lot.id}/status/", {"status": "in_process"}, format="json"
    )
    assert response.status_code == 200
    assert AuditEvent.objects.filter(action="lots.change_status", tenant=tenant).count() == 1
