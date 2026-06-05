import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from api.services.usage_service import UsageService
from api.serializers.usage_serializers import UsageStatsSerializer

logger = logging.getLogger(__name__)


class SystemUsageView(APIView):
    """
    Get WeatherAI API usage statistics.
    """
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.usage_service = UsageService()
    
    def get(self, request):
        usage_summary = self.usage_service.get_usage_summary()
        
        if not usage_summary.get('available'):
            return Response(
                {'error': usage_summary.get('error', 'Unable to fetch usage stats')},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        
        return Response({
            'status': 'healthy',
            'usage': usage_summary,
            'warning': usage_summary.get('quota_remaining', 0) < 100
        }, status=status.HTTP_200_OK)