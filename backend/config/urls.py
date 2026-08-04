from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("apps.accounts.urls")),
    path("api/", include("apps.videos.urls")),
    path("api/", include("apps.engagement.urls")),
]

# Served by Django directly at this scale (no separate nginx/CDN in front on every
# deploy target, e.g. Render web services). Move to S3/CDN before real production traffic.
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
