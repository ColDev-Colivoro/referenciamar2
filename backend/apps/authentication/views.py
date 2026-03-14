from django.contrib.auth import login, logout
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.audit.services import log_audit_event
from apps.core.models import TenantRegistry
from apps.core.services import resolve_tenant
from apps.users.models import UserMembership

from .serializers import LoginSerializer


def build_session_payload(membership: UserMembership, session_mode: str = "hybrid"):
    return {
        "sessionMode": session_mode,
        "user": {
            "id": str(membership.user.id),
            "fullName": membership.user.get_full_name() or membership.user.username,
            "role": membership.role.code,
        },
        "tenant": {
            "id": str(membership.tenant.id),
            "slug": membership.tenant.slug,
            "name": membership.tenant.name,
        },
        "permissions": membership.role.permissions,
    }


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]
        tenant = serializer.validated_data["tenant"]
        membership = (
            UserMembership.objects.filter(user=user, tenant_id=tenant.tenant_id, is_active=True)
            .select_related("role")
            .first()
        )

        if membership is None:
            log_audit_event(
                action="auth.login_denied_membership",
                tenant=TenantRegistry.objects.filter(id=tenant.tenant_id).first(),
                actor=user,
                level="warning",
                metadata={"tenant_slug": tenant.tenant_slug},
            )
            return Response({"detail": "El usuario no pertenece al tenant indicado."}, status=status.HTTP_403_FORBIDDEN)

        login(request, user)
        request.session["tenant_id"] = membership.tenant_id
        request.session["tenant_slug"] = membership.tenant.slug

        log_audit_event(
            action="auth.login_success",
            tenant=membership.tenant,
            actor=user,
            metadata={"role": membership.role.code, "session_mode": "hybrid"},
        )

        return Response(build_session_payload(membership))


class SessionView(APIView):
    def get(self, request):
        tenant = resolve_tenant(request)
        if tenant is None:
            return Response({"detail": "Tenant no resuelto."}, status=status.HTTP_401_UNAUTHORIZED)

        membership = (
            UserMembership.objects.filter(user=request.user, tenant_id=tenant.tenant_id, is_active=True)
            .select_related("role", "tenant")
            .first()
        )

        if membership is None:
            return Response({"detail": "Sesión sin membresía válida."}, status=status.HTTP_403_FORBIDDEN)

        return Response(build_session_payload(membership))


class LogoutView(APIView):
    def post(self, request):
        if request.user.is_authenticated:
            tenant_id = request.session.get("tenant_id")
            tenant = TenantRegistry.objects.filter(id=tenant_id).first() if tenant_id else None
            log_audit_event(
                action="auth.logout",
                tenant=tenant,
                actor=request.user,
                metadata={},
            )

        logout(request)
        request.session.flush()

        return Response(status=status.HTTP_204_NO_CONTENT)
