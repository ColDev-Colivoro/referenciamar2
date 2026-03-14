from apps.core.services import resolve_tenant

from .models import UserMembership


ADMIN_ROLE_CODES = {"global_admin", "tenant_admin"}
MANAGE_USER_PERMISSIONS = {"users.manage", "users.write", "users.admin", "tenant.users.manage"}


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


def membership_can_manage_users(membership: UserMembership | None) -> bool:
    if membership is None:
        return False
    role = membership.role
    return role.code in ADMIN_ROLE_CODES or bool(set(role.permissions) & MANAGE_USER_PERMISSIONS)
