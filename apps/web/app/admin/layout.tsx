'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { AdminShell } from '@/components/admin/AdminShell';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/components/providers/AuthProvider';

/** Protected admin/editor console. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const [bypassed, setBypassed] = useState(false);

  if (!ready) {
    return <div className="container-tsc section-pad pt-32 text-center text-muted">Checking access…</div>;
  }

  if (!user && !bypassed) {
    return (
      <div className="container-tsc section-pad pt-32">
        <div className="card-base mx-auto max-w-md p-8 text-center">
          <ShieldAlert aria-hidden className="mx-auto h-10 w-10 text-gold-deep" />
          <h1 className="mt-4 font-display text-xl font-bold">Newsroom access only</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            This console is for TSC editors and admins. Sign in with an editorial account, or preview the
            console in demo mode.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href="/login" size="md" arrow>Sign In</Button>
            <Button variant="outline" size="md" onClick={() => setBypassed(true)}>
              Preview Demo Console
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted">
            Demo hint: sign in with an email starting with <code className="rounded bg-cream px-1">admin</code> or{' '}
            <code className="rounded bg-cream px-1">editor</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {(!user || user.role === 'member') && (
        <div className="border-b border-gold/50 bg-gold-50 px-4 py-2.5 text-center text-xs font-semibold text-gold-deep">
          Demo preview — admin actions run in this browser only.{' '}
          <Link href="/login" className="underline">Sign in as admin</Link> for the full flow.
        </div>
      )}
      <AdminShell>{children}</AdminShell>
    </>
  );
}
