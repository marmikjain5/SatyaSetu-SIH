import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
} from 'lucide-react';
import { HygieneAlert } from '../../types/hygiene';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

interface HygieneAlertsFeedProps {
  alerts: HygieneAlert[];
  onAcknowledge: (alertId: string) => void;
}

const severityConfig = {
  critical: { label: 'Critical', variant: 'danger' as const, border: 'border-l-red-500' },
  high: { label: 'High', variant: 'warning' as const, border: 'border-l-amber-500' },
  medium: { label: 'Medium', variant: 'primary' as const, border: 'border-l-blue-500' },
  low: { label: 'Low', variant: 'neutral' as const, border: 'border-l-slate-400' },
};

export const HygieneAlertsFeed: React.FC<HygieneAlertsFeedProps> = ({ alerts, onAcknowledge }) => {
  const sorted = [...alerts].sort((a, b) => {
    // Unacknowledged first
    if (a.acknowledged !== b.acknowledged) return a.acknowledged ? 1 : -1;
    // Then by severity
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return order[a.severity] - order[b.severity];
  });

  const unackCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            Active Alerts
          </CardTitle>
          {unackCount > 0 && (
            <Badge variant="danger" size="sm" dot>{unackCount} unacknowledged</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {sorted.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500 flex flex-col items-center gap-2">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            <span>No active alerts. All parameters within acceptable ranges.</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sorted.map((alert) => {
              const cfg = severityConfig[alert.severity];
              return (
                <div
                  key={alert.id}
                  className={cn(
                    'px-6 py-4 border-l-4 transition-colors',
                    cfg.border,
                    alert.acknowledged && 'opacity-60 bg-slate-50/50'
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>
                        <span className="text-xs font-medium text-slate-600">{alert.metric}</span>
                        {alert.acknowledged && (
                          <Badge variant="success" size="sm">
                            <CheckCircle2 className="h-3 w-3 mr-0.5" />
                            Acknowledged
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-slate-900 mb-1">{alert.message}</p>
                      <p className="text-xs text-slate-600 leading-relaxed mb-2">{alert.explanation}</p>
                      <div className="flex items-center gap-4 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {alert.zoneName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {alert.timestamp}
                        </span>
                      </div>
                      <div className="mt-2 p-2 bg-slate-50 rounded-md border border-slate-200">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Recommended Action</span>
                        <p className="text-xs text-slate-700 mt-0.5">{alert.recommendedAction}</p>
                      </div>
                    </div>
                    {!alert.acknowledged && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="shrink-0 text-xs"
                        onClick={() => onAcknowledge(alert.id)}
                      >
                        Acknowledge
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
