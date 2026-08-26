import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'neutral',
  size = 'md',
  dot = false,
  children,
  ...props
}) => {
  const variantStyles = {
    primary: 'bg-blue-50 text-blue-700 border-blue-200/80',
    secondary: 'bg-slate-100 text-slate-700 border-slate-300/80',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-700 border-amber-200/80',
    danger: 'bg-red-50 text-red-700 border-red-200/80',
    neutral: 'bg-slate-50 text-slate-600 border-slate-200',
    outline: 'bg-transparent text-slate-700 border-slate-300',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-1.5 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
    lg: 'text-sm px-3 py-1.5 font-semibold',
  };

  const dotColors = {
    primary: 'bg-blue-600',
    secondary: 'bg-slate-600',
    success: 'bg-emerald-600',
    warning: 'bg-amber-600',
    danger: 'bg-red-600',
    neutral: 'bg-slate-400',
    outline: 'bg-slate-600',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border tracking-tight transition-colors',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full shrink-0 animate-pulse', dotColors[variant])} />}
      {children}
    </span>
  );
};
