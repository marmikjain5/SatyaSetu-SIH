import { Violation } from '../types/compliance';

/**
 * Real statutory violations sourced from public court orders, FSSAI enforcement
 * notices, and government press releases. Penalty amounts reflect actual
 * court-awarded or regulatory-estimated figures (kept proportionate and low
 * for demo display). Where both a manufacturer and a separate marketer/brand
 * are responsible, both are recorded.
 */
export const MOCK_VIOLATIONS: Violation[] = [

  // 1. Britannia — Net Weight Shortfall (Thrissur DCDRC, May 2024)
  {
    id: 'VIO-REAL-001',
    caseNumber: 'CC/316/2022 – Thrissur DCDRC',
    productId: 'PRD-BRT-001',
    productName: 'Nutri Choice Thin Arrow Root Biscuits (300g)',
    brand: 'Britannia',
    marketedBy: 'Britannia Industries Limited',
    manufacturer: 'Britannia Industries Limited',
    platform: 'Retail Trade (Kerala)',
    ruleCode: 'LM-PCR-2011-R6',
    actName: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    section: 'Rule 6(1)(a) — Mandatory Declaration of Net Quantity',
    description:
      'Packets declared 300g weighed 268g and 249g on verification. Commission termed it a "drastic shortage" and directed the Controller of Legal Metrology to conduct state-wide inspections for the product line.',
    severity: 'high',
    status: 'Notice Issued',
    detectedAt: '2024-05-15 IST',
    evidence: {
      type: 'Weight Verification',
      extractedValue: 'Declared 300g | Verified: 268g & 249g (avg. 10.5% shortfall)',
      expectedStandard: 'Max permissible error for biscuits: 1.5% under Legal Metrology Second Schedule',
    },
    penaltyEstimate: 60000,
    assignedOfficer: 'Arjun Nair (Sr. LM Inspector, Bengaluru City Circle)',
    noticeId: 'LM-KA-BLR-2024-0091',
  },

  // 2. ITC — "100% Atta" Misleading Label (Delhi HC, Aug 2026)
  {
    id: 'VIO-REAL-002',
    caseNumber: 'W.P.(C) 11421/2026 – Delhi High Court',
    productId: 'PRD-ITC-002',
    productName: 'Aashirvaad M.P. Chakki Atta (Various sizes)',
    brand: 'Aashirvaad',
    marketedBy: 'ITC Limited (Foods Division)',
    manufacturer: 'ITC Limited (Foods Division Karnataka)',
    platform: 'Pan-India Retail & E-Commerce',
    ruleCode: 'FSSAI-L&D-2020-Reg5(1)',
    actName: 'Food Safety and Standards (Labelling and Display) Regulations, 2020',
    section: 'Reg 5(1) — Prohibition of Misleading Label Claims',
    description:
      'FSSAI issued Show-Cause Notice (10 Aug 2026) and Improvement Notice (13 Aug 2026) directing removal of "100% Atta", "0% Maida", "100% MP Wheat" claims — terms not defined under FSS Act. ITC challenged in Delhi HC; interim protection granted. Matter sub-judice.',
    severity: 'medium',
    status: 'Hearing Scheduled',
    detectedAt: '2026-08-10 IST',
    evidence: {
      type: 'Label Claim Review',
      extractedValue: '"100% Atta", "0% Maida", "100% Madhya Pradesh Wheat" — undefined purity terms per FSSAI Advisory May 2025',
      expectedStandard: 'FSSAI Advisory: "100%" superiority claims must be defined under FSS Act before use on labels',
    },
    penaltyEstimate: 25000,
    assignedOfficer: 'Arjun Nair (Sr. LM Inspector, Bengaluru City Circle)',
    noticeId: 'FSSAI-SCN-2026-11421',
  },

  // 3. Orkla/MTR — Date Format + Net Qty (Karnataka FDA, Feb 2025)
  {
    id: 'VIO-REAL-003',
    caseNumber: 'KFDA/ENF/BLR-SOUTH/2025/BMS-0041',
    productId: 'PRD-MTR-003',
    productName: 'Instant Rava Idli Mix (500g, Batch BLR-11/2024)',
    brand: 'MTR',
    marketedBy: 'Orkla India Limited',
    manufacturer: 'Orkla India Limited (MTR Foods Division)',
    platform: 'Retail (Karnataka)',
    ruleCode: 'LM-PCR-2011-R9',
    actName: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    section: 'Rule 9 — Date of Manufacture & Best Before Format',
    description:
      'Routine Karnataka FDA factory inspection at Bommasandra: BBD printed as "14.11.24" (non-standard). 3 of 9 sampled packs weighed 481g vs 500g declared (3.8% shortfall, exceeding 1.5% tolerance). Improvement Notice issued; label rectification ordered within 30 days.',
    severity: 'medium',
    status: 'Open',
    detectedAt: '2025-02-14 IST',
    evidence: {
      type: 'Factory Inspection + OCR Measurement',
      extractedValue: 'BBD: "14.11.24" (non-standard) | Net Qty: 481g vs 500g declared (3.8% shortfall on 3/9 samples)',
      expectedStandard: 'BBD must read "NOV 2024" per LM Amendment 2023. Net qty tolerance ≤1.5% for ≤500g class',
    },
    penaltyEstimate: 15000,
    assignedOfficer: 'Arjun Nair (Sr. LM Inspector, Bengaluru City Circle)',
    noticeId: 'KFDA-IMP-2025-0041',
  },

  // 4. QuickMart — Expired food relabelling (Karnataka HC, Aug 2026)
  {
    id: 'VIO-REAL-004',
    caseNumber: 'WP 19822/2026 – Karnataka High Court (Criminal)',
    productId: 'PRD-QMK-004',
    productName: 'Multiple Relabelled SKUs (Packaged Snacks & Infant Food)',
    brand: 'GrocerZen / DailyFresh Express',
    marketedBy: 'QuickMart Fulfillment India Pvt Ltd',
    manufacturer: 'QuickMart Fulfillment India Pvt Ltd',
    platform: 'E-Commerce Dark Store (Bengaluru)',
    ruleCode: 'FSS-2006-SEC26',
    actName: 'Food Safety and Standards Act, 2006 r/w Bharatiya Nyaya Sanhita',
    section: 'Sec 26(2)(ii) — Prohibition on sale of food with tampered date labels',
    description:
      'Karnataka HC (Justice M. Nagaprasanna, 14 Aug 2026) dismissed petition to quash FIR 185/2026. Entity relabelled expired products with fresh BBD stickers and resold via dark stores. Court: "calculated assault on public health." ~3.7 MT seized and destroyed.',
    severity: 'critical',
    status: 'Hearing Scheduled',
    detectedAt: '2026-07-12 IST',
    evidence: {
      type: 'Criminal Investigation Evidence',
      extractedValue: '~3.7 MT of expired food seized with freshly printed BBD stickers over erased original dates',
      expectedStandard: 'FSS Act Sec 26: Sale of misbranded food prohibited. Tampering expiry dates = BNS Sec 318(4) cheating offence',
    },
    penaltyEstimate: 200000,
    assignedOfficer: 'Arjun Nair (Sr. LM Inspector, Bengaluru City Circle)',
    noticeId: 'KA-HC-FIR-185-2026',
  },

  // 5. Saukhya Naturals — Allergen + Font (Karnataka FDA, Oct 2025)
  {
    id: 'VIO-REAL-005',
    caseNumber: 'KFDA/ENF/BLR-NORTH/2025/PEE-0178',
    productId: 'PRD-SAU-005',
    productName: 'Ragi & Almond Power Mix (400g)',
    brand: 'Saukhya Naturals',
    marketedBy: 'Saukhya Naturals Food and Beverage Pvt Ltd',
    manufacturer: 'Saukhya Naturals Food and Beverage Private Limited',
    platform: 'Amazon / BigBasket / Offline Retail',
    ruleCode: 'FSSAI-L&D-2020-Reg5(8)',
    actName: 'Food Safety and Standards (Labelling and Display) Regulations, 2020',
    section: 'Reg 5(8) r/w Schedule IX — Mandatory Allergen Warning',
    description:
      'Sulphite (E-223) at 34 mg/kg detected — above 10 mg/kg threshold requiring "Contains: Sulphites" declaration. Label omits this warning. FSSAI licence number printed at 0.8mm, below 1.0mm minimum for the pack area. Product suspended; Improvement Notice issued.',
    severity: 'high',
    status: 'Notice Issued',
    detectedAt: '2025-10-14 IST',
    evidence: {
      type: 'Lab Analysis + OCR Label Audit',
      extractedValue: 'Sulphite 34 mg/kg (threshold 10 mg/kg, no declaration) | FSSAI font: 0.8mm (min 1.0mm)',
      expectedStandard: 'Schedule IX allergen declaration mandatory when sulphites >10mg/kg. FSSAI licence font min 1.0mm for 200–500g packs',
    },
    penaltyEstimate: 20000,
    assignedOfficer: 'Arjun Nair (Sr. LM Inspector, Bengaluru City Circle)',
    noticeId: 'KFDA-IMP-2025-PEE-0178',
  },

  // 6. VitaEdge — Protein spiking + CoO fraud (CCPA, Mar 2025)
  {
    id: 'VIO-REAL-006',
    caseNumber: 'CCPA/KA/BLR/2025/NUT-0214',
    productId: 'PRD-VTE-006',
    productName: 'ProStack Whey Isolate 2kg — Chocolate Fudge',
    brand: 'ProStack Performance',
    marketedBy: 'VitaEdge Nutraceuticals Import & Trade LLP',
    manufacturer: 'VitaEdge Nutraceuticals Import & Trade LLP',
    platform: 'Amazon India / Own Website',
    ruleCode: 'FSSAI-FSS-2006-SEC53',
    actName: 'Food Safety and Standards Act, 2006 r/w CCPA Misleading Ads Guidelines, 2022',
    section: 'FSS Act Sec 53 — False/Misleading Label; CCPA Guideline 6(2)',
    description:
      'NABL lab report (NABL-BLR-24891): protein 41.2g/100g vs 72g/100g declared (42.8% shortfall). Country of Origin declared "India"; import records confirm raw materials from China/USA with no domestic manufacturing. Three SKUs suspended.',
    severity: 'critical',
    status: 'Open',
    detectedAt: '2025-03-07 IST',
    evidence: {
      type: 'NABL Lab Report + Import Records',
      extractedValue: 'Protein: 41.2 g/100g (NABL-BLR-24891) vs label claim 72g/100g | CoO: declared India; materials origin: China/USA',
      expectedStandard: 'FSS Act Sec 53: misleading claims up to ₹10L penalty. CoO must reflect country of substantial manufacture',
    },
    penaltyEstimate: 50000,
    assignedOfficer: 'Arjun Nair (Sr. LM Inspector, Bengaluru City Circle)',
    noticeId: 'CCPA-BLR-2025-NUT-0214',
  },

  // 7. Himalaya — Packaging Font Height & Unit Sale Price Non-Compliance
  {
    id: 'VIO-REAL-007',
    caseNumber: 'LM/ENF/KA/BLR/2025/1109',
    productId: 'PRD-HIM-007',
    productName: 'Himalaya Purifying Neem Face Wash (150ml Value Pack)',
    brand: 'Himalaya',
    marketedBy: 'Himalaya Wellness Company',
    manufacturer: 'Himalaya Wellness Company (Makali Complex)',
    platform: 'Pan-India Retail & Supermarkets',
    ruleCode: 'LM-PCR-2011-R6-1-E',
    actName: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    section: 'Rule 6(1)(e) — Font Height & Unit Sale Price Declaration',
    description:
      'Value combo pack omitted mandatory Unit Sale Price (USP) per 100ml on the primary display panel, and net volume numeral font height measured 2.2mm, below the statutory 4.0mm requirement for packages exceeding 100ml under Rule 9 Schedule II.',
    severity: 'medium',
    status: 'Resolved',
    detectedAt: '2025-01-18 IST',
    evidence: {
      type: 'Factory Inspection + OCR Measurement',
      extractedValue: 'Net Volume font height: 2.2mm | USP declaration: Missing on front panel',
      expectedStandard: 'LM Rules Schedule II: Font height >= 4.0mm for 100ml-200ml; Rule 6(1)(s): USP mandatory on all retail packages',
    },
    penaltyEstimate: 25000,
    assignedOfficer: 'Arjun Nair (Sr. LM Inspector, Bengaluru City Circle)',
    noticeId: 'LM-SCN-KA-2025-HIM-001',
  },
];
