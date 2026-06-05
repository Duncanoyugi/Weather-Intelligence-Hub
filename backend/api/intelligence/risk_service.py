import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)


class RiskService:
    """
    Risk assessment engine.
    Converts raw weather data into actionable risk scores.
    """
    
    def calculate_risk(self, weather_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate risk level based on weather conditions.
        
        Returns:
            {
                'level': 'LOW' | 'MEDIUM' | 'HIGH',
                'score': int (0-100),
                'factors': list of contributing factors
            }
        """
        rain_prob = weather_data.get('rain_probability', 0)
        wind_speed = weather_data.get('wind_speed', 0)
        temperature = weather_data.get('temperature', 25)
        
        factors = []
        risk_score = 0
        
        # Rain risk (highest weight: 0-50 points)
        if rain_prob >= 80:
            risk_score += 45
            factors.append("Heavy rainfall expected (>80%)")
        elif rain_prob >= 60:
            risk_score += 30
            factors.append("Moderate rainfall expected (60-80%)")
        elif rain_prob >= 40:
            risk_score += 15
            factors.append("Light rainfall possible (40-60%)")
        else:
            factors.append("Low rainfall probability")
        
        # Wind risk (0-30 points)
        if wind_speed > 40:
            risk_score += 25
            factors.append(f"Strong winds: {wind_speed} km/h")
        elif wind_speed > 25:
            risk_score += 15
            factors.append(f"Moderate winds: {wind_speed} km/h")
        elif wind_speed > 0:
            factors.append(f"Light winds: {wind_speed} km/h")
        
        # Temperature extremes (0-20 points)
        if temperature > 35:
            risk_score += 20
            factors.append(f"Extreme heat: {temperature}°C")
        elif temperature < 15:
            risk_score += 15
            factors.append(f"Cool conditions: {temperature}°C")
        elif temperature > 30:
            risk_score += 10
            factors.append(f"Hot conditions: {temperature}°C")
        
        # Determine level
        if risk_score >= 60:
            level = "HIGH"
        elif risk_score >= 30:
            level = "MEDIUM"
        else:
            level = "LOW"
        
        return {
            'level': level,
            'score': risk_score,
            'factors': factors
        }
    
    def get_risk_icon(self, level: str) -> str:
        """Return appropriate icon for risk level."""
        icons = {
            'HIGH': '⚠️🔴',
            'MEDIUM': '⚠️🟡',
            'LOW': '✅🟢'
        }
        return icons.get(level, '❓')
    
    def get_risk_color(self, level: str) -> str:
        """Return CSS color for risk level."""
        colors = {
            'HIGH': '#dc2626',  # red-600
            'MEDIUM': '#f59e0b',  # amber-500
            'LOW': '#10b981'  # emerald-500
        }
        return colors.get(level, '#6b7280')