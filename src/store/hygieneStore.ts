import { create } from 'zustand';
import {
  Factory,
  HygieneZone,
  HygieneInspection,
  HygieneViolation,
  HygieneAlert,
  HygieneTrendPoint,
  HygieneStatus,
} from '../types/hygiene';
import {
  MOCK_FACTORIES,
  MOCK_HYGIENE_ALERTS,
  MOCK_HYGIENE_VIOLATIONS,
  MOCK_INSPECTIONS,
  MOCK_HYGIENE_TRENDS,
} from '../data/mockHygieneData';
import { VisionFinding } from '../lib/hygieneVisionService';

export interface ManufacturerAssessment {
  id: string;
  manufacturerId: string;
  manufacturerName: string;
  imageUrl: string;
  riskScore: number;
  riskLevel: 'Low Risk' | 'Medium Risk' | 'High Risk';
  findingsCount: number;
  findings: VisionFinding[];
  status: 'certified' | 'needs-remediation' | 'pending-verification';
  submittedAt: string;
}

interface HygieneState {
  // Data
  factories: Factory[];
  alerts: HygieneAlert[];
  violations: HygieneViolation[];
  inspections: HygieneInspection[];
  trends: HygieneTrendPoint[];
  manufacturerAssessments: ManufacturerAssessment[];

  // UI state
  selectedFactory: Factory | null;
  selectedZone: HygieneZone | null;
  searchQuery: string;
  statusFilter: HygieneStatus | 'all';

  // Actions
  selectFactory: (factory: Factory | null) => void;
  selectZone: (zone: HygieneZone | null) => void;
  clearSelection: () => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: HygieneStatus | 'all') => void;
  acknowledgeAlert: (alertId: string) => void;
  resolveViolation: (violationId: string) => void;
  escalateViolation: (violationId: string) => void;
  getFactoryById: (id: string) => Factory | undefined;
  getFactoryAlerts: (factoryId: string) => HygieneAlert[];
  getFactoryViolations: (factoryId: string) => HygieneViolation[];
  getFactoryInspections: (factoryId: string) => HygieneInspection[];
  addViolation: (violation: HygieneViolation) => void;
  addManufacturerAssessment: (assessment: ManufacturerAssessment) => void;
  getManufacturerAssessments: (manufacturerId: string) => ManufacturerAssessment[];
}

export const useHygieneStore = create<HygieneState>((set, get) => ({
  // Initialize from mock data
  factories: MOCK_FACTORIES,
  alerts: MOCK_HYGIENE_ALERTS,
  violations: MOCK_HYGIENE_VIOLATIONS,
  inspections: MOCK_INSPECTIONS,
  trends: MOCK_HYGIENE_TRENDS,
  manufacturerAssessments: [
    {
      id: 'MFG-CERT-20260904-01',
      manufacturerId: 'USR-MFG-501',
      manufacturerName: 'Apex FMCG Enterprises',
      imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80',
      riskScore: 22,
      riskLevel: 'Low Risk',
      findingsCount: 1,
      findings: [
        {
          id: 'vis-find-init-1',
          category: 'Improper Storage',
          title: 'Improper Storage Detected',
          description: 'Empty packaging crates placed near secondary entrance.',
          severity: 'low',
          confidence: 88,
          recommendation: 'Relocate empty containers to the designated rear bay.',
        },
      ],
      status: 'certified',
      submittedAt: '2026-09-04T10:30:00.000Z',
    },
    {
      id: 'MFG-CERT-20260828-02',
      manufacturerId: 'USR-MFG-501',
      manufacturerName: 'Apex FMCG Enterprises',
      imageUrl: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=800&auto=format&fit=crop&q=80',
      riskScore: 35,
      riskLevel: 'Medium Risk',
      findingsCount: 2,
      findings: [
        {
          id: 'vis-find-init-2',
          category: 'Dirty Floors',
          title: 'Dirty Floors Detected',
          description: 'Minor moisture staining along packaging line belt.',
          severity: 'medium',
          confidence: 82,
          recommendation: 'Schedule intermediate dry-wipe during shift changeovers.',
        },
      ],
      status: 'certified',
      submittedAt: '2026-08-28T14:15:00.000Z',
    },
  ],

  // UI defaults
  selectedFactory: null,
  selectedZone: null,
  searchQuery: '',
  statusFilter: 'all',

  // Actions
  selectFactory: (factory) => set({ selectedFactory: factory, selectedZone: null }),

  selectZone: (zone) => set({ selectedZone: zone }),

  clearSelection: () => set({ selectedFactory: null, selectedZone: null }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  setStatusFilter: (statusFilter) => set({ statusFilter }),

  acknowledgeAlert: (alertId) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === alertId ? { ...a, acknowledged: true } : a
      ),
    })),

  resolveViolation: (violationId) =>
    set((state) => ({
      violations: state.violations.map((v) =>
        v.id === violationId ? { ...v, status: 'remediated' } : v
      ),
    })),

  escalateViolation: (violationId) =>
    set((state) => ({
      violations: state.violations.map((v) =>
        v.id === violationId
          ? { ...v, status: 'escalated' }
          : v
      ),
    })),

  addViolation: (violation) =>
    set((state) => ({
      violations: [violation, ...state.violations],
    })),

  getFactoryById: (id) => get().factories.find((f) => f.id === id),

  getFactoryAlerts: (factoryId) =>
    get().alerts.filter((a) => a.factoryId === factoryId),

  getFactoryViolations: (factoryId) =>
    get().violations.filter((v) => v.factoryId === factoryId),

  getFactoryInspections: (factoryId) =>
    get().inspections.filter((i) => i.factoryId === factoryId),

  addManufacturerAssessment: (assessment) =>
    set((state) => ({
      manufacturerAssessments: [assessment, ...state.manufacturerAssessments],
    })),

  getManufacturerAssessments: (manufacturerId) =>
    get().manufacturerAssessments.filter((a) => a.manufacturerId === manufacturerId),
}));
