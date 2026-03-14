from django.db import models

from apps.core.models import TenantRegistry


class QualityPlaceholder(models.Model):
    tenant = models.ForeignKey(TenantRegistry, on_delete=models.CASCADE)
    name = models.CharField(max_length=150)
    created_at = models.DateTimeField(auto_now_add=True)
