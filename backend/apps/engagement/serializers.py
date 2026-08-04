from rest_framework import serializers

from apps.videos.serializers import VideoCardSerializer

from .models import Favorite, SearchHistory, VideoView, WatchHistory, WatchProgress


class WatchProgressSerializer(serializers.ModelSerializer):
    video = VideoCardSerializer(read_only=True)

    class Meta:
        model = WatchProgress
        fields = ("id", "video", "position_seconds", "duration_seconds", "completed", "percent_complete", "updated_at")


class WatchProgressUpdateSerializer(serializers.Serializer):
    video_id = serializers.IntegerField()
    position_seconds = serializers.IntegerField(min_value=0)
    duration_seconds = serializers.IntegerField(min_value=0, required=False, default=0)


class WatchHistorySerializer(serializers.ModelSerializer):
    video = VideoCardSerializer(read_only=True)

    class Meta:
        model = WatchHistory
        fields = ("id", "video", "watched_at", "position_seconds")


class FavoriteSerializer(serializers.ModelSerializer):
    video = VideoCardSerializer(read_only=True)
    video_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Favorite
        fields = ("id", "video", "video_id", "created_at")


class VideoViewCreateSerializer(serializers.Serializer):
    video_id = serializers.IntegerField()
    watch_seconds = serializers.IntegerField(min_value=0, default=0)
    completed = serializers.BooleanField(default=False)
