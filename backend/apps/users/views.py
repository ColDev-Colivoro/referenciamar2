from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.audit.services import log_audit_event

from .models import Role, UserMembership
from .serializers import (
    RoleSerializer,
    UserCreateSerializer,
    UserMembershipSerializer,
    UserMembershipUpdateSerializer,
)
from .services import get_request_membership, membership_can_manage_users


class UserListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        membership = get_request_membership(request)
        if not membership_can_manage_users(membership):
            return Response({"detail": "No autorizado."}, status=status.HTTP_403_FORBIDDEN)

        memberships = UserMembership.objects.filter(tenant=membership.tenant).select_related("user", "role")
        return Response(UserMembershipSerializer(memberships, many=True).data)

    def post(self, request):
        membership = get_request_membership(request)
        if not membership_can_manage_users(membership):
            return Response({"detail": "No autorizado."}, status=status.HTTP_403_FORBIDDEN)

        serializer = UserCreateSerializer(data=request.data, context={"tenant": membership.tenant})
        serializer.is_valid(raise_exception=True)
        new_membership = serializer.save()
        log_audit_event(
            action="users.create",
            tenant=membership.tenant,
            actor=request.user,
            metadata={"created_user_id": new_membership.user_id, "role": new_membership.role.code},
        )
        return Response(UserMembershipSerializer(new_membership).data, status=status.HTTP_201_CREATED)


class UserMembershipDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, membership_id: int):
        membership = get_request_membership(request)
        if not membership_can_manage_users(membership):
            return Response({"detail": "No autorizado."}, status=status.HTTP_403_FORBIDDEN)

        target = (
            UserMembership.objects.filter(id=membership_id, tenant=membership.tenant)
            .select_related("user", "role", "tenant")
            .first()
        )
        if target is None:
            return Response({"detail": "Usuario no encontrado."}, status=status.HTTP_404_NOT_FOUND)

        serializer = UserMembershipUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        target = serializer.update(target, serializer.validated_data)
        log_audit_event(
            action="users.update_membership",
            tenant=membership.tenant,
            actor=request.user,
            metadata={"target_membership_id": target.id, "role": target.role.code, "is_active": target.is_active},
        )
        return Response(UserMembershipSerializer(target).data)


class RoleListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        membership = get_request_membership(request)
        if membership is None:
            return Response({"detail": "No autorizado."}, status=status.HTTP_403_FORBIDDEN)
        roles = Role.objects.all().order_by("name")
        return Response(RoleSerializer(roles, many=True).data)
