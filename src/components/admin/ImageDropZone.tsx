import React, { useState, useRef } from 'react';
import { UploadCloud, X, Loader2, CheckCircle2, Eye, RefreshCw } from 'lucide-react';
import { Language } from '../../types';
import { t } from '../../lib/translations';
import { processAndUploadImage } from '../../lib/imageUpload';

interface ImageDropZoneProps {
  images: string[];
  onChange: (images: string[]) => void;
  lang: Language;
  singleMode?: boolean;
  label?: string;
  helperText?: string;
}

interface UploadingItem {
  id: string;
  name: string;
  previewUrl: string;
  progress: 'processing' | 'saving' | 'done' | 'error';
}

export const ImageDropZone: React.FC<ImageDropZoneProps> = ({
  images = [],
  onChange,
  lang,
  singleMode = false,
  label,
  helperText
}) => {
  const safeImages = Array.isArray(images) ? images.filter(Boolean) : [];
  const strings = t[lang] || t['bn'];
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingList, setUploadingList] = useState<UploadingItem[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [previewModalImg, setPreviewModalImg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Filter image files
    const fileArray = Array.from(files).filter(f =>
      f.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|svg|avif|bmp|jfif)$/i.test(f.name)
    );

    if (fileArray.length === 0) return;

    // Generate immediate instant optimistic previews
    const newUploadingItems: UploadingItem[] = fileArray.map((f, idx) => ({
      id: `${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 7)}`,
      name: f.name,
      previewUrl: URL.createObjectURL(f),
      progress: 'processing'
    }));

    setUploadingList(prev => singleMode ? newUploadingItems.slice(0, 1) : [...prev, ...newUploadingItems]);

    // Process and upload all files in parallel for maximum speed
    try {
      const uploadPromises = fileArray.map(async (file, idx) => {
        const itemTracker = newUploadingItems[idx];
        try {
          if (itemTracker) {
            setUploadingList(prev =>
              prev.map(p => p.id === itemTracker.id ? { ...p, progress: 'saving' } : p)
            );
          }

          // Convert to Supabase Storage URL or self-contained WebP data URL
          let permanentUrl = await processAndUploadImage(file);
          
          // Safety check: Never return blob: URL as permanent URL
          if (!permanentUrl || permanentUrl.startsWith('blob:')) {
            permanentUrl = await new Promise<string>((resolve) => {
              const r = new FileReader();
              r.onload = () => resolve(typeof r.result === 'string' ? r.result : '');
              r.onerror = () => resolve('');
              r.readAsDataURL(file);
            });
          }

          if (itemTracker) {
            setUploadingList(prev =>
              prev.map(p => p.id === itemTracker.id ? { ...p, progress: 'done' } : p)
            );
          }

          return permanentUrl;
        } catch (err) {
          console.error(`Error uploading image ${file.name}:`, err);
          if (itemTracker) {
            setUploadingList(prev =>
              prev.map(p => p.id === itemTracker.id ? { ...p, progress: 'error' } : p)
            );
          }
          // Fallback to base64 data url directly from file
          return new Promise<string>((resolve) => {
            const r = new FileReader();
            r.onload = () => resolve(typeof r.result === 'string' ? r.result : '');
            r.onerror = () => resolve('');
            r.readAsDataURL(file);
          });
        }
      });

      const uploadedResults = (await Promise.all(uploadPromises)).filter(url => url && !url.startsWith('blob:'));

      // Clean up previous blob URLs from memory
      newUploadingItems.forEach(item => {
        try { URL.revokeObjectURL(item.previewUrl); } catch {}
      });

      if (singleMode) {
        if (uploadedResults.length > 0) {
          onChange([uploadedResults[0]]);
        }
      } else {
        onChange([...safeImages.filter(img => !img.startsWith('blob:')), ...uploadedResults]);
      }
    } finally {
      // Clear uploading items after a brief transition
      setTimeout(() => {
        setUploadingList([]);
      }, 600);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    onChange(safeImages.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSetPrimary = (indexToPromote: number) => {
    if (indexToPromote === 0) return;
    const item = safeImages[indexToPromote];
    const rest = safeImages.filter((_, idx) => idx !== indexToPromote);
    onChange([item, ...rest]);
  };

  const handleAddUrl = (e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault();
    if (urlInput.trim()) {
      if (singleMode) {
        onChange([urlInput.trim()]);
      } else {
        onChange([...safeImages, urlInput.trim()]);
      }
      setUrlInput('');
    }
  };

  const isCurrentlyUploading = uploadingList.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-900">
          {label || (singleMode ? strings.categoryImage : strings.productImages)} ({safeImages.length})
        </label>
        <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
          {lang === 'bn' ? '✓ লোকাল স্টোরেজ ও ডিস্ক অটো সেভ' : '✓ Auto-Saved to Disk & Storage'}
        </span>
      </div>

      {/* Main Drag-and-Drop Surface */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isCurrentlyUploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-[#FF6B35] bg-orange-50 scale-[1.01]'
            : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400'
        } ${isCurrentlyUploading ? 'opacity-85' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.jpg,.jpeg,.png,.webp,.svg,.avif,.jfif,.bmp"
          multiple={!singleMode}
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            if (e.target) e.target.value = '';
          }}
        />

        {isCurrentlyUploading ? (
          <div className="py-2 flex flex-col items-center animate-fade-in">
            <Loader2 className="w-8 h-8 text-[#FF6B35] animate-spin mb-2" />
            <p className="text-xs font-bold text-slate-900">
              {lang === 'bn'
                ? `পিসি থেকে ${uploadingList.length}টি ছবি প্রক্রিয়াকরণ ও সেভ করা হচ্ছে...`
                : `Processing & saving ${uploadingList.length} photo(s) to storage...`}
            </p>
            <span className="text-[11px] text-slate-500 mt-0.5">
              {lang === 'bn' ? 'ছবিটি অবিলম্বে আপনার প্রজেক্টে যুক্ত হচ্ছে' : 'Adding directly to your local catalog'}
            </span>
          </div>
        ) : (
          <>
            <div className="p-3 rounded-full bg-white shadow-2xs mb-2 text-[#FF6B35] border border-slate-100">
              <UploadCloud className="w-6 h-6" />
            </div>

            <p className="text-xs sm:text-sm font-bold text-slate-900 max-w-sm">
              {helperText || strings.dragDropImages}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              {strings.dragDropHint} (JPG, PNG, WEBP, SVG)
            </p>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="mt-2.5 px-4 py-1.5 rounded-lg bg-[#0F172A] hover:bg-black text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
            >
              📁 {lang === 'bn' ? 'পিসি থেকে ছবি সিলেক্ট করুন' : 'Select Photos from Computer'}
            </button>
          </>
        )}
      </div>

      {/* Optional: Add via URL */}
      <div className="flex gap-2">
        <input
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder={lang === 'bn' ? 'অথবা সরাসরি ওয়েব ছবির লিঙ্ক (URL) দিন...' : 'Or paste direct web image URL...'}
          className="flex-1 h-9 px-3 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:border-[#FF6B35]"
        />
        <button
          type="button"
          onClick={handleAddUrl}
          disabled={!urlInput.trim()}
          className="h-9 px-3.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-xs font-bold text-slate-800 transition-colors disabled:opacity-40 cursor-pointer"
        >
          {lang === 'bn' ? 'যোগ করুন' : 'Add URL'}
        </button>
      </div>

      {/* Optimistic uploading preview list */}
      {uploadingList.length > 0 && (
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-slate-700">
            {lang === 'bn' ? 'আপলোড হচ্ছে:' : 'Uploading:'}
          </span>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {uploadingList.map((item) => (
              <div
                key={item.id}
                className="relative aspect-square rounded-lg overflow-hidden border-2 border-orange-300 bg-slate-100 shadow-2xs"
              >
                <img
                  src={item.previewUrl}
                  alt={item.name}
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Preview Thumbnails Grid */}
      {safeImages.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700">
              {singleMode
                ? (lang === 'bn' ? 'সিলেক্টেড ছবি:' : 'Selected Image:')
                : (lang === 'bn' ? 'আপলোডকৃত ছবিসমূহ (প্রথম ছবিটি প্রধান কাভার হিসেবে শো করবে):' : 'Uploaded Images (1st image is the primary cover):')}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              {safeImages.length} {lang === 'bn' ? 'টি ছবি সেভ করা আছে' : 'photo(s) saved'}
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 pt-1">
            {safeImages.map((img, idx) => (
              <div
                key={idx}
                className="group relative aspect-square rounded-xl overflow-hidden border-2 border-slate-200 hover:border-slate-400 bg-white shadow-2xs transition-all"
              >
                <img
                  src={img}
                  alt={`Preview ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to placeholder if url fails
                    const target = e.currentTarget;
                    if (!target.dataset.fallback) {
                      target.dataset.fallback = 'true';
                      target.src = 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300&auto=format&fit=crop&q=80';
                    }
                  }}
                />

                {/* Primary Tag / Cover Selector */}
                {!singleMode && (
                  idx === 0 ? (
                    <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md text-[9px] font-black bg-emerald-600 text-white shadow-2xs flex items-center gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      {lang === 'bn' ? 'কাভার' : 'COVER'}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(idx)}
                      className="absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-0.5 rounded-md text-[9px] font-bold bg-slate-900/80 hover:bg-black text-white cursor-pointer"
                      title={lang === 'bn' ? 'প্রধান কাভার ছবি বানান' : 'Set as primary cover'}
                    >
                      {lang === 'bn' ? 'কাভার করুন' : 'Make Cover'}
                    </button>
                  )
                )}

                {/* Quick Preview Button */}
                <button
                  type="button"
                  onClick={() => setPreviewModalImg(img)}
                  className="absolute bottom-1.5 left-1.5 p-1 rounded-md bg-black/60 hover:bg-black text-white opacity-0 group-hover:opacity-100 shadow-2xs cursor-pointer transition-opacity"
                  title="View full image"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1.5 right-1.5 p-1 rounded-md bg-red-600 hover:bg-red-700 text-white shadow-2xs cursor-pointer transition-opacity"
                  title={lang === 'bn' ? 'ছবি সরান' : 'Remove image'}
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                {/* Local indicator */}
                {img.startsWith('/uploads/') && (
                  <span className="absolute bottom-1.5 right-1.5 px-1 rounded text-[8px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    DISK
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Click-to-enlarge Preview Modal */}
      {previewModalImg && (
        <div
          className="fixed inset-0 z-70 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setPreviewModalImg(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800">
                {lang === 'bn' ? 'ছবির প্রিভিউ' : 'Image Preview'}
              </span>
              <button
                type="button"
                onClick={() => setPreviewModalImg(null)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 flex items-center justify-center bg-slate-50 max-h-[70vh] overflow-hidden">
              <img
                src={previewModalImg}
                alt="Enlarged preview"
                className="max-h-[65vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
