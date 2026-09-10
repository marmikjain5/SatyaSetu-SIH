import { ViolationSeverity } from './compliance';

// ── Status Types ──
export type HygieneStatus = 'compliant' | 'warning' | 'critical' | 'under-review';
export type ZoneType = 'production' | 'storage' | 'packaging' | 'loading-dock' | 'washroom' | 'cafeteria' | 'raw-material' | 'waste-management';
export type InspectionResult = 'pass' | 'fail' | 'conditional-pass';
export type ParameterCategory = 'sensor-telemetry' | 'inspection-assessment';
export type ParameterStatus = 'normal' | 'warning' | 'critical';
export type ViolationStatus = 'open' | 'remediated' | 'escalated';
export type EvidenceType = 'photograph' | 'visual-observation' | 'monitoring-reading' | 'document';

// ── Hygiene Parameter ──
export interface HygieneParameter {
  id: string;
  name: string;
  category: ParameterCategory;
  value: number;
  unit: string;
  minThreshold?: number;
  maxThreshold?: number;
  status: ParameterStatus;
  updatedAt: string;
}

// ── Hygiene Zone ──
export interface HygieneZone {
  id: string;
  factoryId: string;
  name: string;
  type: ZoneType;
  score: number; // 0-100
  status: HygieneStatus;
  parameters: HygieneParameter[];
  activeIssues: number;
  lastInspected: string;
}

// ── Hygiene Evidence ──
export interface HygieneEvidence {
  id: string;
  type: EvidenceType;
  title: string;
  description: string;
  imageRef: string; // placeholder reference
  capturedAt: string;
}

// ── Hygiene Violation ──
export interface HygieneViolation {
  id: string;
  factoryId: string;
  zoneId: string;
  zoneName: string;
  parameter: string;
  title: string;
  description: string;
  severity: ViolationSeverity;
  actualValue: string;
  threshold: string;
  recommendation: string;
  status: ViolationStatus;
  detectedAt: string;
  evidence?: HygieneEvidence;
}

// ── Hygiene Inspection ──
export interface HygieneInspection {
  id: string;
  factoryId: string;
  inspector: string;
  inspectorBadge: string;
  date: string;
  score: number;
  result: InspectionResult;
  findingsCount: number;
  criticalCount: number;
  findings: string[];
  evidence: HygieneEvidence[];
  notes: string;
}

// ── Hygiene Alert ──
export interface HygieneAlert {
  id: string;
  factoryId: string;
  zoneId: string;
  zoneName: string;
  severity: ViolationSeverity;
  metric: string;
  message: string;
  explanation: string;
  recommendedAction: string;
  timestamp: string;
  acknowledged: boolean;
}

// ── Hygiene Trend Point ──
export interface HygieneTrendPoint {
  date: string;
  score: number;
  temperature: number;
  humidity: number;
  incidentCount: number;
}

// ── Factory ──
export interface Factory {
  id: string;
  name: string;
  location: string;
  city: string;
  state: string;
  registrationNumber: string;
  fssaiLicense: string;
  category: string;
  overallScore: number; // 0-100
  complianceStatus: HygieneStatus;
  activeAlerts: number;
  lastInspection: string;
  totalInspections: number;
  inspectionPassRate: number;
  zones: HygieneZone[];
}

// ── Threshold evaluation helper ──
export interface ThresholdConfig {
  parameterId: string;
  parameterName: string;
  unit: string;
  minAcceptable?: number;
  maxAcceptable?: number;
  warningDelta: number;
}

// ── Evaluate parameter status from value + threshold ──
export function evaluateParameterStatus(
  value: number,
  config: { minAcceptable?: number; maxAcceptable?: number; warningDelta: number }
): ParameterStatus {
  const { minAcceptable, maxAcceptable, warningDelta } = config;

  // Check critical (outside acceptable range)
  if (maxAcceptable !== undefined && value > maxAcceptable) return 'critical';
  if (minAcceptable !== undefined && value < minAcceptable) return 'critical';

  // Check warning (within warningDelta of boundary)
  if (maxAcceptable !== undefined && value > maxAcceptable - warningDelta) return 'warning';
  if (minAcceptable !== undefined && value < minAcceptable + warningDelta) return 'warning';

  return 'normal';
}

// ── Derive HygieneStatus from a numeric score ──
export function deriveHygieneStatus(score: number): HygieneStatus {
  if (score >= 80) return 'compliant';
  if (score >= 60) return 'warning';
  return 'critical';
}
