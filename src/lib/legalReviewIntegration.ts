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
  ViolationLegalAssessment,
  EvidenceSufficiency,
  FalseAccusationRisk,
  AIRecommendation,
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

/**
 * Generate a deterministic PRD-aligned legal assessment for a hygiene violation.
 *
 * This is SEPARATE from the existing finding-generation logic.
 * It produces the evidence sufficiency, false-accusation risk, legal reasoning,
 * and AI recommendation required by the PRD workflow.
 *
 * All legal references are clearly labelled as prototype / requiring verification.
 */
export function createViolationAssessment(
  violation: HygieneViolation,
  factoryName?: string
): ViolationLegalAssessment {
  const factory = factoryName || `Factory ${violation.factoryId}`;
  const hasEvidence = !!violation.evidence;

  // ── Evidence Sufficiency ──────────────────────────────────────────────
  let evidenceSufficiency: EvidenceSufficiency;
  let evidenceSufficiencyExplanation: string;

  if (hasEvidence && (violation.severity === 'critical' || violation.severity === 'high')) {
    evidenceSufficiency = 'sufficient';
    evidenceSufficiencyExplanation =
      `Evidence has been captured for this ${violation.severity}-severity violation at ${factory}. ` +
      `The evidence directly documents the observed condition in ${violation.zoneName}. ` +
      `Evidence appears sufficient to support the observed hygiene concern, subject to human verification.`;
  } else if (hasEvidence) {
    evidenceSufficiency = 'requires-verification';
    evidenceSufficiencyExplanation =
      `Evidence has been captured (${violation.evidence!.type}: "${violation.evidence!.title}"), ` +
      `but the ${violation.severity}-severity classification requires human review to confirm ` +
      `the evidence sufficiently supports the finding before proceeding.`;
  } else {
    evidenceSufficiency = 'insufficient';
    evidenceSufficiencyExplanation =
      `No photographic or documentary evidence is attached to this violation record. ` +
      `Evidence is insufficient to conclusively establish the alleged violation. ` +
      `Additional evidence collection is recommended before this finding can be substantiated.`;
  }

  // ── AI Confidence (computed first — used by false accusation risk) ───
  const baseConfidence =
    violation.severity === 'critical' ? 92
    : violation.severity === 'high' ? 85
    : violation.severity === 'medium' ? 78
    : 70;
  const evidenceBonus = hasEvidence ? 5 : -8;
  const aiConfidence = Math.min(99, Math.max(40, baseConfidence + evidenceBonus));

  // ── False Accusation Risk (derived from evidence + severity + confidence) ──
  let falseAccusationRisk: FalseAccusationRisk;
  let falseAccusationRiskExplanation: string;

  if (!hasEvidence || aiConfidence < 70) {
    // HIGH: no evidence at all, or confidence too low to substantiate
    falseAccusationRisk = 'high';
    falseAccusationRiskExplanation =
      !hasEvidence
        ? `Available evidence is insufficient to confidently establish the alleged violation. ` +
          `Publishing this finding without additional substantiation carries a significant risk ` +
          `of false accusation (AI confidence: ${aiConfidence}%). Human verification required.`
        : `AI confidence is below the safety threshold (${aiConfidence}%). Even though evidence ` +
          `has been captured, the low confidence level indicates a significant risk of false ` +
          `accusation. Additional verification and evidence are required.`;
  } else if (
    hasEvidence &&
    (violation.severity === 'critical' || violation.severity === 'high') &&
    aiConfidence >= 85
  ) {
    // LOW: strong evidence + high/critical severity + high confidence
    falseAccusationRisk = 'low';
    falseAccusationRiskExplanation =
      `Evidence directly supports the observed condition. The ${violation.parameter} reading of ` +
      `${violation.actualValue} exceeds the compliance threshold of ${violation.threshold} ` +
      `(AI confidence: ${aiConfidence}%). Human verification is still required before publication.`;
  } else {
    // MEDIUM: evidence exists but confidence is moderate, or severity is medium/low
    falseAccusationRisk = 'medium';
    falseAccusationRiskExplanation =
      `The evidence indicates a possible violation but additional verification is recommended. ` +
      `The observed ${violation.parameter} value should be confirmed through independent ` +
      `measurement or inspection (AI confidence: ${aiConfidence}%). ` +
      `Human verification is required before publication.`;
  }

  // ── AI Recommendation ─────────────────────────────────────────────────
  let aiRecommendation: AIRecommendation;
  if (evidenceSufficiency === 'sufficient' && falseAccusationRisk === 'low') {
    aiRecommendation = 'proceed-to-verification';
  } else if (evidenceSufficiency === 'insufficient' || falseAccusationRisk === 'high') {
    aiRecommendation = 'do-not-proceed';
  } else {
    aiRecommendation = 'request-additional-evidence';
  }

  // ── Legal Reasoning (prototype) ───────────────────────────────────────
  const applicableRule =
    `Prototype Rule Reference — Hygiene Compliance Standard for ${violation.parameter} (requires verification)`;

  const legalReasoning =
    `The ${violation.parameter.toLowerCase()} reading of ${violation.actualValue} in the ` +
    `${violation.zoneName} zone at ${factory} exceeds the compliance threshold of ` +
    `${violation.threshold}. ${violation.description} ` +
    `This assessment is a prototype demonstration. The applicable regulatory rule reference ` +
    `requires verification against actual legal provisions before any enforcement action.`;

  return {
    evidenceSufficiency,
    evidenceSufficiencyExplanation,
    falseAccusationRisk,
    falseAccusationRiskExplanation,
    applicableRule,
    legalReasoning,
    aiRecommendation,
    aiConfidence,
    humanVerificationStatus: 'pending',
    reviewerNotes: '',
    publicationStatus: 'not-ready',
  };
}
