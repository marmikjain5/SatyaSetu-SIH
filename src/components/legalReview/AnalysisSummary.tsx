import React from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Search,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';
import { StatCard } from '../ui/StatCard';
import { Badge } from '../ui/Badge';
import type { AIAnalysisResult } from '../../types/legalReview';

interface AnalysisSummaryProps {
  result: AIAnalysisResult;
}

const riskConfig: Record<
  string,
  { variant: 'danger' | 'warning' | 'success' | 'primary' | 'neutral'; label: string }
> = {
  CRITICAL: { variant: 'danger', label: 'Critical Risk' },
  HIGH: { variant: 'warning', label: 'High Risk' },
  MEDIUM: { variant: 'warning', label: 'Medium Risk' },
  LOW: { variant: 'success', label: 'Low Risk' },
  NONE: { variant: 'success', label: 'No Risk' },
};

export const AnalysisSummary: React.FC<AnalysisSummaryProps> = ({ result }) => {
  const { findings, overallRisk, averageConfidence } = result;

  const criticalCount = findings.filter((f) => f.severity === 'critical').length;
  const highCount = findings.filter((f) => f.severity === 'high').length;
  const reviewedCount = findings.filter(
    (f) => f.status === 'reviewed' || f.status === 'resolved'
  ).length;

  const config = riskConfig[overallRisk] || riskConfig.NONE;

  return (
    <div className="space-y-4">
      {/* Risk Level Header */}
      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200/90 shadow-subtle">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-lg border ${
              overallRisk === 'CRITICAL' || overallRisk === 'HIGH'
                ? 'bg-red-50 text-red-700 border-red-200'
                : overallRisk === 'MEDIUM'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
          >
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">AI Review Summary</h3>
            <p className="text-xs text-slate-500">Prototype analysis — simulated AI findings</p>
          </div>
        </div>
        <Badge
          variant={config.variant}
          size="lg"
          dot
        >
          {config.label}
        </Badge>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Findings"
          value={findings.length}
          icon={Search}
          variant="accent"
          description="Total issues identified"
        />
        <StatCard
          title="Critical"
          value={criticalCount}
          icon={AlertTriangle}
          variant={criticalCount > 0 ? 'danger' : 'success'}
          description={criticalCount > 0 ? 'Immediate action needed' : 'None found'}
        />
        <StatCard
          title="High"
          value={highCount}
          icon={ShieldAlert}
          variant={highCount > 0 ? 'warning' : 'success'}
          description={highCount > 0 ? 'Review required' : 'None found'}
        />
        <StatCard
          title="Confidence"
          value={`${averageConfidence}%`}
          icon={BarChart3}
          variant="default"
          description="Average across findings"
        />
      </div>

      {/* Review Progress */}
      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-700">Review Progress</span>
            <span className="text-xs font-mono text-slate-500">
              {reviewedCount}/{findings.length} reviewed
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{
                width: findings.length > 0
                  ? `${(reviewedCount / findings.length) * 100}%`
                  : '0%',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
