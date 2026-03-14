from copy import deepcopy

from django.conf import settings
from django.db import models


class TenantRegistry(models.Model):
    class Status(models.TextChoices):
        PROVISIONING = "provisioning", "Provisioning"
        ACTIVE = "active", "Active"
        SUSPENDED = "suspended", "Suspended"
        ARCHIVED = "archived", "Archived"

    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=255)
    db_alias = models.CharField(max_length=100, unique=True)
    db_name = models.CharField(max_length=255)
    db_user = models.CharField(max_length=255, blank=True, default="")
    db_password = models.CharField(max_length=255, blank=True, default="")
    db_host = models.CharField(max_length=255, blank=True, default="")
    db_port = models.CharField(max_length=20, blank=True, default="")
    db_options = models.JSONField(default=dict, blank=True)
    use_isolated_db = models.BooleanField(default=True)
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.ACTIVE)
    plan = models.CharField(max_length=30, default="starter")
    subdomain = models.CharField(max_length=120, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return f"{self.name} ({self.slug})"

    @property
    def effective_db_alias(self) -> str:
        return self.db_alias if self.use_isolated_db else "default"

    @property
    def has_complete_database_metadata(self) -> bool:
        if not self.use_isolated_db:
            return True

        return bool(self.db_alias and self.db_name)

    @property
    def can_accept_requests(self) -> bool:
        return self.status == self.Status.ACTIVE and self.has_complete_database_metadata

    def build_database_settings(self) -> dict:
        database_settings = deepcopy(settings.TENANT_DATABASE_TEMPLATE)
        database_settings["NAME"] = self.db_name

        if self.db_user:
            database_settings["USER"] = self.db_user
        if self.db_password:
            database_settings["PASSWORD"] = self.db_password
        if self.db_host:
            database_settings["HOST"] = self.db_host
        if self.db_port:
            database_settings["PORT"] = self.db_port
        if self.db_options:
            database_settings["OPTIONS"] = {
                **database_settings.get("OPTIONS", {}),
                **self.db_options,
            }

        return database_settings


class Plan(models.Model):
    class Code(models.TextChoices):
        STARTER = "starter", "Starter"
        PROFESSIONAL = "professional", "Professional"
        ENTERPRISE = "enterprise", "Enterprise"

    code = models.CharField(max_length=30, choices=Code.choices, unique=True)
    name = models.CharField(max_length=100)
    max_users = models.PositiveIntegerField(default=5)
    max_lots_per_month = models.PositiveIntegerField(default=50)
    features = models.JSONField(default=dict)
    price_monthly = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["price_monthly"]

    def __str__(self):
        return f"{self.name} ({self.code})"


class TenantSubscription(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "active", "Activo"
        TRIAL = "trial", "Prueba"
        EXPIRED = "expired", "Expirado"
        SUSPENDED = "suspended", "Suspendido"

    tenant = models.OneToOneField(
        TenantRegistry,
        on_delete=models.CASCADE,
        related_name="subscription",
    )
    plan = models.ForeignKey(
        Plan,
        on_delete=models.PROTECT,
        related_name="subscriptions",
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.TRIAL,
    )
    trial_ends_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.tenant} → {self.plan.name} ({self.status})"
