from apps.core.services import resolve_tenant

from .models import UserMembership


ADMIN_ROLE_CODES = {"global_admin", "tenant_admin"}


def get_request_membership(request):
    tenant = resolve_tenant(request)
    if tenant is None or not request.user.is_authenticated:
        return None

    membership = (
        UserMembership.objects.filter(user=request.user, tenant_id=tenant.tenant_id, is_active=True)
        .select_related("role", "tenant", "user")
        .first()
    )
    return membership


def membership_can_manage_users(membership: UserMembership | None):
    return membership is not None and membership.role.code in ADMIN_ROLE_CODES
