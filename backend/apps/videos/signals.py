from django.contrib.postgres.search import SearchVector
from django.db.models import Value
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Video, VideoTagMapping


def _refresh_search_vector(video_id):
    video = Video.objects.select_related("category").filter(pk=video_id).first()
    if not video:
        return
    category_name = video.category.name if video.category_id else ""
    Video.objects.filter(pk=video_id).update(
        search_vector=(
            SearchVector(Value(video.title), weight="A")
            + SearchVector(Value(video.description or ""), weight="B")
            + SearchVector(Value(category_name), weight="C")
        )
    )


@receiver(post_save, sender=Video)
def update_video_search_vector(sender, instance, **kwargs):
    _refresh_search_vector(instance.pk)


@receiver(post_save, sender=VideoTagMapping)
def update_search_vector_on_tag(sender, instance, **kwargs):
    _refresh_search_vector(instance.video_id)
