from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.videos.models import Video

from .models import Favorite, VideoView, WatchHistory, WatchProgress
from .serializers import (
    FavoriteSerializer,
    VideoViewCreateSerializer,
    WatchHistorySerializer,
    WatchProgressSerializer,
    WatchProgressUpdateSerializer,
)


class FavoriteViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user).select_related("video", "video__category")

    def create(self, request, *args, **kwargs):
        video_id = request.data.get("video_id")
        video = get_object_or_404(Video, id=video_id)
        favorite, _ = Favorite.objects.get_or_create(user=request.user, video=video)
        return Response(FavoriteSerializer(favorite, context={"request": request}).data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class RemoveFavoriteByVideoView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, video_id):
        Favorite.objects.filter(user=request.user, video_id=video_id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class WatchHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        history = WatchHistory.objects.filter(user=request.user).select_related("video", "video__category")[:100]
        return Response(WatchHistorySerializer(history, many=True, context={"request": request}).data)

    def delete(self, request):
        WatchHistory.objects.filter(user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class RemoveHistoryItemView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, video_id):
        WatchHistory.objects.filter(user=request.user, video_id=video_id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ContinueWatchingView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        progress = (
            WatchProgress.objects.filter(user=request.user, completed=False, position_seconds__gt=0)
            .select_related("video", "video__category")
            .order_by("-updated_at")[:20]
        )
        return Response(WatchProgressSerializer(progress, many=True, context={"request": request}).data)


class WatchProgressView(APIView):
    """Save/resume playback position. Called periodically by the player (not every second)."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = WatchProgressUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        video = get_object_or_404(Video, id=data["video_id"])

        duration = data.get("duration_seconds") or video.duration_seconds
        completed = duration > 0 and data["position_seconds"] >= duration * 0.95

        progress, _ = WatchProgress.objects.update_or_create(
            user=request.user,
            video=video,
            defaults={
                "position_seconds": data["position_seconds"],
                "duration_seconds": duration,
                "completed": completed,
            },
        )

        WatchHistory.objects.create(user=request.user, video=video, position_seconds=data["position_seconds"])

        return Response(WatchProgressSerializer(progress, context={"request": request}).data)

    def get(self, request, video_id):
        progress = WatchProgress.objects.filter(user=request.user, video_id=video_id).first()
        if not progress:
            return Response(None)
        return Response(WatchProgressSerializer(progress, context={"request": request}).data)


class RecordVideoViewView(APIView):
    """Lightweight view/trending signal — one row per session, not per second."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = VideoViewCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        video = get_object_or_404(Video, id=data["video_id"])

        VideoView.objects.create(
            user=request.user if request.user.is_authenticated else None,
            video=video,
            session_key=request.session.session_key or "",
            watch_seconds=data["watch_seconds"],
            completed=data["completed"],
        )
        return Response(status=status.HTTP_201_CREATED)
