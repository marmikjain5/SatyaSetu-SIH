import React, { useState } from 'react';
import {
  ClipboardCheck,
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle2,
  MinusCircle,
  Camera,
  Eye,
  Activity,
  FileText,
} from 'lucide-react';
import { HygieneInspection, HygieneEvidence } from '../../types/hygiene';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';

interface InspectionHistoryProps {
  inspections: HygieneInspection[];
}

const resultConfig = {
  pass: { label: 'Pass', variant: 'success' as const, icon: CheckCircle2 },
  fail: { label: 'Fail', variant: 'danger' as const, icon: AlertTriangle },
  'conditional-pass': { label: 'Conditional Pass', variant: 'warning' as const, icon: MinusCircle },
};

const evidenceIcons: Record<string, React.ElementType> = {
  photograph: Camera,
  'visual-observation': Eye,
  'monitoring-reading': Activity,
  document: FileText,
};

export const InspectionHistory: React.FC<InspectionHistoryProps> = ({ inspections }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const sorted = [...inspections].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <ClipboardCheck className="h-4 w-4 text-blue-600" />
          Inspection History
        </CardTitle>
        <Badge variant="neutral" size="sm">{inspections.length} records</Badge>
      </CardHeader>
      <CardContent className="p-0">
        {sorted.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">No inspection records available.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sorted.map((ins) => {
              const cfg = resultConfig[ins.result];
              const ResultIcon = cfg.icon;
              const isExpanded = expandedId === ins.id;

              return (
                <div key={ins.id}>
                  {/* Summary Row */}
                  <div
                    className="flex items-center gap-4 px-6 py-3.5 cursor-pointer hover:bg-slate-50/80 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : ins.id)}
                  >
                    {/* Result Icon */}
                    <div className={cn(
                      'h-9 w-9 rounded-lg flex items-center justify-center shrink-0',
                      ins.result === 'pass' ? 'bg-emerald-100 text-emerald-600' :
                      ins.result === 'fail' ? 'bg-red-100 text-red-600' :
                      'bg-amber-100 text-amber-600'
                    )}>
                      <ResultIcon className="h-4.5 w-4.5" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">
                          {ins.date}
                        </span>
                        <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {ins.inspector}
                        </span>
                        <span>{ins.inspectorBadge}</span>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="hidden sm:flex items-center gap-4 shrink-0">
                      <div className="text-center">
                        <span className={cn(
                          'text-lg font-bold',
                          ins.score >= 80 ? 'text-emerald-700' : ins.score >= 60 ? 'text-amber-700' : 'text-red-700'
                        )}>
                          {ins.score}
                        </span>
                        <span className="text-[10px] text-slate-400">/100</span>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-bold text-slate-900">{ins.findingsCount}</div>
                        <div className="text-[10px] text-slate-400">Findings</div>
                      </div>
                      {ins.criticalCount > 0 && (
                        <div className="text-center">
                          <div className="text-sm font-bold text-red-600">{ins.criticalCount}</div>
                          <div className="text-[10px] text-red-400">Critical</div>
                        </div>
                      )}
                    </div>

                    {/* Expand */}
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                    )}
                  </div>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className="px-6 pb-5 space-y-3">
                      {/* Findings */}
                      {ins.findings.length > 0 && (
                        <div>
                          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Findings</span>
                          <ul className="mt-1.5 space-y-1">
                            {ins.findings.map((finding, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                                <AlertTriangle className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" />
                                <span>{finding}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Evidence */}
                      {ins.evidence.length > 0 && (
                        <div>
                          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Evidence</span>
                          <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {ins.evidence.map((ev: HygieneEvidence) => {
                              const EvIcon = evidenceIcons[ev.type] || FileText;
                              return (
                                <div key={ev.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <EvIcon className="h-3.5 w-3.5 text-slate-500" />
                                    <span className="text-[11px] font-medium text-slate-800">{ev.title}</span>
                                  </div>
                                  <p className="text-[10px] text-slate-500">{ev.description}</p>
                                  <div className="flex items-center gap-1 mt-1 text-[9px] text-slate-400">
                                    <Calendar className="h-2.5 w-2.5" />
                                    {ev.capturedAt}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {ins.notes && (
                        <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-200">
                          <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">Inspector Notes</span>
                          <p className="text-xs text-blue-900 mt-0.5 leading-relaxed">{ins.notes}</p>
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
