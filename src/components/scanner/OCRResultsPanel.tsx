import React, { useState } from 'react';
import {
  FileText,
  Grid3X3,
  Copy,
  Check,
  AlertTriangle,
  Pencil,
  X,
  Layers,
  ShieldCheck,
  ShieldAlert,
  Code,
  Download,
  Eye,
  Info,
  CheckCircle2,
  AlertCircle,
  Scan,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Tabs } from '../ui/Tabs';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useScanStore } from '../../store/scanStore';
import type {
  ExtractedProductData,
  DeclarationField,
  DeclarationFieldKey,
  ValidationStatus,
} from '../../types/scan';
import { cn } from '../../lib/utils';

// ─── Status Badges ──────────────────────────────────────────────

const StatusBadge: React.FC<{ status: ValidationStatus }> = ({ status }) => {
  switch (status) {
    case 'compliant':
      return (
        <Badge variant="success" size="sm" className="gap-1 text-[10px]">
          <CheckCircle2 className="h-3 w-3" />
          <span>Compliant</span>
        </Badge>
      );
    case 'warning':
      return (
        <Badge variant="warning" size="sm" className="gap-1 text-[10px]">
          <AlertTriangle className="h-3 w-3" />
          <span>Warning</span>
        </Badge>
      );
    case 'non-compliant':
      return (
        <Badge variant="danger" size="sm" className="gap-1 text-[10px]">
          <AlertCircle className="h-3 w-3" />
          <span>Violation</span>
        </Badge>
      );
    case 'missing':
    default:
      return (
        <Badge variant="danger" size="sm" className="gap-1 text-[10px]">
          <AlertCircle className="h-3 w-3" />
          <span>Missing</span>
        </Badge>
      );
  }
};

// ─── Enhanced Statutory Declaration Card ────────────────────────

interface DeclarationCardProps {
  field: DeclarationField;
  onEdit: (key: DeclarationFieldKey, value: string) => void;
  onHighlight: (key: DeclarationFieldKey | null) => void;
  isHighlighted: boolean;
}

const DeclarationCard: React.FC<DeclarationCardProps> = ({
  field,
  onEdit,
  onHighlight,
  isHighlighted,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(field.value);
  const hasValue = field.value && field.value.trim().length > 0;

  const handleSave = () => {
    onEdit(field.key, editValue.trim());
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(field.value);
    setIsEditing(false);
  };

  return (
    <div
      onMouseEnter={() => onHighlight(field.key)}
      onMouseLeave={() => onHighlight(null)}
      className={cn(
        'rounded-xl border bg-white p-4 transition-all duration-200 group flex flex-col justify-between',
        isHighlighted
          ? 'ring-2 ring-blue-500 border-blue-500 shadow-md bg-blue-50/20'
          : hasValue
          ? 'border-slate-200 hover:border-slate-300 shadow-xs'
          : 'border-amber-200 bg-amber-50/20'
      )}
    >
      <div>
        {/* Header: Field Label + Statutory Rule Code */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-900">{field.label}</span>
              {field.isMandatory && (
                <span className="text-[9px] font-semibold text-rose-600 bg-rose-50 px-1 py-0.2 rounded border border-rose-200">
                  Mandatory
                </span>
              )}
            </div>
            <p className="text-[10px] font-mono text-slate-500 mt-0.5">{field.ruleCode}</p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <StatusBadge status={field.validationStatus} />
            {hasValue && (
              <Badge
                variant={field.confidence >= 80 ? 'success' : field.confidence >= 50 ? 'warning' : 'danger'}
                size="sm"
                className="text-[9px] px-1.5 py-0 font-mono"
              >
                {field.confidence}%
              </Badge>
            )}
          </div>
        </div>

        {/* Value Display or Edit Input */}
        {isEditing ? (
          <div className="space-y-2 mt-2">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full text-xs font-semibold text-slate-900 border border-blue-400 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-blue-50/30"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') handleCancel();
              }}
            />
            <div className="flex items-center gap-1.5 justify-end">
              <Button variant="outline" size="sm" onClick={handleCancel} className="h-6 text-[11px] px-2">
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSave} className="h-6 text-[11px] px-2 gap-1 bg-emerald-600 hover:bg-emerald-700">
                <Check className="h-3 w-3" />
                <span>Save</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-1">
            <div className="flex items-center justify-between gap-2">
              <p
                className={cn(
                  'text-sm font-semibold tracking-tight leading-snug break-words',
                  hasValue ? 'text-slate-900' : 'text-amber-700 italic text-xs flex items-center gap-1'
                )}
              >
                {hasValue ? (
                  field.value
                ) : (
                  <>
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                    <span>Declaration Missing / Undetected</span>
                  </>
                )}
              </p>

              <button
                onClick={() => {
                  setEditValue(field.value);
                  setIsEditing(true);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                title="Edit statutory value"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Validation Message */}
            <p className="text-[11px] text-slate-600 mt-1.5 line-clamp-2">
              {field.validationMessage}
            </p>
          </div>
        )}
      </div>

      {/* Footer: OCR Snippet & Bounding Box Indicator */}
      {hasValue && (
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
          <span className="truncate max-w-[200px]" title={field.sourceText}>
            Snippet: "{field.sourceText}"
          </span>
          <span className="font-mono shrink-0">
            {field.sourcePass.replace(/_/g, ' ')}
          </span>
        </div>
      )}
    </div>
  );
};

// ─── Visual Evidence & Bounding Box Inspector ───────────────────

interface EvidenceInspectorProps {
  imageUrl: string;
  declarations: Record<DeclarationFieldKey, DeclarationField>;
  highlightedKey: DeclarationFieldKey | null;
  onHighlight: (key: DeclarationFieldKey | null) => void;
}

const EvidenceInspector: React.FC<EvidenceInspectorProps> = ({
  imageUrl,
  declarations,
  highlightedKey,
  onHighlight,
}) => {
  const fields = Object.values(declarations).filter(
    (d) => d.boundingBox && d.value && d.value.trim().length > 0
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-blue-600" />
          <span>
            Hover over declaration cards or bounding boxes below to cross-verify physical label evidence coordinates.
          </span>
        </div>
        <Badge variant="primary" size="sm">
          {fields.length} Bounding Boxes Mapped
        </Badge>
      </div>

      <div className="relative rounded-xl border border-slate-300 bg-slate-950/5 overflow-hidden flex justify-center items-center p-4">
        <div className="relative inline-block max-w-full">
          <img
            src={imageUrl}
            alt="Product Packaging Label Evidence"
            className="max-h-[500px] w-auto rounded-lg shadow-md object-contain"
          />

          {/* Bounding Box Overlays */}
          {fields.map((field) => {
            const bbox = field.boundingBox?.normalized;
            if (!bbox) return null;
            const isHighlighted = highlightedKey === field.key;

            return (
              <div
                key={field.key}
                onMouseEnter={() => onHighlight(field.key)}
                onMouseLeave={() => onHighlight(null)}
                className={cn(
                  'absolute border-2 rounded transition-all duration-150 cursor-pointer flex items-start',
                  isHighlighted
                    ? 'border-blue-500 bg-blue-500/25 ring-4 ring-blue-500/30 z-20 scale-[1.01]'
                    : field.validationStatus === 'compliant'
                    ? 'border-emerald-500/80 bg-emerald-500/10 hover:border-emerald-500 hover:bg-emerald-500/20'
                    : field.validationStatus === 'warning'
                    ? 'border-amber-500/80 bg-amber-500/10 hover:border-amber-500 hover:bg-amber-500/20'
                    : 'border-red-500/80 bg-red-500/10 hover:border-red-500 hover:bg-red-500/20'
                )}
                style={{
                  left: `${bbox.x}%`,
                  top: `${bbox.y}%`,
                  width: `${Math.max(3, bbox.width)}%`,
                  height: `${Math.max(2, bbox.height)}%`,
                }}
              >
                <div
                  className={cn(
                    'text-[9px] font-mono font-bold px-1 py-0.5 rounded shadow-xs truncate max-w-[120px] -mt-5 -ml-0.5 pointer-events-none',
                    isHighlighted
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900/90 text-white'
                  )}
                >
                  {field.label}: {field.value}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────

export const OCRResultsPanel: React.FC = () => {
  const { currentScan } = useScanStore();
  const [activeTab, setActiveTab] = useState('declarations');
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [highlightedKey, setHighlightedKey] = useState<DeclarationFieldKey | null>(null);
  const [localOverrides, setLocalOverrides] = useState<Partial<Record<DeclarationFieldKey, string>>>({});

  if (!currentScan || currentScan.status !== 'completed' || !currentScan.extractedData) {
    return null;
  }

  const data: ExtractedProductData = currentScan.extractedData;
  const declarations = { ...data.declarations };

  // Apply local edits
  Object.entries(localOverrides).forEach(([k, v]) => {
    const key = k as DeclarationFieldKey;
    if (declarations[key]) {
      declarations[key] = {
        ...declarations[key],
        value: v,
        validationStatus: v.trim().length > 0 ? 'compliant' : 'missing',
        validationMessage: 'Manually corrected by compliance officer.',
      };
    }
  });

  const allDeclarationsList = Object.values(declarations);
  const compliantCount = allDeclarationsList.filter((d) => d.validationStatus === 'compliant').length;
  const warningCount = allDeclarationsList.filter((d) => d.validationStatus === 'warning').length;
  const missingCount = allDeclarationsList.filter((d) => d.validationStatus === 'missing').length;
  const violationCount = allDeclarationsList.filter((d) => d.validationStatus === 'non-compliant').length;

  const handleEdit = (key: DeclarationFieldKey, value: string) => {
    setLocalOverrides((prev) => ({ ...prev, [key]: value }));
  };

  const handleCopyPayload = async () => {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(data.compliancePayload, null, 2)
      );
      setCopiedPayload(true);
      setTimeout(() => setCopiedPayload(false), 2000);
    } catch {
      // Clipboard unavailable
    }
  };

  const handleDownloadPayload = () => {
    const jsonStr = JSON.stringify(data.compliancePayload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance_extraction_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'declarations', label: 'Statutory Declarations', icon: <Grid3X3 className="h-3.5 w-3.5" /> },
    { id: 'evidence', label: 'Visual Evidence & BBoxes', icon: <Scan className="h-3.5 w-3.5" /> },
    { id: 'rule_engine', label: 'Rule Engine Payload (JSON)', icon: <Code className="h-3.5 w-3.5" /> },
    { id: 'passes', label: 'OCR Telemetry', icon: <Layers className="h-3.5 w-3.5" /> },
    { id: 'raw', label: 'Raw OCR Text', icon: <FileText className="h-3.5 w-3.5" /> },
  ];

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            <span>Legal Metrology Statutory Declarations</span>
          </CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">
            Packaged Commodities Rules (2011) declaration evidence and statutory rule validation.
          </p>
        </div>

        {/* Compliance Summary Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="success" size="sm">
            {compliantCount} Compliant
          </Badge>
          {warningCount > 0 && (
            <Badge variant="warning" size="sm">
              {warningCount} Warnings
            </Badge>
          )}
          {violationCount > 0 && (
            <Badge variant="danger" size="sm">
              {violationCount} Violations
            </Badge>
          )}
          {missingCount > 0 && (
            <Badge variant="danger" size="sm">
              {missingCount} Missing
            </Badge>
          )}
          <Badge
            variant={data.confidence >= 80 ? 'success' : data.confidence >= 50 ? 'warning' : 'danger'}
            size="sm"
            className="font-mono font-bold"
          >
            {data.confidence}% Score
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-5">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="segmented"
        />

        {/* Tab 1: Statutory Declarations Grid */}
        {activeTab === 'declarations' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {allDeclarationsList.map((field) => (
                <DeclarationCard
                  key={field.key}
                  field={field}
                  onEdit={handleEdit}
                  onHighlight={setHighlightedKey}
                  isHighlighted={highlightedKey === field.key}
                />
              ))}
            </div>

            {Object.keys(localOverrides).length > 0 && (
              <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                <Pencil className="h-3 w-3" />
                <span>
                  {Object.keys(localOverrides).length} declaration field(s) manually corrected.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Visual Evidence & Bounding Box Inspector */}
        {activeTab === 'evidence' && (
          <EvidenceInspector
            imageUrl={currentScan.imageDataUrl}
            declarations={declarations}
            highlightedKey={highlightedKey}
            onHighlight={setHighlightedKey}
          />
        )}

        {/* Tab 3: Rule Engine Compliance Payload (JSON) */}
        {activeTab === 'rule_engine' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs">
              <span className="text-slate-600 font-medium">
                Structured Legal Metrology evidence payload prepared for Rule Validation Engine & Notice Dispatch.
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPayload}
                  className="text-xs gap-1.5 h-8"
                >
                  <Download className="h-3.5 w-3.5 text-slate-600" />
                  <span>Download JSON</span>
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleCopyPayload}
                  className="text-xs gap-1.5 h-8"
                >
                  {copiedPayload ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-300" />
                      <span>Copied Payload</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-900 p-4 max-h-96 overflow-y-auto">
              <pre className="text-xs text-emerald-400 font-mono whitespace-pre-wrap leading-relaxed">
                {JSON.stringify(data.compliancePayload, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 4: Multi-Pass OCR Telemetry */}
        {activeTab === 'passes' && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-700">
              Multi-Pass Optical Preprocessing Variant Telemetry
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.ocrPassResults.map((pass) => (
                <div
                  key={pass.name}
                  className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 capitalize">
                      {pass.name.replace(/_/g, ' ')}
                    </span>
                    <Badge
                      variant={pass.confidence >= 80 ? 'success' : pass.confidence >= 50 ? 'warning' : 'danger'}
                      size="sm"
                      className="font-mono font-bold"
                    >
                      {pass.confidence}%
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500">{pass.description}</p>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Text Length: {pass.textLength} characters
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Raw OCR Text */}
        {activeTab === 'raw' && (
          <div className="space-y-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 max-h-80 overflow-y-auto">
              <pre className="text-xs text-slate-800 font-mono whitespace-pre-wrap leading-relaxed">
                {data.rawText || 'No text extracted.'}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
