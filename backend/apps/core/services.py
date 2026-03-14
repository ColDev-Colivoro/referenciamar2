from typing import Optional

from django.conf import settings
from django.http import HttpRequest

from .models import TenantRegistry
from .tenancy import clear_current_tenant, register_tenant_database, ResolvedTenant, set_current_tenant


def extract_subdomain(host: str) -> Optional[str]:
    clean_host = host.split(":")[0]
    parts = clean_host.split(".")
    if len(parts) < 3:
        return None
    return parts[0]


def _build_resolved_tenant(tenant: TenantRegistry, source: str) -> ResolvedTenant:
    db_alias = register_tenant_database(tenant)
    resolved_tenant = ResolvedTenant(
        tenant_id=tenant.id,
        tenant_slug=tenant.slug,
        db_alias=db_alias,
        source=source,
        use_isolated_db=tenant.use_isolated_db,
        status=tenant.status,
        db_name=tenant.db_name,
    )
    set_current_tenant(resolved_tenant)
    return resolved_tenant


def _tenant_is_request_ready(tenant: TenantRegistry) -> bool:
    if tenant.status != TenantRegistry.Status.ACTIVE:
        return False

    if getattr(settings, "TENANT_ENFORCE_DB_READY", True):
        return tenant.has_complete_database_metadata

    return True


def resolve_tenant(request: HttpRequest, tenant_slug: Optional[str] = None) -> Optional[ResolvedTenant]:
    slug = (
        tenant_slug
        or request.headers.get("X-Tenant-Slug")
        or request.GET.get("tenant")
        or request.session.get("tenant_slug")
    )
    source = "slug"

    if not slug:
        subdomain = extract_subdomain(request.get_host())
        if subdomain:
            tenant = TenantRegistry.objects.filter(subdomain=subdomain).first()
            if tenant:
                if not _tenant_is_request_ready(tenant):
                    clear_current_tenant()
                    return None
                return _build_resolved_tenant(tenant, "subdomain")

    if not slug:
        clear_current_tenant()
        return None

    tenant = TenantRegistry.objects.filter(slug=slug).first()
    if not tenant or not _tenant_is_request_ready(tenant):
        clear_current_tenant()
        return None

    return _build_resolved_tenant(tenant, source)
