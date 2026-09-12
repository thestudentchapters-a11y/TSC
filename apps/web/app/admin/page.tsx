'use client';

import Link from 'next/link';
import { Briefcase, CalendarDays, FileText, Globe2, Images, Mail, Mic, Newspaper, School, Share2, TrendingUp, Users } from 'lucide-react';
import {
  demoArticles, demoCampuses, demoContactMessages, demoEditions, demoEpisodes, demoEvents,
  demoMembers, demoOpportunities, demoStorySubmissions, demoCampusSubmissions,
} from '@/data/content';
import { formatDate } from '@/lib/utils';

function StatCard({ label, value, sub, icon: Icon, href }: { label: string; value: string | number; sub?: string; icon: typeof Users; href: string }) {
  return (
    <Link href={href} className="card-base card-hover group flex h-full flex-col justify-between gap-3 p-5">
      <div className="flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-brand-50 text-brand transition-colors group-hover:bg-brand group-hover:text-white">
          <Icon aria-hidden className="h-5 w-5" />
        </span>
        <span className="font-display text-2xl font-bold">{value}</span>
      </div>
      <div>
        <p className="font-display text-[12px] font-bold uppercase tracking-[0.12em]">{label}</p>
        <p className="mt-0.5 text-[11px] text-muted min-h-[1rem]">{sub || ' '}</p>
      </div>
    </Link>
  );
}

export default function AdminDashboardPage() {
  const pending = [...demoStorySubmissions, ...demoCampusSubmissions].filter((s) => s.status === 'pending').length;
  const newMembers = demoMembers.filter((m) => m.joinedOn >= '2026-08-01').length;
  const upcoming = demoEvents.filter((e) => e.status === 'upcoming').length;
  const activeOpps = demoOpportunities.filter((o) => o.active).length;
  const unread = demoContactMessages.filter((m) => m.status === 'new').length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Overview</p>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">
            Live figures populate from MongoDB when the API is connected — counts below reflect the current
            demo dataset.
          </p>
        </div>
        <span className="rounded-full border border-gold/50 bg-gold-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gold-deep">
          Demo data
        </span>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Hiring applications" value="12" sub="Jobs & Internships" icon={Briefcase} href="/admin/hiring" />
        {/* <StatCard label="Community members" value={demoMembers.filter((m) => m.role === 'member').length} sub={`${newMembers} active`} icon={Users} href="/admin/members" /> */}
        <StatCard label="Team & Staff" value={demoMembers.filter((m) => m.role === 'admin' || m.role === 'editor').length} sub="Admins & Editors" icon={Users} href="/admin/team" />
        <StatCard label="Pending submissions" value={pending} sub="Awaiting review" icon={Share2} href="/admin/story-submissions" />
        <StatCard label="Published articles" value={demoArticles.filter((a) => a.status === 'published').length} sub="News section" icon={Newspaper} href="/admin/news" />
        <StatCard label="Upcoming events" value={upcoming} icon={CalendarDays} href="/admin/events" />
        <StatCard label="Active opportunities" value={activeOpps} sub="Jobs · Internships · Fellowships" icon={TrendingUp} href="/admin/opportunities" />
        <StatCard label="Podcast episodes" value={demoEpisodes.length} icon={Mic} href="/admin/podcasts" />
        <StatCard label="Campuses" value={demoCampuses.length} icon={School} href="/admin/campuses" />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section className="card-base p-6">
          <h2 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.14em]">
            <Share2 aria-hidden className="h-4 w-4 text-brand" /> Review queue
          </h2>
          <ul className="mt-4 space-y-3">
            {[...demoStorySubmissions, ...demoCampusSubmissions].slice(0, 4).map((s, idx) => (
              <li key={`queue-${s.id}-${idx}`} className="flex items-start justify-between gap-3 rounded-md border border-hairline bg-cream p-3.5">
                <div>
                  <p className="font-display text-[13.5px] font-bold leading-snug">{s.title}</p>
                  <p className="mt-0.5 text-[11.5px] text-muted">{s.name} • {formatDate(s.submittedOn)}</p>
                </div>
                <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${s.status === 'pending' ? 'border-gold/40 bg-gold-50 text-gold-deep' : 'border-brand/25 bg-brand-50 text-brand'}`}>
                  {s.status}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex gap-4 text-xs font-bold uppercase tracking-wider">
            <Link href="/admin/story-submissions" className="cta-underline text-brand">Story submissions</Link>
            <Link href="/admin/campus-submissions" className="cta-underline text-brand">Campus submissions</Link>
          </div>
        </section>

        <section className="card-base p-6">
          <h2 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.14em]">
            <Mail aria-hidden className="h-4 w-4 text-brand" /> Inbox &amp; quick links
          </h2>
          <ul className="mt-4 space-y-3">
            {demoContactMessages.slice(0, 3).map((m) => (
              <li key={`inbox-msg-${m.id}`} className="rounded-md border border-hairline bg-cream p-3.5">
                <p className="font-display text-[13.5px] font-bold leading-snug">{m.subject}</p>
                <p className="mt-0.5 text-[11.5px] text-muted">{m.name} • {formatDate(m.receivedOn)}</p>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-4 text-xs font-bold uppercase tracking-wider">
            <Link href="/admin/contact-messages" className="cta-underline text-brand">All messages ({unread} new)</Link>
            <Link href="/admin/media" className="cta-underline text-brand">Media library</Link>
            <Link href="/admin/settings" className="cta-underline text-brand">Settings</Link>
          </div>
        </section>
      </div>

      <section className="mt-8 rounded-md border border-hairline bg-white p-6">
        <h2 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.14em]">
          <FileText aria-hidden className="h-4 w-4 text-brand" /> Editorial workflow
        </h2>
        <ol className="mt-4 grid gap-3 text-[13px] leading-6 text-muted sm:grid-cols-6">
          {['Contributor submits', 'Stored in database', 'Admin notified', 'Editor reviews & edits', 'Editor approves & publishes', 'Goes live'].map((step, i) => (
            <li key={`editorial-step-${i}-${step}`} className="rounded-md border border-hairline bg-cream p-3">
              <span className="mb-2 inline-flex h-6 w-6 items-center justify-center rounded-[4px] bg-gold font-display text-[11px] font-bold text-ink">
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className="font-semibold text-ink/80">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-8 flex items-center gap-3 rounded-md border border-dashed border-hairline bg-white p-5 text-[13px] text-muted">
        <Images aria-hidden className="h-4 w-4 text-brand" />
        Media uploads, scheduled publishing and live member analytics activate once the API and storage are connected via Settings.
      </section>
    </div>
  );
}
