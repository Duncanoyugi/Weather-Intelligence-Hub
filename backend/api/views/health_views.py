import logging
from datetime import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from django.core.cache import cache
from django.db import connections
from django.db.utils import OperationalError

logger = logging.getLogger(__name__)


class HealthCheckView(APIView):
    """
    Health check endpoint for monitoring and deployment verification.
    """
    
    def get(self, request):
        health_status = {
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'services': {}
        }
        
        # Check database
        try:
            connections['default'].cursor()
            health_status['services']['database'] = 'connected'
        except OperationalError:
            health_status['services']['database'] = 'disconnected'
            health_status['status'] = 'degraded'
        
        # Check Redis cache
        try:
            cache.set('health_check', 'ok', timeout=5)
            if cache.get('health_check') == 'ok':
                health_status['services']['redis'] = 'connected'
            else:
                health_status['services']['redis'] = 'error'
                health_status['status'] = 'degraded'
        except Exception as e:
            health_status['services']['redis'] = f'error: {str(e)}'
            health_status['status'] = 'degraded'
        
        # Return appropriate status code
        status_code = 200 if health_status['status'] == 'healthy' else 503
        
        return Response(health_status, status=status_code)