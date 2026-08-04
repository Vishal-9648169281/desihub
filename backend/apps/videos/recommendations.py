"""Trending + recommendation scoring.

Kept as a standalone module (not baked into views/serializers) so a future
ML-based recommender can replace `recommend_for_user` without touching the
API layer — see spec section 20.
"""

from datetime import timedelta

from django.db.models import Count, F, Q
from django.utils import timezone

from .models import Video


def trending_videos(limit=20, window_days=14):
    """Recency-weighted trending score: recent views + favorites + completion
    beat lifetime view count, so new popular uploads can compete with old ones."""
    since = timezone.now() - timedelta(days=window_days)
    qs = (
        Video.objects.filter(status=Video.Status.PUBLISHED, visibility=Video.Visibility.PUBLIC)
        .annotate(
            recent_views=Count("views", filter=Q(views__created_at__gte=since), distinct=True),
            recent_completions=Count(
                "views", filter=Q(views__created_at__gte=since, views__completed=True), distinct=True
            ),
            recent_favorites=Count("favorited_by", filter=Q(favorited_by__created_at__gte=since), distinct=True),
        )
        .annotate(
            trend_score=(
                F("recent_views") * 1.0
                + F("recent_completions") * 2.0
                + F("recent_favorites") * 3.0
            )
        )
        .order_by("-trend_score", "-view_count")
    )
    return qs[:limit]


def recommend_for_user(user, limit=20):
    from apps.engagement.models import Favorite, WatchHistory

    if not user or not user.is_authenticated:
        return trending_videos(limit=limit)

    watched_ids = list(
        WatchHistory.objects.filter(user=user).values_list("video_id", flat=True)[:50]
    )
    favorite_category_ids = list(
        Favorite.objects.filter(user=user, video__category__isnull=False)
        .values_list("video__category_id", flat=True)
        .distinct()
    )
    watched_category_ids = list(
        Video.objects.filter(id__in=watched_ids).values_list("category_id", flat=True).distinct()
    )
    category_ids = set(favorite_category_ids) | set(watched_category_ids)

    qs = Video.objects.filter(
        status=Video.Status.PUBLISHED, visibility=Video.Visibility.PUBLIC
    ).exclude(id__in=watched_ids)

    if category_ids:
        qs = qs.filter(category_id__in=category_ids)

    qs = qs.order_by("-view_count", "-created_at")[:limit]
    results = list(qs)

    if len(results) < limit:
        seen_ids = {v.id for v in results} | set(watched_ids)
        filler = trending_videos(limit=limit - len(results)).exclude(id__in=seen_ids)
        results.extend(filler)

    return results
