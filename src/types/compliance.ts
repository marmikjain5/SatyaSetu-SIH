export type ViolationSeverity = 'critical' | 'high' | 'medium' | 'low';
export type ComplianceStatus = 'compliant' | 'non-compliant' | 'under-review' | 'notice-issued';
export type PlatformType = 'Amazon' | 'Flipkart' | 'Blinkit' | 'Zepto' | 'Meesho' | 'Nykaa' | 'Direct';

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
    type: 'OCR Label' | 'Pricing Disparity' | 'Prohibited Claim' | 'Origin Obfuscation' | 'Weight Discrepancy';
    extractedValue: string;
    expectedStandard: string;
    snippetUrl?: string;
  };
  penaltyEstimate: number;
  assignedOfficer: string;
  noticeId?: string;
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
}

export interface Complaint {
  id: string;
  ticketId: string;
  consumerName: string;
  consumerEmail: string;
  consumerPhone: string;
  productName: string;
  brand: string;
  platform: PlatformType;
  orderNumber: string;
  category: 'Price Gouging / MRP Violation' | 'Misleading Ad / Claim' | 'Substandard / Expiry Issue' | 'Missing Country of Origin' | 'Dark Patterns / Fake Discount';
  description: string;
  evidenceUrls: string[];
  status: 'New' | 'Triaged' | 'Investigation' | 'Notice Dispatched' | 'Resolved';
  priority: 'Urgent' | 'High' | 'Standard';
  submittedAt: string;
  sentimentScore: number; // 0 - 1 (urgency / frustration)
  aiMatchedRule: string;
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
