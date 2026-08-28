import React from 'react';
import {
  Thermometer,
  Droplets,
  Bug,
  SprayCan,
  HardHat,
  Wrench,
  Trash2,
} from 'lucide-react';
import { HygieneZone, HygieneParameter } from '../../types/hygiene';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';

interface ZoneMonitoringGridProps {
  zones: HygieneZone[];
  onSelectZone?: (zone: HygieneZone) => void;
}

const statusConfig = {
  compliant: { label: 'Compliant', variant: 'success' as const },
  warning: { label: 'Warning', variant: 'warning' as const },
  critical: { label: 'Critical', variant: 'danger' as const },
  'under-review': { label: 'Under Review', variant: 'primary' as const },
};

const parameterIcons: Record<string, React.ElementType> = {
  'Temperature': Thermometer,
  'Humidity': Droplets,
  'Pest Activity': Bug,
  'Surface Cleanliness': SprayCan,
  'Worker Hygiene': HardHat,
  'Equipment Sanitation': Wrench,
  'Waste Management': Trash2,
};

function getStatusIndicator(status: HygieneParameter['status']): { bg: string; dot: string; text: string } {
  switch (status) {
    case 'normal':
      return { bg: 'bg-emerald-50', dot: 'bg-emerald-500', text: 'text-emerald-700' };
    case 'warning':
      return { bg: 'bg-amber-50', dot: 'bg-amber-500', text: 'text-amber-700' };
    case 'critical':
      return { bg: 'bg-red-50', dot: 'bg-red-500', text: 'text-red-700' };
  }
}

function formatThreshold(param: HygieneParameter): string {
  if (param.minThreshold !== undefined && param.maxThreshold !== undefined) {
    return `${param.minThreshold}–${param.maxThreshold} ${param.unit}`;
  }
  if (param.maxThreshold !== undefined) {
    return `≤${param.maxThreshold} ${param.unit}`;
  }
  if (param.minThreshold !== undefined) {
    return `≥${param.minThreshold} ${param.unit}`;
  }
  return '—';
}

export const ZoneMonitoringGrid: React.FC<ZoneMonitoringGridProps> = ({ zones, onSelectZone }) => {
  return (
    <div className="space-y-4">
      {zones.map((zone) => {
        const cfg = statusConfig[zone.status];
        return (
          <Card
            key={zone.id}
            hoverable
            className={cn('cursor-pointer', onSelectZone && 'hover:border-blue-300')}
            onClick={() => onSelectZone?.(zone)}
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm">{zone.name}</CardTitle>
                <Badge variant={cfg.variant} size="sm" dot>{cfg.label}</Badge>
                {zone.activeIssues > 0 && (
                  <Badge variant="danger" size="sm">{zone.activeIssues} issue{zone.activeIssues > 1 ? 's' : ''}</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  'text-lg font-bold',
                  zone.score >= 80 ? 'text-emerald-700' : zone.score >= 60 ? 'text-amber-700' : 'text-red-700'
                )}>
                  {zone.score}
                </span>
                <span className="text-xs text-slate-400">/100</span>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {zone.parameters.map((param) => {
                  const Icon = parameterIcons[param.name] || Thermometer;
                  const indicator = getStatusIndicator(param.status);
                  return (
                    <div
                      key={param.id}
                      className={cn(
                        'rounded-lg border px-3 py-2.5 transition-colors',
                        param.status === 'critical' ? 'border-red-200 bg-red-50/50' :
                        param.status === 'warning' ? 'border-amber-200 bg-amber-50/30' :
                        'border-slate-200 bg-slate-50/50'
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <Icon className={cn('h-3.5 w-3.5', indicator.text)} />
                        <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider truncate">
                          {param.name}
                        </span>
                        <span className={cn('ml-auto h-1.5 w-1.5 rounded-full shrink-0', indicator.dot)} />
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span className={cn('text-lg font-bold tabular-nums', indicator.text)}>
                          {param.value}
                        </span>
                        <span className="text-[10px] text-slate-400">{param.unit}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-slate-400">
                          Target: {formatThreshold(param)}
                        </span>
                        <Badge
                          variant={param.status === 'normal' ? 'success' : param.status === 'warning' ? 'warning' : 'danger'}
                          size="sm"
                          className="text-[9px] px-1 py-0"
                        >
                          {param.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-[9px] text-slate-400 mt-1">
                        {param.category === 'sensor-telemetry' ? '📡 Sensor telemetry' : '👁 Inspection assessment'} · {param.updatedAt}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
