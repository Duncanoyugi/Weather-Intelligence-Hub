import { Cloud, Wind } from 'lucide-react';
import RiskBadge from './RiskBadge';
import LoadingSkeleton from './LoadingSkeleton';
import type { ForecastData } from '../types/weather';

interface ForecastProps {
  data: ForecastData | null;
  loading?: boolean;
  error?: string | null;
}

export default function Forecast({ data, loading = false, error = null }: ForecastProps) {
  if (loading) {
    return (
      <div className="glass-card p-6">
        <LoadingSkeleton className="h-7 w-48 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <LoadingSkeleton className="h-48 rounded-xl" />
          <LoadingSkeleton className="h-48 rounded-xl" />
          <LoadingSkeleton className="h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="text-rose">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="glass-card p-6">
      <h3 className="text-xl font-bold text-white font-sora mb-5">📅 3-Day Forecast</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.forecast.map((day, idx) => (
          <div 
            key={idx} 
            className="glass-card bg-white/5 p-5 text-center transition-transform duration-300 hover:-translate-y-1"
          >
            <h4 className="font-semibold text-white font-sora mb-2">{safeFormatDate(day.date)}</h4>
            
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="text-3xl font-bold text-cyan font-dm-mono">{Math.round(day.temperature_high)}°</span>
              <span className="text-sm text-gray-400">/ {Math.round(day.temperature_low)}°</span>
            </div>

            <div className="w-full bg-white/10 rounded-full h-2 mb-3 overflow-hidden">
              <div 
                className="h-full bg-cyan transition-all duration-500"
                style={{ width: `${day.rain_probability}%` }}
              />
            </div>

            <div className="flex items-center justify-center gap-4 text-sm text-gray-400 mb-3">
              <div className="flex items-center gap-1">
                <Cloud className="w-4 h-4" />
                <span>{day.rain_probability.toFixed(1)}%</span>
              </div>
              <div className="flex items-center gap-1">
                <Wind className="w-4 h-4" />
                <span>{day.wind_speed} km/h</span>
              </div>
            </div>

            <RiskBadge level={day.risk.level} />
          </div>
        ))}
      </div>

      <div className="text-center text-xs text-gray-500 mt-5 pt-4 border-t border-white/10">
        Updated: {safeFormatDate(data.fetched_at, true)}
      </div>
    </div>
  );
}

function safeFormatDate(dateStr: string, isDateTime: boolean = false): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return dateStr;
    }
    if (isDateTime) {
      return date.toLocaleString();
    }
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }).format(date);
  } catch {
    return dateStr;
  }
}