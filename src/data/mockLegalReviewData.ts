/**
 * Mock Legal Review Data — AI Legal Review Agent
 *
 * All documents, findings, and rules are SAMPLES / PROTOTYPES.
 * They do not represent real regulations or legal opinions.
 */

import type {
  ReviewDocument,
  AIAnalysisResult,
  AIFinding,
  FindingSeverity,
} from '../types/legalReview';

// ─── Sample Documents ────────────────────────────────────────────────────────

export const MOCK_LEGAL_DOCUMENTS: ReviewDocument[] = [
  {
    id: 'doc-001',
    title: 'Product Label — NutriVita Health Drink',
    documentType: 'Product Label',
    referenceNumber: 'PLR/2025/LM-04871',
    issuer: 'NutriVita Foods Pvt. Ltd.',
    date: '2025-06-15',
    status: 'pending',
    summary:
      'Product label for NutriVita Premium Health Drink (500ml). Contains nutritional declarations, health claims, and manufacturing details.',
    content: `PRODUCT LABEL — NutriVita Premium Health Drink

[SAMPLE / PROTOTYPE DOCUMENT — NOT A REAL PRODUCT LABEL]

Product Name: NutriVita Premium Health Drink
Net Quantity: 500 ml
MRP: ₹245 (Inclusive of all taxes)
Batch No: NV-2025-B0471
Date of Manufacturing: 15-JUN-2025
Best Before: 12 months from date of manufacturing

Ingredients: Water, Sugar, Milk Solids (8%), Cocoa Powder (3%), Vitamins (A, B1, B2, B6, B12, C, D, E), Minerals (Iron, Calcium, Zinc), Stabilizer (INS 460(i)), Emulsifier (INS 322(i)), Artificial Flavoring Substances (Chocolate), Preservative (INS 211).

NUTRITIONAL INFORMATION (per 100ml):
Energy: 85 kcal | Protein: 2.1g | Total Fat: 1.5g | Saturated Fat: 0.9g | Trans Fat: 0g
Total Carbohydrates: 15.2g | Total Sugars: 12.8g | Added Sugars: 10.5g | Sodium: 45mg

HEALTH CLAIMS:
"Guaranteed to prevent disease and boost immunity by 300%"
"Clinically proven to increase height in children within 30 days"
"100% natural ingredients — no chemicals"

ALLERGEN INFORMATION: Contains milk.
NOTE: May contain traces of nuts and soy.

Country of Origin: India
Manufactured by: NutriVita Foods Pvt. Ltd., Plot 42, MIDC Taloja, Navi Mumbai — 410208
Customer Care: 1800-200-NUTRI | complaints@nutrivita-sample.in

MARKETED BY: NutriVita Distribution India Ltd.

[END OF SAMPLE DOCUMENT]`,
  },
  {
    id: 'doc-002',
    title: 'Digital Ad — PureGlow Skin Cream Campaign',
    documentType: 'Advertising Claim',
    referenceNumber: 'ADV/2025/ASCI-09234',
    issuer: 'PureGlow Cosmetics India',
    date: '2025-07-22',
    status: 'pending',
    summary:
      'Digital advertising copy for PureGlow Advanced Whitening Cream social media campaign. Contains product benefit claims requiring substantiation.',
    content: `DIGITAL ADVERTISING COPY — PureGlow Advanced Whitening Cream

[SAMPLE / PROTOTYPE DOCUMENT — NOT A REAL ADVERTISEMENT]

Campaign ID: PG-DIG-2025-Q3-001
Platform: Instagram, Facebook, YouTube
Target Audience: Women, 18-45 years

═══ AD COPY ═══

🌟 Introducing PureGlow Advanced Whitening Cream! 🌟

✅ Dermatologist Recommended — #1 Whitening Cream in India
✅ Guaranteed 3-shade lighter skin in just 7 days
✅ Permanent results with regular use
✅ 100% Safe — Zero Side Effects
✅ Made with revolutionary Swiss nanotechnology

"I went from dark to fair in just one week!" — Priya S., Delhi
"My skin has never looked this good!" — Anonymous Verified Buyer

SPECIAL OFFER: Buy 1 Get 1 FREE — Limited period only!
(Original Price: ₹1,999 | Offer Price: ₹999)

Ingredients: Aqua, Niacinamide, Glutathione, Hyaluronic Acid, Kojic Acid, Titanium Dioxide, Fragrance.

DISCLAIMER (in 4pt font at bottom): "Results may vary. Not a substitute for medical treatment."

═══ INFLUENCER BRIEF ═══

Key Messaging:
- Emphasize GUARANTEED results
- Use before/after photos (studio lighting allowed)
- Do NOT mention possible side effects
- Do NOT reference competitor products by name
- Claim "dermatologically tested" (test report pending)

[END OF SAMPLE DOCUMENT]`,
  },
  {
    id: 'doc-003',
    title: 'Compliance Notice — GreenPack Facility Audit',
    documentType: 'Compliance Notice',
    referenceNumber: 'LM/2025/AUD-11092',
    issuer: 'GreenPack Packaging & Processing Ltd.',
    date: '2025-08-10',
    status: 'pending',
    summary:
      'Annual packaging and legal metrology compliance notice for GreenPack packaging facility. Contains audit findings and corrective action declarations.',
    content: `PACKAGING & METROLOGY COMPLIANCE NOTICE — Annual Facility Audit

[SAMPLE / PROTOTYPE DOCUMENT — NOT A REAL COMPLIANCE NOTICE]

Notice Reference: LM/2025/AUD-11092
Facility: GreenPack Packaging Unit, Sector 18, Manesar, Gurugram
Registration No: IND-HR-2022-00481
Audit Date: 10-AUG-2025
Auditor: Internal Quality & Metrology Team

═══ COMPLIANCE DECLARATIONS ═══

1. Automatic Checkweigher Calibration:
   - Line A: Calibrated against NABL weights (Compliant)
   - Line B: Calibration drift recorded (+3.5g over tolerance on 05-AUG-2025)
   - Line C: Calibration logger malfunction — "no log available for July 2025"

2. Statutory Font Sizing on Secondary Packaging:
   - Master cartons: Missing mandatory 4mm numeral height for gross weight
   - Barcode scanning: Grade B verification achieved

3. Mandatory Declarations Review:
   - Date of packing format: Inconsistent MM/YY vs DD/MM/YYYY across batches
   - Unit Sale Price font size: 2.1mm (minimum requirement is 3.0mm)

4. Traceability System:
   - Batch recall drill last conducted: "Not conducted in current financial year"
   - Master carton to unit pack correlation: "Partially implemented"

DECLARATION:
"We hereby declare that packaging operations at the above facility comply with
applicable Legal Metrology and consumer protection standards. Minor gaps identified above
are being addressed as per our continuous improvement plan."

Signed: Rajesh Mehta, Plant Manager
Date: 10-AUG-2025

[END OF SAMPLE DOCUMENT]`,
  },
];

// ─── Mock Findings Per Document ──────────────────────────────────────────────

const createFinding = (
  id: string,
  title: string,
  severity: FindingSeverity,
  confidence: number,
  matchedRule: string,
  evidence: string,
  explanation: string,
  recommendation: string
): AIFinding => ({
  id,
  title,
  severity,
  confidence,
  matchedRule,
  evidence,
  explanation,
  recommendation,
  status: 'open',
  isExpanded: false,
});

const DOC_001_FINDINGS: AIFinding[] = [
  createFinding(
    'f-001-1',
    'Unsupported Absolute Health Claim',
    'critical',
    94,
    'Sample Regulatory Rule — Misleading Claims (Consumer Protection Guidelines 2022)',
    '"Guaranteed to prevent disease and boost immunity by 300%"',
    'The label makes an absolute therapeutic claim ("prevent disease") and a quantified immunity claim ("boost immunity by 300%") without any supporting clinical evidence or disclaimers. Under consumer protection and advertising standards, health claims must be scientifically substantiated and cannot guarantee prevention of disease.',
    'Remove or substantially modify the health claim. Replace with a qualified statement such as "May help support immune function as part of a balanced diet" with appropriate disclaimers and references to supporting studies.'
  ),
  createFinding(
    'f-001-2',
    'Unverifiable Growth Claim Targeting Children',
    'high',
    91,
    'Sample Regulatory Rule — Misleading Claims & Child-Targeted Advertising',
    '"Clinically proven to increase height in children within 30 days"',
    'The claim targets children with a specific, time-bound physiological outcome ("increase height within 30 days") and uses the phrase "clinically proven" without referencing any published clinical study. This constitutes a misleading claim under consumer protection regulations.',
    'Remove the claim entirely. If clinical studies exist, reference them with proper citations. Do not make time-bound physiological promises targeting children.'
  ),
  createFinding(
    'f-001-3',
    'False "100% Natural" Declaration',
    'medium',
    88,
    'Sample Regulatory Rule — Natural/Organic Claims Substantiation',
    '"100% natural ingredients — no chemicals" (Ingredients list includes: Artificial Flavoring Substances, Preservative INS 211, Stabilizer INS 460(i), Emulsifier INS 322(i))',
    'The label claims "100% natural ingredients — no chemicals" while the ingredients list explicitly includes artificial flavoring substances and multiple synthetic food additives (INS 211 — Sodium Benzoate, INS 460(i) — Microcrystalline Cellulose). This is a directly contradictory and misleading statement.',
    'Remove the "100% natural" claim or reformulate the product to remove artificial additives. If certain ingredients are naturally derived, use precise language such as "Made with select natural ingredients."'
  ),
  createFinding(
    'f-001-4',
    'Incomplete Allergen Cross-Contamination Notice',
    'low',
    76,
    'Sample Regulatory Rule — Allergen Declaration Requirements',
    '"NOTE: May contain traces of nuts and soy." — listed as a side note rather than in a dedicated allergen section.',
    'The allergen cross-contamination notice is present but does not follow the recommended formatting guidelines. Allergen information should be prominently displayed in a dedicated, clearly demarcated section with appropriate font sizing, not as a peripheral note.',
    'Move allergen information to a dedicated "ALLERGEN DECLARATION" section with bold or contrasting text formatting. Ensure all major allergens are addressed or declared absent.'
  ),
];

const DOC_002_FINDINGS: AIFinding[] = [
  createFinding(
    'f-002-1',
    'Guaranteed Skin Lightening Outcome',
    'critical',
    96,
    'Sample Regulatory Rule — Cosmetic Advertising Standards (ASCI Guidelines)',
    '"Guaranteed 3-shade lighter skin in just 7 days" and "Permanent results with regular use"',
    'The advertisement guarantees a specific quantified cosmetic outcome ("3-shade lighter") within a defined timeframe ("7 days") and claims permanence. Such guarantees are prohibited under advertising standards for cosmetics as they cannot be universally substantiated and create unrealistic expectations.',
    'Remove all guaranteed outcome claims. Replace with qualified language such as "May help improve skin tone with regular use. Individual results may vary." Include a prominent, readable disclaimer.'
  ),
  createFinding(
    'f-002-2',
    'Suppression of Safety Information',
    'high',
    92,
    'Sample Regulatory Rule — Consumer Safety Disclosure Requirements',
    'Influencer brief states: "Do NOT mention possible side effects" and "Claim dermatologically tested (test report pending)"',
    'The advertising brief explicitly instructs content creators to suppress safety-relevant information and to make unverified testing claims. Deliberately concealing potential side effects and claiming test certifications that do not yet exist constitutes deceptive advertising practice.',
    'Mandate full safety disclosure in all advertising materials. Do not claim "dermatologically tested" until a valid, complete test report is available. Include side-effect information in influencer guidelines.'
  ),
  createFinding(
    'f-002-3',
    'Misleading Price Comparison (Dark Pattern)',
    'medium',
    85,
    'Sample Regulatory Rule — Price Transparency & Dark Patterns',
    '"Original Price: ₹1,999 | Offer Price: ₹999" — presented as limited-period offer',
    'The advertisement displays a significant price reduction (50% off) as a "limited period" offer without evidence that the product was ever sold at the stated "original price" of ₹1,999. This may constitute a dark pattern under consumer protection guidelines regarding misleading price comparisons.',
    'Provide verifiable evidence of the original selling price (e.g., price history over the last 90 days). If the product was never sold at ₹1,999, remove the comparison price or adjust the advertised discount.'
  ),
];

const DOC_003_FINDINGS: AIFinding[] = [
  createFinding(
    'f-003-1',
    'Checkweigher Calibration Tolerance Drift',
    'high',
    93,
    'Legal Metrology (General) Rules — Weighing Instrument Calibration',
    '"Line B: Calibration drift recorded (+3.5g over tolerance on 05-AUG-2025)"',
    'Checkweigher equipment exceeded permissible error limits under Legal Metrology calibration standards. Operating with uncalibrated automated filling lines risks systemic net quantity violations.',
    'Perform immediate recalibration with certified standard weights and re-verify previous batch records.'
  ),
  createFinding(
    'f-003-2',
    'Unit Sale Price Font Height Below Minimum Threshold',
    'medium',
    87,
    'Legal Metrology (Packaged Commodities) Rules, 2011 — Rule 6(1)(aa) & Rule 7',
    '"Unit Sale Price font size: 2.1mm (minimum requirement is 3.0mm)"',
    'The Unit Sale Price declaration does not satisfy the mandatory minimum font size requirements based on packaging area dimensions under Rule 7.',
    'Update packaging artwork plates to ensure Unit Sale Price font height meets the minimum 3.0mm threshold.'
  ),
  createFinding(
    'f-003-3',
    'Incomplete Master Carton Traceability',
    'low',
    79,
    'Packaging Standardization & Traceability Guidelines',
    '"Master carton to unit pack correlation: Partially implemented"',
    'Master carton tracking is not fully correlated with inner retail pack serial numbers, creating traceability friction during quality audits.',
    'Implement end-to-end 2D matrix barcode correlation across primary and secondary packaging tiers.'
  ),
];

// ─── Pre-computed Analysis Results ───────────────────────────────────────────

function computeAverageConfidence(findings: AIFinding[]): number {
  if (findings.length === 0) return 0;
  const sum = findings.reduce((acc, f) => acc + f.confidence, 0);
  return Math.round(sum / findings.length);
}

function computeOverallRisk(
  findings: AIFinding[]
): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE' {
  if (findings.some((f) => f.severity === 'critical')) return 'CRITICAL';
  if (findings.some((f) => f.severity === 'high')) return 'HIGH';
  if (findings.some((f) => f.severity === 'medium')) return 'MEDIUM';
  if (findings.some((f) => f.severity === 'low')) return 'LOW';
  return 'NONE';
}

export const MOCK_ANALYSIS_RESULTS: Record<string, AIAnalysisResult> = {
  'doc-001': {
    id: 'analysis-001',
    documentId: 'doc-001',
    overallRisk: computeOverallRisk(DOC_001_FINDINGS),
    findings: DOC_001_FINDINGS,
    averageConfidence: computeAverageConfidence(DOC_001_FINDINGS),
    analyzedAt: new Date().toISOString(),
    status: 'complete',
  },
  'doc-002': {
    id: 'analysis-002',
    documentId: 'doc-002',
    overallRisk: computeOverallRisk(DOC_002_FINDINGS),
    findings: DOC_002_FINDINGS,
    averageConfidence: computeAverageConfidence(DOC_002_FINDINGS),
    analyzedAt: new Date().toISOString(),
    status: 'complete',
  },
  'doc-003': {
    id: 'analysis-003',
    documentId: 'doc-003',
    overallRisk: computeOverallRisk(DOC_003_FINDINGS),
    findings: DOC_003_FINDINGS,
    averageConfidence: computeAverageConfidence(DOC_003_FINDINGS),
    analyzedAt: new Date().toISOString(),
    status: 'complete',
  },
};

// ─── Chat Response Templates (Keyword-matched, deterministic) ────────────────

interface ChatTemplate {
  keywords: string[];
  getResponse: (docTitle: string, findings: AIFinding[]) => string;
}

export const CHAT_TEMPLATES: ChatTemplate[] = [
  {
    keywords: ['risk', 'risky', 'danger', 'dangerous', 'highest risk', 'most severe', 'worst'],
    getResponse: (docTitle, findings) => {
      const critical = findings.filter((f) => f.severity === 'critical');
      const high = findings.filter((f) => f.severity === 'high');
      if (critical.length > 0) {
        return `[Prototype AI Assistant]\n\nThe highest-risk finding in "${docTitle}" is:\n\n🔴 "${critical[0].title}" (Confidence: ${critical[0].confidence}%)\n\nThis was flagged as CRITICAL because: ${critical[0].explanation}\n\nRecommended action: ${critical[0].recommendation}`;
      }
      if (high.length > 0) {
        return `[Prototype AI Assistant]\n\nThe highest-risk finding is:\n\n🟠 "${high[0].title}" (Confidence: ${high[0].confidence}%)\n\n${high[0].explanation}`;
      }
      return `[Prototype AI Assistant]\n\nNo critical or high-risk findings were identified in this document. Review the medium and low-severity items for completeness.`;
    },
  },
  {
    keywords: ['regulation', 'rule', 'violat', 'law', 'act', 'section', 'legal'],
    getResponse: (_docTitle, findings) => {
      const rules = findings.map((f) => `• ${f.matchedRule}`);
      return `[Prototype AI Assistant]\n\nThe following sample regulatory rules were matched in this analysis:\n\n${rules.join('\n')}\n\n⚠️ Note: These are sample regulatory rules created for prototype demonstration purposes. They do not represent actual legal provisions.`;
    },
  },
  {
    keywords: ['evidence', 'proof', 'show me', 'where', 'quote', 'text'],
    getResponse: (_docTitle, findings) => {
      const evidenceList = findings
        .map((f) => `• [${f.severity.toUpperCase()}] ${f.title}:\n  Evidence: ${f.evidence}`)
        .join('\n\n');
      return `[Prototype AI Assistant]\n\nHere is the evidence extracted for each finding:\n\n${evidenceList}`;
    },
  },
  {
    keywords: ['action', 'recommend', 'fix', 'correct', 'what should', 'how to', 'resolve'],
    getResponse: (_docTitle, findings) => {
      const recs = findings
        .map((f, i) => `${i + 1}. [${f.severity.toUpperCase()}] ${f.title}:\n   → ${f.recommendation}`)
        .join('\n\n');
      return `[Prototype AI Assistant]\n\nRecommended corrective actions:\n\n${recs}`;
    },
  },
  {
    keywords: ['summary', 'summarize', 'overview', 'overall', 'brief'],
    getResponse: (docTitle, findings) => {
      const bySeverity = {
        critical: findings.filter((f) => f.severity === 'critical').length,
        high: findings.filter((f) => f.severity === 'high').length,
        medium: findings.filter((f) => f.severity === 'medium').length,
        low: findings.filter((f) => f.severity === 'low').length,
      };
      const avg = findings.length > 0
        ? Math.round(findings.reduce((a, f) => a + f.confidence, 0) / findings.length)
        : 0;
      return `[Prototype AI Assistant]\n\nDocument Summary: "${docTitle}"\n\nTotal Findings: ${findings.length}\n🔴 Critical: ${bySeverity.critical}\n🟠 High: ${bySeverity.high}\n🟡 Medium: ${bySeverity.medium}\n🔵 Low: ${bySeverity.low}\n\nAverage Confidence: ${avg}%\n\nThis is a simulated analysis for prototype demonstration purposes.`;
    },
  },
  {
    keywords: ['hello', 'hi', 'hey', 'help', 'what can you'],
    getResponse: () => {
      return `[Prototype AI Assistant]\n\nHello! I can help you understand the AI legal review analysis for the selected document. Try asking:\n\n• "What is the highest risk finding?"\n• "Which regulations does this violate?"\n• "Show me the evidence for each finding."\n• "What corrective actions should I take?"\n• "Summarize this document's analysis."\n\n⚠️ This is a prototype assistant providing simulated responses. It does not constitute legal advice.`;
    },
  },
];

/**
 * Generate a deterministic chat response based on keyword matching.
 */
export function generateMockResponse(
  userMessage: string,
  docTitle: string,
  findings: AIFinding[]
): string {
  const lower = userMessage.toLowerCase();

  for (const template of CHAT_TEMPLATES) {
    if (template.keywords.some((kw) => lower.includes(kw))) {
      return template.getResponse(docTitle, findings);
    }
  }

  // Fallback response
  return `[Prototype AI Assistant]\n\nThank you for your question about "${docTitle}". Based on the analysis, ${findings.length} finding(s) were identified.\n\nTry asking about:\n• Specific risks or severity levels\n• Matched regulatory rules\n• Evidence and recommendations\n• A summary of the analysis\n\n⚠️ This is a prototype response. It does not constitute legal advice.`;
}
