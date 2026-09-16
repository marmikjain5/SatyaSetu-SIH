/**
 * AI Legal Review Agent — Zustand Store
 *
 * Follows the same pattern as hygieneStore.ts.
 * Completely isolated from other stores.
 */

import { create } from 'zustand';
import type {
  ReviewDocument,
  AIAnalysisResult,
  ReviewMessage,
  SourceViolationContext,
  ViolationLegalAssessment,
} from '../types/legalReview';
import type { HygieneViolation } from '../types/hygiene';
import {
  MOCK_LEGAL_DOCUMENTS,
  MOCK_ANALYSIS_RESULTS,
  generateMockResponse,
} from '../data/mockLegalReviewData';
import {
  createAnalysisForHygieneViolation,
  createViolationAssessment,
} from '../lib/legalReviewIntegration';

interface LegalReviewState {
  // Data
  documents: ReviewDocument[];
  selectedDocument: ReviewDocument | null;
  analysisResult: AIAnalysisResult | null;
  messages: ReviewMessage[];

  // PRD workflow state
  sourceViolation: SourceViolationContext | null;
  violationAssessment: ViolationLegalAssessment | null;

  // UI state
  isAnalyzing: boolean;
  expandedFindingId: string | null;

  // Actions
  selectDocument: (id: string) => void;
  analyzeDocument: () => void;
  addMessage: (text: string) => void;
  toggleFinding: (id: string) => void;
  markFindingReviewed: (findingId: string) => void;
  markFindingResolved: (findingId: string) => void;
  resetSession: () => void;
  loadExternalDocument: (document: ReviewDocument, sourceViolation?: HygieneViolation, factoryName?: string) => void;

  // PRD workflow actions
  verifyReview: () => void;
  rejectReview: () => void;
  approveForPublication: () => void;
  setReviewerNotes: (notes: string) => void;
}

let analyzeTimer: ReturnType<typeof setTimeout> | null = null;

// Track the source violation for hygiene-generated documents
let _pendingHygieneViolation: HygieneViolation | null = null;
let _pendingFactoryName: string | undefined = undefined;

export const useLegalReviewStore = create<LegalReviewState>((set, get) => ({
  // Initialize from mock data
  documents: MOCK_LEGAL_DOCUMENTS,
  selectedDocument: null,
  analysisResult: null,
  messages: [],

  // PRD workflow defaults
  sourceViolation: null,
  violationAssessment: null,

  // UI defaults
  isAnalyzing: false,
  expandedFindingId: null,

  // ── Actions ──────────────────────────────────────────────────────────────

  selectDocument: (id) => {
    const doc = get().documents.find((d) => d.id === id) || null;

    // Clear any pending analysis timer
    if (analyzeTimer) {
      clearTimeout(analyzeTimer);
      analyzeTimer = null;
    }

    // Clear hygiene violation context when switching to a sample document
    _pendingHygieneViolation = null;
    _pendingFactoryName = undefined;

    set({
      selectedDocument: doc,
      analysisResult: null,
      sourceViolation: null,
      violationAssessment: null,
      messages: doc
        ? [
            {
              id: `msg-sys-${Date.now()}`,
              role: 'system',
              message: `Document loaded: "${doc.title}". Click "Analyze Document" to start the AI legal review, or ask a question below.`,
              timestamp: new Date().toISOString(),
            },
          ]
        : [],
      isAnalyzing: false,
      expandedFindingId: null,
    });
  },

  analyzeDocument: () => {
    const { selectedDocument, isAnalyzing } = get();
    if (!selectedDocument || isAnalyzing) return;

    set({ isAnalyzing: true });

    // Simulated analysis delay (1.5s)
    analyzeTimer = setTimeout(() => {
      // Check pre-computed mock results first (existing sample documents)
      const preComputedResult = MOCK_ANALYSIS_RESULTS[selectedDocument.id];

      // For hygiene-generated documents, dynamically generate analysis
      const result: AIAnalysisResult | undefined = preComputedResult
        || (_pendingHygieneViolation
          ? createAnalysisForHygieneViolation(
              _pendingHygieneViolation,
              selectedDocument.id,
              _pendingFactoryName
            )
          : undefined);

      if (result) {
        // Deep-clone findings so each session has independent state
        const clonedResult: AIAnalysisResult = {
          ...result,
          findings: result.findings.map((f) => ({
            ...f,
            status: 'open',
            isExpanded: false,
          })),
          analyzedAt: new Date().toISOString(),
        };

        // Generate PRD-aligned legal assessment for hygiene violations
        const assessment = _pendingHygieneViolation
          ? createViolationAssessment(_pendingHygieneViolation, _pendingFactoryName)
          : null;

        set((state) => ({
          isAnalyzing: false,
          analysisResult: clonedResult,
          violationAssessment: assessment,
          messages: [
            ...state.messages,
            {
              id: `msg-sys-${Date.now()}`,
              role: 'system' as const,
              message: assessment
                ? `AI Legal Review complete. ${clonedResult.findings.length} finding(s) identified. Overall risk: ${clonedResult.overallRisk}. Evidence assessment: ${assessment.evidenceSufficiency}. False accusation risk: ${assessment.falseAccusationRisk}. Human verification is required before publication.`
                : `Analysis complete. ${clonedResult.findings.length} finding(s) identified. Overall risk: ${clonedResult.overallRisk}. You may now review each finding or ask questions.`,
              timestamp: new Date().toISOString(),
            },
          ],
        }));
      } else {
        set((state) => ({
          isAnalyzing: false,
          violationAssessment: null,
          messages: [
            ...state.messages,
            {
              id: `msg-sys-${Date.now()}`,
              role: 'system' as const,
              message: 'Analysis complete. No findings available for this document.',
              timestamp: new Date().toISOString(),
            },
          ],
        }));
      }

      analyzeTimer = null;
    }, 1500);
  },

  addMessage: (text) => {
    const { selectedDocument, analysisResult } = get();
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: ReviewMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      message: trimmed,
      timestamp: new Date().toISOString(),
    };

    // Generate deterministic response
    const docTitle = selectedDocument?.title || 'Unknown Document';
    const findings = analysisResult?.findings || [];
    const responseText = generateMockResponse(trimmed, docTitle, findings);

    const assistantMsg: ReviewMessage = {
      id: `msg-asst-${Date.now() + 1}`,
      role: 'assistant',
      message: responseText,
      timestamp: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, userMsg, assistantMsg],
    }));
  },

  toggleFinding: (id) => {
    set((state) => ({
      expandedFindingId: state.expandedFindingId === id ? null : id,
      analysisResult: state.analysisResult
        ? {
            ...state.analysisResult,
            findings: state.analysisResult.findings.map((f) =>
              f.id === id ? { ...f, isExpanded: !f.isExpanded } : f
            ),
          }
        : null,
    }));
  },

  markFindingReviewed: (findingId) => {
    set((state) => ({
      analysisResult: state.analysisResult
        ? {
            ...state.analysisResult,
            findings: state.analysisResult.findings.map((f) =>
              f.id === findingId ? { ...f, status: 'reviewed' } : f
            ),
          }
        : null,
    }));
  },

  markFindingResolved: (findingId) => {
    set((state) => ({
      analysisResult: state.analysisResult
        ? {
            ...state.analysisResult,
            findings: state.analysisResult.findings.map((f) =>
              f.id === findingId ? { ...f, status: 'resolved' } : f
            ),
          }
        : null,
    }));
  },

  resetSession: () => {
    if (analyzeTimer) {
      clearTimeout(analyzeTimer);
      analyzeTimer = null;
    }

    _pendingHygieneViolation = null;
    _pendingFactoryName = undefined;

    set({
      selectedDocument: null,
      analysisResult: null,
      sourceViolation: null,
      violationAssessment: null,
      messages: [],
      isAnalyzing: false,
      expandedFindingId: null,
    });
  },

  loadExternalDocument: (document, sourceViolation, factoryName) => {
    // Clear any pending analysis timer
    if (analyzeTimer) {
      clearTimeout(analyzeTimer);
      analyzeTimer = null;
    }

    // Store the source violation for analysis generation
    _pendingHygieneViolation = sourceViolation || null;
    _pendingFactoryName = factoryName;

    // Build SourceViolationContext for the UI
    const srcCtx: SourceViolationContext | null = sourceViolation
      ? {
          violationId: sourceViolation.id,
          factoryId: sourceViolation.factoryId,
          factoryName: factoryName || `Factory ${sourceViolation.factoryId}`,
          violationTitle: sourceViolation.title,
          zone: sourceViolation.zoneName,
          severity: sourceViolation.severity,
          description: sourceViolation.description,
          evidence: sourceViolation.evidence
            ? {
                type: sourceViolation.evidence.type,
                title: sourceViolation.evidence.title,
                description: sourceViolation.evidence.description,
                capturedAt: sourceViolation.evidence.capturedAt,
              }
            : undefined,
          status: sourceViolation.status,
          parameter: sourceViolation.parameter,
          actualValue: sourceViolation.actualValue,
          threshold: sourceViolation.threshold,
        }
      : null;

    set({
      selectedDocument: document,
      analysisResult: null,
      sourceViolation: srcCtx,
      violationAssessment: null,
      messages: [
        {
          id: `msg-sys-${Date.now()}`,
          role: 'system',
          message: `Document loaded from Factory Hygiene Monitoring: "${document.title}". This hygiene violation has been sent to the AI Legal Review module for analysis. Click "Analyze Document" to start the AI legal review.`,
          timestamp: new Date().toISOString(),
        },
      ],
      isAnalyzing: false,
      expandedFindingId: null,
    });
  },

  // ── PRD Workflow Actions ────────────────────────────────────────────────

  verifyReview: () => {
    set((state) => {
      if (!state.violationAssessment || state.violationAssessment.humanVerificationStatus !== 'pending') {
        return state;
      }
      return {
        violationAssessment: {
          ...state.violationAssessment,
          humanVerificationStatus: 'verified' as const,
          publicationStatus: 'not-ready' as const,
        },
      };
    });
  },

  rejectReview: () => {
    set((state) => {
      if (!state.violationAssessment || state.violationAssessment.humanVerificationStatus !== 'pending') {
        return state;
      }
      return {
        violationAssessment: {
          ...state.violationAssessment,
          humanVerificationStatus: 'rejected' as const,
          publicationStatus: 'not-ready' as const,
        },
      };
    });
  },

  approveForPublication: () => {
    set((state) => {
      // Guard: can only approve if human verification passed
      if (
        !state.violationAssessment ||
        state.violationAssessment.humanVerificationStatus !== 'verified' ||
        state.violationAssessment.publicationStatus !== 'not-ready'
      ) {
        return state;
      }
      return {
        violationAssessment: {
          ...state.violationAssessment,
          publicationStatus: 'approved' as const,
        },
      };
    });
  },

  setReviewerNotes: (notes) => {
    set((state) => {
      if (!state.violationAssessment) return state;
      return {
        violationAssessment: {
          ...state.violationAssessment,
          reviewerNotes: notes,
        },
      };
    });
  },
}));
