import React from 'react';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { ViolationLegalAssessment } from '../../types/legalReview';

interface HumanVerificationPanelProps {
  assessment: ViolationLegalAssessment;
  onVerify: () => void;
  onReject: () => void;
  onNotesChange: (notes: string) => void;
}

const statusConfig: Record<
  string,
  {
    icon: React.ElementType;
    label: string;
    variant: 'warning' | 'success' | 'danger';
    color: string;
  }
> = {
  pending: { icon: Clock, label: 'Pending', variant: 'warning', color: 'text-amber-600' },
  verified: {
    icon: CheckCircle2,
    label: 'Verified',
    variant: 'success',
    color: 'text-emerald-600',
  },
  rejected: { icon: XCircle, label: 'Rejected', variant: 'danger', color: 'text-red-600' },
};

export const HumanVerificationPanel: React.FC<HumanVerificationPanelProps> = ({
  assessment,
  onVerify,
  onReject,
  onNotesChange,
}) => {
  const config =
    statusConfig[assessment.humanVerificationStatus] || statusConfig.pending;
  const StatusIcon = config.icon;
  const isPending = assessment.humanVerificationStatus === 'pending';

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <UserCheck className="h-4 w-4 text-violet-600" />
          Human Verification
        </CardTitle>
        <Badge variant={config.variant} size="sm" dot>
          {config.label}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Display */}
        <div
          className={`p-3 rounded-lg border ${
            assessment.humanVerificationStatus === 'verified'
              ? 'bg-emerald-50 border-emerald-200'
              : assessment.humanVerificationStatus === 'rejected'
              ? 'bg-red-50 border-red-200'
              : 'bg-amber-50 border-amber-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <StatusIcon className={`h-5 w-5 ${config.color}`} />
            <div>
              <p className={`text-sm font-semibold ${config.color}`}>
                {assessment.humanVerificationStatus === 'verified' &&
                  '✓ Human Verification Complete'}
                {assessment.humanVerificationStatus === 'rejected' &&
                  '✕ Verification Rejected'}
                {assessment.humanVerificationStatus === 'pending' &&
                  'Awaiting Human Verification'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isPending
                  ? 'A human reviewer must verify or reject this finding before publication can proceed.'
                  : 'Reviewer: Prototype Reviewer'}
              </p>
            </div>
          </div>
        </div>

        {/* Reviewer Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Reviewer Notes
          </label>
          <textarea
            value={assessment.reviewerNotes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Add verification notes or reasoning..."
            disabled={!isPending}
            rows={3}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed resize-none"
          />
        </div>

        {/* Action Buttons */}
        {isPending && (
          <div className="flex items-center gap-2">
            <Button
              variant="success"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={onVerify}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Verify Finding
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs text-red-600 border-red-200 hover:bg-red-50"
              onClick={onReject}
            >
              <XCircle className="h-3.5 w-3.5" />
              Reject Finding
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
