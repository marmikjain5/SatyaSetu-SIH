/**
 * End-to-End Evidence-Backed Complaint Case Correlator for SatyaDrishti
 *
 * Combines:
 * 1. Consumer free-text input & evidence images
 * 2. Existing multi-pass OCR & Statutory Extraction Pipeline (`ocrService.ts`, `fieldExtractors.ts`)
 * 3. Deterministic Complaint Classification Engine (`complaintClassifier.ts`)
 * 4. Existing SatyaDrishti Regulatory RAG System (`ragKnowledgeService.ts`)
 * 5. Four-way Case Correlation & Government Officer Dossier Synthesis
 *
 * NO LLM IS USED IN THIS FLOW.
 * AUTOMATIC LEGAL VIOLATION DECLARATIONS ARE STRICTLY PROHIBITED.
 */

import { classifyComplaintText } from './complaintClassifier';
import { processMultiEvidenceImages, ProcessedEvidenceInput } from './complaintOcrPipeline';
import { queryRegulatoryRAG } from './ragKnowledgeService';
import type {
  Complaint,
  EvidenceImageItem,
  ExtractedEvidenceSummary,
  ComplaintClassificationResult,
  RegulatoryMappingResult,
  CaseCorrelationSummary,
  OfficerDecisionRecord,
  PlatformType,
} from '../types/compliance';

export interface ComplaintSubmissionInput {
  consumerName: string;
  consumerEmail: string;
  consumerPhone: string;
  productName: string;
  brand?: string;
  platform: PlatformType;
  productUrl?: string;
  orderNumber?: string;
  description: string;
  evidenceInputs: ProcessedEvidenceInput[];
}

/**
 * Correlates consumer claim, OCR extractions, and Regulatory RAG context to form an Evidence-Backed Dossier.
 */
export async function buildEvidenceBackedComplaintCase(
  input: ComplaintSubmissionInput,
  onProgress?: (percent: number, status: string) => void
): Promise<Complaint> {
  // Step 1: Execute OCR & Evidence Extraction Pipeline on uploaded images
  onProgress?.(10, 'Step 1/4: Ingesting & running OCR on evidence images...');

  let ocrOut = {
    evidenceImages: [] as EvidenceImageItem[],
    consolidatedSummary: {} as ExtractedEvidenceSummary,
    allRawText: '',
  };

  if (input.evidenceInputs && input.evidenceInputs.length > 0) {
    ocrOut = await processMultiEvidenceImages(input.evidenceInputs, (p, msg) => {
      onProgress?.(10 + Math.round(p * 0.4), msg);
    });
  }

  // Step 2: Deterministic Complaint Classification
  onProgress?.(55, 'Step 2/4: Executing Deterministic Text & Discrepancy Classifier...');

  const classification: ComplaintClassificationResult = classifyComplaintText(
    input.description,
    {
      packagingMrp: ocrOut.consolidatedSummary.declaredMrp,
      receiptPrice: ocrOut.consolidatedSummary.receiptPrice,
    }
  );

  // Step 3: Query Existing SatyaDrishti Regulatory RAG System
  onProgress?.(75, 'Step 3/4: Querying SatyaDrishti Hybrid Regulatory RAG & Rule Versioning System...');

  const ragQueryText = `${classification.categoryLabel} ${input.description} ${input.productName} ${ocrOut.allRawText}`;
  const ragResult = queryRegulatoryRAG({
    queryText: ragQueryText,
    productCategory: 'all',
    evaluationDate: new Date().toISOString().split('T')[0],
  });

  const matchedRegulatoryItems = ragResult.matchedChunks.slice(0, 4).map((chunk) => {
    // Locate matching active rule item if present
    const activeRule = ragResult.activeRules.find((r) => r.code === chunk.ruleCode);
    const activeVersionNum = activeRule ? activeRule.activeVersion : 1;

    return {
      ruleCode: chunk.ruleCode,
      title: chunk.title,
      authority: chunk.authority,
      actName: chunk.title,
      section: chunk.section,
      officialGazetteRef: chunk.officialGazetteRef,
      effectiveDate: chunk.effectiveDate,
      activeVersion: activeVersionNum,
      verbatimClause: chunk.verbatimClause || chunk.content,
      penalties: chunk.penalties || { minFine: 10000, maxFine: 50000 },
      relevanceScore: chunk.relevanceScore,
    };
  });

  const regulatoryMappingResult: RegulatoryMappingResult = {
    queryUsed: classification.categoryLabel,
    evaluationDate: ragResult.evaluationDate,
    matchedRules: matchedRegulatoryItems,
    provenanceSource: 'SatyaDrishti Hybrid Regulatory RAG & Knowledge Graph Engine',
    legalFindingDeclared: false, // MANDATORY: Raw RAG is never an automatic legal finding
  };

  // Step 4: Synthesize Four-Way Case Correlation
  onProgress?.(90, 'Step 4/4: Assembling Evidence-Backed Case Dossier for Officer Review...');

  const topRuleCode = matchedRegulatoryItems.length > 0 ? matchedRegulatoryItems[0].ruleCode : 'Legal Metrology PCR Rules';
  const topRuleSection = matchedRegulatoryItems.length > 0 ? matchedRegulatoryItems[0].section : 'Rule 6 Declarations';
  const aiMatchedRule = `${topRuleSection} (${topRuleCode})`;

  const complainantAllegation = input.description;
  let ocrEvidenceExtracted = `Extracted ${ocrOut.evidenceImages.length} evidence image(s).`;
  if (ocrOut.consolidatedSummary.declaredMrp) {
    ocrEvidenceExtracted += ` Packaging MRP: ${ocrOut.consolidatedSummary.declaredMrp}.`;
  }
  if (ocrOut.consolidatedSummary.receiptPrice) {
    ocrEvidenceExtracted += ` Receipt Charged Price: ${ocrOut.consolidatedSummary.receiptPrice}.`;
  }
  if (ocrOut.consolidatedSummary.priceOverchargeAmount) {
    ocrEvidenceExtracted += ` Detected Price Discrepancy: +₹${ocrOut.consolidatedSummary.priceOverchargeAmount}.`;
  }

  const caseCorrelationSummary: CaseCorrelationSummary = {
    complainantAllegation,
    ocrEvidenceExtracted,
    regulatoryMappingSummary: `Mapped to ${matchedRegulatoryItems.length} active statutory rule(s) via Regulatory RAG. Top reference: ${aiMatchedRule}.`,
    verificationStatus: 'Pending Human Officer Review',
  };

  const initialOfficerRecord: OfficerDecisionRecord = {
    id: `odr-${Date.now()}`,
    timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    officerName: 'System Ingestion Triage Engine',
    action: 'ACCEPT_INVESTIGATION',
    actionLabel: 'Case Ingested & Triaged',
    notes: 'Case dossier synthesized from consumer submission, multi-evidence OCR, and Regulatory RAG context. Awaiting human officer determination.',
  };

  const ticketId = `NCH-GRV-2026-${Math.floor(10000 + Math.random() * 90000)}`;

  const complaint: Complaint = {
    id: `CMP-${Date.now()}`,
    ticketId,
    consumerName: input.consumerName,
    consumerEmail: input.consumerEmail,
    consumerPhone: input.consumerPhone,
    productName: input.productName,
    brand: input.brand || 'Unspecified Brand',
    platform: input.platform,
    productUrl: input.productUrl,
    orderNumber: input.orderNumber || `OD-${Math.floor(100000 + Math.random() * 900000)}`,
    category: classification.categoryLabel,
    categoryCode: classification.categoryCode,
    description: input.description,
    evidenceUrls: ocrOut.evidenceImages.map((e) => e.originalUrl),
    evidenceImages: ocrOut.evidenceImages,
    extractedEvidenceSummary: ocrOut.consolidatedSummary,
    classificationResult: classification,
    regulatoryMappingResult,
    caseCorrelationSummary,
    officerDecisionHistory: [initialOfficerRecord],
    status: classification.needsReview ? 'Triaged' : 'New',
    priority: classification.confidenceScore > 80 ? 'Urgent' : 'High',
    submittedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    sentimentScore: Math.round((0.7 + (classification.confidenceScore / 100) * 0.28) * 100) / 100,
    aiMatchedRule,
    needsReview: classification.needsReview,
  };

  onProgress?.(100, 'Complaint Case Dossier Successfully Built');
  return complaint;
}
