import React, { useState } from 'react';
import {
  Search,
  BookOpen,
  ShieldCheck,
  ExternalLink,
  GitBranch,
  Layers,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Building2,
  Calendar,
  Sparkles,
  Clock,
  ThumbsUp,
  XCircle,
  Cpu,
  ArrowRight,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import {
  OFFICIAL_REGULATORY_SOURCES,
  INITIAL_RULE_REGISTRY,
  KNOWLEDGE_GRAPH_NODES,
  KNOWLEDGE_GRAPH_EDGES,
  queryRegulatoryRAG,
  RegulatoryAuthority,
  RegulatoryRuleItem,
} from '../../lib/ragKnowledgeService';
import { formatCurrency } from '../../lib/utils';

export const RegulatoryRAGPortal: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAuthority, setSelectedAuthority] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('search');
  const [ruleRegistry, setRuleRegistry] = useState<RegulatoryRuleItem[]>(INITIAL_RULE_REGISTRY);
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawledAlert, setCrawledAlert] = useState<string | null>(null);

  const handleTriggerGazetteCrawler = () => {
    setIsCrawling(true);
    setCrawledAlert('Scanning e-Gazette RSS feeds (consumeraffairs.nic.in & fssai.gov.in)...');

    setTimeout(() => {
      setRuleRegistry((prev) => {
        const exists = prev.some((r) => r.code === 'PCR-2026-R6(1)(q)');
        if (exists) {
          setCrawledAlert('Gazette G.S.R. 882(E) is already ingested in the pending queue.');
          return prev;
        }

        const newIngestedRule: RegulatoryRuleItem = {
          ruleId: 'rule-auto-882e',
          code: 'PCR-2026-R6(1)(q)',
          title: 'Mandatory Dual QR Code & Digital Gazette Verification',
          authority: 'Legal Metrology',
          act: 'Legal Metrology (Packaged Commodities) Amendment Rules, 2026',
          sourceSection: 'Rule 6(1)(q)',
          appliesTo: ['packaged_goods', 'electronics', 'all'],
          severity: 'CRITICAL',
          status: 'PENDING_APPROVAL',
          activeVersion: 1,
          versions: [
            {
              versionId: 'ver-auto-882e-1',
              versionNumber: 1,
              effectiveFrom: '2026-11-01',
              effectiveUntil: null,
              status: 'PENDING_APPROVAL',
              changeSummary: 'Ingested from G.S.R. 882(E) gazette: Requires 2D QR Code on PDP embedding digital batch verification link.',
              proposedBy: 'Legal Metrology Automated Gazette Crawler (consumeraffairs.nic.in)',
              ruleDefinition: { field: 'qrCode', condition: 'valid_digital_verification', mandatory: true },
            },
          ],
        };

        setCrawledAlert('New Gazette G.S.R. 882(E) ingested! 1 Rule pending officer review.');
        return [newIngestedRule, ...prev];
      });

      setIsCrawling(false);
      setActiveTab('versioning');
    }, 1500);
  };

  // Execute RAG Query
  const searchResults = queryRegulatoryRAG({
    queryText: searchQuery,
    authorityFilter: selectedAuthority === 'all' ? undefined : selectedAuthority,
    evaluationDate: '2026-08-27',
  });

  const handleApprovePendingRule = (ruleId: string, versionId: string) => {
    setRuleRegistry((prev) =>
      prev.map((rule) => {
        if (rule.ruleId !== ruleId) return rule;
        const updatedVersions = rule.versions.map((ver) => {
          if (ver.versionId === versionId) {
            return {
              ...ver,
              status: 'ACTIVE' as const,
              approvedBy: 'Senior Compliance Officer (Verified)',
              approvedAt: new Date().toISOString().split('T')[0],
            };
          }
          if (ver.status === 'ACTIVE') {
            return { ...ver, status: 'SUPERSEDED' as const };
          }
          return ver;
        });
        return {
          ...rule,
          status: 'ACTIVE',
          activeVersion: rule.activeVersion + 1,
          versions: updatedVersions,
        };
      })
    );
  };

  const handleRejectPendingRule = (ruleId: string, versionId: string) => {
    setRuleRegistry((prev) =>
      prev.map((rule) => {
        if (rule.ruleId !== ruleId) return rule;
        return {
          ...rule,
          versions: rule.versions.map((ver) =>
            ver.versionId === versionId ? { ...ver, status: 'REJECTED' as const } : ver
          ),
        };
      })
    );
  };

  const tabs = [
    { id: 'search', label: 'Semantic RAG Search', icon: <Search className="h-3.5 w-3.5" /> },
    { id: 'graph', label: 'Regulatory Knowledge Graph', icon: <GitBranch className="h-3.5 w-3.5" /> },
    { id: 'versioning', label: 'Rule Versioning & Approvals', icon: <Layers className="h-3.5 w-3.5" /> },
    { id: 'sources', label: 'Govt Regulatory Portals', icon: <Building2 className="h-3.5 w-3.5" /> },
  ];

  const pendingRulesCount = ruleRegistry.reduce(
    (count, rule) => count + rule.versions.filter((v) => v.status === 'PENDING_APPROVAL').length,
    0
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200 w-fit">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Hybrid Vector + Knowledge Graph RAG Engine</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1.5">
            Regulatory Intelligence & Guideline Assistant
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Search official Indian gazette notifications, statutory clauses, effective date mandates, and pending rule amendments.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTriggerGazetteCrawler}
            isLoading={isCrawling}
            disabled={isCrawling}
            className="text-xs gap-1.5 border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isCrawling ? 'animate-spin' : ''}`} />
            <span>{isCrawling ? 'Crawling Gazette Feeds...' : 'Crawl Gazette Feeds Now'}</span>
          </Button>

          <Badge variant="primary" size="lg" className="gap-1 font-mono text-xs">
            <ShieldCheck className="h-4 w-4" />
            <span>4 Official Authorities Indexed</span>
          </Badge>
        </div>
      </div>

      {/* Crawled Notification Alert Banner */}
      {crawledAlert && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl flex items-center justify-between text-xs font-mono animate-in fade-in">
          <div className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 text-blue-600 ${isCrawling ? 'animate-spin' : ''}`} />
            <span>{crawledAlert}</span>
          </div>
          <button
            onClick={() => setCrawledAlert(null)}
            className="text-blue-500 hover:text-blue-800 font-bold px-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Primary Navigation Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="segmented" />

      {/* ── TAB 1: RAG SEARCH ────────────────────────────────────────── */}
      {activeTab === 'search' && (
        <div className="space-y-5">
          {/* Search Box & Filters */}
          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardContent className="p-5 space-y-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ask any statutory question e.g. 'MRP tax inclusive format rule' or 'FSSAI logo 14 digit license mandate'..."
                  className="w-full bg-slate-800 text-white placeholder-slate-400 text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-700 shadow-inner"
                />
              </div>

              <div className="flex items-center justify-between flex-wrap gap-3">
                {/* Authority Pills */}
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="text-slate-400 font-medium flex items-center gap-1">
                    <Filter className="h-3 w-3" /> Authority:
                  </span>
                  {['all', 'Legal Metrology', 'FSSAI', 'BIS', 'CCPA'].map((auth) => (
                    <button
                      key={auth}
                      onClick={() => setSelectedAuthority(auth)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                        selectedAuthority === auth
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {auth === 'all' ? 'All Authorities' : auth}
                    </button>
                  ))}
                </div>

                <div className="text-[11px] font-mono text-slate-400">
                  Evaluation Date: <span className="text-blue-400 font-bold">2026-08-27 (Active Rules Only)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* RAG Telemetry Trace Bar */}
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 text-xs text-blue-900 font-mono">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-blue-600" />
              <span>
                RAG Pipeline: Hybrid Vector Search + Knowledge Graph Filtered ({searchResults.matchedChunks.length} chunks retrieved)
              </span>
            </div>
            <span className="font-bold">{searchResults.graphTrace.nodesTraversed} Graph Nodes Traversed</span>
          </div>

          {/* Search Results List */}
          <div className="space-y-4">
            {searchResults.matchedChunks.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center space-y-2">
                  <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-800">No Regulatory Chunks Matched</h3>
                  <p className="text-xs text-slate-500">
                    Try broadening your search term or selecting "All Authorities".
                  </p>
                </CardContent>
              </Card>
            ) : (
              searchResults.matchedChunks.map((chunk) => (
                <Card key={chunk.chunkId} className="border-slate-200 hover:border-blue-300 transition-all shadow-xs">
                  <CardContent className="p-5 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="primary" size="sm" className="font-mono">
                            {chunk.authority}
                          </Badge>
                          <span className="text-xs font-mono text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {chunk.ruleCode}
                          </span>
                          <Badge variant="success" size="sm">
                            {chunk.status}
                          </Badge>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 tracking-tight mt-1.5">
                          {chunk.section}
                        </h3>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{chunk.title}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <Badge
                          variant={chunk.relevanceScore >= 0.7 ? 'success' : 'warning'}
                          size="sm"
                          className="font-mono font-bold"
                        >
                          {Math.round(chunk.relevanceScore * 100)}% Relevance
                        </Badge>
                        <p className="text-[10px] text-slate-400 font-mono mt-1">{chunk.matchReason}</p>
                      </div>
                    </div>

                    {/* Summary Explanation */}
                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                      {chunk.content}
                    </p>

                    {/* Verbatim Gazette Clause */}
                    <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg text-xs text-amber-950 font-serif italic space-y-1">
                      <div className="text-[10px] font-sans font-bold text-amber-800 not-italic uppercase tracking-wider">
                        Verbatim Gazette Statutory Clause:
                      </div>
                      <p>"{chunk.verbatimClause}"</p>
                    </div>

                    {/* Provenance & Penalty Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex-wrap gap-2">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 font-mono">
                          <FileText className="h-3.5 w-3.5 text-slate-400" />
                          Gazette: {chunk.officialGazetteRef}
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          Effective: {chunk.effectiveDate}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-rose-600 font-bold">
                          Penalty: {formatCurrency(chunk.penalties.minFine)} - {formatCurrency(chunk.penalties.maxFine)}
                        </span>
                        <a
                          href={chunk.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          <span>Official Gazette PDF</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: KNOWLEDGE GRAPH ───────────────────────────────────── */}
      {activeTab === 'graph' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                <GitBranch className="h-4 w-4 text-blue-600" />
                <span>Regulatory Knowledge Graph Topology</span>
              </CardTitle>
              <CardDescription>
                Relationships between Authorities, Statutory Documents, Sections, Active Rules, Versions, and Product Categories.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-6">
              {/* Nodes Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="text-xs font-bold text-slate-600 uppercase">Authorities (4)</div>
                  <div className="space-y-1">
                    {KNOWLEDGE_GRAPH_NODES.filter((n) => n.type === 'authority').map((n) => (
                      <div key={n.id} className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100 flex justify-between">
                        <span>{n.label}</span>
                        <span className="font-mono text-[10px] text-slate-400">ISSUES →</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="text-xs font-bold text-slate-600 uppercase">Active Rules (4)</div>
                  <div className="space-y-1">
                    {KNOWLEDGE_GRAPH_NODES.filter((n) => n.type === 'rule').map((n) => (
                      <div key={n.id} className="text-xs font-semibold text-slate-800 bg-white px-2 py-1 rounded border border-slate-200 flex justify-between">
                        <span>{n.label}</span>
                        <span className="font-mono text-[10px] text-emerald-600">ACTIVE</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="text-xs font-bold text-slate-600 uppercase">Product Categories (3)</div>
                  <div className="space-y-1">
                    {KNOWLEDGE_GRAPH_NODES.filter((n) => n.type === 'category').map((n) => (
                      <div key={n.id} className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-1 rounded border border-purple-100 flex justify-between">
                        <span>{n.label}</span>
                        <span className="font-mono text-[10px] text-purple-500">APPLIES_TO</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Edge Relationships Diagram */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-900 text-white space-y-3 font-mono text-xs">
                <div className="text-slate-400 text-[11px] uppercase font-sans font-bold">
                  Active Knowledge Graph Edge Traversals ({KNOWLEDGE_GRAPH_EDGES.length})
                </div>
                <div className="divide-y divide-slate-800 max-h-64 overflow-y-auto space-y-2 pt-1">
                  {KNOWLEDGE_GRAPH_EDGES.map((edge, idx) => (
                    <div key={idx} className="pt-2 flex items-center justify-between text-slate-300">
                      <span className="text-blue-400">{edge.source}</span>
                      <span className="text-emerald-400 text-[10px] bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        ── {edge.relationship} ──►
                      </span>
                      <span className="text-purple-300">{edge.target}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── TAB 3: RULE VERSIONING & APPROVALS ──────────────────────── */}
      {activeTab === 'versioning' && (
        <div className="space-y-5">
          {pendingRulesCount > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider">Human Review Action Required</h4>
                  <p className="text-xs text-amber-800">
                    {pendingRulesCount} proposed rule version(s) pending human officer review. Unapproved rules will NOT reach the Compliance Engine.
                  </p>
                </div>
              </div>
              <Badge variant="warning" size="sm" className="font-mono">
                {pendingRulesCount} Pending Approval
              </Badge>
            </div>
          )}

          <div className="space-y-4">
            {ruleRegistry.map((rule) => (
              <Card key={rule.ruleId} className="border-slate-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-blue-700 font-bold text-xs bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {rule.code}
                        </span>
                        <Badge variant="primary" size="sm">
                          {rule.authority}
                        </Badge>
                        <Badge variant={rule.status === 'ACTIVE' ? 'success' : 'warning'} size="sm">
                          {rule.status}
                        </Badge>
                      </div>
                      <CardTitle className="mt-1.5">{rule.title}</CardTitle>
                    </div>

                    <span className="text-xs font-mono text-slate-500">
                      Active Version: <span className="font-bold text-slate-900">v{rule.activeVersion}</span>
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-4">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Rule Version History & Human Approvals Timeline
                  </div>

                  <div className="space-y-3">
                    {rule.versions.map((ver) => (
                      <div
                        key={ver.versionId}
                        className={`p-4 rounded-xl border transition-all ${
                          ver.status === 'ACTIVE'
                            ? 'border-emerald-300 bg-emerald-50/30'
                            : ver.status === 'PENDING_APPROVAL'
                            ? 'border-amber-300 bg-amber-50/30'
                            : 'border-slate-200 bg-slate-50 opacity-75'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-slate-900 text-xs">
                                Version {ver.versionNumber}.0
                              </span>
                              <Badge
                                variant={
                                  ver.status === 'ACTIVE'
                                    ? 'success'
                                    : ver.status === 'PENDING_APPROVAL'
                                    ? 'warning'
                                    : 'neutral'
                                }
                                size="sm"
                              >
                                {ver.status}
                              </Badge>
                              <span className="text-[11px] font-mono text-slate-500">
                                Effective From: {ver.effectiveFrom}
                              </span>
                            </div>
                            <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">{ver.changeSummary}</p>
                            <div className="text-[10px] font-mono text-slate-500 mt-1">
                              Proposed By: {ver.proposedBy}{' '}
                              {ver.approvedBy && `• Approved By: ${ver.approvedBy} (${ver.approvedAt})`}
                            </div>
                          </div>

                          {/* Approval Actions */}
                          {ver.status === 'PENDING_APPROVAL' && (
                            <div className="flex items-center gap-2 shrink-0">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRejectPendingRule(rule.ruleId, ver.versionId)}
                                className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50 h-8 gap-1"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                <span>Reject</span>
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleApprovePendingRule(rule.ruleId, ver.versionId)}
                                className="text-xs bg-emerald-600 hover:bg-emerald-700 h-8 gap-1"
                              >
                                <ThumbsUp className="h-3.5 w-3.5" />
                                <span>Approve & Promote to Active</span>
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 4: OFFICIAL GOVT SOURCES ────────────────────────────── */}
      {activeTab === 'sources' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {OFFICIAL_REGULATORY_SOURCES.map((src) => (
            <Card key={src.id} className="border-slate-200 hover:border-slate-300 transition-all">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="primary" size="sm" className="font-mono">
                    {src.authority}
                  </Badge>
                  <span className="text-xs font-mono text-slate-500">{src.jurisdiction}</span>
                </div>
                <CardTitle className="mt-1.5">{src.name}</CardTitle>
                <CardDescription>{src.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-3 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1 font-mono text-[11px]">
                  <div className="text-slate-500">Gazette Ref: {src.gazetteRef}</div>
                  <div className="text-slate-500">Document Types: {src.documentTypes.join(', ')}</div>
                </div>

                <a
                  href={src.baseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-bold"
                >
                  <span>Visit Official Government Portal</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
