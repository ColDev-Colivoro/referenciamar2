"""
Tests for the lots API — Phase 4 (lots-vertical-slice).

Covers tasks T4.2 – T4.14.
"""
import pytest
from datetime import date

from apps.quality.models import Lot
from apps.users.models import Role, UserMembership

LOTS_URL = "/api/v1/lots/"


# ── local fixtures ────────────────────────────────────────────────────────────

@pytest.fixture
def write_role(db, seeded_roles):
    return Role.objects.get(code="manager")


@pytest.fixture
def readonly_role(db, seeded_roles):
    return Role.objects.get(code="monitor")


@pytest.fixture
def supervisor_role(db, seeded_roles):
    return Role.objects.get(code="production_supervisor")


@pytest.fixture
def write_membership(db, user, tenant, write_role):
    return UserMembership.objects.create(
        user=user, tenant=tenant, role=write_role, is_active=True
    )


@pytest.fixture
def readonly_membership(db, user, tenant, readonly_role):
    return UserMembership.objects.create(
        user=user, tenant=tenant, role=readonly_role, is_active=True
    )


@pytest.fixture
def supervisor_membership(db, user, tenant, supervisor_role):
    return UserMembership.objects.create(
        user=user, tenant=tenant, role=supervisor_role, is_active=True
    )


def make_lot(tenant, user=None, status="pending", entry_date=None, code=""):
    return Lot.objects.create(
        tenant=tenant,
        code=code,
        species="Salmon",
        origin="Puerto Montt",
        entry_date=entry_date or date.today(),
        quantity_kg="100.00",
        created_by=user,
        status=status,
    )


# ── helper ────────────────────────────────────────────────────────────────────

def _auth(api_client, auth_token, tenant):
    api_client.credentials(
        HTTP_AUTHORIZATION=f"Token {auth_token.key}",
        HTTP_X_TENANT_SLUG=tenant.slug,
    )


# ── list tests (T4.2–T4.4) ────────────────────────────────────────────────────

@pytest.mark.django_db
def test_list_lots_authenticated(api_client, auth_token, write_membership, tenant):
    make_lot(tenant)
    make_lot(tenant, code="LOT-EXTRA")
    _auth(api_client, auth_token, tenant)
    response = api_client.get(LOTS_URL)
    assert response.status_code == 200
    assert len(response.json()) == 2


@pytest.mark.django_db
def test_list_lots_unauthenticated(api_client, tenant):
    response = api_client.get(LOTS_URL)
    assert response.status_code == 401


@pytest.mark.django_db
def test_list_lots_tenant_isolation(
    api_client, auth_token, write_membership, tenant, tenant_b, user, seeded_roles
):
    # 2 lots for tenant A
    make_lot(tenant)
    make_lot(tenant, code="LOT-A2")
    # 3 lots for tenant B (direct ORM — no membership needed)
    make_lot(tenant_b, code="LOT-B1")
    make_lot(tenant_b, code="LOT-B2")
    make_lot(tenant_b, code="LOT-B3")

    _auth(api_client, auth_token, tenant)
    response = api_client.get(LOTS_URL)
    assert response.status_code == 200
    assert len(response.json()) == 2


# ── create tests (T4.5–T4.7) ─────────────────────────────────────────────────

@pytest.mark.django_db
def test_create_lot_valid_returns_201(api_client, auth_token, write_membership, tenant):
    _auth(api_client, auth_token, tenant)
    payload = {
        "species": "Salmon",
        "origin": "Puerto Montt",
        "entry_date": str(date.today()),
        "quantity_kg": "150.00",
    }
    response = api_client.post(LOTS_URL, payload, format="json")
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "pending"
    assert data["code"] != ""


@pytest.mark.django_db
def test_create_lot_missing_species_returns_400(
    api_client, auth_token, write_membership, tenant
):
    _auth(api_client, auth_token, tenant)
    payload = {
        "origin": "Puerto Montt",
        "entry_date": str(date.today()),
        "quantity_kg": "150.00",
    }
    response = api_client.post(LOTS_URL, payload, format="json")
    assert response.status_code == 400
    assert "species" in response.json()


@pytest.mark.django_db
def test_create_lot_monitor_returns_403(
    api_client, auth_token, readonly_membership, tenant
):
    _auth(api_client, auth_token, tenant)
    payload = {
        "species": "Salmon",
        "origin": "Puerto Montt",
        "entry_date": str(date.today()),
        "quantity_kg": "150.00",
    }
    response = api_client.post(LOTS_URL, payload, format="json")
    assert response.status_code == 403


# ── detail tests (T4.8–T4.9) ─────────────────────────────────────────────────

@pytest.mark.django_db
def test_get_lot_detail_own_tenant(
    api_client, auth_token, write_membership, tenant, user
):
    lot = make_lot(tenant, user=user)
    _auth(api_client, auth_token, tenant)
    response = api_client.get(f"{LOTS_URL}{lot.id}/")
    assert response.status_code == 200
    data = response.json()
    assert "code" in data
    assert "status" in data
    assert "created_by_username" in data


@pytest.mark.django_db
def test_get_lot_detail_cross_tenant_returns_404(
    api_client, auth_token, write_membership, tenant, tenant_b, seeded_roles, user
):
    lot_b = make_lot(tenant_b, user=user, code="LOT-B1")
    _auth(api_client, auth_token, tenant)
    response = api_client.get(f"{LOTS_URL}{lot_b.id}/")
    assert response.status_code == 404


# ── update tests (T4.10–T4.11) ───────────────────────────────────────────────

@pytest.mark.django_db
def test_update_lot_valid_returns_200(
    api_client, auth_token, write_membership, tenant, user
):
    lot = make_lot(tenant, user=user)
    _auth(api_client, auth_token, tenant)
    response = api_client.patch(
        f"{LOTS_URL}{lot.id}/", {"quantity_kg": "999.00"}, format="json"
    )
    assert response.status_code == 200
    assert str(response.json()["quantity_kg"]) == "999.00"


@pytest.mark.django_db
def test_update_lot_supervisor_returns_403(
    api_client, auth_token, supervisor_membership, tenant, user
):
    lot = make_lot(tenant, user=user)
    _auth(api_client, auth_token, tenant)
    response = api_client.patch(
        f"{LOTS_URL}{lot.id}/", {"quantity_kg": "999.00"}, format="json"
    )
    assert response.status_code == 403


# ── status tests (T4.12–T4.14) ───────────────────────────────────────────────

@pytest.mark.django_db
def test_change_status_valid_transition(
    api_client, auth_token, write_membership, tenant, user
):
    lot = make_lot(tenant, user=user, status="pending")
    _auth(api_client, auth_token, tenant)
    response = api_client.patch(
        f"{LOTS_URL}{lot.id}/status/", {"status": "in_process"}, format="json"
    )
    assert response.status_code == 200
    assert response.json()["status"] == "in_process"


@pytest.mark.django_db
def test_change_status_invalid_transition_returns_400(
    api_client, auth_token, write_membership, tenant, user
):
    lot = make_lot(tenant, user=user, status="pending")
    _auth(api_client, auth_token, tenant)
    response = api_client.patch(
        f"{LOTS_URL}{lot.id}/status/", {"status": "approved"}, format="json"
    )
    assert response.status_code == 400
    lot.refresh_from_db()
    assert lot.status == "pending"


@pytest.mark.django_db
def test_change_status_terminal_state_returns_400(
    api_client, auth_token, write_membership, tenant, user
):
    lot = make_lot(tenant, user=user, status="approved")
    _auth(api_client, auth_token, tenant)
    response = api_client.patch(
        f"{LOTS_URL}{lot.id}/status/", {"status": "in_process"}, format="json"
    )
    assert response.status_code == 400
