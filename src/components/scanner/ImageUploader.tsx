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
              {isDragActive ? 'Drop product packaging images here' : 'Upload Product Packaging Images'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Select multiple photos of the <span className="font-semibold text-blue-600">same product</span> from different angles (Front, Back, Side, Nutritional Panel)
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              PNG, JPG, JPEG, WebP • Multi-angle images will be consolidated into a single compliance audit
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

        {/* Quick Sample Declarations for Testing */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono uppercase tracking-wider">
              Quick Test: Sample FMCG Packaging Declarations
            </span>
            <span className="text-[11px] text-slate-400 font-mono">1-Click Load</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {[
              { name: 'Parachute Oil', img: '/products/parachute_coconut_oil.jpg' },
              { name: 'Nivea Lotion', img: '/products/nivea_body_lotion.jpg' },
              { name: 'Nescafé Classic', img: '/products/nescafe_classic.jpg' },
              { name: 'Bournvita Pouch', img: '/products/bournvita.jpg' },
              { name: 'Mysore Sandal', img: '/products/mysore_sandal_soap.jpg' },
            ].map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  useScanStore.getState().loadSampleImage(item.img, `${item.name.toLowerCase().replace(/\s+/g, '-')}.jpg`);
                }}
                disabled={isProcessing}
                className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 bg-slate-50/70 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 transition-all text-left group disabled:opacity-50"
              >
                <img src={item.img} alt={item.name} className="w-8 h-8 rounded object-cover shrink-0 border border-slate-200 dark:border-slate-700" />
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 truncate">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">
                    + Load Label
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
