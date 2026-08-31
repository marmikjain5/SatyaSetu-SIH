/**
 * SatyaDrishti Compliance Inspection Report Types (Feature 5)
 *
 * Professional inspection-grade statutory report data schema under:
 * - Legal Metrology (Packaged Commodities) Rules, 2011 & Amendments
 * - Food Safety and Standards (Packaging and Labelling) Regulations, 2011
 * - Bureau of Indian Standards (BIS) & Consumer Protection Act, 2019
 */

import type { DeclarationField, DeclarationFieldKey } from './scan';
import type { RuleAuditEntry } from './ruleEngine';
import type { TextRegionReadability, ReadabilitySummary } from './readability';

export type ReportComplianceStatus = 'compliant' | 'non-compliant' | 'warning';
export type ReportRiskTier = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ReportFormat = 'pdf' | 'docx' | 'html' | 'json';

export interface DigitalSignatureInfo {
  signedBy: string;
  designation: string;
  badgeNumber: string;
  department: string;
  timestamp: string;
  certificateId: string;
  sha256Hash: string;
  isVerified: boolean;
  algorithm: 'SHA-256 with RSA-2048 (e-Sign Standard)';
}

export interface ReportCoverPageData {
  reportId: string;
  inspectionTitle: string;
  subTitle: string;
  issuingAuthority: string;
  scanTimestamp: string;
  formattedDate: string;
  inspectorName: string;
  inspectorDesignation: string;
  inspectorBadge: string;
  department: string;
  jurisdiction: string;
  inspectionLocation: string;
  productName: string;
  brandOrManufacturer: string;
  overallStatus: ReportComplianceStatus;
  complianceScore: number;
  readabilityScore: number;
  riskTier: ReportRiskTier;
}

export interface ReportProductInfoData {
  productName: string;
  manufacturer: string;
  address: string;
  importer: string;
  countryOfOrigin: string;
  mrp: string;
  netQuantity: string;
  batchNumber: string;
  manufacturingDate: string;
  packingDate: string;
  expiryDate: string;
  customerCare: string;
  fssaiLicense: string;
  barcode: string;
}

export interface ReportOcrSummaryData {
  totalFieldsDetected: number;
  totalMandatoryRequired: number;
  overallOcrConfidence: number;
  declarations: Record<DeclarationFieldKey, DeclarationField>;
  missingFields: Array<{
    key: DeclarationFieldKey;
    label: string;
    ruleCode: string;
    ruleDescription: string;
    isMandatory: boolean;
  }>;
}

export interface ReportRuleValidationData {
  complianceScore: number;
  violationCount: number;
  warningCount: number;
  passCount: number;
  estimatedFineMin: number;
  estimatedFineMax: number;
  auditTrail: RuleAuditEntry[];
  statutoryNoticesRequired: string[];
}

export interface ReportReadabilityData {
  summary: ReadabilitySummary;
  flaggedRegions: TextRegionReadability[];
  allRegions: TextRegionReadability[];
}

export interface ReportEvidenceData {
  imageDataUrl: string;
  imageDimensions: { width: number; height: number };
  mappedBoundingBoxesCount: number;
  violationRegionsCount: number;
}

export interface ReportRecommendationsData {
  correctiveActions: string[];
  missingDeclarationsRemediation: string[];
  readabilityImprovements: string[];
  legalEnforcementSteps: string[];
}

export interface ReportVerdictData {
  finalVerdict: ReportComplianceStatus;
  verdictTitle: string;
  summaryRemarks: string;
  statutoryPenaltyEstimate: string;
  requiresLegalNotice: boolean;
  recommendedActionDeadline: string;
}

/** Complete Inspection-Grade Compliance Report Model */
export interface ComplianceInspectionReport {
  schemaVersion: '5.0.0';
  reportId: string;
  scanId: string;
  generatedAt: string;
  coverPage: ReportCoverPageData;
  productInfo: ReportProductInfoData;
  ocrSummary: ReportOcrSummaryData;
  ruleValidation: ReportRuleValidationData;
  readabilityAnalysis: ReportReadabilityData;
  evidence: ReportEvidenceData;
  recommendations: ReportRecommendationsData;
  verdict: ReportVerdictData;
  digitalSignature: DigitalSignatureInfo;
}

export interface ReportGenerationOptions {
  inspectorName?: string;
  inspectorDesignation?: string;
  inspectorBadge?: string;
  department?: string;
  jurisdiction?: string;
  inspectionLocation?: string;
  customRemarks?: string;
  actionDeadlineDays?: number;
  applyDigitalSignature?: boolean;
}
