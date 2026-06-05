import requests
import logging
import os
from typing import Dict, Any, Optional, Tuple
from django.conf import settings

logger = logging.getLogger(__name__)


class WeatherAIClient:
    """
    Client for WeatherAI API.
    Handles authentication, requests, and error handling.
    """
    
    def __init__(self):
        self.base_url = settings.WEATHERAI_BASE_URL
        self.api_key = settings.WEATHERAI_API_KEY
        self._validate_config()
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    def _validate_config(self):
        """Validate API configuration on initialization."""
        if not self.api_key:
            logger.warning("WEATHERAI_API_KEY not configured - API calls will fail")
        if not self.base_url:
            logger.warning("WEATHERAI_BASE_URL not configured - using default")

    def _get_mock_data(self) -> Dict[str, Any]:
        """Return mock weather data when API is unavailable (for development/fallback)."""
        return {
            'location': {'timezone': 'Africa/Nairobi', 'country': 'KE', 'lat': -1.2921, 'lon': 36.8219},
            'current': {
                'temperature': 22.0,
                'humidity': 65,
                'wind_speed': 12.5,
                'condition_code': 'PARTLY_CLOUDY',
                'icon': '☁️'
            },
            'hourly': [{'precipitation_probability': 10}],
            'daily': [{'day': '2026-06-05', 'high': 24, 'low': 18}],
            'ai_summary': 'Partly cloudy with mild conditions. Low chance of rain today.'
        }
    
    def get_weather_by_ip(self, days: int = 3) -> Tuple[Optional[Dict[str, Any]], str]:
        """
        Get weather using IP geolocation.
        
        Returns:
            Tuple of (weather_data, source)
        """
        use_mock = os.getenv('USE_MOCK_WEATHER', 'false').lower() == 'true'
        
        if use_mock:
            return self._get_mock_data(), "mock"
        
        try:
            response = requests.get(
                f"{self.base_url}/v1/weather-geo",
                params={
                    "days": days,
                    "units": "metric"
                },
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 429:
                logger.warning("Rate limit exceeded - falling back to mock data")
                return self._get_mock_data(), "mock"
            
            if response.status_code == 401:
                logger.error("Invalid API key - falling back to mock data")
                return self._get_mock_data(), "mock"
            
            if response.status_code >= 500:
                logger.error(f"WeatherAI API server error: {response.status_code} - falling back to mock data")
                return self._get_mock_data(), "mock"
            
            response.raise_for_status()
            return response.json(), "api"
            
        except requests.exceptions.Timeout:
            logger.error("WeatherAI API timeout - falling back to mock data")
            return self._get_mock_data(), "mock"
        except requests.exceptions.RequestException as e:
            logger.error(f"WeatherAI API error: {e} - falling back to mock data")
            return self._get_mock_data(), "mock"
    
    def get_usage_stats(self) -> Optional[Dict[str, Any]]:
        """Get API usage statistics from WeatherAI."""
        try:
            response = requests.get(
                f"{self.base_url}/v1/usage",
                headers=self.headers,
                timeout=5
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Usage API error: {e}")
            return None
    
    def extract_weather_data(self, api_response: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract relevant fields from WeatherAI response.
        Handles the actual API response structure correctly.
        """
        # Get location data from API response
        location_data = api_response.get('location', {})
        
        # Extract city from timezone (e.g., "Africa/Nairobi" -> "Nairobi")
        timezone = location_data.get('timezone', '')
        country = location_data.get('country', '')
        
        if '/' in timezone:
            # Extract city from timezone string
            city = timezone.split('/')[-1].replace('_', ' ')
        else:
            # Fallback to other possible location fields
            city = location_data.get('city', location_data.get('name', 'Unknown'))
        
        # Format location string (e.g., "Nairobi, KE" or just "Nairobi")
        location_name = f"{city}, {country}" if country else city
        
        # Get current weather data
        current = api_response.get('current', {})
        
        # Extract temperature (using 'temperature' field from actual API response)
        temperature = current.get('temperature', current.get('temp', 0))
        
        # Extract humidity (may not be in Free plan response)
        humidity = current.get('humidity', 65)  # Default fallback
        
        # Extract rain probability from hourly data if available
        hourly = api_response.get('hourly', [])
        rain_probability = 0
        if hourly and len(hourly) > 0:
            rain_probability = hourly[0].get('precipitation_probability', 0)
        
        # Extract wind speed
        wind_speed = current.get('wind_speed', current.get('wind_kph', 0))
        
        # Extract condition code and icon
        condition_code = current.get('condition_code', '')
        icon = current.get('icon', '')
        
        # Get coordinates for reference
        lat = location_data.get('lat', 0)
        lon = location_data.get('lon', 0)
        
        return {
            'location': location_name,
            'latitude': lat,
            'longitude': lon,
            'temperature': float(temperature),
            'humidity': int(humidity),
            'rain_probability': int(rain_probability),
            'wind_speed': float(wind_speed),
            'condition_code': condition_code,
            'icon': icon,
            'timezone': timezone,
            'country': country,
            'raw_forecast': api_response.get('daily', api_response.get('hourly', []))
        }