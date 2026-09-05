import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { AboutPage } from './pages/AboutPage';
import { LoginPage } from './pages/LoginPage';
import { PublicDirectoryPage } from './pages/PublicDirectoryPage';
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

import { ScrollToAnchor } from './components/layout/ScrollToAnchor';

export function App() {
  return (
    <BrowserRouter>
      <ScrollToAnchor />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/directory" element={<PublicDirectoryPage />} />
        <Route path="/verify" element={<PublicDirectoryPage />} />
        <Route path="/public-directory" element={<Navigate to="/directory" replace />} />

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


    </BrowserRouter>
  );
}

export default App;
