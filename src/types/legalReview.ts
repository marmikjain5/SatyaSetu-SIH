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
