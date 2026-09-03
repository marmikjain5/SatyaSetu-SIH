/**
 * AI Legal Review Agent — Type Definitions
 *
 * Self-contained types for the Legal Review module.
 * Isolated from existing compliance/hygiene types.
 */

export type FindingSeverity = 'critical' | 'high' | 'medium' | 'low';

export type DocumentStatus =
  | 'pending'
  | 'analyzing'
  | 'reviewed'
  | 'flagged'
  | 'cleared';

export type FindingStatus = 'open' | 'reviewed' | 'resolved';

export type OverallRiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';

export type DocumentType =
  | 'Product Label'
  | 'Advertising Claim'
  | 'Compliance Notice'
  | 'Regulatory Filing'
  | 'Marketing Material';

export interface ReviewDocument {
  id: string;
  title: string;
  documentType: DocumentType;
  referenceNumber: string;
  issuer: string;
  date: string;
  status: DocumentStatus;
  content: string;
  /** Short abstract shown before full document expansion */
  summary: string;
}

export interface AIFinding {
  id: string;
  title: string;
  severity: FindingSeverity;
  confidence: number;
  matchedRule: string;
  evidence: string;
  explanation: string;
  recommendation: string;
  status: FindingStatus;
  isExpanded: boolean;
}

export interface AIAnalysisResult {
  id: string;
  documentId: string;
  overallRisk: OverallRiskLevel;
  findings: AIFinding[];
  averageConfidence: number;
  analyzedAt: string;
  status: 'complete' | 'error';
}

export interface ReviewMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  message: string;
  timestamp: string;
}

export interface LegalReviewSession {
  id: string;
  documentId: string;
  analysisResult: AIAnalysisResult | null;
  messages: ReviewMessage[];
  startedAt: string;
}

// ─── PRD Workflow Types (Violation → AI Review → Human Verification → Publication) ──

export type HumanVerificationStatus = 'pending' | 'verified' | 'rejected';

/** Final prototype state is 'approved' — no automatic publishing */
export type PublicationStatus = 'not-ready' | 'approved';

export type EvidenceSufficiency = 'sufficient' | 'insufficient' | 'requires-verification';

export type FalseAccusationRisk = 'low' | 'medium' | 'high';

export type AIRecommendation =
  | 'proceed-to-verification'
  | 'request-additional-evidence'
  | 'do-not-proceed';

/** Complete source violation context for the Legal Review page. */
export interface SourceViolationContext {
  violationId: string;
  factoryId: string;
  factoryName: string;
  violationTitle: string;
  zone: string;
  severity: string;
  description: string;
  evidence?: {
    type: string;
    title: string;
    description: string;
    capturedAt: string;
  };
  status: string;
  parameter: string;
  actualValue: string;
  threshold: string;
}

/**
 * Combined AI assessment output + workflow state for a violation-based review.
 * Created during AI analysis; updated during human verification and publication.
 */
export interface ViolationLegalAssessment {
  // AI analysis output
  evidenceSufficiency: EvidenceSufficiency;
  evidenceSufficiencyExplanation: string;
  falseAccusationRisk: FalseAccusationRisk;
  falseAccusationRiskExplanation: string;
  applicableRule: string;
  legalReasoning: string;
  aiRecommendation: AIRecommendation;
  aiConfidence: number;
  // Workflow state
  humanVerificationStatus: HumanVerificationStatus;
  reviewerNotes: string;
  publicationStatus: PublicationStatus;
}
