import React from 'react';
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  BookOpen,
  Scale,
  Quote,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import type { AIFinding } from '../../types/legalReview';
import { useLegalReviewStore } from '../../store/legalReviewStore';

interface FindingCardProps {
  finding: AIFinding;
}

const severityConfig: Record<
  string,
  {
    badgeVariant: 'danger' | 'warning' | 'success' | 'neutral';
    borderColor: string;
    accentColor: string;
    bgColor: string;
    label: string;
  }
> = {
  critical: {
    badgeVariant: 'danger',
    borderColor: 'border-l-red-500',
    accentColor: 'text-red-600',
    bgColor: 'bg-red-50/50',
    label: 'CRITICAL',
  },
  high: {
    badgeVariant: 'warning',
    borderColor: 'border-l-amber-500',
    accentColor: 'text-amber-600',
    bgColor: 'bg-amber-50/50',
    label: 'HIGH',
  },
  medium: {
    badgeVariant: 'warning',
    borderColor: 'border-l-yellow-500',
    accentColor: 'text-yellow-600',
    bgColor: 'bg-yellow-50/30',
    label: 'MEDIUM',
  },
  low: {
    badgeVariant: 'neutral',
    borderColor: 'border-l-blue-400',
    accentColor: 'text-blue-600',
    bgColor: 'bg-blue-50/30',
    label: 'LOW',
  },
};

const statusConfig: Record<
  string,
  { icon: React.ElementType; label: string; color: string }
> = {
  open: { icon: Circle, label: 'Open', color: 'text-slate-400' },
  reviewed: { icon: CheckCircle2, label: 'Reviewed', color: 'text-blue-500' },
  resolved: { icon: CheckCircle2, label: 'Resolved', color: 'text-emerald-500' },
};

export const FindingCard: React.FC<FindingCardProps> = ({ finding }) => {
  const { toggleFinding, markFindingReviewed, markFindingResolved } =
    useLegalReviewStore();

  const config = severityConfig[finding.severity] || severityConfig.low;
  const status = statusConfig[finding.status] || statusConfig.open;
  const StatusIcon = status.icon;

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200/90 shadow-subtle overflow-hidden transition-all duration-200 border-l-4 ${config.borderColor}`}
    >
      {/* Collapsed Header */}
      <button
        onClick={() => toggleFinding(finding.id)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50/80 transition-colors"
      >
        {finding.isExpanded ? (
          <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-semibold text-slate-900 truncate">
              {finding.title}
            </h4>
            <Badge variant={config.badgeVariant} size="sm">
              {config.label}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 truncate">
            {finding.matchedRule}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-mono font-medium text-slate-500">
            {finding.confidence}%
          </span>
          <div className="flex items-center gap-1">
            <StatusIcon className={`h-3.5 w-3.5 ${status.color}`} />
            <span className={`text-[11px] font-medium ${status.color}`}>
              {status.label}
            </span>
          </div>
        </div>
      </button>

      {/* Expanded Details */}
      {finding.isExpanded && (
        <div className={`px-4 pb-4 pt-0 space-y-3 ${config.bgColor}`}>
          {/* Matched Rule */}
          <div className="flex items-start gap-2 p-3 bg-white rounded-lg border border-slate-100">
            <Scale className={`h-4 w-4 mt-0.5 shrink-0 ${config.accentColor}`} />
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
                Matched Rule
              </span>
              <p className="text-xs text-slate-700 font-medium">{finding.matchedRule}</p>
            </div>
          </div>

          {/* Evidence */}
          <div className="flex items-start gap-2 p-3 bg-white rounded-lg border border-slate-100">
            <Quote className={`h-4 w-4 mt-0.5 shrink-0 ${config.accentColor}`} />
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
                Evidence
              </span>
              <p className="text-xs text-slate-800 font-mono bg-slate-50 px-2 py-1.5 rounded border border-slate-100">
                {finding.evidence}
              </p>
            </div>
          </div>

          {/* Explanation */}
          <div className="flex items-start gap-2 p-3 bg-white rounded-lg border border-slate-100">
            <BookOpen className={`h-4 w-4 mt-0.5 shrink-0 ${config.accentColor}`} />
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
                Explanation
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">{finding.explanation}</p>
            </div>
          </div>

          {/* Recommendation */}
          <div className="flex items-start gap-2 p-3 bg-white rounded-lg border border-slate-100">
            <Lightbulb className={`h-4 w-4 mt-0.5 shrink-0 ${config.accentColor}`} />
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
                Recommended Action
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">{finding.recommendation}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            {finding.status === 'open' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  markFindingReviewed(finding.id);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Mark as Reviewed
              </button>
            )}
            {finding.status === 'reviewed' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  markFindingResolved(finding.id);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
              >
                <ArrowRight className="h-3.5 w-3.5" />
                Mark as Resolved
              </button>
            )}
            {finding.status === 'resolved' && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Resolved
              </div>
            )}
            <span className="text-[10px] text-slate-400 ml-auto font-mono">
              Confidence: {finding.confidence}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
