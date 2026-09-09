import React, { useState } from 'react';
import { UploadCloud, Loader2, AlertTriangle, ShieldAlert, CheckCircle2, PlusCircle, Sparkles, CheckSquare, AlertCircle } from 'lucide-react';
import { useHygieneStore } from '../../store/hygieneStore';
import { HygieneViolation } from '../../types/hygiene';
import { visualInspectionService, DeterministicInspectionResult } from '../../services/visualInspectionService';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';

export const FactoryImageInspection: React.FC = () => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<string>('');
  const [result, setResult] = useState<DeterministicInspectionResult | null>(null);
  const [createdViolations, setCreatedViolations] = useState<Record<string, HygieneViolation>>({});

  const { factories, addViolation } = useHygieneStore();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
      setResult(null);
      setCreatedViolations({});
    }
  };

  const handleAnalyze = async () => {
    if (!imageUrl) return;
    setIsAnalyzing(true);
    setAnalysisStatus('Preprocessing factory image...');

    await new Promise((r) => setTimeout(r, 600));
    setAnalysisStatus('Running AI Vision inspection...');

    // Run deterministic inspection service
    const inspectionResult = await visualInspectionService.inspectFactoryImage(imageFile, imageUrl);

    setAnalysisStatus('Generating hygiene assessment findings...');
    await new Promise((r) => setTimeout(r, 600));

    setResult(inspectionResult);
    setIsAnalyzing(false);
    setAnalysisStatus('');
  };

  const handleCreateViolation = (finding: DeterministicInspectionResult['finding']) => {
    if (!result?.isSupported) return;

    // Select first factory and zone as default for prototype
    const factory = factories[0];
    const zone = factory.zones[0];

    const violation: HygieneViolation = {
      id: `violation-${Date.now()}-${finding.id}`,
      factoryId: factory.id,
      zoneId: zone.id,
      zoneName: zone.name,
      parameter: finding.category,
      title: finding.title,
      description: finding.description,
      severity: finding.severity,
      actualValue: 'Detected visually by AI',
      threshold: '0 tolerance',
      recommendation: finding.recommendation,
      status: 'open',
      detectedAt: new Date().toISOString().split('T')[0],
      evidence: {
        id: `ev-${Date.now()}`,
        type: 'photograph',
        title: 'AI Visual Inspection Image',
        description: `Visual evidence for ${finding.category}`,
        imageRef: imageUrl || 'local-upload',
        capturedAt: new Date().toISOString(),
      },
    };

    addViolation(violation);
    setCreatedViolations((prev) => ({ ...prev, [finding.id]: violation }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            AI Visual Inspection
          </CardTitle>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Upload an image of the factory floor to run prototype AI vision analysis for hygiene violations.
          </p>
        </CardHeader>
        <CardContent>
          {!imageUrl ? (
            <div
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-12 text-center hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud className="h-10 w-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                Upload Factory Image
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                PNG, JPG or WEBP (max 10MB)
              </p>
              <Button
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Browse Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleImageUpload}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 max-h-[400px] flex items-center justify-center">
                <img src={imageUrl} alt="Uploaded factory" className="max-h-[400px] object-contain" />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                    Replace
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setImageFile(null);
                      setImageUrl(null);
                      setResult(null);
                      setCreatedViolations({});
                    }}
                  >
                    Clear
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>

              {!result && (
                <div className="flex justify-center pt-2">
                  <Button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full sm:w-auto min-w-[200px]">
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {analysisStatus}
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Analyze Image
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unsupported Image State */}
      {result && !result.isSupported && (
        <Card className="border-amber-200 dark:border-amber-800/60 bg-amber-50/40 dark:bg-amber-950/20">
          <CardContent className="p-6 text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {result.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-md mx-auto">
                {result.unsupportedMessage || 'Current prototype supports three predefined factory inspection scenarios.'}
              </p>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 max-w-lg mx-auto text-left space-y-1">
              <div className="font-semibold text-slate-700 dark:text-slate-300">Supported Prototype Reference Files:</div>
              <div>• factory-reference-01.jpg (Elevated Work & PPE Safety Risk)</div>
              <div>• factory-reference-02.jpg (Standing Water & Poor Housekeeping)</div>
              <div>• factory-reference-03.jpg (Material Handling, PPE & Housekeeping Risk)</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Supported Image Results */}
      {result && result.isSupported && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Risk Gauge & Evidence */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    AI Risk Assessment
                  </CardTitle>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {result.evidenceLabel}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-6">
                <div className="relative flex items-center justify-center h-40 w-40 mb-4">
                  <svg className="absolute inset-0 h-full w-full transform -rotate-90">
                    <circle cx="80" cy="80" r="70" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="12" fill="none" />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      className={cn(
                        'transition-all duration-1000 ease-out',
                        result.riskLevel === 'High Risk'
                          ? 'stroke-red-500'
                          : result.riskLevel === 'Medium Risk'
                            ? 'stroke-amber-500'
                            : 'stroke-emerald-500'
                      )}
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray="439.8"
                      strokeDashoffset={439.8 - (439.8 * result.riskScore) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="text-center">
                    <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{result.riskScore}</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400 block">/ 100</span>
                  </div>
                </div>

                <Badge
                  variant={
                    result.riskLevel === 'High Risk'
                      ? 'danger'
                      : result.riskLevel === 'Medium Risk'
                        ? 'warning'
                        : 'success'
                  }
                  size="lg"
                  className="px-4 py-1.5 text-sm font-bold"
                >
                  {result.riskLevel}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Detected Condition & Inspection Breakdown */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                      AI Visual Inspection
                    </span>
                    <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                      Detected Condition
                    </CardTitle>
                  </div>
                  <Badge
                    variant={
                      result.severity === 'critical'
                        ? 'danger'
                        : result.severity === 'high'
                          ? 'warning'
                          : 'primary'
                    }
                    size="md"
                    className="uppercase font-bold tracking-wider"
                  >
                    Severity: {result.severity}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                {/* Title & Description */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldAlert
                      className={cn(
                        'h-5 w-5 shrink-0',
                        result.severity === 'critical'
                          ? 'text-red-600'
                          : result.severity === 'high'
                            ? 'text-orange-500'
                            : 'text-blue-500'
                      )}
                    />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {result.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-7">
                    {result.description}
                  </p>
                </div>

                {/* Observations List */}
                {result.observations && result.observations.length > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block flex items-center gap-1.5">
                      <CheckSquare className="h-3.5 w-3.5 text-blue-500" />
                      Observations:
                    </span>
                    <ul className="space-y-1.5 pl-1">
                      {result.observations.map((obs, idx) => (
                        <li key={idx} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                          <span className="text-blue-500 font-bold">•</span>
                          <span>{obs}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Risk Section */}
                <div className="bg-amber-50/60 dark:bg-amber-950/30 p-3.5 rounded-xl border border-amber-200 dark:border-amber-800/50">
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Risk
                  </span>
                  <p className="text-xs text-amber-900 dark:text-amber-200 font-medium">
                    {result.risk}
                  </p>
                </div>

                {/* Recommendation Section */}
                <div className="bg-blue-50/60 dark:bg-blue-950/30 p-3.5 rounded-xl border border-blue-200 dark:border-blue-800/50">
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-1 block">
                    Recommendation
                  </span>
                  <p className="text-xs text-blue-900 dark:text-blue-200">
                    {result.recommendation}
                  </p>
                </div>

                {/* Action Row */}
                <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                  {createdViolations[result.finding.id] ? (
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Violation Logged to Official Ledger
                    </span>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => handleCreateViolation(result.finding)}
                    >
                      <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
                      Create Violation
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
