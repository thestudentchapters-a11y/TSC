'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/common/PageHeader';
import { Field, Input, Checkbox, FormSuccess } from '@/components/forms/Form';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/common/Toast';

export default function LoginPage() {
  const { login } = useAuth();
  const { push } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!email.trim()) {
      errs.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!password) {
      errs.password = 'Please enter your password.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    if (!validate()) return;
    setBusy(true);
    const res = await login(email, password);
    setBusy(false);
    if (res.ok) {
      push('Welcome back to TSC.', 'success');
      window.location.href = email.startsWith('admin') ? '/admin' : '/dashboard';
    } else {
      setGeneralError(res.error ?? 'Invalid email or password. Please try again.');
    }
  };

  return (
    <>
      <PageHeader eyebrow="Account" title="Sign in to TSC." description="Members access the dashboard, saved items and submissions. Editors and admins access the newsroom." />
      <section className="section-pad">
        <div className="container-tsc max-w-md">
          <form onSubmit={submit} className="card-base space-y-5 p-6 sm:p-8" noValidate>
            <Field label="Email" htmlFor="l-email" required error={errors.email}>
              <Input
                id="l-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </Field>
            <Field label="Password" htmlFor="l-pass" required error={errors.password}>
              <Input
                id="l-pass"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                }}
                placeholder="Your password"
                autoComplete="current-password"
              />
            </Field>
            {generalError && (
              <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {generalError}
              </p>
            )}
            <div className="flex items-center justify-between">
              <Checkbox id="l-remember" label="Keep me signed in" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              <span className="text-xs text-muted">Forgot password? [TO BE CONFIGURED]</span>
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={busy} arrow>
              {busy ? 'Signing in…' : 'Sign In'}
            </Button>
            <p className="text-center text-sm text-muted">
              New to TSC?{' '}
              <Link href="/membership" className="cta-underline font-semibold text-brand">
                Become a member
              </Link>
            </p>
          </form>
          <p className="mt-5 rounded-md border border-dashed border-hairline bg-white px-4 py-3 text-center text-xs leading-5 text-muted">
            Demo mode (no API connected): any valid email works; passwords of 6+ characters. Start an email
            with <code className="rounded bg-cream px-1">admin</code> or <code className="rounded bg-cream px-1">editor</code> to preview
            those roles.
          </p>
        </div>
      </section>
    </>
  );
}
