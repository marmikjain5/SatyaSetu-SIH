/**
 * Scan Complaint Correlator & Statutory RAG Verification Engine
 *
 * 1. Takes OCR scan results and detected packaging label discrepancies.
 * 2. Queries SatyaDrishti Hybrid Regulatory RAG (`queryRegulatoryRAG`) to map each discrepancy to active Legal Metrology & statutory rules.
 * 3. Does NOT automatically raise complaints without user initiation.
 * 4. Provides explicit function `lodgeScanDiscrepancyComplaint` triggered when user clicks "Lodge Formal Complaint" in Product Scanner.
 */

import { queryRegulatoryRAG } from './ragKnowledgeService';
import { useComplianceStore } from '../store/complianceStore';
import type { ExtractedProductData } from '../types/scan';
import type { ComplianceValidationResult, RuleAuditEntry } from '../types/ruleEngine';
import type {
  Complaint,
  RegulatoryMappingResult,
  RegulatoryMappingItem,
  CaseCorrelationSummary,
  OfficerDecisionRecord,
  ComplaintCategoryCode,
  PlatformType,
  ScannerDiscrepancyItem,
} from '../types/compliance';

export interface RuleAuditEntryWithRAG extends RuleAuditEntry {
  ragMapping?: RegulatoryMappingItem;
}

export interface ScanCorrelationResult {
  scanId: string;
  productName: string;
  brand: string;
  auditWithRag: RuleAuditEntryWithRAG[];
  matchingUserComplaints: Complaint[];
  preparedComplaintForLodging: Complaint | null;
  summary: {
    totalDiscrepancies: number;
    matchingUserCount: number;
  };
}

/**
 * Maps scan discrepancies using Regulatory RAG and checks for matching user complaints.
 * Does NOT mutate complianceStore state automatically.
 */
export function processScanDiscrepanciesAndCorrelate(
  scanId: string,
  extractedData: ExtractedProductData,
  validationResult: ComplianceValidationResult,
  rawText: string
): ScanCorrelationResult {
  const { complaints } = useComplianceStore.getState();

  const productName = extractedData.productName || 'Scanned Package Product';
  const brand = extractedData.manufacturer || 'Unspecified Brand';

  // 1. Map all failed or warning discrepancies using Regulatory RAG
  const failedOrWarningAudit = validationResult.audit.filter(
    (a) => a.status === 'fail' || a.status === 'warning'
  );

  const auditWithRag: RuleAuditEntryWithRAG[] = validationResult.audit.map((entry) => {
    if (entry.status === 'pass' || entry.status === 'not-applicable') {
      return entry;
    }

    // Query RAG for this specific discrepancy
    const ragQueryText = `${productName} ${entry.ruleName} ${entry.ruleCode} ${entry.evidence} ${entry.section}`;
    const ragResult = queryRegulatoryRAG({
      queryText: ragQueryText,
      productCategory: 'all',
      evaluationDate: new Date().toISOString().split('T')[0],
    });

    const topChunk = ragResult.matchedChunks[0];

    let ragMapping: RegulatoryMappingItem | undefined = undefined;
    if (topChunk) {
      const activeRule = ragResult.activeRules.find((r) => r.code === topChunk.ruleCode);
      ragMapping = {
        ruleCode: topChunk.ruleCode,
        title: topChunk.title,
        authority: topChunk.authority,
        actName: topChunk.title,
        section: topChunk.section,
        officialGazetteRef: topChunk.officialGazetteRef,
        effectiveDate: topChunk.effectiveDate,
        activeVersion: activeRule ? activeRule.activeVersion : 1,
        verbatimClause: topChunk.verbatimClause || topChunk.content,
        penalties: topChunk.penalties || { minFine: entry.penaltyRange.minFine, maxFine: entry.penaltyRange.maxFine },
        relevanceScore: topChunk.relevanceScore,
      };
    }

    return {
      ...entry,
      ragMapping,
    };
  });

  // 2. Locate existing user complaints for this product (for reference)
  const matchingUserComplaints: Complaint[] = complaints.filter((existingComplaint) => {
    const isProductNameMatch =
      productName.toLowerCase().includes(existingComplaint.productName.toLowerCase()) ||
      existingComplaint.productName.toLowerCase().includes(productName.toLowerCase());

    const isBrandMatch =
      brand.toLowerCase().includes(existingComplaint.brand.toLowerCase()) ||
      existingComplaint.brand.toLowerCase().includes(brand.toLowerCase());

    const isTextMatch =
      rawText.toLowerCase().includes(existingComplaint.productName.toLowerCase()) ||
      rawText.toLowerCase().includes(existingComplaint.brand.toLowerCase());

    return isProductNameMatch || isBrandMatch || isTextMatch;
  });

  // 3. Prepare a single comprehensive complaint payload for the "Lodge Complaint" action button
  let preparedComplaintForLodging: Complaint | null = null;

  if (failedOrWarningAudit.length > 0) {
    const topDiscrepancy = auditWithRag.find((a) => a.ragMapping);
    const topRagMapping = topDiscrepancy?.ragMapping;

    const scannerDiscrepancies: ScannerDiscrepancyItem[] = failedOrWarningAudit.map((a) => {
      const entryWithRag = auditWithRag.find((r) => r.ruleId === a.ruleId);
      return {
        ruleCode: a.ruleCode,
        ruleName: a.ruleName,
        ruleDescription: a.ruleDescription,
        fieldKey: a.fieldKey,
        status: a.status,
        evidence: a.evidence,
        expectedStandard: a.expectedStandard,
        ragMapping: entryWithRag?.ragMapping,
      };
    });

    const ticketId = `NCH-GRV-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const matchedRules = auditWithRag
      .filter((a) => a.ragMapping)
      .map((a) => a.ragMapping!);

    preparedComplaintForLodging = {
      id: `CMP-SCAN-${Date.now()}`,
      ticketId,
      consumerName: 'Zonal Inspection Officer / Scanner Audit Engine',
      consumerEmail: 'officer-audit@satyadrishti.gov.in',
      consumerPhone: '+91 1800-METROLOGY',
      productName,
      brand,
      platform: 'Direct' as PlatformType,
      orderNumber: `SCAN-${Math.floor(100000 + Math.random() * 900000)}`,
      category: `Packaging Label Discrepancy Audit (${failedOrWarningAudit.length} non-compliances)`,
      categoryCode: mapRuleToCategoryCode(failedOrWarningAudit[0].ruleCode, failedOrWarningAudit[0].fieldKey),
      description: `Product scanner audit identified ${failedOrWarningAudit.length} statutory packaging non-compliance(s) on "${productName}": ${failedOrWarningAudit.map((f) => f.ruleName).join(', ')}. All discrepancies mapped via Regulatory RAG.`,
      evidenceUrls: [],
      extractedEvidenceSummary: {
        productName,
        brand,
        declaredMrp: extractedData.mrp,
        netQuantity: extractedData.netQuantity,
        manufacturer: extractedData.manufacturer,
        extractionConfidence: Math.round(extractedData.confidence * 100),
      },
      regulatoryMappingResult: {
        queryUsed: `${productName} Label Audit`,
        evaluationDate: new Date().toISOString().split('T')[0],
        matchedRules,
        provenanceSource: 'SatyaDrishti Hybrid Regulatory RAG & Rule Versioning System',
        legalFindingDeclared: false,
      },
      caseCorrelationSummary: {
        complainantAllegation: `Product scanner label audit identified ${failedOrWarningAudit.length} non-compliance(s).`,
        ocrEvidenceExtracted: `OCR verified packaging label. Detected discrepancies: ${failedOrWarningAudit.map((f) => f.ruleName).join('; ')}.`,
        regulatoryMappingSummary: `Mapped to ${matchedRules.length} statutory rule(s) via Regulatory RAG.`,
        verificationStatus: 'Accepted for Investigation',
      },
      officerDecisionHistory: [
        {
          id: `odr-lodge-${Date.now()}`,
          timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
          officerName: 'Inspection Officer',
          action: 'ACCEPT_INVESTIGATION',
          actionLabel: 'Grievance Docketed from Product Scanner',
          notes: `Formal grievance raised directly from OCR Product Scanner for ${failedOrWarningAudit.length} RAG-mapped label discrepancies.`,
        },
      ],
      assignedOfficer: 'Zonal Metrology Officer',
      status: 'Triaged',
      priority: failedOrWarningAudit.some((f) => f.severity === 'critical') ? 'Urgent' : 'High',
      submittedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      sentimentScore: 0.9,
      aiMatchedRule: topRagMapping ? `${topRagMapping.section} (${topRagMapping.ruleCode})` : 'Legal Metrology PCR Rules',
      needsReview: false,
      scannerDetectedDiscrepancies: scannerDiscrepancies,
    };
  }

  return {
    scanId,
    productName,
    brand,
    auditWithRag,
    matchingUserComplaints,
    preparedComplaintForLodging,
    summary: {
      totalDiscrepancies: failedOrWarningAudit.length,
      matchingUserCount: matchingUserComplaints.length,
    },
  };
}

/**
 * Manually lodge a complaint from scanner discrepancies when user clicks button in UI.
 */
export function lodgeScanDiscrepancyComplaint(preparedComplaint: Complaint): Complaint {
  const { addFullComplaint } = useComplianceStore.getState();
  addFullComplaint(preparedComplaint);
  return preparedComplaint;
}

/** Helper to map rule code / field key to complaint category code */
function mapRuleToCategoryCode(ruleCode: string, fieldKey: string): ComplaintCategoryCode {
  if (ruleCode.includes('R6(1)(e)') || fieldKey === 'mrp') return 'missing_mrp';
  if (ruleCode.includes('R18') || ruleCode.includes('Overcharge')) return 'price_above_mrp';
  if (ruleCode.includes('R6(1)(f)') || fieldKey === 'netQuantity') return 'missing_net_quantity';
  if (ruleCode.includes('R6(1)(a)') || fieldKey === 'manufacturer') return 'missing_manufacturer';
  if (ruleCode.includes('R6(1)(b)') || fieldKey === 'importer') return 'missing_importer';
  if (ruleCode.includes('R6(1)(h)') || fieldKey === 'customerCare') return 'missing_customer_care';
  return 'unreadable_declaration';
}
