import logging
from typing import Dict, Any, Optional
from api.services.weather_service import WeatherAIClient

logger = logging.getLogger(__name__)


class UsageService:
    """
    Service for monitoring WeatherAI API usage.
    """
    
    def __init__(self):
        self.client = WeatherAIClient()
    
    def get_usage_summary(self) -> Dict[str, Any]:
        """
        Get formatted usage summary.
        """
        stats = self.client.get_usage_stats()
        
        if not stats:
            return {
                'available': False,
                'error': 'Unable to fetch usage statistics',
                'quota_remaining_percent': 0
            }
        
        # Extract metrics (adjust field names based on actual WeatherAI response)
        quota_total = stats.get('quota_total', stats.get('limit', 0))
        quota_used = stats.get('quota_used', stats.get('used', 0))
        quota_remaining = quota_total - quota_used if quota_total > 0 else 0
        
        ai_total = stats.get('ai_quota_total', stats.get('ai_limit', 0))
        ai_used = stats.get('ai_quota_used', stats.get('ai_used', 0))
        ai_remaining = ai_total - ai_used if ai_total > 0 else 0
        
        percent_remaining = (quota_remaining / quota_total * 100) if quota_total > 0 else 0
        
        return {
            'available': True,
            'quota_total': quota_total,
            'quota_used': quota_used,
            'quota_remaining': quota_remaining,
            'quota_remaining_percent': round(percent_remaining, 1),
            'ai_quota_total': ai_total,
            'ai_quota_used': ai_used,
            'ai_quota_remaining': ai_remaining,
            'reset_date': stats.get('reset_date', stats.get('billing_period_end')),
        }
    
    def is_quota_low(self, threshold: int = 100) -> bool:
        """Check if remaining quota is below threshold."""
        summary = self.get_usage_summary()
        if not summary.get('available'):
            return False
        return summary.get('quota_remaining', 0) < threshold