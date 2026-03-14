from django.contrib.auth import authenticate
from rest_framework import serializers

from apps.audit.services import log_audit_event
from apps.core.models import TenantRegistry
from apps.core.services import resolve_tenant


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(trim_whitespace=False)
    tenant_slug = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        request = self.context["request"]
        tenant = resolve_tenant(request, attrs.get("tenant_slug"))
        if tenant is None:
            log_audit_event(
                action="auth.login_failed_tenant",
                tenant=None,
                actor=None,
                level="warning",
                metadata={"username": attrs.get("username", ""), "tenant_slug": attrs.get("tenant_slug", "")},
            )
            raise serializers.ValidationError("Tenant no válido o no resoluble.")

        user = authenticate(request=request, username=attrs["username"], password=attrs["password"])
        if user is None:
            log_audit_event(
                action="auth.login_failed_credentials",
                tenant=TenantRegistry.objects.filter(id=tenant.tenant_id).first(),
                actor=None,
                level="warning",
                metadata={"username": attrs["username"], "tenant_slug": tenant.tenant_slug},
            )
            raise serializers.ValidationError("Credenciales inválidas.")

        attrs["tenant"] = tenant
        attrs["user"] = user
        return attrs
