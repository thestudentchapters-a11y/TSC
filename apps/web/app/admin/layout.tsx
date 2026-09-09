'use client';

import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { AdminShell } from '@/components/admin/AdminShell';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/components/providers/AuthProvider';

/** Protected admin/editor newsroom console. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();

  if (!ready) {
    return <div className="container-tsc section-pad pt-32 text-center text-muted">Checking access…</div>;
  }

  // Restrict access strictly to authenticated editors and administrators
  if (!user || (user.role !== 'admin' && user.role !== 'editor')) {
    return (
      <div className="container-tsc section-pad pt-32">
        <div className="card-base mx-auto max-w-md p-8 text-center shadow-lift">
          <ShieldAlert aria-hidden className="mx-auto h-12 w-12 text-brand" />
          <h1 className="mt-4 font-display text-xl font-bold text-ink">Newsroom Access Restricted</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            This console is strictly for authorized The Student Chapters™ editors and administrators. Please sign in with your official account.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href="/login" size="md" arrow>Sign In to Newsroom</Button>
          </div>
        </div>
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
