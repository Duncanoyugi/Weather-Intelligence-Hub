import { useState, useMemo } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import LoadingSkeleton from './LoadingSkeleton';
import type { TrendsData } from '../types/weather';

interface TrendsProps {
  data: TrendsData | null;
  loading?: boolean;
  error?: string | null;
  onDaysChange: (days: 7 | 14 | 30) => void;
}

export default function Trends({ data, loading = false, error = null, onDaysChange }: TrendsProps) {
  const [selectedDays, setSelectedDays] = useState<7 | 14 | 30>(7);

  const handleDaysChange = (days: 7 | 14 | 30) => {
    setSelectedDays(days);
    onDaysChange(days);
  };

  const chartData = useMemo(() => {
    if (!data?.daily_data) return [];
    return data.daily_data.map(d => ({
      date: safeFormatDate(d.date),
      temperature: d.temperature,
      rain: d.rain_probability,
      risk: d.risk_score
    }));
  }, [data]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'HIGH': return 'text-rose';
      case 'MEDIUM': return 'text-amber-risk';
      default: return 'text-emerald-500';
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-6">
        <LoadingSkeleton className="h-7 w-48 mb-5" />
        <div className="flex gap-3 mb-5">
          <LoadingSkeleton className="h-10 w-20 rounded-full" />
          <LoadingSkeleton className="h-10 w-20 rounded-full" />
          <LoadingSkeleton className="h-10 w-20 rounded-full" />
        </div>
        <LoadingSkeleton className="h-64 w-full mb-5 rounded-xl" />
        <LoadingSkeleton className="h-64 w-full mb-5 rounded-xl" />
        <LoadingSkeleton className="h-64 w-full rounded-xl" />
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
      <h3 className="text-xl font-bold text-white font-sora mb-5">📈 Historical Trends</h3>

      <div className="flex items-center gap-2 mb-5">
        {[7, 14, 30].map((days) => (
          <button
            key={days}
            onClick={() => handleDaysChange(days as 7 | 14 | 30)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedDays === days
                ? 'bg-cyan text-navy'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
            aria-label={`Select ${days} days`}
          >
            {days} Days
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
        <div className="glass-card bg-white/5 p-3 text-center">
          <p className="text-xs text-gray-500">Avg Temp</p>
          <p className="text-lg font-bold text-cyan font-dm-mono">{data.averages.temperature?.toFixed(1) || '--'}°C</p>
        </div>
        <div className="glass-card bg-white/5 p-3 text-center">
          <p className="text-xs text-gray-500">Max Temp</p>
          <p className="text-lg font-bold text-rose font-dm-mono">{data.extremes.max_temperature?.toFixed(1) || '--'}°C</p>
        </div>
        <div className="glass-card bg-white/5 p-3 text-center">
          <p className="text-xs text-gray-500">Min Temp</p>
          <p className="text-lg font-bold text-emerald-500 font-dm-mono">{data.extremes.min_temperature?.toFixed(1) || '--'}°C</p>
        </div>
        <div className="glass-card bg-white/5 p-3 text-center">
          <p className="text-xs text-gray-500">Avg Rain</p>
          <p className="text-lg font-bold text-cyan font-dm-mono">{data.averages.rain_probability?.toFixed(1) || '--'}%</p>
        </div>
        <div className="glass-card bg-white/5 p-3 text-center">
          <p className="text-xs text-gray-500">Records</p>
          <p className="text-lg font-bold text-white font-dm-mono">{data.records_found}</p>
        </div>
      </div>

      <div className="glass-card bg-white/5 p-4 mb-5">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Temperature Trend</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(13,21,40,0.9)', border: '1px solid rgba(255,255,255,0.2)' }}
                labelStyle={{ color: '#fff' }}
              />
              <Area 
                type="monotone" 
                dataKey="temperature" 
                stroke="#00d4ff" 
                fill="url(#tempGradient)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card bg-white/5 p-4 mb-5">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Rain Probability</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(13,21,40,0.9)', border: '1px solid rgba(255,255,255,0.2)' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="rain" fill="#00d4ff" fillOpacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-navy/80 backdrop-blur-sm">
            <tr className="border-b border-white/10">
              <th className="text-left p-3 text-gray-400 font-sora">Date</th>
              <th className="text-left p-3 text-gray-400 font-sora">Temp (°C)</th>
              <th className="text-left p-3 text-gray-400 font-sora">Humidity</th>
              <th className="text-left p-3 text-gray-400 font-sora">Rain %</th>
              <th className="text-left p-3 text-gray-400 font-sora">Risk</th>
            </tr>
          </thead>
          <tbody>
            {data.daily_data && data.daily_data.length > 0 ? (
              [...data.daily_data].reverse().map((record, idx) => (
                <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-3 text-white">{safeFormatDate(record.date)}</td>
                  <td className="p-3 text-cyan font-dm-mono">{record.temperature.toFixed(1)}</td>
                  <td className="p-3 text-gray-300">{record.humidity.toFixed(1)}%</td>
                  <td className="p-3 text-gray-300">{record.rain_probability.toFixed(1)}%</td>
                  <td className={`p-3 font-semibold ${getRiskColor(record.risk_score)}`}>
                    {record.risk_score}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-5 text-center text-gray-500">No historical data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function safeFormatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return dateStr;
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