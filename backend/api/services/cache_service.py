import logging
import json
from django.core.cache import cache
from typing import Optional, Any

logger = logging.getLogger(__name__)


class CacheService:
    """
    Redis cache service for weather data.
    Implements TTL and fallback strategies.
    """
    
    DEFAULT_TTL = 1800  # 30 minutes in seconds
    _redis_available = None  # Cache availability check
    
    @classmethod
    def _check_redis_available(cls) -> bool:
        """Check if Redis is available, cache the result."""
        if cls._redis_available is None:
            try:
                test_key = f"_health_check_{id(object())}"
                cache.set(test_key, "test", 1)
                cache.get(test_key)
                cls._redis_available = True
            except Exception as e:
                logger.warning(f"Redis unavailable, using fallback: {e}")
                cls._redis_available = False
        return cls._redis_available
    
    @classmethod
    def get_weather_cache_key(cls, latitude: float, longitude: float) -> str:
        """Generate cache key for weather data."""
        return f"weather:{latitude}:{longitude}"
    
    @classmethod
    def get(cls, key: str) -> Optional[Any]:
        """Get value from cache."""
        try:
            value = cache.get(key)
            if value:
                logger.debug(f"Cache HIT: {key}")
                return value
            logger.debug(f"Cache MISS: {key}")
            return None
        except Exception as e:
            logger.warning(f"Cache GET error (fallback active): {e}")
            cls._redis_available = False
            return None
    
    @classmethod
    def set(cls, key: str, value: Any, ttl: int = DEFAULT_TTL) -> bool:
        """Set value in cache with TTL."""
        try:
            cache.set(key, value, ttl)
            logger.debug(f"Cache SET: {key} (TTL: {ttl}s)")
            return True
        except Exception as e:
            logger.warning(f"Cache SET error (fallback active): {e}")
            cls._redis_available = False
            return False
    
    @classmethod
    def get_or_fetch(cls, key: str, fetch_func, ttl: int = DEFAULT_TTL) -> tuple[Any, str]:
        """
        Get from cache or fetch using provided function.
        
        Returns:
            Tuple of (data, source) where source is 'cache' or 'fetch'
        """
        # Try cache first
        cached = cls.get(key)
        if cached:
            return cached, 'cache'
        
        # Fetch new data
        data = fetch_func()
        if data:
            cls.set(key, data, ttl)
            return data, 'fetch'
        
        return None, 'error'