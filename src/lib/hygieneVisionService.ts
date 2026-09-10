import { ViolationSeverity } from '../types/compliance';

export type VisionFindingCategory =
  | 'Dirty Floors'
  | 'Waste Accumulation'
  | 'Rusted Machinery'
  | 'Uncovered Raw Materials'
  | 'Water Leakage'
  | 'Missing PPE'
  | 'Improper Storage';

export interface VisionFinding {
  id: string;
  category: VisionFindingCategory;
  title: string;
  description: string;
  severity: ViolationSeverity;
  confidence: number;
  recommendation: string;
}

export interface VisualInspectionResult {
  imageUrl: string;
  findings: VisionFinding[];
  riskScore: number; // 0-100
  riskLevel: 'Low Risk' | 'Medium Risk' | 'High Risk';
  analyzedAt: string;
}

// A helper for random selections
const randomChoice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export async function analyzeFactoryImage(imageUrl: string): Promise<VisualInspectionResult> {
  // Simulate network delay for AI processing
  await new Promise((resolve) => setTimeout(resolve, 2500));

  // We want to generate a realistic mixture of 1-3 findings.
  const possibleCategories: VisionFindingCategory[] = [
    'Dirty Floors',
    'Waste Accumulation',
    'Rusted Machinery',
    'Uncovered Raw Materials',
    'Water Leakage',
    'Missing PPE',
    'Improper Storage',
  ];

  const findingCount = randomInt(1, 3);
  const shuffledCategories = [...possibleCategories].sort(() => 0.5 - Math.random());
  const selectedCategories = shuffledCategories.slice(0, findingCount);

  const severities: ViolationSeverity[] = ['low', 'medium', 'high', 'critical'];

  const findings: VisionFinding[] = selectedCategories.map((category, index) => {
    let severity: ViolationSeverity = 'medium';
    let description = '';
    let recommendation = '';

    switch (category) {
      case 'Dirty Floors':
        severity = randomChoice(['low', 'medium', 'high']);
        description = 'Accumulated dirt and uncleaned spills detected on the factory floor.';
        recommendation = 'Clean the area immediately and review daily mopping schedules.';
        break;
      case 'Waste Accumulation':
        severity = randomChoice(['medium', 'high', 'critical']);
        description = 'Accumulated waste detected near the production area without proper containment.';
        recommendation = 'Remove waste immediately and verify the waste disposal schedule.';
        break;
      case 'Rusted Machinery':
        severity = randomChoice(['medium', 'high']);
        description = 'Visible rust and corrosion detected on processing equipment surfaces.';
        recommendation = 'Schedule maintenance to treat/replace rusted parts to prevent contamination.';
        break;
      case 'Uncovered Raw Materials':
        severity = randomChoice(['high', 'critical']);
        description = 'Raw food materials left exposed without proper protective covering.';
        recommendation = 'Cover raw materials immediately to prevent airborne or pest contamination.';
        break;
      case 'Water Leakage':
        severity = randomChoice(['medium', 'high']);
        description = 'Standing water or active leakage detected in the facility.';
        recommendation = 'Repair the source of the leak and sanitize the affected floor area.';
        break;
      case 'Missing PPE':
        severity = randomChoice(['high', 'critical']);
        description = 'Worker(s) detected without required Personal Protective Equipment (hairnets/gloves).';
        recommendation = 'Ensure all workers wear mandated PPE before entering the production floor.';
        break;
      case 'Improper Storage':
        severity = randomChoice(['medium', 'high']);
        description = 'Items stored directly on the floor or blocking pathways improperly.';
        recommendation = 'Relocate items to designated pallets or shelving units.';
        break;
    }

    return {
      id: `vis-find-${Date.now()}-${index}`,
      category,
      title: `${category} Detected`,
      description,
      severity,
      confidence: randomInt(75, 98),
      recommendation,
    };
  });

  // Calculate a mock risk score. Higher is worse.
  // Base risk starts at 10-20. Add points based on severity of findings.
  let score = randomInt(10, 20);
  findings.forEach(f => {
    if (f.severity === 'low') score += randomInt(5, 10);
    if (f.severity === 'medium') score += randomInt(15, 25);
    if (f.severity === 'high') score += randomInt(30, 45);
    if (f.severity === 'critical') score += randomInt(40, 60);
  });
  
  // Cap at 100
  const riskScore = Math.min(score, 100);

  let riskLevel: 'Low Risk' | 'Medium Risk' | 'High Risk' = 'Low Risk';
  if (riskScore >= 61) riskLevel = 'High Risk';
  else if (riskScore >= 31) riskLevel = 'Medium Risk';

  return {
    imageUrl,
    findings,
    riskScore,
    riskLevel,
    analyzedAt: new Date().toISOString(),
  };
}
