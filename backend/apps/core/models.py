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
