"""
Tests para el flujo de autenticación con DRF TokenAuthentication.

Cubre las tareas 4.1 – 4.8 del change auth-drf-token.
"""
import pytest
from django.urls import reverse
from rest_framework.authtoken.models import Token

LOGIN_URL = "/api/v1/auth/login/"
LOGOUT_URL = "/api/v1/auth/logout/"
ME_URL = "/api/v1/auth/me/"


# ---------------------------------------------------------------------------
# 4.1  Login exitoso → devuelve token
# ---------------------------------------------------------------------------
@pytest.mark.django_db
def test_login_returns_token(api_client, user, tenant, membership):
    """POST /login/ con credenciales válidas → 200 + accessToken en respuesta."""
    response = api_client.post(
        LOGIN_URL,
        {"username": "testuser", "password": "securepass123", "tenant_slug": tenant.slug},
        format="json",
    )

    assert response.status_code == 200
    data = response.json()
    assert "accessToken" in data
    assert len(data["accessToken"]) > 0
    # El token debe existir en la base de datos
    assert Token.objects.filter(user=user).exists()


# ---------------------------------------------------------------------------
# 4.2  Contraseña incorrecta → sin token creado
# ---------------------------------------------------------------------------
@pytest.mark.django_db
def test_login_wrong_password_no_token(api_client, user, tenant, membership):
    """POST /login/ con contraseña incorrecta → 400, sin token en BD."""
    response = api_client.post(
        LOGIN_URL,
        {"username": "testuser", "password": "WRONG", "tenant_slug": tenant.slug},
        format="json",
    )

    assert response.status_code == 400
    assert not Token.objects.filter(user=user).exists()


# ---------------------------------------------------------------------------
# 4.3  Usuario válido pero no pertenece al tenant → 403, sin token
# ---------------------------------------------------------------------------
@pytest.mark.django_db
def test_login_user_not_in_tenant(api_client, user, tenant_b):
    """POST /login/ con tenant incorrecto → 403, sin token."""
    # user no tiene membresía en tenant_b
    response = api_client.post(
        LOGIN_URL,
        {"username": "testuser", "password": "securepass123", "tenant_slug": tenant_b.slug},
        format="json",
    )

    assert response.status_code == 403
    assert not Token.objects.filter(user=user).exists()


# ---------------------------------------------------------------------------
# 4.4  Logout elimina el token
# ---------------------------------------------------------------------------
@pytest.mark.django_db
def test_logout_deletes_token(api_client, user, tenant, membership, auth_token):
    """POST /logout/ con token válido → 204, token eliminado de BD."""
    api_client.credentials(
        HTTP_AUTHORIZATION=f"Token {auth_token.key}",
        HTTP_X_TENANT_SLUG=tenant.slug,
    )

    response = api_client.post(LOGOUT_URL, format="json")

    assert response.status_code == 204
    assert not Token.objects.filter(user=user).exists()


# ---------------------------------------------------------------------------
# 4.5  Logout sin autenticación → 401
# ---------------------------------------------------------------------------
@pytest.mark.django_db
def test_logout_without_auth_returns_401(api_client):
    """POST /logout/ sin credenciales → 401."""
    response = api_client.post(LOGOUT_URL, format="json")

    assert response.status_code == 401


# ---------------------------------------------------------------------------
# 4.6  /me/ sin token → 401
# ---------------------------------------------------------------------------
@pytest.mark.django_db
def test_protected_endpoint_without_token_returns_401(api_client):
    """GET /me/ sin credenciales → 401."""
    response = api_client.get(ME_URL)

    assert response.status_code == 401


# ---------------------------------------------------------------------------
# 4.7  /me/ con token válido → 200 + user + tenant
# ---------------------------------------------------------------------------
@pytest.mark.django_db
def test_protected_endpoint_with_valid_token_returns_200(
    api_client, user, tenant, membership, auth_token
):
    """GET /me/ con Authorization: Token → 200, respuesta contiene user y tenant."""
    api_client.credentials(
        HTTP_AUTHORIZATION=f"Token {auth_token.key}",
        HTTP_X_TENANT_SLUG=tenant.slug,
    )

    response = api_client.get(ME_URL)

    assert response.status_code == 200
    data = response.json()
    assert "user" in data
    assert "tenant" in data
    assert data["tenant"]["slug"] == tenant.slug


# ---------------------------------------------------------------------------
# 4.8  Token de tenant A no accede a datos de tenant B
# ---------------------------------------------------------------------------
@pytest.mark.django_db
def test_token_from_tenant_a_cannot_access_tenant_b(
    api_client, user, tenant, membership, auth_token, tenant_b
):
    """GET /me/ con token de user_a pero X-Tenant-Slug de tenant_b → 403 o 401."""
    # user pertenece a tenant, pero no a tenant_b
    api_client.credentials(
        HTTP_AUTHORIZATION=f"Token {auth_token.key}",
        HTTP_X_TENANT_SLUG=tenant_b.slug,
    )

    response = api_client.get(ME_URL)

    assert response.status_code in (401, 403)
