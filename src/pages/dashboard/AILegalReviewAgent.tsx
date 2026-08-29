import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Scale,
  Sparkles,
  RotateCcw,
  Loader2,
  FileSearch,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useLegalReviewStore } from '../../store/legalReviewStore';
import { useHygieneStore } from '../../store/hygieneStore';
import { DocumentPanel } from '../../components/legalReview/DocumentPanel';
import { AnalysisSummary } from '../../components/legalReview/AnalysisSummary';
import { FindingCard } from '../../components/legalReview/FindingCard';
import { ChatAssistant } from '../../components/legalReview/ChatAssistant';
import { createReviewDocumentFromViolation } from '../../lib/legalReviewIntegration';
import type { HygieneViolation } from '../../types/hygiene';

export const AILegalReviewAgent: React.FC = () => {
  const {
    selectedDocument,
    analysisResult,
    isAnalyzing,
    analyzeDocument,
    resetSession,
    loadExternalDocument,
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
              AI-assisted regulatory document review • Simulated analysis for demonstration
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
            This module uses deterministic mock analysis to demonstrate AI-powered legal document
            review capabilities. No external AI service is contacted. All regulatory rules are
            labelled as samples. Analysis results do not constitute real legal advice.
          </p>
        </div>
      </div>

      {/* Main Content: 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Panel: Document + Analysis + Findings */}
        <div className="lg:col-span-3 space-y-6">
          {/* Document Panel */}
          <DocumentPanel />

          {/* Analysis Summary (shown after analysis) */}
          {analysisResult && <AnalysisSummary result={analysisResult} />}

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

          {/* Analyzing State */}
          {isAnalyzing && (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-slate-200/90 shadow-subtle">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
              <p className="text-sm font-semibold text-slate-700">Analyzing Document…</p>
              <p className="text-xs text-slate-400 mt-1">
                Running simulated AI legal review analysis
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
