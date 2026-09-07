'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Field, Input, Select, Textarea, Checkbox, FormSuccess } from '@/components/forms/Form';
import { Button } from '@/components/common/Button';
import { useToast } from '@/components/common/Toast';

const CATEGORIES = ['Campus News', 'Campus Event', 'Achievement', 'Club / Community', 'Student Initiative', 'Fest / Culture', 'Sports', 'Other'];
const STATES = ['Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Other'];

export default function ShareCampusNewsPage() {
  const { push } = useToast();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [honey, setHoney] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', college: '', campus: '', city: '', state: '',
    title: '', category: '', description: '', eventDate: '', links: '', consent: false,
  });
  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 3) e.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email.';
    if (!form.college.trim()) e.college = 'Please enter your college or university.';
    if (!form.campus.trim()) e.campus = 'Please enter the campus this news is from.';
    if (!form.city.trim()) e.city = 'Please enter your city.';
    if (!form.state) e.state = 'Please select your state.';
    if (form.title.trim().length < 6) e.title = 'Give the news a clear headline (at least 6 characters).';
    if (!form.category) e.category = 'Choose a news category.';
    if (form.description.trim().length < 80) e.description = 'Add a bit more detail — at least 80 characters.';
    if (form.links.trim() && !/^(https?:\/\/|\/|www\.).+/i.test(form.links.trim())) {
      e.links = 'Please enter a valid link starting with http://, https://, or www.';
    }
    if (!form.consent) e.consent = 'Please confirm consent so we can review your submission.';
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
        const res = await fetch(`${api}/api/submissions/campus`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error((await res.json()).message ?? 'Submission failed');
      } else {
        await new Promise((r) => setTimeout(r, 900));
      }
      setDone(true);
      push('Campus news submitted — it is now in the review queue.', 'success');
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
        title="🏫 Share Campus News"
        description="Organising an event? Launching an initiative? Celebrating an achievement? Building a student community? Tell us what's happening at your campus."
      />

      <section className="section-pad">
        <div className="container-tsc max-w-3xl">
          {done ? (
            <FormSuccess
              title="Campus news received."
              message="Your submission has entered the TSC review queue. Editors verify and format campus updates before they go live on the Campus directory."
              onReset={() => setDone(false)}
              resetLabel="Submit more news"
            />
          ) : (
            <form onSubmit={submit} className="card-base space-y-5 p-6 sm:p-8" noValidate>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Your name" htmlFor="c-name" required error={errors.name}>
                  <Input id="c-name" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Full name" autoComplete="name" />
                </Field>
                <Field label="Email" htmlFor="c-email" required error={errors.email}>
                  <Input id="c-email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" autoComplete="email" />
                </Field>
                <Field label="College / University" htmlFor="c-college" required error={errors.college}>
                  <Input id="c-college" value={form.college} onChange={(e) => set('college', e.target.value)} placeholder="Your institution" />
                </Field>
                <Field label="Campus" htmlFor="c-campus" required error={errors.campus}>
                  <Input id="c-campus" value={form.campus} onChange={(e) => set('campus', e.target.value)} placeholder="Campus name (if different)" />
                </Field>
                <Field label="City" htmlFor="c-city" required error={errors.city}>
                  <Input id="c-city" value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Your city" />
                </Field>
                <Field label="State" htmlFor="c-state" required error={errors.state}>
                  <Select id="c-state" value={form.state} onChange={(e) => set('state', e.target.value)}>
                    <option value="">Select state</option>
                    {STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </Select>
                </Field>
              </div>

              <Field label="News headline" htmlFor="c-title" required error={errors.title}>
                <Input id="c-title" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Our campus just launched a student radio station" />
              </Field>

              <Field label="Category" htmlFor="c-cat" required error={errors.category}>
                <Select id="c-cat" value={form.category} onChange={(e) => set('category', e.target.value)}>
                  <option value="">Choose category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>
              </Field>

              <Field label="What's happening?" htmlFor="c-desc" required error={errors.description} hint="The who, what, when and why of your campus news. (min 80 characters)">
                <Textarea id="c-desc" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Describe the news, event or initiative…" className="min-h-[160px]" />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Event date (optional)" htmlFor="c-date">
                  <Input id="c-date" type="date" value={form.eventDate} onChange={(e) => set('eventDate', e.target.value)} />
                </Field>
                <Field label="Supporting links (optional)" htmlFor="c-links" error={errors.links}>
                  <Input id="c-links" value={form.links} onChange={(e) => set('links', e.target.value)} placeholder="Instagram post, registration link…" />
                </Field>
              </div>

              <Field label="Images" htmlFor="c-images">
                <Input id="c-images" type="file" accept="image/*" multiple disabled title="Uploads are enabled once media storage is configured" />
                <p className="mt-1 text-xs text-muted">Image uploads activate when the API + media storage are connected.</p>
              </Field>

              <input type="text" name="website" tabIndex={-1} autoComplete="off" value={honey} onChange={(e) => setHoney(e.target.value)} className="hidden" aria-hidden />

              <Checkbox
                id="c-consent"
                label="I confirm this information is accurate to the best of my knowledge, and I consent to TSC reviewing and publishing it with credit."
                checked={form.consent}
                onChange={(e) => set('consent', e.target.checked)}
                error={errors.consent}
              />

              <div className="flex items-center justify-end gap-3 border-t border-hairline pt-5">
                <Button type="submit" size="lg" disabled={busy} arrow>
                  {busy ? 'Submitting…' : 'Submit Campus News'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
