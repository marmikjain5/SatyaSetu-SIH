import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, UploadCloud, Loader2, AlertTriangle, ShieldAlert, CheckCircle2, Scale, PlusCircle } from 'lucide-react';
import { useHygieneStore } from '../../store/hygieneStore';
import { HygieneViolation } from '../../types/hygiene';
import { analyzeFactoryImage, VisualInspectionResult, VisionFinding } from '../../lib/hygieneVisionService';
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
  const [result, setResult] = useState<VisualInspectionResult | null>(null);
  const [createdViolations, setCreatedViolations] = useState<Record<string, HygieneViolation>>({});

  const { factories, addViolation } = useHygieneStore();
  const navigate = useNavigate();

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
    setAnalysisStatus('Preprocessing image...');
    
    // Simulate preprocessing
    await new Promise((r) => setTimeout(r, 1000));
    setAnalysisStatus('Running AI Vision inspection...');
    
    // Call the prototype service
    const inspectionResult = await analyzeFactoryImage(imageUrl);
    
    setAnalysisStatus('Generating hygiene findings...');
    await new Promise((r) => setTimeout(r, 800));
    
    setResult(inspectionResult);
    setIsAnalyzing(false);
    setAnalysisStatus('');
  };

  const handleCreateViolation = (finding: VisionFinding) => {
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

  const handleReviewWithAI = (violation: HygieneViolation) => {
    navigate('/dashboard/legal-review', {
      state: { hygieneViolation: violation },
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>
              <Camera className="h-5 w-5 text-indigo-600" />
              AI Visual Inspection
            </CardTitle>
            <Badge variant="primary" size="sm" dot>PROTOTYPE AI VISION</Badge>
          </div>
          <p className="text-xs text-slate-500">
            Upload an image of the factory floor to run prototype AI vision analysis for hygiene violations.
          </p>
        </CardHeader>
        <CardContent>
          {!imageUrl ? (
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:bg-slate-50 transition-colors">
              <UploadCloud className="h-10 w-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-900 mb-1">Upload Factory Image</h3>
              <p className="text-xs text-slate-500 mb-4">PNG, JPG or WEBP (max 10MB)</p>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
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
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 max-h-[400px] flex items-center justify-center">
                <img src={imageUrl} alt="Uploaded factory" className="max-h-[400px] object-contain" />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                    Replace
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
                        <Camera className="h-4 w-4 mr-2" />
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

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-sm text-slate-500 uppercase tracking-wider">AI Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-6">
                <div className="relative flex items-center justify-center h-40 w-40 mb-4">
                  <svg className="absolute inset-0 h-full w-full transform -rotate-90">
                    <circle cx="80" cy="80" r="70" className="stroke-slate-100" strokeWidth="12" fill="none" />
                    <circle 
                      cx="80" 
                      cy="80" 
                      r="70" 
                      className={cn(
                        "transition-all duration-1000 ease-out",
                        result.riskLevel === 'High Risk' ? 'stroke-red-500' : 
                        result.riskLevel === 'Medium Risk' ? 'stroke-amber-500' : 'stroke-emerald-500'
                      )} 
                      strokeWidth="12" 
                      fill="none"
                      strokeDasharray="439.8"
                      strokeDashoffset={439.8 - (439.8 * result.riskScore) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="text-center">
                    <span className="text-4xl font-extrabold text-slate-900">{result.riskScore}</span>
                    <span className="text-sm text-slate-500 block">/ 100</span>
                  </div>
                </div>
                <Badge variant={
                  result.riskLevel === 'High Risk' ? 'danger' : 
                  result.riskLevel === 'Medium Risk' ? 'warning' : 'success'
                } size="lg" className="px-4 py-1.5 text-sm font-bold">
                  {result.riskLevel}
                </Badge>
                <p className="text-xs text-slate-500 mt-4 text-center">
                  Based on prototype visual analysis of {result.findings.length} detected conditions.
                </p>
              </CardContent>
            </Card>
          </div>

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
                  <div className="p-8 text-center text-sm text-slate-500 flex flex-col items-center gap-2">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                    <span>No hygiene issues detected in the image.</span>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {result.findings.map(finding => (
                      <div key={finding.id} className="p-5 hover:bg-slate-50/50 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <ShieldAlert className={cn(
                                "h-4 w-4",
                                finding.severity === 'critical' ? 'text-red-600' : 
                                finding.severity === 'high' ? 'text-orange-500' :
                                'text-blue-500'
                              )} />
                              <h4 className="text-sm font-bold text-slate-900">{finding.title}</h4>
                            </div>
                            <p className="text-xs text-slate-600">{finding.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={finding.severity === 'critical' ? 'danger' : finding.severity === 'high' ? 'warning' : 'primary'}>
                              {finding.severity.toUpperCase()}
                            </Badge>
                            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              {finding.confidence}% CONF
                            </span>
                          </div>
                        </div>
                        
                        <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 mb-4">
                          <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider mb-1 block">Recommendation</span>
                          <p className="text-xs text-blue-900">{finding.recommendation}</p>
                        </div>
                        
                        <div className="flex justify-end gap-2">
                          {createdViolations[finding.id] ? (
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              className="text-xs"
                              onClick={() => handleReviewWithAI(createdViolations[finding.id])}
                            >
                              <Scale className="h-3.5 w-3.5 mr-1.5" />
                              Review with AI
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs"
                              onClick={() => handleCreateViolation(finding)}
                            >
                              <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
                              Create Violation
                            </Button>
                          )}
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
    </div>
  );
};
