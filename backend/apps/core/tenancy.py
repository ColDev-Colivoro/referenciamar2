from __future__ import annotations

from contextvars import ContextVar
from dataclasses import dataclass
from typing import Optional

from django.conf import settings
from django.db import connections

from .models import TenantRegistry

# Modelos que deben permanecer en la base global por ahora.
# Nota: users/audit siguen aquí de forma transicional hasta cerrar la migración tenant-scoped.
GLOBAL_MODEL_LABELS = {
    "admin.logentry",
    "auth.group",
    "auth.permission",
    "contenttypes.contenttype",
    "sessions.session",
    "core.tenantregistry",
    "users.role",
    "users.usermembership",
    "audit.auditevent",
}

# Objetivo futuro: mover estos modelos a DB tenant cuando se cierre la adaptación completa.
FUTURE_TENANT_SCOPED_MODEL_LABELS = {
    "users.role",
    "users.usermembership",
    "audit.auditevent",
}

TENANT_SCOPED_MODEL_LABELS = {
    label.strip().lower()
    for label in getattr(settings, "TENANT_SCOPED_MODEL_LABELS", [])
    if isinstance(label, str) and label.strip()
}

_current_tenant: ContextVar[Optional["ResolvedTenant"]] = ContextVar("current_tenant", default=None)


class TenantContextError(RuntimeError):
    pass


@dataclass(frozen=True)
class ResolvedTenant:
    tenant_id: int
    tenant_slug: str
    db_alias: str
    source: str
    use_isolated_db: bool
    status: str
    db_name: str


def set_current_tenant(tenant: Optional[ResolvedTenant]) -> None:
    _current_tenant.set(tenant)


def get_current_tenant() -> Optional[ResolvedTenant]:
    return _current_tenant.get()


def clear_current_tenant() -> None:
    _current_tenant.set(None)


def require_current_tenant() -> ResolvedTenant:
    tenant = get_current_tenant()
    if tenant is None:
        raise TenantContextError("No existe un tenant resuelto en el contexto actual.")
    return tenant


def get_current_tenant_db_alias(*, strict: bool = False) -> Optional[str]:
    tenant = get_current_tenant()
    if tenant is None:
        if strict:
            raise TenantContextError("La operación tenant-scoped requiere un tenant resuelto.")
        return None
    return tenant.db_alias


def build_tenant_database_settings(tenant: TenantRegistry) -> dict:
    return tenant.build_database_settings()


def register_tenant_database(tenant: TenantRegistry) -> str:
    alias = tenant.effective_db_alias
    if alias == "default" or not tenant.has_complete_database_metadata:
        return "default"

    if not getattr(settings, "TENANT_AUTO_REGISTER_DATABASES", True):
        return alias

    database_settings = build_tenant_database_settings(tenant)

    settings.DATABASES[alias] = database_settings
    try:
        connections.databases[alias] = database_settings
    except AttributeError:
        pass

    return alias


def get_model_label(model) -> str:
    return f"{model._meta.app_label}.{model._meta.model_name}".lower()


def is_global_model(model) -> bool:
    return get_model_label(model) in GLOBAL_MODEL_LABELS


def is_tenant_scoped_model(model) -> bool:
    return get_model_label(model) in TENANT_SCOPED_MODEL_LABELS
