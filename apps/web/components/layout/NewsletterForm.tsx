'use client';

import { useState } from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/common/Toast';

/** Footer newsletter signup — checks DB for duplicate subscriptions + honeypot spam protection. */
export function NewsletterForm() {
  const { push } = useToast();
  const [email, setEmail] = useState('');
  const [honey, setHoney] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'already_subscribed'>('idle');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (honey) return; // bot trap
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      push('Please enter a valid email address.', 'error');
      return;
    }
    setBusy(true);
    try {
      const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${api}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, honey }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setStatus('success');
        push('You are on the list. No noise. Just things worth knowing.', 'success');
      } else if (
        data.alreadySubscribed ||
        data.message === 'Already Subscribed' ||
        res.status === 409 ||
        (typeof data.message === 'string' && data.message.toLowerCase().includes('already'))
      ) {
        setStatus('already_subscribed');
        push('Already Subscribed: This email is already on our newsletter list.', 'info');
      } else {
        push(data.message || 'Could not subscribe right now. Please try again.', 'error');
      }
    } catch {
      push('Could not connect to subscription service. Please try again.', 'error');
    } finally {
      setBusy(false);
    }
  }

  if (status === 'success') {
    return (
      <div className="flex items-center gap-2 rounded-md border border-gold/40 bg-gold-50 px-4 py-3 text-sm font-semibold text-gold-deep animate-in fade-in">
        <CheckCircle2 className="h-4 w-4 text-gold-deep shrink-0" />
        <span>Subscribed — welcome to TSC.</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row" noValidate>
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status !== 'idle') setStatus('idle');
          }}
          placeholder="your@email.com"
          className={`w-full rounded-[4px] border bg-white/10 px-4 py-2.5 text-sm text-cream placeholder:text-cream/60 focus:bg-white/15 focus:outline-none transition-colors ${
            status === 'already_subscribed'
              ? 'border-amber-400/80 focus:border-amber-300'
              : 'border-white/25 focus:border-gold'
          }`}
        />
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={honey}
          onChange={(e) => setHoney(e.target.value)}
          className="hidden"
          aria-hidden="true"
        />
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 rounded-[4px] bg-gold px-5 py-2.5 font-display text-xs font-bold uppercase tracking-[0.12em] text-ink transition-all hover:bg-gold-deep hover:shadow-md disabled:opacity-60 shrink-0"
        >
          <Send aria-hidden className="h-3.5 w-3.5" />
          {busy ? 'Checking…' : 'Subscribe'}
        </button>
      </form>

      {status === 'already_subscribed' && (
        <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 animate-in fade-in">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          Already Subscribed
        </p>
      )}
    </div>
  );
}
