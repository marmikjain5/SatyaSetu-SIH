import { RegulatoryRule } from '../types/compliance';
import {
  ComplianceTrendPoint,
  CategoryRiskMetric,
  PlatformComplianceMetric,
  StateComplianceMetric,
} from '../types/analytics';

export const NATIONAL_STATS = {
  productsAnalyzed: 2428910,
  violationsDetected: 48312,
  highRiskManufacturers: 1248,
  consumerComplaints: 320490,
  activeNotices: 8940,
  penaltyCollected: 42800000, // ₹4.28 Cr
  averageResolutionDays: 6.4,
  ocrAccuracyRate: 99.1,
};

export const LIVE_DETECTION_STREAM = [
  {
    id: 'STREAM-101',
    time: 'Just now',
    platform: 'Amazon',
    sku: 'SKU-AMZ-NUTR-991',
    category: 'Nutraceuticals',
    issue: 'Weight shortfall (-160g on 2kg container)',
    severity: 'critical',
    score: 42,
  },
  {
    id: 'STREAM-102',
    time: '2 mins ago',
    platform: 'Flipkart',
    sku: 'SKU-FLP-ELEC-442',
    category: 'Electronics',
    issue: 'Origin Obfuscation (PRC vs India listing)',
    severity: 'critical',
    score: 31,
  },
  {
    id: 'STREAM-103',
    time: '5 mins ago',
    platform: 'Zepto',
    sku: 'SKU-ZPT-COSM-774',
    category: 'Cosmetics',
    issue: 'Unsubstantiated 7-day magic cure claim',
    severity: 'medium',
    score: 58,
  },
  {
    id: 'STREAM-104',
    time: '9 mins ago',
    platform: 'Blinkit',
    sku: 'SKU-BLK-GROC-109',
    category: 'FMCG Groceries',
    issue: 'Verified compliant (OCR 99% match)',
    severity: 'low',
    score: 94,
  },
  {
    id: 'STREAM-105',
    time: '14 mins ago',
    platform: 'Meesho',
    sku: 'SKU-MSH-APPA-551',
    category: 'Apparel & Fitness',
    issue: 'Missing MRP declaration on polybag wrapper',
    severity: 'critical',
    score: 18,
  },
];

export const MOCK_RULES: RegulatoryRule[] = [
  {
    id: 'RULE-LM-001',
    code: 'LM-R6-USP-01',
    act: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    title: 'Mandatory Unit Sale Price (USP) Display',
    description: 'Every package containing more than 1kg/1L must clearly print unit sale price per g/ml in designated font size.',
    category: 'Packaged Commodities',
    severity: 'high',
    isActive: true,
    minFine: 25000,
    maxFine: 100000,
    imprisonmentMonths: 6,
    autoNoticeThreshold: 75,
  },
  {
    id: 'RULE-LM-002',
    code: 'LM-R6-COO-02',
    act: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    title: 'Country of Origin Declaration',
    description: 'Name of the Country of Origin or Manufacture must be mentioned in prominent uppercase characters.',
    category: 'Origin Authenticity',
    severity: 'critical',
    isActive: true,
    minFine: 50000,
    maxFine: 200000,
    imprisonmentMonths: 12,
    autoNoticeThreshold: 80,
  },
  {
    id: 'RULE-CCPA-001',
    code: 'CCPA-MISL-AD-09',
    act: 'Consumer Protection Act, 2019',
    title: 'Prohibition of Misleading Advertisements',
    description: 'Prohibits false or misleading claims relating to nature, substance, quantity, or quality of goods/services.',
    category: 'Advertising & Marketing',
    severity: 'critical',
    isActive: true,
    minFine: 1000000,
    maxFine: 5000000,
    imprisonmentMonths: 24,
    autoNoticeThreshold: 85,
  },
  {
    id: 'RULE-FSSAI-001',
    code: 'FSSAI-ADV-2018-04',
    act: 'FSSAI (Advertising & Claims) Regulations, 2018',
    title: 'Unsubstantiated Nutritional Claims',
    description: 'Prohibits terms such as Natural, Fresh, Pure, Authentic without adhering to statutory FSSAI Schedule benchmarks.',
    category: 'Food & Nutrition',
    severity: 'high',
    isActive: true,
    minFine: 100000,
    maxFine: 1000000,
    autoNoticeThreshold: 70,
  },
  {
    id: 'RULE-ECOM-001',
    code: 'ECOM-RULES-2020-05',
    act: 'Consumer Protection (E-Commerce) Rules, 2020',
    title: 'E-Commerce Marketplace Seller Disclosure',
    description: 'Marketplaces must explicitly display verified legal name, registered address, and customer care of the principal seller.',
    category: 'E-Commerce Platforms',
    severity: 'medium',
    isActive: true,
    minFine: 50000,
    maxFine: 500000,
    autoNoticeThreshold: 65,
  },
];

export const COMPLIANCE_TRENDS: ComplianceTrendPoint[] = [
  { month: 'Sep 2024', scanned: 210000, violations: 5400, notices: 1200, resolved: 980 },
  { month: 'Oct 2024', scanned: 280000, violations: 6200, notices: 1450, resolved: 1150 },
  { month: 'Nov 2024', scanned: 340000, violations: 7100, notices: 1800, resolved: 1420 },
  { month: 'Dec 2024', scanned: 420000, violations: 8900, notices: 2100, resolved: 1780 },
  { month: 'Jan 2025', scanned: 550000, violations: 10400, notices: 2650, resolved: 2300 },
  { month: 'Feb 2025', scanned: 628910, violations: 10312, notices: 2840, resolved: 2490 },
];

export const CATEGORY_RISK_METRICS: CategoryRiskMetric[] = [
  { category: 'Health Supplements & Protein', totalProducts: 34200, violationRate: 28.4, topViolation: 'Protein Shortfall & False Claims', riskLevel: 'Critical' },
  { category: 'Consumer Electronics & Audio', totalProducts: 89400, violationRate: 21.6, topViolation: 'Origin Obfuscation', riskLevel: 'High' },
  { category: 'Ayurvedic & Cosmetics', totalProducts: 54100, violationRate: 18.2, topViolation: 'Magic Cure / Misleading Timelines', riskLevel: 'High' },
  { category: 'Apparel & Fast Fashion', totalProducts: 112000, violationRate: 14.8, topViolation: 'Missing MRP / Packer Info', riskLevel: 'Medium' },
  { category: 'Packaged FMCG Groceries', totalProducts: 198000, violationRate: 4.2, topViolation: 'Font Size & Date Format', riskLevel: 'Low' },
];

export const PLATFORM_COMPLIANCE_METRICS: PlatformComplianceMetric[] = [
  { platform: 'Amazon India', productsScanned: 840000, complianceRate: 88.4, avgResolutionDays: 4.8, openNotices: 1420 },
  { platform: 'Flipkart', productsScanned: 790000, complianceRate: 85.1, avgResolutionDays: 5.2, openNotices: 1890 },
  { platform: 'Blinkit', productsScanned: 240000, complianceRate: 96.8, avgResolutionDays: 2.1, openNotices: 140 },
  { platform: 'Zepto', productsScanned: 180000, complianceRate: 94.2, avgResolutionDays: 2.6, openNotices: 210 },
  { platform: 'Meesho', productsScanned: 378910, complianceRate: 68.5, avgResolutionDays: 11.4, openNotices: 3820 },
];

export const STATE_COMPLIANCE_METRICS: StateComplianceMetric[] = [
  { state: 'Maharashtra', code: 'MH', activeCases: 1420, inspectionsCompleted: 42000, compliancePercentage: 86.4, riskScore: 42 },
  { state: 'Delhi NCR', code: 'DL', activeCases: 1680, inspectionsCompleted: 38900, compliancePercentage: 81.2, riskScore: 68 },
  { state: 'Karnataka', code: 'KA', activeCases: 890, inspectionsCompleted: 31000, compliancePercentage: 89.1, riskScore: 32 },
  { state: 'Himachal Pradesh', code: 'HP', activeCases: 1240, inspectionsCompleted: 14500, compliancePercentage: 72.8, riskScore: 78 },
  { state: 'Uttar Pradesh', code: 'UP', activeCases: 2150, inspectionsCompleted: 49000, compliancePercentage: 78.4, riskScore: 74 },
  { state: 'Tamil Nadu', code: 'TN', activeCases: 640, inspectionsCompleted: 28400, compliancePercentage: 92.5, riskScore: 24 },
  { state: 'Gujarat', code: 'GJ', activeCases: 920, inspectionsCompleted: 34200, compliancePercentage: 88.0, riskScore: 38 },
];
