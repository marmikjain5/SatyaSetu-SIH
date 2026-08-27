import React, { useState } from 'react';
import { LandingNavbar } from '../components/layout/LandingNavbar';
import { LandingFooter } from '../components/layout/LandingFooter';
import { HeroSection } from '../components/landing/HeroSection';
import { TrustedByRegulators } from '../components/landing/TrustedByRegulators';
import { StatsCounterSection } from '../components/landing/StatsCounterSection';
import { CoreCapabilitiesSection } from '../components/landing/CoreCapabilitiesSection';
import { WorkflowTimelineSection } from '../components/landing/WorkflowTimelineSection';
import { PlatformPreviewSection } from '../components/landing/PlatformPreviewSection';
import { BentoFeaturesGrid } from '../components/landing/BentoFeaturesGrid';
import { CtaBannerSection } from '../components/landing/CtaBannerSection';
import { RequestDemoModal } from '../components/landing/RequestDemoModal';

export const LandingPage: React.FC = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <LandingNavbar onRequestDemo={() => setIsDemoModalOpen(true)} />
      <main className="flex-1">
        <HeroSection onRequestDemo={() => setIsDemoModalOpen(true)} />
        <TrustedByRegulators />
        <StatsCounterSection />
        <CoreCapabilitiesSection />
        <WorkflowTimelineSection />
        <PlatformPreviewSection />
        <BentoFeaturesGrid />
        <CtaBannerSection onRequestDemo={() => setIsDemoModalOpen(true)} />
      </main>
      <LandingFooter />

      <RequestDemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />
    </div>
  );
};
