import React, { useState } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MinusCircle,
  ChevronDown,
  ChevronRight,
  Filter,
  Gavel,
  FileText,
  Search,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useScanStore } from '../../store/scanStore';
import { cn, formatCurrency } from '../../lib/utils';
import type { RuleAuditEntry } from '../../types/ruleEngine';

// ─── Status Icon ────────────────────────────────────────────────

const StatusIcon: React.FC<{ status: RuleAuditEntry['status'] }> = ({ status }) => {
  switch (status) {
    case 'pass':
      return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
    case 'fail':
      return <XCircle className="h-4 w-4 text-red-600" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-amber-600" />;
    case 'not-applicable':
    default:
      return <MinusCircle className="h-4 w-4 text-slate-400" />;
  }
};

const statusLabel: Record<RuleAuditEntry['status'], string> = {
  pass: 'Pass',
  fail: 'Fail',
  warning: 'Warning',
  'not-applicable': 'N/A',
};

const statusBadgeVariant: Record<
  RuleAuditEntry['status'],
  'success' | 'danger' | 'warning' | 'neutral'
> = {
  pass: 'success',
  fail: 'danger',
  warning: 'warning',
  'not-applicable': 'neutral',
};

// ─── Expandable Audit Row ───────────────────────────────────────

const AuditRow: React.FC<{ entry: RuleAuditEntry; index: number }> = ({ entry, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const rowBg =
    entry.status === 'fail'
      ? 'bg-red-50/30 hover:bg-red-50/60'
      : entry.status === 'warning'
      ? 'bg-amber-50/20 hover:bg-amber-50/40'
      : entry.status === 'pass'
      ? 'hover:bg-emerald-50/30'
      : 'hover:bg-slate-50';

  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200 transition-all duration-200 overflow-hidden',
        isExpanded && 'ring-1 ring-blue-400 border-blue-300 shadow-sm'
      )}
    >
      {/* Summary Row */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full grid grid-cols-[24px_1fr_140px_100px_60px_24px] items-center gap-3 px-4 py-3 text-left transition-colors',
          rowBg
        )}
      >
        {/* Index */}
        <span className="text-[10px] font-mono text-slate-400 text-center">{index + 1}</span>

        {/* Rule Name + Code */}
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-900 truncate">{entry.ruleName}</p>
          <p className="text-[10px] font-mono text-slate-500 truncate">{entry.ruleCode}</p>
        </div>

        {/* Evidence */}
        <span className="text-[11px] text-slate-700 font-medium truncate">
          {entry.evidence.length > 30 ? `${entry.evidence.slice(0, 30)}…` : entry.evidence}
        </span>

        {/* Status Badge */}
        <Badge variant={statusBadgeVariant[entry.status]} size="sm" className="gap-1 w-fit">
          <StatusIcon status={entry.status} />
          <span className="text-[10px]">{statusLabel[entry.status]}</span>
        </Badge>

        {/* Severity */}
        <Badge
          variant={
            entry.severity === 'critical'
              ? 'danger'
              : entry.severity === 'high'
              ? 'warning'
              : 'neutral'
          }
          size="sm"
          className="text-[9px] uppercase"
        >
          {entry.severity}
        </Badge>

        {/* Expand Toggle */}
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-slate-400" />
        )}
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-slate-100 space-y-3 bg-slate-50/50">
          {/* Rule Description */}
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Rule Description
            </span>
            <p className="text-xs text-slate-700 leading-relaxed mt-0.5">
              {entry.ruleDescription}
            </p>
          </div>

          {/* Evidence vs Expected */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">
                OCR Extracted Evidence
              </span>
              <p className="text-xs font-semibold text-slate-900 break-words">{entry.evidence}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">
                Expected Standard
              </span>
              <p className="text-xs font-semibold text-slate-900 break-words">
                {entry.expectedStandard}
              </p>
            </div>
          </div>

          {/* Recommendation */}
          {entry.recommendation && (
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-2.5">
              <FileText className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
              <span className="text-[11px] text-blue-800 font-medium leading-relaxed">
                {entry.recommendation}
              </span>
            </div>
          )}

          {/* Penalty + Section */}
          <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[10px] text-slate-400">
            <div className="flex items-center gap-1.5 font-mono">
              <Gavel className="h-3 w-3" />
              <span>
                Penalty: {formatCurrency(entry.penaltyRange.minFine)} –{' '}
                {formatCurrency(entry.penaltyRange.maxFine)}
                {entry.penaltyRange.imprisonmentMonths
                  ? ` / ${entry.penaltyRange.imprisonmentMonths}mo imprisonment`
                  : ''}
              </span>
            </div>
            <span className="font-mono">{entry.section}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Filter Buttons ─────────────────────────────────────────────

type FilterStatus = 'all' | 'pass' | 'fail' | 'warning' | 'not-applicable';

const FILTER_OPTIONS: { key: FilterStatus; label: string; icon: React.ElementType }[] = [
  { key: 'all', label: 'All', icon: ClipboardCheck },
  { key: 'pass', label: 'Pass', icon: CheckCircle2 },
  { key: 'fail', label: 'Fail', icon: XCircle },
  { key: 'warning', label: 'Warning', icon: AlertTriangle },
  { key: 'not-applicable', label: 'N/A', icon: MinusCircle },
];

// ─── Main Component ─────────────────────────────────────────────

export const RuleAuditView: React.FC = () => {
  const { currentScan, validationResults } = useScanStore();
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (
    !currentScan ||
    currentScan.status !== 'completed' ||
    !currentScan.extractedData
  ) {
    return null;
  }

  const result = validationResults[currentScan.id];
  if (!result) return null;

  // Apply filters
  let filteredAudit = result.audit;
  if (filter !== 'all') {
    filteredAudit = filteredAudit.filter((e) => e.status === filter);
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredAudit = filteredAudit.filter(
      (e) =>
        e.ruleName.toLowerCase().includes(q) ||
        e.ruleCode.toLowerCase().includes(q) ||
        e.ruleDescription.toLowerCase().includes(q) ||
        e.evidence.toLowerCase().includes(q)
    );
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>
            <ClipboardCheck className="h-4 w-4 text-blue-600" />
            <span>Rule Audit Trail</span>
          </CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">
            Detailed per-rule evaluation — {result.audit.length} statutory rules assessed against
            OCR evidence.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="primary" size="sm" className="font-mono">
            {result.passCount} Pass
          </Badge>
          <Badge variant="danger" size="sm" className="font-mono">
            {result.violationCount} Fail
          </Badge>
          <Badge variant="warning" size="sm" className="font-mono">
            {result.warningCount} Warn
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        {/* Filter Bar */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            {FILTER_OPTIONS.map(({ key, label, icon: Icon }) => {
              const count =
                key === 'all'
                  ? result.audit.length
                  : result.audit.filter((e) => e.status === key).length;
              return (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={cn(
                    'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all',
                    filter === key
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  )}
                >
                  <Icon className="h-3 w-3" />
                  <span>{label}</span>
                  <span
                    className={cn(
                      'text-[9px] px-1 py-0 rounded-full font-mono',
                      filter === key ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rules..."
              className="text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 w-48"
            />
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-[24px_1fr_140px_100px_60px_24px] items-center gap-3 px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
          <span className="text-center">#</span>
          <span>Rule Name / Code</span>
          <span>Evidence</span>
          <span>Status</span>
          <span>Severity</span>
          <span></span>
        </div>

        {/* Audit Rows */}
        <div className="space-y-2">
          {filteredAudit.length > 0 ? (
            filteredAudit.map((entry, i) => (
              <AuditRow key={entry.ruleId} entry={entry} index={i} />
            ))
          ) : (
            <div className="text-center py-8 text-xs text-slate-400">
              No rules match the current filter.
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
          <ClipboardCheck className="h-3 w-3" />
          <span>
            Showing {filteredAudit.length} of {result.audit.length} rules
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">{result.timestamp}</span>
      </CardFooter>
    </Card>
  );
};
