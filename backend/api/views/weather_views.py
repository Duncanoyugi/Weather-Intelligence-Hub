import logging
from datetime import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.cache import cache_control
from django.utils.decorators import method_decorator

from api.services.weather_service import WeatherAIClient
from api.services.cache_service import CacheService
from api.intelligence.risk_service import RiskService
from api.intelligence.recommendation_service import RecommendationService
from api.models import WeatherRecord
from api.serializers.weather_serializers import (
    WeatherResponseSerializer,
    RiskAssessmentSerializer,
    RecommendationSerializer,
    WeatherRecordSerializer
)
from api.decorators import rate_limit

logger = logging.getLogger(__name__)


class CurrentWeatherView(APIView):
    """
    Get current weather with intelligence (risk + recommendations).
    Uses Redis cache for 30 minutes.
    """
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.weather_client = WeatherAIClient()
        self.risk_service = RiskService()
        self.recommendation_service = RecommendationService()
    
    @method_decorator(cache_control(max_age=300, public=True))
    @rate_limit(key_prefix='weather', limit=30, window=60)
    def get(self, request):
        # Default coordinates for Nairobi (fallback if weather-geo fails)
        lat = request.query_params.get('lat', -1.2921)
        lon = request.query_params.get('lon', 36.8219)
        
        cache_key = CacheService.get_weather_cache_key(float(lat), float(lon))
        
        # Try cache first
        cached_data, source = CacheService.get_or_fetch(
            cache_key, 
            lambda: self._fetch_weather_data(lat, lon)
        )
        
        if not cached_data:
            return Response(
                {'error': 'Unable to fetch weather data. Please try again.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        
        # Build response
        response_data = self._build_response(cached_data, source)
        
        # Store in database for history
        self._store_historical_record(response_data)
        
        return Response(response_data, status=status.HTTP_200_OK)
    
    def _fetch_weather_data(self, lat: float, lon: float):
        """Fetch raw weather data from WeatherAI."""
        weather_data, source = self.weather_client.get_weather_by_ip(days=3)
        
        if not weather_data:
            return None
        
        extracted = self.weather_client.extract_weather_data(weather_data)
        extracted['source'] = source
        extracted['latitude'] = lat
        extracted['longitude'] = lon
        
        return extracted
    
    def _build_response(self, weather_data: dict, source: str) -> dict:
        """Build the complete response with intelligence."""
        # Calculate risk
        risk = self.risk_service.calculate_risk(weather_data)
        
        # Generate recommendations
        recommendations = self.recommendation_service.generate_recommendations(weather_data, risk)
        
        return {
            'location': weather_data.get('location', 'Unknown'),
            'temperature': weather_data.get('temperature', 0),
            'humidity': weather_data.get('humidity', 0),
            'rain_probability': weather_data.get('rain_probability', 0),
            'wind_speed': weather_data.get('wind_speed', 0),
            'ai_summary': weather_data.get('ai_summary', 'No AI summary available'),
            'risk': risk,
            'recommendations': recommendations,
            'source': source,
            'fetched_at': datetime.now().isoformat()
        }
    
    def _store_historical_record(self, response_data: dict):
        """Store weather snapshot in database."""
        try:
            WeatherRecord.objects.create(
                location=response_data.get('location', 'Unknown'),
                temperature=response_data.get('temperature', 0),
                humidity=response_data.get('humidity', 0),
                rain_probability=response_data.get('rain_probability', 0),
                wind_speed=response_data.get('wind_speed', 0),
                risk_score=response_data.get('risk', {}).get('level', 'LOW'),
                ai_summary=response_data.get('ai_summary', '')[:500]
            )
            logger.debug("Stored weather record in database")
        except Exception as e:
            logger.error(f"Failed to store weather record: {e}")


class ForecastHistoryView(APIView):
    """Get historical weather records."""
    
    @rate_limit(key_prefix='history', limit=30, window=60)
    def get(self, request):
        location = request.query_params.get('location')
        limit = int(request.query_params.get('limit', 10))
        
        queryset = WeatherRecord.objects.all()
        
        if location:
            queryset = queryset.filter(location__icontains=location)
        
        queryset = queryset[:limit]
        
        serializer = WeatherRecordSerializer(queryset, many=True)
        
        return Response({
            'count': len(serializer.data),
            'records': serializer.data
        }, status=status.HTTP_200_OK)


class WeatherTrendView(APIView):
    """Get historical weather trends for the last N days."""
    
    from django.db.models import Avg, Max, Min, Count
    from datetime import timedelta
    from django.utils import timezone
    
    @rate_limit(key_prefix='trends', limit=20, window=60)
    def get(self, request):
        from django.db.models import Avg, Max, Min, Count
        from datetime import timedelta
        from django.utils import timezone
        
        days = int(request.query_params.get('days', 7))
        
        # Limit to max 30 days
        if days > 30:
            days = 30
        
        cutoff_date = timezone.now() - timedelta(days=days)
        
        # Get historical records
        records = WeatherRecord.objects.filter(
            created_at__gte=cutoff_date
        ).order_by('created_at')
        
        if not records.exists():
            return Response({
                'days_requested': days,
                'message': 'No historical data available yet. Weather records are saved when you fetch weather.',
                'records_found': 0,
                'trends': None
            })
        
        # Calculate trends
        avg_temp = records.aggregate(Avg('temperature'))['temperature__avg']
        max_temp = records.aggregate(Max('temperature'))['temperature__max']
        min_temp = records.aggregate(Min('temperature'))['temperature__min']
        avg_humidity = records.aggregate(Avg('humidity'))['humidity__avg']
        avg_rain = records.aggregate(Avg('rain_probability'))['rain_probability__avg']
        
        # Group by risk level
        risk_counts = records.values('risk_score').annotate(count=Count('id'))
        
        # Prepare daily data for chart
        daily_data = []
        for record in records:
            daily_data.append({
                'date': record.created_at.strftime('%Y-%m-%d %H:%M'),
                'temperature': record.temperature,
                'humidity': record.humidity,
                'rain_probability': record.rain_probability,
                'risk_score': record.risk_score
            })
        
        response_data = {
            'days_requested': days,
            'records_found': records.count(),
            'date_range': {
                'from': cutoff_date.isoformat(),
                'to': timezone.now().isoformat()
            },
            'averages': {
                'temperature': round(avg_temp, 1) if avg_temp else None,
                'humidity': round(avg_humidity, 1) if avg_humidity else None,
                'rain_probability': round(avg_rain, 1) if avg_rain else None
            },
            'extremes': {
                'max_temperature': max_temp,
                'min_temperature': min_temp
            },
            'risk_distribution': list(risk_counts),
            'daily_data': daily_data[-10:]  # Last 10 records for chart
        }
        
        return Response(response_data)