'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, AlertCircle, Mail, ArrowRight, RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useToast } from '@/components/common/Toast';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const emailParam = searchParams.get('email') || '';
  const { push } = useToast();

  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'idle'>(token ? 'verifying' : 'idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token) {
      verifyToken(token);
    }
  }, [token]);

  async function verifyToken(t: string) {
    setLoading(true);
    setStatus('verifying');
    try {
      const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${api}/api/auth/verify-email?token=${encodeURIComponent(t)}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('success');
        setMessage(data.message || 'Your email address has been verified.');
        push('Email verified successfully!', 'success');
      } else {
        setStatus('error');
        setMessage(data.error || 'Verification link is invalid or expired.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error while verifying email. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function verifyWithCode(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() && !token) {
      push('Please enter the 6-digit verification code or click the email link.', 'error');
      return;
    }
    setLoading(true);
    try {
      const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${api}/api/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), token }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('success');
        setMessage('Your email address has been verified.');
        push('Email verified successfully!', 'success');
      } else {
        setStatus('error');
        setMessage(data.error || 'Invalid or expired verification code.');
        push(data.error || 'Verification failed', 'error');
      }
    } catch {
      push('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      push('Please enter a valid email address to resend.', 'error');
      return;
    }
    setResending(true);
    try {
      const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${api}/api/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        push(data.message || 'Verification email sent! Check your inbox.', 'success');
        setMessage('A fresh verification link & code have been sent to your email.');
      } else {
        push(data.error || 'Failed to resend verification email.', 'error');
      }
    } catch {
      push('Network error while resending. Please try again.', 'error');
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-16 px-4 bg-cream/30">
      <div className="max-w-md w-full rounded-2xl border border-hairline/80 bg-white shadow-xl shadow-ink/5 p-7 sm:p-9 text-center">
        {status === 'verifying' && (
          <div className="space-y-4 py-8">
            <RefreshCw className="h-10 w-10 text-brand animate-spin mx-auto" />
            <h2 className="font-display text-xl font-bold text-ink">Verifying Email Address…</h2>
            <p className="text-xs text-muted">Please wait a moment while we validate your verification token.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-ink">Email Verified!</h2>
              <p className="text-sm text-muted mt-1.5">{message || 'Your account is now fully verified.'}</p>
            </div>
            <div className="pt-3">
              <Link href="/dashboard">
                <Button size="lg" className="w-full justify-center" arrow>
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertCircle className="h-8 w-8" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-ink">Verification Failed</h2>
              <p className="text-xs text-red-700 mt-1 bg-red-50 p-2.5 rounded-lg border border-red-200">
                {message || 'The verification link has expired or is invalid.'}
              </p>
            </div>

            <div className="border-t border-hairline/60 pt-4 space-y-3 text-left">
              <label htmlFor="resend-email" className="block text-xs font-semibold uppercase tracking-wider text-ink/80">
                Need a new link? Enter Email:
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted/60" />
                <input
                  id="resend-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full rounded-lg border border-hairline bg-white pl-9 pr-3.5 py-2 text-sm text-ink placeholder:text-muted/50 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
                />
              </div>
              <Button
                type="button"
                onClick={handleResend}
                disabled={resending}
                size="md"
                className="w-full justify-center"
              >
                {resending ? 'Sending…' : 'Resend Verification Email'}
              </Button>
            </div>

            <div className="pt-2 text-center">
              <Link href="/login" className="text-xs font-semibold text-brand hover:underline">
                Back to Sign In
              </Link>
            </div>
          </div>
        )}

        {status === 'idle' && (
          <div className="space-y-5 text-left">
            <div className="text-center pb-2 border-b border-hairline/50">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand mb-2">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h2 className="font-display text-xl font-bold text-ink">Account Verification</h2>
              <p className="text-xs text-muted mt-0.5">Enter your 6-digit code or request a new verification email</p>
            </div>

            <form onSubmit={verifyWithCode} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink/80">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. 123456"
                  className="w-full text-center tracking-[0.3em] font-mono text-lg font-bold rounded-lg border border-hairline bg-white px-3.5 py-2.5 text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
                />
              </div>

              <Button type="submit" disabled={loading} size="lg" className="w-full justify-center">
                {loading ? 'Validating…' : 'Verify Code'}
              </Button>
            </form>

            <div className="border-t border-hairline/60 pt-4 space-y-3">
              <label htmlFor="manual-email" className="block text-xs font-semibold uppercase tracking-wider text-ink/80">
                Didn&apos;t receive it? Resend Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted/60" />
                <input
                  id="manual-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full rounded-lg border border-hairline bg-white pl-9 pr-3.5 py-2 text-sm text-ink placeholder:text-muted/50 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleResend}
                disabled={resending}
                size="sm"
                className="w-full justify-center"
              >
                {resending ? 'Sending…' : 'Resend Verification Email'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-muted">Loading verification...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
