from django.contrib import admin

from .models import Category, ProcessingJob, Tag, Video, VideoAsset, VideoThumbnail, VideoTagMapping


class VideoThumbnailInline(admin.TabularInline):
    model = VideoThumbnail
    extra = 0


class VideoTagInline(admin.TabularInline):
    model = VideoTagMapping
    extra = 0


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "status", "visibility", "view_count", "created_at")
    list_filter = ("status", "visibility", "category", "content_rating")
    search_fields = ("title", "description")
    prepopulated_fields = {"slug": ("title",)}
    inlines = [VideoThumbnailInline, VideoTagInline]


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "order")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")


@admin.register(ProcessingJob)
class ProcessingJobAdmin(admin.ModelAdmin):
    list_display = ("video", "job_type", "status", "created_at", "finished_at")
    list_filter = ("status", "job_type")


admin.site.register(VideoAsset)
