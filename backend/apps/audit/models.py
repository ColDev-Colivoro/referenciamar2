from django.conf import settings
from django.db import models

from apps.core.models import TenantRegistry


class AuditEvent(models.Model):
    tenant = models.ForeignKey(TenantRegistry, null=True, blank=True, on_delete=models.SET_NULL)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    action = models.CharField(max_length=120)
    level = models.CharField(max_length=20, default="info")
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
