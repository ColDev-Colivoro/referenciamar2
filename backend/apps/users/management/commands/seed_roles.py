from django.core.management.base import BaseCommand

from apps.users.models import Role

CANONICAL_ROLES: list[dict] = [
    {
        "code": "global_admin",
        "name": "Administrador Global",
        "permissions": ["users.admin", "users.manage", "tenant.manage", "audit.read", "reports.read", "system.configure"],
    },
    {
        "code": "tenant_admin",
        "name": "Administrador Tenant",
        "permissions": ["users.manage", "tenant.users.manage", "audit.read", "reports.read"],
    },
    {
        "code": "manager",
        "name": "Gerente",
        "permissions": ["lots.read", "lots.write", "reports.read", "users.read"],
    },
    {
        "code": "quality_manager",
        "name": "Jefe de Calidad",
        "permissions": ["lots.read", "lots.write", "forms.assign", "forms.read", "reports.read"],
    },
    {
        "code": "monitor",
        "name": "Monitor de Campo",
        "permissions": ["forms.read", "forms.fill", "lots.read"],
    },
    {
        "code": "production_supervisor",
        "name": "Jefe de Planta",
        "permissions": ["lots.read", "lots.write", "forms.read", "forms.fill"],
    },
]


class Command(BaseCommand):
    help = "Seed canonical roles (idempotent)"

    def handle(self, *args, **options) -> None:
        created_count = 0
        updated_count = 0

        for role_def in CANONICAL_ROLES:
            _, created = Role.objects.update_or_create(
                code=role_def["code"],
                defaults={"name": role_def["name"], "permissions": role_def["permissions"]},
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f"  Created: {role_def['code']}"))
            else:
                updated_count += 1
                self.stdout.write(f"  Updated: {role_def['code']}")

        self.stdout.write(
            self.style.SUCCESS(
                f"\nDone. {created_count} role(s) created, {updated_count} role(s) updated."
            )
        )
