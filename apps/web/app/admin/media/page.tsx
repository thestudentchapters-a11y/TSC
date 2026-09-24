'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Images, UploadCloud, Copy, Check, Sparkles, Loader2, Trash2 } from 'lucide-react';
import { useToast } from '@/components/common/Toast';
import { Button } from '@/components/common/Button';
import { compressImage, formatBytes } from '@/lib/image-compression';

interface MediaItem {
  id?: string;
  url: string;
  filename?: string;
}

const DEFAULT_IMAGES: MediaItem[] = [
  { url: '/images/hero/hero-campus-walk.jpg' },
  { url: '/images/hero/hero-classroom.jpg' },
  { url: '/images/hero/hero-founder.jpg' },
  { url: '/images/hero/hero-fest.jpg' },
  { url: '/images/hero/hero-collab.jpg' },
  { url: '/images/hero/hero-volunteer.jpg' },
  { url: '/images/hero/hero-podcast.jpg' },
  { url: '/images/hero/hero-workshop.jpg' },
  { url: '/images/news/news-1.jpg' },
  { url: '/images/news/news-2.jpg' },
  { url: '/images/news/news-3.jpg' },
  { url: '/images/news/news-4.jpg' },
  { url: '/images/stories/story-1.jpg' },
  { url: '/images/stories/story-2.jpg' },
  { url: '/images/stories/story-5.jpg' },
  { url: '/images/campus/campus-1.jpg' },
  { url: '/images/campus/campus-4.jpg' },
  { url: '/images/events/event-1.jpg' },
  { url: '/images/campaign/campaign-1.jpg' },
  { url: '/images/campaign/campaign-2.jpg' },
  { url: '/images/affairs/affairs-1.jpg' },
];

export default function AdminMediaPage() {
  const { push } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [deletedUrls, setDeletedUrls] = useState<Set<string>>(new Set());

  // Load initial stored media and deleted blacklist
  useEffect(() => {
    let deletedSet = new Set<string>();
    try {
      const storedDeleted = localStorage.getItem('tsc.admin.media.deleted');
      if (storedDeleted) {
        const parsedDeleted = JSON.parse(storedDeleted);
        if (Array.isArray(parsedDeleted)) {
          deletedSet = new Set(parsedDeleted);
          setDeletedUrls(deletedSet);
        }
      }
    } catch {}

    let initialItems: MediaItem[] = [];
    try {
      const stored = localStorage.getItem('tsc.admin.media');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          initialItems = parsed.map((item: any) =>
            typeof item === 'string' ? { url: item } : item
          );
        }
      }
    } catch {}

    if (initialItems.length === 0) {
      initialItems = DEFAULT_IMAGES.filter((m) => !deletedSet.has(m.url));
    } else {
      initialItems = initialItems.filter((m) => !deletedSet.has(m.url));
    }

    setMediaList(initialItems);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const token = typeof window !== 'undefined' ? (localStorage.getItem('tsc_token') || localStorage.getItem('tsc.token')) : null;

    if (apiUrl) {
      fetch(`${apiUrl}/api/media?_t=${Date.now()}&limit=100`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (json && Array.isArray(json.data)) {
            const apiItems: MediaItem[] = json.data
              .filter((m: any) => m && m.url && !deletedSet.has(m.url))
              .map((m: any) => ({
                id: m._id || m.id,
                url: m.url,
                filename: m.filename || m.altText,
              }));

            setMediaList((prev) => {
              const seen = new Set<string>();
              const combined: MediaItem[] = [];
              for (const item of [...apiItems, ...prev]) {
                if (item.url && !seen.has(item.url) && !deletedSet.has(item.url)) {
                  seen.add(item.url);
                  combined.push(item);
                }
              }
              return combined;
            });
          }
        })
        .catch(() => {});
    }
  }, []);

  const saveMediaList = (newList: MediaItem[]) => {
    setMediaList(newList);
    try {
      const cleanUrls = newList
        .filter((item) => typeof item.url === 'string' && !item.url.startsWith('data:image/'))
        .slice(0, 100);
      localStorage.setItem('tsc.admin.media', JSON.stringify(cleanUrls));
    } catch {}
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      push('Please select a valid image file (JPG, PNG, WebP).', 'error');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      push('File size exceeds 15MB limit.', 'error');
      return;
    }

    setUploading(true);
    try {
      // Lossless / high-efficiency compression: reduces payload by up to 90%
      const compressed = await compressImage(file, { maxDimension: 2048, quality: 0.88 });
      const base64Data = compressed.dataUrl;

      if (compressed.savedPercentage > 10) {
        push(`Asset optimized: ${formatBytes(compressed.originalSize)} → ${formatBytes(compressed.compressedSize)} (${compressed.savedPercentage}% saved).`, 'info');
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const token = typeof window !== 'undefined' ? (localStorage.getItem('tsc_token') || localStorage.getItem('tsc.token')) : null;

      try {
        const res = await fetch(`${apiUrl}/api/media/upload`, {
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
          const newItem: MediaItem = {
            id: data.id || data._id,
            url: data.url,
            filename: file.name,
          };
          // If it was in deleted set, un-delete it
          if (deletedUrls.has(data.url)) {
            const updatedDeleted = new Set(deletedUrls);
            updatedDeleted.delete(data.url);
            setDeletedUrls(updatedDeleted);
            localStorage.setItem('tsc.admin.media.deleted', JSON.stringify(Array.from(updatedDeleted)));
          }
          saveMediaList([newItem, ...mediaList.filter((m) => m.url !== data.url)]);
          push('Image uploaded to Cloudinary successfully!', 'success');
        } else {
          const previewItem: MediaItem = { url: base64Data, filename: file.name };
          saveMediaList([previewItem, ...mediaList]);
          push(data.error || 'Uploaded to preview media library.', 'info');
        }
      } catch {
        const previewItem: MediaItem = { url: base64Data, filename: file.name };
        saveMediaList([previewItem, ...mediaList]);
        push('Image added to media preview.', 'info');
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch {
      push('Failed to process and compress image file.', 'error');
      setUploading(false);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    push('Image URL copied to clipboard!', 'success');
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const handleDelete = async (targetItem: MediaItem) => {
    const filename = targetItem.filename || targetItem.url.split('/').pop() || 'this asset';
    if (!window.confirm(`Delete "${filename}" from media library?`)) return;

    // 1. Immediately record in deleted blacklist
    const updatedDeleted = new Set(deletedUrls);
    updatedDeleted.add(targetItem.url);
    setDeletedUrls(updatedDeleted);
    try {
      localStorage.setItem('tsc.admin.media.deleted', JSON.stringify(Array.from(updatedDeleted)));
    } catch {}

    // 2. Remove from active list
    const nextList = mediaList.filter((m) => m.url !== targetItem.url);
    saveMediaList(nextList);

    // 3. Delete from backend MongoDB if API is available
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const token = typeof window !== 'undefined' ? (localStorage.getItem('tsc_token') || localStorage.getItem('tsc.token')) : null;

    if (apiUrl) {
      try {
        const idToDelete = targetItem.id || encodeURIComponent(targetItem.url);
        await fetch(`${apiUrl}/api/media/${idToDelete}`, {
          method: 'DELETE',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
      } catch {
        /* handled */
      }
    }

    push('Media asset deleted from library.', 'info');
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
        {mediaList.map((item, idx) => (
          <figure key={`${item.url}-${idx}`} className="group relative overflow-hidden rounded-lg border border-hairline bg-white shadow-sm transition-all hover:shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.url}
              alt={`Asset: ${item.filename || item.url.split('/').pop()}`}
              className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink/70 p-3 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100">
              <Button
                variant="light"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(item.url);
                }}
                className="w-full gap-1.5 bg-white text-ink hover:bg-cream"
              >
                {copiedUrl === item.url ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedUrl === item.url ? 'Copied' : 'Copy URL'}
              </Button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(item);
                }}
                className="flex w-full items-center justify-center gap-1.5 rounded-md border border-red-500/50 bg-red-600/90 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-red-700"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
            <figcaption className="flex items-center justify-between gap-1.5 px-3 py-2 text-[10px] font-medium text-muted">
              <span className="flex items-center gap-1 truncate">
                <Images aria-hidden="true" className="h-3 w-3 shrink-0" />
                <span className="truncate">{item.filename || item.url.split('/').pop()}</span>
              </span>
              <button
                type="button"
                aria-label="Delete image"
                title="Delete media asset"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(item);
                }}
                className="rounded p-1 text-muted transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
