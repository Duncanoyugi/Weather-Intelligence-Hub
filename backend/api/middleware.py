import logging
import json
import time
from django.utils.deprecation import MiddlewareMixin
from django.urls import resolve

logger = logging.getLogger('api')


class RequestLoggingMiddleware(MiddlewareMixin):
    """Log all API requests for debugging and analytics."""
    
    def process_request(self, request):
        # Skip static files and admin
        if request.path.startswith('/static') or request.path.startswith('/admin'):
            return None
        
        request.start_time = time.time()
        return None
    
    def process_response(self, request, response):
        if hasattr(request, 'start_time'):
            duration = (time.time() - request.start_time) * 1000
            
            # Get the view name
            try:
                view_name = resolve(request.path).view_name
            except:
                view_name = 'unknown'
            
            # Log the request
            log_data = {
                'method': request.method,
                'path': request.path,
                'view': view_name,
                'status': response.status_code,
                'duration_ms': round(duration, 2),
                'ip': request.META.get('REMOTE_ADDR'),
                'user_agent': request.META.get('HTTP_USER_AGENT', '')[:100]
            }
            
            # Log based on status code
            if response.status_code >= 500:
                logger.error(json.dumps(log_data))
            elif response.status_code >= 400:
                logger.warning(json.dumps(log_data))
            else:
                logger.info(json.dumps(log_data))
        
        # Add cache headers to response
        if request.path.startswith('/api/weather'):
            response['Cache-Control'] = 'public, max-age=300'
            response['CDN-Cache-Control'] = 'public, max-age=600'
        
        return response