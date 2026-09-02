'use client';

import { useState } from 'react';
import { Bell, HeartHandshake, Megaphone, Sparkles, Users } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Field, Input, Select, Checkbox, FormSuccess } from '@/components/forms/Form';
import { Button } from '@/components/common/Button';
import { useAuth, type RegisterPayload } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/common/Toast';

const BENEFITS = [
  { icon: Megaphone, title: 'BE HEARD', desc: 'Share your ideas, stories and experiences.' },
  { icon: Sparkles, title: 'BE DISCOVERED', desc: 'Showcase your work, achievements and initiatives.' },
  { icon: Users, title: 'BE CONNECTED', desc: 'Meet students from different campuses and communities.' },
  { icon: Bell, title: 'BE INFORMED', desc: 'Get access to stories, opportunities, events and resources.' },
  { icon: HeartHandshake, title: 'BE INVOLVED', desc: 'Participate in campaigns, events and initiatives.' },
];

const INTERESTS = ['News & Current Affairs', 'Startups & Entrepreneurship', 'Technology', 'Design & Media', 'Research & Academia', 'Sports & Culture', 'Social Impact', 'Podcasts & Content', 'Events & Community', 'Career Development'];
const STATES = ['Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Other'];

export default function MembershipPage() {
  const { register } = useAuth();
  const { push } = useToast();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: '', email: '', phone: '', dob: '', college: '', course: '', graduationYear: '',
    city: '', state: '', linkedin: '', instagram: '', password: '',
    interests: [] as string[], skills: '', consent: false,
  });
  const set = (k: string, v: string | boolean | string[]) => setForm((f) => ({ ...f, [k]: v }));

  const toggleInterest = (i: string) =>
    set('interests', form.interests.includes(i) ? form.interests.filter((x) => x !== i) : [...form.interests, i]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 3) e.name = 'Please enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email.';
    if (form.phone && !/^[\d+\-\s]{8,15}$/.test(form.phone)) e.phone = 'Please enter a valid phone number.';
    if (!form.college.trim()) e.college = 'Please enter your college or university.';
    if (!form.city.trim()) e.city = 'Please enter your city.';
    if (!form.state) e.state = 'Please select your state.';
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters.';
    if (!form.consent) e.consent = 'Please accept the membership terms to continue.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setBusy(true);
    const payload: RegisterPayload = {
      name: form.name, email: form.email, password: form.password, phone: form.phone,
      college: form.college, course: form.course, graduationYear: form.graduationYear,
      city: form.city, state: form.state, interests: form.interests.join(', '), skills: form.skills,
    };
    const res = await register(payload);
    setBusy(false);
    if (res.ok) {
      setDone(true);
      push('Welcome to THE STUDENT CHAPTERS — your chapter starts now.', 'success');
    } else {
      push(res.error ?? 'Registration failed. Please try again.', 'error');
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="10 — Join the Movement"
        title="Become a TSC Member."
        description="Join a network of students, campus communities, creators, entrepreneurs and young professionals who believe that young voices deserve a bigger platform."
      />

      <section className="section-pad">
        <div className="container-tsc grid gap-12 lg:grid-cols-12">
          {/* benefits */}
          <div className="space-y-5 lg:col-span-4">
            <h2 className="font-display text-xl font-bold">Membership gives you a bigger platform.</h2>
            {BENEFITS.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.title} className="card-base card-hover flex items-start gap-4 p-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand/20 bg-brand-50 text-brand">
                    <Icon aria-hidden className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-[12.5px] font-bold uppercase tracking-[0.16em]">{b.title}</h3>
                    <p className="mt-1 text-[13px] leading-5 text-muted">{b.desc}</p>
                  </div>
                </div>
              );
            })}
            <p className="rounded-md border border-hairline bg-white p-4 text-xs leading-5 text-muted">
              Membership accounts are secured with hashed passwords and JWT sessions. In demo mode (no API
              connected), your details stay in this browser only.
            </p>
          </div>

          {/* form */}
          <div className="lg:col-span-8">
            {done ? (
              <FormSuccess
                title="Your Chapter Starts Here."
                message="Your membership has been created. Explore your member dashboard, save stories and opportunities, and submit your first story to the newsroom."
                onReset={() => setDone(false)}
                resetLabel="Register another member"
              />
            ) : (
              <form onSubmit={submit} className="card-base space-y-5 p-6 sm:p-8" noValidate>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Full name" htmlFor="m-name" required error={errors.name}>
                    <Input id="m-name" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Your full name" autoComplete="name" />
                  </Field>
                  <Field label="Email" htmlFor="m-email" required error={errors.email}>
                    <Input id="m-email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" autoComplete="email" />
                  </Field>
                  <Field label="Phone" htmlFor="m-phone" error={errors.phone}>
                    <Input id="m-phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+91…" autoComplete="tel" />
                  </Field>
                  <Field label="Date of birth (optional)" htmlFor="m-dob">
                    <Input id="m-dob" type="date" value={form.dob} onChange={(e) => set('dob', e.target.value)} />
                  </Field>
                  <Field label="College / University" htmlFor="m-college" required error={errors.college}>
                    <Input id="m-college" value={form.college} onChange={(e) => set('college', e.target.value)} placeholder="e.g. Nalanda Institute of Technology" />
                  </Field>
                  <Field label="Course / Programme" htmlFor="m-course">
                    <Input id="m-course" value={form.course} onChange={(e) => set('course', e.target.value)} placeholder="e.g. B.Tech CSE, 2nd year" />
                  </Field>
                  <Field label="Graduation year" htmlFor="m-gy">
                    <Select id="m-gy" value={form.graduationYear} onChange={(e) => set('graduationYear', e.target.value)}>
                      <option value="">Select year</option>
                      {Array.from({ length: 8 }, (_, i) => 2026 + i).map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="City" htmlFor="m-city" required error={errors.city}>
                    <Input id="m-city" value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Your city" />
                  </Field>
                  <Field label="State" htmlFor="m-state" required error={errors.state}>
                    <Select id="m-state" value={form.state} onChange={(e) => set('state', e.target.value)}>
                      <option value="">Select state</option>
                      {STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Password" htmlFor="m-pass" required error={errors.password} hint="Minimum 8 characters. Stored hashed (bcrypt) on the API.">
                    <Input id="m-pass" type="password" value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="Create a password" autoComplete="new-password" />
                  </Field>
                  <Field label="LinkedIn (optional)" htmlFor="m-li">
                    <Input id="m-li" value={form.linkedin} onChange={(e) => set('linkedin', e.target.value)} placeholder="linkedin.com/in/…" />
                  </Field>
                  <Field label="Instagram (optional)" htmlFor="m-ig">
                    <Input id="m-ig" value={form.instagram} onChange={(e) => set('instagram', e.target.value)} placeholder="@yourhandle" />
                  </Field>
                </div>

                <Field label="Interests" htmlFor="m-interests">
                  <div id="m-interests" className="flex flex-wrap gap-2 pt-1">
                    {INTERESTS.map((i) => {
                      const active = form.interests.includes(i);
                      return (
                        <button
                          key={i}
                          type="button"
                          aria-pressed={active}
                          onClick={() => toggleInterest(i)}
                          className={`rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition-all ${
                            active ? 'border-brand bg-brand text-white' : 'border-hairline bg-white text-ink/70 hover:border-brand hover:text-brand'
                          }`}
                        >
                          {i}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                <Field label="Skills (optional)" htmlFor="m-skills" hint="Comma separated — e.g. writing, design, Python">
                  <Input id="m-skills" value={form.skills} onChange={(e) => set('skills', e.target.value)} placeholder="writing, design, public speaking…" />
                </Field>

                <Field label="Profile photo (optional)" htmlFor="m-photo">
                  <Input id="m-photo" type="file" accept="image/*" disabled title="Uploads are enabled once media storage is configured" />
                  <p className="mt-1 text-xs text-muted">File uploads activate when the API + media storage are connected.</p>
                </Field>

                <Checkbox
                  id="m-consent"
                  label="I consent to joining THE STUDENT CHAPTERS community and agree to be contacted about membership, opportunities and TSC initiatives. I understand I can opt out anytime."
                  checked={form.consent}
                  onChange={(e) => set('consent', e.target.checked)}
                  error={errors.consent}
                />

                <div className="flex items-center justify-end gap-3 border-t border-hairline pt-5">
                  <Button type="submit" size="lg" disabled={busy} arrow>
                    {busy ? 'Creating Membership…' : 'Become a Member'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
