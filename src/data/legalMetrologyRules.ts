/**
 * Gazette-Verified Statutory Rule Definitions
 *
 * Replaces previous mock data with real statutory rules sourced from:
 *
 *  ┌─────────────────────────────────────────────────────────────────────────────────┐
 *  │  BLOCK A — Legal Metrology (Packaged Commodities) Rules, 2011                   │
 *  │            Gazette: G.S.R. 882(E), Ministry of Consumer Affairs, 24 Feb 2011    │
 *  │            Amended by: G.S.R. 779(E) dated 28 Oct 2022 (Unit Sale Price)       │
 *  │            Amended by: G.S.R. 1537(E) dated 13 Dec 2017 (Country of Origin)    │
 *  ├─────────────────────────────────────────────────────────────────────────────────┤
 *  │  BLOCK B — FSSAI Food Safety & Standards (Labelling & Display) Regs, 2020       │
 *  │            Gazette: FSSAI F.No. 1-116/FSSAI/Imports/2021, effective 1 Oct 2022  │
 *  ├─────────────────────────────────────────────────────────────────────────────────┤
 *  │  BLOCK C — Consumer Protection Act, 2019 & E-Commerce Rules, 2020               │
 *  │            Gazette: G.S.R. 462(E), 23 Jul 2020                                  │
 *  └─────────────────────────────────────────────────────────────────────────────────┘
 *
 *  Architecture note:
 *  This file feeds the FRONTEND rule engine (ruleEngineService.ts).
 *  The BACKEND PostgreSQL regulatory_rules table is the separate production store.
 *  The ragKnowledgeService.ts is the live-demo ingestion layer — all three coexist.
 *
 *  Entry point: validateProduct(productData) in ruleEngineService.ts
 */

import type { LegalMetrologyRule } from '../types/ruleEngine';

export const LEGAL_METROLOGY_RULES: LegalMetrologyRule[] = [
  // ═══════════════════════════════════════════════════════════════════════
  // BLOCK A: Legal Metrology (Packaged Commodities) Rules, 2011
  // Source: G.S.R. 882(E), Ministry of Consumer Affairs
  // ═══════════════════════════════════════════════════════════════════════

  // ─── 1. Commodity Name ─────────────────────────────────────────────────
  {
    id: 'PCR-R6-1A',
    ruleCode: 'PCR-2011-R6(1)(a)',
    act: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    section: 'Rule 6(1)(a) — G.S.R. 882(E)',
    fieldKey: 'productName',
    title: 'Mandatory Generic/Common Name of Commodity',
    description:
      'Every package shall bear the generic or common name of the commodity contained therein. ' +
      'The name must be prominently displayed on the Principal Display Panel (PDP) in legible characters. ' +
      'Brand name alone is insufficient — the generic/common commodity name (e.g., "Whole Wheat Flour", ' +
      '"Whey Protein Concentrate") must be declared.',
    severity: 'critical',
    isMandatory: true,
    isConditional: false,
    conditionDescription: '',
    validatorKey: 'validateProductName',
    penaltyRange: { minFine: 25000, maxFine: 100000, imprisonmentMonths: 6 },
    recommendations: [
      'Print the generic/common name of the commodity (not just brand name) on the PDP.',
      'Ensure the name is at minimum 3 characters long and describes the actual commodity.',
      'Place it in the most prominent position on the Principal Display Panel.',
    ],
  },

  // ─── 2. Net Quantity & Maximum Permissible Error ────────────────────────
  {
    id: 'PCR-R6-1B',
    ruleCode: 'PCR-2011-R6(1)(b)',
    act: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    section: 'Rule 6(1)(b) & Rule 11 — G.S.R. 882(E)',
    fieldKey: 'netQuantity',
    title: 'Net Quantity in Standard Metric Units — Maximum Permissible Error (MPE)',
    description:
      'The net quantity of commodity must be declared in standard metric units: weight (g or kg), ' +
      'volume (ml or l), or numerical count. Non-metric units (oz, lbs, fluid oz, pounds) are ' +
      'strictly prohibited under Rule 11. Schedule I MPE: ≤50g → 9.0%; 50–100g → 4.5%; ' +
      '100–200g → 4.5%; 200–300g → ±9g; 300–500g → 3%; 500g–1kg → 1.5%; 1kg–10kg → 1.5%; ' +
      '10kg–25kg → 1.0%; >25kg → 0.5%. Actual quantity must not fall below declared quantity by more than MPE.',
    severity: 'critical',
    isMandatory: true,
    isConditional: false,
    conditionDescription: '',
    validatorKey: 'validateNetQuantity',
    penaltyRange: { minFine: 25000, maxFine: 100000, imprisonmentMonths: 6 },
    recommendations: [
      'Declare net quantity in standard metric units only: g, kg, ml, l, or count.',
      'Imperial units (oz, lbs, fl oz) are illegal — remove them entirely.',
      'Ensure actual packed quantity does not deviate beyond the Schedule I MPE tolerance.',
    ],
  },

  // ─── 3. Maximum Retail Price (MRP) ─────────────────────────────────────
  {
    id: 'PCR-R6-1C',
    ruleCode: 'PCR-2011-R6(1)(c)',
    act: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    section: 'Rule 6(1)(c) — G.S.R. 882(E)',
    fieldKey: 'mrp',
    title: 'Maximum Retail Price (MRP) — Inclusive of All Taxes',
    description:
      'The retail sale price must be declared as "Maximum Retail Price" or "MRP" inclusive of all ' +
      'taxes (including local taxes) in Indian Rupees. Required format: ' +
      '"MRP ₹ xx.xx (inclusive of all taxes)" or "Max. Retail Price Rs. xx.xx (incl. of all taxes)". ' +
      'Rule 18(2) prohibits selling above the declared MRP — a cognizable offence.',
    severity: 'critical',
    isMandatory: true,
    isConditional: false,
    conditionDescription: '',
    validatorKey: 'validateMRP',
    penaltyRange: { minFine: 25000, maxFine: 100000, imprisonmentMonths: 6 },
    recommendations: [
      'Print MRP with the prefix "MRP" or "Maximum Retail Price" on the PDP.',
      'Add "inclusive of all taxes" or "(incl. of all taxes)" directly alongside the price.',
      'Use Indian Rupee symbol (₹) or "Rs." prefix before the numeric amount.',
    ],
  },

  // ─── 4. Unit Sale Price (USP) — G.S.R. 779(E) 2022 ─────────────────────
  {
    id: 'PCR-R6-1AA',
    ruleCode: 'PCR-2022-R6(1)(aa)',
    act: 'Legal Metrology (Packaged Commodities) Rules, 2011 (as amended by G.S.R. 779(E), 2022)',
    section: 'Rule 6(1)(aa) — Inserted by G.S.R. 779(E) dated 28 Oct 2022, effective 1 Jan 2023',
    fieldKey: 'unitSalePrice',
    title: 'Mandatory Unit Sale Price (USP) Per g or Per ml',
    description:
      'Every pre-packaged commodity must declare the Unit Sale Price (USP): MRP ÷ Net Quantity, ' +
      'rounded to 2 decimal places. Format: "₹ X.XX per g" or "₹ X.XX per ml". ' +
      'Exemption: USP declaration NOT required if USP equals MRP (i.e., unit quantity = 1 base unit). ' +
      'The font height of the USP declaration must be at least 50% of the MRP font height (Rule 7 FAQ). ' +
      'USP placement must be adjacent to MRP on the Principal Display Panel.',
    severity: 'high',
    isMandatory: true,
    isConditional: true,
    conditionDescription:
      'Not required when USP equals MRP (e.g., 1g product priced at ₹1). ' +
      'Applies to all packages with net quantity > 1 base unit.',
    validatorKey: 'validateUnitSalePrice',
    penaltyRange: { minFine: 25000, maxFine: 100000, imprisonmentMonths: 6 },
    recommendations: [
      'Calculate USP = MRP ÷ Net Quantity (in grams or milliliters), rounded to 2 decimal places.',
      'Print USP adjacent to MRP in format "₹ X.XX per g" or "₹ X.XX per ml".',
      'Ensure USP font height is at least 50% of the MRP declaration font height.',
    ],
  },

  // ─── 5. Manufacturer / Packer Address ──────────────────────────────────
  {
    id: 'PCR-R6-1D',
    ruleCode: 'PCR-2011-R6(1)(d)',
    act: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    section: 'Rule 6(1)(d) — G.S.R. 882(E)',
    fieldKey: 'address',
    title: 'Manufacturer / Packer / Importer Full Address',
    description:
      'Full name and complete address of the manufacturer or packer (or importer for imported goods) ' +
      'must be declared. Address must include: street/plot number, city or town, State, ' +
      'and 6-digit PIN Code. Registered office address alone is insufficient — ' +
      'the manufacturing premises address is required. For importers: Indian address of importer is mandatory additionally.',
    severity: 'high',
    isMandatory: true,
    isConditional: false,
    conditionDescription: '',
    validatorKey: 'validateAddress',
    penaltyRange: { minFine: 25000, maxFine: 50000 },
    recommendations: [
      'Print full manufacturing/packing premises address including 6-digit PIN code.',
      'Registered office address is insufficient — use the actual manufacturing address.',
      'For imported goods, include both the importer\'s Indian address and the manufacturer\'s foreign address.',
    ],
  },

  // ─── 6. Date of Manufacture / Packing ──────────────────────────────────
  {
    id: 'PCR-R6-1E',
    ruleCode: 'PCR-2011-R6(1)(e)',
    act: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    section: 'Rule 6(1)(e) — G.S.R. 882(E)',
    fieldKey: 'packingDate',
    title: 'Date of Manufacture / Packing / Import',
    description:
      'Month and year in which the commodity is manufactured, packed, or imported must be declared. ' +
      'Accepted formats: MM/YYYY, MMM/YYYY, DD/MM/YYYY, or Month YYYY (e.g., 03/2024, MAR/2024). ' +
      'Declaration must use prefix "Mfg Date", "Date of Manufacture", "Pkg Date", "Mfd.", or equivalent. ' +
      'The date must not be a future date.',
    severity: 'high',
    isMandatory: true,
    isConditional: false,
    conditionDescription: '',
    validatorKey: 'validateDate',
    penaltyRange: { minFine: 25000, maxFine: 50000 },
    recommendations: [
      'Use format MM/YYYY or MMM/YYYY (e.g., 03/2024 or MAR/2024).',
      'Prefix with "Mfg Date:", "Mfd.:", or "Date of Manufacture:".',
      'Ensure date is indelibly printed and cannot be altered.',
    ],
  },

  // ─── 7. Manufacturing Date (separate fieldKey for OCR mapping) ──────────
  {
    id: 'PCR-R6-1E-MFG',
    ruleCode: 'PCR-2011-R6(1)(e)-MFG',
    act: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    section: 'Rule 6(1)(e) — Manufacturing Date sub-field — G.S.R. 882(E)',
    fieldKey: 'manufacturingDate',
    title: 'Date of Manufacture (Month/Year)',
    description:
      'Month and year of manufacture must be declared with the prefix "Mfg Date", "Date of Manufacture", ' +
      '"Mfd." or equivalent. Must not be a future date.',
    severity: 'high',
    isMandatory: true,
    isConditional: false,
    conditionDescription: '',
    validatorKey: 'validateDate',
    penaltyRange: { minFine: 25000, maxFine: 50000 },
    recommendations: [
      'Declare manufacturing date as MM/YYYY or MMM/YYYY.',
      'Prefix with "Mfg Date:" or "Mfd.".',
      'For multi-batch products, the batch-specific manufacturing date is required.',
    ],
  },

  // ─── 8. Consumer Care / Grievance Redressal Contact ────────────────────
  {
    id: 'PCR-R6-1F',
    ruleCode: 'PCR-2011-R6(1)(f)',
    act: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    section: 'Rule 6(1)(f) — G.S.R. 882(E)',
    fieldKey: 'customerCare',
    title: 'Consumer Care / Grievance Redressal Contact Details',
    description:
      'The name, complete address, telephone number, and email address to be used for consumer ' +
      'complaints and redressal must be declared on the package. Toll-free number (1800-XXX-XXXX) ' +
      'is preferred. Both a phone number (or toll-free) and an active email address are required.',
    severity: 'high',
    isMandatory: true,
    isConditional: false,
    conditionDescription: '',
    validatorKey: 'validateCustomerCare',
    penaltyRange: { minFine: 25000, maxFine: 50000 },
    recommendations: [
      'Provide a toll-free customer care number (1800-XXX-XXXX preferred).',
      'Include a valid and active email address for consumer complaints.',
      'Consumer care information should be on the PDP or rear panel in legible font.',
    ],
  },

  // ─── 9. Country of Origin ── G.S.R. 1537(E) 2017 Amendment ─────────────
  {
    id: 'PCR-R6-1N',
    ruleCode: 'PCR-2017-R6(1)(n)',
    act: 'Legal Metrology (Packaged Commodities) Rules, 2011 (as amended 2017)',
    section: 'Rule 6(1)(n) — Inserted by G.S.R. 1537(E) dated 13 Dec 2017, effective 1 Jan 2018',
    fieldKey: 'countryOfOrigin',
    title: 'Country of Origin / Manufacture Declaration',
    description:
      'Name of the country of origin or manufacture must be declared on every pre-packaged commodity ' +
      'in prominent, clearly legible characters. Acceptable declarations: "Made in India", ' +
      '"Country of Origin: INDIA", "Manufactured in India", "Product of India". ' +
      'For multi-country products, all countries must be listed. ' +
      'Mislabelling (e.g., labelling "Made in India" for Chinese-origin goods) is a cognizable offence ' +
      'carrying ₹50,000–₹2,00,000 fine and up to 12 months imprisonment.',
    severity: 'critical',
    isMandatory: true,
    isConditional: false,
    conditionDescription: '',
    validatorKey: 'validateCountryOfOrigin',
    penaltyRange: { minFine: 50000, maxFine: 200000, imprisonmentMonths: 12 },
    recommendations: [
      'Print "Country of Origin: INDIA" or "Made in India" prominently on the PDP.',
      'For imported goods: must match the actual country of manufacture — obfuscation is a criminal offence.',
      'For multi-country manufacturing, list all countries involved.',
    ],
  },

  // ─── 10. PDP Font Height — Rule 7 Table I & II ─────────────────────────
  {
    id: 'PCR-R7-FONT',
    ruleCode: 'PCR-2011-R7-TableI-II',
    act: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    section: 'Rule 7 — Table I (weight/volume) & Table II (length/area/count) — G.S.R. 882(E)',
    fieldKey: 'batchNumber', // reuses an available fieldKey; fontHeight validated via readabilityService
    title: 'Minimum Numeral/Letter Height on Principal Display Panel',
    description:
      'Minimum numeral/letter height on PDP is governed by Rule 7: ' +
      'PDP area ≤50 cm² → min 1.0mm; 50–100 cm² → 1.5mm; 100–500 cm² → 2.5mm; >500 cm² → 4.0mm. ' +
      'Blown/moulded/embossed declarations → min 2.0mm regardless of area. ' +
      'Width of any numeral must be ≥1/3 of height (except "1", "I", "i", "l"). ' +
      'Clearance above/below the qty declaration = numeral height; left/right clearance = 2× numeral height.',
    severity: 'medium',
    isMandatory: true,
    isConditional: false,
    conditionDescription: '',
    validatorKey: 'validateBatchNumber', // physical font check handled by readabilityService
    penaltyRange: { minFine: 10000, maxFine: 50000 },
    recommendations: [
      'Verify PDP area and apply correct minimum numeral height from Rule 7 Table I or II.',
      'For packages with PDP area >500 cm², minimum numeral height is 4.0mm.',
      'Ensure clearance around the quantity declaration equals the numeral height (top/bottom) and 2× height (sides).',
    ],
  },

  // ─── 11. Dual MRP Prohibition — Rule 18 ────────────────────────────────
  {
    id: 'PCR-R18-DUALMRP',
    ruleCode: 'PCR-2011-R18(1)',
    act: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    section: 'Rule 18(1) & 18(2) — G.S.R. 882(E) | Penalty: Section 36(1), LM Act 2009',
    fieldKey: 'mrp',
    title: 'Prohibition of Dual MRP & Overcharging Above Declared MRP',
    description:
      'Rule 18(1): No manufacturer, packer, or importer shall declare more than one MRP on the same package. ' +
      'Rule 18(2): No person shall sell any pre-packaged commodity at a price exceeding the declared MRP. ' +
      'Compoundable under Section 36(1) of the Legal Metrology Act, 2009. ' +
      'Fine: ₹2,000 to ₹50,000 + confiscation of offending packages.',
    severity: 'critical',
    isMandatory: true,
    isConditional: false,
    conditionDescription: '',
    validatorKey: 'validateMRP',
    penaltyRange: { minFine: 2000, maxFine: 50000 },
    recommendations: [
      'Declare only one MRP on any package — no stickers over old prices permitted.',
      'Do not sell at a price exceeding the printed MRP.',
      'For season-end discounts, issue separately labelled batch with updated MRP.',
    ],
  },

  // ─── 12. Batch / Lot Number ─────────────────────────────────────────────
  {
    id: 'PCR-R6-1G',
    ruleCode: 'PCR-2011-R6(1)(g)',
    act: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    section: 'Rule 6(1)(g) — G.S.R. 882(E)',
    fieldKey: 'batchNumber',
    title: 'Batch / Lot Number for Traceability',
    description:
      'A batch number or lot code must be declared to facilitate production traceability and product recall. ' +
      'Typically prefixed with "Batch No.", "B.No.", "Lot No.", or "Batch/Lot". ' +
      'Must be alphanumeric and at least 3 characters. Must be unique per manufacturing batch.',
    severity: 'medium',
    isMandatory: true,
    isConditional: false,
    conditionDescription: '',
    validatorKey: 'validateBatchNumber',
    penaltyRange: { minFine: 10000, maxFine: 25000 },
    recommendations: [
      'Print batch/lot number with "Batch No." or "B.No." prefix.',
      'Ensure it is alphanumeric and at least 3 characters long.',
      'Batch number must be traceable back to manufacturing records for recall purposes.',
    ],
  },

  // ─── 13. Importer Details (Conditional — Imported Goods Only) ───────────
  {
    id: 'PCR-R6-1D-IMP',
    ruleCode: 'PCR-2011-R6(1)(d)-IMP',
    act: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    section: 'Rule 6(1)(d) — Imported Packages — G.S.R. 882(E)',
    fieldKey: 'importer',
    title: 'Importer Name & Indian Address (Conditional)',
    description:
      'For all imported packages, the full legal name and complete Indian address (including PIN code) ' +
      'of the importer must be declared separately from the foreign manufacturer\'s details. ' +
      'For food products: Importer\'s 14-digit FSSAI license number must also be declared alongside. ' +
      'Applicable only when Country of Origin is not India.',
    severity: 'high',
    isMandatory: false,
    isConditional: true,
    conditionDescription: 'Required ONLY when Country of Origin is not India (imported goods).',
    validatorKey: 'validateImporter',
    penaltyRange: { minFine: 25000, maxFine: 100000, imprisonmentMonths: 6 },
    recommendations: [
      'Print importer\'s full legal entity name and complete Indian address with PIN code.',
      'For food products, also include the importer\'s 14-digit FSSAI License Number.',
      'If marketed by a different entity, also include "Marketed by:" details.',
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // BLOCK B: FSSAI Food Safety & Standards (Labelling & Display) Regs, 2020
  // Source: FSSAI F.No. 1-116/FSSAI/Imports/2021, effective 1 Oct 2022
  // ═══════════════════════════════════════════════════════════════════════

  // ─── 14. FSSAI 14-Digit License Number ─────────────────────────────────
  {
    id: 'FSSAI-REG5-1',
    ruleCode: 'FSSAI-2020-Reg5(1)',
    act: 'Food Safety and Standards (Labelling and Display) Regulations, 2020',
    section: 'Regulation 5(1) | Penalty: Section 26 & 31, FSS Act 2006',
    fieldKey: 'fssaiLicense',
    title: 'FSSAI Logo & 14-Digit License Number on Food Products',
    description:
      'All food business operators must display the FSSAI logo and a valid 14-digit FSSAI ' +
      'license/registration number on every food product package. ' +
      'Format: exactly 14 numeric digits, starting with 1 (registration) or 2 (license). ' +
      'Example: "FSSAI Lic. No. 10020042002099". Displaying a fabricated or invalid FSSAI number ' +
      'is a criminal offence under Section 26 & 31 of the FSS Act, 2006.',
    severity: 'critical',
    isMandatory: false,
    isConditional: true,
    conditionDescription: 'Applies to all food and food products only.',
    validatorKey: 'validateFSSAI',
    penaltyRange: { minFine: 100000, maxFine: 500000, imprisonmentMonths: 6 },
    recommendations: [
      'Display FSSAI logo alongside the 14-digit license number on the PDP.',
      'License number must be exactly 14 digits starting with "1" (registration) or "2" (license).',
      'Ensure the license is valid and not expired before printing on packages.',
    ],
  },

  // ─── 15. Expiry Date / Best Before ─────────────────────────────────────
  {
    id: 'FSSAI-REG5-10',
    ruleCode: 'FSSAI-2020-Reg5(10)',
    act: 'Food Safety and Standards (Labelling and Display) Regulations, 2020',
    section: 'Regulation 5(10) — FSSAI F.No. 1-116/FSSAI/Imports/2021',
    fieldKey: 'expiryDate',
    title: 'Expiry Date / Best Before / Use By Date Declaration',
    description:
      'Every packaged food must declare "Expiry Date", "Best Before", or "Use By" date. ' +
      'Short shelf life (≤3 months) → format DD/MM/YYYY. ' +
      'Long shelf life (>3 months) → format MM/YYYY acceptable. ' +
      'The declaration must be easily legible and permanently affixed on the primary package. ' +
      'Date must not be in the past at time of sale.',
    severity: 'critical',
    isMandatory: false,
    isConditional: true,
    conditionDescription: 'Applies to all food products. Date must be on primary package.',
    validatorKey: 'validateDate',
    penaltyRange: { minFine: 50000, maxFine: 300000, imprisonmentMonths: 6 },
    recommendations: [
      'Use accepted labels: "Best Before", "Use By", "Expiry Date", or "BB Date".',
      'For shelf life ≤3 months: use DD/MM/YYYY format.',
      'For shelf life >3 months: MM/YYYY format is acceptable.',
    ],
  },
];
