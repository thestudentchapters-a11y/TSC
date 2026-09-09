'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/common/Toast';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const { push } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      window.location.href = (res.role === 'admin' || res.role === 'editor') ? '/admin' : '/dashboard';
    } else {
      setGeneralError(res.error ?? 'Invalid email or password. Please check your credentials.');
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Account Access"
        title="Sign in to TSC."
        description="Access member features, bookmarks, article submissions, and newsroom editorial tools."
      />

      <section className="section-pad bg-cream/30 min-h-[60vh] flex items-center justify-center py-12 sm:py-16">
        <div className="container-tsc max-w-md w-full px-4">
          <div className="relative overflow-hidden rounded-2xl border border-hairline/80 bg-white shadow-xl shadow-ink/5 transition-all">
            {/* Top gold accent line */}
            <div className="h-1.5 w-full bg-gradient-to-r from-brand via-gold to-brand" />

            <form onSubmit={submit} className="p-7 sm:p-9 space-y-5" noValidate>
              {/* Header badge */}
              <div className="flex items-center justify-between pb-2 border-b border-hairline/40">
                <div>
                  <h2 className="font-display text-xl font-bold text-ink">Welcome back</h2>
                  <p className="text-xs text-muted mt-0.5">Enter your account credentials below</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 text-brand">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </div>

              {/* General Error Banner */}
              {generalError && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50/90 px-3.5 py-3 text-xs text-red-800 animate-in fade-in"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                  <span className="leading-relaxed">{generalError}</span>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-1.5">
                <label htmlFor="l-email" className="block text-xs font-semibold uppercase tracking-wider text-ink/80">
                  Email Address <span className="text-gold-deep">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted/60">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="l-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                    }}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={`w-full rounded-lg border bg-white pl-10 pr-3.5 py-2.5 text-sm text-ink placeholder:text-muted/50 transition-all focus:outline-none focus:ring-2 disabled:bg-cream ${
                      errors.email
                        ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                        : 'border-hairline focus:border-brand focus:ring-brand/15 hover:border-ink/30'
                    }`}
                  />
                </div>
                {errors.email && <p className="text-xs font-medium text-red-600 pl-0.5">{errors.email}</p>}
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label htmlFor="l-pass" className="block text-xs font-semibold uppercase tracking-wider text-ink/80">
                  Password <span className="text-gold-deep">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted/60">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="l-pass"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                    }}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={`w-full rounded-lg border bg-white pl-10 pr-11 py-2.5 text-sm text-ink placeholder:text-muted/50 transition-all focus:outline-none focus:ring-2 disabled:bg-cream ${
                      errors.password
                        ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                        : 'border-hairline focus:border-brand focus:ring-brand/15 hover:border-ink/30'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted/70 hover:text-ink transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs font-medium text-red-600 pl-0.5">{errors.password}</p>}
              </div>

              {/* Aligned Remember Me & Forgot Password Row */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none group">
                  <input
                    id="l-remember"
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-hairline text-brand accent-brand focus:ring-brand/20 cursor-pointer"
                  />
                  <span className="text-xs text-ink/80 group-hover:text-ink font-medium whitespace-nowrap">
                    Remember me
                  </span>
                </label>
                <Link
                  href="/contact"
                  className="text-xs font-medium text-brand hover:text-brand-dark transition-colors hover:underline whitespace-nowrap"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full justify-center shadow-md shadow-brand/15 hover:shadow-lg hover:shadow-brand/20 transition-all"
                disabled={busy}
                arrow
              >
                {busy ? 'Signing in…' : 'Sign In'}
              </Button>

              {/* Bottom Switcher */}
              <div className="pt-2 text-center border-t border-hairline/40 space-y-1.5">
                <p className="text-xs text-muted">
                  New to TSC?{' '}
                  <Link href="/membership" className="font-semibold text-brand hover:text-brand-dark hover:underline">
                    Become a member
                  </Link>
                </p>
                <p className="text-[11px] text-muted/80">
                  Need to verify your email?{' '}
                  <Link href="/verify-email" className="text-brand hover:underline font-medium">
                    Verify or Resend Link
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
