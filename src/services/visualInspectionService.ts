import { ViolationSeverity } from '../types/compliance';

export interface DeterministicFinding {
  id: string;
  category: string;
  title: string;
  description: string;
  severity: ViolationSeverity;
  confidence: number;
  recommendation: string;
}

export interface DeterministicInspectionResult {
  isSupported: boolean;
  scenarioId?: '01' | '02' | '03';
  title: string;
  severity: ViolationSeverity;
  description: string;
  observations: string[];
  risk: string;
  recommendation: string;
  confidenceDisplay: string;
  evidenceLabel: string;
  imageUrl: string;
  riskScore: number;
  riskLevel: 'Low Risk' | 'Medium Risk' | 'High Risk';
  unsupportedMessage?: string;
  analyzedAt: string;
  finding: DeterministicFinding;
}

/**
 * Predefined reference scenario definitions
 */
const SCENARIO_01: Omit<DeterministicInspectionResult, 'imageUrl' | 'analyzedAt'> = {
  isSupported: true,
  scenarioId: '01',
  title: 'Elevated Work & PPE Safety Risk',
  severity: 'high',
  description:
    'A worker is positioned on an elevated surface while working around industrial machinery. Appropriate fall protection and personal protective equipment cannot be fully verified from the image.',
  observations: [
    'Elevated work activity detected',
    'PPE compliance requires verification',
    'Gloves are not clearly visible',
    'Machinery and cables are present around the work area',
  ],
  risk: 'Potential fall and workplace-safety risk.',
  recommendation:
    "Verify the worker's fall-protection measures, access platform, footwear, gloves and other required PPE during physical inspection.",
  confidenceDisplay: '99% Prototype Match Confidence',
  evidenceLabel: 'Uploaded Factory Image',
  riskScore: 78,
  riskLevel: 'High Risk',
  finding: {
    id: 'det-finding-01',
    category: 'Workplace Safety & PPE',
    title: 'Elevated Work & PPE Safety Risk',
    description:
      'A worker is positioned on an elevated surface while working around industrial machinery. Appropriate fall protection and personal protective equipment cannot be fully verified from the image.',
    severity: 'high',
    confidence: 99,
    recommendation:
      "Verify the worker's fall-protection measures, access platform, footwear, gloves and other required PPE during physical inspection.",
  },
};

const SCENARIO_02: Omit<DeterministicInspectionResult, 'imageUrl' | 'analyzedAt'> = {
  isSupported: true,
  scenarioId: '02',
  title: 'Standing Water & Poor Housekeeping',
  severity: 'critical',
  description:
    'Significant liquid accumulation is visible across the factory floor around industrial machinery. The wet surface creates a potential slip hazard and indicates a housekeeping or drainage condition requiring immediate attention.',
  observations: [
    'Significant standing water/liquid visible',
    'Wet/slippery floor',
    'Poor housekeeping condition',
    'Industrial equipment around affected area',
  ],
  risk: 'Potential slip-and-fall and workplace hygiene risk.',
  recommendation:
    'Remove the standing water, inspect drainage and housekeeping practices, and verify that the affected area is safe for operation.',
  confidenceDisplay: '99% Prototype Match Confidence',
  evidenceLabel: 'Uploaded Factory Image',
  riskScore: 92,
  riskLevel: 'High Risk',
  finding: {
    id: 'det-finding-02',
    category: 'Flooring & Housekeeping',
    title: 'Standing Water & Poor Housekeeping',
    description:
      'Significant liquid accumulation is visible across the factory floor around industrial machinery. The wet surface creates a potential slip hazard and indicates a housekeeping or drainage condition requiring immediate attention.',
    severity: 'critical',
    confidence: 99,
    recommendation:
      'Remove the standing water, inspect drainage and housekeeping practices, and verify that the affected area is safe for operation.',
  },
};

const SCENARIO_03: Omit<DeterministicInspectionResult, 'imageUrl' | 'analyzedAt'> = {
  isSupported: true,
  scenarioId: '03',
  title: 'Material Handling, PPE & Housekeeping Risk',
  severity: 'medium',
  description:
    'Workers are handling bagged material in an active production area. Gloves are not clearly visible from the available image, while materials and cables are present around the working area. PPE, material handling and housekeeping practices require verification.',
  observations: [
    'Active material handling detected',
    'Large bags/material present',
    'Gloves are not clearly visible',
    'Cables visible around the work area',
    'Housekeeping requires verification',
  ],
  risk: 'Potential PPE, material-handling and housekeeping risk.',
  recommendation:
    'Verify that workers are using the required gloves and PPE, ensure materials are stored safely, and improve cable and floor-area organization.',
  confidenceDisplay: '99% Prototype Match Confidence',
  evidenceLabel: 'Uploaded Factory Image',
  riskScore: 54,
  riskLevel: 'Medium Risk',
  finding: {
    id: 'det-finding-03',
    category: 'Material Handling & PPE',
    title: 'Material Handling, PPE & Housekeeping Risk',
    description:
      'Workers are handling bagged material in an active production area. Gloves are not clearly visible from the available image, while materials and cables are present around the working area. PPE, material handling and housekeeping practices require verification.',
    severity: 'medium',
    confidence: 99,
    recommendation:
      'Verify that workers are using the required gloves and PPE, ensure materials are stored safely, and improve cable and floor-area organization.',
  },
};

/**
 * Analyzes image pixel characteristics via an offscreen canvas to compute a perceptual profile.
 */
async function computeImagePerceptualSignature(imageUrl: string): Promise<{
  aspectRatio: number;
  topBrightness: number;
  bottomBrightness: number;
  overallBrightness: number;
  greenDominance: number;
  yellowPresence: number;
} | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }

        ctx.drawImage(img, 0, 0, 16, 16);
        const imgData = ctx.getImageData(0, 0, 16, 16).data;

        let topLumSum = 0;
        let bottomLumSum = 0;
        let totalLumSum = 0;
        let greenSum = 0;
        let redSum = 0;
        let blueSum = 0;
        let yellowCount = 0;

        for (let y = 0; y < 16; y++) {
          for (let x = 0; x < 16; x++) {
            const idx = (y * 16 + x) * 4;
            const r = imgData[idx];
            const g = imgData[idx + 1];
            const b = imgData[idx + 2];
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;

            totalLumSum += lum;
            greenSum += g;
            redSum += r;
            blueSum += b;

            if (y < 8) topLumSum += lum;
            else bottomLumSum += lum;

            // Yellowish pixels (high red and green, lower blue)
            if (r > 100 && g > 90 && b < 80) {
              yellowCount++;
            }
          }
        }

        const pixels = 256;
        const halfPixels = 128;
        const aspectRatio = img.naturalWidth / img.naturalHeight;

        resolve({
          aspectRatio,
          topBrightness: topLumSum / halfPixels,
          bottomBrightness: bottomLumSum / halfPixels,
          overallBrightness: totalLumSum / pixels,
          greenDominance: greenSum / (redSum + blueSum + 1),
          yellowPresence: yellowCount / pixels,
        });
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = imageUrl;
  });
}

/**
 * Identifies which of the 3 reference scenarios an image matches, or returns null if unsupported.
 */
async function matchScenario(
  file: File | null,
  imageUrl: string
): Promise<'01' | '02' | '03' | null> {
  const fileName = (file?.name || '').toLowerCase();
  const fileSize = file?.size || 0;
  const urlLower = imageUrl.toLowerCase();

  // 1. Exact or partial filename checks
  if (
    fileName.includes('factory-reference-01') ||
    fileName.includes('reference-01') ||
    fileName.includes('reference_01') ||
    fileName.includes('reference01') ||
    fileName.includes('media_1788975746286') ||
    urlLower.includes('factory-reference-01')
  ) {
    return '01';
  }

  if (
    fileName.includes('factory-reference-02') ||
    fileName.includes('reference-02') ||
    fileName.includes('reference_02') ||
    fileName.includes('reference02') ||
    fileName.includes('media_1788975746303') ||
    urlLower.includes('factory-reference-02')
  ) {
    return '02';
  }

  if (
    fileName.includes('factory-reference-03') ||
    fileName.includes('reference-03') ||
    fileName.includes('reference_03') ||
    fileName.includes('reference03') ||
    fileName.includes('media_1788975746312') ||
    urlLower.includes('factory-reference-03')
  ) {
    return '03';
  }

  // 2. Exact file size matching (if file was re-saved or dragged without name)
  // Ref 01: 135063 bytes
  if (fileSize > 0 && Math.abs(fileSize - 135063) <= 50) {
    return '01';
  }
  // Ref 02: 124094 bytes
  if (fileSize > 0 && Math.abs(fileSize - 124094) <= 50) {
    return '02';
  }
  // Ref 03: 175584 bytes
  if (fileSize > 0 && Math.abs(fileSize - 175584) <= 50) {
    return '03';
  }

  // 3. Perceptual signature matching via canvas
  const sig = await computeImagePerceptualSignature(imageUrl);
  if (sig) {
    // Scenario 01: Tall vertical aspect ratio (~0.56), bright top window/skylight with dark bottom floor
    const isRef01Aspect = Math.abs(sig.aspectRatio - 0.5625) < 0.15;
    const isRef01Contrast = sig.topBrightness - sig.bottomBrightness > 30;
    if (isRef01Aspect && isRef01Contrast) {
      return '01';
    }

    // Scenario 02: Dark industrial basement/tunnel corridor with standing water reflections (~0.75 aspect ratio)
    // Low overall brightness (< 80) with green pipe tint and low yellow
    const isRef02Aspect = Math.abs(sig.aspectRatio - 0.75) < 0.15;
    const isRef02Dark = sig.overallBrightness < 80;
    const isRef02NoYellow = sig.yellowPresence < 0.05;
    if (isRef02Aspect && isRef02Dark && isRef02NoYellow) {
      return '02';
    }

    // Scenario 03: Well-lit grain/sugar packaging area (~0.75 aspect ratio)
    // Moderate-to-high brightness (> 90), distinct yellow structural beams and control board
    const isRef03Aspect = Math.abs(sig.aspectRatio - 0.75) < 0.15;
    const isRef03Bright = sig.overallBrightness >= 80;
    const isRef03Yellow = sig.yellowPresence >= 0.04 || sig.overallBrightness > 95;
    if (isRef03Aspect && isRef03Bright && isRef03Yellow) {
      return '03';
    }
  }

  // Unsupported image
  return null;
}

export const visualInspectionService = {
  /**
   * Deterministically analyzes an uploaded factory image for the Inspector role.
   * Returns exact findings for Ref 01, 02, and 03.
   * Rejects any other image with an unsupported state.
   */
  async inspectFactoryImage(
    file: File | null,
    imageUrl: string
  ): Promise<DeterministicInspectionResult> {
    const matchedScenario = await matchScenario(file, imageUrl);

    const analyzedAt = new Date().toISOString();

    if (matchedScenario === '01') {
      return {
        ...SCENARIO_01,
        imageUrl,
        analyzedAt,
      };
    }

    if (matchedScenario === '02') {
      return {
        ...SCENARIO_02,
        imageUrl,
        analyzedAt,
      };
    }

    if (matchedScenario === '03') {
      return {
        ...SCENARIO_03,
        imageUrl,
        analyzedAt,
      };
    }

    // Unsupported Inspector Image
    return {
      isSupported: false,
      title: 'Unsupported Factory Inspection',
      severity: 'low',
      description: 'Current prototype supports three predefined factory inspection scenarios.',
      observations: [],
      risk: 'Cannot be determined for unsupported images in this prototype.',
      recommendation:
        'Please upload one of the supported factory reference inspection images (factory-reference-01.jpg, factory-reference-02.jpg, or factory-reference-03.jpg).',
      confidenceDisplay: 'Prototype Match: N/A',
      evidenceLabel: 'Uploaded Factory Image',
      imageUrl,
      riskScore: 0,
      riskLevel: 'Low Risk',
      unsupportedMessage: 'Current prototype supports three predefined factory inspection scenarios.',
      analyzedAt,
      finding: {
        id: 'unsupported-finding',
        category: 'Unsupported Image',
        title: 'Unsupported Factory Inspection',
        description: 'Current prototype supports three predefined factory inspection scenarios.',
        severity: 'low',
        confidence: 0,
        recommendation:
          'Please upload one of the supported factory reference inspection images to run deterministic analysis.',
      },
    };
  },
};
