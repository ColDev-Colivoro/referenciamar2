from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated

from apps.users.services import get_request_membership
from apps.core.models import Plan, TenantSubscription
from .serializers import PlanSerializer, TenantSubscriptionSerializer

BILLING_ADMIN_ROLES = {"global_admin", "tenant_admin"}


class PlanListView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        plans = Plan.objects.filter(is_active=True).order_by("price_monthly")
        return Response(PlanSerializer(plans, many=True).data)


class SubscriptionView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        membership = get_request_membership(request)
        if not membership:
            return Response({"detail": "Membership not found."}, status=401)
        if membership.role.code not in BILLING_ADMIN_ROLES:
            return Response({"detail": "You do not have permission to view subscription details."}, status=403)
        try:
            subscription = TenantSubscription.objects.select_related("plan").get(
                tenant=membership.tenant
            )
        except TenantSubscription.DoesNotExist:
            return Response({"detail": "No subscription found for this tenant."}, status=404)
        return Response(TenantSubscriptionSerializer(subscription).data)
