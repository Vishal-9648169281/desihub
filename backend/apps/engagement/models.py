from django.conf import settings
from django.db import models

from apps.videos.models import Video


class WatchProgress(models.Model):
    """Live resume-position tracker — one row per (user, video)."""

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="watch_progress")
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name="watch_progress")
    position_seconds = models.PositiveIntegerField(default=0)
    duration_seconds = models.PositiveIntegerField(default=0)
    completed = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "video")
        indexes = [models.Index(fields=["user", "-updated_at"])]

    @property
    def percent_complete(self):
        if not self.duration_seconds:
            return 0
        return min(100, round((self.position_seconds / self.duration_seconds) * 100))


class WatchHistory(models.Model):
    """Append-only log of watch sessions, used for history page + analytics."""

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="watch_history")
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name="watch_history")
    watched_at = models.DateTimeField(auto_now_add=True)
    position_seconds = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["-watched_at"]
        indexes = [models.Index(fields=["user", "-watched_at"])]


class Favorite(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="favorites")
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name="favorited_by")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "video")
        ordering = ["-created_at"]


class VideoView(models.Model):
    """One row per playback session start — kept lightweight for trending calc."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="video_views"
    )
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name="views")
    session_key = models.CharField(max_length=64, blank=True)
    watch_seconds = models.PositiveIntegerField(default=0)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["video", "-created_at"]),
            models.Index(fields=["-created_at"]),
        ]


class SearchHistory(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name="search_history"
    )
    query = models.CharField(max_length=200)
    result_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["-created_at"]), models.Index(fields=["query"])]
