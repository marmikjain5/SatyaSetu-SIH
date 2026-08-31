/**
 * SatyaDrishti Compliance Report Store (Feature 5)
 *
 * Persists and manages generated inspection compliance reports with localStorage caching,
 * search by Product Name / Report ID, and export triggers.
 */

import { create } from 'zustand';
import type { ComplianceInspectionReport } from '../types/report';

interface ReportState {
  reports: ComplianceInspectionReport[];
  currentReport: ComplianceInspectionReport | null;
  searchQuery: string;
  selectedStatusFilter: 'all' | 'compliant' | 'non-compliant' | 'warning';

  // Actions
  addReport: (report: ComplianceInspectionReport) => void;
  setCurrentReport: (report: ComplianceInspectionReport | null) => void;
  deleteReport: (reportId: string) => void;
  clearAllReports: () => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: 'all' | 'compliant' | 'non-compliant' | 'warning') => void;
  getReportById: (reportId: string) => ComplianceInspectionReport | undefined;
  getReportsByScanId: (scanId: string) => ComplianceInspectionReport[];
}

const STORAGE_KEY = 'satyadrishti_compliance_reports_history';

function loadPersistedReports(): ComplianceInspectionReport[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveReports(reports: ComplianceInspectionReport[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  } catch (_e) {
    // Graceful storage quota fallback
  }
}

export const useReportStore = create<ReportState>((set, get) => ({
  reports: loadPersistedReports(),
  currentReport: null,
  searchQuery: '',
  selectedStatusFilter: 'all',

  addReport: (report) => {
    set((state) => {
      // Remove any existing report with same reportId to avoid duplicate
      const filtered = state.reports.filter((r) => r.reportId !== report.reportId);
      const updated = [report, ...filtered];
      saveReports(updated);
      return { reports: updated, currentReport: report };
    });
  },

  setCurrentReport: (report) => {
    set({ currentReport: report });
  },

  deleteReport: (reportId) => {
    set((state) => {
      const updated = state.reports.filter((r) => r.reportId !== reportId);
      saveReports(updated);
      return {
        reports: updated,
        currentReport: state.currentReport?.reportId === reportId ? null : state.currentReport,
      };
    });
  },

  clearAllReports: () => {
    saveReports([]);
    set({ reports: [], currentReport: null });
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  setStatusFilter: (status) => {
    set({ selectedStatusFilter: status });
  },

  getReportById: (reportId) => {
    return get().reports.find((r) => r.reportId === reportId);
  },

  getReportsByScanId: (scanId) => {
    return get().reports.filter((r) => r.scanId === scanId);
  },
}));
