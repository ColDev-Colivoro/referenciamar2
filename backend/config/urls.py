from django.urls import include, path

urlpatterns = [
    path("api/v1/auth/", include("apps.authentication.urls")),
    path("api/v1/users/", include("apps.users.urls")),
    path("api/v1/lots/", include("apps.quality.urls")),
    path("api/v1/audit/", include("apps.audit.urls")),
    path("api/v1/reports/", include("apps.reports.urls")),
]
