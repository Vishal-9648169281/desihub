from django.urls import path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"videos", views.VideoViewSet, basename="video")
router.register(r"categories", views.CategoryViewSet, basename="category")
router.register(r"tags", views.TagViewSet, basename="tag")
router.register(r"admin/videos", views.AdminVideoViewSet, basename="admin-video")

urlpatterns = [
    path("search/", views.SearchView.as_view(), name="search"),
    path("search/suggestions/", views.SearchSuggestionsView.as_view(), name="search-suggestions"),
    path("admin/dashboard/stats/", views.AdminDashboardStatsView.as_view(), name="admin-dashboard-stats"),
    path("admin/analytics/search/", views.AdminSearchAnalyticsView.as_view(), name="admin-search-analytics"),
] + router.urls
