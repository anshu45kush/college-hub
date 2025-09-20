import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'indigo';
  onClick?: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color = 'blue',
  onClick
}) => {
  const colorClasses = {
    blue: 'border-blue-200 bg-blue-50 text-blue-600',
    green: 'border-green-200 bg-green-50 text-green-600',
    yellow: 'border-yellow-200 bg-yellow-50 text-yellow-600',
    red: 'border-red-200 bg-red-50 text-red-600',
    indigo: 'border-indigo-200 bg-indigo-50 text-indigo-600'
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <div 
      className={`
        bg-white rounded-lg border-2 p-6 shadow-sm hover:shadow-md transition-all duration-200 
        ${onClick ? 'cursor-pointer hover:scale-105' : ''}
      `}
      onClick={onClick}
      role={onClick ? 'button' : 'presentation'}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          {description && (
            <p className={`text-sm ${trend ? trendColors[trend] : 'text-gray-500'}`}>
              {description}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;