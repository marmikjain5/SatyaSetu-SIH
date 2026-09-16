import React from 'react';
import {
  FileText,
  Calendar,
  Building2,
  Hash,
  Tag,
  ChevronDown,
  Scale,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useLegalReviewStore } from '../../store/legalReviewStore';

const statusVariant: Record<string, 'neutral' | 'primary' | 'warning' | 'danger' | 'success'> = {
  pending: 'neutral',
  analyzing: 'primary',
  reviewed: 'success',
  flagged: 'danger',
  cleared: 'success',
};

export const DocumentPanel: React.FC = () => {
  const {
    documents,
    selectedDocument,
    analysisResult,
    selectDocument,
  } = useLegalReviewStore();

  // Check if the selected document is an external (hygiene-generated) one
  const isExternalDocument = selectedDocument
    ? !documents.some((d) => d.id === selectedDocument.id)
    : false;

  // Collect evidence strings for highlighting
  const evidenceTexts = analysisResult?.findings.map((f) => {
    // Strip leading/trailing quotes for matching
    return f.evidence.replace(/^[""]|[""]$/g, '');
  }) || [];

  /**
   * Highlight matched evidence within the document content.
   * Returns an array of React nodes with <mark> wrappers.
   */
  const renderHighlightedContent = (content: string) => {
    if (evidenceTexts.length === 0) {
      return <span className="whitespace-pre-wrap">{content}</span>;
    }

    // Build a regex from evidence texts (escaped)
    const escaped = evidenceTexts.map((t) =>
      t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );
    const pattern = new RegExp(`(${escaped.join('|')})`, 'gi');
    const parts = content.split(pattern);

    return (
      <span className="whitespace-pre-wrap">
        {parts.map((part, idx) => {
          const isEvidence = evidenceTexts.some(
            (e) => e.toLowerCase() === part.toLowerCase()
          );
          return isEvidence ? (
            <mark
              key={idx}
              className="bg-red-100 text-red-900 px-0.5 rounded border border-red-200 font-medium"
            >
              {part}
            </mark>
          ) : (
            <React.Fragment key={idx}>{part}</React.Fragment>
          );
        })}
      </span>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <FileText className="h-4 w-4 text-blue-600" />
          Document Review
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hygiene Source Banner (when viewing an external document) */}
        {isExternalDocument && selectedDocument && (
          <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center gap-2">
            <Scale className="h-4 w-4 text-indigo-500 shrink-0" />
            <p className="text-[11px] text-indigo-700 leading-tight">
              <span className="font-semibold">Source: Factory Hygiene Monitoring</span> — This document was generated from a hygiene violation record for AI legal review.
            </p>
          </div>
        )}

        {/* Document Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Select Document
          </label>
          <div className="relative">
            <select
              value={selectedDocument?.id || ''}
              onChange={(e) => selectDocument(e.target.value)}
              className="w-full appearance-none bg-white border border-slate-200 rounded-lg px-3 py-2.5 pr-10 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors cursor-pointer"
            >
              <option value="" disabled>
                — Choose a sample document —
              </option>
              {documents.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.title}
                </option>
              ))}
              {isExternalDocument && selectedDocument && (
                <option key={selectedDocument.id} value={selectedDocument.id}>
                  ⚖ {selectedDocument.title} (from Hygiene)
                </option>
              )}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Document Metadata */}
        {selectedDocument && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Tag className="h-3.5 w-3.5 text-slate-400" />
                <span className="font-medium">Type:</span>
                <span className="text-slate-800">{selectedDocument.documentType}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Hash className="h-3.5 w-3.5 text-slate-400" />
                <span className="font-medium">Ref:</span>
                <span className="text-slate-800 font-mono text-[11px]">{selectedDocument.referenceNumber}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Building2 className="h-3.5 w-3.5 text-slate-400" />
                <span className="font-medium">Issuer:</span>
                <span className="text-slate-800">{selectedDocument.issuer}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span className="font-medium">Date:</span>
                <span className="text-slate-800">{selectedDocument.date}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Status:</span>
              <Badge
                variant={statusVariant[selectedDocument.status] || 'neutral'}
                size="sm"
              >
                {selectedDocument.status.charAt(0).toUpperCase() + selectedDocument.status.slice(1)}
              </Badge>
            </div>

            {/* Document Summary */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-xs text-slate-600 leading-relaxed">{selectedDocument.summary}</p>
            </div>

            {/* Document Content */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Document Content
                </span>
                {analysisResult && (
                  <span className="text-[10px] text-red-500 font-medium">
                    ● Evidence highlighted in red
                  </span>
                )}
              </div>
              <div className="max-h-[400px] overflow-y-auto border border-slate-200 rounded-lg bg-white p-4 text-xs text-slate-700 leading-relaxed font-mono scrollbar-thin">
                {renderHighlightedContent(selectedDocument.content)}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!selectedDocument && (
          <div className="py-12 text-center">
            <FileText className="h-10 w-10 mx-auto text-slate-300 mb-3" />
            <p className="text-sm text-slate-400 font-medium">
              Select a sample document to begin review
            </p>
            <p className="text-xs text-slate-400 mt-1">
              3 prototype documents available for analysis
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
