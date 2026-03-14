LOT_WRITE_ROLES = {"manager", "tenant_admin", "global_admin", "quality_manager"}


def lot_can_write(membership) -> bool:
    """Returns True if the membership role can create/update lots."""
    return membership.role.code in LOT_WRITE_ROLES


FORM_APPROVE_ROLES = {"quality_manager", "manager", "tenant_admin", "global_admin"}


def form_can_approve(membership) -> bool:
    """Returns True if the membership role can approve/reject quality forms."""
    return membership.role.code in FORM_APPROVE_ROLES
