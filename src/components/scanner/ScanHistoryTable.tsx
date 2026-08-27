import React, { useState } from 'react';
import { History, Search, Eye, Trash2, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useScanStore } from '../../store/scanStore';
import type { ScanRecord } from '../../types/scan';

export const ScanHistoryTable: React.FC = () => {
  const { scans, viewScan, deleteScan, clearHistory } = useScanStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredScans = scans.filter((scan) =>
    scan.imageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    scan.timestamp.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (scan.extractedData?.productName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (scans.length === 0) return null;

  const getStatusBadge = (scan: ScanRecord) => {
    switch (scan.status) {
      case 'completed':
        return <Badge variant="success" size="sm">Completed</Badge>;
      case 'error':
        return <Badge variant="danger" size="sm">Failed</Badge>;
      case 'processing':
        return <Badge variant="primary" size="sm" dot>Processing</Badge>;
      default:
        return <Badge variant="neutral" size="sm">Idle</Badge>;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-emerald-700';
    if (confidence >= 70) return 'text-amber-700';
    return 'text-red-700';
  };

  const getConfidenceBarColor = (confidence: number) => {
    if (confidence >= 90) return 'bg-emerald-600';
    if (confidence >= 70) return 'bg-amber-500';
    return 'bg-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <History className="h-4 w-4 text-slate-700" />
          <span>Scan History ({scans.length})</span>
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={clearHistory} className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50">
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear All</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 pb-2">
        <div className="mb-3">
          <Input
            placeholder="Search scans by file name, product name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="h-4 w-4" />}
            className="text-xs"
          />
        </div>
      </CardContent>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200">
            <tr>
              <th className="px-4 py-3">Image / File</th>
              <th className="px-3 py-3">Timestamp</th>
              <th className="px-3 py-3">Product Name</th>
              <th className="px-3 py-3">Confidence</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredScans.map((scan) => (
              <tr
                key={scan.id}
                className="hover:bg-slate-50/80 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg border border-slate-200 bg-slate-100 overflow-hidden shrink-0">
                      <img
                        src={scan.imageDataUrl}
                        alt={scan.imageName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="font-medium text-slate-800 truncate max-w-[140px]">
                      {scan.imageName}
                    </span>
                  </div>
                </td>

                <td className="px-3 py-3">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span className="font-mono text-[11px]">{scan.timestamp}</span>
                  </div>
                </td>

                <td className="px-3 py-3">
                  <span className="font-medium text-slate-800 truncate max-w-[160px] block">
                    {scan.extractedData?.productName || '—'}
                  </span>
                </td>

                <td className="px-3 py-3 font-mono">
                  {scan.status === 'completed' ? (
                    <div className="flex items-center gap-2">
                      <div className="w-12 bg-slate-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${getConfidenceBarColor(scan.confidence)}`}
                          style={{ width: `${scan.confidence}%` }}
                        />
                      </div>
                      <span className={`font-semibold ${getConfidenceColor(scan.confidence)}`}>
                        {scan.confidence}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>

                <td className="px-3 py-3">
                  {getStatusBadge(scan)}
                </td>

                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {scan.status === 'completed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewScan(scan)}
                        className="h-7 text-xs text-blue-600 gap-1"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View</span>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteScan(scan.id)}
                      className="h-7 text-xs text-slate-500 hover:text-red-600 gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredScans.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500 text-xs">
                  No scans match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
