/**
 * Legal Metrology Extraction Engine Types (PS 26034)
 *
 * Comprehensive data schema for Statutory Packaged Commodity Declarations under:
 * - Legal Metrology (Packaged Commodities) Rules, 2011 (as amended 2017 & 2021)
 * - Food Safety and Standards (Packaging and Labelling) Regulations, 2011
 * - Bureau of Indian Standards (BIS) & GS1 India Barcoding Framework
 *
 * Consumed by: Declaration Detection Engine, Rule Validation Engine, Font Size Analyzer,
 * Legal Notice Generator, and Risk Scoring Ledger.
 */

export type ScanStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'error';

export type ValidationStatus = 'compliant' | 'warning' | 'non-compliant' | 'missing';

export type DeclarationFieldCategory =
  | 'identity'
  | 'pricing'
  | 'quantity'
  | 'manufacturing'
  | 'traceability'
  | 'consumer_redressal'
  | 'statutory_license';

export type DeclarationFieldKey =
  | 'productName'
  | 'mrp'
  | 'unitSalePrice'
  | 'netQuantity'
  | 'manufacturer'
  | 'address'
  | 'importer'
  | 'countryOfOrigin'
  | 'packingDate'
  | 'manufacturingDate'
  | 'expiryDate'
  | 'batchNumber'
  | 'customerCare'
  | 'fssaiLicense'
  | 'barcode';

/** Bounding Box coordinates for evidence mapping */
export interface BoundingBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  normalized: {
    x: number; // percentage left (0-100)
    y: number; // percentage top (0-100)
    width: number; // percentage width (0-100)
    height: number; // percentage height (0-100)
  };
}

/** Complete statutory declaration field with validation & evidence mapping */
export interface DeclarationField {
  key: DeclarationFieldKey;
  label: string;
  value: string;
  rawValue: string;
  confidence: number; // 0–100%
  sourceText: string; // surrounding raw OCR snippet
  sourcePass: string; // preprocessed variant name e.g. "adaptive_threshold"
  boundingBox: BoundingBox | null;
  validationStatus: ValidationStatus;
  validationMessage: string;
  ruleCode: string; // Statutory Rule Mapping
  ruleDescription: string;
  isMandatory: boolean;
  category: DeclarationFieldCategory;
}

/** Per-field confidence scores (0–100) */
export type FieldConfidence = Record<DeclarationFieldKey, number>;

/** Metadata about a single OCR pass */
export interface OcrPassSummary {
  name: string;
  description: string;
  confidence: number;
  textLength: number;
}

/** Complete Structured Compliance Payload for Downstream Rule Engine */
export interface LegalMetrologyCompliancePayload {
  schemaVersion: '2.0.0';
  extractionTimestamp: string;
  engineVersion: 'SatyaDrishti-LM-Extraction-2.0';
  productMetadata: {
    imageName: string;
    imageDimensions: { width: number; height: number };
    overallConfidence: number;
    ocrPassesCount: number;
  };
  declarations: Record<DeclarationFieldKey, DeclarationField>;
  mandatorySummary: {
    totalMandatory: number;
    compliantCount: number;
    warningCount: number;
    nonCompliantCount: number;
    missingCount: number;
    compliancePercentage: number;
  };
  rawOcrText: string;
  ocrPassSummaries: OcrPassSummary[];
}

/** Structured extraction output from OCR processing */
export interface ExtractedProductData {
  // Legacy / Direct access fields for backward compatibility
  productName: string;
  mrp: string;
  unitSalePrice: string;
  netQuantity: string;
  manufacturer: string;
  address: string;
  importer: string;
  countryOfOrigin: string;
  packingDate: string;
  manufacturingDate: string;
  expiryDate: string;
  batchNumber: string;
  customerCare: string;
  fssaiLicense: string;
  barcode: string;
  rawText: string;
  confidence: number;

  // Rich Metadata & Evidence Mapping
  fieldConfidence: FieldConfidence;
  declarations: Record<DeclarationFieldKey, DeclarationField>;
  compliancePayload: LegalMetrologyCompliancePayload;
  imageDimensions: { width: number; height: number };
  ocrPassResults: OcrPassSummary[];
}

/** A single uploaded image pending or processed */
export interface UploadedImage {
  id: string;
  file: File;
  name: string;
  size: number;
  dataUrl: string;
  addedAt: number;
}

import type { ReadabilityAnalysisResult } from './readability';

/** A completed or in-progress scan record */
export interface ScanRecord {
  id: string;
  imageName: string;
  imageDataUrl: string;
  timestamp: string;
  status: ScanStatus;
  progress: number;
  confidence: number;
  extractedData: ExtractedProductData | null;
  readabilityResult?: ReadabilityAnalysisResult;
  errorMessage?: string;
}

/** OCR provider result (provider-agnostic) */
export interface OCRResult {
  rawText: string;
  confidence: number;
  extractedData: ExtractedProductData;
}

/** Progress callback signature */
export type OCRProgressCallback = (progress: number, status: string) => void;
