import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)


class RecommendationService:
    """
    Generates actionable recommendations based on weather risk.
    """
    
    def generate_recommendations(self, weather_data: Dict[str, Any], risk: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate recommendations based on weather and risk assessment.
        
        Returns:
            {
                'recommendations': list of strings,
                'priority': 'URGENT' | 'IMPORTANT' | 'INFORMATIONAL'
            }
        """
        rain_prob = weather_data.get('rain_probability', 0)
        wind_speed = weather_data.get('wind_speed', 0)
        temperature = weather_data.get('temperature', 25)
        risk_level = risk.get('level', 'LOW')
        
        recommendations = []
        priority = "INFORMATIONAL"
        
        # Rain-based recommendations
        if rain_prob >= 80:
            recommendations.extend([
                "🌧️ Heavy rain expected — carry rain gear",
                "🚗 Avoid unnecessary travel during peak rain hours",
                "🏠 Secure outdoor items that could be damaged by rain",
                "📱 Enable weather alerts for your area"
            ])
            priority = "URGENT"
        elif rain_prob >= 60:
            recommendations.extend([
                "☔ Moderate rain expected — bring an umbrella",
                "🚶 Allow extra travel time for wet roads",
                "👕 Consider indoor activities for today"
            ])
            priority = "IMPORTANT"
        elif rain_prob >= 40:
            recommendations.append("🌦️ Light rain possible — keep an umbrella handy")
        else:
            recommendations.append("☀️ No rain expected — good day for outdoor activities")
        
        # Wind-based recommendations
        if wind_speed > 40:
            recommendations.append("💨 Strong winds — secure loose objects and avoid tall trees")
            priority = "URGENT"
        elif wind_speed > 25:
            recommendations.append("🍃 Moderate winds — be cautious when driving")
        
        # Temperature-based recommendations
        if temperature > 35:
            recommendations.extend([
                "🥤 Stay hydrated — drink plenty of water",
                "🧴 Apply sunscreen if going outdoors",
                "🏠 Avoid peak sun hours (11 AM - 3 PM)"
            ])
            priority = "URGENT"
        elif temperature < 15:
            recommendations.extend([
                "🧥 Cool weather — wear warm clothing",
                "☕ Keep warm with hot beverages"
            ])
        
        # Agriculture-specific recommendations
        if risk_level == "HIGH" and rain_prob > 60:
            recommendations.append("🌾 Agriculture: Delay harvesting if possible")
        elif risk_level == "LOW" and rain_prob < 20:
            recommendations.append("🌾 Agriculture: Ideal conditions for field work")
        
        # Remove duplicates while preserving order
        seen = set()
        unique_recommendations = []
        for rec in recommendations:
            if rec not in seen:
                seen.add(rec)
                unique_recommendations.append(rec)
        
        # Limit to top 5 recommendations
        unique_recommendations = unique_recommendations[:5]
        
        return {
            'recommendations': unique_recommendations,
            'priority': priority,
            'count': len(unique_recommendations)
        }
    
    def format_for_display(self, recommendations: List[str]) -> str:
        """Format recommendations as a readable string."""
        if not recommendations:
            return "No specific recommendations at this time."
        
        formatted = "\n".join([f"• {rec}" for rec in recommendations])
        return formatted