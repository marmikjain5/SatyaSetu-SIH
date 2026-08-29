/**
 * Legal Review Integration — Hygiene → Legal Review Adapter
 *
 * Converts HygieneViolation data into a ReviewDocument + deterministic
 * analysis results so the AI Legal Review module can review hygiene violations.
 *
 * This is the sole bridge between the two modules.
 * Both stores remain independent.
 */

import type { HygieneViolation } from '../types/hygiene';
import type {
  ReviewDocument,
  AIAnalysisResult,
  AIFinding,
  FindingSeverity,
} from '../types/legalReview';

/**
 * Convert a HygieneViolation into a ReviewDocument suitable for the
 * AI Legal Review module.
 */
export function createReviewDocumentFromViolation(
  violation: HygieneViolation,
  factoryName?: string
): ReviewDocument {
  const factory = factoryName || `Factory ${violation.factoryId}`;
  const evidenceBlock = violation.evidence
    ? `
Evidence:
  Type: ${violation.evidence.type}
  Title: ${violation.evidence.title}
  Description: ${violation.evidence.description}
  Captured: ${violation.evidence.capturedAt}`
    : '\nEvidence:\n  No photographic/documentary evidence attached.';

  const content = `HYGIENE VIOLATION — AI LEGAL REVIEW CONTEXT

[SAMPLE / PROTOTYPE — Generated from Factory Hygiene Monitoring module for AI review demonstration]

═══ VIOLATION DETAILS ═══

Title: ${violation.title}
Violation ID: ${violation.id}
Status: ${violation.status.toUpperCase()}
Severity: ${violation.severity.toUpperCase()}
Detected: ${violation.detectedAt}

═══ FACILITY & LOCATION ═══

Factory: ${factory}
Factory ID: ${violation.factoryId}
Zone: ${violation.zoneName}
Zone ID: ${violation.zoneId}
Monitored Parameter: ${violation.parameter}

═══ NON-COMPLIANCE DATA ═══

Actual Value: ${violation.actualValue}
Compliance Threshold: ${violation.threshold}

Description:
${violation.description}

═══ RECOMMENDED ACTION ═══

${violation.recommendation}

═══ EVIDENCE ═══
${evidenceBlock}

═══ DISCLAIMER ═══

This document was automatically generated from a hygiene monitoring violation record.
It is intended for prototype AI legal review demonstration only.
No real regulatory authority has been contacted.
Sample regulatory rules are used for analysis.

[END OF GENERATED DOCUMENT]`;

  return {
    id: `hygiene-${violation.id}`,
    title: `Hygiene Violation — ${violation.title}`,
    documentType: 'Compliance Notice',
    referenceNumber: `HYG/${violation.id.toUpperCase()}`,
    issuer: factory,
    date: violation.detectedAt,
    status: 'flagged',
    summary: `Hygiene violation "${violation.title}" detected in ${violation.zoneName} at ${factory}. Parameter: ${violation.parameter}. Actual value: ${violation.actualValue} (Threshold: ${violation.threshold}). Severity: ${violation.severity}. Sent from Factory Hygiene Monitoring for AI legal review.`,
    content,
  };
}

/**
 * Generate a deterministic mock analysis result for a hygiene violation
 * review document, based on the violation's actual data.
 */
export function createAnalysisForHygieneViolation(
  violation: HygieneViolation,
  documentId: string,
  factoryName?: string
): AIAnalysisResult {
  const factory = factoryName || `Factory ${violation.factoryId}`;
  const findings: AIFinding[] = [];

  // ── Finding 1: Primary threshold exceedance (always present) ──
  const primarySeverity: FindingSeverity = violation.severity;
  const primaryConfidence = primarySeverity === 'critical' ? 95
    : primarySeverity === 'high' ? 89
    : primarySeverity === 'medium' ? 82
    : 75;

  findings.push({
    id: `hf-${violation.id}-1`,
    title: `${violation.parameter} Threshold Exceedance — ${violation.zoneName}`,
    severity: primarySeverity,
    confidence: primaryConfidence,
    matchedRule: 'Sample Regulatory Rule — Hygiene Threshold Compliance',
    evidence: `Actual Value: ${violation.actualValue} | Compliance Threshold: ${violation.threshold}`,
    explanation: `The ${violation.parameter.toLowerCase()} reading of ${violation.actualValue} in the ${violation.zoneName} zone at ${factory} exceeds the compliance threshold of ${violation.threshold}. ${violation.description}`,
    recommendation: violation.recommendation,
    status: 'open',
    isExpanded: false,
  });

  // ── Finding 2: Facility compliance gap (for critical/high) ──
  if (primarySeverity === 'critical' || primarySeverity === 'high') {
    findings.push({
      id: `hf-${violation.id}-2`,
      title: 'Facility Compliance Documentation Gap',
      severity: 'medium' as FindingSeverity,
      confidence: 84,
      matchedRule: 'Sample Regulatory Rule — Compliance Record-Keeping',
      evidence: `Violation ID: ${violation.id} | Zone: ${violation.zoneName} | Status: ${violation.status}`,
      explanation: `A ${violation.severity}-severity hygiene violation has been detected but remains in "${violation.status}" status. Regulatory frameworks typically require documented corrective action plans within a defined timeframe for violations of this severity.`,
      recommendation: 'Document the corrective action plan with timeline, responsible personnel, and verification procedures. Maintain records for audit trail compliance.',
      status: 'open',
      isExpanded: false,
    });
  }

  // ── Finding 3: Evidence documentation (if evidence exists) ──
  if (violation.evidence) {
    findings.push({
      id: `hf-${violation.id}-3`,
      title: 'Evidence Documentation Assessment',
      severity: 'low' as FindingSeverity,
      confidence: 78,
      matchedRule: 'Sample Regulatory Rule — Evidence & Documentation Standards',
      evidence: `Evidence Type: ${violation.evidence.type} | Title: ${violation.evidence.title} | Captured: ${violation.evidence.capturedAt}`,
      explanation: `Evidence has been captured (${violation.evidence.type}: "${violation.evidence.title}"). While documentation exists, a comprehensive evidence package for regulatory review should include timestamped records, calibration certificates for monitoring equipment, and chain-of-custody documentation.`,
      recommendation: 'Ensure evidence package is complete with equipment calibration records and witness documentation before formal regulatory submission.',
      status: 'open',
      isExpanded: false,
    });
  }

  // Compute overall risk and confidence
  const overallRisk = findings.some((f) => f.severity === 'critical') ? 'CRITICAL' as const
    : findings.some((f) => f.severity === 'high') ? 'HIGH' as const
    : findings.some((f) => f.severity === 'medium') ? 'MEDIUM' as const
    : 'LOW' as const;

  const avgConfidence = Math.round(
    findings.reduce((sum, f) => sum + f.confidence, 0) / findings.length
  );

  return {
    id: `analysis-hygiene-${violation.id}`,
    documentId,
    overallRisk,
    findings,
    averageConfidence: avgConfidence,
    analyzedAt: new Date().toISOString(),
    status: 'complete',
  };
}
