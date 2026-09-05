import React from 'react';
import { Badge, BadgeProps } from './Badge';
import { cn } from '../../lib/utils';

export type StatusType =
  | 'Notice Issued'
  | 'Open'
  | 'Hearing Scheduled'
  | 'Resolved'
  | 'compliant'
  | 'non-compliant'
  | 'under-review'
  | 'notice-issued'
  | 'critical'
  | 'high'
  | 'medium'
  | 'low'
  | string;

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
  dot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className,
  dot = true,
}) => {
  const normalized = status ? status.toLowerCase().trim() : '';

  let variant: BadgeProps['variant'] = 'neutral';
  let label = status;

  if (normalized === 'notice issued' || normalized === 'notice-issued') {
    variant = 'primary';
    label = 'NOTICE ISSUED';
  } else if (normalized === 'open') {
    variant = 'danger';
    label = 'OPEN';
  } else if (normalized === 'hearing scheduled' || normalized === 'under-review') {
    variant = 'warning';
    label = normalized === 'under-review' ? 'UNDER REVIEW' : 'HEARING SCHEDULED';
  } else if (normalized === 'resolved' || normalized === 'compliant') {
    variant = 'success';
    label = normalized === 'compliant' ? 'COMPLIANT' : 'RESOLVED';
  } else if (normalized === 'non-compliant') {
    variant = 'danger';
    label = 'NON-COMPLIANT';
  } else if (normalized === 'critical') {
    variant = 'danger';
    label = 'CRITICAL';
  } else if (normalized === 'high') {
    variant = 'warning';
    label = 'HIGH';
  } else if (normalized === 'medium') {
    variant = 'warning';
    label = 'MEDIUM';
  } else if (normalized === 'low') {
    variant = 'neutral';
    label = 'LOW';
  }

  return (
    <Badge
      variant={variant}
      size="sm"
      dot={dot}
      className={cn(
        'font-mono text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 shrink-0 border shadow-xs',
        className
      )}
    >
      {label}
    </Badge>
  );
};
