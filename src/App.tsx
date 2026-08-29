import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { OverviewDashboard } from './pages/dashboard/OverviewDashboard';
import { ProductsIntelligence } from './pages/dashboard/ProductsIntelligence';
import { ProductScanner } from './pages/dashboard/ProductScanner';
import { ViolationsLedger } from './pages/dashboard/ViolationsLedger';
import { ManufacturerRiskRanking } from './pages/dashboard/ManufacturerRiskRanking';
import { ConsumerComplaintsPortal } from './pages/dashboard/ConsumerComplaintsPortal';
import { AnalyticsIntelligence } from './pages/dashboard/AnalyticsIntelligence';
import { FactoryHygieneMonitoring } from './pages/dashboard/FactoryHygieneMonitoring';
import { AILegalReviewAgent } from './pages/dashboard/AILegalReviewAgent';
import { SettingsRegulatoryRules } from './pages/dashboard/SettingsRegulatoryRules';
import { RegulatoryRAGPortal } from './pages/dashboard/RegulatoryRAGPortal';
import { AnimatedThemeToggler } from './components/ui/AnimatedThemeToggler';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Authenticated Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<OverviewDashboard />} />
          <Route path="products" element={<ProductsIntelligence />} />
          <Route path="scanner" element={<ProductScanner />} />
          <Route path="violations" element={<ViolationsLedger />} />
          <Route path="manufacturers" element={<ManufacturerRiskRanking />} />
          <Route path="complaints" element={<ConsumerComplaintsPortal />} />
          <Route path="analytics" element={<AnalyticsIntelligence />} />
          <Route path="regulatory-rag" element={<RegulatoryRAGPortal />} />
          <Route path="factory-hygiene" element={<FactoryHygieneMonitoring />} />
          <Route path="legal-review" element={<AILegalReviewAgent />} />
          <Route path="settings" element={<SettingsRegulatoryRules />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Floating Corner Theme Toggler Dock */}
      <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 group print:hidden">
        <div className="flex items-center p-1 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-modal hover:shadow-lg transition-all duration-300">
          <AnimatedThemeToggler className="h-10 w-10 rounded-xl shadow-xs" />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
