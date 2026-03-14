from rest_framework import serializers
from apps.core.models import Plan, TenantSubscription


class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = ["id", "code", "name", "max_users", "max_lots_per_month", "features", "price_monthly"]


class TenantSubscriptionSerializer(serializers.ModelSerializer):
    plan = PlanSerializer(read_only=True)

    class Meta:
        model = TenantSubscription
        fields = ["id", "plan", "status", "trial_ends_at", "expires_at", "created_at", "updated_at"]
