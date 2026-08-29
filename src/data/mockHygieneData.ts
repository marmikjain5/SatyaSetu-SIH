import {
  Factory,
  HygieneZone,
  HygieneParameter,
  HygieneInspection,
  HygieneViolation,
  HygieneAlert,
  HygieneTrendPoint,
  HygieneEvidence,
  ThresholdConfig,
  evaluateParameterStatus,
  deriveHygieneStatus,
} from '../types/hygiene';

// ═══════════════════════════════════════════════
// THRESHOLD CONFIGURATIONS
// ═══════════════════════════════════════════════

export const HYGIENE_THRESHOLDS: ThresholdConfig[] = [
  { parameterId: 'temp',   parameterName: 'Temperature',          unit: '°C', minAcceptable: 4,  maxAcceptable: 28, warningDelta: 3 },
  { parameterId: 'humid',  parameterName: 'Humidity',             unit: '%',  minAcceptable: 30, maxAcceptable: 70, warningDelta: 8 },
  { parameterId: 'pest',   parameterName: 'Pest Activity',        unit: '/10', maxAcceptable: 2,  warningDelta: 1 },
  { parameterId: 'surface',parameterName: 'Surface Cleanliness',  unit: '/100', minAcceptable: 70, warningDelta: 10 },
  { parameterId: 'worker', parameterName: 'Worker Hygiene',       unit: '/100', minAcceptable: 75, warningDelta: 10 },
  { parameterId: 'equip',  parameterName: 'Equipment Sanitation', unit: '/100', minAcceptable: 70, warningDelta: 10 },
  { parameterId: 'waste',  parameterName: 'Waste Management',     unit: '/100', minAcceptable: 65, warningDelta: 10 },
];

function getThreshold(parameterId: string): ThresholdConfig {
  return HYGIENE_THRESHOLDS.find(t => t.parameterId === parameterId)!;
}

// Helper to build a parameter with auto-evaluated status
function buildParam(
  id: string,
  name: string,
  category: HygieneParameter['category'],
  value: number,
  thresholdId: string,
  updatedAt: string
): HygieneParameter {
  const cfg = getThreshold(thresholdId);
  return {
    id,
    name,
    category,
    value,
    unit: cfg.unit,
    minThreshold: cfg.minAcceptable,
    maxThreshold: cfg.maxAcceptable,
    status: evaluateParameterStatus(value, cfg),
    updatedAt,
  };
}

// ═══════════════════════════════════════════════
// ZONES
// ═══════════════════════════════════════════════

const ZONES_FACTORY_1: HygieneZone[] = [
  {
    id: 'Z-F1-01', factoryId: 'FAC-001', name: 'Raw Material Storage', type: 'raw-material',
    score: 72, status: 'warning', activeIssues: 2, lastInspected: '2026-08-22',
    parameters: [
      buildParam('P-F1-Z1-01', 'Temperature',          'sensor-telemetry',       14.2, 'temp',    '2026-08-27 19:05'),
      buildParam('P-F1-Z1-02', 'Humidity',              'sensor-telemetry',       68,   'humid',   '2026-08-27 19:05'),
      buildParam('P-F1-Z1-03', 'Pest Activity',         'inspection-assessment',  3,    'pest',    '2026-08-22'),
      buildParam('P-F1-Z1-04', 'Surface Cleanliness',   'inspection-assessment',  74,   'surface', '2026-08-22'),
      buildParam('P-F1-Z1-05', 'Worker Hygiene',        'inspection-assessment',  80,   'worker',  '2026-08-22'),
      buildParam('P-F1-Z1-06', 'Equipment Sanitation',  'inspection-assessment',  68,   'equip',   '2026-08-22'),
      buildParam('P-F1-Z1-07', 'Waste Management',      'inspection-assessment',  70,   'waste',   '2026-08-22'),
    ],
  },
  {
    id: 'Z-F1-02', factoryId: 'FAC-001', name: 'Production Floor', type: 'production',
    score: 88, status: 'compliant', activeIssues: 0, lastInspected: '2026-08-22',
    parameters: [
      buildParam('P-F1-Z2-01', 'Temperature',          'sensor-telemetry',       22.5, 'temp',    '2026-08-27 19:04'),
      buildParam('P-F1-Z2-02', 'Humidity',              'sensor-telemetry',       55,   'humid',   '2026-08-27 19:04'),
      buildParam('P-F1-Z2-03', 'Pest Activity',         'inspection-assessment',  0,    'pest',    '2026-08-22'),
      buildParam('P-F1-Z2-04', 'Surface Cleanliness',   'inspection-assessment',  92,   'surface', '2026-08-22'),
      buildParam('P-F1-Z2-05', 'Worker Hygiene',        'inspection-assessment',  90,   'worker',  '2026-08-22'),
      buildParam('P-F1-Z2-06', 'Equipment Sanitation',  'inspection-assessment',  88,   'equip',   '2026-08-22'),
      buildParam('P-F1-Z2-07', 'Waste Management',      'inspection-assessment',  82,   'waste',   '2026-08-22'),
    ],
  },
  {
    id: 'Z-F1-03', factoryId: 'FAC-001', name: 'Packaging Area', type: 'packaging',
    score: 81, status: 'compliant', activeIssues: 1, lastInspected: '2026-08-22',
    parameters: [
      buildParam('P-F1-Z3-01', 'Temperature',          'sensor-telemetry',       24.8, 'temp',    '2026-08-27 19:03'),
      buildParam('P-F1-Z3-02', 'Humidity',              'sensor-telemetry',       62,   'humid',   '2026-08-27 19:03'),
      buildParam('P-F1-Z3-03', 'Pest Activity',         'inspection-assessment',  1,    'pest',    '2026-08-22'),
      buildParam('P-F1-Z3-04', 'Surface Cleanliness',   'inspection-assessment',  84,   'surface', '2026-08-22'),
      buildParam('P-F1-Z3-05', 'Worker Hygiene',        'inspection-assessment',  78,   'worker',  '2026-08-22'),
      buildParam('P-F1-Z3-06', 'Equipment Sanitation',  'inspection-assessment',  80,   'equip',   '2026-08-22'),
      buildParam('P-F1-Z3-07', 'Waste Management',      'inspection-assessment',  76,   'waste',   '2026-08-22'),
    ],
  },
  {
    id: 'Z-F1-04', factoryId: 'FAC-001', name: 'Finished Goods Storage', type: 'storage',
    score: 90, status: 'compliant', activeIssues: 0, lastInspected: '2026-08-22',
    parameters: [
      buildParam('P-F1-Z4-01', 'Temperature',          'sensor-telemetry',       18.0, 'temp',    '2026-08-27 19:02'),
      buildParam('P-F1-Z4-02', 'Humidity',              'sensor-telemetry',       48,   'humid',   '2026-08-27 19:02'),
      buildParam('P-F1-Z4-03', 'Pest Activity',         'inspection-assessment',  0,    'pest',    '2026-08-22'),
      buildParam('P-F1-Z4-04', 'Surface Cleanliness',   'inspection-assessment',  90,   'surface', '2026-08-22'),
      buildParam('P-F1-Z4-05', 'Worker Hygiene',        'inspection-assessment',  88,   'worker',  '2026-08-22'),
      buildParam('P-F1-Z4-06', 'Equipment Sanitation',  'inspection-assessment',  92,   'equip',   '2026-08-22'),
      buildParam('P-F1-Z4-07', 'Waste Management',      'inspection-assessment',  88,   'waste',   '2026-08-22'),
    ],
  },
  {
    id: 'Z-F1-05', factoryId: 'FAC-001', name: 'Waste Management Area', type: 'waste-management',
    score: 65, status: 'warning', activeIssues: 1, lastInspected: '2026-08-22',
    parameters: [
      buildParam('P-F1-Z5-01', 'Temperature',          'sensor-telemetry',       30,   'temp',    '2026-08-27 19:01'),
      buildParam('P-F1-Z5-02', 'Humidity',              'sensor-telemetry',       74,   'humid',   '2026-08-27 19:01'),
      buildParam('P-F1-Z5-03', 'Pest Activity',         'inspection-assessment',  4,    'pest',    '2026-08-22'),
      buildParam('P-F1-Z5-04', 'Surface Cleanliness',   'inspection-assessment',  58,   'surface', '2026-08-22'),
      buildParam('P-F1-Z5-05', 'Worker Hygiene',        'inspection-assessment',  72,   'worker',  '2026-08-22'),
      buildParam('P-F1-Z5-06', 'Equipment Sanitation',  'inspection-assessment',  60,   'equip',   '2026-08-22'),
      buildParam('P-F1-Z5-07', 'Waste Management',      'inspection-assessment',  55,   'waste',   '2026-08-22'),
    ],
  },
];

const ZONES_FACTORY_2: HygieneZone[] = [
  {
    id: 'Z-F2-01', factoryId: 'FAC-002', name: 'Raw Material Storage', type: 'raw-material',
    score: 54, status: 'critical', activeIssues: 3, lastInspected: '2026-08-18',
    parameters: [
      buildParam('P-F2-Z1-01', 'Temperature',          'sensor-telemetry',       31,   'temp',    '2026-08-27 18:55'),
      buildParam('P-F2-Z1-02', 'Humidity',              'sensor-telemetry',       78,   'humid',   '2026-08-27 18:55'),
      buildParam('P-F2-Z1-03', 'Pest Activity',         'inspection-assessment',  5,    'pest',    '2026-08-18'),
      buildParam('P-F2-Z1-04', 'Surface Cleanliness',   'inspection-assessment',  52,   'surface', '2026-08-18'),
      buildParam('P-F2-Z1-05', 'Worker Hygiene',        'inspection-assessment',  60,   'worker',  '2026-08-18'),
      buildParam('P-F2-Z1-06', 'Equipment Sanitation',  'inspection-assessment',  48,   'equip',   '2026-08-18'),
      buildParam('P-F2-Z1-07', 'Waste Management',      'inspection-assessment',  45,   'waste',   '2026-08-18'),
    ],
  },
  {
    id: 'Z-F2-02', factoryId: 'FAC-002', name: 'Production Floor', type: 'production',
    score: 62, status: 'warning', activeIssues: 2, lastInspected: '2026-08-18',
    parameters: [
      buildParam('P-F2-Z2-01', 'Temperature',          'sensor-telemetry',       26.5, 'temp',    '2026-08-27 18:54'),
      buildParam('P-F2-Z2-02', 'Humidity',              'sensor-telemetry',       65,   'humid',   '2026-08-27 18:54'),
      buildParam('P-F2-Z2-03', 'Pest Activity',         'inspection-assessment',  2,    'pest',    '2026-08-18'),
      buildParam('P-F2-Z2-04', 'Surface Cleanliness',   'inspection-assessment',  64,   'surface', '2026-08-18'),
      buildParam('P-F2-Z2-05', 'Worker Hygiene',        'inspection-assessment',  66,   'worker',  '2026-08-18'),
      buildParam('P-F2-Z2-06', 'Equipment Sanitation',  'inspection-assessment',  58,   'equip',   '2026-08-18'),
      buildParam('P-F2-Z2-07', 'Waste Management',      'inspection-assessment',  62,   'waste',   '2026-08-18'),
    ],
  },
  {
    id: 'Z-F2-03', factoryId: 'FAC-002', name: 'Packaging Area', type: 'packaging',
    score: 70, status: 'warning', activeIssues: 1, lastInspected: '2026-08-18',
    parameters: [
      buildParam('P-F2-Z3-01', 'Temperature',          'sensor-telemetry',       25.0, 'temp',    '2026-08-27 18:53'),
      buildParam('P-F2-Z3-02', 'Humidity',              'sensor-telemetry',       58,   'humid',   '2026-08-27 18:53'),
      buildParam('P-F2-Z3-03', 'Pest Activity',         'inspection-assessment',  1,    'pest',    '2026-08-18'),
      buildParam('P-F2-Z3-04', 'Surface Cleanliness',   'inspection-assessment',  72,   'surface', '2026-08-18'),
      buildParam('P-F2-Z3-05', 'Worker Hygiene',        'inspection-assessment',  70,   'worker',  '2026-08-18'),
      buildParam('P-F2-Z3-06', 'Equipment Sanitation',  'inspection-assessment',  68,   'equip',   '2026-08-18'),
      buildParam('P-F2-Z3-07', 'Waste Management',      'inspection-assessment',  70,   'waste',   '2026-08-18'),
    ],
  },
];

const ZONES_FACTORY_3: HygieneZone[] = [
  {
    id: 'Z-F3-01', factoryId: 'FAC-003', name: 'Cold Storage', type: 'storage',
    score: 94, status: 'compliant', activeIssues: 0, lastInspected: '2026-08-25',
    parameters: [
      buildParam('P-F3-Z1-01', 'Temperature',          'sensor-telemetry',       6.2,  'temp',    '2026-08-27 19:08'),
      buildParam('P-F3-Z1-02', 'Humidity',              'sensor-telemetry',       45,   'humid',   '2026-08-27 19:08'),
      buildParam('P-F3-Z1-03', 'Pest Activity',         'inspection-assessment',  0,    'pest',    '2026-08-25'),
      buildParam('P-F3-Z1-04', 'Surface Cleanliness',   'inspection-assessment',  96,   'surface', '2026-08-25'),
      buildParam('P-F3-Z1-05', 'Worker Hygiene',        'inspection-assessment',  94,   'worker',  '2026-08-25'),
      buildParam('P-F3-Z1-06', 'Equipment Sanitation',  'inspection-assessment',  95,   'equip',   '2026-08-25'),
      buildParam('P-F3-Z1-07', 'Waste Management',      'inspection-assessment',  90,   'waste',   '2026-08-25'),
    ],
  },
  {
    id: 'Z-F3-02', factoryId: 'FAC-003', name: 'Processing Hall', type: 'production',
    score: 91, status: 'compliant', activeIssues: 0, lastInspected: '2026-08-25',
    parameters: [
      buildParam('P-F3-Z2-01', 'Temperature',          'sensor-telemetry',       20.0, 'temp',    '2026-08-27 19:07'),
      buildParam('P-F3-Z2-02', 'Humidity',              'sensor-telemetry',       50,   'humid',   '2026-08-27 19:07'),
      buildParam('P-F3-Z2-03', 'Pest Activity',         'inspection-assessment',  0,    'pest',    '2026-08-25'),
      buildParam('P-F3-Z2-04', 'Surface Cleanliness',   'inspection-assessment',  94,   'surface', '2026-08-25'),
      buildParam('P-F3-Z2-05', 'Worker Hygiene',        'inspection-assessment',  92,   'worker',  '2026-08-25'),
      buildParam('P-F3-Z2-06', 'Equipment Sanitation',  'inspection-assessment',  90,   'equip',   '2026-08-25'),
      buildParam('P-F3-Z2-07', 'Waste Management',      'inspection-assessment',  86,   'waste',   '2026-08-25'),
    ],
  },
  {
    id: 'Z-F3-03', factoryId: 'FAC-003', name: 'Packaging Line', type: 'packaging',
    score: 89, status: 'compliant', activeIssues: 0, lastInspected: '2026-08-25',
    parameters: [
      buildParam('P-F3-Z3-01', 'Temperature',          'sensor-telemetry',       21.5, 'temp',    '2026-08-27 19:06'),
      buildParam('P-F3-Z3-02', 'Humidity',              'sensor-telemetry',       52,   'humid',   '2026-08-27 19:06'),
      buildParam('P-F3-Z3-03', 'Pest Activity',         'inspection-assessment',  0,    'pest',    '2026-08-25'),
      buildParam('P-F3-Z3-04', 'Surface Cleanliness',   'inspection-assessment',  88,   'surface', '2026-08-25'),
      buildParam('P-F3-Z3-05', 'Worker Hygiene',        'inspection-assessment',  90,   'worker',  '2026-08-25'),
      buildParam('P-F3-Z3-06', 'Equipment Sanitation',  'inspection-assessment',  86,   'equip',   '2026-08-25'),
      buildParam('P-F3-Z3-07', 'Waste Management',      'inspection-assessment',  88,   'waste',   '2026-08-25'),
    ],
  },
  {
    id: 'Z-F3-04', factoryId: 'FAC-003', name: 'Loading Dock', type: 'loading-dock',
    score: 82, status: 'compliant', activeIssues: 0, lastInspected: '2026-08-25',
    parameters: [
      buildParam('P-F3-Z4-01', 'Temperature',          'sensor-telemetry',       26.0, 'temp',    '2026-08-27 19:06'),
      buildParam('P-F3-Z4-02', 'Humidity',              'sensor-telemetry',       60,   'humid',   '2026-08-27 19:06'),
      buildParam('P-F3-Z4-03', 'Pest Activity',         'inspection-assessment',  1,    'pest',    '2026-08-25'),
      buildParam('P-F3-Z4-04', 'Surface Cleanliness',   'inspection-assessment',  80,   'surface', '2026-08-25'),
      buildParam('P-F3-Z4-05', 'Worker Hygiene',        'inspection-assessment',  82,   'worker',  '2026-08-25'),
      buildParam('P-F3-Z4-06', 'Equipment Sanitation',  'inspection-assessment',  78,   'equip',   '2026-08-25'),
      buildParam('P-F3-Z4-07', 'Waste Management',      'inspection-assessment',  80,   'waste',   '2026-08-25'),
    ],
  },
];

const ZONES_FACTORY_4: HygieneZone[] = [
  {
    id: 'Z-F4-01', factoryId: 'FAC-004', name: 'Blending Unit', type: 'production',
    score: 76, status: 'warning', activeIssues: 1, lastInspected: '2026-08-20',
    parameters: [
      buildParam('P-F4-Z1-01', 'Temperature',          'sensor-telemetry',       25.8, 'temp',    '2026-08-27 18:50'),
      buildParam('P-F4-Z1-02', 'Humidity',              'sensor-telemetry',       63,   'humid',   '2026-08-27 18:50'),
      buildParam('P-F4-Z1-03', 'Pest Activity',         'inspection-assessment',  1,    'pest',    '2026-08-20'),
      buildParam('P-F4-Z1-04', 'Surface Cleanliness',   'inspection-assessment',  78,   'surface', '2026-08-20'),
      buildParam('P-F4-Z1-05', 'Worker Hygiene',        'inspection-assessment',  74,   'worker',  '2026-08-20'),
      buildParam('P-F4-Z1-06', 'Equipment Sanitation',  'inspection-assessment',  72,   'equip',   '2026-08-20'),
      buildParam('P-F4-Z1-07', 'Waste Management',      'inspection-assessment',  76,   'waste',   '2026-08-20'),
    ],
  },
  {
    id: 'Z-F4-02', factoryId: 'FAC-004', name: 'Tablet Press Room', type: 'production',
    score: 82, status: 'compliant', activeIssues: 0, lastInspected: '2026-08-20',
    parameters: [
      buildParam('P-F4-Z2-01', 'Temperature',          'sensor-telemetry',       22.0, 'temp',    '2026-08-27 18:49'),
      buildParam('P-F4-Z2-02', 'Humidity',              'sensor-telemetry',       48,   'humid',   '2026-08-27 18:49'),
      buildParam('P-F4-Z2-03', 'Pest Activity',         'inspection-assessment',  0,    'pest',    '2026-08-20'),
      buildParam('P-F4-Z2-04', 'Surface Cleanliness',   'inspection-assessment',  86,   'surface', '2026-08-20'),
      buildParam('P-F4-Z2-05', 'Worker Hygiene',        'inspection-assessment',  84,   'worker',  '2026-08-20'),
      buildParam('P-F4-Z2-06', 'Equipment Sanitation',  'inspection-assessment',  80,   'equip',   '2026-08-20'),
      buildParam('P-F4-Z2-07', 'Waste Management',      'inspection-assessment',  78,   'waste',   '2026-08-20'),
    ],
  },
  {
    id: 'Z-F4-03', factoryId: 'FAC-004', name: 'Packaging Hall', type: 'packaging',
    score: 80, status: 'compliant', activeIssues: 0, lastInspected: '2026-08-20',
    parameters: [
      buildParam('P-F4-Z3-01', 'Temperature',          'sensor-telemetry',       23.5, 'temp',    '2026-08-27 18:48'),
      buildParam('P-F4-Z3-02', 'Humidity',              'sensor-telemetry',       55,   'humid',   '2026-08-27 18:48'),
      buildParam('P-F4-Z3-03', 'Pest Activity',         'inspection-assessment',  0,    'pest',    '2026-08-20'),
      buildParam('P-F4-Z3-04', 'Surface Cleanliness',   'inspection-assessment',  82,   'surface', '2026-08-20'),
      buildParam('P-F4-Z3-05', 'Worker Hygiene',        'inspection-assessment',  80,   'worker',  '2026-08-20'),
      buildParam('P-F4-Z3-06', 'Equipment Sanitation',  'inspection-assessment',  78,   'equip',   '2026-08-20'),
      buildParam('P-F4-Z3-07', 'Waste Management',      'inspection-assessment',  80,   'waste',   '2026-08-20'),
    ],
  },
];

// ═══════════════════════════════════════════════
// FACTORIES
// ═══════════════════════════════════════════════

function computeFactoryScore(zones: HygieneZone[]): number {
  if (zones.length === 0) return 0;
  return Math.round(zones.reduce((sum, z) => sum + z.score, 0) / zones.length);
}

function computeActiveAlerts(zones: HygieneZone[]): number {
  return zones.reduce((sum, z) => sum + z.activeIssues, 0);
}

export const MOCK_FACTORIES: Factory[] = [
  {
    id: 'FAC-001',
    name: 'Amul Dairy Processing Unit',
    location: 'GIDC Industrial Area, Anand',
    city: 'Anand',
    state: 'Gujarat',
    registrationNumber: 'GJ-FOOD-2019-04821',
    fssaiLicense: 'FSSAI-10020041000125',
    category: 'Food Processing — Dairy',
    overallScore: computeFactoryScore(ZONES_FACTORY_1),
    complianceStatus: deriveHygieneStatus(computeFactoryScore(ZONES_FACTORY_1)),
    activeAlerts: computeActiveAlerts(ZONES_FACTORY_1),
    lastInspection: '2026-08-22',
    totalInspections: 24,
    inspectionPassRate: 87.5,
    zones: ZONES_FACTORY_1,
  },
  {
    id: 'FAC-002',
    name: 'Bharat Spices & Masala Works',
    location: 'Phase II, Industrial Belt, Solan',
    city: 'Solan',
    state: 'Himachal Pradesh',
    registrationNumber: 'HP-FOOD-2021-01342',
    fssaiLicense: 'FSSAI-10020064000089',
    category: 'Food Processing — Spices',
    overallScore: computeFactoryScore(ZONES_FACTORY_2),
    complianceStatus: deriveHygieneStatus(computeFactoryScore(ZONES_FACTORY_2)),
    activeAlerts: computeActiveAlerts(ZONES_FACTORY_2),
    lastInspection: '2026-08-18',
    totalInspections: 12,
    inspectionPassRate: 58.3,
    zones: ZONES_FACTORY_2,
  },
  {
    id: 'FAC-003',
    name: 'Nestlé India – Nanjangud Plant',
    location: 'Mysore Road, Nanjangud',
    city: 'Nanjangud',
    state: 'Karnataka',
    registrationNumber: 'KA-FOOD-2017-09471',
    fssaiLicense: 'FSSAI-10020029000042',
    category: 'Food Processing — Confectionery & Beverages',
    overallScore: computeFactoryScore(ZONES_FACTORY_3),
    complianceStatus: deriveHygieneStatus(computeFactoryScore(ZONES_FACTORY_3)),
    activeAlerts: computeActiveAlerts(ZONES_FACTORY_3),
    lastInspection: '2026-08-25',
    totalInspections: 36,
    inspectionPassRate: 97.2,
    zones: ZONES_FACTORY_3,
  },
  {
    id: 'FAC-004',
    name: 'Cipla Pharmaceuticals – Patalganga',
    location: 'MIDC Patalganga, Raigad',
    city: 'Raigad',
    state: 'Maharashtra',
    registrationNumber: 'MH-PHARMA-2018-07263',
    fssaiLicense: 'FSSAI-10020027000310',
    category: 'Pharmaceuticals — Solid Dosage',
    overallScore: computeFactoryScore(ZONES_FACTORY_4),
    complianceStatus: deriveHygieneStatus(computeFactoryScore(ZONES_FACTORY_4)),
    activeAlerts: computeActiveAlerts(ZONES_FACTORY_4),
    lastInspection: '2026-08-20',
    totalInspections: 18,
    inspectionPassRate: 83.3,
    zones: ZONES_FACTORY_4,
  },
];

// ═══════════════════════════════════════════════
// ALERTS
// ═══════════════════════════════════════════════

export const MOCK_HYGIENE_ALERTS: HygieneAlert[] = [
  {
    id: 'ALERT-001', factoryId: 'FAC-002', zoneId: 'Z-F2-01', zoneName: 'Raw Material Storage',
    severity: 'critical', metric: 'Temperature',
    message: 'Temperature exceeds acceptable range in Raw Material Storage',
    explanation: 'Current reading of 31°C exceeds the 28°C upper threshold. Prolonged exposure at this temperature may accelerate spoilage of raw ingredients.',
    recommendedAction: 'Inspect HVAC system immediately. Isolate temperature-sensitive materials. Schedule emergency maintenance.',
    timestamp: '2026-08-27 18:55', acknowledged: false,
  },
  {
    id: 'ALERT-002', factoryId: 'FAC-002', zoneId: 'Z-F2-01', zoneName: 'Raw Material Storage',
    severity: 'critical', metric: 'Pest Activity',
    message: 'Pest activity above acceptable monitoring threshold in Raw Material Storage',
    explanation: 'Pest activity scored 5/10 during last inspection, well above the 2/10 threshold. Evidence of rodent droppings near grain storage bins.',
    recommendedAction: 'Engage pest control service. Quarantine affected stock. Document evidence for compliance report.',
    timestamp: '2026-08-18 14:20', acknowledged: false,
  },
  {
    id: 'ALERT-003', factoryId: 'FAC-002', zoneId: 'Z-F2-01', zoneName: 'Raw Material Storage',
    severity: 'high', metric: 'Humidity',
    message: 'Humidity exceeds target in Raw Material Storage',
    explanation: 'Humidity at 78% exceeds the 70% upper threshold. High humidity accelerates mold growth and ingredient degradation.',
    recommendedAction: 'Activate dehumidifiers. Check ventilation ducts for blockages. Monitor hourly until within range.',
    timestamp: '2026-08-27 18:55', acknowledged: false,
  },
  {
    id: 'ALERT-004', factoryId: 'FAC-002', zoneId: 'Z-F2-02', zoneName: 'Production Floor',
    severity: 'medium', metric: 'Equipment Sanitation',
    message: 'Equipment sanitation score below target in Production Floor',
    explanation: 'Sanitation score of 58/100 is below the 70/100 minimum threshold. Residue buildup observed on mixing blades and conveyor surfaces.',
    recommendedAction: 'Schedule deep cleaning of production equipment. Retrain sanitation crew on SOP. Reinspect within 48 hours.',
    timestamp: '2026-08-18 15:30', acknowledged: true,
  },
  {
    id: 'ALERT-005', factoryId: 'FAC-001', zoneId: 'Z-F1-01', zoneName: 'Raw Material Storage',
    severity: 'high', metric: 'Pest Activity',
    message: 'Pest activity above acceptable monitoring threshold in Raw Material Storage',
    explanation: 'Pest activity scored 3/10, above the 2/10 threshold. Minor insect presence noted near unprocessed milk containers.',
    recommendedAction: 'Apply preventive pest treatment. Seal entry points around dock doors. Re-inspect within 7 days.',
    timestamp: '2026-08-22 10:15', acknowledged: false,
  },
  {
    id: 'ALERT-006', factoryId: 'FAC-001', zoneId: 'Z-F1-05', zoneName: 'Waste Management Area',
    severity: 'critical', metric: 'Temperature',
    message: 'Temperature exceeds acceptable range in Waste Management Area',
    explanation: 'Temperature at 30°C exceeds the 28°C upper limit. Elevated temperature in waste areas increases odor and bacterial proliferation.',
    recommendedAction: 'Increase ventilation. Accelerate waste pickup schedule. Apply sanitizing agents.',
    timestamp: '2026-08-27 19:01', acknowledged: false,
  },
  {
    id: 'ALERT-007', factoryId: 'FAC-001', zoneId: 'Z-F1-05', zoneName: 'Waste Management Area',
    severity: 'high', metric: 'Humidity',
    message: 'Humidity exceeds target in Waste Management Area',
    explanation: 'Humidity at 74% exceeds the 70% target. Wet conditions foster microbial growth near disposal containers.',
    recommendedAction: 'Install exhaust fans. Ensure drainage is functioning. Deploy moisture-absorbing agents.',
    timestamp: '2026-08-27 19:01', acknowledged: false,
  },
  {
    id: 'ALERT-008', factoryId: 'FAC-004', zoneId: 'Z-F4-01', zoneName: 'Blending Unit',
    severity: 'low', metric: 'Worker Hygiene',
    message: 'Worker hygiene score approaching minimum in Blending Unit',
    explanation: 'Score of 74/100 is within warning range of the 75/100 minimum. Some operators observed without proper hair covering.',
    recommendedAction: 'Reinforce PPE compliance. Conduct brief refresher training. Post visual SOP reminders.',
    timestamp: '2026-08-20 11:00', acknowledged: true,
  },
];

// ═══════════════════════════════════════════════
// VIOLATIONS
// ═══════════════════════════════════════════════

export const MOCK_HYGIENE_VIOLATIONS: HygieneViolation[] = [
  {
    id: 'HV-001', factoryId: 'FAC-002', zoneId: 'Z-F2-01', zoneName: 'Raw Material Storage',
    parameter: 'Temperature', title: 'Temperature Exceedance — Raw Material Storage',
    description: 'Ambient temperature in raw material storage measured at 31°C, exceeding the 28°C upper monitoring threshold. Raw spices and grains are at risk of accelerated degradation.',
    severity: 'critical', actualValue: '31°C', threshold: '≤28°C',
    recommendation: 'Service HVAC system. Relocate heat-sensitive stock to auxiliary cold storage. Re-check within 24 hours.',
    status: 'open', detectedAt: '2026-08-27',
    evidence: { id: 'EV-001', type: 'monitoring-reading', title: 'Temperature Sensor Log', description: 'Automated sensor log showing sustained reading above 28°C for 2+ hours.', imageRef: 'sensor-log', capturedAt: '2026-08-27 18:55' },
  },
  {
    id: 'HV-002', factoryId: 'FAC-002', zoneId: 'Z-F2-01', zoneName: 'Raw Material Storage',
    parameter: 'Pest Activity', title: 'Pest Activity Exceeds Threshold — Raw Material Storage',
    description: 'Inspection assessment found pest activity at 5/10 (threshold: ≤2/10). Rodent droppings identified near grain storage bins.',
    severity: 'critical', actualValue: '5/10', threshold: '≤2/10',
    recommendation: 'Immediate pest control intervention. Quarantine affected raw materials. Submit samples for contamination testing.',
    status: 'open', detectedAt: '2026-08-18',
    evidence: { id: 'EV-002', type: 'photograph', title: 'Inspection Photo — Rodent Evidence', description: 'Visual evidence of rodent droppings near grain storage bin B3, captured during routine inspection.', imageRef: 'pest-photo', capturedAt: '2026-08-18 14:20' },
  },
  {
    id: 'HV-003', factoryId: 'FAC-002', zoneId: 'Z-F2-02', zoneName: 'Production Floor',
    parameter: 'Equipment Sanitation', title: 'Equipment Sanitation Below Standard — Production Floor',
    description: 'Sanitation assessment scored 58/100 (threshold: ≥70/100). Residue buildup on mixing blades and conveyor belt surfaces.',
    severity: 'high', actualValue: '58/100', threshold: '≥70/100',
    recommendation: 'Deep clean all production equipment following SOP-CLEAN-07. Retrain sanitation staff. Schedule re-inspection within 48 hours.',
    status: 'open', detectedAt: '2026-08-18',
    evidence: { id: 'EV-003', type: 'visual-observation', title: 'Visual Observation — Equipment Residue', description: 'Inspector noted visible residue buildup on mixing blade assembly and conveyor belt joints during walkthrough.', imageRef: 'equip-observation', capturedAt: '2026-08-18 15:30' },
  },
  {
    id: 'HV-004', factoryId: 'FAC-001', zoneId: 'Z-F1-01', zoneName: 'Raw Material Storage',
    parameter: 'Pest Activity', title: 'Pest Activity Above Threshold — Raw Material Storage',
    description: 'Pest activity scored 3/10 (threshold: ≤2/10). Minor insect presence near unprocessed milk containers.',
    severity: 'high', actualValue: '3/10', threshold: '≤2/10',
    recommendation: 'Apply preventive pest treatment around affected area. Seal potential entry points. Re-inspect within 7 days.',
    status: 'open', detectedAt: '2026-08-22',
    evidence: { id: 'EV-004', type: 'visual-observation', title: 'Visual Observation — Insect Presence', description: 'Minor insect activity observed near milk container bay during scheduled inspection.', imageRef: 'pest-visual', capturedAt: '2026-08-22 10:15' },
  },
  {
    id: 'HV-005', factoryId: 'FAC-001', zoneId: 'Z-F1-05', zoneName: 'Waste Management Area',
    parameter: 'Surface Cleanliness', title: 'Surface Cleanliness Below Standard — Waste Area',
    description: 'Surface cleanliness scored 58/100 (threshold: ≥70/100). Spillage residue and organic buildup on containment floor.',
    severity: 'medium', actualValue: '58/100', threshold: '≥70/100',
    recommendation: 'Power-wash containment area. Apply disinfectant. Increase daily cleaning frequency from 1x to 2x.',
    status: 'open', detectedAt: '2026-08-22',
    evidence: { id: 'EV-005', type: 'photograph', title: 'Inspection Photo — Floor Spillage', description: 'Photo of organic spillage residue on waste management area containment floor.', imageRef: 'surface-photo', capturedAt: '2026-08-22 11:00' },
  },
  {
    id: 'HV-006', factoryId: 'FAC-001', zoneId: 'Z-F1-03', zoneName: 'Packaging Area',
    parameter: 'Worker Hygiene', title: 'Worker Hygiene Approaching Minimum — Packaging',
    description: 'Worker hygiene scored 78/100 (threshold: ≥75/100, warning at ≥85). One staff member missing hairnet during shift.',
    severity: 'low', actualValue: '78/100', threshold: '≥75/100',
    recommendation: 'Issue verbal reminder. Ensure PPE stock is sufficient. Document for monthly compliance review.',
    status: 'remediated', detectedAt: '2026-08-22',
  },
];

// ═══════════════════════════════════════════════
// INSPECTIONS
// ═══════════════════════════════════════════════

export const MOCK_INSPECTIONS: HygieneInspection[] = [
  {
    id: 'INS-001', factoryId: 'FAC-001', inspector: 'Sunita Meena', inspectorBadge: 'LM-NZ-2041',
    date: '2026-08-22', score: 79, result: 'conditional-pass', findingsCount: 4, criticalCount: 0,
    findings: [
      'Pest activity above threshold in Raw Material Storage (3/10 vs ≤2/10)',
      'Surface cleanliness below standard in Waste Management Area (58/100)',
      'Worker hygiene marginal in Packaging Area (78/100)',
      'Equipment sanitation borderline in Raw Material Storage (68/100)',
    ],
    evidence: [
      { id: 'EV-INS1-01', type: 'photograph', title: 'Raw Material Storage — Overview', description: 'General condition photo of raw material storage area taken during inspection.', imageRef: 'ins-photo-1', capturedAt: '2026-08-22 09:30' },
      { id: 'EV-INS1-02', type: 'visual-observation', title: 'Waste Area — Floor Condition', description: 'Inspector observed spillage residue near containment bins.', imageRef: 'ins-photo-2', capturedAt: '2026-08-22 11:00' },
    ],
    notes: 'Overall facility is well-maintained. Storage zone requires attention for pest control and waste area needs improved cleaning schedule. Recommend follow-up in 14 days.',
  },
  {
    id: 'INS-002', factoryId: 'FAC-002', inspector: 'Vikram Thakur', inspectorBadge: 'LM-NZ-3018',
    date: '2026-08-18', score: 54, result: 'fail', findingsCount: 6, criticalCount: 2,
    findings: [
      'Temperature exceedance in Raw Material Storage (31°C vs ≤28°C)',
      'Pest activity critical in Raw Material Storage (5/10 vs ≤2/10)',
      'Equipment sanitation critical in Raw Material Storage (48/100 vs ≥70/100)',
      'Worker hygiene below standard in Raw Material Storage (60/100 vs ≥75/100)',
      'Waste management below standard in Raw Material Storage (45/100 vs ≥65/100)',
      'Equipment sanitation below standard in Production Floor (58/100 vs ≥70/100)',
    ],
    evidence: [
      { id: 'EV-INS2-01', type: 'photograph', title: 'Rodent Evidence — Grain Bins', description: 'Photo showing rodent droppings near grain storage bin B3.', imageRef: 'ins-photo-3', capturedAt: '2026-08-18 14:20' },
      { id: 'EV-INS2-02', type: 'monitoring-reading', title: 'Temperature Log — Storage Zone', description: 'Sensor log confirming sustained temperature above 28°C.', imageRef: 'ins-reading-1', capturedAt: '2026-08-18 14:00' },
    ],
    notes: 'Facility has significant deficiencies across multiple zones. Raw Material Storage is the primary concern with pest contamination and temperature control failure. Immediate corrective action required. Re-inspection mandated within 7 days.',
  },
  {
    id: 'INS-003', factoryId: 'FAC-003', inspector: 'Anjali Krishnan', inspectorBadge: 'LM-SZ-1055',
    date: '2026-08-25', score: 92, result: 'pass', findingsCount: 0, criticalCount: 0,
    findings: [],
    evidence: [
      { id: 'EV-INS3-01', type: 'photograph', title: 'Cold Storage — Compliant Conditions', description: 'Photo confirming proper temperature and organized storage.', imageRef: 'ins-photo-4', capturedAt: '2026-08-25 10:00' },
    ],
    notes: 'Excellent facility condition. All zones fully compliant. Cold storage and processing hall maintain outstanding hygiene standards. No corrective actions needed.',
  },
  {
    id: 'INS-004', factoryId: 'FAC-004', inspector: 'Sunita Meena', inspectorBadge: 'LM-NZ-2041',
    date: '2026-08-20', score: 78, result: 'conditional-pass', findingsCount: 2, criticalCount: 0,
    findings: [
      'Worker hygiene borderline in Blending Unit (74/100 vs ≥75/100)',
      'Equipment sanitation marginal in Blending Unit (72/100 vs ≥70/100)',
    ],
    evidence: [
      { id: 'EV-INS4-01', type: 'visual-observation', title: 'Blending Unit — PPE Compliance', description: 'One operator observed without proper hair covering during blending operations.', imageRef: 'ins-photo-5', capturedAt: '2026-08-20 11:00' },
    ],
    notes: 'Generally well-maintained pharmaceutical facility. Minor PPE compliance gap in Blending Unit. Operator counseled on-site. Recommend awareness session for entire shift.',
  },
  {
    id: 'INS-005', factoryId: 'FAC-001', inspector: 'Anjali Krishnan', inspectorBadge: 'LM-SZ-1055',
    date: '2026-07-15', score: 85, result: 'pass', findingsCount: 1, criticalCount: 0,
    findings: [
      'Minor labeling discrepancy on batch tracking sheets (administrative, non-hygiene).',
    ],
    evidence: [],
    notes: 'Routine quarterly inspection. Facility in good condition. Minor documentation issue flagged — not a hygiene concern. No corrective action required for hygiene parameters.',
  },
  {
    id: 'INS-006', factoryId: 'FAC-002', inspector: 'Sunita Meena', inspectorBadge: 'LM-NZ-2041',
    date: '2026-07-02', score: 61, result: 'conditional-pass', findingsCount: 3, criticalCount: 1,
    findings: [
      'Pest activity in Raw Material Storage (4/10 vs ≤2/10)',
      'Surface cleanliness below standard in Production Floor (62/100)',
      'Waste management needs improvement (58/100)',
    ],
    evidence: [
      { id: 'EV-INS6-01', type: 'photograph', title: 'Storage Area — Pest Signs', description: 'Evidence of insect presence near spice bins.', imageRef: 'ins-photo-6', capturedAt: '2026-07-02 13:00' },
    ],
    notes: 'Recurring pest issue in storage zone. Previous corrective actions partially implemented. Facility is on enhanced monitoring schedule.',
  },
];

// ═══════════════════════════════════════════════
// TREND DATA
// ═══════════════════════════════════════════════

export const MOCK_HYGIENE_TRENDS: HygieneTrendPoint[] = [
  { date: 'Jan 2026', score: 82, temperature: 18.5, humidity: 52, incidentCount: 3 },
  { date: 'Feb 2026', score: 80, temperature: 20.2, humidity: 50, incidentCount: 4 },
  { date: 'Mar 2026', score: 84, temperature: 22.0, humidity: 48, incidentCount: 2 },
  { date: 'Apr 2026', score: 81, temperature: 25.4, humidity: 55, incidentCount: 5 },
  { date: 'May 2026', score: 78, temperature: 28.1, humidity: 62, incidentCount: 6 },
  { date: 'Jun 2026', score: 75, temperature: 30.0, humidity: 68, incidentCount: 8 },
  { date: 'Jul 2026', score: 73, temperature: 29.5, humidity: 72, incidentCount: 9 },
  { date: 'Aug 2026', score: 76, temperature: 27.2, humidity: 66, incidentCount: 7 },
];

// ═══════════════════════════════════════════════
// AGGREGATE STATS
// ═══════════════════════════════════════════════

export const FACTORY_HYGIENE_STATS = {
  totalFactories: MOCK_FACTORIES.length,
  averageScore: Math.round(MOCK_FACTORIES.reduce((s, f) => s + f.overallScore, 0) / MOCK_FACTORIES.length),
  activeAlerts: MOCK_HYGIENE_ALERTS.filter(a => !a.acknowledged).length,
  inspectionsThisMonth: MOCK_INSPECTIONS.filter(i => i.date.startsWith('2026-08')).length,
  criticalFactories: MOCK_FACTORIES.filter(f => f.complianceStatus === 'critical').length,
  compliantFactories: MOCK_FACTORIES.filter(f => f.complianceStatus === 'compliant').length,
};
