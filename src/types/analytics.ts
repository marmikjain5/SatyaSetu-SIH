export interface ComplianceTrendPoint {
  month: string;
  scanned: number;
  violations: number;
  notices: number;
  resolved: number;
  scannedLabel?: string;
  violationsLabel?: string;
}

export interface CategoryRiskMetric {
  category: string;
  totalProducts: number;
  violationRate: number; // percentage
  topViolation: string;
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Low';
}

export interface PlatformComplianceMetric {
  platform: string;
  productsScanned: number;
  complianceRate: number;
  avgResolutionDays: number;
  openNotices: number;
}

export interface StateComplianceMetric {
  state: string;
  code: string;
  activeCases: number;
  inspectionsCompleted: number;
  compliancePercentage: number;
  riskScore: number;
}
