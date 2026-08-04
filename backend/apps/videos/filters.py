import django_filters

from .models import Video


class VideoFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(field_name="category__slug")
    tag = django_filters.CharFilter(field_name="tags__slug")
    date_from = django_filters.DateFilter(field_name="release_date", lookup_expr="gte")
    date_to = django_filters.DateFilter(field_name="release_date", lookup_expr="lte")

    class Meta:
        model = Video
        fields = ["category", "tag", "content_rating", "language"]
