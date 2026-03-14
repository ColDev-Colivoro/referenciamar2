from django.urls import path

from .views import RoleListView, UserListCreateView, UserMembershipDetailView

urlpatterns = [
    path("", UserListCreateView.as_view(), name="users-list-create"),
    path("roles/", RoleListView.as_view(), name="roles-list"),
    path("<int:membership_id>/", UserMembershipDetailView.as_view(), name="users-membership-detail"),
]
