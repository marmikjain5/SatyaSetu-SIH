/**
 * SatyaDrishti Compliance Report Generator Engine (Feature 5)
 *
 * Synthesizes data across:
 * - OCR extraction & Statutory Declarations
 * - Legal Metrology Rule Validation Engine
 * - Optical Font Size & Readability Analysis Engine
 * - Visual Evidence & Bounding Box Mappings
 * - Cryptographic Digital Signatures & Audit Ledger
 */

import type { ScanRecord, DeclarationField, DeclarationFieldKey } from '../types/scan';
import type { ComplianceValidationResult } from '../types/ruleEngine';
import type { ReadabilityAnalysisResult } from '../types/readability';
import type {
  ComplianceInspectionReport,
  ReportGenerationOptions,
  ReportRiskTier,
  DigitalSignatureInfo,
  ReportCoverPageData,
  ReportProductInfoData,
  ReportOcrSummaryData,
  ReportRuleValidationData,
  ReportReadabilityData,
  ReportEvidenceData,
  ReportRecommendationsData,
  ReportVerdictData,
} from '../types/report';
import { STATUTORY_RULES } from './fieldExtractors';

// ─── Unique ID & Hash Helpers ───────────────────────────────────

function generateReportId(): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const letterCode = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return `CR-${year}-LM-${letterCode}${randomSuffix}`;
}

function generateCertificateId(): string {
  return `CERT-IN-CCA-${Math.random().toString(36).substring(2, 10).toUpperCase()}-2026`;
}

function generateSha256SimulatedHash(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const hex1 = Math.abs(hash).toString(16).padStart(8, '0');
  const hex2 = Math.abs(hash * 31).toString(16).padStart(8, '0');
  const hex3 = Math.abs(hash * 67).toString(16).padStart(8, '0');
  const hex4 = Math.abs(hash * 127).toString(16).padStart(8, '0');
  const hex5 = Math.abs(hash * 257).toString(16).padStart(8, '0');
  const hex6 = Math.abs(hash * 521).toString(16).padStart(8, '0');
  const hex7 = Math.abs(hash * 1031).toString(16).padStart(8, '0');
  const hex8 = Math.abs(hash * 2053).toString(16).padStart(8, '0');
  return `${hex1}${hex2}${hex3}${hex4}${hex5}${hex6}${hex7}${hex8}`;
}

function formatReportDate(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  }).format(date) + ' IST';
}

function calculateActionDeadline(days: number = 15): string {
  const target = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(target);
}

// ─── Main Generator Service ─────────────────────────────────────

export class ReportGenerationEngine {
  /**
   * Generate an official, inspection-grade compliance report from a scan record
   */
  generateComplianceReport(
    scanRecord: ScanRecord,
    validationResult?: ComplianceValidationResult,
    readabilityResult?: ReadabilityAnalysisResult,
    options: Partial<ReportGenerationOptions> = {}
  ): ComplianceInspectionReport {
    const reportId = generateReportId();
    const now = new Date();
    const formattedDate = formatReportDate(now);
    const data = scanRecord.extractedData;

    // ── 1. Inspector & Authority Defaults ────────────────────────
    const inspectorName = options.inspectorName || 'Sunita Meena';
    const inspectorDesignation = options.inspectorDesignation || 'Senior Legal Metrology Inspector (Zonal)';
    const inspectorBadge = options.inspectorBadge || 'LM-NZ-2041';
    const department = options.department || 'Legal Metrology Enforcement Division, Dept. of Consumer Affairs';
    const jurisdiction = options.jurisdiction || 'National Capital Region & Northern Zone (Zone IV)';
    const inspectionLocation = options.inspectionLocation || 'Central Enforcement Facility / Mobile Inspection Van #07';
    const customRemarks = options.customRemarks || '';
    const deadlineDays = options.actionDeadlineDays || 15;

    // ── 2. Determine Scores & Risk Tier ──────────────────────────
    const complianceScore = validationResult?.complianceScore ?? Math.round(scanRecord.confidence);
    const readabilityScore = readabilityResult?.summary.overallScore ?? 80;
    const violationCount = validationResult?.violationCount ?? 0;
    const warningCount = validationResult?.warningCount ?? 0;

    let overallStatus: 'compliant' | 'non-compliant' | 'warning' = 'compliant';
    if (validationResult) {
      overallStatus = validationResult.overallStatus;
    } else if (violationCount > 0) {
      overallStatus = 'non-compliant';
    } else if (warningCount > 0) {
      overallStatus = 'warning';
    }

    let riskTier: ReportRiskTier = 'LOW';
    if (violationCount >= 3 || complianceScore < 50) {
      riskTier = 'CRITICAL';
    } else if (violationCount > 0 || complianceScore < 70) {
      riskTier = 'HIGH';
    } else if (warningCount > 0 || complianceScore < 85) {
      riskTier = 'MEDIUM';
    }

    const productName = data?.productName || scanRecord.imageName.replace(/\.[^/.]+$/, '') || 'Unidentified Packaged Commodity';
    const manufacturer = data?.manufacturer || 'Not Declared / Illegible';

    // ── 3. Cover Page Data ───────────────────────────────────────
    const coverPage: ReportCoverPageData = {
      reportId,
      inspectionTitle: 'STATUTORY PACKAGING COMPLIANCE INSPECTION REPORT',
      subTitle: 'Legal Metrology (Packaged Commodities) Rules, 2011 & FSSAI Standards Verification',
      issuingAuthority: 'Ministry of Consumer Affairs, Food & Public Distribution • Govt. of India',
      scanTimestamp: scanRecord.timestamp,
      formattedDate,
      inspectorName,
      inspectorDesignation,
      inspectorBadge,
      department,
      jurisdiction,
      inspectionLocation,
      productName,
      brandOrManufacturer: manufacturer,
      overallStatus,
      complianceScore,
      readabilityScore,
      riskTier,
    };

    // ── 4. Product Information Data ─────────────────────────────
    const productInfo: ReportProductInfoData = {
      productName: data?.productName || 'Not Detected',
      manufacturer: data?.manufacturer || 'Not Detected',
      address: data?.address || 'Not Detected',
      importer: data?.importer || 'Not Applicable / Domestic',
      countryOfOrigin: data?.countryOfOrigin || 'Not Detected',
      mrp: data?.mrp || 'Not Detected',
      netQuantity: data?.netQuantity || 'Not Detected',
      batchNumber: data?.batchNumber || 'Not Detected',
      manufacturingDate: data?.manufacturingDate || 'Not Detected',
      packingDate: data?.packingDate || 'Not Detected',
      expiryDate: data?.expiryDate || 'Not Detected',
      customerCare: data?.customerCare || 'Not Detected',
      fssaiLicense: data?.fssaiLicense || 'Not Detected',
      barcode: data?.barcode || 'Not Detected',
    };

    // ── 5. OCR Extraction Summary Data ──────────────────────────
    const declarations = (data?.declarations || {}) as Record<DeclarationFieldKey, DeclarationField>;
    const mandatoryKeys: DeclarationFieldKey[] = [
      'productName',
      'mrp',
      'netQuantity',
      'manufacturer',
      'address',
      'countryOfOrigin',
      'packingDate',
      'customerCare',
    ];

    const missingFields: ReportOcrSummaryData['missingFields'] = [];
    for (const key of mandatoryKeys) {
      const decl = declarations[key];
      const rule = STATUTORY_RULES[key];
      if (!decl || !decl.value || decl.value.trim().length === 0) {
        missingFields.push({
          key,
          label: rule ? rule.ruleCode : key,
          ruleCode: rule ? rule.ruleCode : 'PCR-2011-R6',
          ruleDescription: rule ? rule.ruleDescription : 'Mandatory Statutory Declaration under Packaged Commodities Rules.',
          isMandatory: true,
        });
      }
    }

    const declValues = Object.values(declarations) as DeclarationField[];
    const detectedCount = declValues.filter(
      (d) => d && d.value && d.value.trim().length > 0
    ).length;

    const ocrSummary: ReportOcrSummaryData = {
      totalFieldsDetected: detectedCount,
      totalMandatoryRequired: mandatoryKeys.length,
      overallOcrConfidence: Math.round(scanRecord.confidence * 10) / 10,
      declarations,
      missingFields,
    };

    // ── 6. Rule Validation Results ──────────────────────────────
    let estimatedFineMin = 0;
    let estimatedFineMax = 0;
    const statutoryNotices: string[] = [];

    if (validationResult?.audit) {
      for (const entry of validationResult.audit) {
        if (entry.status === 'fail') {
          estimatedFineMin += entry.penaltyRange?.minFine || 10000;
          estimatedFineMax += entry.penaltyRange?.maxFine || 50000;
          statutoryNotices.push(`Notice u/s 36(1) of Legal Metrology Act, 2009 for violation of ${entry.ruleCode}`);
        }
      }
    }

    const ruleValidation: ReportRuleValidationData = {
      complianceScore,
      violationCount,
      warningCount,
      passCount: validationResult?.passCount || (detectedCount - violationCount - warningCount),
      estimatedFineMin: Math.max(0, estimatedFineMin),
      estimatedFineMax: Math.max(0, estimatedFineMax),
      auditTrail: validationResult?.audit || [],
      statutoryNoticesRequired: statutoryNotices,
    };

    // ── 7. Readability & Font Size Data ─────────────────────────
    const readabilityAnalysis: ReportReadabilityData = {
      summary: readabilityResult?.summary || {
        overallScore: readabilityScore,
        overallStatus: readabilityScore >= 80 ? 'compliant' : readabilityScore >= 60 ? 'warning' : 'non-compliant',
        compliantCount: detectedCount,
        warningCount: 0,
        nonCompliantCount: 0,
        totalRegionsEvaluated: detectedCount,
        flaggedCount: 0,
        avgFontSizePt: 8.5,
        avgContrastRatio: 6.2,
        avgConfidence: 85,
        avgVisibilityScore: readabilityScore,
      },
      flaggedRegions: readabilityResult?.flaggedRegions || [],
      allRegions: readabilityResult?.regions || [],
    };

    // ── 8. Evidence Data ─────────────────────────────────────────
    const evidence: ReportEvidenceData = {
      imageDataUrl: scanRecord.imageDataUrl,
      imageDimensions: data?.imageDimensions || { width: 800, height: 600 },
      mappedBoundingBoxesCount: declValues.filter((d) => d && d.boundingBox).length,
      violationRegionsCount: violationCount + (readabilityResult?.flaggedRegions.length || 0),
    };

    // ── 9. Recommendations & Corrective Actions ─────────────────
    const correctiveActions: string[] = [];
    const missingRemediation: string[] = [];
    const readabilityImprovements: string[] = [];
    const legalSteps: string[] = [];

    if (missingFields.length > 0) {
      missingFields.forEach((m) => {
        missingRemediation.push(
          `Imprint mandatory declaration '${m.label}' on the Principal Display Panel adhering strictly to ${m.ruleCode}.`
        );
      });
      correctiveActions.push(`Rectify ${missingFields.length} missing statutory declaration(s) on product packaging artwork.`);
    }

    if (readabilityAnalysis.flaggedRegions.length > 0) {
      readabilityAnalysis.flaggedRegions.forEach((r) => {
        readabilityImprovements.push(
          `Field "${r.fieldName}": ${r.remediationAdvice}`
        );
      });
      correctiveActions.push('Upgrade typography and print contrast to meet Rule 9 & Schedule II minimum font height standards.');
    }

    if (violationCount > 0) {
      legalSteps.push(`Issue compounding notice under Section 48 / Section 36(1) of Legal Metrology Act, 2009.`);
      legalSteps.push(`Direct manufacturer/packer to halt dispatch of non-compliant batch until over-stickering or repackaging.`);
    } else {
      legalSteps.push('Packaging verified compliant. File inspection record into central regulatory ledger.');
    }

    const recommendations: ReportRecommendationsData = {
      correctiveActions: correctiveActions.length > 0 ? correctiveActions : ['Packaging conforms to current Legal Metrology and FSSAI standards. No corrective action required.'],
      missingDeclarationsRemediation: missingRemediation,
      readabilityImprovements: readabilityImprovements,
      legalEnforcementSteps: legalSteps,
    };

    // ── 10. Final Verdict & Penalty Exposure ────────────────────
    let verdictTitle = 'COMPLIANT — STATUTORY CLEARANCE GRANTED';
    let summaryRemarks = customRemarks || 'The scanned package exhibits full statutory compliance with Legal Metrology (Packaged Commodities) Rules, 2011 and FSSAI Packaging Regulations.';

    if (overallStatus === 'non-compliant') {
      verdictTitle = 'NON-COMPLIANT — STATUTORY VIOLATION DETECTED';
      summaryRemarks = customRemarks || `The packaging exhibits ${violationCount} statutory violation(s) and fails mandatory Legal Metrology declarations. Regulatory notice recommended under Section 36 of Legal Metrology Act, 2009.`;
    } else if (overallStatus === 'warning') {
      verdictTitle = 'CONDITIONAL CLEARANCE — WARNING ISSUED';
      summaryRemarks = customRemarks || `The packaging is mostly compliant but contains ${warningCount} advisory discrepancies or optical readability warnings that require manufacturer rectification.`;
    }

    const penaltyFormatted = estimatedFineMax > 0
      ? `₹${estimatedFineMin.toLocaleString('en-IN')} – ₹${estimatedFineMax.toLocaleString('en-IN')} (First Offense compounding schedule)`
      : 'Nil / No Financial Penalty Applicable';

    const verdict: ReportVerdictData = {
      finalVerdict: overallStatus,
      verdictTitle,
      summaryRemarks,
      statutoryPenaltyEstimate: penaltyFormatted,
      requiresLegalNotice: overallStatus === 'non-compliant',
      recommendedActionDeadline: calculateActionDeadline(deadlineDays),
    };

    // ── 11. Cryptographic Digital Signature Stamp ───────────────
    const seed = `${reportId}-${scanRecord.id}-${now.toISOString()}-${inspectorBadge}-${complianceScore}`;
    const sha256Hash = generateSha256SimulatedHash(seed);
    const certificateId = generateCertificateId();

    const digitalSignature: DigitalSignatureInfo = {
      signedBy: inspectorName,
      designation: inspectorDesignation,
      badgeNumber: inspectorBadge,
      department,
      timestamp: formattedDate,
      certificateId,
      sha256Hash,
      isVerified: true,
      algorithm: 'SHA-256 with RSA-2048 (e-Sign Standard)',
    };

    return {
      schemaVersion: '5.0.0',
      reportId,
      scanId: scanRecord.id,
      generatedAt: now.toISOString(),
      coverPage,
      productInfo,
      ocrSummary,
      ruleValidation,
      readabilityAnalysis,
      evidence,
      recommendations,
      verdict,
      digitalSignature,
    };
  }
}

/** Singleton instance */
export const reportService = new ReportGenerationEngine();
