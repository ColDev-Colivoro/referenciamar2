import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("quality", "0002_add_lot"),
        ("core", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="QualityForm",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "form_type",
                    models.CharField(
                        choices=[
                            ("recepcion_materia_prima", "Recepción Materia Prima"),
                            ("control_organoleptico", "Control Organoléptico"),
                            ("control_temperatura", "Control de Temperatura"),
                            ("control_peso", "Control de Peso"),
                        ],
                        max_length=40,
                    ),
                ),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("draft", "Borrador"),
                            ("submitted", "Enviado"),
                            ("approved", "Aprobado"),
                            ("rejected", "Rechazado"),
                        ],
                        default="draft",
                        max_length=20,
                    ),
                ),
                ("submitted_at", models.DateTimeField(blank=True, null=True)),
                ("notes", models.TextField(blank=True, default="")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "filled_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="quality_forms_filled",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "lot",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="forms",
                        to="quality.lot",
                    ),
                ),
                (
                    "tenant",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="quality_forms",
                        to="core.tenantregistry",
                    ),
                ),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
        migrations.CreateModel(
            name="FormField",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("field_name", models.CharField(max_length=100)),
                (
                    "field_type",
                    models.CharField(
                        choices=[
                            ("text", "Texto"),
                            ("number", "Número"),
                            ("boolean", "Sí/No"),
                            ("select", "Selección"),
                        ],
                        default="text",
                        max_length=20,
                    ),
                ),
                ("value", models.TextField(blank=True, default="")),
                ("unit", models.CharField(blank=True, default="", max_length=30)),
                ("ordering", models.PositiveSmallIntegerField(default=0)),
                (
                    "quality_form",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="fields",
                        to="quality.qualityform",
                    ),
                ),
            ],
            options={
                "ordering": ["ordering", "id"],
            },
        ),
    ]
