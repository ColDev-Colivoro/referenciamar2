from django.db.models import Count, Q
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated

from apps.users.services import get_request_membership
from apps.quality.models import Lot, QualityForm
from apps.audit.models import AuditEvent
from apps.audit.serializers import AuditEventSerializer


class LotSummaryView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        membership = get_request_membership(request)
        if not membership:
            return Response({"detail": "Membership not found."}, status=401)
        
        now = timezone.now()
        qs = Lot.objects.filter(tenant=membership.tenant)
        
        status_counts = {
            item["status"]: item["count"]
            for item in qs.values("status").annotate(count=Count("id"))
        }
        
        this_month = qs.filter(
            created_at__year=now.year,
            created_at__month=now.month,
        ).count()
        
        return Response({
            "total": qs.count(),
            "this_month": this_month,
            "by_status": {
                "pending": status_counts.get("pending", 0),
                "in_process": status_counts.get("in_process", 0),
                "approved": status_counts.get("approved", 0),
                "rejected": status_counts.get("rejected", 0),
            },
        })


class FormSummaryView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        membership = get_request_membership(request)
        if not membership:
            return Response({"detail": "Membership not found."}, status=401)
        
        qs = QualityForm.objects.filter(tenant=membership.tenant)
        
        by_type = {
            item["form_type"]: item["count"]
            for item in qs.values("form_type").annotate(count=Count("id"))
        }
        
        by_status = {
            item["status"]: item["count"]
            for item in qs.values("status").annotate(count=Count("id"))
        }
        
        return Response({
            "total": qs.count(),
            "by_type": by_type,
            "by_status": {
                "draft": by_status.get("draft", 0),
                "submitted": by_status.get("submitted", 0),
                "approved": by_status.get("approved", 0),
                "rejected": by_status.get("rejected", 0),
            },
        })


class ActivityView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        membership = get_request_membership(request)
        if not membership:
            return Response({"detail": "Membership not found."}, status=401)
        
        events = AuditEvent.objects.filter(
            tenant=membership.tenant
        ).order_by("-created_at")[:20]
        
        return Response(AuditEventSerializer(events, many=True).data)


class DashboardView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        membership = get_request_membership(request)
        if not membership:
            return Response({"detail": "Membership not found."}, status=401)
        
        now = timezone.now()
        lot_qs = Lot.objects.filter(tenant=membership.tenant)
        form_qs = QualityForm.objects.filter(tenant=membership.tenant)
        
        lot_status_counts = {
            item["status"]: item["count"]
            for item in lot_qs.values("status").annotate(count=Count("id"))
        }
        form_status_counts = {
            item["status"]: item["count"]
            for item in form_qs.values("status").annotate(count=Count("id"))
        }
        form_type_counts = {
            item["form_type"]: item["count"]
            for item in form_qs.values("form_type").annotate(count=Count("id"))
        }
        
        recent_events = AuditEvent.objects.filter(
            tenant=membership.tenant
        ).order_by("-created_at")[:20]
        
        return Response({
            "lot_summary": {
                "total": lot_qs.count(),
                "this_month": lot_qs.filter(
                    created_at__year=now.year,
                    created_at__month=now.month,
                ).count(),
                "by_status": {
                    "pending": lot_status_counts.get("pending", 0),
                    "in_process": lot_status_counts.get("in_process", 0),
                    "approved": lot_status_counts.get("approved", 0),
                    "rejected": lot_status_counts.get("rejected", 0),
                },
            },
            "form_summary": {
                "total": form_qs.count(),
                "by_type": form_type_counts,
                "by_status": {
                    "draft": form_status_counts.get("draft", 0),
                    "submitted": form_status_counts.get("submitted", 0),
                    "approved": form_status_counts.get("approved", 0),
                    "rejected": form_status_counts.get("rejected", 0),
                },
            },
            "recent_activity": AuditEventSerializer(recent_events, many=True).data,
        })
