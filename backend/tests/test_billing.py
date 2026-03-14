"""
Tests for the billing API — Phase 4 (billing-licensing).

Covers tasks T4.1 – T4.9 (8 tests).
"""
import pytest
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token

from apps.core.models import Plan, TenantSubscription
from apps.users.models import Role, UserMembership

PLANS_URL = "/api/v1/billing/plans/"
SUBSCRIPTION_URL = "/api/v1/billing/subscription/"

# ── local fixtures ─────────────────────────────────────────────────────────────

@pytest.fixture
def starter_plan(db):
    return Plan.objects.create(
        code="starter", name="Starter", max_users=5,
        max_lots_per_month=50, price_monthly="0.00",
        features={"audit": True}, is_active=True,
    )


@pytest.fixture
def admin_role_bil(db, seeded_roles):
    return Role.objects.get(code="tenant_admin")


@pytest.fixture
def monitor_role_bil(db, seeded_roles):
    return Role.objects.get(code="monitor")


@pytest.fixture
def admin_membership_bil(db, user, tenant, admin_role_bil):
    return UserMembership.objects.create(user=user, tenant=tenant, role=admin_role_bil, is_active=True)


@pytest.fixture
def monitor_membership_bil(db, user, tenant, monitor_role_bil):
    return UserMembership.objects.create(user=user, tenant=tenant, role=monitor_role_bil, is_active=True)


@pytest.fixture
def subscription(db, tenant, starter_plan):
    return TenantSubscription.objects.create(
        tenant=tenant, plan=starter_plan, status="trial",
    )


# ── helper ─────────────────────────────────────────────────────────────────────

def _auth(api_client, auth_token, tenant):
    api_client.credentials(
        HTTP_AUTHORIZATION=f"Token {auth_token.key}",
        HTTP_X_TENANT_SLUG=tenant.slug,
    )


# ── tests ──────────────────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_list_plans_public(api_client, starter_plan):
    """GET /api/v1/billing/plans/ with no auth → 200, list with required fields."""
    response = api_client.get(PLANS_URL)

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    for item in data:
        assert "code" in item
        assert "name" in item
        assert "max_users" in item


@pytest.mark.django_db
def test_list_plans_returns_only_active(api_client, starter_plan):
    """Only active plans are returned; inactive ones are excluded."""
    Plan.objects.create(
        code="professional", name="Professional", max_users=25,
        max_lots_per_month=1000, price_monthly="49.00",
        features={}, is_active=False,
    )

    response = api_client.get(PLANS_URL)

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["code"] == "starter"


@pytest.mark.django_db
def test_get_subscription_tenant_admin_200(api_client, auth_token, tenant, admin_membership_bil, subscription):
    """tenant_admin with a subscription → 200 with plan.code and status."""
    _auth(api_client, auth_token, tenant)
    response = api_client.get(SUBSCRIPTION_URL)

    assert response.status_code == 200
    data = response.json()
    assert data["plan"]["code"] == "starter"
    assert data["status"] == "trial"


@pytest.mark.django_db
def test_get_subscription_unauthenticated_401(api_client):
    """No token → 401."""
    response = api_client.get(SUBSCRIPTION_URL)
    assert response.status_code == 401


@pytest.mark.django_db
def test_get_subscription_monitor_403(api_client, auth_token, tenant, monitor_membership_bil):
    """monitor role → 403."""
    _auth(api_client, auth_token, tenant)
    response = api_client.get(SUBSCRIPTION_URL)
    assert response.status_code == 403


@pytest.mark.django_db
def test_get_subscription_no_subscription_404(api_client, auth_token, tenant, admin_membership_bil):
    """tenant_admin but no subscription → 404."""
    _auth(api_client, auth_token, tenant)
    response = api_client.get(SUBSCRIPTION_URL)

    assert response.status_code == 404
    assert response.json()["detail"] == "No subscription found for this tenant."


@pytest.mark.django_db
def test_get_subscription_tenant_isolation(api_client, auth_token, tenant, tenant_b, admin_membership_bil, starter_plan):
    """Subscription created for tenant_b; tenant A creds → 404."""
    TenantSubscription.objects.create(tenant=tenant_b, plan=starter_plan, status="active")

    _auth(api_client, auth_token, tenant)
    response = api_client.get(SUBSCRIPTION_URL)

    assert response.status_code == 404


@pytest.mark.django_db
def test_list_plans_ordered_by_price(api_client):
    """Plans are returned ordered ascending by price_monthly."""
    Plan.objects.create(
        code="professional", name="Professional", max_users=25,
        max_lots_per_month=1000, price_monthly="99.00",
        features={}, is_active=True,
    )
    Plan.objects.create(
        code="starter", name="Starter", max_users=5,
        max_lots_per_month=50, price_monthly="0.00",
        features={}, is_active=True,
    )
    Plan.objects.create(
        code="enterprise", name="Enterprise", max_users=999,
        max_lots_per_month=99999, price_monthly="299.00",
        features={}, is_active=True,
    )

    response = api_client.get(PLANS_URL)

    assert response.status_code == 200
    prices = [item["price_monthly"] for item in response.json()]
    assert prices == ["0.00", "99.00", "299.00"]
