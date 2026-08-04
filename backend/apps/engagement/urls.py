from django.urls import path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"favorites", views.FavoriteViewSet, basename="favorite")

urlpatterns = [
    path("history/", views.WatchHistoryView.as_view(), name="watch-history"),
    path("history/<int:video_id>/", views.RemoveHistoryItemView.as_view(), name="remove-history-item"),
    path("continue-watching/", views.ContinueWatchingView.as_view(), name="continue-watching"),
    path("progress/", views.WatchProgressView.as_view(), name="watch-progress"),
    path("progress/<int:video_id>/", views.WatchProgressView.as_view(), name="watch-progress-detail"),
    path("views/", views.RecordVideoViewView.as_view(), name="record-view"),
    path("favorites/video/<int:video_id>/", views.RemoveFavoriteByVideoView.as_view(), name="remove-favorite-by-video"),
] + router.urls
