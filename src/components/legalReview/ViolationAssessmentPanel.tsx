import React from 'react';
import {
  Shield,
  AlertTriangle,
  Scale,
  BarChart3,
  ArrowRight,
  FileWarning,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import type { ViolationLegalAssessment } from '../../types/legalReview';

interface ViolationAssessmentPanelProps {
  assessment: ViolationLegalAssessment;
}

const sufficiencyConfig: Record<
  string,
  { variant: 'success' | 'danger' | 'warning'; label: string }
> = {
  sufficient: { variant: 'success', label: 'Sufficient' },
  insufficient: { variant: 'danger', label: 'Insufficient' },
  'requires-verification': { variant: 'warning', label: 'Requires Verification' },
};

const riskConfig: Record<
  string,
  { variant: 'success' | 'danger' | 'warning'; label: string }
> = {
  low: { variant: 'success', label: 'Low' },
  medium: { variant: 'warning', label: 'Medium' },
  high: { variant: 'danger', label: 'High' },
};

const recommendationConfig: Record<
  string,
  { variant: 'success' | 'danger' | 'warning'; label: string }
> = {
  'proceed-to-verification': { variant: 'success', label: 'Proceed to Human Verification' },
  'request-additional-evidence': { variant: 'warning', label: 'Request Additional Evidence' },
  'do-not-proceed': { variant: 'danger', label: 'Do Not Proceed Without Verification' },
};

export const ViolationAssessmentPanel: React.FC<ViolationAssessmentPanelProps> = ({
  assessment,
}) => {
  const sufficiency =
    sufficiencyConfig[assessment.evidenceSufficiency] || sufficiencyConfig.insufficient;
  const risk = riskConfig[assessment.falseAccusationRisk] || riskConfig.medium;
  const recommendation =
    recommendationConfig[assessment.aiRecommendation] ||
    recommendationConfig['request-additional-evidence'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Scale className="h-4 w-4 text-indigo-600" />
          Prototype Legal Assessment
        </CardTitle>
        <Badge variant="warning" size="sm">
          Prototype
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Disclaimer */}
        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-[10px] text-amber-700 leading-tight">
            ⚠️ This is a prototype legal assessment generated from violation data for
            demonstration purposes. It does not constitute legal advice. All rule references
            require verification against actual legal provisions.
          </p>
        </div>

        {/* Evidence Sufficiency */}
        <div className="p-3 bg-white rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileWarning className="h-4 w-4 text-slate-500" />
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Evidence Assessment
              </span>
            </div>
            <Badge variant={sufficiency.variant} size="sm" dot>
              {sufficiency.label}
            </Badge>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {assessment.evidenceSufficiencyExplanation}
          </p>
        </div>

        {/* False Accusation Risk */}
        <div className="p-3 bg-white rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-slate-500" />
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                False Accusation Risk
              </span>
            </div>
            <Badge variant={risk.variant} size="sm" dot>
              {risk.label}
            </Badge>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {assessment.falseAccusationRiskExplanation}
          </p>
        </div>

        {/* Applicable Rule */}
        <div className="p-3 bg-white rounded-lg border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <Scale className="h-4 w-4 text-slate-500" />
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Applicable Rule
            </span>
          </div>
          <p className="text-xs text-slate-800 font-medium bg-slate-50 px-2 py-1.5 rounded border border-slate-100">
            {assessment.applicableRule}
          </p>
        </div>

        {/* Legal Reasoning */}
        <div className="p-3 bg-white rounded-lg border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-slate-500" />
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Legal Reasoning
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {assessment.legalReasoning}
          </p>
        </div>

        {/* AI Confidence & Recommendation */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 mb-1.5">
              <BarChart3 className="h-4 w-4 text-slate-500" />
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                AI Confidence
              </span>
            </div>
            <p className="text-lg font-bold text-slate-900">{assessment.aiConfidence}%</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 mb-1.5">
              <ArrowRight className="h-4 w-4 text-slate-500" />
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                AI Recommendation
              </span>
            </div>
            <Badge variant={recommendation.variant} size="sm">
              {recommendation.label}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
