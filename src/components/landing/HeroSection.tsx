import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, CheckCircle, Lock, Sparkles, Building2, UserCheck, Scale, Factory } from 'lucide-react';
import { Button } from '../ui/Button';
import { LiveComplianceWidget } from './LiveComplianceWidget';
import { GridPattern } from '../ui/GridPattern';
import { cn } from '../../lib/utils';

interface HeroSectionProps {
  onRequestDemo: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onRequestDemo }) => {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-[#F8FAFC]">
      {/* Grid Pattern Background Texture */}
      <GridPattern
        squares={[
          [4, 4],
          [5, 1],
          [8, 2],
          [5, 3],
          [5, 5],
          [10, 10],
          [12, 15],
          [15, 10],
          [10, 15],
          [15, 10],
          [10, 15],
          [15, 10],
          [2, 6],
          [7, 12],
          [20, 8],
        ]}
        className={cn(
          "[mask-image:radial-gradient(750px_circle_at_center,white,transparent)]",
          "inset-x-0 inset-y-[-20%] h-[180%] skew-y-6 fill-blue-600/[0.06] stroke-slate-900/[0.05]"
        )}
      />

      {/* Subtle top ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-blue-500/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Gov Authority Trust Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white border border-slate-200 shadow-xs text-xs font-semibold text-slate-800">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              <span>National Consumer Intelligence Architecture</span>
              <span className="text-slate-400">|</span>
              <span className="text-blue-700 font-mono">SIH 2025</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight text-slate-900 leading-[1.12]">
              AI-Powered Consumer Protection & Compliance Intelligence
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-xl">
              Monitor compliance, detect violations, protect consumers, and empower regulators through intelligent automation.
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <Link to="/">
                <Button
                  variant="primary"
                  size="lg"
                  className="shadow-sm font-semibold gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <ShieldCheck className="h-4 w-4 text-blue-200" />
                  <span>Public Product Directory (Home)</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link to="/login">
                <Button variant="outline" size="lg" className="font-semibold gap-2 bg-white">
                  <span>Official Portal Login</span>
                  <Scale className="h-4 w-4 text-slate-600" />
                </Button>
              </Link>
            </div>

            {/* Key Trust Signals / Quick Links */}
            <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="font-medium text-slate-700">Legal Metrology</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="font-medium text-slate-700">CCPA Dark Patterns</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="font-medium text-slate-700">OCR Multi-Lingual</span>
              </div>
            </div>

            {/* Quick 1-Click Role Exploration */}
            <div className="bg-slate-100/80 p-3.5 rounded-xl border border-slate-200 text-xs">
              <span className="font-semibold text-slate-800 uppercase tracking-wider text-[11px] block mb-2">
                Instant Role Access (Demo Credentials Pre-wired):
              </span>
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/login?role=admin"
                  className="px-2.5 py-1 rounded bg-white border border-slate-300 text-slate-700 hover:border-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1.5 transition-colors"
                >
                  <Building2 className="h-3 w-3 text-blue-600" />
                  <span>Admin / CCPA Director</span>
                </Link>
                <Link
                  to="/login?role=inspector"
                  className="px-2.5 py-1 rounded bg-white border border-slate-300 text-slate-700 hover:border-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1.5 transition-colors"
                >
                  <Scale className="h-3 w-3 text-blue-600" />
                  <span>Field Inspector</span>
                </Link>
                <Link
                  to="/login?role=manufacturer"
                  className="px-2.5 py-1 rounded bg-white border border-slate-300 text-slate-700 hover:border-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1.5 transition-colors"
                >
                  <Factory className="h-3 w-3 text-indigo-600" />
                  <span>Manufacturer Cell</span>
                </Link>
                <Link
                  to="/login?role=consumer"
                  className="px-2.5 py-1 rounded bg-white border border-slate-300 text-slate-700 hover:border-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1.5 transition-colors"
                >
                  <UserCheck className="h-3 w-3 text-blue-600" />
                  <span>Consumer Portal</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Live Compliance Mockup */}
          <div className="lg:col-span-6">
            <LiveComplianceWidget />
          </div>
        </div>
      </div>
    </section>
  );
};
