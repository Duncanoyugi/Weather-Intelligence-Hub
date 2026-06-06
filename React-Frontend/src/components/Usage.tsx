import { Database, HardDrive, Cpu } from 'lucide-react';
import LoadingSkeleton from './LoadingSkeleton';
import type { UsageData } from '../types/weather';

interface UsageProps {
  data: UsageData | null;
  loading?: boolean;
  error?: string | null;
}

export default function Usage({ data, loading = false, error = null }: UsageProps) {
  const getQuotaColor = (percent: number) => {
    if (percent > 50) return 'text-emerald-500';
    if (percent > 20) return 'text-amber-risk';
    return 'text-rose';
  };

  const getStrokeColor = (percent: number) => {
    if (percent > 50) return '#10b981';
    if (percent > 20) return '#f59e0b';
    return '#f43f5e';
  };

  if (loading) {
    return (
      <div className="glass-card p-6">
        <LoadingSkeleton className="h-7 w-48 mb-5" />
        <div className="flex flex-col items-center mb-6">
          <LoadingSkeleton className="h-32 w-32 rounded-full mb-4" />
          <LoadingSkeleton className="h-6 w-24 mb-2" />
          <LoadingSkeleton className="h-4 w-16" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <LoadingSkeleton className="h-16 rounded-xl" />
          <LoadingSkeleton className="h-16 rounded-xl" />
          <LoadingSkeleton className="h-16 rounded-xl" />
          <LoadingSkeleton className="h-16 rounded-xl" />
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

  const { quota_total, quota_used, quota_remaining, quota_remaining_percent } = data.usage;
  const strokePercent = quota_remaining_percent || 0;
  const strokeDasharray = 2 * Math.PI * 45;
  const strokeDashoffset = strokeDasharray * (1 - strokePercent / 100);

  return (
    <div className="glass-card p-6">
      <h3 className="text-xl font-bold text-white font-sora mb-5">📊 API Usage Statistics</h3>

      {/* Warning Banner */}
      {data.warning && (
        <div className="bg-amber-risk/20 border border-amber-risk/50 p-3 rounded-xl mb-5 text-sm text-amber-risk">
          ⚠️ API quota is running low. Consider upgrading your plan.
        </div>
      )}

      {/* Quota Progress Ring */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={getStrokeColor(strokePercent)}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000"
            />
            <text x="50" y="55" fontSize="16" fill="white" textAnchor="middle" className="font-dm-mono font-bold">
              {Math.round(strokePercent)}%
            </text>
            <text x="50" y="70" fontSize="10" fill="rgba(255,255,255,0.5)" textAnchor="middle">
              Remaining
            </text>
          </svg>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
        <div className="glass-card bg-white/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4 text-cyan" />
            <span className="text-xs text-gray-500">Total Quota</span>
          </div>
          <p className="text-lg font-bold text-white font-dm-mono">{quota_total.toLocaleString()}</p>
        </div>
        <div className="glass-card bg-white/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4 text-cyan" />
            <span className="text-xs text-gray-500">Used</span>
          </div>
          <p className="text-lg font-bold text-white font-dm-mono">{quota_used.toLocaleString()}</p>
        </div>
        <div className="glass-card bg-white/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4 text-cyan" />
            <span className="text-xs text-gray-500">Remaining</span>
          </div>
          <p className={`text-lg font-bold font-dm-mono ${getQuotaColor(strokePercent)}`}>
            {quota_remaining.toLocaleString()}
          </p>
        </div>
        <div className="glass-card bg-white/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4 text-cyan" />
            <span className="text-xs text-gray-500">Remaining %</span>
          </div>
          <p className={`text-lg font-bold font-dm-mono ${getQuotaColor(strokePercent)}`}>
            {strokePercent.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Health Check Status Card */}
      <div className="glass-card bg-white/5 p-4 mt-5">
        <h4 className="text-sm font-semibold text-gray-300 mb-3 font-sora">System Health</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan" />
            <span className="text-xs text-gray-400">Database:</span>
            <span className="text-xs text-emerald-500">● Connected</span>
          </div>
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-cyan" />
            <span className="text-xs text-gray-400">Cache:</span>
            <span className="text-xs text-emerald-500">● Connected</span>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-gray-500 mt-5">
        Resets monthly • Free plan: 1,000 requests
      </div>
    </div>
  );
}