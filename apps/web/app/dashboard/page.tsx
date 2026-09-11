'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  Bell,
  Bookmark,
  CalendarDays,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  LogOut,
  Newspaper,
  PenSquare,
  Plus,
  School,
  Sparkles,
  UserRound,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Field, Input } from '@/components/forms/Form';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/common/Toast';
import { demoEvents, demoNotifications, demoOpportunities, demoStories } from '@/data/content';
import { formatDate } from '@/lib/utils';

interface SubmissionItem {
  _id?: string;
  id?: string;
  storyTitle?: string;
  newsTitle?: string;
  title?: string;
  category?: string;
  storyCategory?: string;
  status: 'pending' | 'under review' | 'approved' | 'rejected' | string;
  createdAt?: string;
  submittedAt?: string;
  reviewNote?: string;
  image?: string;
}

export default function DashboardPage() {
  const { user, ready, logout } = useAuth();
  const { push } = useToast();
  const [saved, setSaved] = useState<{ key: string }[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileKonnectxId, setProfileKonnectxId] = useState('');
  const [profileCollege, setProfileCollege] = useState('');
  const [profileCity, setProfileCity] = useState('');

  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfileCollege(user.college || '');
      setProfileCity(user.city || '');
      setProfileKonnectxId((user as any).konnectxId || '');
    }
  }, [user]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('tsc.saved');
      const list: string[] = raw ? JSON.parse(raw) : [];
      setSaved(list.map((key) => ({ key })));
    } catch {
      /* noop */
    }

    // Load member submissions
    const loadSubmissions = async () => {
      setLoadingSubmissions(true);
      const localSubs: SubmissionItem[] = (() => {
        try {
          return JSON.parse(window.localStorage.getItem('tsc.member.submissions') || '[]');
        } catch {
          return [];
        }
      })();

      const api = process.env.NEXT_PUBLIC_API_URL;
      if (api) {
        try {
          const token = window.localStorage.getItem('tsc_token');
          const res = await fetch(`${api}/api/submissions/my`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          if (res.ok) {
            const data = await res.json();
            const stories = data?.data?.stories || [];
            const campus = data?.data?.campus || [];
            const merged = [...stories, ...campus, ...localSubs];
            setSubmissions(merged);
            setLoadingSubmissions(false);
            return;
          }
        } catch {
          /* fallback */
        }
      }

      // Default demo submissions if empty
      if (localSubs.length === 0) {
        setSubmissions([
          {
            id: 'sub-demo-1',
            title: 'Youth Climate Resilience in Rural Bihar',
            category: 'student',
            status: 'pending',
            createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
            reviewNote: 'Under initial screening by our editors.',
          },
          {
            id: 'sub-demo-2',
            title: 'Campus Hackathon 2026: Key Takeaways & Innovations',
            category: 'campus',
            status: 'approved',
            createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
            reviewNote: 'Approved and published to TSC Stories!',
          },
        ]);
      } else {
        setSubmissions(localSubs);
      }
      setLoadingSubmissions(false);
    };

    loadSubmissions();
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
            Sign in to view your dashboard — submit articles, track review statuses, saved content, event
            registrations, and notifications.
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

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-50 px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-emerald-700">
            <CheckCircle2 className="h-3 w-3" /> Approved &amp; Live
          </span>
        );
      case 'under review':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-50 px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-blue-700">
            <Clock className="h-3 w-3" /> In Review
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-50 px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-rose-700">
            <XCircle className="h-3 w-3" /> Feedback Given
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-50 px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-amber-700">
            <Clock className="h-3 w-3" /> Awaiting Review
          </span>
        );
    }
  };

  const handleSaveProfile = () => {
    setIsEditingProfile(false);
    push('Profile details updated.', 'success');
  };

  return (
    <div className="container-tsc pb-20 pt-28 sm:pt-32">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-8">
        <div>
          <p className="eyebrow">Member Portal</p>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Hello, {user.name.split(' (')[0]} 👋
          </h1>
          <p className="mt-1 text-sm text-muted">
            {user.email} • Role: <span className="font-semibold uppercase text-brand">{user.role}</span>
            <span className="ml-2 inline-flex items-center rounded-full border border-gold/50 bg-gold-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold-deep">
              {user.role === 'admin' ? '⚡ Full Admin Access' : 'Verified Member'}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button href="/dashboard/submit-article" variant="primary" size="sm" arrow>
            <PenSquare className="h-4 w-4" /> Post an Article
          </Button>
          {user.role !== 'member' && (
            <Button href="/admin" variant="outline" size="sm">
              Admin Suite
            </Button>
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
              <UserRound aria-hidden className="h-4 w-4 text-brand" /> Member Profile
            </h2>
            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-muted">Name</dt><dd className="font-semibold">{profileName || user.name}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted">Email</dt><dd className="truncate font-semibold">{user.email}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted">College</dt><dd className="font-semibold">{profileCollege || user.college || 'Patna University'}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted">City</dt><dd className="font-semibold">{profileCity || user.city || 'Patna, Bihar'}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted">Permissions</dt><dd className="font-semibold text-brand">{user.role === 'admin' ? 'Publish & Manage All' : 'Article Submissions'}</dd></div>
            </dl>
            <Button variant="outline" size="sm" className="mt-5 w-full" onClick={() => setIsEditingProfile(true)}>
              Edit Profile Info
            </Button>
          </section>

          <section className="rounded-md border border-gold/40 bg-gold-50 p-6" aria-label="Membership">
            <h2 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.14em] text-gold-deep">
              <Sparkles aria-hidden className="h-4 w-4" /> TSC Membership
            </h2>
            <p className="mt-3 text-[13.5px] leading-6 text-ink/70">
              Active contributor to THE STUDENT CHAPTERS™. Share your voice, submit articles, connect with fellow students, and access exclusive youth opportunities.
            </p>
            <div className="mt-4 border-t border-gold/20 pt-3">
              <p className="font-display text-xs font-bold uppercase tracking-wider text-ink/80">
                “Students are Watching, Observing &amp; Learning”
              </p>
            </div>
          </section>

          {/* Quick submission actions */}
          <section className="card-base p-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-[0.14em]">Contribute</h2>
            <div className="mt-4 space-y-2.5">
              <Link
                href="/dashboard/submit-article"
                className="flex items-center justify-between rounded-md border border-hairline bg-cream p-3 text-xs font-semibold text-ink transition-colors hover:border-brand/40 hover:bg-white"
              >
                <span className="flex items-center gap-2">
                  <PenSquare className="h-4 w-4 text-brand" /> Post Article / Story
                </span>
                <span className="text-muted">→</span>
              </Link>
              <Link
                href="/share-campus-news"
                className="flex items-center justify-between rounded-md border border-hairline bg-cream p-3 text-xs font-semibold text-ink transition-colors hover:border-brand/40 hover:bg-white"
              >
                <span className="flex items-center gap-2">
                  <School className="h-4 w-4 text-brand" /> Share Campus News
                </span>
                <span className="text-muted">→</span>
              </Link>
            </div>
          </section>
        </div>

        {/* activity */}
        <div className="space-y-6 lg:col-span-8">
          {/* Member Articles & Submissions Queue */}
          <section className="card-base p-6" aria-label="My Submitted Articles">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline pb-4">
              <div>
                <h2 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.14em]">
                  <FileText aria-hidden className="h-4 w-4 text-brand" /> My Submitted Articles &amp; Stories
                </h2>
                <p className="mt-0.5 text-xs text-muted">
                  Track the editorial review status and feedback of your submissions.
                </p>
              </div>
              <Button href="/dashboard/submit-article" size="sm" variant="outline">
                <Plus className="h-3.5 w-3.5" /> Submit New Article
              </Button>
            </div>

            <div className="mt-4 space-y-3.5">
              {loadingSubmissions ? (
                <p className="py-4 text-center text-xs text-muted">Loading your submissions…</p>
              ) : submissions.length === 0 ? (
                <div className="rounded-md border border-hairline bg-cream p-6 text-center">
                  <p className="font-display text-sm font-bold">No articles submitted yet</p>
                  <p className="mt-1 text-xs text-muted">
                    Have an interesting story, project, or campus event? Share it with the TSC community!
                  </p>
                  <Button href="/dashboard/submit-article" size="sm" className="mt-4" arrow>
                    Write Your First Article
                  </Button>
                </div>
              ) : (
                submissions.map((sub, idx) => {
                  const title = sub.storyTitle || sub.newsTitle || sub.title || 'Untitled Submission';
                  const dateStr = sub.createdAt || sub.submittedAt;
                  return (
                    <div
                      key={sub._id || sub.id || idx}
                      className="rounded-lg border border-hairline bg-cream p-4.5 transition-all hover:border-brand/30 hover:bg-white"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="max-w-xl">
                          <p className="font-display text-sm font-bold leading-snug text-ink">{title}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted">
                            <span className="capitalize">{sub.category || sub.storyCategory || 'Article'}</span>
                            {dateStr && (
                              <>
                                <span>•</span>
                                <span>{formatDate(dateStr)}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div>{getStatusBadge(sub.status)}</div>
                      </div>

                      {sub.reviewNote && (
                        <div className="mt-3 flex items-start gap-2 rounded-md border border-hairline bg-paper px-3 py-2 text-xs text-muted">
                          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                          <div>
                            <span className="font-bold text-ink">Editorial Note:</span> {sub.reviewNote}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Saved Items */}
          <section className="card-base p-6" aria-label="Saved items">
            <h2 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.14em]">
              <Bookmark aria-hidden className="h-4 w-4 text-brand" /> Bookmarked Content
              <span className="ml-auto text-xs font-medium text-muted">{saved.length} saved</span>
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

          {/* Registered Events */}
          <section className="card-base p-6" aria-label="Registered events">
            <h2 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.14em]">
              <CalendarDays aria-hidden className="h-4 w-4 text-brand" /> Registered Events
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

          {/* Notifications */}
          <section className="card-base p-6" aria-label="Notifications">
            <h2 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.14em]">
              <Bell aria-hidden className="h-4 w-4 text-brand" /> Member Notifications
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

      {/* Edit Profile Modal */}
      <Modal open={isEditingProfile} onClose={() => setIsEditingProfile(false)} title="Edit Member Profile">
        <div className="space-y-4">
          <Field label="Full Name" htmlFor="prof-name">
            <Input id="prof-name" value={profileName} onChange={(e) => setProfileName(e.target.value)} />
          </Field>
          <Field label="KonnectX ID" htmlFor="prof-kx" hint="Your KonnectX username or handle (@handle)">
            <Input id="prof-kx" value={profileKonnectxId} onChange={(e) => setProfileKonnectxId(e.target.value)} placeholder="@yourhandle" />
          </Field>
          <Field label="College / University" htmlFor="prof-college">
            <Input id="prof-college" value={profileCollege} onChange={(e) => setProfileCollege(e.target.value)} />
          </Field>
          <Field label="City & State" htmlFor="prof-city">
            <Input id="prof-city" value={profileCity} onChange={(e) => setProfileCity(e.target.value)} />
          </Field>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" size="sm" onClick={() => setIsEditingProfile(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSaveProfile}>Save Changes</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
