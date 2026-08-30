import React, { useState } from 'react';
import {
  FileCheck2,
  ShieldCheck,
  AlertTriangle,
  PlusCircle,
  Gavel,
  BookOpen,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Send,
  Check,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useScanStore } from '../../store/scanStore';
import { lodgeScanDiscrepancyComplaint } from '../../lib/scanComplaintCorrelator';
import { cn } from '../../lib/utils';

export const ScanCorrelationCard: React.FC = () => {
  const { currentScan, correlationResults } = useScanStore();
  const [activeTab, setActiveTab] = useState<'rag' | 'matching'>('rag');
  const [isLodged, setIsLodged] = useState(false);
  const [lodgedTicketId, setLodgedTicketId] = useState<string | null>(null);

  if (!currentScan || currentScan.status !== 'completed') return null;

  const correlation = correlationResults[currentScan.id];
  if (!correlation) return null;

  const { auditWithRag, matchingUserComplaints, preparedComplaintForLodging, summary } = correlation;
  const discrepanciesWithRag = auditWithRag.filter((a) => a.ragMapping);

  const handleLodgeComplaint = () => {
    if (!preparedComplaintForLodging) return;
    const complaint = lodgeScanDiscrepancyComplaint(preparedComplaintForLodging);
    setIsLodged(true);
    setLodgedTicketId(complaint.ticketId);
  };

  return (
    <Card className="border border-slate-200 shadow-subtle bg-white overflow-hidden">
      <CardHeader className="px-5 py-4 border-b border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-xs">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold font-mono tracking-widest text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 uppercase">
                SATYADRISTHI RAG STATUTORY MAPPING
              </span>
            </div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight mt-0.5">
              RAG Discrepancy Mapping &amp; Action Portal
            </h2>
          </div>
        </div>

        {/* Tab Buttons & Action */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setActiveTab('rag')}
              className={cn(
                'px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5',
                activeTab === 'rag'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>RAG Discrepancies ({discrepanciesWithRag.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('matching')}
              className={cn(
                'px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5',
                activeTab === 'matching'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              <FileCheck2 className="h-3.5 w-3.5" />
              <span>Matching Complaints ({matchingUserComplaints.length})</span>
            </button>
          </div>

          {/* Button to Lodge Formal Complaint */}
          {preparedComplaintForLodging && (
            <Button
              variant={isLodged ? 'secondary' : 'primary'}
              size="sm"
              onClick={handleLodgeComplaint}
              disabled={isLodged}
              className={cn(
                'text-xs font-bold gap-1.5 shadow-xs',
                isLodged ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-amber-600 hover:bg-amber-700 text-white'
              )}
            >
              {isLodged ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Complaint Lodged ({lodgedTicketId})</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Lodge Complaint for Discrepancies</span>
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        {/* Lodged Banner Notice */}
        {isLodged && lodgedTicketId && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 text-xs text-emerald-800">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>
                Formal statutory grievance ticket <span className="font-mono font-bold text-emerald-950">{lodgedTicketId}</span> has been lodged into the Consumer Complaints Portal with all RAG statutory mappings.
              </span>
            </div>
            <a
              href="/dashboard/complaints"
              className="text-emerald-700 hover:text-emerald-900 font-bold underline shrink-0"
            >
              View in Portal &rarr;
            </a>
          </div>
        )}

        {/* Tab 1: RAG Discrepancy Statutory Mappings */}
        {activeTab === 'rag' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 pb-1 border-b border-slate-100">
              <span className="font-semibold text-slate-700">
                Packaging non-compliances mapped to Legal Metrology Statutory Rules via RAG
              </span>
              <span className="font-mono">{discrepanciesWithRag.length} Statutory Mappings</span>
            </div>

            {discrepanciesWithRag.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-lg">
                No statutory label discrepancies detected for RAG mapping on this package scan.
              </div>
            ) : (
              discrepanciesWithRag.map((item, idx) => {
                const rag = item.ragMapping!;
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50/40 to-slate-50 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-blue-700 uppercase bg-blue-100 px-2 py-0.5 rounded">
                          {rag.ruleCode}
                        </span>
                        <h4 className="text-xs font-extrabold text-slate-900 mt-1">
                          {item.ruleName}
                        </h4>
                        <p className="text-[11px] font-mono text-slate-600">
                          {rag.section} • {rag.authority}
                        </p>
                      </div>

                      <Badge variant="warning" size="sm" className="font-mono">
                        Relevance {(rag.relevanceScore * 100).toFixed(0)}%
                      </Badge>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Verbatim Statutory Clause (Regulatory RAG Provenance)
                      </span>
                      <p className="text-slate-800 italic leading-relaxed">
                        "{rag.verbatimClause}"
                      </p>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] font-mono text-slate-500">
                        <span>Gazette Ref: {rag.officialGazetteRef}</span>
                        <span>
                          Statutory Penalty Range: ₹{rag.penalties.minFine.toLocaleString('en-IN')} – ₹
                          {rag.penalties.maxFine.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                      <span>OCR Evidence Extracted:</span>
                      <span className="font-mono text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {item.evidence}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Matching User Complaints */}
        {activeTab === 'matching' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 pb-1 border-b border-slate-100">
              <span className="font-semibold text-slate-700">
                Existing user complaints matching this product
              </span>
              <span className="font-mono">{matchingUserComplaints.length} Related Cases</span>
            </div>

            {matchingUserComplaints.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-lg">
                No prior consumer complaint matched this specific scanned product in the ledger.
              </div>
            ) : (
              matchingUserComplaints.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded">
                          {c.ticketId}
                        </span>
                        <Badge variant="primary" size="sm">
                          {c.status}
                        </Badge>
                      </div>
                      <h4 className="text-xs font-extrabold text-slate-900 mt-1">
                        Complainant: {c.consumerName}
                      </h4>
                      <p className="text-[11px] text-slate-600">
                        Allegation: "{c.description}"
                      </p>
                    </div>

                    <span className="text-[11px] font-mono text-slate-500">{c.submittedAt}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
