import React from 'react';
import { X, FileImage } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { useScanStore } from '../../store/scanStore';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export const ImagePreviewPanel: React.FC = () => {
  const { uploadedImages, removeImage, isProcessing } = useScanStore();

  if (uploadedImages.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <FileImage className="h-4 w-4 text-slate-700" />
          <span>Uploaded Images ({uploadedImages.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {uploadedImages.map((image) => (
            <div
              key={image.id}
              className="group relative rounded-lg border border-slate-200 bg-slate-50 overflow-hidden"
            >
              <div className="aspect-square">
                <img
                  src={image.dataUrl}
                  alt={image.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Remove button */}
              {!isProcessing && (
                <button
                  onClick={() => removeImage(image.id)}
                  className="absolute top-1.5 right-1.5 p-1 rounded-md bg-slate-900/70 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  title="Remove image"
                >
                  <X className="h-3 w-3" />
                </button>
              )}

              {/* File info */}
              <div className="px-2 py-1.5 border-t border-slate-200 bg-white">
                <p className="text-[11px] font-medium text-slate-800 truncate">{image.name}</p>
                <p className="text-[10px] text-slate-500 font-mono">{formatFileSize(image.size)}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
