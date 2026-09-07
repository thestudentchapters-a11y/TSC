'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { useToast } from '@/components/common/Toast';

/** Footer newsletter signup — honeypot spam protection + animated feedback. */
export function NewsletterForm() {
  const { push } = useToast();
  const [email, setEmail] = useState('');
  const [honey, setHoney] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (honey) return; // bot trap
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      push('Please enter a valid email address.', 'error');
      return;
    }
    setBusy(true);
    try {
      const api = process.env.NEXT_PUBLIC_API_URL;
      if (api) {
        const res = await fetch(`${api}/api/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Newsletter subscriber', email, subject: 'Newsletter signup', message: `Subscribe: ${email}` }),
        });
        if (!res.ok) throw new Error();
      } else {
        await new Promise((r) => setTimeout(r, 700)); // demo latency
      }
      setDone(true);
      push('You are on the list. No noise. Just things worth knowing.', 'success');
    } catch {
      push('Could not subscribe right now. Please try again.', 'error');
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <p className="flex items-center gap-2 rounded-md border border-gold/40 bg-gold-50 px-4 py-3 text-sm font-semibold text-gold-deep">
        <span aria-hidden className="inline-block h-2 w-2 animate-pulse-dot rounded-full bg-gold" />
        Subscribed — welcome to TSC.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row" noValidate>
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="w-full rounded-[4px] border border-white/25 bg-white/10 px-4 py-2.5 text-sm text-cream placeholder:text-cream/60 focus:border-gold focus:bg-white/15 focus:outline-none"
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
        className="inline-flex items-center justify-center gap-2 rounded-[4px] bg-gold px-5 py-2.5 font-display text-xs font-bold uppercase tracking-[0.12em] text-ink transition-all hover:bg-gold-deep hover:shadow-md disabled:opacity-60"
      >
        <Send aria-hidden className="h-3.5 w-3.5" />
        {busy ? 'Subscribing…' : 'Subscribe'}
      </button>
    </form>
  );
}
