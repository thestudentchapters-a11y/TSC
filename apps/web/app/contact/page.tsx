'use client';

import { useState } from 'react';
import { Globe, Instagram, Mail, MapPin, MessageCircle, Youtube, Linkedin, Facebook } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Field, Input, Textarea, Checkbox, FormSuccess } from '@/components/forms/Form';
import { Button } from '@/components/common/Button';
import { useToast } from '@/components/common/Toast';
import { site } from '@/lib/site';

export default function ContactPage() {
  const { push } = useToast();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [honey, setHoney] = useState('');
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', consent: false });
  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email.';
    if (form.subject.trim().length < 3) e.subject = 'Please add a subject.';
    if (form.message.trim().length < 20) e.message = 'Your message should be at least 20 characters.';
    if (!form.consent) e.consent = 'Please confirm you are happy for us to reply by email.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (honey) return;
    if (!validate()) return;
    setBusy(true);
    try {
      const api = process.env.NEXT_PUBLIC_API_URL;
      if (api) {
        const res = await fetch(`${api}/api/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error((await res.json()).message ?? 'Could not send message');
      } else {
        await new Promise((r) => setTimeout(r, 800));
      }
      setDone(true);
      push('Message sent — the TSC team will reply soon.', 'success');
    } catch (err) {
      push(err instanceof Error ? err.message : 'Could not send message. Please try again.', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Contact Us"
        title="Talk to the TSC Team."
        description="Story tips, campus partnerships, opportunity listings, feedback or just to say hello — we read everything."
      />

      <section className="section-pad">
        <div className="container-tsc grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {done ? (
              <FormSuccess
                title="Message sent."
                message="Thanks for reaching out — the team will get back to you at the email you provided."
                onReset={() => setDone(false)}
                resetLabel="Send another message"
              />
            ) : (
              <form onSubmit={submit} className="card-base space-y-5 p-6 sm:p-8" noValidate>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Name" htmlFor="ct-name" required error={errors.name}>
                    <Input id="ct-name" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Your name" autoComplete="name" />
                  </Field>
                  <Field label="Email" htmlFor="ct-email" required error={errors.email}>
                    <Input id="ct-email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" autoComplete="email" />
                  </Field>
                </div>
                <Field label="Subject" htmlFor="ct-subject" required error={errors.subject}>
                  <Input id="ct-subject" value={form.subject} onChange={(e) => set('subject', e.target.value)} placeholder="What is this about?" />
                </Field>
                <Field label="Message" htmlFor="ct-message" required error={errors.message}>
                  <Textarea id="ct-message" value={form.message} onChange={(e) => set('message', e.target.value)} placeholder="Write your message…" />
                </Field>
                <input type="text" name="website" tabIndex={-1} autoComplete="off" value={honey} onChange={(e) => setHoney(e.target.value)} className="hidden" aria-hidden />
                <Checkbox
                  id="ct-consent"
                  label="I consent to TSC contacting me by email in response to this message."
                  checked={form.consent}
                  onChange={(e) => set('consent', e.target.checked)}
                  error={errors.consent}
                />
                <p className="text-xs text-muted">
                  Protected by rate limiting and spam filtering on the API. Contact email: {site.email}
                </p>
                <div className="flex justify-end border-t border-hairline pt-5">
                  <Button type="submit" size="lg" disabled={busy} arrow>
                    {busy ? 'Sending…' : 'Send Message'}
                  </Button>
                </div>
              </form>
            )}
          </div>

          <aside className="space-y-5 lg:col-span-5">
            <div className="card-base space-y-4 p-6">
              <h2 className="font-display text-base font-bold">Reach us directly</h2>
              <p className="flex items-center gap-3 text-sm text-muted">
                <Mail aria-hidden className="h-4 w-4 text-brand" />
                Email: <a href={`mailto:${site.email}`} className="font-semibold text-ink/85 hover:text-brand hover:underline">{site.email}</a>
              </p>
              <p className="flex items-start gap-3 text-sm text-muted">
                <MapPin aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <span>Office: <span className="font-semibold text-ink/85">{site.address}</span></span>
              </p>
              <div className="flex flex-wrap gap-2.5 border-t border-hairline pt-4">
                {site.konnectxUrl ? (
                  <a href={site.konnectxUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-ink/70 transition-colors hover:border-gold hover:text-gold-deep">
                    <Globe aria-hidden className="h-3.5 w-3.5 text-brand" /> KonnectX
                  </a>
                ) : (
                  <span className="inline-flex cursor-default items-center gap-2 rounded-full border border-dashed border-hairline px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-muted/60" title="Link to be configured">
                    <Globe aria-hidden className="h-3.5 w-3.5" /> KonnectX
                  </span>
                )}
                <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-ink/70 transition-colors hover:border-gold hover:text-gold-deep">
                  <Instagram aria-hidden className="h-3.5 w-3.5 text-brand" /> Instagram
                </a>
                <a href={site.social.youtube} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-ink/70 transition-colors hover:border-gold hover:text-gold-deep">
                  <Youtube aria-hidden className="h-3.5 w-3.5 text-red-600" /> YouTube
                </a>
                <a href={site.social.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-ink/70 transition-colors hover:border-gold hover:text-gold-deep">
                  <Linkedin aria-hidden className="h-3.5 w-3.5 text-blue-700" /> LinkedIn
                </a>
                <a href={site.social.facebook} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-ink/70 transition-colors hover:border-gold hover:text-gold-deep">
                  <Facebook aria-hidden className="h-3.5 w-3.5 text-blue-600" /> Facebook
                </a>
                {site.whatsappUrl ? (
                  <a href={site.whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-ink/70 transition-colors hover:border-gold hover:text-gold-deep">
                    <MessageCircle aria-hidden className="h-3.5 w-3.5 text-emerald-600" /> WhatsApp
                  </a>
                ) : (
                  <span className="inline-flex cursor-default items-center gap-2 rounded-full border border-dashed border-hairline px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-muted/60" title="Link to be configured">
                    <MessageCircle aria-hidden className="h-3.5 w-3.5" /> WhatsApp
                  </span>
                )}
              </div>
            </div>
            <div className="rounded-md border border-brand/20 bg-brand-50 p-6">
              <h2 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-brand">For campuses &amp; organisations</h2>
              <p className="mt-2 text-[13.5px] leading-6 text-ink/70">
                Want to list opportunities, co-host events or start a TSC chapter on your campus? Mention
                your institution in the subject line and we&apos;ll route it to the right team.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
