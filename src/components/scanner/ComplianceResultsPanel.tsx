import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  XCircle,
  MinusCircle,
  Lightbulb,
  FileWarning,
  TrendingUp,
  Gavel,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useScanStore } from '../../store/scanStore';
import { cn, formatCurrency } from '../../lib/utils';
import type { ComplianceValidationResult, RuleAuditEntry } from '../../types/ruleEngine';

// ─── Compliance Score Gauge (SVG Arc) ───────────────────────────

const ComplianceScoreGauge: React.FC<{ score: number }> = ({ score }) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const halfCircumference = circumference / 2;
  const offset = halfCircumference - (score / 100) * halfCircumference;

  const color =
    score >= 80
      ? '#16A34A'
      : score >= 60
      ? '#EA580C'
      : score >= 40
      ? '#F59E0B'
      : '#DC2626';

  const bgColor =
    score >= 80
      ? 'bg-emerald-50'
      : score >= 60
      ? 'bg-orange-50'
      : score >= 40
      ? 'bg-amber-50'
      : 'bg-red-50';

  return (
    <div className={cn('relative flex flex-col items-center justify-center rounded-2xl p-5', bgColor)}>
      <svg width="140" height="80" viewBox="0 0 140 80" className="overflow-visible">
        {/* Background arc */}
        <path
          d="M 10 70 A 54 54 0 0 1 130 70"
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Score arc */}
        <path
          d="M 10 70 A 54 54 0 0 1 130 70"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${halfCircumference}`}
          strokeDashoffset={offset}
          className="gauge-fill-animation"
          style={{
            transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </svg>
      <div className="absolute bottom-5 flex flex-col items-center">
        <span
          className="text-3xl font-black tracking-tighter"
          style={{ color }}
        >
          {score}
        </span>
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
          Score / 100
        </span>
      </div>
    </div>
  );
};

// ─── Overall Compliance Badge ───────────────────────────────────

const ComplianceBadge: React.FC<{ status: ComplianceValidationResult['overallStatus'] }> = ({
  status,
}) => {
  const config = {
    compliant: {
      icon: ShieldCheck,
      label: 'Compliant',
      bgClass: 'bg-emerald-50 border-emerald-200',
      textClass: 'text-emerald-700',
      iconClass: 'text-emerald-600',
      dotClass: 'bg-emerald-500',
    },
    'non-compliant': {
      icon: ShieldX,
      label: 'Non-Compliant',
      bgClass: 'bg-red-50 border-red-200 pulse-danger-animation',
      textClass: 'text-red-700',
      iconClass: 'text-red-600',
      dotClass: 'bg-red-500',
    },
    warning: {
      icon: ShieldAlert,
      label: 'Needs Attention',
      bgClass: 'bg-amber-50 border-amber-200',
      textClass: 'text-amber-700',
      iconClass: 'text-amber-600',
      dotClass: 'bg-amber-500',
    },
  }[status];

  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border px-5 py-3.5 transition-all duration-300',
        config.bgClass
      )}
    >
      <div className="relative">
        <Icon className={cn('h-8 w-8', config.iconClass)} />
        <span
          className={cn(
            'absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full animate-pulse',
            config.dotClass
          )}
        />
      </div>
      <div>
        <p className={cn('text-lg font-extrabold tracking-tight', config.textClass)}>
          {config.label}
        </p>
        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
          Legal Metrology PCR-2011
        </p>
      </div>
    </div>
  );
};

// ─── Stat Mini Card ─────────────────────────────────────────────

const MiniStatCard: React.FC<{
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}> = ({ label, value, icon: Icon, color, bgColor }) => (
  <div className={cn('rounded-xl border p-3.5 flex items-center gap-3', bgColor)}>
    <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center', bgColor)}>
      <Icon className={cn('h-5 w-5', color)} />
    </div>
    <div>
      <p className={cn('text-xl font-black tracking-tighter', color)}>{value}</p>
      <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{label}</p>
    </div>
  </div>
);

// ─── Violation Card ─────────────────────────────────────────────

const ViolationCard: React.FC<{ entry: RuleAuditEntry }> = ({ entry }) => {
  const severityConfig = {
    critical: { badge: 'danger' as const, border: 'border-red-200', bg: 'bg-red-50/50' },
    high: { badge: 'warning' as const, border: 'border-orange-200', bg: 'bg-orange-50/30' },
    medium: { badge: 'warning' as const, border: 'border-amber-200', bg: 'bg-amber-50/30' },
    low: { badge: 'neutral' as const, border: 'border-slate-200', bg: 'bg-slate-50/30' },
  }[entry.severity];

  return (
    <div
      className={cn(
        'rounded-xl border p-4 space-y-2.5 transition-all duration-200 hover:shadow-sm',
        severityConfig.border,
        severityConfig.bg
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <XCircle className="h-4 w-4 text-red-500 shrink-0" />
          <span className="text-sm font-bold text-slate-900">{entry.ruleName}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Badge variant={severityConfig.badge} size="sm" className="uppercase text-[9px]">
            {entry.severity}
          </Badge>
          <Badge variant="outline" size="sm" className="text-[9px] font-mono">
            {entry.ruleCode}
          </Badge>
        </div>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed">{entry.ruleDescription}</p>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-white rounded-lg p-2 border border-slate-100">
          <span className="text-[9px] text-slate-400 uppercase font-semibold block">
            OCR Evidence
          </span>
          <span className="text-slate-800 font-semibold">{entry.evidence}</span>
        </div>
        <div className="bg-white rounded-lg p-2 border border-slate-100">
          <span className="text-[9px] text-slate-400 uppercase font-semibold block">
            Expected Standard
          </span>
          <span className="text-slate-800 font-semibold">{entry.expectedStandard}</span>
        </div>
      </div>

      {entry.recommendation && (
        <div className="flex items-start gap-1.5 bg-blue-50 border border-blue-200 rounded-lg p-2">
          <Lightbulb className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
          <span className="text-[11px] text-blue-800 font-medium">{entry.recommendation}</span>
        </div>
      )}

      <div className="flex items-center gap-2 pt-1 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
        <Gavel className="h-3 w-3" />
        <span>
          Penalty: {formatCurrency(entry.penaltyRange.minFine)} –{' '}
          {formatCurrency(entry.penaltyRange.maxFine)}
          {entry.penaltyRange.imprisonmentMonths
            ? ` / ${entry.penaltyRange.imprisonmentMonths} months imprisonment`
            : ''}
        </span>
      </div>
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────

export const ComplianceResultsPanel: React.FC = () => {
  const { currentScan, validationResults } = useScanStore();

  if (
    !currentScan ||
    currentScan.status !== 'completed' ||
    !currentScan.extractedData
  ) {
    return null;
  }

  const result = validationResults[currentScan.id];
  if (!result) return null;

  const violations = result.audit.filter((e) => e.status === 'fail');
  const warnings = result.audit.filter((e) => e.status === 'warning');

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            <span>Legal Metrology Compliance Validation</span>
          </CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">
            Rule Engine evaluation against Packaged Commodities Rules, 2011 — {result.audit.length} rules assessed.
          </p>
        </div>
        <Badge
          variant={
            result.overallStatus === 'compliant'
              ? 'success'
              : result.overallStatus === 'warning'
              ? 'warning'
              : 'danger'
          }
          size="sm"
          className="font-mono font-bold"
        >
          Score: {result.complianceScore}/100
        </Badge>
      </CardHeader>

      <CardContent className="p-5 space-y-5">
        {/* Top Row: Badge + Gauge + Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Overall Badge */}
          <ComplianceBadge status={result.overallStatus} />

          {/* Score Gauge */}
          <ComplianceScoreGauge score={result.complianceScore} />

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <MiniStatCard
              label="Violations"
              value={result.violationCount}
              icon={XCircle}
              color="text-red-600"
              bgColor="bg-red-50 border-red-200"
            />
            <MiniStatCard
              label="Warnings"
              value={result.warningCount}
              icon={AlertTriangle}
              color="text-amber-600"
              bgColor="bg-amber-50 border-amber-200"
            />
            <MiniStatCard
              label="Passed"
              value={result.passCount}
              icon={CheckCircle2}
              color="text-emerald-600"
              bgColor="bg-emerald-50 border-emerald-200"
            />
            <MiniStatCard
              label="N/A"
              value={result.notApplicableCount}
              icon={MinusCircle}
              color="text-slate-500"
              bgColor="bg-slate-50 border-slate-200"
            />
          </div>
        </div>

        {/* Violations List */}
        {violations.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <h4 className="text-sm font-bold text-slate-900">
                Violations ({violations.length})
              </h4>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {violations.map((v) => (
                <ViolationCard key={v.ruleId} entry={v} />
              ))}
            </div>
          </div>
        )}

        {/* Warnings List */}
        {warnings.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <h4 className="text-sm font-bold text-slate-900">
                Warnings ({warnings.length})
              </h4>
            </div>
            <div className="space-y-2">
              {warnings.map((w) => (
                <div
                  key={w.ruleId}
                  className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50/40 px-4 py-2.5"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                    <span className="text-xs font-semibold text-slate-800 truncate">
                      {w.ruleName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge variant="outline" size="sm" className="text-[9px] font-mono">
                      {w.ruleCode}
                    </Badge>
                    <span className="text-[10px] text-amber-700 font-medium">
                      {w.evidence}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Missing Declarations */}
        {result.missingDeclarations.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileWarning className="h-4 w-4 text-red-600" />
              <h4 className="text-sm font-bold text-slate-900">
                Missing Mandatory Declarations ({result.missingDeclarations.length})
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {result.missingDeclarations.map((decl) => (
                <div
                  key={decl}
                  className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50/40 px-3 py-2"
                >
                  <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                  <span className="text-xs font-semibold text-red-800">{decl}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {result.recommendations.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <h4 className="text-sm font-bold text-slate-900">Recommendations</h4>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50/30 p-4 space-y-2">
              {result.recommendations.slice(0, 8).map((rec, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Lightbulb className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-blue-900 font-medium leading-relaxed">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
          <ShieldCheck className="h-3 w-3" />
          <span>SatyaDrishti Rule Engine v2.0</span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">{result.timestamp}</span>
      </CardFooter>
    </Card>
  );
};
