from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Plan",
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
                    "code",
                    models.CharField(
                        choices=[
                            ("starter", "Starter"),
                            ("professional", "Professional"),
                            ("enterprise", "Enterprise"),
                        ],
                        max_length=30,
                        unique=True,
                    ),
                ),
                ("name", models.CharField(max_length=100)),
                ("max_users", models.PositiveIntegerField(default=5)),
                ("max_lots_per_month", models.PositiveIntegerField(default=50)),
                ("features", models.JSONField(default=dict)),
                (
                    "price_monthly",
                    models.DecimalField(decimal_places=2, default=0, max_digits=10),
                ),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "ordering": ["price_monthly"],
            },
        ),
        migrations.CreateModel(
            name="TenantSubscription",
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
                    "status",
                    models.CharField(
                        choices=[
                            ("active", "Activo"),
                            ("trial", "Prueba"),
                            ("expired", "Expirado"),
                            ("suspended", "Suspendido"),
                        ],
                        default="trial",
                        max_length=20,
                    ),
                ),
                ("trial_ends_at", models.DateTimeField(blank=True, null=True)),
                ("expires_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "plan",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="subscriptions",
                        to="core.plan",
                    ),
                ),
                (
                    "tenant",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="subscription",
                        to="core.tenantregistry",
                    ),
                ),
            ],
        ),
    ]
