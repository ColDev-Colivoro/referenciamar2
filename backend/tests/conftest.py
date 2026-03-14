"""
Fixtures compartidos para los tests de ColdevConAC.
"""
import pytest
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from apps.core.models import TenantRegistry
from apps.users.models import Role, UserMembership

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def tenant(db):
    return TenantRegistry.objects.create(
        slug="test-tenant",
        name="Test Tenant",
        db_alias="test_tenant",
        db_name="test_tenant_db",
        use_isolated_db=False,
        status=TenantRegistry.Status.ACTIVE,
    )


@pytest.fixture
def tenant_b(db):
    return TenantRegistry.objects.create(
        slug="tenant-b",
        name="Tenant B",
        db_alias="tenant_b",
        db_name="tenant_b_db",
        use_isolated_db=False,
        status=TenantRegistry.Status.ACTIVE,
    )


@pytest.fixture
def role(db):
    return Role.objects.create(
        code="monitor",
        name="Monitor",
        permissions=["view_lots"],
    )


@pytest.fixture
def user(db):
    return User.objects.create_user(
        username="testuser",
        password="securepass123",
        first_name="Test",
        last_name="User",
    )


@pytest.fixture
def user_b(db):
    return User.objects.create_user(
        username="userb",
        password="securepass123",
    )


@pytest.fixture
def membership(db, user, tenant, role):
    return UserMembership.objects.create(
        user=user,
        tenant=tenant,
        role=role,
        is_active=True,
    )


@pytest.fixture
def membership_b(db, user_b, tenant_b, role):
    return UserMembership.objects.create(
        user=user_b,
        tenant=tenant_b,
        role=role,
        is_active=True,
    )


@pytest.fixture
def auth_token(db, user):
    token, _ = Token.objects.get_or_create(user=user)
    return token


@pytest.fixture
def authenticated_client(api_client, auth_token, tenant):
    api_client.credentials(
        HTTP_AUTHORIZATION=f"Token {auth_token.key}",
        HTTP_X_TENANT_SLUG=tenant.slug,
    )
    return api_client
