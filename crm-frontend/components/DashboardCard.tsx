import { ReactNode } from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: number;
  trendLabel?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'cyan';
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  trend,
  trendLabel = 'vs last month',
  color = 'blue'
}) => {
  const colorClasses: Record<string, { bg: string; icon: string; gradient: string }> = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'from-blue-500 to-blue-600',
      gradient: 'from-blue-500/10 to-transparent'
    },
    green: {
      bg: 'bg-green-50',
      icon: 'from-green-500 to-green-600',
      gradient: 'from-green-500/10 to-transparent'
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'from-purple-500 to-purple-600',
      gradient: 'from-purple-500/10 to-transparent'
    },
    orange: {
      bg: 'bg-orange-50',
      icon: 'from-orange-500 to-orange-600',
      gradient: 'from-orange-500/10 to-transparent'
    },
    red: {
      bg: 'bg-red-50',
      icon: 'from-red-500 to-red-600',
      gradient: 'from-red-500/10 to-transparent'
    },
    cyan: {
      bg: 'bg-cyan-50',
      icon: 'from-cyan-500 to-cyan-600',
      gradient: 'from-cyan-500/10 to-transparent'
    }
  };

  const colors = colorClasses[color];
  const isPositiveTrend = trend && trend > 0;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 relative overflow-hidden group">
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colors.icon} shadow-lg`}>
            <span className="text-white text-xl">{icon}</span>
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium ${
              isPositiveTrend 
                ? 'bg-green-100 text-green-600' 
                : 'bg-red-100 text-red-600'
            }`}>
              {isPositiveTrend ? <FaArrowUp className="text-xs" /> : <FaArrowDown className="text-xs" />}
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div>
          <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-800">{value}</p>
          {trend !== undefined && (
            <p className="text-xs text-slate-400 mt-2">{trendLabel}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
