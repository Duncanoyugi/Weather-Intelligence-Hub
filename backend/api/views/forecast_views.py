import logging
from datetime import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.cache import cache

from api.services.weather_service import WeatherAIClient
from api.intelligence.risk_service import RiskService
from api.intelligence.recommendation_service import RecommendationService

logger = logging.getLogger(__name__)


class ForecastView(APIView):
    """Get 3-day weather forecast with risk assessment for each day."""
    
    def get(self, request):
        cache_key = "weather:forecast:3day"
        
        # Try cache first
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response({
                **cached_data,
                'source': 'cache'
            })
        
        try:
            client = WeatherAIClient()
            weather_data, source = client.get_weather_by_ip(days=3)
            
            if not weather_data:
                return Response(
                    {'error': 'Unable to fetch forecast data'},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
            
            # Extract daily forecast
            daily_forecast = weather_data.get('daily', []) or []
            location_data = weather_data.get('location', {}) or {}
            timezone = location_data.get('timezone', '')
            
            # Get city from timezone
            if '/' in timezone:
                city = timezone.split('/')[-1].replace('_', ' ')
            else:
                city = 'Unknown'
            
            forecast_days = []
            risk_service = RiskService()
            rec_service = RecommendationService()
            
            for day in daily_forecast[:3]:  # Only first 3 days
                # Extract day data (be defensive about provider field names)
                day_data = {
                    'date': day.get('date', day.get('day', '')),
                    'temperature_high': day.get('temperature_max', day.get('temp_max', 0)),
                    'temperature_low': day.get('temperature_min', day.get('temp_min', 0)),
                    'rain_probability': day.get(
                        'rain_probability',
                        day.get('precipitation_probability', day.get('precip_prob', 0))
                    ),
                    'wind_speed': day.get('wind_speed_max', day.get('wind_speed', day.get('wind_kph', 0))),
                    'condition': day.get('condition', day.get('summary', '')),
                    'icon': day.get('icon', '')
                }
                
                risk = risk_service.calculate_risk(day_data)
                recommendations = rec_service.generate_recommendations(day_data, risk)
                
                forecast_days.append({
                    **day_data,
                    'risk': risk,
                    'recommendations': recommendations
                })
            
            response_data = {
                'location': city,
                'latitude': location_data.get('lat', 0),
                'longitude': location_data.get('lon', 0),
                'forecast': forecast_days,
                'fetched_at': datetime.now().isoformat()
            }
            
            # Cache for 30 minutes
            cache.set(cache_key, response_data, 1800)
            
            return Response({**response_data, 'source': source or 'api'})
            
        except Exception as e:
            logger.error(f"Forecast API error: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
