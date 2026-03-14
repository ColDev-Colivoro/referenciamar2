from django.contrib import admin

from .models import Plan, TenantRegistry, TenantSubscription


@admin.register(TenantRegistry)
class TenantRegistryAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "db_alias", "status", "plan", "created_at"]
    list_filter = ["status"]
    search_fields = ["name", "slug"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = ["name", "code", "max_users", "max_lots_per_month", "price_monthly", "is_active"]
    list_filter = ["is_active"]
    search_fields = ["name", "code"]
    readonly_fields = ["created_at"]


@admin.register(TenantSubscription)
class TenantSubscriptionAdmin(admin.ModelAdmin):
    list_display = ["tenant", "plan", "status", "trial_ends_at", "expires_at", "created_at"]
    list_filter = ["status", "plan"]
    search_fields = ["tenant__name", "tenant__slug"]
    readonly_fields = ["created_at", "updated_at"]
