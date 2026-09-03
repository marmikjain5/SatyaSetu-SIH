import { create } from 'zustand';
import type { ScanRecord, UploadedImage, ExtractedProductData } from '../types/scan';
import type { ComplianceValidationResult } from '../types/ruleEngine';
import type { ReadabilityAnalysisResult } from '../types/readability';
import { ocrService } from '../lib/ocrService';
import { validateProduct } from '../lib/ruleEngineService';
import { readabilityService } from '../lib/readabilityService';
import {
  processScanDiscrepanciesAndCorrelate,
  ScanCorrelationResult,
} from '../lib/scanComplaintCorrelator';
import { useComplianceStore } from './complianceStore';

interface ScanState {
  // State
  scans: ScanRecord[];
  currentScan: ScanRecord | null;
  uploadedImages: UploadedImage[];
  isProcessing: boolean;
  currentProgress: number;
  currentStatusMessage: string;
  /** Validation results keyed by scan ID */
  validationResults: Record<string, ComplianceValidationResult>;
  /** Correlation results (RAG mappings, verified user complaints, auto-added complaints) */
  correlationResults: Record<string, ScanCorrelationResult>;
  /** Readability analysis results keyed by scan ID */
  readabilityResults: Record<string, ReadabilityAnalysisResult>;

  // Actions
  addImages: (files: File[]) => void;
  removeImage: (id: string) => void;
  clearImages: () => void;
  startScan: () => Promise<void>;
  updateScanProgress: (id: string, progress: number, status: string) => void;
  completeScan: (id: string, rawText: string, confidence: number, extractedData: ExtractedProductData) => void;
  failScan: (id: string, error: string) => void;
  deleteScan: (id: string) => void;
  clearHistory: () => void;
  viewScan: (scan: ScanRecord | null) => void;
  setValidationResult: (scanId: string, result: ComplianceValidationResult) => void;
  setReadabilityResult: (scanId: string, result: ReadabilityAnalysisResult) => void;
}

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

function generateId(): string {
  return `scan-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function formatTimestamp(): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date());
}

export const useScanStore = create<ScanState>((set, get) => ({
  scans: [],
  currentScan: null,
  uploadedImages: [],
  isProcessing: false,
  currentProgress: 0,
  currentStatusMessage: '',
  validationResults: {},
  correlationResults: {},
  readabilityResults: {},

  addImages: (files) => {
    const validFiles = files.filter((f) => ALLOWED_TYPES.includes(f.type));

    validFiles.forEach(async (file) => {
      const dataUrl = await fileToDataUrl(file);
      const image: UploadedImage = {
        id: generateId(),
        file,
        name: file.name,
        size: file.size,
        dataUrl,
        addedAt: Date.now(),
      };
      set((state) => ({
        uploadedImages: [...state.uploadedImages, image],
      }));
    });
  },

  removeImage: (id) => {
    set((state) => ({
      uploadedImages: state.uploadedImages.filter((img) => img.id !== id),
    }));
  },

  clearImages: () => {
    set({ uploadedImages: [] });
  },

  startScan: async () => {
    const { uploadedImages } = get();
    if (uploadedImages.length === 0 || get().isProcessing) return;

    set({ isProcessing: true, currentProgress: 0, currentStatusMessage: 'Initializing OCR engine...' });

    // Process each image sequentially
    for (const image of uploadedImages) {
      const scanId = generateId();
      const scanRecord: ScanRecord = {
        id: scanId,
        imageName: image.name,
        imageDataUrl: image.dataUrl,
        timestamp: formatTimestamp(),
        status: 'processing',
        progress: 0,
        confidence: 0,
        extractedData: null,
      };

      set({ currentScan: scanRecord });

      try {
        const result = await ocrService.recognize(image.dataUrl, (progress, status) => {
          set({
            currentProgress: progress,
            currentStatusMessage: status,
            currentScan: { ...scanRecord, progress, status: 'processing' },
          });
        });

        // Auto-trigger Rule Engine Validation
        const validationResult = validateProduct(result.extractedData);
        validationResult.scanId = scanId;

        // Auto-trigger RAG Statutory Mapping, User Complaint Verification & Auto-Adding Missing Complaints
        const correlationResult = processScanDiscrepanciesAndCorrelate(
          scanId,
          result.extractedData,
          validationResult,
          result.rawText
        );

        // Auto-trigger Feature 4: Font Size & Optical Readability Analysis Engine
        const readabilityResult = await readabilityService.analyze(
          scanId,
          image.dataUrl,
          result.extractedData,
          result.extractedData.imageDimensions || { width: 800, height: 600 }
        );

        const completedScan: ScanRecord = {
          ...scanRecord,
          status: 'completed',
          progress: 100,
          confidence: result.confidence,
          extractedData: result.extractedData,
          readabilityResult,
        };

        // Automatically ingest scanned product into the central Compliance Products Repository
        useComplianceStore.getState().addScannedProduct(
          result.extractedData,
          image.dataUrl,
          result.confidence,
          validationResult
        );

        set((state) => ({
          scans: [completedScan, ...state.scans],
          currentScan: completedScan,
          currentProgress: 100,
          currentStatusMessage: `Extraction & Readability complete — Score: ${readabilityResult.summary.overallScore}/100. ${correlationResult.summary.totalDiscrepancies} packaging discrepancy(s) mapped.`,
          validationResults: {
            ...state.validationResults,
            [completedScan.id]: validationResult,
          },
          correlationResults: {
            ...state.correlationResults,
            [completedScan.id]: correlationResult,
          },
          readabilityResults: {
            ...state.readabilityResults,
            [completedScan.id]: readabilityResult,
          },
        }));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'OCR processing failed';
        const failedScan: ScanRecord = {
          ...scanRecord,
          status: 'error',
          progress: 0,
          errorMessage,
        };

        set((state) => ({
          scans: [failedScan, ...state.scans],
          currentScan: failedScan,
          currentStatusMessage: `Error: ${errorMessage}`,
        }));
      }
    }

    set({ isProcessing: false, uploadedImages: [] });
  },

  updateScanProgress: (id, progress, status) => {
    set((state) => ({
      currentScan: state.currentScan?.id === id
        ? { ...state.currentScan, progress }
        : state.currentScan,
      currentProgress: progress,
      currentStatusMessage: status,
    }));
  },

  completeScan: (id, rawText, confidence, extractedData) => {
    set((state) => ({
      scans: state.scans.map((s) =>
        s.id === id
          ? { ...s, status: 'completed' as const, progress: 100, confidence, extractedData }
          : s
      ),
    }));
  },

  failScan: (id, error) => {
    set((state) => ({
      scans: state.scans.map((s) =>
        s.id === id ? { ...s, status: 'error' as const, errorMessage: error } : s
      ),
    }));
  },

  deleteScan: (id) => {
    set((state) => {
      const { [id]: _remVal, ...remainingValidation } = state.validationResults;
      const { [id]: _remCorr, ...remainingCorrelation } = state.correlationResults;
      const { [id]: _remRead, ...remainingReadability } = state.readabilityResults;
      return {
        scans: state.scans.filter((s) => s.id !== id),
        currentScan: state.currentScan?.id === id ? null : state.currentScan,
        validationResults: remainingValidation,
        correlationResults: remainingCorrelation,
        readabilityResults: remainingReadability,
      };
    });
  },

  clearHistory: () => {
    set({ scans: [], currentScan: null, validationResults: {}, correlationResults: {}, readabilityResults: {} });
  },

  viewScan: (scan) => {
    set({ currentScan: scan });
  },

  setValidationResult: (scanId, result) => {
    set((state) => ({
      validationResults: {
        ...state.validationResults,
        [scanId]: result,
      },
    }));
  },

  setReadabilityResult: (scanId, result) => {
    set((state) => ({
      readabilityResults: {
        ...state.readabilityResults,
        [scanId]: result,
      },
    }));
  },
}));
