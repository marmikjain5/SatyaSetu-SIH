import { create } from 'zustand';
import {
  Product,
  Violation,
  Manufacturer,
  Complaint,
  RegulatoryRule,
  OfficerActionType,
  OfficerDecisionRecord,
} from '../types/compliance';
import { MOCK_PRODUCTS } from '../data/mockProducts';
import { MOCK_VIOLATIONS } from '../data/mockViolations';
import { MOCK_MANUFACTURERS } from '../data/mockManufacturers';
import { MOCK_COMPLAINTS } from '../data/mockComplaints';
import { MOCK_RULES } from '../data/mockComplianceData';

interface ComplianceState {
  products: Product[];
  violations: Violation[];
  manufacturers: Manufacturer[];
  complaints: Complaint[];
  rules: RegulatoryRule[];
  selectedProduct: Product | null;
  selectedViolation: Violation | null;
  searchQuery: string;

  // Actions
  setSelectedProduct: (product: Product | null) => void;
  setSelectedViolation: (violation: Violation | null) => void;
  setSearchQuery: (query: string) => void;
  issueNotice: (violationId: string, customNoticeText?: string) => string;
  resolveViolation: (violationId: string) => void;
  addComplaint: (complaint: Omit<Complaint, 'id' | 'ticketId' | 'submittedAt' | 'status'> | Complaint) => void;
  addFullComplaint: (complaint: Complaint) => void;
  updateOfficerDecision: (
    complaintId: string,
    action: OfficerActionType,
    notes: string,
    officerName?: string,
    assignedInspector?: string
  ) => void;
  toggleRule: (ruleId: string) => void;
}

export const useComplianceStore = create<ComplianceState>((set) => ({
  products: MOCK_PRODUCTS,
  violations: MOCK_VIOLATIONS,
  manufacturers: MOCK_MANUFACTURERS,
  complaints: MOCK_COMPLAINTS,
  rules: MOCK_RULES,
  selectedProduct: null,
  selectedViolation: null,
  searchQuery: '',

  setSelectedProduct: (product) => set({ selectedProduct: product }),
  setSelectedViolation: (violation) => set({ selectedViolation: violation }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  issueNotice: (violationId) => {
    const noticeId = `SCN-2025-${Math.floor(1000 + Math.random() * 9000)}`;
    set((state) => ({
      violations: state.violations.map((v) =>
        v.id === violationId ? { ...v, status: 'Notice Issued', noticeId } : v
      ),
      products: state.products.map((p) =>
        state.violations.find((v) => v.id === violationId && v.productId === p.id)
          ? { ...p, status: 'notice-issued' }
          : p
      ),
    }));
    return noticeId;
  },

  resolveViolation: (violationId) => {
    set((state) => ({
      violations: state.violations.map((v) =>
        v.id === violationId ? { ...v, status: 'Resolved' } : v
      ),
    }));
  },

  addComplaint: (complaintData) => {
    if ('ticketId' in complaintData && 'id' in complaintData) {
      set((state) => ({
        complaints: [complaintData as Complaint, ...state.complaints],
      }));
      return;
    }

    const ticketId = `NCH-GRV-2025-${Math.floor(10000 + Math.random() * 90000)}`;
    const newComplaint: Complaint = {
      ...(complaintData as any),
      id: `CMP-${Date.now()}`,
      ticketId,
      submittedAt: 'Just now',
      status: 'New',
    };
    set((state) => ({
      complaints: [newComplaint, ...state.complaints],
    }));
  },

  addFullComplaint: (complaint) => {
    set((state) => ({
      complaints: [complaint, ...state.complaints],
    }));
  },

  updateOfficerDecision: (complaintId, action, notes, officerName = 'Inspector Officer', assignedInspector) => {
    const actionStatusMap: Record<OfficerActionType, Complaint['status']> = {
      ACCEPT_INVESTIGATION: 'Investigation',
      REJECT: 'Rejected',
      REQUEST_INFO: 'More Info Requested',
      INSUFFICIENT_EVIDENCE: 'Insufficient Evidence',
      ASSIGN_INSPECTION: 'Assigned for Inspection',
      RESOLVE: 'Resolved',
    };

    const actionLabelMap: Record<OfficerActionType, string> = {
      ACCEPT_INVESTIGATION: 'Accepted for Formal Legal Investigation',
      REJECT: 'Complaint Rejected / Dismissed',
      REQUEST_INFO: 'Additional Information Requested from Complainant',
      INSUFFICIENT_EVIDENCE: 'Marked as Insufficient Evidence',
      ASSIGN_INSPECTION: 'Assigned Zonal Metrology Officer for On-Site Inspection',
      RESOLVE: 'Complaint Resolved & Penalty Recovered',
    };

    const newStatus = actionStatusMap[action] || 'Investigation';
    const actionLabel = actionLabelMap[action] || action;

    set((state) => ({
      complaints: state.complaints.map((c) => {
        if (c.id !== complaintId) return c;

        const newRecord: OfficerDecisionRecord = {
          id: `odr-${Date.now()}`,
          timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
          officerName,
          action,
          actionLabel,
          notes,
          assignedInspector,
        };

        const existingHistory = c.officerDecisionHistory || [];

        return {
          ...c,
          status: newStatus,
          assignedOfficer: officerName,
          officerDecisionHistory: [newRecord, ...existingHistory],
          caseCorrelationSummary: c.caseCorrelationSummary
            ? {
                ...c.caseCorrelationSummary,
                verificationStatus: (actionLabel as any),
              }
            : undefined,
        };
      }),
    }));
  },

  toggleRule: (ruleId) => {
    set((state) => ({
      rules: state.rules.map((r) =>
        r.id === ruleId ? { ...r, isActive: !r.isActive } : r
      ),
    }));
  },
}));
