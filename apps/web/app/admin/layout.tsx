'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldAlert, Lock, ArrowLeft, Shield } from 'lucide-react';
import { AdminShell } from '@/components/admin/AdminShell';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/components/providers/AuthProvider';
import { canAccessRoute } from '@/lib/permissions';

/** Protected admin/editor newsroom console. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const pathname = usePathname();

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

  // Check granular permission for the active route
  const isAllowed = canAccessRoute(user, pathname);

  if (!isAllowed) {
    return (
      <AdminShell>
        <div className="mx-auto max-w-xl py-12">
          <div className="card-base border border-hairline/80 bg-white p-8 text-center shadow-lift">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Lock aria-hidden className="h-7 w-7" />
            </div>
            <p className="mt-4 font-display text-xs font-bold uppercase tracking-[0.16em] text-red-600">
              Access Restricted
            </p>
            <h1 className="mt-1 font-display text-xl font-bold text-ink">
              Permission Required
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Your Editor account does not have permission to view or manage this section. If you need access, please ask a platform <span className="font-semibold text-ink">Administrator</span> to grant you the required permissions via the <span className="font-semibold text-ink">Team &amp; Editors</span> console.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Button href="/admin" size="md" variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </AdminShell>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
