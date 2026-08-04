import uuid

from django.conf import settings
from django.contrib.postgres.indexes import GinIndex
from django.contrib.postgres.search import SearchVectorField
from django.db import models
from django.utils.text import slugify


class Category(models.Model):
    name = models.CharField(max_length=80, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    description = models.CharField(max_length=255, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name_plural = "categories"
        ordering = ["order", "name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Tag(models.Model):
    name = models.CharField(max_length=60, unique=True)
    slug = models.SlugField(max_length=80, unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Video(models.Model):
    class Status(models.TextChoices):
        UPLOADING = "UPLOADING", "Uploading"
        PROCESSING = "PROCESSING", "Processing"
        READY = "READY", "Ready"
        PUBLISHED = "PUBLISHED", "Published"
        FAILED = "FAILED", "Failed"

    class Visibility(models.TextChoices):
        PUBLIC = "PUBLIC", "Public"
        UNLISTED = "UNLISTED", "Unlisted"
        PRIVATE = "PRIVATE", "Private"

    class Rating(models.TextChoices):
        ALL = "ALL", "All Ages"
        R13 = "13+", "13+"
        R16 = "16+", "16+"
        R18 = "18+", "18+"

    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    description = models.TextField(blank=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name="videos")
    tags = models.ManyToManyField(Tag, through="VideoTagMapping", related_name="videos", blank=True)

    language = models.CharField(max_length=40, default="Hindi")
    release_date = models.DateField(null=True, blank=True)
    duration_seconds = models.PositiveIntegerField(default=0)
    content_rating = models.CharField(max_length=10, choices=Rating.choices, default=Rating.ALL)

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.UPLOADING)
    visibility = models.CharField(max_length=20, choices=Visibility.choices, default=Visibility.PRIVATE)

    original_file = models.FileField(upload_to="videos/originals/%Y/%m/", blank=True, null=True)
    hls_manifest = models.CharField(max_length=500, blank=True)

    thumbnail = models.ForeignKey(
        "VideoThumbnail", on_delete=models.SET_NULL, null=True, blank=True, related_name="+"
    )
    poster = models.ImageField(upload_to="videos/posters/%Y/%m/", blank=True, null=True)
    is_featured = models.BooleanField(default=False)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="videos_created"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)

    view_count = models.PositiveIntegerField(default=0)

    search_vector = SearchVectorField(null=True, editable=False)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "visibility"]),
            models.Index(fields=["-created_at"]),
            models.Index(fields=["-view_count"]),
            models.Index(fields=["category"]),
            models.Index(fields=["slug"]),
            GinIndex(fields=["search_vector"]),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title)[:200]
            slug = base
            i = 1
            while Video.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                i += 1
                slug = f"{base}-{i}"
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class VideoTagMapping(models.Model):
    video = models.ForeignKey(Video, on_delete=models.CASCADE)
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE)

    class Meta:
        unique_together = ("video", "tag")


class VideoAsset(models.Model):
    """A processed rendition of a video (e.g. HLS quality variant)."""

    class Quality(models.TextChoices):
        Q360 = "360p", "360p"
        Q480 = "480p", "480p"
        Q720 = "720p", "720p"
        Q1080 = "1080p", "1080p"

    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name="assets")
    quality = models.CharField(max_length=10, choices=Quality.choices)
    file = models.FileField(upload_to="videos/renditions/%Y/%m/")
    bitrate_kbps = models.PositiveIntegerField(default=0)
    file_size_bytes = models.BigIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("video", "quality")


class VideoThumbnail(models.Model):
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name="thumbnails")
    image = models.ImageField(upload_to="videos/thumbnails/%Y/%m/")
    position_percent = models.PositiveSmallIntegerField(default=0)
    is_selected = models.BooleanField(default=False)
    is_custom = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Thumbnail({self.video_id} @ {self.position_percent}%)"


class ProcessingJob(models.Model):
    class JobStatus(models.TextChoices):
        PENDING = "PENDING", "Pending"
        RUNNING = "RUNNING", "Running"
        DONE = "DONE", "Done"
        ERROR = "ERROR", "Error"

    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name="processing_jobs")
    job_type = models.CharField(max_length=40, default="thumbnail_and_metadata")
    status = models.CharField(max_length=20, choices=JobStatus.choices, default=JobStatus.PENDING)
    message = models.TextField(blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
