'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/common/PageHeader';
import { Field, Input, FormSuccess } from '@/components/forms/Form';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/common/Toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const { push } = useToast();
  const [form, setForm] = useState({ name: '', email: '', college: '', city: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 3) e.name = 'Please enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email.';
    if (!form.college.trim()) e.college = 'Please enter your college or university.';
    if (!form.city.trim()) e.city = 'Please enter your city.';
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    const res = await register(form);
    setBusy(false);
    if (res.ok) {
      setDone(true);
      push('Account created — welcome to TSC.', 'success');
    } else {
      push(res.error ?? 'Registration failed.', 'error');
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Create your TSC account."
        description="A quick account for community access. For the full membership profile (interests, skills, dashboard perks), complete membership after this."
      />
      <section className="section-pad">
        <div className="container-tsc max-w-md">
          {done ? (
            <FormSuccess
              title="Account created."
              message="You are in. Head to your dashboard to explore member features — or complete your full membership profile."
              onReset={() => router.push('/dashboard')}
              resetLabel="Open Dashboard"
            />
          ) : (
            <form onSubmit={submit} className="card-base space-y-5 p-6 sm:p-8" noValidate>
              <Field label="Full name" htmlFor="r-name" required error={errors.name}>
                <Input id="r-name" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Your full name" autoComplete="name" />
              </Field>
              <Field label="Email" htmlFor="r-email" required error={errors.email}>
                <Input id="r-email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" autoComplete="email" />
              </Field>
              <Field label="College / University" htmlFor="r-college" required error={errors.college}>
                <Input id="r-college" value={form.college} onChange={(e) => set('college', e.target.value)} placeholder="Your institution" />
              </Field>
              <Field label="City" htmlFor="r-city" required error={errors.city}>
                <Input id="r-city" value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Your city" />
              </Field>
              <Field label="Password" htmlFor="r-pass" required error={errors.password} hint="Minimum 8 characters.">
                <Input id="r-pass" type="password" value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="Create a password" autoComplete="new-password" />
              </Field>
              <Button type="submit" size="lg" className="w-full" disabled={busy} arrow>
                {busy ? 'Creating account…' : 'Create Account'}
              </Button>
              <p className="text-center text-sm text-muted">
                Already a member?{' '}
                <Link href="/login" className="cta-underline font-semibold text-brand">
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
