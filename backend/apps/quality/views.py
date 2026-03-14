from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated

from apps.audit.services import log_audit_event
from apps.users.services import get_request_membership
from .models import Lot
from .serializers import LotSerializer, LotCreateSerializer, LotStatusSerializer
from .permissions import lot_can_write


def _get_lot_or_404(lot_id, tenant):
    try:
        return Lot.objects.get(pk=lot_id, tenant=tenant)
    except Lot.DoesNotExist:
        return None


class LotListCreateView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        membership = get_request_membership(request)
        if not membership:
            return Response({"detail": "Membership not found."}, status=status.HTTP_401_UNAUTHORIZED)
        lots = Lot.objects.filter(tenant=membership.tenant).select_related("created_by").order_by("-entry_date")
        return Response(LotSerializer(lots, many=True).data)

    def post(self, request):
        membership = get_request_membership(request)
        if not membership:
            return Response({"detail": "Membership not found."}, status=status.HTTP_401_UNAUTHORIZED)
        if not lot_can_write(membership):
            return Response({"detail": "You do not have permission to create lots."}, status=status.HTTP_403_FORBIDDEN)
        serializer = LotCreateSerializer(
            data=request.data,
            context={"tenant": membership.tenant, "user": request.user},
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        lot = serializer.save()
        log_audit_event(
            action="lots.create",
            tenant=membership.tenant,
            actor=request.user,
            metadata={"resource_type": "lot", "resource_id": lot.id, "code": lot.code, "species": lot.species},
        )
        return Response(LotSerializer(lot).data, status=status.HTTP_201_CREATED)


class LotDetailView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, lot_id):
        membership = get_request_membership(request)
        if not membership:
            return Response({"detail": "Membership not found."}, status=status.HTTP_401_UNAUTHORIZED)
        lot = _get_lot_or_404(lot_id, membership.tenant)
        if not lot:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(LotSerializer(lot).data)

    def patch(self, request, lot_id):
        membership = get_request_membership(request)
        if not membership:
            return Response({"detail": "Membership not found."}, status=status.HTTP_401_UNAUTHORIZED)
        if not lot_can_write(membership):
            return Response({"detail": "You do not have permission to update lots."}, status=status.HTTP_403_FORBIDDEN)
        lot = _get_lot_or_404(lot_id, membership.tenant)
        if not lot:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = LotCreateSerializer(
            lot,
            data=request.data,
            partial=True,
            context={"tenant": membership.tenant, "user": request.user, "instance": lot},
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        lot = serializer.save()
        log_audit_event(
            action="lots.update",
            tenant=membership.tenant,
            actor=request.user,
            metadata={"resource_type": "lot", "resource_id": lot.id, "updated_fields": list(request.data.keys())},
        )
        return Response(LotSerializer(lot).data)


class LotStatusView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request, lot_id):
        membership = get_request_membership(request)
        if not membership:
            return Response({"detail": "Membership not found."}, status=status.HTTP_401_UNAUTHORIZED)
        if not lot_can_write(membership):
            return Response({"detail": "You do not have permission to change lot status."}, status=status.HTTP_403_FORBIDDEN)
        lot = _get_lot_or_404(lot_id, membership.tenant)
        if not lot:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = LotStatusSerializer(data=request.data, context={"lot": lot})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        lot.status = serializer.validated_data["status"]
        lot.save(update_fields=["status", "updated_at"])
        log_audit_event(
            action="lots.change_status",
            tenant=membership.tenant,
            actor=request.user,
            metadata={"resource_type": "lot", "resource_id": lot.id, "new_status": lot.status},
        )
        return Response(LotSerializer(lot).data)
