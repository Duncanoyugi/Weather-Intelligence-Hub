from functools import wraps
from django.core.cache import cache
from django.http import JsonResponse
import time

def rate_limit(key_prefix, limit=30, window=60):
    """
    Simple rate limiting decorator.
    limit: number of requests allowed
    window: time window in seconds
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapped(view_instance, request, *args, **kwargs):
            # Create unique key for the client
            client_ip = request.META.get('REMOTE_ADDR', 'unknown')
            rate_key = f"rate_limit:{key_prefix}:{client_ip}"
            
            # Get current request count
            request_count = cache.get(rate_key, 0)
            
            if request_count >= limit:
                return JsonResponse(
                    {'error': f'Rate limit exceeded. Try again in {window} seconds.'},
                    status=429
                )
            
            # Increment counter
            cache.set(rate_key, request_count + 1, window)
            
            return view_func(view_instance, request, *args, **kwargs)
        return wrapped
    return decorator