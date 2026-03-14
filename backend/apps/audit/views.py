from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated

from apps.users.services import get_request_membership
from .models import AuditEvent
from .serializers import AuditEventSerializer
from .pagination import AuditPagination

AUDIT_ADMIN_ROLES = {"global_admin", "tenant_admin"}


class AuditListView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        membership = get_request_membership(request)
        if not membership:
            return Response({"detail": "Membership not found."}, status=401)
        if membership.role.code not in AUDIT_ADMIN_ROLES:
            return Response({"detail": "You do not have permission to view audit logs."}, status=403)

        qs = AuditEvent.objects.filter(tenant=membership.tenant).order_by("-created_at")

        action = request.GET.get("action")
        date_from = request.GET.get("date_from")
        date_to = request.GET.get("date_to")

        if action:
            qs = qs.filter(action=action)
        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)

        paginator = AuditPagination()
        page = paginator.paginate_queryset(qs, request)
        serializer = AuditEventSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)
