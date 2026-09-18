import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'accent' | 'warning' | 'danger' | 'success';
  description?: string;
  className?: string;
  titleClassName?: string;
  valueClassName?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  trend = 'neutral',
  trendLabel,
  icon: Icon,
  variant = 'default',
  description,
  className,
  titleClassName,
  valueClassName,
}) => {
  const iconVariants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    accent: 'bg-blue-50 text-blue-700 border-blue-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  const isRedCategory =
    variant === 'danger' ||
    /violation|grievance|complaint/i.test(title);

  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-subtle hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'text-xs font-bold uppercase tracking-wider',
            isRedCategory ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400',
            titleClassName
          )}
        >
          {title}
        </span>
        {Icon && (
          <div className={cn('p-2 rounded-lg border', iconVariants[variant])}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span
          className={cn(
            'text-2xl font-bold tracking-tight',
            isRedCategory ? 'text-red-600 dark:text-red-400 font-mono' : 'text-slate-900 dark:text-white',
            valueClassName
          )}
        >
          {value}
        </span>
      </div>

      {(change || description) && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs">
          {change && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 font-medium px-1.5 py-0.5 rounded',
                trend === 'up' && 'text-emerald-700 bg-emerald-50',
                trend === 'down' && 'text-red-700 bg-red-50',
                trend === 'neutral' && 'text-slate-600 bg-slate-100'
              )}
            >
              {trend === 'up' && <TrendingUp className="h-3 w-3" />}
              {trend === 'down' && <TrendingDown className="h-3 w-3" />}
              {change}
            </span>
          )}
          <span className="text-slate-500 truncate">{trendLabel || description}</span>
        </div>
      )}
    </div>
  );
};
