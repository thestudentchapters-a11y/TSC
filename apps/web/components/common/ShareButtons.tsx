'use client';

import { useEffect, useState } from 'react';
import { Check, Link2, Linkedin, MessageCircle, Facebook, Twitter } from 'lucide-react';
import { useToast } from '@/components/common/Toast';
import { useAuth } from '@/components/providers/AuthProvider';
import { cn } from '@/lib/utils';

/** Share row — copy link + platform share intents. */
export function ShareButtons({ title, path }: { title: string; path: string }) {
  const { push } = useToast();
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? `${window.location.origin}${path}` : path;

  const share = (href: string) => window.open(href, '_blank', 'noopener,noreferrer,width=600,height=500');

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Share</span>
      <button
        type="button"
        aria-label="Copy link"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            push('Link copied to clipboard.', 'success');
            setTimeout(() => setCopied(false), 2000);
          } catch {
            push('Could not copy link.', 'error');
          }
        }}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-white text-ink/70 transition-colors hover:border-gold hover:text-gold-deep"
      >
        {copied ? <Check aria-hidden className="h-4 w-4 text-gold-deep" /> : <Link2 aria-hidden className="h-4 w-4" />}
      </button>
      <button
        type="button"
        aria-label="Share on WhatsApp"
        onClick={() => share(`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`)}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-white text-ink/70 transition-colors hover:border-gold hover:text-gold-deep"
      >
        <MessageCircle aria-hidden className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Share on X"
        onClick={() => share(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`)}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-white text-ink/70 transition-colors hover:border-gold hover:text-gold-deep"
      >
        <Twitter aria-hidden className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Share on LinkedIn"
        onClick={() => share(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`)}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-white text-ink/70 transition-colors hover:border-gold hover:text-gold-deep"
      >
        <Linkedin aria-hidden className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Share on Facebook"
        onClick={() => share(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`)}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-white text-ink/70 transition-colors hover:border-gold hover:text-gold-deep"
      >
        <Facebook aria-hidden className="h-4 w-4" />
      </button>
    </div>
  );
}

/** Save/bookmark toggle — persists locally in demo mode, via API when configured. */
export function SaveButton({
  itemType,
  itemId,
  title,
  className,
}: {
  itemType: string;
  itemId: string;
  title: string;
  className?: string;
}) {
  const { user } = useAuth();
  const { push } = useToast();
  const storageKey = 'tsc.saved';
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      const list: string[] = raw ? JSON.parse(raw) : [];
      setSaved(list.includes(`${itemType}:${itemId}`));
    } catch {
      /* noop */
    }
  }, [itemType, itemId]);

  const toggle = () => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      let list: string[] = raw ? JSON.parse(raw) : [];
      const key = `${itemType}:${itemId}`;
      if (list.includes(key)) {
        list = list.filter((k) => k !== key);
        setSaved(false);
        push('Removed from your saved items.', 'info');
      } else {
        list.push(key);
        setSaved(true);
        push(`Saved “${title}”${user ? '' : ' (sign in to sync across devices)'}.`, 'success');
      }
      window.localStorage.setItem(storageKey, JSON.stringify(list));
    } catch {
      push('Could not save right now.', 'error');
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={saved}
      className={cn(
        'inline-flex items-center gap-2 rounded-[4px] border px-4 py-2 font-display text-[11px] font-bold uppercase tracking-[0.12em] transition-all',
        saved
          ? 'border-gold bg-gold-50 text-gold-deep'
          : 'border-hairline bg-white text-ink/70 hover:border-brand hover:text-brand',
        className
      )}
    >
      <Check aria-hidden className={cn('h-3.5 w-3.5', !saved && 'hidden')} />
      {saved ? 'Saved' : 'Save'}
    </button>
  );
}
