/**
 * AI Legal Review Agent — Zustand Store
 *
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
import {
  MOCK_LEGAL_DOCUMENTS,
  MOCK_ANALYSIS_RESULTS,
  generateMockResponse,
} from '../data/mockLegalReviewData';

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
  loadExternalDocument: (document: ReviewDocument, sourceContext?: SourceViolationContext) => void;

  // PRD workflow actions
  verifyReview: () => void;
  rejectReview: () => void;
  approveForPublication: () => void;
  setReviewerNotes: (notes: string) => void;
}

let analyzeTimer: ReturnType<typeof setTimeout> | null = null;

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

      const result: AIAnalysisResult | undefined = preComputedResult;

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

        set((state) => ({
          isAnalyzing: false,
          analysisResult: clonedResult,
          messages: [
            ...state.messages,
            {
              id: `msg-sys-${Date.now()}`,
              role: 'system',
              message: `AI analysis complete for "${selectedDocument.title}". Found ${clonedResult.findings.length} findings. Overall Risk: ${clonedResult.overallRisk}. Average Confidence: ${(clonedResult.averageConfidence * 100).toFixed(0)}%.`,
              timestamp: new Date().toISOString(),
            },
          ],
        }));
      } else {
        // Fallback generic analysis result for ad-hoc documents
        const fallbackResult: AIAnalysisResult = {
          id: `res-${selectedDocument.id}`,
          documentId: selectedDocument.id,
          overallRisk: 'MEDIUM',
          averageConfidence: 0.88,
          analyzedAt: new Date().toISOString(),
          status: 'complete',
          findings: [
            {
              id: `fnd-${Date.now()}-1`,
              title: 'Mandatory Declaration Compliance Verification',
              severity: 'medium',
              confidence: 0.91,
              matchedRule: 'Legal Metrology (Packaged Commodities) Rules, 2011 — Rule 6',
              evidence: selectedDocument.summary,
              explanation: 'Document has been verified against statutory labeling guidelines. Clarifications on declarations may be required.',
              recommendation: 'Verify physical samples and confirm statutory declarations against batch records.',
              status: 'open',
              isExpanded: false,
            },
          ],
        };

        set((state) => ({
          isAnalyzing: false,
          analysisResult: fallbackResult,
          messages: [
            ...state.messages,
            {
              id: `msg-sys-${Date.now()}`,
              role: 'system',
              message: `AI analysis complete for "${selectedDocument.title}". Found 1 finding. Overall Risk: MEDIUM. Average Confidence: 88%.`,
              timestamp: new Date().toISOString(),
            },
          ],
        }));
      }
    }, 1500);
  },

  addMessage: (text) => {
    const userMsg: ReviewMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      message: text,
      timestamp: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, userMsg],
    }));

    // Simulated AI response delay (800ms)
    setTimeout(() => {
      const { selectedDocument, analysisResult } = get();
      const docTitle = selectedDocument ? selectedDocument.title : 'Selected Document';
      const findings = analysisResult ? analysisResult.findings : [];
      const responseText = generateMockResponse(
        text,
        docTitle,
        findings
      );

      const aiMsg: ReviewMessage = {
        id: `msg-ai-${Date.now()}`,
        role: 'assistant',
        message: responseText,
        timestamp: new Date().toISOString(),
      };

      set((state) => ({
        messages: [...state.messages, aiMsg],
      }));
    }, 800);
  },

  toggleFinding: (id) => {
    set((state) => {
      if (!state.analysisResult) return state;

      const isCurrentlyExpanded = state.expandedFindingId === id;
      const newExpandedId = isCurrentlyExpanded ? null : id;

      return {
        expandedFindingId: newExpandedId,
        analysisResult: {
          ...state.analysisResult,
          findings: state.analysisResult.findings.map((f) => ({
            ...f,
            isExpanded: f.id === id ? !isCurrentlyExpanded : f.isExpanded,
          })),
        },
      };
    });
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

  loadExternalDocument: (document, sourceContext) => {
    if (analyzeTimer) {
      clearTimeout(analyzeTimer);
      analyzeTimer = null;
    }

    set({
      selectedDocument: document,
      analysisResult: null,
      sourceViolation: sourceContext || null,
      violationAssessment: null,
      messages: [
        {
          id: `msg-sys-${Date.now()}`,
          role: 'system',
          message: `Document loaded: "${document.title}". Click "Analyze Document" to start the AI legal review.`,
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
