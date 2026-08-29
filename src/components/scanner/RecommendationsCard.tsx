import React, { useState } from 'react';
import { Lightbulb, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { useScanStore } from '../../store/scanStore';

export const RecommendationsCard: React.FC = () => {
  const { currentScan, validationResults } = useScanStore();
  const [showAll, setShowAll] = useState(false);

  if (
    !currentScan ||
    currentScan.status !== 'completed' ||
    !currentScan.extractedData
  ) {
    return null;
  }

  const result = validationResults[currentScan.id];
  if (!result || !result.recommendations || result.recommendations.length === 0) {
    return null;
  }

  const PREVIEW_COUNT = 4;
  const displayedRecs = showAll
    ? result.recommendations
    : result.recommendations.slice(0, PREVIEW_COUNT);

  return (
    <Card className="h-full flex flex-col border border-slate-200/90 shadow-subtle bg-white">
      {/* Header */}
      <CardHeader className="px-5 py-4 border-b border-slate-100 flex flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-7 w-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
            <Lightbulb className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight truncate">
            Recommendations
          </h3>
        </div>

        {result.recommendations.length > PREVIEW_COUNT && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors shrink-0 flex items-center gap-0.5"
          >
            <span>{showAll ? 'View less' : 'View all'}</span>
            {showAll ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        )}
      </CardHeader>

      {/* Body: Vertical List of Recommendations */}
      <CardContent className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          {displayedRecs.map((rec, i) => (
            <div
              key={i}
              className="flex items-start gap-2.5 p-2.5 rounded-lg border border-blue-100/80 bg-blue-50/25 text-xs text-slate-700 leading-relaxed hover:border-blue-200 transition-colors"
            >
              <Lightbulb className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
              <span className="break-words font-medium">{rec}</span>
            </div>
          ))}
        </div>

        {/* Bottom Pinned Guidelines Button */}
        <div className="pt-2 mt-auto border-t border-slate-100">
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-blue-200 bg-white hover:bg-blue-50 text-xs font-semibold text-blue-700 transition-colors shadow-2xs"
          >
            <BookOpen className="h-3.5 w-3.5 text-blue-600" />
            <span>{showAll ? 'Collapse Guidelines' : 'View All Guidelines'}</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
