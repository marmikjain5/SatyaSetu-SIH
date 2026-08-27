import React, { useCallback, useRef, useState } from 'react';
import { Upload, ImagePlus, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { useScanStore } from '../../store/scanStore';
import { cn } from '../../lib/utils';

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const ACCEPTED_EXTENSIONS = '.png,.jpg,.jpeg,.webp';

export const ImageUploader: React.FC = () => {
  const { addImages, isProcessing } = useScanStore();
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndAdd = useCallback(
    (files: FileList | File[]) => {
      setError(null);
      const fileArray = Array.from(files);
      const invalid = fileArray.filter((f) => !ACCEPTED_TYPES.includes(f.type));

      if (invalid.length > 0) {
        setError(`Unsupported format: ${invalid.map((f) => f.name).join(', ')}. Use PNG, JPG, JPEG, or WebP.`);
        return;
      }

      addImages(fileArray);
    },
    [addImages]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);

      if (isProcessing) return;

      if (e.dataTransfer.files?.length) {
        validateAndAdd(e.dataTransfer.files);
      }
    },
    [isProcessing, validateAndAdd]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isProcessing) setIsDragActive(true);
    },
    [isProcessing]
  );

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleClick = () => {
    if (!isProcessing) inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      validateAndAdd(e.target.files);
      e.target.value = '';
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
          className={cn(
            'relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-all duration-200',
            isDragActive
              ? 'border-blue-500 bg-blue-50/60'
              : 'border-slate-300 bg-slate-50/40 hover:border-slate-400 hover:bg-slate-50/80',
            isProcessing && 'opacity-50 pointer-events-none cursor-not-allowed'
          )}
        >
          <div
            className={cn(
              'flex items-center justify-center h-12 w-12 rounded-xl border transition-colors',
              isDragActive
                ? 'bg-blue-100 border-blue-300 text-blue-600'
                : 'bg-slate-100 border-slate-200 text-slate-500'
            )}
          >
            {isDragActive ? (
              <ImagePlus className="h-5 w-5" />
            ) : (
              <Upload className="h-5 w-5" />
            )}
          </div>

          <div className="text-center">
            <p className="text-sm font-semibold text-slate-800">
              {isDragActive ? 'Drop images here' : 'Upload Product Images'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Drag & drop or click to browse • PNG, JPG, JPEG, WebP
            </p>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_EXTENSIONS}
            multiple
            className="hidden"
            onChange={handleInputChange}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
