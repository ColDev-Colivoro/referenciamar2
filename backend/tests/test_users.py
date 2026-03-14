"""
Tests for the users/roles/permissions API — Phase 4.

Covers tasks 4.1 – 4.10 of the users-roles-permissions change.
"""
import pytest
from django.contrib.auth import get_user_model

from apps.users.models import Role, UserMembership
from apps.users.services import ADMIN_ROLE_CODES, membership_can_manage_users

User = get_user_model()

USERS_URL = "/api/v1/users/"
ROLES_URL = "/api/v1/users/roles/"


# ── local fixtures ────────────────────────────────────────────────────────────

@pytest.fixture
def target_membership(db, user_b, tenant, seeded_roles):
    """Second membership in the same tenant — DELETE / PATCH target."""
    return UserMembership.objects.create(
        user=user_b,
        tenant=tenant,
        role=seeded_roles["monitor"],
        is_active=True,
    )


@pytest.fixture
def other_tenant_membership(db, user_b, tenant_b, seeded_roles):
    """Membership in tenant B — cross-tenant 404 test."""
    return UserMembership.objects.create(
        user=user_b,
        tenant=tenant_b,
        role=seeded_roles["tenant_admin"],
        is_active=True,
    )


# ── list users ────────────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_list_users_as_admin(admin_client):
    """GET /users/ with tenant_admin role → 200 and a list."""
    response = admin_client.get(USERS_URL)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.django_db
def test_list_users_as_monitor_returns_403(monitor_client):
    """GET /users/ with monitor role → 403."""
    response = monitor_client.get(USERS_URL)
    assert response.status_code == 403


@pytest.mark.django_db
def test_list_users_unauthenticated_returns_401(api_client):
    """GET /users/ without credentials → 401."""
    response = api_client.get(USERS_URL)
    assert response.status_code == 401


# ── create user ───────────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_create_user_as_admin(admin_client, seeded_roles):
    """POST /users/ with valid payload → 201, is_active=true, membership in DB."""
    payload = {
        "username": "brandnewuser",
        "password": "secure123",
        "first_name": "Brand",
        "last_name": "New",
        "email": "brandnew@test.com",
        "role_id": seeded_roles["monitor"].id,
    }
    response = admin_client.post(USERS_URL, payload, format="json")
    assert response.status_code == 201
    data = response.json()
    assert data["is_active"] is True
    assert UserMembership.objects.filter(user__username="brandnewuser").exists()


@pytest.mark.django_db
def test_create_user_duplicate_username_returns_400(admin_client, user, seeded_roles):
    """POST /users/ with an already-used username → 400, no new membership."""
    before = UserMembership.objects.count()
    payload = {
        "username": user.username,
        "password": "secure123",
        "role_id": seeded_roles["monitor"].id,
    }
    response = admin_client.post(USERS_URL, payload, format="json")
    assert response.status_code == 400
    assert UserMembership.objects.count() == before


@pytest.mark.django_db
def test_create_user_invalid_role_returns_400(admin_client):
    """POST /users/ with non-existent role_id → 400."""
    payload = {
        "username": "someuser",
        "password": "secure123",
        "role_id": 99999,
    }
    response = admin_client.post(USERS_URL, payload, format="json")
    assert response.status_code == 400


# ── membership detail ─────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_get_membership_detail_as_admin(admin_client, admin_membership):
    """GET /users/{id}/ for own-tenant membership → 200 with correct id."""
    response = admin_client.get(f"{USERS_URL}{admin_membership.id}/")
    assert response.status_code == 200
    assert response.json()["id"] == admin_membership.id


@pytest.mark.django_db
def test_get_membership_detail_cross_tenant_returns_404(admin_client, other_tenant_membership):
    """GET /users/{id}/ for a membership in another tenant → 404."""
    response = admin_client.get(f"{USERS_URL}{other_tenant_membership.id}/")
    assert response.status_code == 404


@pytest.mark.django_db
def test_patch_membership_role_as_admin(admin_client, target_membership, seeded_roles):
    """PATCH /users/{id}/ with new role_id → 200, role updated in DB."""
    new_role = seeded_roles["manager"]
    response = admin_client.patch(
        f"{USERS_URL}{target_membership.id}/",
        {"role_id": new_role.id},
        format="json",
    )
    assert response.status_code == 200
    target_membership.refresh_from_db()
    assert target_membership.role_id == new_role.id


# ── delete (soft-delete) ──────────────────────────────────────────────────────

@pytest.mark.django_db
def test_delete_membership_soft_deletes(admin_client, target_membership):
    """DELETE /users/{id}/ → 204, is_active=False, User still exists."""
    user_pk = target_membership.user_id
    response = admin_client.delete(f"{USERS_URL}{target_membership.id}/")
    assert response.status_code == 204
    target_membership.refresh_from_db()
    assert target_membership.is_active is False
    assert User.objects.filter(pk=user_pk).exists()


@pytest.mark.django_db
def test_delete_nonexistent_returns_404(admin_client):
    """DELETE /users/999999/ → 404."""
    response = admin_client.delete(f"{USERS_URL}999999/")
    assert response.status_code == 404


# ── roles list ────────────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_list_roles_as_any_authenticated_user(admin_client, seeded_roles):
    """GET /users/roles/ → 200, list with id/code/name/permissions per item."""
    response = admin_client.get(ROLES_URL)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    for field in ("id", "code", "name", "permissions"):
        assert field in data[0]


# ── service unit test ─────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_membership_can_manage_users_via_permission(db, user, tenant):
    """Role NOT in ADMIN_ROLE_CODES but with users.manage permission → True."""
    role = Role.objects.create(
        code="custom_manager",
        name="Custom Manager",
        permissions=["users.manage"],
    )
    membership = UserMembership.objects.create(
        user=user,
        tenant=tenant,
        role=role,
        is_active=True,
    )
    assert role.code not in ADMIN_ROLE_CODES
    assert membership_can_manage_users(membership) is True
