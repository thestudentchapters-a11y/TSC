'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ExternalLink, Menu, X, LogOut, Shield, ShieldCheck } from 'lucide-react';
import { adminNavGroups } from '@/lib/admin-collections';
import { filterNavGroups, getUserPermissions } from '@/lib/permissions';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/common/Toast';
import { cn } from '@/lib/utils';
import { AdminFooter } from '@/components/admin/AdminFooter';

/**
 * Admin shell — simple admin navbar with user details + sidebar + content area + custom footer strip.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { push } = useToast();
  const [open, setOpen] = useState(false);

  const visibleNavGroups = useMemo(() => filterNavGroups(adminNavGroups, user), [user]);
  const userPerms = useMemo(() => getUserPermissions(user), [user]);

  const handleLogout = () => {
    logout();
    push('You have been logged out of the Newsroom console.', 'info');
    router.push('/login');
  };

  const userEmail = user?.email || '';
  const userName = user?.name || 'Admin User';

  const nav = (
    <nav aria-label="Admin Navigation" className="flex-1 space-y-6 overflow-y-auto px-3 py-5 [scrollbar-width:thin]">
      {visibleNavGroups.map((g) => (
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

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      {/* Simple Admin Top Navbar */}
      <header className="sticky top-0 z-40 flex h-16 w-full shrink-0 items-center justify-between border-b border-white/10 bg-brand-dark px-4 sm:px-6 lg:px-8 shadow-sm">
        {/* Left: Mobile Drawer Trigger + Brand */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label={open ? 'Close admin menu' : 'Open admin menu'}
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-white/15 bg-white/5 text-gold transition-colors hover:bg-white/10 lg:hidden"
          >
            {open ? <X aria-hidden className="h-5 w-5" /> : <Menu aria-hidden className="h-5 w-5" />}
          </button>
          <Link href="/admin" className="group flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gold font-display text-sm font-black text-ink shadow-sm transition-transform group-hover:scale-105">
              TSC
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xs sm:text-sm font-bold uppercase tracking-wider text-white transition-colors group-hover:text-gold">
                TSC Newsroom
              </span>
              <span className="hidden text-[10px] text-cream/50 sm:inline">Admin Console</span>
            </div>
          </Link>
        </div>

        {/* Right: Admin details only — name, userid, and logout option */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {user && (
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* User Avatar */}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/20 border border-gold/40 font-display text-xs sm:text-sm font-bold text-gold">
                {userName.charAt(0).toUpperCase()}
              </div>

              {/* User Name & User Email */}
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-display text-xs sm:text-sm font-bold text-white tracking-wide truncate max-w-[100px] sm:max-w-[180px]">
                    {userName}
                  </span>
                  {user.role && (
                    <span className="hidden sm:inline-flex items-center gap-0.5 rounded bg-gold/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gold border border-gold/30">
                      {user.role === 'admin' ? <ShieldCheck className="h-2.5 w-2.5" /> : <Shield className="h-2.5 w-2.5" />}
                      {user.role}
                    </span>
                  )}
                </div>
                {userEmail && (
                  <p
                    className="text-[11px] text-cream/65 truncate max-w-[120px] sm:max-w-[200px] leading-tight mt-0.5"
                    title={userEmail}
                  >
                    {userEmail}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="hidden h-6 w-px bg-white/10 sm:block" />

          {/* Logout Option */}
          <button
            type="button"
            onClick={handleLogout}
            title="Log out of Newsroom console"
            className="inline-flex items-center gap-1.5 rounded-md border border-red-500/30 bg-red-500/15 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-red-300 transition-all hover:bg-red-500 hover:text-white hover:border-red-500 active:scale-95 shadow-sm"
          >
            <LogOut aria-hidden className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Workspace (Sidebar + Content) */}
      <div className="flex flex-1">
        {/* Desktop Sticky Sidebar */}
        <aside className="sticky top-16 z-30 hidden h-[calc(100vh-4rem)] w-64 shrink-0 flex-col bg-brand-dark border-r border-white/10 lg:flex">
          {nav}
          <div className="shrink-0 border-t border-white/10 p-3 bg-black/20">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-2 rounded-[4px] px-3 py-2 text-[12px] font-semibold text-cream/70 transition-colors hover:text-gold hover:bg-white/[0.05]"
            >
              <ExternalLink aria-hidden className="h-3.5 w-3.5" /> View live site
            </Link>
          </div>
        </aside>

        {/* Mobile Drawer */}
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute inset-y-0 left-0 top-16 w-64 flex flex-col bg-brand-dark shadow-2xl z-10 border-r border-white/10">
              {nav}
              <div className="shrink-0 border-t border-white/10 p-3 bg-black/20">
                <Link
                  href="/"
                  target="_blank"
                  className="flex items-center gap-2 rounded-[4px] px-3 py-2 text-[12px] font-semibold text-cream/70 transition-colors hover:text-gold hover:bg-white/[0.05]"
                >
                  <ExternalLink aria-hidden className="h-3.5 w-3.5" /> View live site
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-10">
          {children}
        </main>
      </div>

      {/* Custom Admin Footer Strip */}
      <AdminFooter />
    </div>
  );
}
