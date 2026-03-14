from django.urls import path
from .views import LotListCreateView, LotDetailView, LotStatusView

urlpatterns = [
    path("", LotListCreateView.as_view(), name="lot-list-create"),
    path("<int:lot_id>/", LotDetailView.as_view(), name="lot-detail"),
    path("<int:lot_id>/status/", LotStatusView.as_view(), name="lot-status"),
]
