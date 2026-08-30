/**
 * Deterministic Complaint Classifier for SatyaDrishti
 *
 * Implements pure deterministic text normalization, tokenization, phrase dictionary matching,
 * regex patterns, and confidence scoring across 13 legal metrology & consumer protection categories.
 *
 * NO LLM IS USED IN THIS CLASSIFICATION PIPELINE.
 */

import type { ComplaintCategoryCode, ComplaintClassificationResult } from '../types/compliance';

export interface CategoryPatternDefinition {
  code: ComplaintCategoryCode;
  label: string;
  keywords: string[];
  phrases: string[];
  regexes: RegExp[];
}

export const CATEGORY_PATTERNS: CategoryPatternDefinition[] = [
  {
    code: 'price_above_mrp',
    label: 'Price Charged Above Declared MRP',
    keywords: ['charged', 'overcharged', 'bill', 'receipt', 'extra', 'more', 'overcharge', 'selling price'],
    phrases: [
      'price above mrp',
      'charged more than mrp',
      'charged higher than mrp',
      'charged over mrp',
      'paid more than printed',
      'above printed price',
      'charged extra',
      'retailer charged more',
      'shop charged me',
      'receipt shows higher',
      'billed above mrp',
      'charged extra money',
      'packet says',
      'printed price is',
    ],
    regexes: [
      /charged\s+(?:me\s+)?(?:rs\.?|₹)?\s*\d+.*?(?:mrp|printed|packet)\s*(?:is|says|shows)?\s*(?:rs\.?|₹)?\s*\d+/i,
      /packet\s*(?:says|shows)?\s*(?:rs\.?|₹)?\s*\d+.*?(?:charged|billed|paid)\s*(?:me\s+)?(?:rs\.?|₹)?\s*\d+/i,
      /mrp\s*(?:is|was)?\s*(?:rs\.?|₹)?\s*\d+.*?(?:charged|paid|bill)\s*(?:rs\.?|₹)?\s*\d+/i,
      /overcharg(?:ed|ing)\s*(?:above|over)\s*mrp/i,
    ],
  },
  {
    code: 'mrp_discrepancy',
    label: 'MRP Discrepancy / Dual Pricing / Sticker Alteration',
    keywords: ['sticker', 'dual', 'altered', 'overprinted', 'pasted', 'tampered', 'discrepancy', 'covered'],
    phrases: [
      'mrp discrepancy',
      'dual mrp',
      'sticker over mrp',
      'sticker on price',
      'pasted sticker',
      'two mrps',
      'different prices',
      'mrp altered',
      'price covered by sticker',
      'printed price hidden',
      'double price tag',
      'mrp smudge',
    ],
    regexes: [
      /sticker\s+(?:on|over|pasted|covering)\s+(?:mrp|price|printed)/i,
      /dual\s+mrp/i,
      /two\s+different\s+mrp/i,
      /mrp\s+discrepancy/i,
    ],
  },
  {
    code: 'missing_mrp',
    label: 'Missing Maximum Retail Price (MRP) Declaration',
    keywords: ['missing', 'absent', 'no price', 'unprinted', 'omitted', 'hidden', 'n/a'],
    phrases: [
      'missing mrp',
      'mrp is missing',
      'no mrp',
      'mrp isn\'t written',
      'mrp not written',
      'no price on packet',
      'price is not printed',
      'maximum retail price is missing',
      'no maximum retail price',
      'price not declared',
      'without mrp',
      'mrp not mentioned',
    ],
    regexes: [
      /(?:no|missing|without)\s+(?:mrp|maximum\s+retail\s+price|price\s+tag)/i,
      /(?:mrp|price)\s+(?:is\s+)?not\s+(?:printed|written|declared|mentioned|found)/i,
    ],
  },
  {
    code: 'quantity_discrepancy',
    label: 'Net Quantity / Short Weight Discrepancy',
    keywords: ['underweight', 'shortage', 'less', 'short', 'weighs', 'empty', 'half', 'deficit'],
    phrases: [
      'quantity discrepancy',
      'short weight',
      'underweight product',
      'less weight',
      'weighs less than printed',
      'weighs less than declared',
      'packet says 1kg but',
      'actual weight is less',
      'short volume',
      'quantity short',
      'deflated quantity',
    ],
    regexes: [
      /(?:weighs?|weight)\s+less\s+than/i,
      /short\s+(?:weight|quantity|volume)/i,
      /underweight/i,
      /says?\s+\d+\s*(?:g|kg|ml|l).*?actual(?:ly)?\s+(?:is\s+)?\d+/i,
    ],
  },
  {
    code: 'missing_net_quantity',
    label: 'Missing Net Quantity / Weight Declaration',
    keywords: ['net qty', 'net weight', 'volume', 'missing quantity', 'qty missing'],
    phrases: [
      'missing net quantity',
      'net quantity missing',
      'no net weight',
      'net weight missing',
      'weight not declared',
      'quantity not mentioned',
      'volume not written',
      'no net qty',
      'without quantity declaration',
    ],
    regexes: [
      /(?:no|missing|without)\s+net\s+(?:qty|quantity|weight|vol|volume)/i,
      /net\s+(?:qty|quantity|weight)\s+(?:is\s+)?not\s+(?:printed|declared|mentioned)/i,
    ],
  },
  {
    code: 'missing_manufacturer',
    label: 'Missing Manufacturer / Packer Name & Address',
    keywords: ['manufacturer', 'packer', 'maker', 'producer', 'address', 'premise'],
    phrases: [
      'missing manufacturer',
      'manufacturer information missing',
      'no manufacturer name',
      'manufacturer details missing',
      'mfg address missing',
      'packer details missing',
      'no maker name',
      'who manufactured this not written',
      'no manufacturer address',
    ],
    regexes: [
      /(?:no|missing|without)\s+manufacturer/i,
      /manufacturer\s+(?:name|address|details)?\s+(?:is\s+)?missing/i,
      /packer\s+(?:name|address)?\s+(?:is\s+)?missing/i,
    ],
  },
  {
    code: 'missing_importer',
    label: 'Missing Importer Information (Imported Goods)',
    keywords: ['importer', 'imported', 'import', 'foreign', 'origin'],
    phrases: [
      'missing importer',
      'importer information missing',
      'no importer name',
      'imported item without importer',
      'importer address missing',
      'no import details',
    ],
    regexes: [
      /(?:no|missing|without)\s+importer/i,
      /importer\s+(?:name|address|details)?\s+(?:is\s+)?missing/i,
    ],
  },
  {
    code: 'missing_customer_care',
    label: 'Missing Consumer Care Helpline / Contact Details',
    keywords: ['helpline', 'customer care', 'consumer care', 'tollfree', 'contact', 'email'],
    phrases: [
      'missing customer care',
      'customer care missing',
      'no customer care number',
      'no helpline',
      'helpline missing',
      'no contact number for complaint',
      'consumer care details missing',
      'no customer email',
    ],
    regexes: [
      /(?:no|missing|without)\s+customer\s+care/i,
      /customer\s+care\s+(?:number|details|email)?\s+(?:is\s+)?missing/i,
      /helpline\s+(?:number)?\s+missing/i,
    ],
  },
  {
    code: 'unreadable_declaration',
    label: 'Unreadable / Tiny / Smudged Statutory Declaration',
    keywords: ['unreadable', 'blurred', 'tiny', 'smudged', 'faded', 'illegible', 'font', 'small'],
    phrases: [
      'unreadable declaration',
      'text is too small',
      'tiny font',
      'blurred print',
      'smudged text',
      'faded print',
      'cannot read text',
      'illegible label',
      'font size too small',
      'unreadable print',
    ],
    regexes: [
      /unreadable/i,
      /(?:too\s+small|tiny)\s+(?:font|print|text)/i,
      /(?:smudged|blurred|faded|illegible)\s+(?:print|text|label|declaration)/i,
    ],
  },
  {
    code: 'misleading_claim',
    label: 'Misleading Claim / Deceptive / False Advertising',
    keywords: ['misleading', 'false', 'deceptive', 'fake', 'bogus', 'unsubstantiated', 'fraudulent'],
    phrases: [
      'misleading claim',
      'false advertisement',
      'fake health claim',
      'misleading packaging',
      'false promise',
      'deceptive description',
      'fake organic',
      'misleading label',
      'false claim',
    ],
    regexes: [
      /misleading\s+(?:claim|ad|advertisement|label|packaging)/i,
      /false\s+(?:claim|advertisement|promise|ad)/i,
      /deceptive/i,
    ],
  },
  {
    code: 'product_identity_concern',
    label: 'Product Identity Concern / Missing Generic Name',
    keywords: ['identity', 'generic name', 'common name', 'what is product', 'unknown'],
    phrases: [
      'product identity concern',
      'generic name missing',
      'no generic name',
      'common name missing',
      'vague product name',
      'no common product name',
      'what is inside not stated',
    ],
    regexes: [
      /(?:no|missing)\s+generic\s+name/i,
      /generic\s+name\s+(?:is\s+)?missing/i,
      /product\s+identity/i,
    ],
  },
  {
    code: 'general_packaging_issue',
    label: 'General Statutory Packaging Compliance Violation',
    keywords: ['non-compliant', 'violation', 'statutory', 'symbol', 'fssai', 'bis', 'packaging', 'rules'],
    phrases: [
      'general packaging issue',
      'packaging non compliant',
      'missing statutory notice',
      'veg symbol missing',
      'fssai license missing',
      'bis mark missing',
      'packaging rules violated',
      'statutory violation',
    ],
    regexes: [
      /packaging\s+(?:non-compliant|violation|issue)/i,
      /missing\s+(?:fssai|bis|veg\s+symbol|license)/i,
      /statutory\s+declaration\s+missing/i,
    ],
  },
];

/**
 * Normalizes input text for deterministic matching.
 */

export function normalizeComplaintText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s₹.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Deterministically classifies a consumer complaint text.
 */
export function classifyComplaintText(
  rawText: string,
  extraContext?: {
    packagingMrp?: string | number;
    receiptPrice?: string | number;
    declaredWeight?: string;
    actualWeight?: string;
  }
): ComplaintClassificationResult {
  const normalized = normalizeComplaintText(rawText);
  if (!normalized) {
    return {
      categoryCode: 'other_unclear',
      categoryLabel: 'Other / Unclear Grievance',
      confidenceScore: 20,
      needsReview: true,
      matchedKeywords: [],
      reasoning: 'No text provided for deterministic classification.',
    };
  }

  // Cross-check numeric context if provided (e.g. Receipt price vs Packaging MRP)
  if (extraContext?.packagingMrp && extraContext?.receiptPrice) {
    const pkg = typeof extraContext.packagingMrp === 'number'
      ? extraContext.packagingMrp
      : parseFloat(String(extraContext.packagingMrp).replace(/[^0-9.]/g, ''));
    const rcp = typeof extraContext.receiptPrice === 'number'
      ? extraContext.receiptPrice
      : parseFloat(String(extraContext.receiptPrice).replace(/[^0-9.]/g, ''));

    if (!isNaN(pkg) && !isNaN(rcp) && rcp > pkg) {
      return {
        categoryCode: 'price_above_mrp',
        categoryLabel: 'Price Charged Above Declared MRP',
        confidenceScore: 98,
        needsReview: false,
        matchedKeywords: ['numeric_price_discrepancy', `mrp:${pkg}`, `receipt:${rcp}`],
        reasoning: `Extracted store receipt price (₹${rcp}) exceeds product packaging MRP (₹${pkg}) by ₹${(rcp - pkg).toFixed(2)}.`,
      };
    }
  }

  const categoryScores: {
    definition: CategoryPatternDefinition;
    score: number;
    matchedTerms: string[];
  }[] = [];

  for (const def of CATEGORY_PATTERNS) {
    let score = 0;
    const matchedTerms: string[] = [];

    // 1. Regex match check (highest weight)
    for (const rx of def.regexes) {
      if (rx.test(normalized) || rx.test(rawText)) {
        score += 45;
        matchedTerms.push(`Regex pattern hit: ${rx.source}`);
      }
    }

    // 2. Exact phrase match check
    for (const phrase of def.phrases) {
      if (normalized.includes(phrase)) {
        score += 35;
        matchedTerms.push(`Phrase: "${phrase}"`);
      }
    }

    // 3. Keyword hit check
    for (const kw of def.keywords) {
      const kwRegex = new RegExp(`\\b${kw}\\b`, 'i');
      if (kwRegex.test(normalized)) {
        score += 10;
        matchedTerms.push(`Keyword: "${kw}"`);
      }
    }

    if (score > 0) {
      categoryScores.push({
        definition: def,
        score: Math.min(99, score),
        matchedTerms,
      });
    }
  }

  // Sort by score descending
  categoryScores.sort((a, b) => b.score - a.score);

  if (categoryScores.length === 0 || categoryScores[0].score < 25) {
    return {
      categoryCode: 'other_unclear',
      categoryLabel: 'Other / Unclear Grievance',
      confidenceScore: 35,
      needsReview: true,
      matchedKeywords: [],
      reasoning: 'Text pattern match confidence below deterministic threshold. Routed for officer review.',
    };
  }

  const topMatch = categoryScores[0];
  const confidenceScore = topMatch.score;
  const needsReview = confidenceScore < 60;

  return {
    categoryCode: topMatch.definition.code,
    categoryLabel: topMatch.definition.label,
    confidenceScore,
    needsReview,
    matchedKeywords: topMatch.matchedTerms,
    reasoning: `Matched ${topMatch.matchedTerms.length} deterministic rules with ${confidenceScore}% confidence.`,
  };
}
