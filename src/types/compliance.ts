export type ViolationSeverity = 'critical' | 'high' | 'medium' | 'low';
export type ComplianceStatus = 'compliant' | 'non-compliant' | 'under-review' | 'notice-issued';
export type PlatformType =
  | 'Amazon'
  | 'Amazon India / Own Website'
  | 'Flipkart'
  | 'Blinkit'
  | 'Zepto'
  | 'Meesho'
  | 'Nykaa'
  | 'Direct'
  | 'Retail Trade (Kerala)'
  | 'Retail (Karnataka)'
  | 'Retail & Wholesale (Karnataka)'
  | 'Pan-India Retail & E-Commerce'
  | 'Pan-India Retail & Pharmacy'
  | 'E-Commerce Dark Store (Bengaluru)'
  | 'Amazon / BigBasket / Offline Retail'
  | string; // Allow any future platform string

export interface Product {
  id: string;
  sku: string;
  title: string;
  brand: string;
  manufacturer: string;
  category: string;
  platform: PlatformType;
  productUrl: string;
  imageUrl: string;
  mrp: number;
  listedPrice: number;
  netWeight: string;
  mfgDate: string;
  expiryDate?: string;
  countryOfOrigin: string;
  customerCareContact: string;
  customerCarePhone?: string;
  customerCareEmail?: string;
  fssaiLicenseNumber?: string;
  manufacturerAddress?: string;
  packerAddress?: string;
  unitSalePrice?: string;
  dietaryType?: 'Vegetarian' | 'Non-Vegetarian' | 'Non-Food / General';
  allergenInfo?: string[];
  ingredientsList?: string[];
  nutritionalInfo?: {
    servingSize?: string;
    perUnit?: string;
    energyKcal: number | string;
    protein: string;
    totalFat: string;
    saturatedFat?: string;
    transFat?: string;
    carbohydrates: string;
    totalSugars: string;
    addedSugars: string;
    sodium: string;
    dietaryFiber?: string;
  };
  complianceScore: number; // 0 - 100
  status: ComplianceStatus;
  violationsCount: number;
  ocrConfidence: number;
  lastScanned: string;
  missingMandatoryFields: string[];
  claims: {
    text: string;
    isMisleading: boolean;
    reason?: string;
    confidence: number;
  }[];
  regulatoryActs: string[];
}

export interface Violation {
  id: string;
  caseNumber: string;
  productId: string;
  productName: string;
  brand: string;
  manufacturer: string;
  platform: PlatformType;
  ruleCode: string;
  actName: string;
  section: string;
  description: string;
  severity: ViolationSeverity;
  status: 'Open' | 'Notice Issued' | 'Hearing Scheduled' | 'Resolved' | 'Escalated';
  detectedAt: string;
  evidence: {
    type:
      | 'OCR Label'
      | 'Pricing Disparity'
      | 'Prohibited Claim'
      | 'Origin Obfuscation'
      | 'Weight Discrepancy'
      | 'Weight Verification'
      | 'Label Claim Review'
      | 'Factory Inspection + OCR Measurement'
      | 'Criminal Investigation Evidence'
      | 'Regulatory Inspection + Lab Analysis'
      | 'NABL Lab Report + Import Records'
      | 'Lab Analysis + OCR Label Audit'
      | 'Regulatory Advisory + Court Record'
      | string; // Allow future evidence types
    extractedValue: string;
    expectedStandard: string;
    snippetUrl?: string;
  };
  penaltyEstimate: number;
  assignedOfficer: string;
  noticeId?: string;
  customerCareEmail?: string;
  /** The brand/marketer that sold or advertised the product (may differ from manufacturer) */
  marketedBy?: string;
}

export interface Manufacturer {
  id: string;
  name: string;
  cin: string;
  gstin: string;
  registeredAddress: string;
  riskScore: number; // 0 - 100
  riskTier: 'Critical' | 'High' | 'Moderate' | 'Low';
  totalProductsScanned: number;
  activeViolations: number;
  repeatOffenderFlag: boolean;
  noticesIssued: number;
  brands: string[];
  primaryCategory: string;
  topOffenseTypes: string[];
  lastAuditDate: string;
  // Geo-spatial fields for satellite map
  coordinates: { lat: number; lng: number };
  facilityType: 'Processing & Packaging Plant' | 'E-Commerce Fulfillment Hub' | 'Import Warehouse' | 'Registered Headquarters' | 'R&D & Manufacturing Campus';
  zone: string;
  fssaiLicenseNo?: string;
}

/** Shop/store location captured via Google Maps Places Autocomplete */
export interface ShopLocation {
  name: string;          // e.g. "D-Mart, Andheri West"
  address: string;       // full human-readable address
  coordinates: { lat: number; lng: number };
  googleMapsUrl: string; // https://maps.google.com/?q=...
  placeId?: string;      // Google Place ID (when real API is used)
}

/** Standardized Complaint Categories for Deterministic Classification */
export type ComplaintCategoryCode =
  | 'missing_mrp'
  | 'price_above_mrp'
  | 'mrp_discrepancy'
  | 'missing_net_quantity'
  | 'quantity_discrepancy'
  | 'missing_manufacturer'
  | 'missing_importer'
  | 'missing_customer_care'
  | 'unreadable_declaration'
  | 'misleading_claim'
  | 'product_identity_concern'
  | 'general_packaging_issue'
  | 'other_unclear';

export type EvidenceTag =
  | 'Product Packaging'
  | 'Product Label / PDP'
  | 'Receipt / Invoice'
  | 'E-Commerce Screenshot'
  | 'General Evidence';

export interface EvidenceImageItem {
  id: string;
  originalUrl: string;
  annotatedUrl?: string;
  fileName: string;
  tag: EvidenceTag;
  uploadedAt: string;
  ocrConfidence: number;
  extractedRawText: string;
  detectedBBoxesCount: number;
}

export interface ExtractedEvidenceSummary {
  productName?: string;
  brand?: string;
  declaredMrp?: string;
  receiptPrice?: string;
  netQuantity?: string;
  actualQuantity?: string;
  manufacturer?: string;
  importer?: string;
  customerCare?: string;
  packingDate?: string;
  expiryDate?: string;
  batchNumber?: string;
  fssaiLicense?: string;
  barcode?: string;
  priceOverchargeAmount?: number;
  extractionConfidence: number;
}

export interface ComplaintClassificationResult {
  categoryCode: ComplaintCategoryCode;
  categoryLabel: string;
  confidenceScore: number; // 0–100%
  needsReview: boolean; // set true if confidence < 60%
  matchedKeywords: string[];
  reasoning: string;
}

export interface RegulatoryMappingItem {
  ruleCode: string;
  title: string;
  authority: string;
  actName: string;
  section: string;
  officialGazetteRef: string;
  effectiveDate: string;
  activeVersion: number;
  verbatimClause: string;
  penalties: {
    minFine: number;
    maxFine: number;
    imprisonmentMonths?: number;
  };
  relevanceScore: number;
}

export interface RegulatoryMappingResult {
  queryUsed: string;
  evaluationDate: string;
  matchedRules: RegulatoryMappingItem[];
  provenanceSource: string;
  legalFindingDeclared: boolean; // Always false initially
}

export interface CaseCorrelationSummary {
  complainantAllegation: string;
  ocrEvidenceExtracted: string;
  regulatoryMappingSummary: string;
  verificationStatus: 'Pending Human Officer Review' | 'Accepted for Investigation' | 'Rejected' | 'More Info Requested' | 'Insufficient Evidence' | 'Assigned for Inspection' | 'Resolved';
}

export type OfficerActionType =
  | 'ACCEPT_INVESTIGATION'
  | 'REJECT'
  | 'REQUEST_INFO'
  | 'INSUFFICIENT_EVIDENCE'
  | 'ASSIGN_INSPECTION'
  | 'RESOLVE';

export interface OfficerDecisionRecord {
  id: string;
  timestamp: string;
  officerName: string;
  action: OfficerActionType;
  actionLabel: string;
  notes: string;
  assignedInspector?: string;
}

export interface ScannerDiscrepancyItem {
  ruleCode: string;
  ruleName: string;
  ruleDescription: string;
  fieldKey: string;
  status: 'fail' | 'warning' | 'pass' | 'not-applicable' | string;
  evidence: string;
  expectedStandard: string;
  ragMapping?: RegulatoryMappingItem;
}

export type SupportedLanguage = 'en' | 'hi' | 'kn' | 'ta';

export interface Complaint {
  id: string;
  ticketId: string;
  language?: SupportedLanguage;
  consumerName: string;
  consumerEmail: string;
  consumerPhone: string;
  productName: string;
  brand: string;
  platform: PlatformType;
  productUrl?: string;
  orderNumber: string;
  category: 'Price Gouging / MRP Violation' | 'Misleading Ad / Claim' | 'Substandard / Expiry Issue' | 'Missing Country of Origin' | 'Dark Patterns / Fake Discount' | string;
  categoryCode?: ComplaintCategoryCode;
  description: string;
  evidenceUrls: string[];
  evidenceImages?: EvidenceImageItem[];
  extractedEvidenceSummary?: ExtractedEvidenceSummary;
  classificationResult?: ComplaintClassificationResult;
  regulatoryMappingResult?: RegulatoryMappingResult;
  caseCorrelationSummary?: CaseCorrelationSummary;
  officerDecisionHistory?: OfficerDecisionRecord[];
  assignedOfficer?: string;
  status: 'New' | 'Triaged' | 'Investigation' | 'Notice Dispatched' | 'Rejected' | 'More Info Requested' | 'Insufficient Evidence' | 'Assigned for Inspection' | 'Resolved';
  priority: 'Urgent' | 'High' | 'Standard';
  submittedAt: string;
  sentimentScore: number; // 0 - 1 (urgency / frustration)
  aiMatchedRule: string;
  needsReview?: boolean;
  scannerDetectedDiscrepancies?: ScannerDiscrepancyItem[];
  /** Physical shop/store where the consumer purchased the product */
  shopLocation?: ShopLocation;
}

export interface RegulatoryRule {
  id: string;
  code: string;
  act: string;
  title: string;
  description: string;
  category: string;
  severity: ViolationSeverity;
  isActive: boolean;
  minFine: number;
  maxFine: number;
  imprisonmentMonths?: number;
  autoNoticeThreshold: number;
}
