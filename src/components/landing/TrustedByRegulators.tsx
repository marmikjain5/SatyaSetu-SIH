import React from 'react';
import { Scale, ShieldCheck, Building2, Landmark } from 'lucide-react';

export const TrustedByRegulators: React.FC = () => {
  return (
    <section className="py-12 bg-white border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <p className="text-xs sm:text-sm font-semibold text-slate-800 tracking-tight">
            <span className="text-slate-900 font-bold">Trusted by Regulators.</span>{' '}
            <span className="text-slate-500 font-normal">Built for Impact.</span>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Regulator 1: Legal Metrology */}
          <div className="bg-[#F8FAFC] rounded-xl border border-slate-200/90 p-4 flex items-center gap-3.5 hover:border-slate-300 hover:shadow-xs transition-all">
            <div className="h-10 w-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 shrink-0 shadow-2xs">
              <Landmark className="h-5 w-5 text-slate-700" />
            </div>
            <div>
              <div className="text-[11px] text-slate-500 leading-tight">Department of</div>
              <div className="text-xs font-bold text-slate-900 leading-tight mt-0.5">Legal Metrology</div>
              <div className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">Govt. of India</div>
            </div>
          </div>

          {/* Regulator 2: CCPA */}
          <div className="bg-[#F8FAFC] rounded-xl border border-slate-200/90 p-4 flex items-center gap-3.5 hover:border-slate-300 hover:shadow-xs transition-all">
            <div className="h-10 w-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-blue-600 shrink-0 shadow-2xs">
              <Scale className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-[11px] text-slate-500 leading-tight">Central Consumer</div>
              <div className="text-xs font-bold text-slate-900 leading-tight mt-0.5">Protection Authority</div>
              <div className="text-[10px] text-blue-600 font-semibold leading-tight mt-0.5">(CCPA)</div>
            </div>
          </div>

          {/* Regulator 3: NIC */}
          <div className="bg-[#F8FAFC] rounded-xl border border-slate-200/90 p-4 flex items-center gap-3.5 hover:border-slate-300 hover:shadow-xs transition-all">
            <div className="h-10 w-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
              <span className="text-base font-extrabold text-blue-700 font-mono tracking-tighter">NIC</span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 leading-tight">National Informatics</div>
              <div className="text-xs font-medium text-slate-500 leading-tight mt-0.5">Centre</div>
            </div>
          </div>

          {/* Regulator 4: MyGov */}
          <div className="bg-[#F8FAFC] rounded-xl border border-slate-200/90 p-4 flex items-center gap-3.5 hover:border-slate-300 hover:shadow-xs transition-all">
            <div className="h-10 w-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
              <div className="flex items-center text-xs font-black">
                <span className="text-blue-600">my</span>
                <span className="text-amber-600">Gov</span>
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 leading-tight">Citizen-Centric</div>
              <div className="text-xs font-medium text-slate-500 leading-tight mt-0.5">Platform</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
