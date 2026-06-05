from django.db import models

class WeatherRecord(models.Model):
    """Stores historical weather data for analytics and trends."""
    
    location = models.CharField(max_length=100, help_text="City or location name")
    latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    
    temperature = models.FloatField(help_text="Temperature in Celsius")
    humidity = models.IntegerField(help_text="Relative humidity percentage")
    rain_probability = models.IntegerField(help_text="Rain probability percentage")
    wind_speed = models.FloatField(null=True, blank=True, help_text="Wind speed in km/h")
    
    risk_score = models.CharField(max_length=20, choices=[
        ('LOW', 'Low Risk'),
        ('MEDIUM', 'Medium Risk'),
        ('HIGH', 'High Risk'),
    ], default='LOW')
    
    ai_summary = models.TextField(null=True, blank=True, help_text="AI-generated weather summary")
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['location', '-created_at']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.location} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"


class WeatherCacheLog(models.Model):
    """Tracks cache hits/misses for monitoring."""
    
    cache_key = models.CharField(max_length=255)
    hit = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{'HIT' if self.hit else 'MISS'} - {self.cache_key}"