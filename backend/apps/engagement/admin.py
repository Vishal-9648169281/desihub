from django.contrib import admin

from .models import Favorite, SearchHistory, VideoView, WatchHistory, WatchProgress

admin.site.register(WatchProgress)
admin.site.register(WatchHistory)
admin.site.register(Favorite)
admin.site.register(VideoView)
admin.site.register(SearchHistory)
