'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ExternalLink, LayoutDashboard, Menu, X, LogOut, User, Shield } from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { adminNavGroups } from '@/lib/admin-collections';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/common/Toast';
import { cn } from '@/lib/utils';

/** Admin shell — sidebar navigation + user profile & logout + content area. */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { push } = useToast();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    push('You have been logged out of the Newsroom console.', 'info');
    router.push('/login');
  };

  const nav = (
    <nav aria-label="Admin" className="flex-1 space-y-6 overflow-y-auto px-3 py-5 [scrollbar-width:thin]">
      {adminNavGroups.map((g) => (
        <div key={g.label}>
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cream/40">{g.label}</p>
          <ul className="space-y-0.5">
            {g.items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-2.5 rounded-[4px] px-3 py-2 text-[13px] font-medium transition-colors',
                      active ? 'bg-gold text-ink font-semibold' : 'text-cream/75 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    <Icon aria-hidden className={cn('h-4 w-4', active ? 'text-ink' : 'text-cream/60')} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  const userFooter = (
    <div className="border-t border-white/10 bg-black/20 p-4">
      {user && (
        <div className="mb-3 flex items-center gap-3 rounded-md bg-white/[0.04] p-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold font-display text-sm font-bold text-ink">
            {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white">{user.name || 'Admin User'}</p>
            <p className="truncate text-[11px] text-cream/50">{user.email}</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded bg-gold/20 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-gold">
            <Shield className="h-2.5 w-2.5" />
            {user.role}
          </span>
        </div>
      )}
      <div className="flex flex-col gap-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 rounded-[4px] px-3 py-1.5 text-[12px] font-semibold text-cream/70 transition-colors hover:text-gold hover:bg-white/[0.05]"
        >
          <ExternalLink aria-hidden className="h-3.5 w-3.5" /> View live site
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-[4px] px-3 py-1.5 text-left text-[12px] font-semibold text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut aria-hidden className="h-3.5 w-3.5" /> Log Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-cream pt-16">
      {/* desktop sidebar */}
      <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 flex-col bg-brand-dark lg:flex">
        <div className="border-b border-white/10 px-5 py-4">
          <p className="font-display text-sm font-bold uppercase tracking-[0.16em] text-gold">TSC Newsroom</p>
          <p className="mt-1 text-[11px] text-cream/50">Admin &amp; editorial console</p>
        </div>
        {nav}
        {userFooter}
      </aside>

      {/* mobile toggle */}
      <button
        type="button"
        aria-label={open ? 'Close admin menu' : 'Open admin menu'}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 left-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-brand-dark text-gold shadow-lift lg:hidden"
      >
        {open ? <X aria-hidden className="h-5 w-5" /> : <Menu aria-hidden className="h-5 w-5" />}
      </button>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 top-16 flex flex-col bg-brand-dark/95 backdrop-blur">
            {nav}
            {userFooter}
          </div>
        </div>
      )}

      <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-10">{children}</main>
    </div>
  );
}
