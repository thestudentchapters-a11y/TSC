'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ExternalLink, LayoutDashboard, Menu, X } from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { adminNavGroups } from '@/lib/admin-collections';
import { cn } from '@/lib/utils';

/** Admin shell — sidebar navigation + content area. */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav aria-label="Admin" className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
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
                      active ? 'bg-gold text-ink' : 'text-cream/75 hover:bg-white/10 hover:text-white'
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

  return (
    <div className="flex min-h-screen bg-cream pt-16">
      {/* desktop sidebar */}
      <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 flex-col bg-brand-dark lg:flex">
        <div className="border-b border-white/10 px-5 py-4">
          <p className="font-display text-sm font-bold uppercase tracking-[0.16em] text-gold">TSC Newsroom</p>
          <p className="mt-1 text-[11px] text-cream/50">Admin &amp; editorial console</p>
        </div>
        {nav}
        <div className="border-t border-white/10 p-4">
          <Link href="/" target="_blank" className="flex items-center gap-2 rounded-[4px] px-3 py-2 text-[12px] font-semibold text-cream/60 transition-colors hover:text-gold">
            <ExternalLink aria-hidden className="h-3.5 w-3.5" /> View live site
          </Link>
        </div>
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
          <div className="absolute inset-0 top-16 bg-brand-dark/95 backdrop-blur">
            {nav}
          </div>
        </div>
      )}

      <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-10">{children}</main>
    </div>
  );
}
