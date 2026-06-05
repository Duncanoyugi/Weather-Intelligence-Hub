from rest_framework import serializers
from api.models import WeatherRecord

class WeatherRecordSerializer(serializers.ModelSerializer):
    """Serializer for stored weather records."""
    
    class Meta:
        model = WeatherRecord
        fields = [
            'id', 'location', 'temperature', 'humidity', 
            'rain_probability', 'wind_speed', 'risk_score', 
            'ai_summary', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class RiskAssessmentSerializer(serializers.Serializer):
    """Serializer for risk assessment output."""
    
    level = serializers.CharField()
    score = serializers.IntegerField()
    factors = serializers.ListField(child=serializers.CharField())


class RecommendationSerializer(serializers.Serializer):
    """Serializer for recommendation output."""
    
    recommendations = serializers.ListField(child=serializers.CharField())
    priority = serializers.CharField()


class WeatherResponseSerializer(serializers.Serializer):
    """Main weather response serializer."""
    
    location = serializers.CharField()
    temperature = serializers.FloatField()
    humidity = serializers.IntegerField()
    rain_probability = serializers.IntegerField()
    wind_speed = serializers.FloatField(required=False)
    risk = RiskAssessmentSerializer()
    recommendations = RecommendationSerializer()
    ai_summary = serializers.CharField(required=False)
    source = serializers.CharField()
    fetched_at = serializers.DateTimeField()