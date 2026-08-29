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

interface HygieneState {
  // Data
  factories: Factory[];
  alerts: HygieneAlert[];
  violations: HygieneViolation[];
  inspections: HygieneInspection[];
  trends: HygieneTrendPoint[];

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
}

export const useHygieneStore = create<HygieneState>((set, get) => ({
  // Initialize from mock data
  factories: MOCK_FACTORIES,
  alerts: MOCK_HYGIENE_ALERTS,
  violations: MOCK_HYGIENE_VIOLATIONS,
  inspections: MOCK_INSPECTIONS,
  trends: MOCK_HYGIENE_TRENDS,

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

  getFactoryById: (id) => get().factories.find((f) => f.id === id),

  getFactoryAlerts: (factoryId) =>
    get().alerts.filter((a) => a.factoryId === factoryId),

  getFactoryViolations: (factoryId) =>
    get().violations.filter((v) => v.factoryId === factoryId),

  getFactoryInspections: (factoryId) =>
    get().inspections.filter((i) => i.factoryId === factoryId),
}));
