from django.urls import path
from .views import (
    LotListCreateView, LotDetailView, LotStatusView,
    FormListCreateView, FormDetailView, FormStatusView,
)

urlpatterns = [
    path("", LotListCreateView.as_view(), name="lot-list-create"),
    path("<int:lot_id>/", LotDetailView.as_view(), name="lot-detail"),
    path("<int:lot_id>/status/", LotStatusView.as_view(), name="lot-status"),
    path("<int:lot_id>/forms/", FormListCreateView.as_view(), name="form-list-create"),
    path("<int:lot_id>/forms/<int:form_id>/", FormDetailView.as_view(), name="form-detail"),
    path("<int:lot_id>/forms/<int:form_id>/status/", FormStatusView.as_view(), name="form-status"),
]
