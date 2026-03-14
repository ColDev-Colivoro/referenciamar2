from django.core.management.base import BaseCommand
from apps.core.models import Plan


CANONICAL_PLANS = [
    {
        "code": "starter",
        "name": "Starter",
        "max_users": 5,
        "max_lots_per_month": 50,
        "features": {"audit": True, "reports": False, "export": False},
        "price_monthly": "0.00",
        "is_active": True,
    },
    {
        "code": "professional",
        "name": "Professional",
        "max_users": 25,
        "max_lots_per_month": 500,
        "features": {"audit": True, "reports": True, "export": True},
        "price_monthly": "99.00",
        "is_active": True,
    },
    {
        "code": "enterprise",
        "name": "Enterprise",
        "max_users": 9999,
        "max_lots_per_month": 9999,
        "features": {"audit": True, "reports": True, "export": True, "api_access": True, "custom_forms": True},
        "price_monthly": "299.00",
        "is_active": True,
    },
]


class Command(BaseCommand):
    help = "Seed canonical billing plans (idempotent)"

    def handle(self, *args, **options):
        created_count = 0
        updated_count = 0
        for plan_data in CANONICAL_PLANS:
            code = plan_data.pop("code")
            _, created = Plan.objects.update_or_create(
                code=code,
                defaults=plan_data,
            )
            plan_data["code"] = code  # restore for next iteration safety
            if created:
                created_count += 1
            else:
                updated_count += 1
        self.stdout.write(
            self.style.SUCCESS(
                f"Plans seeded: {created_count} created, {updated_count} updated."
            )
        )
