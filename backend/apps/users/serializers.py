from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Role, UserMembership

User = get_user_model()


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ["id", "code", "name", "permissions"]


class UserMembershipSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    full_name = serializers.SerializerMethodField()
    email = serializers.EmailField(source="user.email", read_only=True)
    role = RoleSerializer(read_only=True)

    class Meta:
        model = UserMembership
        fields = [
            "id",
            "user_id",
            "username",
            "full_name",
            "email",
            "role",
            "is_active",
            "created_at",
            "updated_at",
        ]

    def get_full_name(self, obj: UserMembership):
        return obj.user.get_full_name() or obj.user.username


class UserCreateSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    role_id = serializers.IntegerField()

    def validate_role_id(self, value):
        if not Role.objects.filter(id=value).exists():
            raise serializers.ValidationError("Rol no válido.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("El nombre de usuario ya existe.")
        return value

    def create(self, validated_data):
        tenant = self.context["tenant"]
        role = Role.objects.get(id=validated_data["role_id"])
        user = User.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            email=validated_data.get("email", ""),
        )
        membership = UserMembership.objects.create(
            user=user,
            tenant=tenant,
            role=role,
            is_active=True,
        )
        return membership


class UserMembershipUpdateSerializer(serializers.Serializer):
    role_id = serializers.IntegerField(required=False)
    is_active = serializers.BooleanField(required=False)

    def validate_role_id(self, value):
        if not Role.objects.filter(id=value).exists():
            raise serializers.ValidationError("Rol no válido.")
        return value

    def update(self, instance: UserMembership, validated_data):
        if "role_id" in validated_data:
            instance.role = Role.objects.get(id=validated_data["role_id"])
        if "is_active" in validated_data:
            instance.is_active = validated_data["is_active"]
        instance.save(update_fields=["role", "is_active", "updated_at"])
        return instance
