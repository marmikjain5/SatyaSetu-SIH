import React from 'react';
import { cn } from '../../lib/utils';

export interface SciFiCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  outerClassName?: string;
  showDot?: boolean;
  showRay?: boolean;
  showLines?: boolean;
}

export const SciFiCard: React.FC<SciFiCardProps> = ({
  children,
  className,
  outerClassName,
  showDot = true,
  showRay = true,
  showLines = true,
  ...props
}) => {
  return (
    <div className={cn('scifi-card-outer group/scifi', outerClassName)} {...props}>
      {/* Animated Traveling Glow Dot */}
      {showDot && <div className="scifi-dot" aria-hidden="true" />}

      {/* Main Inner Surface */}
      <div className={cn('scifi-card-inner flex flex-col justify-between', className)}>
        {/* Soft Angled Light Ray */}
        {showRay && <div className="scifi-ray" aria-hidden="true" />}

        {/* Precision HUD Grid Alignment Lines */}
        {showLines && (
          <>
            <div className="scifi-line topl" aria-hidden="true" />
            <div className="scifi-line leftl" aria-hidden="true" />
            <div className="scifi-line bottoml" aria-hidden="true" />
            <div className="scifi-line rightl" aria-hidden="true" />
          </>
        )}

        {/* Card Content */}
        <div className="relative z-10 flex flex-col justify-between h-full w-full">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SciFiCard;
