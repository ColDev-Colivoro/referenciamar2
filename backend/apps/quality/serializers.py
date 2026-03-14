from rest_framework import serializers
from .models import Lot

ALLOWED_TRANSITIONS = {
    "pending": {"in_process", "rejected"},
    "in_process": {"approved", "rejected"},
    "approved": set(),
    "rejected": set(),
}


class LotSerializer(serializers.ModelSerializer):
    created_by_username = serializers.SerializerMethodField()

    class Meta:
        model = Lot
        fields = [
            "id", "code", "species", "origin", "entry_date",
            "status", "quantity_kg", "notes",
            "created_by_username", "created_at", "updated_at",
        ]

    def get_created_by_username(self, obj):
        return obj.created_by.username if obj.created_by else None


class LotCreateSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=30, required=False, allow_blank=True, default="")
    species = serializers.CharField(max_length=100)
    origin = serializers.CharField(max_length=150)
    entry_date = serializers.DateField()
    quantity_kg = serializers.DecimalField(max_digits=10, decimal_places=2)
    notes = serializers.CharField(required=False, allow_blank=True, default="")

    def validate_code(self, value):
        if not value:
            return value
        tenant = self.context.get("tenant")
        qs = Lot.objects.filter(code=value, tenant=tenant)
        # On update, exclude current instance
        instance = self.context.get("instance")
        if instance:
            qs = qs.exclude(pk=instance.pk)
        if qs.exists():
            raise serializers.ValidationError("A lot with this code already exists for this tenant.")
        return value

    def create(self, validated_data):
        tenant = self.context["tenant"]
        user = self.context.get("user")
        return Lot.objects.create(tenant=tenant, created_by=user, **validated_data)

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class LotStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Lot.Status.choices)

    def validate_status(self, value):
        lot = self.context.get("lot")
        if lot and value not in ALLOWED_TRANSITIONS.get(lot.status, set()):
            raise serializers.ValidationError(
                f"Cannot transition from '{lot.status}' to '{value}'."
            )
        return value
