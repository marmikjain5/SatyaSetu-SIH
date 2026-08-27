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
import { SettingsRegulatoryRules } from './pages/dashboard/SettingsRegulatoryRules';
import { RegulatoryRAGPortal } from './pages/dashboard/RegulatoryRAGPortal';

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
          <Route path="settings" element={<SettingsRegulatoryRules />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
