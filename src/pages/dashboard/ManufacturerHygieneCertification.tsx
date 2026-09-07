import React, { useState } from 'react';
import {
  Factory,
  Camera,
  UploadCloud,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  FileCheck2,
  ChevronRight,
  Award,
  RefreshCw,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useHygieneStore, ManufacturerAssessment } from '../../store/hygieneStore';
import { analyzeFactoryImage, VisualInspectionResult } from '../../lib/hygieneVisionService';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';

const SAMPLE_FACTORY_IMAGES = [
  {
    label: 'Clean Bottling Line',
    url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80',
    desc: 'Automated filling & sealing floor',
  },
  {
    label: 'Packaging Facility',
    url: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=800&auto=format&fit=crop&q=80',
    desc: 'Secondary sorting & packaging conveyor',
  },
  {
    label: 'Raw Materials Bay',
    url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=80',
    desc: 'Palletized grain & dry ingredient storage',
  },
];

export const ManufacturerHygieneCertification: React.FC = () => {
  const { user } = useAuthStore();
  const { manufacturerAssessments, addManufacturerAssessment } = useHygieneStore();

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState('');
  const [result, setResult] = useState<VisualInspectionResult | null>(null);
  const [isCertified, setIsCertified] = useState(false);

  const myAssessments = manufacturerAssessments.filter(
    (a) => !user?.id || a.manufacturerId === user?.id || user?.role === 'admin'
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
      setResult(null);
      setIsCertified(false);
    }
  };

  const handleSelectSampleImage = (url: string) => {
    setImageFile(null);
    setImageUrl(url);
    setResult(null);
    setIsCertified(false);
  };

  const handleAnalyze = async () => {
    if (!imageUrl) return;
    setIsAnalyzing(true);
    setAnalysisStatus('Preprocessing factory image...');
    await new Promise((r) => setTimeout(r, 600));
    setAnalysisStatus('Running AI Hygiene Vision Assessment...');
    const inspectionResult = await analyzeFactoryImage(imageUrl);
    setAnalysisStatus('Generating compliance report...');
    await new Promise((r) => setTimeout(r, 500));
    setResult(inspectionResult);
    setIsAnalyzing(false);
    setAnalysisStatus('');
  };

  const handleSubmitCertification = () => {
    if (!result || !user) return;

    const isPassing = result.riskScore <= 60;
    const assessment: ManufacturerAssessment = {
      id: `MFG-CERT-${Date.now()}`,
      manufacturerId: user.id,
      manufacturerName: user.name,
      imageUrl: result.imageUrl,
      riskScore: result.riskScore,
      riskLevel: result.riskLevel,
      findingsCount: result.findings.length,
      findings: result.findings,
      status: isPassing ? 'certified' : 'needs-remediation',
      submittedAt: new Date().toISOString(),
    };

    addManufacturerAssessment(assessment);
    setIsCertified(true);
  };

  const handleReset = () => {
    setImageFile(null);
    setImageUrl(null);
    setResult(null);
    setIsCertified(false);
  };

  const isPassing = result ? result.riskScore <= 60 : false;

  const certifiedCount = myAssessments.filter((a) => a.status === 'certified').length;
  const needsRemediationCount = myAssessments.filter((a) => a.status === 'needs-remediation').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 via-white to-purple-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 dark:border-indigo-800/60 p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5 shadow-xs">
        <div className="space-y-2 lg:max-w-[70%]">
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium tracking-wide text-indigo-700 bg-indigo-100 border border-indigo-300 dark:text-indigo-300 dark:bg-indigo-950/80 dark:border-indigo-700/80">
            <Factory className="h-3 w-3 mr-1.5" />
            Manufacturer Self-Certification • FSSAI Hygiene Compliance
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
            Factory Hygiene Self-Certification Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Upload factory floor images to run AI-powered hygiene assessment. Passing assessments generate a self-certification proof that can be submitted to regulators for compliance verification.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="secondary" size="sm" className="text-[10px] font-bold uppercase px-2 py-1">
            <ShieldCheck className="h-3 w-3 mr-1" />
            {user?.name || 'Manufacturer'}
          </Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-4 sm:p-5 flex flex-col justify-between shadow-xs">
          <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Total Assessments
          </span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono my-1.5">
            {myAssessments.length}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Factory Images Analyzed
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-4 sm:p-5 flex flex-col justify-between shadow-xs">
          <span className="text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
            Certified
          </span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono my-1.5">
            {certifiedCount}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Passed AI Hygiene Check
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-4 sm:p-5 flex flex-col justify-between shadow-xs">
          <span className="text-[11px] font-mono font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
            Needs Remediation
          </span>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono my-1.5">
            {needsRemediationCount}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            High Risk — Action Required
          </span>
        </div>
      </div>

      {/* Upload & Analysis Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>
              <Camera className="h-5 w-5 text-indigo-600" />
              AI Factory Hygiene Assessment
            </CardTitle>
            <Badge variant="primary" size="sm" dot>AI VISION</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Upload a clear photograph of your factory floor, production area, or storage zone. Our AI will analyze it for hygiene compliance.
          </p>
        </CardHeader>
        <CardContent>
          {!imageUrl ? (
            <div
              className="border-2 border-dashed border-indigo-300 dark:border-indigo-700 rounded-xl p-12 text-center hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud className="h-10 w-10 text-indigo-400 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                Upload Factory Image for Assessment
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                PNG, JPG or WEBP (max 10MB) — production floor, storage, or processing areas
              </p>
              <div className="flex justify-center gap-2 mt-4">
                <Button variant="outline" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                  Browse Files
                </Button>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-left">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2.5 uppercase tracking-wider">
                  Or test with sample factory photos:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {SAMPLE_FACTORY_IMAGES.map((sample, idx) => (
                    <div
                      key={idx}
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectSampleImage(sample.url);
                      }}
                      className="flex items-center gap-2.5 p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all text-left cursor-pointer group bg-white dark:bg-slate-900"
                    >
                      <img
                        src={sample.url}
                        alt={sample.label}
                        className="h-10 w-10 rounded object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                          {sample.label}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {sample.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
              <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 max-h-[400px] flex items-center justify-center">
                <img src={imageUrl} alt="Uploaded factory" className="max-h-[400px] object-contain" />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                    Replace
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleReset}>
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
                  <Button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full sm:w-auto min-w-[260px]">
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {analysisStatus}
                      </>
                    ) : (
                      <>
                        <Camera className="h-4 w-4 mr-2" />
                        Run AI Hygiene Assessment
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Risk Score Gauge */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  AI Risk Assessment
                </CardTitle>
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
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 text-center">
                  Based on AI visual analysis of {result.findings.length} detected condition(s).
                </p>

                {/* Certification Action */}
                {!isCertified && (
                  <div className="mt-5 w-full">
                    {isPassing ? (
                      <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
                        onClick={handleSubmitCertification}
                      >
                        <Award className="h-4 w-4 mr-2" />
                        Submit Self-Certification
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={handleSubmitCertification}
                      >
                        <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                        Log Assessment (Needs Remediation)
                      </Button>
                    )}
                  </div>
                )}

                {isCertified && isPassing && (
                  <div className="mt-5 w-full rounded-lg border-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 p-4 text-center">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                    <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                      Self-Certification Submitted
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                      Pending Regulator Verification
                    </div>
                  </div>
                )}

                {isCertified && !isPassing && (
                  <div className="mt-5 w-full rounded-lg border-2 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 p-4 text-center">
                    <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                    <div className="text-sm font-bold text-amber-700 dark:text-amber-300">
                      Assessment Logged
                    </div>
                    <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono mt-1">
                      Remediation required before certification
                    </div>
                  </div>
                )}

                {isCertified && (
                  <Button variant="outline" size="sm" className="mt-3 text-xs" onClick={handleReset}>
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                    Upload New Image
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Findings List */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Hygiene Findings</CardTitle>
                  <Badge variant="neutral">{result.findings.length} issues detected</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {result.findings.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400 flex flex-col items-center gap-2">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                    <span>No hygiene issues detected — your factory floor looks clean!</span>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {result.findings.map((finding) => (
                      <div key={finding.id} className="p-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <ShieldAlert
                                className={cn(
                                  'h-4 w-4',
                                  finding.severity === 'critical'
                                    ? 'text-red-600'
                                    : finding.severity === 'high'
                                    ? 'text-orange-500'
                                    : 'text-blue-500'
                                )}
                              />
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                {finding.title}
                              </h4>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400">{finding.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                finding.severity === 'critical'
                                  ? 'danger'
                                  : finding.severity === 'high'
                                  ? 'warning'
                                  : 'primary'
                              }
                            >
                              {finding.severity.toUpperCase()}
                            </Badge>
                            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 px-2 py-0.5 rounded">
                              {finding.confidence}% CONF
                            </span>
                          </div>
                        </div>

                        <div className="bg-indigo-50/50 dark:bg-indigo-950/30 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
                          <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1 block">
                            Recommendation
                          </span>
                          <p className="text-xs text-indigo-900 dark:text-indigo-300">{finding.recommendation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Certification Card — shown after successful certification */}
      {isCertified && isPassing && result && (
        <Card className="border-2 border-emerald-200 dark:border-emerald-800/60 bg-gradient-to-br from-emerald-50/60 via-white to-white dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900">
          <CardContent className="p-6">
            <div className="flex items-start gap-5">
              <div className="shrink-0 h-16 w-16 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <Award className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-300 tracking-tight">
                    Hygiene Assurance Certificate
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    Self-Certified under FSSAI & Legal Metrology Hygiene Standards
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 text-[10px] font-mono uppercase block">Manufacturer</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{user?.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 text-[10px] font-mono uppercase block">Assessment Date</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 text-[10px] font-mono uppercase block">AI Risk Score</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{result.riskScore}/100 ({result.riskLevel})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 text-[10px] font-mono uppercase block">Findings</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {result.findings.length} issue(s)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Badge variant="success" size="sm" className="text-[10px] font-bold uppercase px-2.5 py-1">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Self-Certified — Pending Regulator Verification
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submission History */}
      {myAssessments.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden shadow-xs">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              <FileCheck2 className="h-4 w-4 inline-block mr-2 text-indigo-500" />
              Submission History ({myAssessments.length})
            </h2>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              Self-Certification Ledger
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Certificate ID</th>
                  <th className="px-3 py-3">Submitted</th>
                  <th className="px-3 py-3">Risk Score</th>
                  <th className="px-3 py-3">Risk Level</th>
                  <th className="px-3 py-3">Findings</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {myAssessments.map((assessment) => (
                  <tr key={assessment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {assessment.id}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-slate-600 dark:text-slate-300 font-mono">
                      {new Date(assessment.submittedAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-3 py-3.5">
                      <span
                        className={cn(
                          'font-bold font-mono',
                          assessment.riskScore <= 30
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : assessment.riskScore <= 60
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-red-600 dark:text-red-400'
                        )}
                      >
                        {assessment.riskScore}/100
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      <Badge
                        variant={
                          assessment.riskLevel === 'High Risk'
                            ? 'danger'
                            : assessment.riskLevel === 'Medium Risk'
                            ? 'warning'
                            : 'success'
                        }
                        size="sm"
                      >
                        {assessment.riskLevel}
                      </Badge>
                    </td>
                    <td className="px-3 py-3.5 font-mono text-slate-600 dark:text-slate-300">
                      {assessment.findingsCount} issue(s)
                    </td>
                    <td className="px-4 py-3.5">
                      {assessment.status === 'certified' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-700/60">
                          <CheckCircle2 className="h-3 w-3" />
                          Certified
                        </span>
                      ) : assessment.status === 'needs-remediation' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-700/60">
                          <AlertTriangle className="h-3 w-3" />
                          Needs Remediation
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-700/60">
                          <Clock className="h-3 w-3" />
                          Pending Verification
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
