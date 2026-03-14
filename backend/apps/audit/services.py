from typing import Optional

from django.contrib.auth import get_user_model

from apps.core.models import TenantRegistry

from .models import AuditEvent

User = get_user_model()


def log_audit_event(
    *,
    action: str,
    tenant: Optional[TenantRegistry] = None,
    actor: Optional[User] = None,
    level: str = "info",
    metadata: Optional[dict] = None,
) -> AuditEvent:
    return AuditEvent.objects.create(
        tenant=tenant,
        actor=actor,
        action=action,
        level=level,
        metadata=metadata or {},
    )
