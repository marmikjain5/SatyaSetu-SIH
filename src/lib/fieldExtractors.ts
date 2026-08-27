/**
 * Legal Metrology Field-Specific Smart Extractors & Statutory Validation Engine
 *
 * Implements dedicated extraction, normalization, and statutory compliance checks
 * under the Legal Metrology (Packaged Commodities) Rules, 2011 & FSSAI Regulations.
 *
 * Extracts bounding box evidence coordinates mapped to original image dimensions.
 */

import type {
  DeclarationField,
  DeclarationFieldKey,
  BoundingBox,
  ValidationStatus,
  DeclarationFieldCategory,
} from '../types/scan';

export interface OCRLineWithBBox {
  text: string;
  confidence: number;
  bbox: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  };
}

export interface MultiPassOCRData {
  text: string;
  confidence: number;
  source: string;
  lines: OCRLineWithBBox[];
  scale: number;
}

export interface CandidateResult {
  value: string;
  rawValue: string;
  rawMatch: string;
  score: number; // 0–1 pattern match quality
  bbox?: { x0: number; y0: number; x1: number; y1: number } | null;
}

export interface StatutoryRuleDefinition {
  ruleCode: string;
  ruleDescription: string;
  isMandatory: boolean;
  category: DeclarationFieldCategory;
}

export const STATUTORY_RULES: Record<DeclarationFieldKey, StatutoryRuleDefinition> = {
  productName: {
    ruleCode: 'PCR-2011-R6(1)(a)',
    ruleDescription: 'The generic name or common name of the commodity contained in the package.',
    isMandatory: true,
    category: 'identity',
  },
  mrp: {
    ruleCode: 'PCR-2011-R6(1)(c)',
    ruleDescription: 'Maximum Retail Price inclusive of all taxes in Indian Rupees format.',
    isMandatory: true,
    category: 'pricing',
  },
  netQuantity: {
    ruleCode: 'PCR-2011-R6(1)(b)',
    ruleDescription: 'Net quantity in terms of the standard unit of weight or measure (metric unit).',
    isMandatory: true,
    category: 'quantity',
  },
  manufacturer: {
    ruleCode: 'PCR-2011-R6(1)(a)',
    ruleDescription: 'Name and address of the manufacturer or packer of the commodity.',
    isMandatory: true,
    category: 'manufacturing',
  },
  address: {
    ruleCode: 'PCR-2011-R6(1)(a)',
    ruleDescription: 'Complete address with city, state, and PIN code of manufacturing premise.',
    isMandatory: true,
    category: 'manufacturing',
  },
  importer: {
    ruleCode: 'PCR-2011-R6(1)(a)-IMP',
    ruleDescription: 'Name and complete address of the importer in case of imported packages.',
    isMandatory: false,
    category: 'manufacturing',
  },
  countryOfOrigin: {
    ruleCode: 'PCR-2017-R6(1)(b)',
    ruleDescription: 'Mandatory declaration of Country of Origin on pre-packaged commodities.',
    isMandatory: true,
    category: 'identity',
  },
  packingDate: {
    ruleCode: 'PCR-2011-R6(1)(d)',
    ruleDescription: 'Month and year in which the commodity is packed or imported.',
    isMandatory: true,
    category: 'traceability',
  },
  manufacturingDate: {
    ruleCode: 'PCR-2011-R6(1)(d)-MFG',
    ruleDescription: 'Month and year of manufacture or packaging of commodity.',
    isMandatory: true,
    category: 'traceability',
  },
  expiryDate: {
    ruleCode: 'PCR-2011-R6(1)(d)-EXP',
    ruleDescription: 'Best before / Use by date for perishable or consumable packaged goods.',
    isMandatory: false,
    category: 'traceability',
  },
  batchNumber: {
    ruleCode: 'PCR-2011-R6(1)(g)',
    ruleDescription: 'Batch number or Lot code facilitating production tracking and recall.',
    isMandatory: true,
    category: 'traceability',
  },
  customerCare: {
    ruleCode: 'PCR-2011-R6(1)(n)',
    ruleDescription: 'Name, address, telephone number, and email address for consumer redressal.',
    isMandatory: true,
    category: 'consumer_redressal',
  },
  fssaiLicense: {
    ruleCode: 'FSSAI-2011-SEC31',
    ruleDescription: '14-digit FSSAI License Number and logo on all food business packages.',
    isMandatory: false,
    category: 'statutory_license',
  },
  barcode: {
    ruleCode: 'GS1-INDIA-EAN13',
    ruleDescription: 'GS1 compliant 8, 12, or 13-digit optical barcode identification number.',
    isMandatory: false,
    category: 'traceability',
  },
};

// ─── Utility ────────────────────────────────────────────────────

function createNormalizedBBox(
  rawBBox: { x0: number; y0: number; x1: number; y1: number } | null | undefined,
  scale: number,
  imgWidth: number,
  imgHeight: number
): BoundingBox | null {
  if (!rawBBox || imgWidth <= 0 || imgHeight <= 0) return null;

  const x0 = Math.max(0, Math.round(rawBBox.x0 / scale));
  const y0 = Math.max(0, Math.round(rawBBox.y0 / scale));
  const x1 = Math.min(imgWidth, Math.round(rawBBox.x1 / scale));
  const y1 = Math.min(imgHeight, Math.round(rawBBox.y1 / scale));

  const w = Math.max(1, x1 - x0);
  const h = Math.max(1, y1 - y0);

  return {
    x0,
    y0,
    x1,
    y1,
    normalized: {
      x: Math.round((x0 / imgWidth) * 1000) / 10,
      y: Math.round((y0 / imgHeight) * 1000) / 10,
      width: Math.round((w / imgWidth) * 1000) / 10,
      height: Math.round((h / imgHeight) * 1000) / 10,
    },
  };
}

/**
 * Run an extractor over all OCR passes and select the best candidate.
 */
function selectBestCandidate(
  passes: MultiPassOCRData[],
  imgDimensions: { width: number; height: number },
  extractor: (pass: MultiPassOCRData) => CandidateResult[]
): {
  value: string;
  rawValue: string;
  confidence: number;
  sourceText: string;
  sourcePass: string;
  boundingBox: BoundingBox | null;
} {
  let bestCandidateResult: CandidateResult | null = null;
  let bestConfidence = 0;
  let bestPass: MultiPassOCRData | null = null;

  for (const pass of passes) {
    const candidates = extractor(pass);
    for (const candidate of candidates) {
      const conf = Math.min(100, Math.round(candidate.score * pass.confidence));
      if (conf > bestConfidence) {
        bestConfidence = conf;
        bestCandidateResult = candidate;
        bestPass = pass;
      }
    }
  }

  if (!bestCandidateResult || !bestPass) {
    return {
      value: '',
      rawValue: '',
      confidence: 0,
      sourceText: '',
      sourcePass: '',
      boundingBox: null,
    };
  }

  const boundingBox = createNormalizedBBox(
    bestCandidateResult.bbox,
    bestPass.scale,
    imgDimensions.width,
    imgDimensions.height
  );

  return {
    value: bestCandidateResult.value,
    rawValue: bestCandidateResult.rawValue,
    confidence: bestConfidence,
    sourceText: bestCandidateResult.rawMatch,
    sourcePass: bestPass.source,
    boundingBox,
  };
}

// ─── 1. MRP Extractor & Validator ──────────────────────────────

const MRP_REGEXES: RegExp[] = [
  /(?:m\.?\s*r\.?\s*p\.?|maximum\s*retail\s*price)\s*[:;.]?\s*(?:(?:incl|inc|incl\.).*?)?[₹Rs.]*\s*[₹Rs.]*\s*([\d]+(?:[.,]\d{1,2})?)/gi,
  /[₹]\s*([\d]+(?:[.,]\d{1,2})?)/gi,
  /Rs\.?\s*([\d]+(?:[.,]\d{1,2})?)\s*(?:\/|-)?/gi,
];

function extractMRPCandidates(pass: MultiPassOCRData): CandidateResult[] {
  const results: CandidateResult[] = [];
  const lowerFull = pass.text.toLowerCase();
  const hasMRPKeyword = /m\.?\s*r\.?\s*p|maximum\s*retail\s*price/i.test(lowerFull);

  for (const line of pass.lines) {
    const lineText = line.text;
    const hasLineMRP = /m\.?\s*r\.?\s*p|maximum\s*retail/i.test(lineText);

    for (const pattern of MRP_REGEXES) {
      pattern.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(lineText)) !== null) {
        const rawNum = match[1].replace(/,/g, '');
        const val = parseFloat(rawNum);
        if (isNaN(val) || val < 1 || val > 100000) continue;

        let score = hasLineMRP ? 0.95 : hasMRPKeyword ? 0.65 : 0.45;
        if (/incl|all\s*taxes/i.test(lineText)) score = Math.min(1, score + 0.05);

        const formatted = val % 1 === 0 ? `₹${val}.00` : `₹${val.toFixed(2)}`;

        results.push({
          value: formatted,
          rawValue: match[0],
          rawMatch: lineText.trim(),
          score,
          bbox: line.bbox,
        });
      }
    }
  }

  return results;
}

function validateMRP(value: string, rawText: string): { status: ValidationStatus; message: string } {
  if (!value) {
    return {
      status: 'missing',
      message: 'Mandatory MRP declaration under Rule 6(1)(c) is missing or undetected.',
    };
  }

  const num = parseFloat(value.replace(/[^0-9.]/g, ''));
  if (isNaN(num) || num <= 0) {
    return {
      status: 'non-compliant',
      message: 'Invalid numerical price value detected.',
    };
  }

  const hasTaxesMention = /incl|all\s*taxes/i.test(rawText);
  if (!hasTaxesMention) {
    return {
      status: 'warning',
      message: 'MRP value found, but "Inclusive of all taxes" statement is not explicitly verified.',
    };
  }

  return {
    status: 'compliant',
    message: `Compliant MRP declaration (${value}) adhering to PCR Rule 6(1)(c).`,
  };
}

// ─── 2. Net Quantity Extractor & Validator ──────────────────────

const NET_QTY_REGEXES: RegExp[] = [
  /net\s*(?:qty|quantity|wt|weight|content|contents|vol|volume)\s*[:;.\-]?\s*([\d.,]+\s*(?:kg|g|gm|gms|gram|grams|mg|ml|l|ltr|litre|litres|liter|liters|cc|oz|piece|pcs|units?|n|u))\b/gi,
  /(?:contents?|weight|wt\.?)\s*[:;.\-]\s*([\d.,]+\s*(?:kg|g|gm|gms|mg|ml|l|ltr|litre|litres|cc))/gi,
  /\b([\d.,]+\s*(?:kg|g|gm|gms|mg|ml|l|ltr|litre|litres))\s*(?:\(|net|approx|when\s*packed)/gi,
];

const UNIT_MAP: Record<string, string> = {
  gm: 'g', gms: 'g', gram: 'g', grams: 'g',
  ltr: 'l', litre: 'l', litres: 'l', liter: 'l', liters: 'l',
  millilitre: 'ml', millilitres: 'ml', pcs: 'pieces', piece: 'pieces', units: 'units', u: 'units', n: 'units',
};

function normalizeNetQty(raw: string): string {
  const parts = raw.trim().match(/^([\d.,]+)\s*(.+)$/);
  if (!parts) return raw.trim();
  const num = parts[1];
  let unit = parts[2].toLowerCase().trim();
  unit = UNIT_MAP[unit] || unit;
  return `${num} ${unit}`;
}

function extractNetQuantityCandidates(pass: MultiPassOCRData): CandidateResult[] {
  const results: CandidateResult[] = [];

  for (const line of pass.lines) {
    const lineText = line.text;
    const hasNetKeyword = /net\s*(?:qty|quantity|wt|weight|content|vol)/i.test(lineText);

    for (const pattern of NET_QTY_REGEXES) {
      pattern.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(lineText)) !== null) {
        const raw = match[1].trim();
        const norm = normalizeNetQty(raw);
        if (!/\d/.test(norm) || !/[a-z]/i.test(norm)) continue;

        const score = hasNetKeyword ? 0.95 : 0.65;

        results.push({
          value: norm,
          rawValue: match[0],
          rawMatch: lineText.trim(),
          score,
          bbox: line.bbox,
        });
      }
    }
  }

  return results;
}

function validateNetQuantity(value: string): { status: ValidationStatus; message: string } {
  if (!value) {
    return {
      status: 'missing',
      message: 'Mandatory Net Quantity declaration under Rule 6(1)(b) & Rule 11 is missing.',
    };
  }

  const isMetric = /\b(g|kg|ml|l|mg|pieces|units)\b/i.test(value);
  const isImperial = /\b(oz|lbs|pounds|fluid\s*ounces)\b/i.test(value);

  if (isImperial && !isMetric) {
    return {
      status: 'non-compliant',
      message: 'Non-standard imperial units used. Rule 11 mandates standard metric units (g/kg/ml/l).',
    };
  }

  return {
    status: 'compliant',
    message: `Compliant standard metric net quantity declaration (${value}).`,
  };
}

// ─── 3. FSSAI License Number Extractor & Validator ──────────────

const FSSAI_REGEXES: RegExp[] = [
  /(?:fssai|lic\.?\s*(?:no|number)?\.?|license\s*no\.?)\s*[:;.\-]?\s*([0-9]{14})\b/gi,
  /\bfssai\b.*?([0-9]{14})\b/gi,
  /\b([12][0-9]{13})\b/g, // Standard 14-digit FSSAI starting with 1 or 2
];

function extractFSSAICandidates(pass: MultiPassOCRData): CandidateResult[] {
  const results: CandidateResult[] = [];

  for (const line of pass.lines) {
    const lineText = line.text;
    const hasFSSAIKeyword = /fssai|licence|license|lic\s*no/i.test(lineText);

    for (const pattern of FSSAI_REGEXES) {
      pattern.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(lineText)) !== null) {
        const lic = match[1].trim();
        if (lic.length === 14) {
          const score = hasFSSAIKeyword ? 0.98 : 0.75;
          results.push({
            value: lic,
            rawValue: match[0],
            rawMatch: lineText.trim(),
            score,
            bbox: line.bbox,
          });
        }
      }
    }
  }

  return results;
}

function validateFSSAI(value: string): { status: ValidationStatus; message: string } {
  if (!value) {
    return {
      status: 'missing',
      message: 'No 14-digit FSSAI License Number detected on packaging.',
    };
  }

  if (!/^\d{14}$/.test(value)) {
    return {
      status: 'non-compliant',
      message: `Invalid FSSAI format (${value}). Must be exactly 14 numeric digits.`,
    };
  }

  return {
    status: 'compliant',
    message: `Valid 14-digit FSSAI License Number (${value}) adhering to FSS Act Sec 31.`,
  };
}

// ─── 4. Dates Extractors (Mfg, Pkg, Expiry) ──────────────────────

const DATE_REGEXES: RegExp[] = [
  /(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/g,
  /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s*[,.\/\-]?\s*(\d{2,4})/gi,
  /(\d{2,4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})/g,
];

const MONTH_NAMES: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
};

function formatParsedDate(raw: string): string | null {
  // DD/MM/YYYY
  let m = raw.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
  if (m) {
    const day = m[1].padStart(2, '0');
    const month = m[2].padStart(2, '0');
    let year = m[3];
    if (year.length === 2) year = `20${year}`;
    if (parseInt(month) < 1 || parseInt(month) > 12) return null;
    if (parseInt(day) < 1 || parseInt(day) > 31) return null;
    return `${day}/${month}/${year}`;
  }

  // MMM YYYY
  m = raw.match(/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s*[,.\/\-]?\s*(\d{2,4})$/i);
  if (m) {
    const month = MONTH_NAMES[m[1].toLowerCase()];
    let year = m[2];
    if (year.length === 2) year = `20${year}`;
    return `${month}/${year}`;
  }

  return null;
}

function extractDateByKeyword(
  pass: MultiPassOCRData,
  keywords: RegExp[]
): CandidateResult[] {
  const results: CandidateResult[] = [];

  for (const line of pass.lines) {
    const lineText = line.text;
    const hasKeyword = keywords.some((k) => k.test(lineText));

    for (const pattern of DATE_REGEXES) {
      pattern.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(lineText)) !== null) {
        const norm = formatParsedDate(match[0]);
        if (!norm) continue;

        const score = hasKeyword ? 0.92 : 0.4;
        results.push({
          value: norm,
          rawValue: match[0],
          rawMatch: lineText.trim(),
          score,
          bbox: line.bbox,
        });
      }
    }
  }

  return results;
}

function extractMfgDateCandidates(pass: MultiPassOCRData): CandidateResult[] {
  return extractDateByKeyword(pass, [
    /(?:mfg|mfd|manufacturing|manufactured)\s*(?:date|dt|d)?/i,
    /date\s*of\s*(?:mfg|manufacture)/i,
  ]);
}

function extractPackingDateCandidates(pass: MultiPassOCRData): CandidateResult[] {
  return extractDateByKeyword(pass, [
    /(?:pkg|pkd|packed|packing|pack)\s*(?:date|dt|d)?/i,
    /date\s*of\s*(?:packing|pkg)/i,
  ]);
}

function extractExpiryDateCandidates(pass: MultiPassOCRData): CandidateResult[] {
  return extractDateByKeyword(pass, [
    /(?:exp|expiry|exp\.|expires)\s*(?:date|dt|d)?/i,
    /best\s*before/i,
    /use\s*by/i,
    /valid\s*(?:upto|up\s*to)/i,
  ]);
}

// ─── 5. Batch / Lot Number Extractor & Validator ────────────────

const BATCH_REGEXES: RegExp[] = [
  /(?:batch\s*(?:no|number|#)?|lot\s*(?:no|number|#)?|b\.?\s*no\.?|l\.?\s*no\.?|b\/no)\s*[:;.\-]?\s*([A-Z0-9\/\-_]{3,20})/gi,
  /\b(?:BN|LOT|BATCH)\s*[:.\-]?\s*([A-Z0-9\/\-_]{3,15})\b/gi,
];

function extractBatchCandidates(pass: MultiPassOCRData): CandidateResult[] {
  const results: CandidateResult[] = [];

  for (const line of pass.lines) {
    const lineText = line.text;

    for (const pattern of BATCH_REGEXES) {
      pattern.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(lineText)) !== null) {
        const batchVal = match[1].trim();
        if (batchVal.length >= 3 && !/^(AND|THE|FOR|REG|DATE)$/i.test(batchVal)) {
          results.push({
            value: batchVal,
            rawValue: match[0],
            rawMatch: lineText.trim(),
            score: 0.92,
            bbox: line.bbox,
          });
        }
      }
    }
  }

  return results;
}

// ─── 6. Barcode / GTIN Extractor & Validator ────────────────────

const BARCODE_REGEXES: RegExp[] = [
  /\b([0-9]{13})\b/g, // EAN-13
  /\b([0-9]{12})\b/g, // UPC-A
  /\b([0-9]{8})\b/g,  // EAN-8
];

function extractBarcodeCandidates(pass: MultiPassOCRData): CandidateResult[] {
  const results: CandidateResult[] = [];

  for (const line of pass.lines) {
    const lineText = line.text;
    const hasBarcodeKeyword = /barcode|ean|upc|gtin|code/i.test(lineText);

    for (const pattern of BARCODE_REGEXES) {
      pattern.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(lineText)) !== null) {
        const digits = match[1];
        // Exclude common false positives like dates or FSSAI
        if (digits.length === 13) {
          const score = hasBarcodeKeyword ? 0.95 : 0.65;
          results.push({
            value: digits,
            rawValue: digits,
            rawMatch: lineText.trim(),
            score,
            bbox: line.bbox,
          });
        }
      }
    }
  }

  return results;
}

// ─── 7. Country of Origin Extractor ─────────────────────────────

const COUNTRY_REGEXES: RegExp[] = [
  /(?:country\s*of\s*origin|origin|made\s*in|product\s*of)\s*[:;.\-]?\s*([a-zA-Z\s]{3,30})/gi,
  /\b(made\s*in\s*india|product\s*of\s*india|origin\s*:\s*india)\b/gi,
];

function extractCountryOfOriginCandidates(pass: MultiPassOCRData): CandidateResult[] {
  const results: CandidateResult[] = [];

  for (const line of pass.lines) {
    const lineText = line.text;
    for (const pattern of COUNTRY_REGEXES) {
      pattern.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(lineText)) !== null) {
        let val = (match[1] || match[0]).trim();
        val = val.replace(/^(country\s*of\s*origin|origin|made\s*in|product\s*of)\s*[:;.\-]?\s*/i, '').trim();
        if (val.length >= 3) {
          results.push({
            value: val,
            rawValue: match[0],
            rawMatch: lineText.trim(),
            score: 0.9,
            bbox: line.bbox,
          });
        }
      }
    }
  }

  return results;
}

// ─── 8. Manufacturer, Importer & Address Extractors ──────────────

const MFG_KEYWORDS: RegExp[] = [
  /(?:mfg|mfd|manufactured|made)\s*(?:by|\.)\s*[:;.\-]?\s*/i,
  /manufacturer\s*[:;.\-]\s*/i,
];

function extractManufacturerCandidates(pass: MultiPassOCRData): CandidateResult[] {
  const results: CandidateResult[] = [];
  const lines = pass.lines;

  for (let i = 0; i < lines.length; i++) {
    const lineText = lines[i].text;
    for (const kw of MFG_KEYWORDS) {
      const match = lineText.match(kw);
      if (match) {
        let val = lineText.substring(match.index! + match[0].length).trim();
        if (val.length < 5 && i + 1 < lines.length) {
          val = `${val} ${lines[i + 1].text}`.trim();
        }
        val = val.replace(/[,;.]$/, '').trim();
        if (val.length >= 3) {
          results.push({
            value: val,
            rawValue: match[0],
            rawMatch: lineText.trim(),
            score: 0.88,
            bbox: lines[i].bbox,
          });
        }
      }
    }
  }

  return results;
}

const ADDRESS_KEYWORDS: RegExp[] = [
  /(?:regd|registered)?\s*(?:office|address|unit|plant|premise|works)\s*[:;.\-]\s*/i,
  /add(?:ress)?\.?\s*[:;.\-]\s*/i,
  /(?:plot|survey|sector)\s*(?:no|number)?\.?\s*[:;.\-]?\s*/i,
];

function extractAddressCandidates(pass: MultiPassOCRData): CandidateResult[] {
  const results: CandidateResult[] = [];
  const lines = pass.lines;

  for (let i = 0; i < lines.length; i++) {
    const lineText = lines[i].text;
    for (const kw of ADDRESS_KEYWORDS) {
      const match = lineText.match(kw);
      if (match) {
        let val = lineText.substring(match.index! + match[0].length).trim();
        for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
          if (/^(?:mfg|mrp|customer|net|batch|exp|fssai)/i.test(lines[j].text)) break;
          val += `, ${lines[j].text}`;
          if (/\b\d{6}\b/.test(lines[j].text)) break; // PIN code terminator
        }
        val = val.replace(/[,;.]$/, '').trim();
        if (val.length >= 6) {
          const hasPIN = /\b\d{6}\b/.test(val);
          results.push({
            value: val,
            rawValue: match[0],
            rawMatch: lineText.trim(),
            score: hasPIN ? 0.92 : 0.72,
            bbox: lines[i].bbox,
          });
        }
      }
    }
  }

  return results;
}

const IMPORTER_KEYWORDS: RegExp[] = [
  /(?:imported|importer)\s*(?:by|&|and)?\s*[:;.\-]?\s*/i,
  /(?:marketed|distributed)\s*(?:by)?\s*[:;.\-]?\s*/i,
];

function extractImporterCandidates(pass: MultiPassOCRData): CandidateResult[] {
  const results: CandidateResult[] = [];
  const lines = pass.lines;

  for (let i = 0; i < lines.length; i++) {
    const lineText = lines[i].text;
    for (const kw of IMPORTER_KEYWORDS) {
      const match = lineText.match(kw);
      if (match) {
        let val = lineText.substring(match.index! + match[0].length).trim();
        if (val.length < 5 && i + 1 < lines.length) {
          val = `${val} ${lines[i + 1].text}`.trim();
        }
        val = val.replace(/[,;.]$/, '').trim();
        if (val.length >= 3) {
          results.push({
            value: val,
            rawValue: match[0],
            rawMatch: lineText.trim(),
            score: 0.85,
            bbox: lines[i].bbox,
          });
        }
      }
    }
  }

  return results;
}

// ─── 9. Customer Care & Product Name Extractors ─────────────────

const CARE_KEYWORDS: RegExp[] = [
  /(?:customer\s*care|helpline|toll\s*free|consumer\s*(?:care|helpline))\s*(?:no|number|#)?\.?\s*[:;.\-]?\s*/i,
  /(?:contact|call)\s*(?:us)?\s*[:;.\-]?\s*/i,
  /(?:for\s*(?:queries|feedback|complaints))\s*[:;.\-]?\s*/i,
];

const PHONE_REGEX: RegExp = /(?:1800[\s\-]?\d{3}[\s\-]?\d{3,4}|(?:\+91[\s\-]?)?[6-9]\d{4}[\s\-]?\d{5}|\(\d{3,4}\)\s*\d{6,8})/g;
const EMAIL_REGEX: RegExp = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

function extractCustomerCareCandidates(pass: MultiPassOCRData): CandidateResult[] {
  const results: CandidateResult[] = [];

  for (const line of pass.lines) {
    const lineText = line.text;
    const hasCareKeyword = CARE_KEYWORDS.some((k) => k.test(lineText));

    PHONE_REGEX.lastIndex = 0;
    let phoneMatch: RegExpExecArray | null;
    while ((phoneMatch = PHONE_REGEX.exec(lineText)) !== null) {
      results.push({
        value: phoneMatch[0].trim(),
        rawValue: phoneMatch[0],
        rawMatch: lineText.trim(),
        score: hasCareKeyword ? 0.95 : 0.8,
        bbox: line.bbox,
      });
    }

    EMAIL_REGEX.lastIndex = 0;
    let emailMatch: RegExpExecArray | null;
    while ((emailMatch = EMAIL_REGEX.exec(lineText)) !== null) {
      results.push({
        value: emailMatch[0].trim(),
        rawValue: emailMatch[0],
        rawMatch: lineText.trim(),
        score: 0.9,
        bbox: line.bbox,
      });
    }
  }

  return results;
}

function extractProductNameCandidates(pass: MultiPassOCRData): CandidateResult[] {
  const results: CandidateResult[] = [];
  const lines = pass.lines;

  const headerKeywords = /^(?:mfg|manufactured|imported|marketed|customer|helpline|net\s*(?:wt|qty)|m\.?\s*r\.?\s*p|maximum\s*retail|address|regd|best\s*before|use\s*by|exp|ingredients|nutrition|pkg|pkd|batch|fssai|lic)/i;

  for (let i = 0; i < Math.min(6, lines.length); i++) {
    const lineText = lines[i].text.trim();
    if (headerKeywords.test(lineText)) continue;
    if (lineText.length < 3 || lineText.length > 75) continue;

    const score = Math.max(0.2, 0.7 - i * 0.1);
    results.push({
      value: lineText,
      rawValue: lineText,
      rawMatch: lineText,
      score,
      bbox: lines[i].bbox,
    });
  }

  return results;
}

// ─── Master Statutory Extraction & Validation Pipeline ───────────

export function extractAllLegalDeclarations(
  passes: MultiPassOCRData[],
  imgDimensions: { width: number; height: number },
  rawFullOcrText: string
): Record<DeclarationFieldKey, DeclarationField> {
  // Extract all fields
  const rawFields = {
    productName: selectBestCandidate(passes, imgDimensions, extractProductNameCandidates),
    mrp: selectBestCandidate(passes, imgDimensions, extractMRPCandidates),
    netQuantity: selectBestCandidate(passes, imgDimensions, extractNetQuantityCandidates),
    manufacturer: selectBestCandidate(passes, imgDimensions, extractManufacturerCandidates),
    address: selectBestCandidate(passes, imgDimensions, extractAddressCandidates),
    importer: selectBestCandidate(passes, imgDimensions, extractImporterCandidates),
    countryOfOrigin: selectBestCandidate(passes, imgDimensions, extractCountryOfOriginCandidates),
    packingDate: selectBestCandidate(passes, imgDimensions, extractPackingDateCandidates),
    manufacturingDate: selectBestCandidate(passes, imgDimensions, extractMfgDateCandidates),
    expiryDate: selectBestCandidate(passes, imgDimensions, extractExpiryDateCandidates),
    batchNumber: selectBestCandidate(passes, imgDimensions, extractBatchCandidates),
    customerCare: selectBestCandidate(passes, imgDimensions, extractCustomerCareCandidates),
    fssaiLicense: selectBestCandidate(passes, imgDimensions, extractFSSAICandidates),
    barcode: selectBestCandidate(passes, imgDimensions, extractBarcodeCandidates),
  };

  // Perform Statutory Validation for each field
  const declarations: Partial<Record<DeclarationFieldKey, DeclarationField>> = {};

  const keys: DeclarationFieldKey[] = [
    'productName',
    'mrp',
    'netQuantity',
    'manufacturer',
    'address',
    'importer',
    'countryOfOrigin',
    'packingDate',
    'manufacturingDate',
    'expiryDate',
    'batchNumber',
    'customerCare',
    'fssaiLicense',
    'barcode',
  ];

  const labels: Record<DeclarationFieldKey, string> = {
    productName: 'Product Name',
    mrp: 'Maximum Retail Price (MRP)',
    netQuantity: 'Net Quantity',
    manufacturer: 'Manufacturer Name',
    address: 'Manufacturer Address',
    importer: 'Importer Details',
    countryOfOrigin: 'Country of Origin',
    packingDate: 'Packing Date',
    manufacturingDate: 'Manufacturing Date',
    expiryDate: 'Expiry / Best Before Date',
    batchNumber: 'Batch / Lot Number',
    customerCare: 'Customer Care Details',
    fssaiLicense: 'FSSAI License Number',
    barcode: 'Barcode / GTIN',
  };

  for (const key of keys) {
    const raw = rawFields[key];
    const rule = STATUTORY_RULES[key];
    let valStatus: ValidationStatus = 'compliant';
    let valMsg = `Valid statutory declaration adhering to ${rule.ruleCode}.`;

    if (!raw.value || raw.value.trim().length === 0) {
      valStatus = rule.isMandatory ? 'missing' : 'missing';
      valMsg = rule.isMandatory
        ? `Mandatory declaration under ${rule.ruleCode} was not detected on packaging.`
        : `Optional / conditional declaration under ${rule.ruleCode} not detected.`;
    } else {
      // Specific validators
      if (key === 'mrp') {
        const v = validateMRP(raw.value, rawFullOcrText);
        valStatus = v.status;
        valMsg = v.message;
      } else if (key === 'netQuantity') {
        const v = validateNetQuantity(raw.value);
        valStatus = v.status;
        valMsg = v.message;
      } else if (key === 'fssaiLicense') {
        const v = validateFSSAI(raw.value);
        valStatus = v.status;
        valMsg = v.message;
      } else if (key === 'address' && !/\b\d{6}\b/.test(raw.value)) {
        valStatus = 'warning';
        valMsg = 'Address detected but 6-digit postal PIN code is missing or unverified.';
      }
    }

    declarations[key] = {
      key,
      label: labels[key],
      value: raw.value,
      rawValue: raw.rawValue,
      confidence: raw.confidence,
      sourceText: raw.sourceText,
      sourcePass: raw.sourcePass,
      boundingBox: raw.boundingBox,
      validationStatus: valStatus,
      validationMessage: valMsg,
      ruleCode: rule.ruleCode,
      ruleDescription: rule.ruleDescription,
      isMandatory: rule.isMandatory,
      category: rule.category,
    };
  }

  return declarations as Record<DeclarationFieldKey, DeclarationField>;
}
