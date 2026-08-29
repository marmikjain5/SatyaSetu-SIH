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
}

let analyzeTimer: ReturnType<typeof setTimeout> | null = null;

export const useLegalReviewStore = create<LegalReviewState>((set, get) => ({
  // Initialize from mock data
  documents: MOCK_LEGAL_DOCUMENTS,
  selectedDocument: null,
  analysisResult: null,
  messages: [],

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
      const result = MOCK_ANALYSIS_RESULTS[selectedDocument.id];

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
              role: 'system' as const,
              message: `Analysis complete. ${clonedResult.findings.length} finding(s) identified. Overall risk: ${clonedResult.overallRisk}. You may now review each finding or ask questions.`,
              timestamp: new Date().toISOString(),
            },
          ],
        }));
      } else {
        set((state) => ({
          isAnalyzing: false,
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

    set({
      selectedDocument: null,
      analysisResult: null,
      messages: [],
      isAnalyzing: false,
      expandedFindingId: null,
    });
  },
}));
