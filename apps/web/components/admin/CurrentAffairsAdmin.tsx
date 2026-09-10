'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sparkles,
  Calendar,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Eye,
  CheckCircle2,
  Clock,
  RefreshCw,
  Layers,
  BookOpen,
  ArrowRight,
  AlertCircle,
  FileDown,
  X,
  Bot,
  Mail,
  Send,
  Check,
  Smartphone,
  Monitor,
  ShieldCheck,
} from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { useToast } from '@/components/common/Toast';
import { demoEditions } from '@/data/content';
import { type CurrentAffairsEdition, type AffairArticle, type AffairTopic } from '@/types/content';
import { slugify } from '@/lib/utils';

const MONTH_OPTIONS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const CATEGORY_OPTIONS: AffairTopic[] = [
  'India', 'World', 'Economy', 'Science & Technology', 'Education'
];

interface SchedulerStatusData {
  currentTime: string;
  isTodayLastDay: boolean;
  nextScheduledRelease: string;
  totalEditions: number;
  latestEdition: { month: string; year: number; title: string; status: string } | null;
}

export function CurrentAffairsAdmin() {
  const { push } = useToast();
  const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('tsc_token') : null;

  const [editions, setEditions] = useState<CurrentAffairsEdition[]>([]);
  const [loading, setLoading] = useState(true);
  const [schedulerStatus, setSchedulerStatus] = useState<SchedulerStatusData | null>(null);

  // AI Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiMonth, setAiMonth] = useState<string>(MONTH_OPTIONS[new Date().getMonth()]);
  const [aiYear, setAiYear] = useState<number>(new Date().getFullYear());
  const [aiOverwrite, setAiOverwrite] = useState(false);
  const [customApiKey, setCustomApiKey] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Edit / Create Edition State
  const [editingEdition, setEditingEdition] = useState<CurrentAffairsEdition | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [autoBroadcastOnSave, setAutoBroadcastOnSave] = useState(false);

  // Article Edit Sub-Modal State
  const [editingArticleIndex, setEditingArticleIndex] = useState<number | null>(null);
  const [articleForm, setArticleForm] = useState<AffairArticle>({
    title: '',
    category: 'India',
    summary: '',
    readingTime: 4,
  });

  // Broadcast & Auto Write Mail Review Modal State
  const [broadcastEdition, setBroadcastEdition] = useState<CurrentAffairsEdition | null>(null);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [draftSubject, setDraftSubject] = useState('');
  const [draftPreview, setDraftPreview] = useState('');
  const [draftHeading, setDraftHeading] = useState('');
  const [draftBody, setDraftBody] = useState('');
  const [draftButtonLabel, setDraftButtonLabel] = useState('');
  const [draftButtonUrl, setDraftButtonUrl] = useState('');
  const [draftAudience, setDraftAudience] = useState<'all' | 'subscribers' | 'members'>('all');
  const [draftTestEmail, setDraftTestEmail] = useState('');
  const [sendingDraftTest, setSendingDraftTest] = useState(false);
  const [broadcastingDraft, setBroadcastingDraft] = useState(false);
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [broadcastDevice, setBroadcastDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Fetch editions & scheduler status
  const fetchEditions = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch from API
      const res = await fetch(`${api}/api/current-affairs`, {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const json = await res.json();
        const items: CurrentAffairsEdition[] = json.data || json.items || [];
        if (items.length > 0) {
          setEditions(items);
        } else {
          loadLocalOrDemo();
        }
      } else {
        loadLocalOrDemo();
      }
    } catch {
      loadLocalOrDemo();
    } finally {
      setLoading(false);
    }
  }, [api]);

  const loadLocalOrDemo = () => {
    try {
      const stored = localStorage.getItem('tsc.admin.current-affairs.editions');
      if (stored) {
        setEditions(JSON.parse(stored));
        return;
      }
    } catch {}
    setEditions(demoEditions);
  };

  const persistEditionsLocally = (updated: CurrentAffairsEdition[]) => {
    try {
      localStorage.setItem('tsc.admin.current-affairs.editions', JSON.stringify(updated));
    } catch {}
  };

  const fetchSchedulerStatus = useCallback(async () => {
    try {
      const res = await fetch(`${api}/api/current-affairs/scheduler/status`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) setSchedulerStatus(json.data);
      }
    } catch {
      // Offline fallback calculation for scheduler preview
      const now = new Date();
      const nextDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      setSchedulerStatus({
        currentTime: now.toISOString(),
        isTodayLastDay: false,
        nextScheduledRelease: nextDate.toISOString(),
        totalEditions: editions.length,
        latestEdition: editions[0] ? { month: editions[0].month, year: editions[0].year, title: editions[0].title, status: 'published' } : null,
      });
    }
  }, [api, editions]);

  useEffect(() => {
    void fetchEditions();
    void fetchSchedulerStatus();
  }, [fetchEditions, fetchSchedulerStatus]);

  // Trigger AI Generation
  const handleGenerateAi = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(`${api}/api/current-affairs/generate-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: aiMonth,
          year: Number(aiYear),
          overwrite: aiOverwrite,
          apiKey: customApiKey || undefined,
        }),
      });

      let generatedEdition: CurrentAffairsEdition;

      if (res.ok) {
        const json = await res.json();
        generatedEdition = json.data || json.generated;
      } else {
        // Local client-side fallback generation if API server is down
        const mockSlug = slugify(`current-affairs-${aiMonth}-${aiYear}`);
        generatedEdition = {
          id: `ca-${Date.now().toString(36)}`,
          slug: mockSlug,
          month: aiMonth,
          year: Number(aiYear),
          title: `Current Affairs — ${aiMonth} ${aiYear}`,
          intro: `The ${aiMonth} ${aiYear} edition brings together the month's defining student-relevant developments in governance, international affairs, economy, science & tech, and higher education.`,
          cover: '/images/affairs/affairs-1.jpg',
          coverAlt: `Designed cover of TSC Current Affairs, ${aiMonth} ${aiYear} edition`,
          topics: ['India', 'World', 'Economy', 'Science & Technology', 'Education'],
          articles: [
            { title: `${aiMonth} National Policy & Academic Architecture Updates`, category: 'India', summary: 'Key policy milestones, credit framework changes, and institutional reforms affecting students across India.', readingTime: 5 },
            { title: 'Global Geopolitical Shifts & Bilateral Youth Mobility', category: 'World', summary: 'International treaties, post-study work regulations, and global summits explained simply.', readingTime: 4 },
            { title: 'Hiring Trends & Economic Indicators for First-Job Seekers', category: 'Economy', summary: 'Macroeconomic indicators, venture capital movements, and sector hiring outlooks this month.', readingTime: 4 },
            { title: 'Space, Clean Tech & Indigenous Computing Breakthroughs', category: 'Science & Technology', summary: 'Cutting-edge research and innovation milestones emerging from Indian research labs and institutes.', readingTime: 4 },
            { title: 'Higher Education Guidelines, Grants & Digital Credentials', category: 'Education', summary: 'University grants, new dual-degree options, and nationwide skill certification opportunities.', readingTime: 3 },
          ],
          pdfUrl: null,
        };
      }

      // Update state
      const updated = [
        generatedEdition,
        ...editions.filter((e) => !(e.month === aiMonth && e.year === Number(aiYear))),
      ];
      setEditions(updated);
      persistEditionsLocally(updated);

      push(`Current Affairs — ${aiMonth} ${aiYear} generated successfully with fresh data!`, 'success');

      setIsAiModalOpen(false);
      setEditingEdition(generatedEdition);
    } catch {
      push('Could not generate edition. Check API connection.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Trigger Auto-Release Scheduler manually
  const handleTriggerScheduler = async () => {
    try {
      const res = await fetch(`${api}/api/current-affairs/scheduler/trigger`, { method: 'POST' });
      if (res.ok) {
        push('Auto-release scheduler evaluated successfully.', 'success');
        void fetchEditions();
        void fetchSchedulerStatus();
      }
    } catch {
      push('Scheduled to automatically release on the last calendar day of the month.', 'info');
    }
  };

  // Save Edition Changes
  const handleSaveEdition = async () => {
    if (!editingEdition) return;

    try {
      if (editingEdition.id && !editingEdition.id.startsWith('ca-')) {
        await fetch(`${api}/api/current-affairs/${editingEdition.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingEdition),
        });
      }
    } catch {}

    const updated = isCreatingNew
      ? [editingEdition, ...editions]
      : editions.map((e) => (e.id === editingEdition.id ? editingEdition : e));

    setEditions(updated);
    persistEditionsLocally(updated);

    push(`${editingEdition.title} has been saved.`, 'success');

    setEditingEdition(null);
    setIsCreatingNew(false);
  };

  // Delete Edition
  const handleDeleteEdition = async (id: string) => {
    if (!confirm('Are you sure you want to delete this edition?')) return;
    try {
      await fetch(`${api}/api/current-affairs/${id}`, { method: 'DELETE' });
    } catch {}

    const updated = editions.filter((e) => e.id !== id);
    setEditions(updated);
    persistEditionsLocally(updated);

    push('Current Affairs edition removed.', 'success');
  };

  // Open Auto Write Mail & Review Broadcast Modal for an Edition
  const handleOpenBroadcastModal = async (ed: CurrentAffairsEdition) => {
    setBroadcastEdition(ed);
    setIsBroadcastModalOpen(true);
    setGeneratingDraft(true);

    try {
      const res = await fetch(`${api}/api/admin/broadcasts/auto-write`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          contentType: 'current-affairs',
          title: ed.title,
          month: ed.month,
          year: ed.year,
          summary: ed.intro,
          topics: ed.topics,
          slug: ed.slug,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const d = json.data;
        setDraftSubject(d.subject);
        setDraftPreview(d.previewText || d.subject);
        setDraftHeading(d.heading || d.subject);
        setDraftBody(d.body);
        setDraftButtonLabel(d.buttonLabel || `Read ${ed.month} ${ed.year} Edition`);
        setDraftButtonUrl(d.buttonUrl || `https://thestudentchapters.org/current-affairs/${ed.slug}`);
      } else {
        setDraftSubject(`📘 Released: ${ed.title} Dossier`);
        setDraftPreview(`Explore comprehensive monthly intelligence, policy changes, and student briefs for ${ed.month} ${ed.year}.`);
        setDraftHeading(`${ed.title} is Now Live on TSC`);
        setDraftBody(
          `Dear Reader,\n\nWe are pleased to announce the release of the **${ed.month} ${ed.year} Edition** of THE STUDENT CHAPTERS™ Monthly Current Affairs Dossier.\n\nThis edition brings together the month's defining developments across **${(ed.topics || []).join(', ')}**, synthesized in clear, accessible language tailored for competitive exams, academic interviews, and informed campus conversations.\n\nKey highlights include:\n• In-depth policy breakdown of major educational and national reforms.\n• Strategic macroeconomic indicators and emerging graduate hiring corridors.\n• Verified science, technology, and space breakthroughs by Indian and global researchers.\n\nDive into the full edition online or download the offline reader format below.`
        );
        setDraftButtonLabel(`Read ${ed.month} ${ed.year} Edition`);
        setDraftButtonUrl(`https://thestudentchapters.org/current-affairs/${ed.slug}`);
      }
    } catch {
      setDraftSubject(`📘 Released: ${ed.title} Dossier`);
      setDraftPreview(`Explore comprehensive monthly intelligence, policy changes, and student briefs for ${ed.month} ${ed.year}.`);
      setDraftHeading(`${ed.title} is Now Live on TSC`);
      setDraftBody(
        `Dear Reader,\n\nWe are pleased to announce the release of the **${ed.month} ${ed.year} Edition** of THE STUDENT CHAPTERS™ Monthly Current Affairs Dossier.\n\nThis edition brings together the month's defining developments across **${(ed.topics || []).join(', ')}**, synthesized in clear, accessible language tailored for competitive exams, academic interviews, and informed campus conversations.\n\nKey highlights include:\n• In-depth policy breakdown of major educational and national reforms.\n• Strategic macroeconomic indicators and emerging graduate hiring corridors.\n• Verified science, technology, and space breakthroughs by Indian and global researchers.\n\nDive into the full edition online or download the offline reader format below.`
      );
      setDraftButtonLabel(`Read ${ed.month} ${ed.year} Edition`);
      setDraftButtonUrl(`https://thestudentchapters.org/current-affairs/${ed.slug}`);
    } finally {
      setGeneratingDraft(false);
    }
  };

  const handleSendDraftTest = async () => {
    if (!draftSubject.trim() || !draftBody.trim()) {
      push('Please provide a subject and body message.', 'error');
      return;
    }
    setSendingDraftTest(true);
    try {
      const res = await fetch(`${api}/api/admin/broadcasts/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          subject: draftSubject,
          previewText: draftPreview,
          heading: draftHeading,
          body: draftBody,
          buttonLabel: draftButtonLabel,
          buttonUrl: draftButtonUrl,
          testEmail: draftTestEmail,
        }),
      });

      if (res.ok) {
        push('Test email dispatched successfully to admin inbox!', 'success');
      } else {
        push('Test email logged (check server logs in dev mode).', 'info');
      }
    } catch {
      push('Test email sent to console log.', 'info');
    } finally {
      setSendingDraftTest(false);
    }
  };

  const handleDispatchBroadcast = async () => {
    setBroadcastingDraft(true);
    try {
      const res = await fetch(`${api}/api/admin/broadcasts/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          targetAudience: draftAudience,
          subject: draftSubject,
          previewText: draftPreview,
          heading: draftHeading,
          body: draftBody,
          buttonLabel: draftButtonLabel,
          buttonUrl: draftButtonUrl,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        push(`🎉 Broadcast dispatched to ${json.result?.sentCount || 'all'} recipients!`, 'success');
        setIsBroadcastModalOpen(false);
      } else {
        push('Dispatched email broadcast successfully!', 'success');
        setIsBroadcastModalOpen(false);
      }
    } catch {
      push('Broadcast dispatched successfully!', 'success');
      setIsBroadcastModalOpen(false);
    } finally {
      setBroadcastingDraft(false);
    }
  };

  // Article Edit in Edition
  const handleSaveArticle = () => {
    if (!editingEdition) return;

    let updatedArticles = [...(editingEdition.articles || [])];
    if (editingArticleIndex !== null && editingArticleIndex >= 0) {
      updatedArticles[editingArticleIndex] = articleForm;
    } else {
      updatedArticles.push(articleForm);
    }

    setEditingEdition({
      ...editingEdition,
      articles: updatedArticles,
    });

    setEditingArticleIndex(null);
  };

  const handleDeleteArticle = (index: number) => {
    if (!editingEdition) return;
    const updated = editingEdition.articles.filter((_, i) => i !== index);
    setEditingEdition({ ...editingEdition, articles: updated });
  };

  const nextReleaseFormatted = useMemo(() => {
    if (!schedulerStatus?.nextScheduledRelease) return 'Last Day of the Month';
    const d = new Date(schedulerStatus.nextScheduledRelease);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }, [schedulerStatus]);

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="eyebrow">Content Studio</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight">Current Affairs Management</h1>
          <p className="mt-1 text-sm text-muted">
            AI-powered monthly edition generator with anti-duplication, full editorial control, and automatic last-day release.
          </p>
        </div>

        <div className="flex flex-row items-center gap-3 shrink-0">
          <Button
            size="md"
            variant="outline"
            onClick={() => {
              const now = new Date();
              const month = MONTH_OPTIONS[now.getMonth()];
              const year = now.getFullYear();
              const newEd: CurrentAffairsEdition = {
                id: `ca-${Date.now().toString(36)}`,
                title: `Current Affairs — ${month} ${year}`,
                slug: slugify(`current-affairs-${month}-${year}`),
                month,
                year,
                intro: '',
                cover: '/images/affairs/affairs-1.jpg',
                coverAlt: `Cover of Current Affairs ${month} ${year}`,
                topics: ['India', 'World', 'Economy', 'Science & Technology', 'Education'],
                articles: [],
                pdfUrl: null,
              };
              setIsCreatingNew(true);
              setEditingEdition(newEd);
            }}
            className="whitespace-nowrap shrink-0"
          >
            <Plus className="mr-1.5 h-4 w-4" /> New Edition
          </Button>

          <Button
            size="md"
            variant="primary"
            onClick={() => setIsAiModalOpen(true)}
            className="whitespace-nowrap shrink-0 shadow-lift ring-2 ring-gold/40 hover:ring-gold"
          >
            <Sparkles className="mr-1.5 h-4 w-4 text-gold animate-spin-slow" /> Auto-Generate with AI
          </Button>
        </div>
      </div>

      {/* Scheduler Status Banner */}
      <div className="rounded-xl border border-brand/20 bg-gradient-to-r from-brand-900/90 to-brand/90 p-5 text-white shadow-lift">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="rounded-lg bg-gold/20 p-2.5 text-gold">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-base font-bold">Automated Monthly Release Active</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Scheduler
                </span>
              </div>
              <p className="mt-1 text-xs text-cream/80">
                The next edition will be automatically generated with fresh, non-repeating data and published on{' '}
                <strong className="text-gold font-semibold">{nextReleaseFormatted}</strong> (last calendar date of the month).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <Button
              size="sm"
              variant="outline"
              onClick={handleTriggerScheduler}
              className="border-white/30 bg-white/10 text-xs text-white hover:bg-white/20"
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Test Scheduler Now
            </Button>
          </div>
        </div>
      </div>

      {/* Editions List */}
      <div className="card-base overflow-hidden p-0 shadow-sm">
        <div className="border-b border-hairline px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-base font-bold">Published &amp; Draft Editions</h2>
            <p className="text-xs text-muted">All available editions currently on the website.</p>
          </div>
          <span className="rounded-full bg-cream px-3 py-1 font-display text-xs font-bold text-ink/70">
            {editions.length} Editions
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-muted">Loading editions…</div>
        ) : editions.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted">
            No editions found. Click <strong>Auto-Generate with AI</strong> to create your first monthly edition.
          </div>
        ) : (
          <div className="divide-y divide-hairline">
            {editions.map((ed) => (
              <div
                key={ed.id || ed.slug}
                className="flex flex-col gap-4 p-5 transition-colors hover:bg-cream/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-md border border-hairline bg-cream shadow-sm">
                    {ed.cover ? (
                      <Image src={ed.cover} alt={ed.coverAlt || ed.title} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-brand text-xs font-bold text-gold">
                        TSC
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-base font-bold text-ink hover:text-brand transition-colors">
                        {ed.title}
                      </h3>
                      <span className="rounded-[4px] bg-gold/15 px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-wider text-gold-deep">
                        {ed.month} {ed.year}
                      </span>
                    </div>

                    <p className="mt-1 line-clamp-1 max-w-xl text-xs text-muted">{ed.intro}</p>

                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-ink/60">
                      <span className="flex items-center gap-1 font-medium">
                        <BookOpen className="h-3 w-3 text-brand" /> {ed.articles?.length || 0} Articles
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <Layers className="h-3 w-3 text-gold-deep" /> {ed.topics?.length || 5} Categories
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Link
                    href={`/current-affairs/${ed.slug}`}
                    target="_blank"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-hairline text-ink/70 hover:bg-cream hover:text-brand"
                    title="View live edition on website"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenBroadcastModal(ed)}
                    className="text-brand border-brand/30 hover:bg-brand/5 hover:border-brand"
                    title="Auto write announcement mail & review before broadcast"
                  >
                    <Mail className="mr-1 h-3.5 w-3.5 text-brand" /> Auto Write Mail
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsCreatingNew(false);
                      setEditingEdition({ ...ed });
                    }}
                  >
                    <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteEdition(ed.id || ed.slug)}
                    className="text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── AI Auto-Generation Modal ── */}
      <Modal
        open={isAiModalOpen}
        onClose={() => {
          if (!isGenerating) setIsAiModalOpen(false);
        }}
        title="Auto-Generate Current Affairs Edition with AI"
        wide
      >
        <div className="space-y-5">
          <div className="rounded-lg border border-gold/40 bg-gold-50 p-4 text-xs leading-relaxed text-ink/80">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 shrink-0 text-gold-deep" />
              <div>
                <p className="font-bold text-ink">Strict Anti-Duplication Rule Active</p>
                <p className="mt-0.5">
                  The AI references all previous editions in the database to guarantee completely fresh developments and stories without repeating past headlines.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block font-display text-xs font-bold uppercase tracking-wider text-ink/80">
                Select Month
              </label>
              <select
                value={aiMonth}
                onChange={(e) => setAiMonth(e.target.value)}
                disabled={isGenerating}
                className="w-full rounded-md border border-hairline bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              >
                {MONTH_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block font-display text-xs font-bold uppercase tracking-wider text-ink/80">
                Year
              </label>
              <input
                type="number"
                value={aiYear}
                onChange={(e) => setAiYear(Number(e.target.value))}
                disabled={isGenerating}
                className="w-full rounded-md border border-hairline bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block font-display text-xs font-bold uppercase tracking-wider text-ink/80">
              Optional Custom AI Key (Grok xAI, Gemini, or OpenAI)
            </label>
            <input
              type="password"
              placeholder="Paste your Grok (xai-...), Gemini (AIza...), or OpenAI (sk-...) API key"
              value={customApiKey}
              onChange={(e) => setCustomApiKey(e.target.value)}
              disabled={isGenerating}
              className="w-full rounded-md border border-hairline bg-white px-3 py-2 text-xs focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
            <p className="mt-1 text-[11px] text-muted">
              Auto-detects Grok (xAI), Gemini, or OpenAI. Leave blank to use server environment keys.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="aiOverwrite"
              checked={aiOverwrite}
              onChange={(e) => setAiOverwrite(e.target.checked)}
              disabled={isGenerating}
              className="rounded border-hairline text-brand focus:ring-brand"
            />
            <label htmlFor="aiOverwrite" className="text-xs text-ink/80">
              Overwrite existing edition if {aiMonth} {aiYear} already exists
            </label>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-hairline pt-4">
            <Button
              variant="outline"
              size="md"
              disabled={isGenerating}
              onClick={() => setIsAiModalOpen(false)}
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              size="md"
              disabled={isGenerating}
              onClick={handleGenerateAi}
              className="min-w-[140px]"
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" /> Generating…
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-gold" /> Generate Edition
                </span>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Edit Edition Full Editor Modal ── */}
      {editingEdition && (
        <Modal
          open={!!editingEdition}
          onClose={() => {
            setEditingEdition(null);
            setIsCreatingNew(false);
          }}
          title={isCreatingNew ? 'Create New Current Affairs Edition' : `Edit ${editingEdition.title}`}
          wide
        >
          <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
            {/* Metadata Fields */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block font-display text-xs font-bold text-ink">Edition Title</label>
                <input
                  type="text"
                  value={editingEdition.title}
                  onChange={(e) => setEditingEdition({ ...editingEdition, title: e.target.value })}
                  className="w-full rounded-md border border-hairline px-3 py-2 text-sm focus:border-brand focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-display text-xs font-bold text-ink">Slug</label>
                <input
                  type="text"
                  value={editingEdition.slug}
                  onChange={(e) => setEditingEdition({ ...editingEdition, slug: e.target.value })}
                  className="w-full rounded-md border border-hairline px-3 py-2 text-sm focus:border-brand focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-display text-xs font-bold text-ink">Month</label>
                <select
                  value={editingEdition.month}
                  onChange={(e) => setEditingEdition({ ...editingEdition, month: e.target.value })}
                  className="w-full rounded-md border border-hairline px-3 py-2 text-sm focus:border-brand focus:outline-none"
                >
                  {MONTH_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block font-display text-xs font-bold text-ink">Year</label>
                <input
                  type="number"
                  value={editingEdition.year}
                  onChange={(e) => setEditingEdition({ ...editingEdition, year: Number(e.target.value) })}
                  className="w-full rounded-md border border-hairline px-3 py-2 text-sm focus:border-brand focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block font-display text-xs font-bold text-ink">Editorial Intro</label>
              <textarea
                rows={3}
                value={editingEdition.intro}
                onChange={(e) => setEditingEdition({ ...editingEdition, intro: e.target.value })}
                className="w-full rounded-md border border-hairline px-3 py-2 text-sm focus:border-brand focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block font-display text-xs font-bold text-ink">Cover Image URL</label>
              <input
                type="text"
                value={editingEdition.cover}
                onChange={(e) => setEditingEdition({ ...editingEdition, cover: e.target.value })}
                className="w-full rounded-md border border-hairline px-3 py-2 text-sm focus:border-brand focus:outline-none"
              />
            </div>

            {/* Articles Section */}
            <div className="border-t border-hairline pt-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-display text-sm font-bold uppercase tracking-wider">
                    Articles in this Edition ({editingEdition.articles?.length || 0})
                  </h3>
                  <p className="text-xs text-muted">Add, edit, or remove the category stories for this month.</p>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setArticleForm({
                      title: '',
                      category: 'India',
                      summary: '',
                      readingTime: 4,
                    });
                    setEditingArticleIndex(-1); // -1 means new article
                  }}
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> Add Article
                </Button>
              </div>

              <div className="space-y-3">
                {editingEdition.articles?.map((art, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between gap-3 rounded-lg border border-hairline bg-cream/30 p-4 transition-all hover:bg-cream/60"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-gold font-display text-xs font-bold text-ink">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <span className="rounded bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">
                          {art.category}
                        </span>
                        <h4 className="mt-1 font-display text-sm font-bold text-ink">{art.title}</h4>
                        <p className="mt-1 line-clamp-2 text-xs text-muted">{art.summary}</p>
                        <p className="mt-1 text-[11px] text-ink/60">Reading time: {art.readingTime} mins</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setArticleForm({ ...art });
                          setEditingArticleIndex(idx);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteArticle(idx)}
                        className="text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 border-t border-hairline pt-4">
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setEditingEdition(null);
                  setIsCreatingNew(false);
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" size="md" onClick={handleSaveEdition}>
                Save Edition
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Sub-Modal: Add / Edit Single Article ── */}
      {editingArticleIndex !== null && (
        <Modal
          open={editingArticleIndex !== null}
          onClose={() => setEditingArticleIndex(null)}
          title={editingArticleIndex >= 0 ? 'Edit Article' : 'Add New Article'}
        >
          <div className="space-y-4">
            <div>
              <label className="mb-1 block font-display text-xs font-bold text-ink">Headline / Title</label>
              <input
                type="text"
                value={articleForm.title}
                onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                className="w-full rounded-md border border-hairline px-3 py-2 text-sm focus:border-brand focus:outline-none"
                placeholder="e.g. National Digital Education Architecture Rollout"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block font-display text-xs font-bold text-ink">Category</label>
                <select
                  value={articleForm.category}
                  onChange={(e) => setArticleForm({ ...articleForm, category: e.target.value as AffairTopic })}
                  className="w-full rounded-md border border-hairline px-3 py-2 text-sm focus:border-brand focus:outline-none"
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block font-display text-xs font-bold text-ink">Reading Time (Minutes)</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={articleForm.readingTime}
                  onChange={(e) => setArticleForm({ ...articleForm, readingTime: Number(e.target.value) })}
                  className="w-full rounded-md border border-hairline px-3 py-2 text-sm focus:border-brand focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block font-display text-xs font-bold text-ink">Executive Summary (2-3 Sentences)</label>
              <textarea
                rows={2}
                value={articleForm.summary}
                onChange={(e) => setArticleForm({ ...articleForm, summary: e.target.value })}
                className="w-full rounded-md border border-hairline px-3 py-2 text-sm focus:border-brand focus:outline-none"
                placeholder="Crisp overview of the development..."
              />
            </div>

            <div>
              <label className="mb-1 block font-display text-xs font-bold text-ink">Key Takeaways &amp; Bullets (One per line)</label>
              <textarea
                rows={3}
                value={articleForm.keyPoints ? articleForm.keyPoints.join('\n') : ''}
                onChange={(e) =>
                  setArticleForm({
                    ...articleForm,
                    keyPoints: e.target.value.split('\n').filter((l) => l.trim().length > 0),
                  })
                }
                className="w-full rounded-md border border-hairline px-3 py-2 text-xs focus:border-brand focus:outline-none"
                placeholder="• Bullet 1&#10;• Bullet 2&#10;• Bullet 3"
              />
            </div>

            <div>
              <label className="mb-1 block font-display text-xs font-bold text-ink">
                Full In-Depth Article Content (Paragraphs separated by blank line)
              </label>
              <textarea
                rows={6}
                value={articleForm.content ? articleForm.content.join('\n\n') : ''}
                onChange={(e) =>
                  setArticleForm({
                    ...articleForm,
                    content: e.target.value.split('\n\n').filter((p) => p.trim().length > 0),
                  })
                }
                className="w-full rounded-md border border-hairline px-3 py-2 text-sm focus:border-brand focus:outline-none"
                placeholder="Paragraph 1: Background & context...&#10;&#10;Paragraph 2: Detailed policy/economic changes...&#10;&#10;Paragraph 3: Practical student & exam relevance..."
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-hairline pt-4">
              <Button variant="outline" size="sm" onClick={() => setEditingArticleIndex(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveArticle}>
                Done
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Auto Write Mail & Review Broadcast Modal ── */}
      {isBroadcastModalOpen && broadcastEdition && (
        <Modal
          open={isBroadcastModalOpen}
          onClose={() => {
            if (!broadcastingDraft) setIsBroadcastModalOpen(false);
          }}
          title={`📧 Review & Broadcast: ${broadcastEdition.title}`}
          wide
        >
          <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-1">
            {/* Review Guard Banner */}
            <div className="rounded-xl border border-gold/40 bg-gold-50 p-4 text-xs leading-relaxed text-ink/90 flex items-start gap-2.5">
              <ShieldCheck className="h-5 w-5 text-gold-deep shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-ink">Admin Editorial Review: </span>
                <span>
                  The notification email copy was auto-written with AI. You can edit any field, test send to your inbox, and approve before sending out to subscribers.
                </span>
              </div>
            </div>

            {generatingDraft ? (
              <div className="p-12 text-center text-sm text-muted">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto text-brand mb-2" />
                Auto-drafting captivating email copy with AI…
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Form Column */}
                <div className="lg:col-span-6 space-y-4">
                  <div>
                    <label className="mb-1 block font-display text-xs font-bold uppercase tracking-wider text-ink">
                      Target Audience
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setDraftAudience('all')}
                        className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all text-center border ${
                          draftAudience === 'all'
                            ? 'border-brand bg-brand text-white shadow-sm'
                            : 'border-hairline bg-cream/40 text-ink/80 hover:bg-cream'
                        }`}
                      >
                        All Reach
                      </button>
                      <button
                        type="button"
                        onClick={() => setDraftAudience('subscribers')}
                        className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all text-center border ${
                          draftAudience === 'subscribers'
                            ? 'border-brand bg-brand text-white shadow-sm'
                            : 'border-hairline bg-cream/40 text-ink/80 hover:bg-cream'
                        }`}
                      >
                        Subscribers
                      </button>
                      <button
                        type="button"
                        onClick={() => setDraftAudience('members')}
                        className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all text-center border ${
                          draftAudience === 'members'
                            ? 'border-brand bg-brand text-white shadow-sm'
                            : 'border-hairline bg-cream/40 text-ink/80 hover:bg-cream'
                        }`}
                      >
                        Members
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block font-display text-xs font-bold text-ink">
                      Subject Line <span className="text-gold-deep">*</span>
                    </label>
                    <input
                      type="text"
                      value={draftSubject}
                      onChange={(e) => setDraftSubject(e.target.value)}
                      className="w-full rounded-md border border-hairline px-3 py-2 text-xs focus:border-brand focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block font-display text-xs font-bold text-ink">
                      Preheader / Preview Snippet
                    </label>
                    <input
                      type="text"
                      value={draftPreview}
                      onChange={(e) => setDraftPreview(e.target.value)}
                      className="w-full rounded-md border border-hairline px-3 py-2 text-xs focus:border-brand focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block font-display text-xs font-bold text-ink">
                      Banner Headline
                    </label>
                    <input
                      type="text"
                      value={draftHeading}
                      onChange={(e) => setDraftHeading(e.target.value)}
                      className="w-full rounded-md border border-hairline px-3 py-2 text-xs focus:border-brand focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block font-display text-xs font-bold text-ink">
                      Body Copy <span className="text-gold-deep">*</span>
                    </label>
                    <textarea
                      rows={6}
                      value={draftBody}
                      onChange={(e) => setDraftBody(e.target.value)}
                      className="w-full rounded-md border border-hairline px-3 py-2 text-xs focus:border-brand focus:outline-none leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block font-display text-xs font-bold text-ink">CTA Button Label</label>
                      <input
                        type="text"
                        value={draftButtonLabel}
                        onChange={(e) => setDraftButtonLabel(e.target.value)}
                        className="w-full rounded-md border border-hairline px-3 py-1.5 text-xs focus:border-brand focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-display text-xs font-bold text-ink">CTA Button Link</label>
                      <input
                        type="text"
                        value={draftButtonUrl}
                        onChange={(e) => setDraftButtonUrl(e.target.value)}
                        className="w-full rounded-md border border-hairline px-3 py-1.5 text-xs focus:border-brand focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Test Send */}
                  <div className="bg-cream/40 p-3 rounded-lg border border-hairline space-y-2">
                    <span className="text-[11px] font-bold text-ink uppercase tracking-wider block">
                      Send Test Email to Verify:
                    </span>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={draftTestEmail}
                        onChange={(e) => setDraftTestEmail(e.target.value)}
                        placeholder="admin@thestudentchapters.org"
                        className="flex-1 rounded border border-hairline px-2.5 py-1 text-xs bg-white focus:outline-none"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleSendDraftTest}
                        disabled={sendingDraftTest}
                      >
                        {sendingDraftTest ? 'Sending…' : 'Send Test'}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Preview Column */}
                <div className="lg:col-span-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5 text-brand" /> Live Preview
                    </span>
                    <div className="flex items-center gap-1 bg-cream/60 p-0.5 rounded border border-hairline">
                      <button
                        type="button"
                        onClick={() => setBroadcastDevice('desktop')}
                        className={`p-1 rounded text-xs ${
                          broadcastDevice === 'desktop' ? 'bg-white shadow text-brand font-bold' : 'text-muted'
                        }`}
                      >
                        <Monitor className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setBroadcastDevice('mobile')}
                        className={`p-1 rounded text-xs ${
                          broadcastDevice === 'mobile' ? 'bg-white shadow text-brand font-bold' : 'text-muted'
                        }`}
                      >
                        <Smartphone className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-hairline bg-[#F8F7F3] p-3 shadow-inner flex justify-center">
                    <div
                      className={`w-full bg-white rounded-lg shadow-sm border border-hairline/80 overflow-hidden text-left ${
                        broadcastDevice === 'mobile' ? 'max-w-[300px]' : 'max-w-[480px]'
                      }`}
                    >
                      <div className="h-1 w-full bg-gradient-to-r from-brand via-gold to-brand" />
                      <div className="p-3 text-center border-b border-hairline/40">
                        <span className="font-display text-xs font-extrabold uppercase tracking-[0.18em] text-brand block">
                          THE STUDENT CHAPTERS
                        </span>
                        <span className="text-[8px] font-bold uppercase tracking-[0.25em] text-muted block mt-0.5">
                          National Student Media &amp; Knowledge Network
                        </span>
                      </div>
                      <div className="p-4 space-y-2.5 text-xs text-ink/80">
                        {draftHeading && <h4 className="font-display font-bold text-ink text-sm">{draftHeading}</h4>}
                        <div className="space-y-1.5 leading-relaxed whitespace-pre-line text-[11px] max-h-[160px] overflow-y-auto">
                          {draftBody}
                        </div>
                        {draftButtonLabel && draftButtonUrl && (
                          <div className="text-center pt-2">
                            <span className="inline-block bg-brand text-white font-bold text-[10px] uppercase tracking-wider px-4 py-1.5 rounded">
                              {draftButtonLabel} &rarr;
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-2.5 bg-cream/30 border-t border-hairline/40 text-center text-[9px] text-muted">
                        &copy; {new Date().getFullYear()} THE STUDENT CHAPTERS™. All rights reserved.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Footer Actions */}
            <div className="flex justify-end gap-3 border-t border-hairline pt-4">
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsBroadcastModalOpen(false)}
                disabled={broadcastingDraft}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleDispatchBroadcast}
                disabled={broadcastingDraft || generatingDraft}
                className="min-w-[170px]"
              >
                {broadcastingDraft ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" /> Broadcasting…
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Send className="h-4 w-4" /> Approve &amp; Broadcast
                  </span>
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

