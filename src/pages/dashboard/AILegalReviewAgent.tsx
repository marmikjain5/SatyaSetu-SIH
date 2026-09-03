import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Scale,
  Sparkles,
  RotateCcw,
  Loader2,
  FileSearch,
  ShieldAlert,
  MapPin,
  Camera,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useLegalReviewStore } from '../../store/legalReviewStore';
import { useHygieneStore } from '../../store/hygieneStore';
import { DocumentPanel } from '../../components/legalReview/DocumentPanel';
import { AnalysisSummary } from '../../components/legalReview/AnalysisSummary';
import { FindingCard } from '../../components/legalReview/FindingCard';
import { ChatAssistant } from '../../components/legalReview/ChatAssistant';
import { ViolationAssessmentPanel } from '../../components/legalReview/ViolationAssessmentPanel';
import { HumanVerificationPanel } from '../../components/legalReview/HumanVerificationPanel';
import { PublicationPanel } from '../../components/legalReview/PublicationPanel';
import { createReviewDocumentFromViolation } from '../../lib/legalReviewIntegration';
import type { HygieneViolation } from '../../types/hygiene';

export const AILegalReviewAgent: React.FC = () => {
  const {
    selectedDocument,
    analysisResult,
    isAnalyzing,
    sourceViolation,
    violationAssessment,
    analyzeDocument,
    resetSession,
    loadExternalDocument,
    verifyReview,
    rejectReview,
    approveForPublication,
    setReviewerNotes,
  } = useLegalReviewStore();

  const { getFactoryById } = useHygieneStore();
  const location = useLocation();
  const hasLoadedRef = useRef(false);

  // Receive hygiene violation from navigation state
  useEffect(() => {
    const state = location.state as { hygieneViolation?: HygieneViolation } | null;
    if (state?.hygieneViolation && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      const violation = state.hygieneViolation;
      const factory = getFactoryById(violation.factoryId);
      const factoryName = factory?.name;
      const reviewDoc = createReviewDocumentFromViolation(violation, factoryName);
      loadExternalDocument(reviewDoc, violation, factoryName);

      // Clear navigation state to prevent re-loading on re-render
      window.history.replaceState({}, document.title);
    }
  }, [location.state, getFactoryById, loadExternalDocument]);

  // ── Workflow step computation ─────────────────────────────────────────
  const workflowSteps = sourceViolation
    ? [
        {
          label: 'Violation Detected',
          complete: true,
          active: !analysisResult && !isAnalyzing,
        },
        {
          label: 'AI Legal Review',
          complete: !!analysisResult,
          active: isAnalyzing,
        },
        {
          label: 'Human Verification',
          complete:
            !!violationAssessment &&
            violationAssessment.humanVerificationStatus !== 'pending',
          active:
            !!violationAssessment &&
            violationAssessment.humanVerificationStatus === 'pending',
        },
        {
          label: 'Publication',
          complete:
            !!violationAssessment &&
            violationAssessment.publicationStatus === 'approved',
          active:
            !!violationAssessment &&
            violationAssessment.humanVerificationStatus === 'verified' &&
            violationAssessment.publicationStatus === 'not-ready',
        },
      ]
    : null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Scale className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                AI Legal Review Agent
              </h1>
              <Badge variant="warning" size="sm" dot>
                Prototype
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {sourceViolation
                ? 'Violation-based legal review • PRD workflow: Violation → AI Review → Human Verification → Publication'
                : 'AI-assisted regulatory document review • Simulated analysis for demonstration'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Analyze Button */}
          <Button
            onClick={analyzeDocument}
            disabled={!selectedDocument || isAnalyzing || !!analysisResult}
            className="gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing…
              </>
            ) : analysisResult ? (
              <>
                <FileSearch className="h-4 w-4" />
                Analysis Complete
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Analyze Document
              </>
            )}
          </Button>

          {/* Reset Button */}
          <Button
            variant="outline"
            onClick={resetSession}
            disabled={!selectedDocument && !analysisResult}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline">Reset Review</span>
          </Button>
        </div>
      </div>

      {/* Prototype Disclaimer Banner */}
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5">
        <Sparkles className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-amber-800">Prototype Disclaimer</p>
          <p className="text-[11px] text-amber-700 leading-relaxed mt-0.5">
            This module uses deterministic mock analysis to demonstrate AI-powered legal
            review capabilities. No external AI service is contacted. All regulatory rules
            are labelled as samples. Analysis results do not constitute real legal advice.
            {sourceViolation &&
              ' Publication approval in this prototype does not result in actual public disclosure.'}
          </p>
        </div>
      </div>

      {/* Workflow Progress Stepper (only for violation-based reviews) */}
      {workflowSteps && (
        <div className="flex items-center gap-0 p-4 bg-white rounded-xl border border-slate-200/90 shadow-subtle overflow-x-auto">
          {workflowSteps.map((step, i) => {
            const isRejected =
              i === 2 &&
              violationAssessment?.humanVerificationStatus === 'rejected';
            return (
              <React.Fragment key={step.label}>
                <div className="flex items-center gap-2 shrink-0">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      isRejected
                        ? 'bg-red-500 text-white'
                        : step.complete
                        ? 'bg-emerald-500 text-white'
                        : step.active
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isRejected ? '✕' : step.complete ? '✓' : i + 1}
                  </div>
                  <span
                    className={`text-xs font-medium whitespace-nowrap ${
                      isRejected
                        ? 'text-red-600'
                        : step.complete
                        ? 'text-emerald-700'
                        : step.active
                        ? 'text-blue-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {i < workflowSteps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-3 min-w-[24px] ${
                      step.complete && !isRejected
                        ? 'bg-emerald-400'
                        : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* Main Content: 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Panel: Source Violation + Document + Analysis + Assessment + Findings + Verification + Publication */}
        <div className="lg:col-span-3 space-y-6">
          {/* Source Violation Context (only for hygiene-originated reviews) */}
          {sourceViolation && (
            <Card>
              <CardHeader>
                <CardTitle>
                  <ShieldAlert className="h-4 w-4 text-red-600" />
                  Source Violation
                </CardTitle>
                <Badge
                  variant={
                    sourceViolation.severity === 'critical'
                      ? 'danger'
                      : sourceViolation.severity === 'high'
                      ? 'warning'
                      : 'neutral'
                  }
                  size="sm"
                  dot
                >
                  {sourceViolation.severity.charAt(0).toUpperCase() +
                    sourceViolation.severity.slice(1)}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Factory
                    </span>
                    <p className="text-xs font-medium text-slate-800 mt-0.5">
                      {sourceViolation.factoryName}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Zone
                    </span>
                    <p className="text-xs font-medium text-slate-800 mt-0.5">
                      <MapPin className="h-3 w-3 inline mr-0.5" />
                      {sourceViolation.zone}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Violation
                    </span>
                    <p className="text-xs font-medium text-slate-800 mt-0.5">
                      {sourceViolation.violationTitle}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Current Status
                    </span>
                    <p className="text-xs font-medium text-slate-800 mt-0.5">
                      {sourceViolation.status.charAt(0).toUpperCase() +
                        sourceViolation.status.slice(1)}
                    </p>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Description
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                    {sourceViolation.description}
                  </p>
                </div>

                {/* Evidence */}
                {sourceViolation.evidence && (
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Camera className="h-3.5 w-3.5 text-slate-500" />
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        Evidence
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-800">
                      {sourceViolation.evidence.title}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {sourceViolation.evidence.description}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Captured: {sourceViolation.evidence.capturedAt}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Document Panel */}
          <DocumentPanel />

          {/* Analysis Summary (shown after analysis) */}
          {analysisResult && <AnalysisSummary result={analysisResult} />}

          {/* Violation Assessment Panel (PRD-aligned, only for hygiene violations) */}
          {violationAssessment && (
            <ViolationAssessmentPanel assessment={violationAssessment} />
          )}

          {/* Finding Cards */}
          {analysisResult && analysisResult.findings.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Detailed Findings
                </h2>
                <span className="text-[11px] text-slate-400 font-mono">
                  {analysisResult.findings.length} issue(s)
                </span>
              </div>
              {analysisResult.findings.map((finding) => (
                <FindingCard key={finding.id} finding={finding} />
              ))}
            </div>
          )}

          {/* Human Verification Panel (PRD workflow, only for hygiene violations) */}
          {violationAssessment && (
            <HumanVerificationPanel
              assessment={violationAssessment}
              onVerify={verifyReview}
              onReject={rejectReview}
              onNotesChange={setReviewerNotes}
            />
          )}

          {/* Publication Panel (PRD workflow, only for hygiene violations) */}
          {violationAssessment && (
            <PublicationPanel
              assessment={violationAssessment}
              onApprove={approveForPublication}
            />
          )}

          {/* Mode Indicator for Sample Documents */}
          {!sourceViolation && analysisResult && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-slate-400 shrink-0" />
              <p className="text-[11px] text-slate-500">
                <span className="font-semibold">Sample Document Review Mode</span> — This
                is a standalone document review. For the full PRD workflow (Violation → AI
                Review → Human Verification → Publication), navigate from a Factory Hygiene
                violation using "Review with AI".
              </p>
            </div>
          )}

          {/* Analyzing State */}
          {isAnalyzing && (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-slate-200/90 shadow-subtle">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
              <p className="text-sm font-semibold text-slate-700">
                {sourceViolation
                  ? 'Running AI Legal Review…'
                  : 'Analyzing Document…'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {sourceViolation
                  ? 'Evaluating evidence, legal basis, and false accusation risk'
                  : 'Running simulated AI legal review analysis'}
              </p>
            </div>
          )}
        </div>

        {/* Right Panel: Chat Assistant */}
        <div className="lg:col-span-2 lg:sticky lg:top-20" style={{ minHeight: '500px' }}>
          <ChatAssistant />
        </div>
      </div>
    </div>
  );
};
