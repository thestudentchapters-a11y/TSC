'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, Bookmark, CalendarDays, FileText, LogOut, Newspaper, School, Sparkles, UserRound } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/components/providers/AuthProvider';
import { demoEpisodes, demoEvents, demoNotifications, demoOpportunities, demoStories } from '@/data/content';
import { formatDate } from '@/lib/utils';

/**
 * Member dashboard — protected client page.
 * With the API connected this shows live member data; in demo mode it
 * previews the experience with clearly-labelled sample content.
 */
export default function DashboardPage() {
  const { user, ready, logout } = useAuth();
  const [saved, setSaved] = useState<{ key: string }[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('tsc.saved');
      const list: string[] = raw ? JSON.parse(raw) : [];
      setSaved(list.map((key) => ({ key })));
    } catch {
      /* noop */
    }
  }, []);

  if (!ready) {
    return (
      <div className="container-tsc section-pad pt-32 text-center text-muted">Loading your dashboard…</div>
    );
  }

  if (!user) {
    return (
      <div className="container-tsc section-pad pt-32">
        <div className="card-base mx-auto max-w-md p-8 text-center">
          <UserRound aria-hidden className="mx-auto h-10 w-10 text-brand" />
          <h1 className="mt-4 font-display text-xl font-bold">Members only</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Sign in to view your dashboard — saved articles, opportunities, event registrations, submissions
            and notifications.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href="/login" size="md" arrow>Sign In</Button>
            <Button href="/membership" variant="outline" size="md" arrow>Become a Member</Button>
          </div>
        </div>
      </div>
    );
  }

  const savedStories = demoStories.slice(0, 2);
  const savedOpps = demoOpportunities.slice(0, 2);
  const registered = demoEvents.filter((e) => e.status === 'upcoming').slice(0, 2);
  const submitted = demoStories.slice(0, 2);

  return (
    <div className="container-tsc pb-20 pt-28 sm:pt-32">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-8">
        <div>
          <p className="eyebrow">Member Dashboard</p>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Hello, {user.name.split(' (')[0]} 👋
          </h1>
          <p className="mt-1 text-sm text-muted">
            {user.email} • Role: <span className="font-semibold uppercase text-brand">{user.role}</span>
            {!process.env.NEXT_PUBLIC_API_URL && (
              <span className="ml-2 rounded-full border border-gold/50 bg-gold-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold-deep">
                Demo mode
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2.5">
          {user.role !== 'member' && (
            <Button href="/admin" variant="outline" size="sm">Newsroom / Admin</Button>
          )}
          <Button size="sm" variant="ghost" onClick={logout}>
            <LogOut aria-hidden className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-12">
        {/* profile + membership */}
        <div className="space-y-6 lg:col-span-4">
          <section className="card-base p-6" aria-label="Profile">
            <h2 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.14em]">
              <UserRound aria-hidden className="h-4 w-4 text-brand" /> Profile
            </h2>
            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-muted">Name</dt><dd className="font-semibold">{user.name}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted">Email</dt><dd className="truncate font-semibold">{user.email}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted">College</dt><dd className="font-semibold">{user.college ?? '[Add via profile]'}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted">City</dt><dd className="font-semibold">{user.city ?? '[Add via profile]'}</dd></div>
            </dl>
            <Button variant="outline" size="sm" className="mt-5">Edit Profile</Button>
          </section>

          <section className="rounded-md border border-gold/40 bg-gold-50 p-6" aria-label="Membership">
            <h2 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.14em] text-gold-deep">
              <Sparkles aria-hidden className="h-4 w-4" /> Membership
            </h2>
            <p className="mt-3 text-[13.5px] leading-6 text-ink/70">
              Active member of THE STUDENT CHAPTERS™. Be heard. Be discovered. Be connected. Be informed. Be
              involved.
            </p>
            <p className="mt-2 text-[11px] italic text-muted">Full membership data syncs when the API is connected.</p>
          </section>
        </div>

        {/* activity */}
        <div className="space-y-6 lg:col-span-8">
          <section className="card-base p-6" aria-label="Saved items">
            <h2 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.14em]">
              <Bookmark aria-hidden className="h-4 w-4 text-brand" /> Saved articles &amp; opportunities
              <span className="ml-auto text-xs font-medium text-muted">{saved.length} saved on this device</span>
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[...savedStories.map((s) => ({ id: s.id, t: s.title, d: `Story • ${formatDate(s.date)}`, href: `/stories/${s.slug}`, icon: Newspaper })),
                ...savedOpps.map((o) => ({ id: o.id, t: o.title, d: `${o.type} • ${o.organization}`, href: `/career/${o.type === 'Job' ? 'jobs' : o.type === 'Internship' ? 'internships' : 'fellowships'}`, icon: Sparkles }))]
                .map((x) => (
                  <Link key={x.id} href={x.href} className="group rounded-md border border-hairline bg-cream p-4 transition-colors hover:border-brand/30 hover:bg-white">
                    <p className="meta-text !text-[10px]">{x.d}</p>
                    <p className="mt-1 font-display text-[14px] font-bold leading-snug transition-colors group-hover:text-brand">{x.t}</p>
                  </Link>
                ))}
            </div>
          </section>

          <section className="card-base p-6" aria-label="Registered events">
            <h2 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.14em]">
              <CalendarDays aria-hidden className="h-4 w-4 text-brand" /> Registered events
            </h2>
            <div className="mt-4 space-y-3">
              {registered.map((e) => (
                <Link key={e.id} href={`/events/${e.slug}`} className="group flex items-center justify-between gap-4 rounded-md border border-hairline bg-cream p-4 transition-colors hover:bg-white">
                  <div>
                    <p className="meta-text !text-[10px]">{formatDate(e.date)} • {e.city}</p>
                    <p className="mt-1 font-display text-[14px] font-bold group-hover:text-brand">{e.title}</p>
                  </div>
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand">Registered</span>
                </Link>
              ))}
            </div>
          </section>

          <div className="grid gap-6 sm:grid-cols-2">
            <section className="card-base p-6" aria-label="Submitted stories">
              <h2 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.14em]">
                <FileText aria-hidden className="h-4 w-4 text-brand" /> Submitted stories
              </h2>
              <div className="mt-4 space-y-3">
                {submitted.map((s) => (
                  <div key={s.id} className="rounded-md border border-hairline bg-cream p-4">
                    <p className="font-display text-[13.5px] font-bold leading-snug">{s.title}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-wider text-muted">Status: <span className="font-bold text-gold-deep">Under review (demo)</span></p>
                  </div>
                ))}
                <Link href="/share-your-story" className="cta-underline inline-block font-display text-[11px] font-bold uppercase tracking-[0.14em] text-brand">
                  Submit a new story
                </Link>
              </div>
            </section>

            <section className="card-base p-6" aria-label="Campus news submissions">
              <h2 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.14em]">
                <School aria-hidden className="h-4 w-4 text-brand" /> Campus news
              </h2>
              <div className="mt-4 space-y-3">
                <div className="rounded-md border border-hairline bg-cream p-4">
                  <p className="font-display text-[13.5px] font-bold leading-snug">No campus submissions yet</p>
                  <p className="mt-1 text-[12px] text-muted">Share what&apos;s happening at your campus.</p>
                </div>
                <Link href="/share-campus-news" className="cta-underline inline-block font-display text-[11px] font-bold uppercase tracking-[0.14em] text-brand">
                  Submit campus news
                </Link>
              </div>
            </section>
          </div>

          <section className="card-base p-6" aria-label="Notifications">
            <h2 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.14em]">
              <Bell aria-hidden className="h-4 w-4 text-brand" /> Notifications
            </h2>
            <div className="mt-4 space-y-3">
              {demoNotifications.map((n) => (
                <div key={n.id} className={`rounded-md border p-4 ${n.read ? 'border-hairline bg-cream' : 'border-brand/25 bg-brand-50'}`}>
                  <p className="font-display text-[13.5px] font-bold">{n.title}</p>
                  <p className="mt-0.5 text-[12.5px] leading-5 text-muted">{n.body}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-muted">{formatDate(n.date)}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
