import React from 'react';
import {
  Globe,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { ViolationLegalAssessment } from '../../types/legalReview';

interface PublicationPanelProps {
  assessment: ViolationLegalAssessment;
  onApprove: () => void;
}

const statusConfig: Record<string, { label: string; variant: 'neutral' | 'success' }> = {
  'not-ready': { label: 'Not Ready', variant: 'neutral' },
  approved: { label: 'Approved for Publication', variant: 'success' },
};

export const PublicationPanel: React.FC<PublicationPanelProps> = ({
  assessment,
  onApprove,
}) => {
  const config = statusConfig[assessment.publicationStatus] || statusConfig['not-ready'];
  const canApprove =
    assessment.humanVerificationStatus === 'verified' &&
    assessment.publicationStatus === 'not-ready';
  const isRejected = assessment.humanVerificationStatus === 'rejected';
  const isApproved = assessment.publicationStatus === 'approved';

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Globe className="h-4 w-4 text-blue-600" />
          Publication Status
        </CardTitle>
        <Badge variant={config.variant} size="sm" dot>
          {config.label}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {isApproved ? (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm font-semibold text-emerald-700">
                  Approved for Publication
                </p>
                <p className="text-[11px] text-emerald-600 mt-0.5">
                  This finding has passed AI review and human verification. It has been
                  approved for publication through the appropriate channels.
                </p>
              </div>
            </div>
          </div>
        ) : isRejected ? (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-semibold text-red-700">Publication Blocked</p>
                <p className="text-[11px] text-red-600 mt-0.5">
                  Human verification was rejected. This finding cannot be approved for
                  publication.
                </p>
              </div>
            </div>
          </div>
        ) : canApprove ? (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-semibold text-blue-700">
                  Ready for Publication Approval
                </p>
                <p className="text-[11px] text-blue-600 mt-0.5">
                  Human verification is complete. This finding may now be approved for
                  publication.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-semibold text-slate-600">Not Ready</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Publication requires completion of AI legal review followed by human
                  verification.
                </p>
              </div>
            </div>
          </div>
        )}

        {canApprove && (
          <Button className="w-full gap-2" onClick={onApprove}>
            <ShieldCheck className="h-4 w-4" />
            Approve for Publication
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
