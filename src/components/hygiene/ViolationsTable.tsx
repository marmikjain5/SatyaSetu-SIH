import React from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  ArrowUpRight,
  MapPin,
  Calendar,
  Camera,
  Eye,
  Activity,
  FileText,
} from 'lucide-react';
import { HygieneViolation } from '../../types/hygiene';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

interface ViolationsTableProps {
  violations: HygieneViolation[];
  onResolve: (violationId: string) => void;
  onEscalate: (violationId: string) => void;
}

const severityConfig = {
  critical: { label: 'Critical', variant: 'danger' as const },
  high: { label: 'High', variant: 'warning' as const },
  medium: { label: 'Medium', variant: 'primary' as const },
  low: { label: 'Low', variant: 'neutral' as const },
};

const statusConfig = {
  open: { label: 'Open', variant: 'danger' as const },
  remediated: { label: 'Remediated', variant: 'success' as const },
  escalated: { label: 'Escalated', variant: 'warning' as const },
};

const evidenceIcons: Record<string, React.ElementType> = {
  photograph: Camera,
  'visual-observation': Eye,
  'monitoring-reading': Activity,
  document: FileText,
};

export const ViolationsTable: React.FC<ViolationsTableProps> = ({ violations, onResolve, onEscalate }) => {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const sorted = [...violations].sort((a, b) => {
    const statusOrder = { open: 0, escalated: 1, remediated: 2 };
    if (statusOrder[a.status] !== statusOrder[b.status]) return statusOrder[a.status] - statusOrder[b.status];
    const sevOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return sevOrder[a.severity] - sevOrder[b.severity];
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>
            <ShieldAlert className="h-4 w-4 text-red-600" />
            Hygiene Violations
          </CardTitle>
          <Badge variant="danger" size="sm">
            {violations.filter((v) => v.status === 'open').length} open
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {sorted.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500 flex flex-col items-center gap-2">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            <span>No violations recorded. All parameters are within compliance.</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sorted.map((v) => {
              const sevCfg = severityConfig[v.severity];
              const stCfg = statusConfig[v.status];
              const isExpanded = expandedId === v.id;
              const EvidenceIcon = v.evidence ? (evidenceIcons[v.evidence.type] || FileText) : FileText;

              return (
                <div key={v.id} className={cn('transition-colors', v.status === 'remediated' && 'opacity-60')}>
                  {/* Row */}
                  <div
                    className="flex items-center gap-4 px-6 py-3.5 cursor-pointer hover:bg-slate-50/80"
                    onClick={() => setExpandedId(isExpanded ? null : v.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-slate-900 truncate">{v.title}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {v.zoneName}
                        </span>
                        <span>{v.parameter}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {v.detectedAt}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={sevCfg.variant} size="sm">{sevCfg.label}</Badge>
                      <Badge variant={stCfg.variant} size="sm" dot>{stCfg.label}</Badge>
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className="px-6 pb-4 space-y-3">
                      <p className="text-xs text-slate-700 leading-relaxed">{v.description}</p>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-2.5 bg-red-50/60 rounded-lg border border-red-200">
                          <span className="text-[10px] font-semibold text-red-600 uppercase tracking-wider">Actual Value</span>
                          <p className="text-sm font-bold text-red-800 mt-0.5">{v.actualValue}</p>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Threshold</span>
                          <p className="text-sm font-bold text-slate-800 mt-0.5">{v.threshold}</p>
                        </div>
                      </div>

                      <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-200">
                        <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">Recommendation</span>
                        <p className="text-xs text-blue-900 mt-0.5">{v.recommendation}</p>
                      </div>

                      {v.evidence && (
                        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="flex items-center gap-1.5 mb-1">
                            <EvidenceIcon className="h-3.5 w-3.5 text-slate-500" />
                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Evidence</span>
                          </div>
                          <p className="text-xs font-medium text-slate-800">{v.evidence.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{v.evidence.description}</p>
                          <p className="text-[10px] text-slate-400 mt-1">Captured: {v.evidence.capturedAt}</p>
                        </div>
                      )}

                      {v.status === 'open' && (
                        <div className="flex items-center gap-2 pt-1">
                          <Button variant="success" size="sm" className="text-xs gap-1" onClick={() => onResolve(v.id)}>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Mark Remediated
                          </Button>
                          <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => onEscalate(v.id)}>
                            <ArrowUpRight className="h-3.5 w-3.5" />
                            Escalate
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
