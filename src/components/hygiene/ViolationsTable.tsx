import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  Scale,
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
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const sorted = [...violations].sort((a, b) => {
    const statusOrder = { open: 0, escalated: 1, remediated: 2 };
    if (statusOrder[a.status] !== statusOrder[b.status]) return statusOrder[a.status] - statusOrder[b.status];
    const sevOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return sevOrder[a.severity] - sevOrder[b.severity];
  });

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-red-600 shrink-0" />
          <CardTitle>Hygiene Violations</CardTitle>
          <Badge variant="danger" size="sm">
            {violations.filter((v) => v.status === 'open').length} open
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {sorted.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400 flex flex-col items-center gap-2">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            <span>No violations recorded. All parameters are within compliance.</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {sorted.map((v) => {
              const sevCfg = severityConfig[v.severity];
              const stCfg = statusConfig[v.status];
              const isExpanded = expandedId === v.id;
              const EvidenceIcon = v.evidence ? (evidenceIcons[v.evidence.type] || FileText) : FileText;

              return (
                <div key={v.id} className={cn('transition-colors', v.status === 'remediated' && 'opacity-60')}>
                  {/* Row / Mobile Card Header */}
                  <div
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 px-4 sm:px-6 py-3.5 cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : v.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white break-words">{v.title}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {v.zoneName}
                        </span>
                        <span>•</span>
                        <span>{v.parameter}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 shrink-0" />
                          {v.detectedAt}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                      <Badge variant={sevCfg.variant} size="sm">{sevCfg.label}</Badge>
                      <Badge variant={stCfg.variant} size="sm" dot>{stCfg.label}</Badge>
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className="px-4 sm:px-6 pb-4 space-y-3">
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed break-words">{v.description}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-2.5 bg-red-50/60 dark:bg-red-950/40 rounded-lg border border-red-200 dark:border-red-900/60">
                          <span className="text-[10px] font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">Actual Value</span>
                          <p className="text-sm font-bold text-red-800 dark:text-red-300 mt-0.5 break-words">{v.actualValue}</p>
                        </div>
                        <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
                          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Threshold</span>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 break-words">{v.threshold}</p>
                        </div>
                      </div>

                      <div className="p-2.5 bg-blue-50/50 dark:bg-blue-950/40 rounded-lg border border-blue-200 dark:border-blue-900/60">
                        <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Recommendation</span>
                        <p className="text-xs text-blue-900 dark:text-blue-200 mt-0.5 break-words">{v.recommendation}</p>
                      </div>

                      {v.evidence && (
                        <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-1.5 mb-1">
                            <EvidenceIcon className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Evidence</span>
                          </div>
                          <p className="text-xs font-medium text-slate-800 dark:text-slate-200 break-words">{v.evidence.title}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 break-words">{v.evidence.description}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Captured: {v.evidence.capturedAt}</p>
                        </div>
                      )}

                      {v.status === 'open' && (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <Button
                            variant="primary"
                            className="text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white min-h-[44px] px-3 font-semibold w-full sm:w-auto"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/dashboard/legal-review', { state: { hygieneViolation: v } });
                            }}
                          >
                            <Scale className="h-4 w-4 shrink-0" />
                            Send to AI Legal Review
                          </Button>
                          <Button
                            variant="success"
                            className="text-xs gap-1 min-h-[44px] px-3 w-full sm:w-auto"
                            onClick={() => onResolve(v.id)}
                          >
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                            Mark Remediated
                          </Button>
                          <Button
                            variant="outline"
                            className="text-xs gap-1 min-h-[44px] px-3 w-full sm:w-auto"
                            onClick={() => onEscalate(v.id)}
                          >
                            <ArrowUpRight className="h-4 w-4 shrink-0" />
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

