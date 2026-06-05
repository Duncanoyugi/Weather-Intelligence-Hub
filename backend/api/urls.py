from django.urls import path
from api.views.weather_views import CurrentWeatherView, ForecastHistoryView, WeatherTrendView
from api.views.forecast_views import ForecastView
from api.views.usage_views import SystemUsageView
from api.views.health_views import HealthCheckView

urlpatterns = [
    # Health
    path('health', HealthCheckView.as_view(), name='health-check'),
    
    # Weather
    path('weather/current', CurrentWeatherView.as_view(), name='current-weather'),
    path('weather/forecast', ForecastView.as_view(), name='forecast'),
    path('weather/history', ForecastHistoryView.as_view(), name='weather-history'),
    path('weather/trends', WeatherTrendView.as_view(), name='weather-trends'),
    
    # System
    path('system/usage', SystemUsageView.as_view(), name='system-usage'),
]