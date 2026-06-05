from django.contrib import admin
from api.models import WeatherRecord, WeatherCacheLog

@admin.register(WeatherRecord)
class WeatherRecordAdmin(admin.ModelAdmin):
    list_display = ['location', 'temperature', 'rain_probability', 'risk_score', 'created_at']
    list_filter = ['risk_score', 'created_at']
    search_fields = ['location']
    readonly_fields = ['created_at']
    ordering = ['-created_at']


@admin.register(WeatherCacheLog)
class WeatherCacheLogAdmin(admin.ModelAdmin):
    list_display = ['cache_key', 'hit', 'created_at']
    list_filter = ['hit']
    readonly_fields = ['created_at']