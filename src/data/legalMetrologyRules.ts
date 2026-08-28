/**
 * Legal Metrology Rule Definitions (Mock Data)
 *
 * Contains the complete set of Legal Metrology (Packaged Commodities) Rules, 2011
 * rule definitions used by the Rule Engine Validation Service.
 *
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  FUTURE RAG INTEGRATION POINT                                     │
 * │  This file can be replaced by a RAG-based rule retrieval service  │
 * │  that dynamically fetches rule definitions from the regulatory    │
 * │  knowledge base. The engine only depends on the                   │
 * │  LegalMetrologyRule[] interface shape.                            │
 * └────────────────────────────────────────────────────────────────────┘
 */

import type { LegalMetrologyRule } from '../types/ruleEngine';

export const LEGAL_METROLOGY_RULES: LegalMetrologyRule[] = [
  // ─── 1. Product Name ────────────────────────────────────────────
  {
    id: 'LMR-001',
    ruleCode: 'PCR-2011-R6(1)(a)',
    act: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    section: 'Rule 6(1)(a)',
    fieldKey: 'productName',
    title: 'Mandatory Product Name Declaration',
    description:
      'Every package must bear the generic or common name of the commodity contained therein. The name must be prominently displayed and legible to the consumer.',
    severity: 'critical',
    isMandatory: true,
    isConditional: false,
    conditionDescription: '',
    validatorKey: 'validateProductName',
    penaltyRange: { minFine: 25000, maxFine: 100000, imprisonmentMonths: 6 },
    recommendations: [
      'Ensure the product name is clearly printed on the principal display panel.',
      'Use the generic/common name of the commodity, not just a brand name.',
      'Font size must be at least 2mm for packages up to 100cm² surface area.',
    ],
  },

  // ─── 2. MRP ─────────────────────────────────────────────────────
  {
    id: 'LMR-002',
    ruleCode: 'PCR-2011-R6(1)(c)',
    act: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    section: 'Rule 6(1)(c)',
    fieldKey: 'mrp',
    title: 'Maximum Retail Price (MRP) Declaration',
    description:
      'The retail sale price of the pre-packaged commodity shall be declared as "Maximum Retail Price" inclusive of all taxes in Indian Rupees.',
    severity: 'critical',
    isMandatory: true,
    isConditional: false,
    conditionDescription: '',
    validatorKey: 'validateMRP',
    penaltyRange: { minFine: 25000, maxFine: 100000, imprisonmentMonths: 6 },
    recommendations: [
      'Print MRP prominently with the prefix "MRP" or "Maximum Retail Price".',
      'Include "inclusive of all taxes" or "(incl. of all taxes)" alongside the price.',
      'Use Indian Rupee symbol (₹) or "Rs." prefix before the amount.',
    ],
  },

  // ─── 3. Net Quantity ────────────────────────────────────────────
  {
    id: 'LMR-003',
    ruleCode: 'PCR-2011-R6(1)(b)',
    act: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    section: 'Rule 6(1)(b) & Rule 11',
    fieldKey: 'netQuantity',
    title: 'Net Quantity Declaration in Standard Metric Units',
    description:
      'The net quantity of commodity in the package must be declared in standard units of weight (g, kg), measure (ml, l), or numerical count as per Schedule II.',
    severity: 'critical',
    isMandatory: true,
    isConditional: false,
    conditionDescription: '',
    validatorKey: 'validateNetQuantity',
    penaltyRange: { minFine: 25000, maxFine: 100000, imprisonmentMonths: 6 },
    recommendations: [
      'Declare net quantity using standard metric units: g, kg, ml, or l.',
      'Do not use imperial units (oz, lbs) — Indian law mandates metric only.',
      'Net quantity must be declared by weight for solids, by volume for liquids, and by number for countable items.',
    ],
  },

  // ─── 4. Manufacturer Name ───────────────────────────────────────
  {
    id: 'LMR-004',
    ruleCode: 'PCR-2011-R6(1)(a)',
    act: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    section: 'Rule 6(1)(a)',
    fieldKey: 'manufacturer',
    title: 'Manufacturer / Packer Name Declaration',
    description:
      'The name of the manufacturer or packer or importer of the commodity must be declared on the package.',
    severity: 'critical',
    isMandatory: true,
    isConditional: false,
    conditionDescription: '',
    validatorKey: 'validateManufacturer',
    penaltyRange: { minFine: 25000, maxFine: 100000, imprisonmentMonths: 6 },
    recommendations: [
      'Print full legal name of the manufacturer or packer.',
      'For imported goods, include the importer\'s legal name as well.',
      'The name must be that of the entity responsible for manufacturing or packing.',
    ],
  },

  // ─── 5. Manufacturer Address ────────────────────────────────────
  {
    id: 'LMR-005',
    ruleCode: 'PCR-2011-R6(1)(a)',
    act: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    section: 'Rule 6(1)(a)',
    fieldKey: 'address',
    title: 'Manufacturer / Packer Address Declaration',
    description:
      'Complete address of the manufacturing premises including city, state, and PIN code must be declared.',
    severity: 'high',
    isMandatory: true,
    isConditional: false,
    conditionDescription: '',
    validatorKey: 'validateAddress',
    penaltyRange: { minFine: 10000, maxFine: 50000 },
    recommendations: [
      'Include complete address with city, state, and 6-digit PIN code.',
      'For multi-unit manufacturers, declare the address of the specific manufacturing unit.',
      'Registered office address alone is insufficient — manufacturing premise address is required.',
    ],
  },

  // ─── 6. Customer Care Details ───────────────────────────────────
  {
    id: 'LMR-006',
    ruleCode: 'PCR-2011-R6(1)(n)',
    act: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    section: 'Rule 6(1)(n)',
    fieldKey: 'customerCare',
    title: 'Consumer Redressal / Customer Care Details',
    description:
      'Name, address, telephone number, and email address for consumer complaints and redressal must be declared.',
    severity: 'high',
    isMandatory: true,
    isConditional: false,
    conditionDescription: '',
    validatorKey: 'validateCustomerCare',
    penaltyRange: { minFine: 10000, maxFine: 50000 },
    recommendations: [
      'Provide a toll-free customer care number (1800-XXX-XXXX preferred).',
      'Include a valid email address for consumer complaints.',
      'Physical address for consumer redressal is also recommended.',
    ],
  },

  // ─── 7. Date of Packing ─────────────────────────────────────────
  {
    id: 'LMR-007',
    ruleCode: 'PCR-2011-R6(1)(d)',
    act: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    section: 'Rule 6(1)(d)',
    fieldKey: 'packingDate',
    title: 'Date of Packing / Import Declaration',
    description:
      'Month and year in which the commodity is manufactured, packed, or imported must be declared.',
    severity: 'high',
    isMandatory: true,
    isConditional: false,
    conditionDescription: '',
    validatorKey: 'validateDate',
    penaltyRange: { minFine: 10000, maxFine: 50000 },
    recommendations: [
      'Declare date in DD/MM/YYYY or MMM/YYYY format.',
      'Prefixed with "Pkg Date", "Date of Packing", or similar label.',
      'Must be indelibly printed and not easily removable.',
    ],
  },

  // ─── 8. Manufacturing Date ──────────────────────────────────────
  {
    id: 'LMR-008',
    ruleCode: 'PCR-2011-R6(1)(d)-MFG',
    act: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    section: 'Rule 6(1)(d)',
    fieldKey: 'manufacturingDate',
    title: 'Date of Manufacture Declaration',
    description:
      'Month and year of manufacture of the commodity must be declared on the package.',
    severity: 'high',
    isMandatory: true,
    isConditional: false,
    conditionDescription: '',
    validatorKey: 'validateDate',
    penaltyRange: { minFine: 10000, maxFine: 50000 },
    recommendations: [
      'Declare manufacturing date in DD/MM/YYYY or MMM/YYYY format.',
      'Use "Mfg Date", "Date of Manufacture", or equivalent prefix.',
      'For multi-batch products, declare the batch-specific manufacturing date.',
    ],
  },

  // ─── 9. Country of Origin ──────────────────────────────────────
  {
    id: 'LMR-009',
    ruleCode: 'PCR-2017-R6(1)(b)',
    act: 'Legal Metrology (Packaged Commodities) Rules, 2011 (as amended 2017)',
    section: 'Rule 6(1)(b) — 2017 Amendment',
    fieldKey: 'countryOfOrigin',
    title: 'Country of Origin Declaration',
    description:
      'Name of the country of origin or manufacture must be mentioned on every pre-packaged commodity in prominent uppercase characters.',
    severity: 'critical',
    isMandatory: true,
    isConditional: false,
    conditionDescription: '',
    validatorKey: 'validateCountryOfOrigin',
    penaltyRange: { minFine: 50000, maxFine: 200000, imprisonmentMonths: 12 },
    recommendations: [
      'Print "Country of Origin: INDIA" or relevant country in uppercase.',
      'Must be displayed prominently on the principal display panel.',
      'For imported goods, both country of origin and importer details are mandatory.',
    ],
  },

  // ─── 10. Batch Number ──────────────────────────────────────────
  {
    id: 'LMR-010',
    ruleCode: 'PCR-2011-R6(1)(g)',
    act: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    section: 'Rule 6(1)(g)',
    fieldKey: 'batchNumber',
    title: 'Batch / Lot Number for Traceability',
    description:
      'Batch number or lot code must be declared to facilitate production tracking and product recall.',
    severity: 'medium',
    isMandatory: true,
    isConditional: false,
    conditionDescription: '',
    validatorKey: 'validateBatchNumber',
    penaltyRange: { minFine: 10000, maxFine: 25000 },
    recommendations: [
      'Print batch/lot number with "Batch No." or "B.No." prefix.',
      'Ensure it is alphanumeric and at least 3 characters long.',
      'Must be traceable back to manufacturing records.',
    ],
  },

  // ─── 11. Importer Details (Conditional) ─────────────────────────
  {
    id: 'LMR-011',
    ruleCode: 'PCR-2011-R6(1)(a)-IMP',
    act: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    section: 'Rule 6(1)(a) — Imported Packages',
    fieldKey: 'importer',
    title: 'Importer Name & Address Declaration',
    description:
      'For imported packages, the name and complete address of the importer must be declared on the package.',
    severity: 'high',
    isMandatory: false,
    isConditional: true,
    conditionDescription: 'Required only when Country of Origin is not India (imported goods).',
    validatorKey: 'validateImporter',
    penaltyRange: { minFine: 25000, maxFine: 100000, imprisonmentMonths: 6 },
    recommendations: [
      'For imported goods, print the importer\'s full legal name and address.',
      'Include the importer\'s FSSAI license number for food products.',
      'If marketed by a different entity, include "Marketed by" details as well.',
    ],
  },

  // ─── 12. Expiry Date (Conditional) ──────────────────────────────
  {
    id: 'LMR-012',
    ruleCode: 'PCR-2011-R6(1)(d)-EXP',
    act: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    section: 'Rule 6(1)(d) — Perishable Goods',
    fieldKey: 'expiryDate',
    title: 'Best Before / Expiry Date Declaration',
    description:
      'For perishable or consumable packaged goods, the "Best Before" or "Use By" date must be declared.',
    severity: 'medium',
    isMandatory: false,
    isConditional: true,
    conditionDescription: 'Required for food, pharmaceutical, and perishable products.',
    validatorKey: 'validateDate',
    penaltyRange: { minFine: 10000, maxFine: 50000 },
    recommendations: [
      'Use "Best Before", "Use By", or "Expiry Date" as the prefix.',
      'Declare in DD/MM/YYYY or MMM/YYYY format.',
      'Ensure the date is printed indelibly and is clearly legible.',
    ],
  },

  // ─── 13. FSSAI License (Conditional — Food only) ────────────────
  {
    id: 'LMR-013',
    ruleCode: 'FSSAI-2011-SEC31',
    act: 'Food Safety and Standards Act, 2006 & FSSAI Regulations, 2011',
    section: 'Section 31 — FSSAI Act',
    fieldKey: 'fssaiLicense',
    title: 'FSSAI License Number Display',
    description:
      'All food business operators must display a valid 14-digit FSSAI License Number and the FSSAI logo on every food product package.',
    severity: 'high',
    isMandatory: false,
    isConditional: true,
    conditionDescription: 'Required for all food and beverage products.',
    validatorKey: 'validateFSSAI',
    penaltyRange: { minFine: 100000, maxFine: 500000, imprisonmentMonths: 6 },
    recommendations: [
      'Display the 14-digit FSSAI license number prominently.',
      'Include the official FSSAI logo alongside the license number.',
      'Ensure the license number starts with 1 or 2 and is exactly 14 digits.',
    ],
  },
];
