from django.db import models
from django.conf import settings


class Lot(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pendiente"
        IN_PROCESS = "in_process", "En Proceso"
        APPROVED = "approved", "Aprobado"
        REJECTED = "rejected", "Rechazado"

    tenant = models.ForeignKey(
        "core.TenantRegistry",
        on_delete=models.CASCADE,
        related_name="lots",
    )
    code = models.CharField(max_length=30, blank=True)
    species = models.CharField(max_length=100)
    origin = models.CharField(max_length=150)
    entry_date = models.DateField()
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    quantity_kg = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(blank=True, default="")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="lots_created",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("code", "tenant")
        ordering = ["-entry_date"]

    def __str__(self):
        return f"{self.code} — {self.species} ({self.tenant})"

    def save(self, *args, **kwargs):
        if not self.code:
            year = self.entry_date.year if self.entry_date else __import__("datetime").date.today().year
            count = Lot.objects.filter(tenant=self.tenant, entry_date__year=year).count() + 1
            self.code = f"LOT-{year}-{count:03d}"
        super().save(*args, **kwargs)


class QualityForm(models.Model):
    class FormType(models.TextChoices):
        RECEPCION = "recepcion_materia_prima", "Recepción Materia Prima"
        ORGANOLEPTICO = "control_organoleptico", "Control Organoléptico"
        TEMPERATURA = "control_temperatura", "Control de Temperatura"
        PESO = "control_peso", "Control de Peso"

    class Status(models.TextChoices):
        DRAFT = "draft", "Borrador"
        SUBMITTED = "submitted", "Enviado"
        APPROVED = "approved", "Aprobado"
        REJECTED = "rejected", "Rechazado"

    tenant = models.ForeignKey(
        "core.TenantRegistry",
        on_delete=models.CASCADE,
        related_name="quality_forms",
    )
    lot = models.ForeignKey(
        Lot,
        on_delete=models.CASCADE,
        related_name="forms",
    )
    form_type = models.CharField(max_length=40, choices=FormType.choices)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
    )
    filled_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="quality_forms_filled",
    )
    submitted_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.get_form_type_display()} — {self.lot.code} ({self.status})"


class FormField(models.Model):
    class FieldType(models.TextChoices):
        TEXT = "text", "Texto"
        NUMBER = "number", "Número"
        BOOLEAN = "boolean", "Sí/No"
        SELECT = "select", "Selección"

    quality_form = models.ForeignKey(
        QualityForm,
        on_delete=models.CASCADE,
        related_name="fields",
    )
    field_name = models.CharField(max_length=100)
    field_type = models.CharField(max_length=20, choices=FieldType.choices, default=FieldType.TEXT)
    value = models.TextField(blank=True, default="")
    unit = models.CharField(max_length=30, blank=True, default="")
    ordering = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["ordering", "id"]

    def __str__(self):
        return f"{self.field_name}: {self.value}"
