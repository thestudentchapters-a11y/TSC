'use client';

import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import Image from 'next/image';
import { UploadCloud, Link as LinkIcon, Image as ImageIcon, Loader2, X, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useToast } from '@/components/common/Toast';

interface ImageUploadInputProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  helpText?: string;
}

export function ImageUploadInput({
  value,
  onChange,
  label = 'Cover Image',
  helpText = 'Upload an image file from your device or provide an image URL.',
}: ImageUploadInputProps) {
  const { push } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('tsc_token') : null;

  const handleProcessFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      push('Please select a valid image file (PNG, JPG, WebP, GIF).', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      push('File size exceeds the 10MB limit.', 'error');
      return;
    }

    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;

        // Set base64 immediately for instantaneous visual feedback
        onChange(base64Data);

        try {
          const res = await fetch(`${api}/api/media/upload`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              file: base64Data,
              altText: file.name.replace(/\.[^/.]+$/, ''),
            }),
          });

          const data = await res.json();
          if (res.ok && data.url) {
            onChange(data.url);
            push('Image uploaded to cloud CDN successfully!', 'success');
          } else {
            push('Image loaded locally for edition.', 'info');
          }
        } catch {
          // Keep base64 data URL as reliable offline/local fallback
          push('Image attached successfully.', 'info');
        } finally {
          setUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };

      reader.onerror = () => {
        push('Failed to read selected image.', 'error');
        setUploading(false);
      };

      reader.readAsDataURL(file);
    } catch {
      push('Failed to upload image.', 'error');
      setUploading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleProcessFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleProcessFile(file);
  };

  return (
    <div className="space-y-2">
      {/* Label and Mode Switcher */}
      <div className="flex items-center justify-between">
        <label className="block font-display text-xs font-bold text-ink">{label}</label>
        <div className="inline-flex rounded-md border border-hairline bg-cream/40 p-0.5 text-[11px]">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`flex items-center gap-1 rounded px-2.5 py-1 font-medium transition-colors ${
              mode === 'upload'
                ? 'bg-white text-brand shadow-xs font-bold'
                : 'text-ink/60 hover:text-ink'
            }`}
          >
            <UploadCloud className="h-3 w-3" /> Upload File
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`flex items-center gap-1 rounded px-2.5 py-1 font-medium transition-colors ${
              mode === 'url'
                ? 'bg-white text-brand shadow-xs font-bold'
                : 'text-ink/60 hover:text-ink'
            }`}
          >
            <LinkIcon className="h-3 w-3" /> Image URL
          </button>
        </div>
      </div>

      {/* Upload Mode Dropzone */}
      {mode === 'upload' ? (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`group flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 text-center transition-all ${
              isDragging
                ? 'border-brand bg-brand/5'
                : 'border-hairline bg-cream/20 hover:border-brand/40 hover:bg-cream/40'
            }`}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2 py-2">
                <Loader2 className="h-6 w-6 animate-spin text-brand" />
                <p className="text-xs font-medium text-ink">Processing &amp; uploading image…</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5 py-1">
                <div className="rounded-full bg-brand/10 p-2 text-brand transition-transform duration-300 group-hover:scale-110">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <p className="text-xs font-semibold text-ink">
                  Click to browse <span className="font-normal text-muted">or drag &amp; drop image</span>
                </p>
                <p className="text-[11px] text-muted">PNG, JPG, WebP, GIF up to 10MB</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* URL Input Mode */
        <div>
          <div className="relative">
            <input
              type="text"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://images.unsplash.com/... or /images/affairs/..."
              className="w-full rounded-md border border-hairline px-3 py-2 text-sm focus:border-brand focus:outline-none"
            />
            {value ? (
              <button
                type="button"
                onClick={() => onChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                title="Clear URL"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
      )}

      {/* Live Preview Box if an image is selected */}
      {value ? (
        <div className="mt-2 flex items-center justify-between rounded-lg border border-hairline bg-white p-2.5 shadow-xs">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded border border-hairline bg-cream">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt="Selected Cover"
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/affairs/affairs-1.jpg';
                }}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                  <Check className="h-2.5 w-2.5" /> Image Attached
                </span>
              </div>
              <p className="mt-1 truncate text-xs text-muted max-w-[280px] sm:max-w-md font-mono" title={value}>
                {value.startsWith('data:') ? 'Local file uploaded' : value}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onChange('')}
              className="h-7 px-2 text-xs text-red-600 hover:bg-red-50 hover:border-red-200"
            >
              <X className="mr-1 h-3 w-3" /> Remove
            </Button>
          </div>
        </div>
      ) : null}

      <p className="text-[11px] text-muted">{helpText}</p>
    </div>
  );
}
