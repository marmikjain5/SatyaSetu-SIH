/**
 * Legal Metrology OCR Extraction Service Layer
 *
 * Multi-pass pipeline with statutory declaration extraction, bounding box mapping,
 * and downstream Rule Engine compliance payload synthesis.
 */

import Tesseract from 'tesseract.js';
import type {
  OCRResult,
  OCRProgressCallback,
  ExtractedProductData,
  FieldConfidence,
  OcrPassSummary,
  DeclarationFieldKey,
  LegalMetrologyCompliancePayload,
} from '../types/scan';
import { preprocessImage } from './imagePreprocessor';
import { extractAllLegalDeclarations } from './fieldExtractors';
import type { MultiPassOCRData, OCRLineWithBBox } from './fieldExtractors';

// ─── Provider Interface ─────────────────────────────────────────
export interface OCRProvider {
  recognize(
    imageSource: string | File,
    onProgress?: OCRProgressCallback
  ): Promise<OCRResult>;
  terminate(): Promise<void>;
}

// ─── Multi-Pass Legal Metrology Tesseract Provider ──────────────
class TesseractLegalMetrologyProvider implements OCRProvider {
  async recognize(
    imageSource: string | File,
    onProgress?: OCRProgressCallback
  ): Promise<OCRResult> {
    let dataUrl: string;
    if (typeof imageSource === 'string') {
      dataUrl = imageSource;
    } else {
      dataUrl = await this.fileToDataUrl(imageSource);
    }

    // ── Step 1: Preprocess Image Variants & Dimensions ───────────
    onProgress?.(2, 'Preprocessing image variants & optical enhancements...');
    const preprocessed = await preprocessImage(dataUrl);
    const variants = preprocessed.variants;
    const imgDimensions = preprocessed.dimensions;
    const totalPasses = variants.length;

    // ── Step 2: Multi-Pass OCR Execution ────────────────────────
    const passOCRData: MultiPassOCRData[] = [];
    const passSummaries: OcrPassSummary[] = [];
    let bestRawText = '';
    let bestOverallConfidence = 0;

    for (let i = 0; i < totalPasses; i++) {
      const variant = variants[i];
      const passLabel = `Pass ${i + 1}/${totalPasses}: ${variant.description}`;
      onProgress?.(
        Math.round(5 + (i / totalPasses) * 80),
        passLabel
      );

      try {
        const result = await Tesseract.recognize(variant.dataUrl, 'eng', {
          logger: (m: Tesseract.LoggerMessage) => {
            if (m.status === 'recognizing text' && typeof m.progress === 'number') {
              const passProgress = Math.round(5 + ((i + m.progress) / totalPasses) * 80);
              onProgress?.(passProgress, passLabel);
            }
          },
        });

        const pageData = result.data as unknown as {
          text?: string;
          confidence?: number;
          lines?: Array<{
            text: string;
            confidence: number;
            bbox?: { x0: number; y0: number; x1: number; y1: number };
          }>;
        };

        const rawText = pageData.text || '';
        const confidence = Math.round((pageData.confidence || 0) * 10) / 10;

        // Extract lines with bounding boxes
        const rawLines = pageData.lines || [];
        const lines: OCRLineWithBBox[] = rawLines.length > 0
          ? rawLines.map((line) => ({
              text: line.text || '',
              confidence: line.confidence || confidence,
              bbox: line.bbox || { x0: 0, y0: 0, x1: imgDimensions.width, y1: 20 },
            }))
          : rawText.split('\n').filter(Boolean).map((t, idx) => ({
              text: t,
              confidence,
              bbox: {
                x0: 10,
                y0: idx * 25,
                x1: Math.min(imgDimensions.width, 300),
                y1: (idx + 1) * 25,
              },
            }));

        passOCRData.push({
          text: rawText,
          confidence,
          source: variant.name,
          lines,
          scale: variant.scale,
        });

        passSummaries.push({
          name: variant.name,
          description: variant.description,
          confidence,
          textLength: rawText.length,
        });

        if (confidence > bestOverallConfidence) {
          bestOverallConfidence = confidence;
          bestRawText = rawText;
        }
      } catch (err) {
        passSummaries.push({
          name: variant.name,
          description: variant.description,
          confidence: 0,
          textLength: 0,
        });
      }
    }

    // ── Step 3: Statutory Declaration Extraction & Rule Validation ──
    onProgress?.(88, 'Extracting Legal Metrology statutory declarations & evidence...');
    const declarations = extractAllLegalDeclarations(passOCRData, imgDimensions, bestRawText);

    // ── Step 4: Build Rule Engine Compliance Payload ────────────
    onProgress?.(95, 'Synthesizing Rule Engine compliance payload...');

    const keys = Object.keys(declarations) as DeclarationFieldKey[];
    const fieldConfidence: Partial<FieldConfidence> = {};

    let totalMandatory = 0;
    let compliantCount = 0;
    let warningCount = 0;
    let nonCompliantCount = 0;
    let missingCount = 0;

    for (const key of keys) {
      const decl = declarations[key];
      fieldConfidence[key] = decl.confidence;

      if (decl.isMandatory) {
        totalMandatory++;
        if (decl.validationStatus === 'compliant') compliantCount++;
        else if (decl.validationStatus === 'warning') warningCount++;
        else if (decl.validationStatus === 'non-compliant') nonCompliantCount++;
        else if (decl.validationStatus === 'missing') missingCount++;
      }
    }

    const mandatoryComplianceScore =
      totalMandatory > 0
        ? Math.round(((compliantCount + warningCount * 0.7) / totalMandatory) * 100)
        : 0;

    const compliancePayload: LegalMetrologyCompliancePayload = {
      schemaVersion: '2.0.0',
      extractionTimestamp: new Date().toISOString(),
      engineVersion: 'SatyaDrishti-LM-Extraction-2.0',
      productMetadata: {
        imageName: typeof imageSource === 'string' ? 'Scanned Packaging' : imageSource.name,
        imageDimensions: imgDimensions,
        overallConfidence: bestOverallConfidence,
        ocrPassesCount: passSummaries.length,
      },
      declarations,
      mandatorySummary: {
        totalMandatory,
        compliantCount,
        warningCount,
        nonCompliantCount,
        missingCount,
        compliancePercentage: mandatoryComplianceScore,
      },
      rawOcrText: bestRawText,
      ocrPassSummaries: passSummaries,
    };

    const overallConfidence = Math.round(
      (bestOverallConfidence * 0.5 + mandatoryComplianceScore * 0.5) * 10
    ) / 10;

    const extractedData: ExtractedProductData = {
      productName: declarations.productName.value,
      mrp: declarations.mrp.value,
      unitSalePrice: declarations.unitSalePrice?.value ?? '',
      netQuantity: declarations.netQuantity.value,
      manufacturer: declarations.manufacturer.value,
      address: declarations.address.value,
      importer: declarations.importer.value,
      countryOfOrigin: declarations.countryOfOrigin.value,
      packingDate: declarations.packingDate.value,
      manufacturingDate: declarations.manufacturingDate.value,
      expiryDate: declarations.expiryDate.value,
      batchNumber: declarations.batchNumber.value,
      customerCare: declarations.customerCare.value,
      fssaiLicense: declarations.fssaiLicense.value,
      barcode: declarations.barcode.value,
      rawText: bestRawText,
      confidence: overallConfidence,
      fieldConfidence: fieldConfidence as FieldConfidence,
      declarations,
      compliancePayload,
      imageDimensions: imgDimensions,
      ocrPassResults: passSummaries,
    };

    onProgress?.(100, 'Legal Metrology Extraction Complete');

    return {
      rawText: bestRawText,
      confidence: overallConfidence,
      extractedData,
    };
  }

  async terminate(): Promise<void> {}

  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

// ─── Service Singleton ──────────────────────────────────────────
class OCRService {
  private provider: OCRProvider;

  constructor() {
    this.provider = new TesseractLegalMetrologyProvider();
  }

  /** Swap the OCR provider (e.g. to Google Vision, AWS Textract, or Azure OCR) */
  setProvider(provider: OCRProvider): void {
    this.provider = provider;
  }

  /** Run OCR on an image with optional progress callback */
  async recognize(
    imageSource: string | File,
    onProgress?: OCRProgressCallback
  ): Promise<OCRResult> {
    return this.provider.recognize(imageSource, onProgress);
  }

  /** Cleanup resources */
  async terminate(): Promise<void> {
    return this.provider.terminate();
  }
}

/** Shared OCR service instance */
export const ocrService = new OCRService();
