from rest_framework import serializers

class UsageStatsSerializer(serializers.Serializer):
    """Serializer for WeatherAI usage statistics."""
    
    quota_total = serializers.IntegerField(help_text="Total monthly quota")
    quota_used = serializers.IntegerField(help_text="Used requests this month")
    quota_remaining = serializers.IntegerField(help_text="Remaining requests")
    ai_quota_total = serializers.IntegerField(help_text="Total AI requests quota")
    ai_quota_used = serializers.IntegerField(help_text="Used AI requests")
    ai_quota_remaining = serializers.IntegerField(help_text="Remaining AI requests")
    reset_date = serializers.DateTimeField(help_text="When quota resets")