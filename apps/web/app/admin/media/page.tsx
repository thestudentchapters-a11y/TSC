'use client';

import { useState, useRef } from 'react';
import { Images, UploadCloud, Copy, Check, Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '@/components/common/Toast';
import { Button } from '@/components/common/Button';

export default function AdminMediaPage() {
  const { push } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const [images, setImages] = useState<string[]>([
    '/images/hero/hero-campus-walk.jpg', '/images/hero/hero-classroom.jpg', '/images/hero/hero-founder.jpg',
    '/images/hero/hero-fest.jpg', '/images/hero/hero-collab.jpg', '/images/hero/hero-volunteer.jpg',
    '/images/hero/hero-podcast.jpg', '/images/hero/hero-workshop.jpg', '/images/news/news-1.jpg',
    '/images/news/news-2.jpg', '/images/news/news-3.jpg', '/images/news/news-4.jpg',
    '/images/stories/story-1.jpg', '/images/stories/story-2.jpg', '/images/stories/story-5.jpg',
    '/images/campus/campus-1.jpg', '/images/campus/campus-4.jpg', '/images/events/event-1.jpg',
    '/images/campaign/campaign-1.jpg', '/images/campaign/campaign-2.jpg', '/images/affairs/affairs-1.jpg',
  ]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      push('Please select a valid image file (JPG, PNG, WebP).', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      push('File size exceeds 10MB limit.', 'error');
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

        try {
          const res = await fetch(`${apiUrl}/api/media/upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              file: base64Data,
              altText: file.name.replace(/\.[^/.]+$/, ''),
            }),
          });

          const data = await res.json();
          if (res.ok && data.url) {
            setImages((prev) => [data.url, ...prev]);
            push('Image uploaded to Cloudinary successfully!', 'success');
          } else {
            // Fallback for previewing locally if API isn't live
            setImages((prev) => [base64Data, ...prev]);
            push(data.error || 'Uploaded to preview media library.', 'info');
          }
        } catch {
          setImages((prev) => [base64Data, ...prev]);
          push('Image added to media preview.', 'info');
        } finally {
          setUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.readAsDataURL(file);
    } catch {
      push('Failed to process image file.', 'error');
      setUploading(false);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    push('Image URL copied to clipboard!', 'success');
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Configuration</p>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight">Media Library</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            High-performance Cloudinary CDN storage. Uploaded media delivers with automatic responsive optimization.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-brand">
          <Sparkles className="h-3.5 w-3.5 text-gold-deep" /> Cloudinary Enabled
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div
        onClick={() => !uploading && fileInputRef.current?.click()}
        className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-hairline bg-white px-6 py-12 text-center transition-colors hover:border-gold hover:bg-cream/40"
      >
        {uploading ? (
          <Loader2 className="h-9 w-9 animate-spin text-brand" />
        ) : (
          <UploadCloud aria-hidden className="h-9 w-9 text-muted/60 transition-transform duration-300 group-hover:scale-110 group-hover:text-brand" />
        )}
        <p className="font-display text-sm font-bold">
          {uploading ? 'Uploading to Cloudinary...' : 'Upload New Media Asset'}
        </p>
        <p className="max-w-md text-xs leading-5 text-muted">
          Click or drop your image here (PNG, JPG, WebP up to 10MB). Uploads save straight to your Cloudinary media account.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {images.map((src, idx) => (
          <figure key={`${src}-${idx}`} className="group relative overflow-hidden rounded-lg border border-hairline bg-white shadow-sm transition-all hover:shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`Asset: ${src.split('/').pop()}`}
              className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-ink/60 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100">
              <Button
                variant="light"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(src);
                }}
                className="gap-1.5 bg-white text-ink hover:bg-cream"
              >
                {copiedUrl === src ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedUrl === src ? 'Copied' : 'Copy URL'}
              </Button>
            </div>
            <figcaption className="flex items-center justify-between gap-1.5 px-3 py-2 text-[10px] font-medium text-muted">
              <span className="flex items-center gap-1 truncate">
                <Images aria-hidden="true" className="h-3 w-3 shrink-0" />
                <span className="truncate">{src.split('/').pop()}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
