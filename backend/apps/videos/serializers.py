from rest_framework import serializers

from .models import Category, ProcessingJob, Tag, Video, VideoAsset, VideoThumbnail


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "slug", "description", "order")


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ("id", "name", "slug")


class VideoThumbnailSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoThumbnail
        fields = ("id", "image", "position_percent", "is_selected", "is_custom")


class VideoAssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoAsset
        fields = ("id", "quality", "file", "bitrate_kbps")


class VideoCardSerializer(serializers.ModelSerializer):
    """Lightweight shape used in carousels/lists — no heavy fields."""

    category = serializers.SlugRelatedField(slug_field="slug", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = Video
        fields = (
            "id", "uuid", "title", "slug", "category", "category_name", "duration_seconds",
            "content_rating", "thumbnail_url", "view_count", "is_featured",
        )

    def get_thumbnail_url(self, obj):
        request = self.context.get("request")
        if obj.thumbnail and obj.thumbnail.image:
            url = obj.thumbnail.image.url
            return request.build_absolute_uri(url) if request else url
        if obj.poster:
            url = obj.poster.url
            return request.build_absolute_uri(url) if request else url
        return None


class VideoDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    thumbnails = VideoThumbnailSerializer(many=True, read_only=True)
    assets = VideoAssetSerializer(many=True, read_only=True)
    thumbnail_url = serializers.SerializerMethodField()
    video_url = serializers.SerializerMethodField()
    created_by_username = serializers.CharField(source="created_by.username", read_only=True)

    class Meta:
        model = Video
        fields = (
            "id", "uuid", "title", "slug", "description", "category", "tags",
            "language", "release_date", "duration_seconds", "content_rating",
            "status", "visibility", "thumbnail_url", "video_url", "thumbnails",
            "assets", "view_count", "is_featured", "created_by_username",
            "created_at", "published_at",
        )

    def get_thumbnail_url(self, obj):
        request = self.context.get("request")
        if obj.thumbnail and obj.thumbnail.image:
            return request.build_absolute_uri(obj.thumbnail.image.url) if request else obj.thumbnail.image.url
        return None

    def get_video_url(self, obj):
        request = self.context.get("request")
        if obj.original_file:
            return request.build_absolute_uri(obj.original_file.url) if request else obj.original_file.url
        return None


class VideoUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = (
            "id", "title", "description", "category", "language", "release_date",
            "content_rating", "visibility", "original_file", "poster", "is_featured",
        )

    def validate_original_file(self, value):
        from django.conf import settings

        max_bytes = settings.MAX_VIDEO_UPLOAD_SIZE_MB * 1024 * 1024
        if value.size > max_bytes:
            raise serializers.ValidationError(
                f"Video file exceeds max upload size of {settings.MAX_VIDEO_UPLOAD_SIZE_MB}MB."
            )
        content_type = getattr(value, "content_type", None)
        if content_type and content_type not in settings.ALLOWED_VIDEO_MIME_TYPES:
            raise serializers.ValidationError("Unsupported video file type.")
        return value


class AdminVideoSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = Video
        fields = (
            "id", "uuid", "title", "slug", "category", "category_name", "status",
            "visibility", "view_count", "duration_seconds", "thumbnail_url",
            "created_at", "published_at", "is_featured",
        )

    def get_thumbnail_url(self, obj):
        request = self.context.get("request")
        if obj.thumbnail and obj.thumbnail.image:
            return request.build_absolute_uri(obj.thumbnail.image.url) if request else obj.thumbnail.image.url
        return None


class ProcessingJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProcessingJob
        fields = ("id", "job_type", "status", "message", "started_at", "finished_at", "created_at")
