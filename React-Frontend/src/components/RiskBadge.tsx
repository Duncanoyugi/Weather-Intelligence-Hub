import type { Risk } from '../types/weather';

interface RiskBadgeProps {
  level: Risk['level'];
  score?: number;
}

export default function RiskBadge({ level }: RiskBadgeProps) {
  const getStyles = () => {
    switch (level) {
      case 'HIGH':
        return 'bg-rose/20 border-rose/50 text-rose';
      case 'MEDIUM':
        return 'bg-amber-risk/20 border-amber-risk/50 text-amber-risk';
      default:
        return 'bg-emerald-500/20 border-emerald-500/50 text-emerald-500';
    }
  };

  const getIcon = () => {
    switch (level) {
      case 'HIGH':
        return '🔴';
      case 'MEDIUM':
        return '🟡';
      default:
        return '🟢';
    }
  };

  return (
    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getStyles()} backdrop-blur-sm`}>
      <span aria-label={`${level} risk level`}>{getIcon()}</span> {level}
    </span>
  );
}