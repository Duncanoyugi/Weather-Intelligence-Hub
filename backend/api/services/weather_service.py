import requests
import logging
from typing import Dict, Any, Optional, Tuple
from django.conf import settings

logger = logging.getLogger(__name__)


class WeatherAIClient:
    """Client for WeatherAI API."""

    def __init__(self):
        self.base_url = settings.WEATHERAI_BASE_URL
        self.api_key = settings.WEATHERAI_API_KEY
        self._validate_config()
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    def _validate_config(self):
        if not self.api_key:
            logger.warning("WEATHERAI_API_KEY not configured - API calls will fail")
        if not self.base_url:
            logger.warning("WEATHERAI_BASE_URL not configured - using default")

    def _request(self, path: str, params: Dict[str, Any], timeout: int) -> Tuple[Optional[Dict[str, Any]], str]:
        """Shared request helper."""
        try:
            response = requests.get(
                f"{self.base_url}{path}",
                params=params,
                headers=self.headers,
                timeout=timeout,
            )

            if response.status_code == 429:
                logger.warning("WeatherAI rate limit exceeded")
                return None, "rate_limited"

            if response.status_code == 401:
                logger.error("WeatherAI invalid API key")
                return None, "unauthorized"

            if response.status_code >= 500:
                logger.error(f"WeatherAI server error: {response.status_code}")
                return None, "server_error"

            response.raise_for_status()
            return response.json(), "api"

        except requests.exceptions.Timeout:
            logger.error("WeatherAI API timeout")
            return None, "timeout"
        except requests.exceptions.RequestException as e:
            logger.error(f"WeatherAI request error: {e}")
            return None, "request_exception"

    def get_weather_by_ip(self, days: int = 3) -> Tuple[Optional[Dict[str, Any]], str]:
        return self._request(
            "/v1/weather-geo",
            params={"days": days, "units": "metric"},
            timeout=20,
        )

    def get_weather_by_coordinates(
        self,
        *,
        lat: float,
        lon: float,
        days: int = 3,
    ) -> Tuple[Optional[Dict[str, Any]], str]:
        # WeatherAI supports coordinate lookup via /v1/weather-geo (with lat/lon).
        # If your provider uses a different endpoint, adjust path here.
        return self._request(
            "/v1/weather-geo",
            params={
                "lat": lat,
                "lon": lon,
                "days": days,
                "units": "metric",
            },
            timeout=20,
        )

    def get_usage_stats(self) -> Optional[Dict[str, Any]]:
        try:
            response = requests.get(
                f"{self.base_url}/v1/usage",
                headers=self.headers,
                timeout=5,
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Usage API error: {e}")
            return None

    def extract_weather_data(self, api_response: Dict[str, Any]) -> Dict[str, Any]:
        location_data = api_response.get("location", {})

        timezone = location_data.get("timezone", "")
        country = location_data.get("country", "")

        if "/" in timezone:
            city = timezone.split("/")[-1].replace("_", " ")
        else:
            city = location_data.get("city", location_data.get("name", "Unknown"))

        location_name = f"{city}, {country}" if country else city

        current = api_response.get("current", {})

        temperature = current.get("temperature", current.get("temp", 0))
        humidity = current.get("humidity", 65)

        hourly = api_response.get("hourly", [])
        rain_probability = 0
        if hourly:
            rain_probability = hourly[0].get("precipitation_probability", 0)

        wind_speed = current.get("wind_speed", current.get("wind_kph", 0))

        condition_code = current.get("condition_code", "")
        icon = current.get("icon", "")

        lat = location_data.get("lat", 0)
        lon = location_data.get("lon", 0)

        return {
            "location": location_name,
            "latitude": lat,
            "longitude": lon,
            "temperature": float(temperature),
            "humidity": int(humidity),
            "rain_probability": int(rain_probability),
            "wind_speed": float(wind_speed),
            "condition_code": condition_code,
            "icon": icon,
            "timezone": timezone,
            "country": country,
            "raw_forecast": api_response.get("daily", api_response.get("hourly", [])),
        }

