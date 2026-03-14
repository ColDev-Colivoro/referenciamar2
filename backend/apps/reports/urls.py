from django.urls import path
from .views import LotSummaryView, FormSummaryView, ActivityView, DashboardView

urlpatterns = [
    path("lots/summary/", LotSummaryView.as_view(), name="report-lots-summary"),
    path("forms/summary/", FormSummaryView.as_view(), name="report-forms-summary"),
    path("activity/", ActivityView.as_view(), name="report-activity"),
    path("dashboard/", DashboardView.as_view(), name="report-dashboard"),
]
