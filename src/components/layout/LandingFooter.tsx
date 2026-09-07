import React from 'react';
import { Lock, FileText, Globe, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="bg-slate-50 text-slate-600 border-t border-slate-200 dark:bg-[#0F172A] dark:text-slate-400 dark:border-slate-800 text-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Col 1: Platform identity */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Satya<span className="text-blue-600 dark:text-blue-500">Drishti</span>
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
              AI-Powered National Consumer Protection, Legal Metrology Enforcement, &amp; E-Commerce Compliance Intelligence Platform. Built to uphold market integrity, detect deceptive packaging, and protect consumer rights at scale.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-700 dark:text-slate-300 pt-2 font-mono">
              <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800/80 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 shadow-2xs">
                <Lock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>256-Bit Encrypted Gov Data</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800/80 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 shadow-2xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>CCPA &amp; Legal Metrology Certified</span>
              </div>
            </div>
          </div>

          {/* Col 2: Regulatory Acts */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Regulatory Coverage
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">Legal Metrology Act, 2009</li>
              <li className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">Packaged Commodities Rules 2011</li>
              <li className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">Consumer Protection Act, 2019</li>
              <li className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">E-Commerce Rules, 2020</li>
              <li className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">FSSAI Packaging Regulations 2018</li>
              <li className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">Drugs &amp; Magic Remedies Act 1954</li>
            </ul>
          </div>

          {/* Col 3: Modules */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Intelligence Modules
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/login" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                  OCR Label Inspector
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                  Marketplace Web Crawlers
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                  Automated SCN Notice Generator
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                  Manufacturer Risk Matrix
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                  Consumer Grievance NLP
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Authorized Portals
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/login?portal=consumer" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-white font-semibold transition-colors">
                  Consumer Grievance Portal
                </Link>
              </li>
              <li>
                <Link to="/directory" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-white transition-colors">
                  Public Product Directory (No Login)
                </Link>
              </li>
              <li>
                <Link to="/login?portal=inspector" className="text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-white transition-colors">
                  Legal Metrology Inspector Portal
                </Link>
              </li>
              <li>
                <Link to="/login?portal=manufacturer" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-white transition-colors">
                  Manufacturer &amp; Brand Portal
                </Link>
              </li>
              <li>
                <Link to="/login?portal=admin" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-white transition-colors">
                  CCPA Central Directorate Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & disclaimer */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© 2025 SatyaDrishti Compliance Intelligence System. Smart India Hackathon Enterprise Edition.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
              <Globe className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" /> India Data Residency
            </span>
            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
              <FileText className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" /> ISO 27001 / CERT-In Aligned
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
