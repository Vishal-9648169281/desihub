from django.contrib.postgres.search import SearchQuery, SearchRank
from django.db.models import Q
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsContentStaff, IsContentStaffOrReadOnly
from apps.engagement.models import SearchHistory

from .filters import VideoFilter
from .models import Category, ProcessingJob, Tag, Video, VideoThumbnail
from .processing import queue_video_processing
from .recommendations import recommend_for_user, trending_videos
from .serializers import (
    AdminVideoSerializer,
    CategorySerializer,
    ProcessingJobSerializer,
    TagSerializer,
    VideoCardSerializer,
    VideoDetailSerializer,
    VideoThumbnailSerializer,
    VideoUploadSerializer,
)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsContentStaffOrReadOnly]
    lookup_field = "slug"


class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [IsContentStaffOrReadOnly]
    lookup_field = "slug"


class VideoViewSet(viewsets.ReadOnlyModelViewSet):
    """Public catalog — only published + public videos."""

    serializer_class = VideoCardSerializer
    permission_classes = [permissions.AllowAny]
    filterset_class = VideoFilter
    lookup_field = "slug"
    ordering_fields = ["created_at", "view_count", "release_date", "title"]
    search_fields = []  # custom search handled by SearchView

    def get_queryset(self):
        qs = Video.objects.filter(status=Video.Status.PUBLISHED, visibility=Video.Visibility.PUBLIC)
        return qs.select_related("category", "thumbnail")

    def get_serializer_class(self):
        if self.action == "retrieve":
            return VideoDetailSerializer
        return VideoCardSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        Video.objects.filter(pk=instance.pk).update(view_count=instance.view_count + 1)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def trending(self, request):
        videos = trending_videos(limit=24)
        serializer = VideoCardSerializer(videos, many=True, context={"request": request})
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def recommended(self, request):
        videos = recommend_for_user(request.user if request.user.is_authenticated else None, limit=24)
        serializer = VideoCardSerializer(videos, many=True, context={"request": request})
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def featured(self, request):
        video = self.get_queryset().filter(is_featured=True).order_by("-created_at").first()
        if not video:
            video = self.get_queryset().order_by("-view_count").first()
        if not video:
            return Response(None)
        serializer = VideoDetailSerializer(video, context={"request": request})
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def related(self, request, slug=None):
        video = self.get_object()
        qs = self.get_queryset().exclude(id=video.id)
        if video.category_id:
            qs = qs.filter(category_id=video.category_id)
        videos = qs[:12]
        serializer = VideoCardSerializer(videos, many=True, context={"request": request})
        return Response(serializer.data)


class SearchView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        query = request.query_params.get("q", "").strip()
        sort = request.query_params.get("sort", "relevance")
        category = request.query_params.get("category")

        base_qs = Video.objects.filter(
            status=Video.Status.PUBLISHED, visibility=Video.Visibility.PUBLIC
        ).select_related("category", "thumbnail")

        if category:
            base_qs = base_qs.filter(category__slug=category)

        if query:
            search_query = SearchQuery(query)
            base_qs = base_qs.filter(search_vector=search_query).annotate(
                rank=SearchRank("search_vector", search_query)
            )
            if sort == "relevance" or not sort:
                base_qs = base_qs.order_by("-rank")

        if sort == "newest":
            base_qs = base_qs.order_by("-release_date", "-created_at")
        elif sort == "oldest":
            base_qs = base_qs.order_by("release_date", "created_at")
        elif sort == "popularity" or sort == "views":
            base_qs = base_qs.order_by("-view_count")

        results = list(base_qs[:60])

        SearchHistory.objects.create(
            user=request.user if request.user.is_authenticated else None,
            query=query,
            result_count=len(results),
        )

        serializer = VideoCardSerializer(results, many=True, context={"request": request})
        return Response({"count": len(results), "results": serializer.data})

    def get_suggestions(self, request):
        pass


class SearchSuggestionsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        query = request.query_params.get("q", "").strip()
        if not query or len(query) < 2:
            recent = list(
                SearchHistory.objects.filter(user=request.user if request.user.is_authenticated else None)
                .values_list("query", flat=True)
                .distinct()[:8]
            )
            popular = list(
                SearchHistory.objects.values_list("query", flat=True).order_by("-id").distinct()[:8]
            )
            return Response({"recent": recent, "popular": popular, "titles": []})

        titles = list(
            Video.objects.filter(
                title__icontains=query, status=Video.Status.PUBLISHED, visibility=Video.Visibility.PUBLIC
            ).values_list("title", flat=True)[:8]
        )
        return Response({"recent": [], "popular": [], "titles": titles})


# ---------------- Admin endpoints ----------------


class AdminVideoViewSet(viewsets.ModelViewSet):
    """Admin/Content Manager: full CRUD over all videos regardless of status."""

    queryset = Video.objects.all().select_related("category", "thumbnail")
    permission_classes = [IsContentStaff]
    filterset_fields = ["status", "visibility", "category"]
    search_fields = ["title", "description"]
    ordering_fields = ["created_at", "view_count", "title"]

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return VideoUploadSerializer
        return AdminVideoSerializer

    def perform_create(self, serializer):
        video = serializer.save(created_by=self.request.user, status=Video.Status.UPLOADING)
        if video.original_file:
            queue_video_processing(video.id)

    def perform_update(self, serializer):
        video = serializer.save()
        if "original_file" in self.request.data and video.original_file:
            queue_video_processing(video.id)

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        from django.utils import timezone

        video = self.get_object()
        video.status = Video.Status.PUBLISHED
        video.visibility = Video.Visibility.PUBLIC
        if not video.published_at:
            video.published_at = timezone.now()
        video.save()
        return Response(AdminVideoSerializer(video, context={"request": request}).data)

    @action(detail=True, methods=["post"])
    def unpublish(self, request, pk=None):
        video = self.get_object()
        video.status = Video.Status.READY
        video.visibility = Video.Visibility.PRIVATE
        video.save()
        return Response(AdminVideoSerializer(video, context={"request": request}).data)

    @action(detail=True, methods=["post"])
    def select_thumbnail(self, request, pk=None):
        video = self.get_object()
        thumbnail_id = request.data.get("thumbnail_id")
        thumbnail = VideoThumbnail.objects.filter(id=thumbnail_id, video=video).first()
        if not thumbnail:
            return Response({"detail": "Thumbnail not found."}, status=status.HTTP_404_NOT_FOUND)
        VideoThumbnail.objects.filter(video=video).update(is_selected=False)
        thumbnail.is_selected = True
        thumbnail.save(update_fields=["is_selected"])
        video.thumbnail = thumbnail
        video.save(update_fields=["thumbnail"])
        return Response(VideoThumbnailSerializer(thumbnail, context={"request": request}).data)

    @action(detail=True, methods=["post"])
    def upload_thumbnail(self, request, pk=None):
        video = self.get_object()
        image = request.FILES.get("image")
        if not image:
            return Response({"detail": "image file required"}, status=status.HTTP_400_BAD_REQUEST)
        VideoThumbnail.objects.filter(video=video).update(is_selected=False)
        thumb = VideoThumbnail.objects.create(video=video, image=image, is_custom=True, is_selected=True)
        video.thumbnail = thumb
        video.save(update_fields=["thumbnail"])
        return Response(VideoThumbnailSerializer(thumb, context={"request": request}).data)

    @action(detail=True, methods=["get"])
    def processing_status(self, request, pk=None):
        video = self.get_object()
        jobs = video.processing_jobs.all()[:5]
        return Response(
            {
                "status": video.status,
                "jobs": ProcessingJobSerializer(jobs, many=True).data,
                "thumbnails": VideoThumbnailSerializer(
                    video.thumbnails.all(), many=True, context={"request": request}
                ).data,
            }
        )


class AdminDashboardStatsView(APIView):
    permission_classes = [IsContentStaff]

    def get(self, request):
        from django.db.models import Sum

        from apps.accounts.models import User
        from apps.engagement.models import VideoView

        total_videos = Video.objects.count()
        published = Video.objects.filter(status=Video.Status.PUBLISHED).count()
        drafts = Video.objects.exclude(status=Video.Status.PUBLISHED).count()
        total_users = User.objects.filter(role=User.Role.USER).count()
        total_views = Video.objects.aggregate(total=Sum("view_count"))["total"] or 0
        total_watch_seconds = VideoView.objects.aggregate(total=Sum("watch_seconds"))["total"] or 0

        most_watched = Video.objects.order_by("-view_count")[:5]
        recent_uploads = Video.objects.order_by("-created_at")[:5]
        recent_users = User.objects.order_by("-date_joined")[:5]

        return Response(
            {
                "total_videos": total_videos,
                "published_videos": published,
                "draft_videos": drafts,
                "total_users": total_users,
                "total_views": total_views,
                "total_watch_time_hours": round(total_watch_seconds / 3600, 1),
                "most_watched": AdminVideoSerializer(most_watched, many=True, context={"request": request}).data,
                "recent_uploads": AdminVideoSerializer(
                    recent_uploads, many=True, context={"request": request}
                ).data,
                "recent_users": [
                    {"id": u.id, "username": u.username, "email": u.email, "date_joined": u.date_joined}
                    for u in recent_users
                ],
            }
        )


class AdminSearchAnalyticsView(APIView):
    permission_classes = [IsContentStaff]

    def get(self, request):
        from django.db.models import Count

        top_queries = (
            SearchHistory.objects.values("query")
            .annotate(count=Count("id"))
            .order_by("-count")[:20]
        )
        zero_result = (
            SearchHistory.objects.filter(result_count=0)
            .values("query")
            .annotate(count=Count("id"))
            .order_by("-count")[:20]
        )
        return Response({"top_queries": list(top_queries), "zero_result_queries": list(zero_result)})
