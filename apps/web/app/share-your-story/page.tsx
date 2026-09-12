'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Field, Input, Select, Textarea, Checkbox, FormSuccess } from '@/components/forms/Form';
import { Button } from '@/components/common/Button';
import { useToast } from '@/components/common/Toast';

const CATEGORIES = ['Achievement', 'Startup / Entrepreneurship', 'Project or Research', 'Social Initiative', 'Art / Creative Work', 'Failure & Learning', 'Campus Life', 'Other'];
const STATES = ['Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Other'];

export default function ShareYourStoryPage() {
  const { push } = useToast();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [honey, setHoney] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', phone: '', college: '', city: '', state: '',
    title: '', category: '', content: '', videoUrl: '', social: '', consent: false,
  });
  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 3) e.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email.';
    if (form.phone.trim() && !/^[\d+\-\s()]{8,18}$/.test(form.phone.trim())) {
      e.phone = 'Please enter a valid phone number (at least 8 digits).';
    }
    if (!form.college.trim()) e.college = 'Please enter your college, university, or school.';
    if (!form.city.trim()) e.city = 'Please enter your city.';
    if (!form.state) e.state = 'Please select your state.';
    if (form.title.trim().length < 6) e.title = 'Give your story a title (at least 6 characters).';
    if (!form.category) e.category = 'Choose a story category.';
    if (form.content.trim().length < 100) e.content = 'Tell us a bit more — at least 100 characters.';
    if (form.videoUrl.trim() && !/^(https?:\/\/|\/|www\.).+/i.test(form.videoUrl.trim())) {
      e.videoUrl = 'Please enter a valid video link starting with http:// or https://.';
    }
    if (!form.consent) e.consent = 'Please confirm consent so we can review your story.';
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
        const res = await fetch(`${api}/api/submissions/story`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error((await res.json()).message ?? 'Submission failed');
      } else {
        await new Promise((r) => setTimeout(r, 900));
      }
      setDone(true);
      push('Story submitted — our editors will review it soon.', 'success');
    } catch (err) {
      push(err instanceof Error ? err.message : 'Submission failed. Please try again.', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="09 — Your Voice Matters"
        title="✍️ Share Your Story"
        description="Built something? Won something? Failed at something? Started again? Discovered something new? Tell us your story — your journey could inspire someone else."
      />

      <section className="section-pad">
        <div className="container-tsc max-w-3xl">
          {done ? (
            <FormSuccess
              title="Thank you for sharing."
              message="Your story has entered the TSC editorial review queue. Our editors read every submission — if it's a fit, we'll reach out before publishing."
              onReset={() => setDone(false)}
              resetLabel="Submit another story"
            />
          ) : (
            <form onSubmit={submit} className="card-base space-y-5 p-6 sm:p-8" noValidate>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Your name" htmlFor="s-name" required error={errors.name}>
                  <Input id="s-name" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Full name" autoComplete="name" />
                </Field>
                <Field label="Email" htmlFor="s-email" required error={errors.email}>
                  <Input id="s-email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" autoComplete="email" />
                </Field>
                <Field label="Phone (optional)" htmlFor="s-phone" error={errors.phone}>
                  <Input id="s-phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+91…" autoComplete="tel" />
                </Field>
                <Field label="College / University / School" htmlFor="s-college" required error={errors.college}>
                  <Input id="s-college" value={form.college} onChange={(e) => set('college', e.target.value)} placeholder="Your institution" />
                </Field>
                <Field label="City" htmlFor="s-city" required error={errors.city}>
                  <Input id="s-city" value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Your city" />
                </Field>
                <Field label="State" htmlFor="s-state" required error={errors.state}>
                  <Select id="s-state" value={form.state} onChange={(e) => set('state', e.target.value)}>
                    <option value="">Select state</option>
                    {STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </Select>
                </Field>
              </div>

              <Field label="Story title" htmlFor="s-title" required error={errors.title}>
                <Input id="s-title" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. How our team built a flood-alert prototype" />
              </Field>

              <Field label="Story category" htmlFor="s-cat" required error={errors.category}>
                <Select id="s-cat" value={form.category} onChange={(e) => set('category', e.target.value)}>
                  <option value="">Choose category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>
              </Field>

              <Field label="Your story" htmlFor="s-content" required error={errors.content} hint="Where did it start? What happened along the way? What did you learn? (min 100 characters)">
                <Textarea id="s-content" value={form.content} onChange={(e) => set('content', e.target.value)} placeholder="Tell us the journey — the beginning, the struggles, the turning points…" className="min-h-[180px]" />
              </Field>

              <Field label="Images" htmlFor="s-images">
                <Input id="s-images" type="file" accept="image/*" multiple disabled title="Uploads are enabled once media storage is configured" />
                <p className="mt-1 text-xs text-muted">Image uploads activate when the API + media storage are connected.</p>
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Video URL (optional)" htmlFor="s-video" error={errors.videoUrl}>
                  <Input id="s-video" value={form.videoUrl} onChange={(e) => set('videoUrl', e.target.value)} placeholder="https://..." />
                </Field>
                <Field label="KonnectX ID / Social links (optional)" htmlFor="s-social" hint="KonnectX ID preferred">
                  <Input id="s-social" value={form.social} onChange={(e) => set('social', e.target.value)} placeholder="KonnectX ID (@handle) / LinkedIn / X" />
                </Field>
              </div>

              <input type="text" name="website" tabIndex={-1} autoComplete="off" value={honey} onChange={(e) => setHoney(e.target.value)} className="hidden" aria-hidden />

              <Checkbox
                id="s-consent"
                label="I confirm this story is my own, and I consent to TSC reviewing, editing and publishing it with credit to me."
                checked={form.consent}
                onChange={(e) => set('consent', e.target.checked)}
                error={errors.consent}
              />

              <div className="flex items-center justify-end gap-3 border-t border-hairline pt-5">
                <Button type="submit" size="lg" disabled={busy} arrow>
                  {busy ? 'Submitting…' : 'Share Your Story'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
