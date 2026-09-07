'use client';

import { useState } from 'react';
import { Home } from 'lucide-react';
import { Field, Input, Checkbox } from '@/components/forms/Form';
import { Button } from '@/components/common/Button';
import { useToast } from '@/components/common/Toast';

const SECTIONS = [
  'Header', 'Hero', "What's Happening Now (Ticker)", 'TSC Introduction', 'Latest News', 'Student Stories',
  'Campus', 'Career & Opportunities', 'Current Affairs', 'Podcast', 'Events', 'Legal Awareness',
  'Flagship Campaign', 'Student Participation', 'Community / Membership', 'WhatsApp / KonnectX', 'Final CTA', 'Footer',
];

export default function AdminHomepagePage() {
  const { push } = useToast();
  const [enabled, setEnabled] = useState<Record<string, boolean>>(Object.fromEntries(SECTIONS.map((s) => [s, true])));
  const [heroKicker, setHeroKicker] = useState("The Student Chapters™ | India's Student & Youth Platform");
  const [campaignHref, setCampaignHref] = useState('/campaigns/all-india-career-awareness');

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow">Configuration</p>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight">Homepage</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          The homepage follows the locked TSC section order. Toggle sections and configure key entry points —
          synced to SiteSettings when the API is connected.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card-base p-6">
          <h2 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.14em]">
            <Home aria-hidden className="h-4 w-4 text-brand" /> Section order &amp; visibility
          </h2>
          <ol className="mt-4 space-y-2">
            {SECTIONS.map((s, i) => (
              <li key={s} className="flex items-center justify-between gap-3 rounded-md border border-hairline bg-cream px-3.5 py-2.5">
                <span className="flex items-center gap-3 text-[13px] font-semibold">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-[4px] bg-gold font-display text-[11px] font-bold text-ink">
                    {String(i).padStart(2, '0')}
                  </span>
                  {s}
                </span>
                <Checkbox
                  id={`sec-${s}`}
                  label={<span className="sr-only">Enable {s}</span>}
                  checked={enabled[s]}
                  onChange={(e) => setEnabled((v) => ({ ...v, [s]: e.target.checked }))}
                />
              </li>
            ))}
          </ol>
        </section>

        <div className="space-y-6">
          <section className="card-base p-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-[0.14em]">Hero settings</h2>
            <div className="mt-4 space-y-5">
              <Field label="Hero eyebrow" htmlFor="hp-kicker">
                <Input id="hp-kicker" value={heroKicker} onChange={(e) => setHeroKicker(e.target.value)} />
              </Field>
              <p className="text-xs text-muted">
                Headline is locked to the brand voice: “Your Campus. Your Voice. Your Future.”
              </p>
            </div>
          </section>
          <section className="card-base p-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-[0.14em]">Campaign highlight</h2>
            <div className="mt-4">
              <Field label="Flagship campaign URL" htmlFor="hp-camp" hint="Shown in the flagship campaign section CTAs">
                <Input id="hp-camp" value={campaignHref} onChange={(e) => setCampaignHref(e.target.value)} />
              </Field>
            </div>
          </section>
          <div className="flex justify-end">
            <Button size="sm" onClick={() => push('Homepage settings saved (demo — persists with connected API).', 'success')} arrow>
              Save Homepage Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
