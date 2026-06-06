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
  const safeForecast = data?.forecast ?? [];

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
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h3 className="text-xl font-bold text-white font-sora">📅 3-Day Forecast</h3>
          <p className="text-xs text-gray-400 mt-1">High/low temps, rain chance, wind & risk</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Updated</p>
          <p className="text-sm text-white/90 font-dm-mono">{safeFormatDate(data.fetched_at, true)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {safeForecast.map((day, idx) => (
          <div
            key={idx}
            className="glass-card bg-white/5 p-5 text-center transition-transform duration-300 hover:-translate-y-1"
            aria-label={`Forecast for ${day.date}`}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <h4 className="font-semibold text-white font-sora">{safeFormatDate(day.date)}</h4>
            </div>

            {/** Condition icon if available */}
            {typeof (day as any).icon === 'string' && (day as any).icon.length > 0 && (
              <div className="mb-3">
                <img
                  src={(day as any).icon}
                  alt="weather condition"
                  className="w-10 h-10 object-contain mx-auto"
                  loading="lazy"
                />
              </div>
            )}

            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="text-3xl font-bold text-cyan font-dm-mono">{Math.round(day.temperature_high)}°</span>
              <span className="text-sm text-gray-400">/ {Math.round(day.temperature_low)}°</span>
            </div>

            <div className="w-full bg-white/10 rounded-full h-2 mb-3 overflow-hidden" title={`Rain chance: ${day.rain_probability}%`}>
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