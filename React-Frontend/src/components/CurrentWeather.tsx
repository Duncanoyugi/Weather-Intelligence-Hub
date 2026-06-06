import { Wind, Droplet, CloudRain } from 'lucide-react';
import RiskBadge from './RiskBadge';
import LoadingSkeleton from './LoadingSkeleton';
import type { WeatherData } from '../types/weather';

interface CurrentWeatherProps {
  data: WeatherData;
  loading?: boolean;
}

export default function CurrentWeather({ data, loading = false }: CurrentWeatherProps) {
  const getRiskBarColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'bg-rose';
      case 'MEDIUM': return 'bg-amber-risk';
      default: return 'bg-emerald-500';
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-rose/20 text-rose border-rose/50';
      case 'IMPORTANT': return 'bg-amber-risk/20 text-amber-risk border-amber-risk/50';
      default: return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/50';
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-5">
          <LoadingSkeleton className="h-8 w-40" />
          <LoadingSkeleton className="h-6 w-20 rounded-full" />
        </div>
        <LoadingSkeleton className="h-16 w-32 mb-6" />
        <div className="grid grid-cols-3 gap-4 mb-6">
          <LoadingSkeleton className="h-16 rounded-xl" />
          <LoadingSkeleton className="h-16 rounded-xl" />
          <LoadingSkeleton className="h-16 rounded-xl" />
        </div>
        <LoadingSkeleton className="h-40 rounded-xl mb-5" />
        <LoadingSkeleton className="h-32 rounded-xl" />
      </div>
    );
  }

  const rainPercentage = data.rain_probability;

  return (
    <div className="glass-card p-6">
      <div className="flex justify-between items-center flex-wrap gap-2.5 mb-5">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-sora">{data.location}</h2>
        </div>
        <RiskBadge level={data.risk.level} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <div className="lg:col-span-2 glass-card bg-white/5 p-5 text-center">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-5xl sm:text-6xl font-bold text-cyan font-dm-mono">{data.temperature.toFixed(1)}</span>
            <span className="text-2xl text-gray-400">°C</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">Current Temperature</p>
        </div>

        <div className="glass-card bg-white/5 p-5 text-center flex flex-col items-center justify-center">
          <div className="relative w-20 h-20">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#00d4ff"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={2 * Math.PI * 40 * (1 - rainPercentage / 100)}
                className="transition-all duration-1000"
              />
              <text x="50" y="55" fontSize="18" fill="white" textAnchor="middle" className="font-dm-mono font-bold">
                {rainPercentage.toFixed(0)}%
              </text>
            </svg>
          </div>
          <p className="text-xs text-gray-500 mt-2">Rain Probability</p>
        </div>

        <div className="glass-card bg-white/5 p-5 text-center flex flex-col items-center justify-center">
          <Wind className="w-10 h-10 text-cyan mb-2 animate-pulse" aria-label="Wind" />
          <p className="text-2xl font-bold text-white font-dm-mono">{data.wind_speed.toFixed(1)}</p>
          <p className="text-xs text-gray-500">km/h</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="glass-card bg-white/5 p-4 flex items-center gap-3">
          <Droplet className="w-8 h-8 text-cyan" aria-label="Humidity" />
          <div>
            <p className="text-xs text-gray-500">Humidity</p>
            <p className="text-xl font-bold text-white font-dm-mono">{data.humidity.toFixed(1)}%</p>
          </div>
        </div>
        <div className="glass-card bg-white/5 p-4 flex items-center gap-3">
          <CloudRain className="w-8 h-8 text-cyan" aria-label="Rain probability" />
          <div>
            <p className="text-xs text-gray-500">Rain Probability</p>
            <p className="text-xl font-bold text-white font-dm-mono">{rainPercentage.toFixed(1)}%</p>
          </div>
        </div>
        <div className="glass-card bg-white/5 p-4 flex items-center gap-3">
          <Wind className="w-8 h-8 text-cyan" aria-label="Wind speed" />
          <div>
            <p className="text-xs text-gray-500">Wind Speed</p>
            <p className="text-xl font-bold text-white font-dm-mono">{data.wind_speed.toFixed(1)} km/h</p>
          </div>
        </div>
      </div>

      <div className="glass-card bg-white/5 p-5 mb-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="text-lg font-semibold text-white font-sora">⚠️ Risk Assessment</h3>
          <span className={`text-2xl font-bold px-4 py-2 rounded-full ${getRiskBarColor(data.risk.level)} text-white`}>
            {data.risk.score}
          </span>
        </div>
        
        <div className="w-full bg-white/10 rounded-full h-3 mb-4 overflow-hidden">
          <div 
            className={`h-full ${getRiskBarColor(data.risk.level)} transition-all duration-1000 rounded-full`}
            style={{ width: `${data.risk.score}%` }}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {data.risk.factors.map((factor, idx) => (
            <span key={idx} className="px-3 py-1.5 bg-white/10 rounded-full text-xs text-gray-300">
              {factor}
            </span>
          ))}
        </div>
      </div>

      <div className="glass-card bg-white/5 p-5 mb-5">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h3 className="text-lg font-semibold text-white font-sora">💡 Recommendations</h3>
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getPriorityStyles(data.recommendations.priority)}`}>
            {data.recommendations.priority} Priority
          </span>
        </div>
        <ul className="space-y-2">
          {data.recommendations.recommendations.map((rec, idx) => (
            <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
              <span className="text-cyan mt-0.5">•</span> {rec}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-between items-center text-xs">
        <span className={`px-3 py-1 rounded-full ${
          data.source === 'api' 
            ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/50' 
            : 'bg-amber-risk/20 text-amber-risk border border-amber-risk/50'
          }`}>
          {data.source === 'api' ? 'Live API' : 'Cached'}
        </span>
        <span className="text-gray-500">
          Updated: {new Date(data.fetched_at).toLocaleString()}
        </span>
      </div>
    </div>
  );
}