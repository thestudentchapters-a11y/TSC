'use client';

import { useEffect, useState } from 'react';
import {
  Megaphone,
  Mail,
  Send,
  Users,
  Eye,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  Sparkles,
  Smartphone,
  Monitor,
  Check,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useToast } from '@/components/common/Toast';
import { useAuth } from '@/components/providers/AuthProvider';

interface AudienceStats {
  subscriberCount: number;
  memberCount: number;
  totalUniqueCount: number;
}

interface BroadcastLogItem {
  _id: string;
  subject: string;
  previewText?: string;
  heading?: string;
  body: string;
  targetAudience: 'all' | 'subscribers' | 'members';
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  sentBy?: { name: string; email: string };
  createdAt: string;
}

export default function BroadcastAdminPage() {
  const { user } = useAuth();
  const { push } = useToast();

  const [stats, setStats] = useState<AudienceStats>({
    subscriberCount: 0,
    memberCount: 0,
    totalUniqueCount: 0,
  });

  const [logs, setLogs] = useState<BroadcastLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingTest, setSendingTest] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Form state
  const [targetAudience, setTargetAudience] = useState<'all' | 'subscribers' | 'members'>('all');
  const [subject, setSubject] = useState('New from THE STUDENT CHAPTERS™: Latest Monthly Insights');
  const [previewText, setPreviewText] = useState('Read the newly released student journalism and monthly dossier.');
  const [heading, setHeading] = useState('Important Update from The Student Chapters');
  const [body, setBody] = useState(
    `Dear Reader,\n\nWe are excited to share our latest monthly current affairs edition and featured student journalism stories.\n\nExplore in-depth analyses on education, national student developments, and verified career opportunities designed to keep you informed.`
  );
  const [buttonLabel, setButtonLabel] = useState('Explore Current Affairs');
  const [buttonUrl, setButtonUrl] = useState('https://thestudentchapters.org/current-affairs');
  const [testEmail, setTestEmail] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('tsc_token') : null;
  const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  useEffect(() => {
    fetchStatsAndLogs();
  }, []);

  async function fetchStatsAndLogs() {
    setLoading(true);
    try {
      const [statsRes, logsRes] = await Promise.all([
        fetch(`${api}/api/admin/broadcasts/audience-stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${api}/api/admin/broadcasts`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (statsRes.ok) {
        const sData = await statsRes.json();
        setStats(sData.data || { subscriberCount: 0, memberCount: 0, totalUniqueCount: 0 });
      }

      if (logsRes.ok) {
        const lData = await logsRes.json();
        setLogs(lData.data || []);
      }
    } catch {
      push('Failed to load audience data', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleSendTest() {
    if (!subject.trim() || !body.trim()) {
      push('Please provide a subject and body message.', 'error');
      return;
    }
    setSendingTest(true);
    try {
      const res = await fetch(`${api}/api/admin/broadcasts/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject,
          previewText,
          heading,
          body,
          buttonLabel,
          buttonUrl,
          testEmail: testEmail.trim() || user?.email,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        push(data.message || 'Test email dispatched successfully!', 'success');
      } else {
        push(data.error || 'Failed to send test email', 'error');
      }
    } catch {
      push('Network error sending test email', 'error');
    } finally {
      setSendingTest(false);
    }
  }

  async function handleExecuteBroadcast() {
    setShowConfirmModal(false);
    setBroadcasting(true);
    try {
      const res = await fetch(`${api}/api/admin/broadcasts/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetAudience,
          subject,
          previewText,
          heading,
          body,
          buttonLabel,
          buttonUrl,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        push(`🎉 Broadcast dispatched to ${data.result?.sentCount || 0} recipients!`, 'success');
        fetchStatsAndLogs();
      } else {
        push(data.error || 'Failed to dispatch broadcast', 'error');
      }
    } catch {
      push('Network error sending broadcast', 'error');
    } finally {
      setBroadcasting(false);
    }
  }

  const activeAudienceCount =
    targetAudience === 'subscribers'
      ? stats.subscriberCount
      : targetAudience === 'members'
      ? stats.memberCount
      : stats.totalUniqueCount;

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-hairline/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand">
            <Megaphone className="h-4 w-4" />
            <span>Newsletter &amp; Member Broadcaster</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink mt-1">Broadcast Notification Mail</h1>
          <p className="text-sm text-muted">
            Compose and broadcast beautifully branded notification emails to newsletter subscribers and registered members.
          </p>
        </div>

        <button
          onClick={fetchStatsAndLogs}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-hairline bg-white px-4 py-2 text-xs font-semibold text-ink hover:bg-cream transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Stats
        </button>
      </div>

      {/* Audience Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setTargetAudience('subscribers')}
          className={`cursor-pointer rounded-xl border p-5 transition-all ${
            targetAudience === 'subscribers'
              ? 'border-brand bg-brand/5 shadow-md'
              : 'border-hairline bg-white hover:border-brand/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">Newsletter Subscribers</span>
            <Mail className="h-4 w-4 text-brand" />
          </div>
          <div className="mt-2 text-2xl font-bold text-ink font-mono">{stats.subscriberCount}</div>
          <p className="text-[11px] text-muted mt-1">Users subscribed to website footer newsletter</p>
        </div>

        <div
          onClick={() => setTargetAudience('members')}
          className={`cursor-pointer rounded-xl border p-5 transition-all ${
            targetAudience === 'members'
              ? 'border-brand bg-brand/5 shadow-md'
              : 'border-hairline bg-white hover:border-brand/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">Registered Members</span>
            <Users className="h-4 w-4 text-brand" />
          </div>
          <div className="mt-2 text-2xl font-bold text-ink font-mono">{stats.memberCount}</div>
          <p className="text-[11px] text-muted mt-1">Active student &amp; campus accounts</p>
        </div>

        <div
          onClick={() => setTargetAudience('all')}
          className={`cursor-pointer rounded-xl border p-5 transition-all ${
            targetAudience === 'all'
              ? 'border-brand bg-brand/5 shadow-md'
              : 'border-hairline bg-white hover:border-brand/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">Combined Total Reach</span>
            <Sparkles className="h-4 w-4 text-gold-deep" />
          </div>
          <div className="mt-2 text-2xl font-bold text-ink font-mono">{stats.totalUniqueCount}</div>
          <p className="text-[11px] text-muted mt-1">Unique deduplicated email addresses</p>
        </div>
      </div>

      {/* Main Studio: Composer on Left, Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Composer Form */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-2xl border border-hairline bg-white p-6 shadow-sm space-y-5">
            <h2 className="font-display text-lg font-bold text-ink flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-brand" />
              1. Email Composer
            </h2>

            {/* Audience selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink/80">
                Target Audience:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTargetAudience('all')}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all text-center border ${
                    targetAudience === 'all'
                      ? 'border-brand bg-brand text-white shadow-sm'
                      : 'border-hairline bg-cream/40 text-ink/80 hover:bg-cream'
                  }`}
                >
                  All ({stats.totalUniqueCount})
                </button>
                <button
                  type="button"
                  onClick={() => setTargetAudience('subscribers')}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all text-center border ${
                    targetAudience === 'subscribers'
                      ? 'border-brand bg-brand text-white shadow-sm'
                      : 'border-hairline bg-cream/40 text-ink/80 hover:bg-cream'
                  }`}
                >
                  Subscribers ({stats.subscriberCount})
                </button>
                <button
                  type="button"
                  onClick={() => setTargetAudience('members')}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all text-center border ${
                    targetAudience === 'members'
                      ? 'border-brand bg-brand text-white shadow-sm'
                      : 'border-hairline bg-cream/40 text-ink/80 hover:bg-cream'
                  }`}
                >
                  Members ({stats.memberCount})
                </button>
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink/80">
                Subject Line <span className="text-gold-deep">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Special Edition: March 2026 Student Briefing"
                className="w-full rounded-lg border border-hairline bg-white px-3.5 py-2 text-sm text-ink placeholder:text-muted/50 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
              />
            </div>

            {/* Preview Text */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink/80">
                Preheader / Preview Text
              </label>
              <input
                type="text"
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
                placeholder="Snippet shown in inbox preview before opening"
                className="w-full rounded-lg border border-hairline bg-white px-3.5 py-2 text-sm text-ink placeholder:text-muted/50 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
              />
            </div>

            {/* Heading */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink/80">
                Banner Headline
              </label>
              <input
                type="text"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                placeholder="Main heading at top of email body"
                className="w-full rounded-lg border border-hairline bg-white px-3.5 py-2 text-sm text-ink placeholder:text-muted/50 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
              />
            </div>

            {/* Body */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink/80">
                Message Content <span className="text-gold-deep">*</span>
              </label>
              <textarea
                rows={6}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Type your announcement. Double linebreaks create separate paragraphs."
                className="w-full rounded-lg border border-hairline bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/50 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 font-sans leading-relaxed"
              />
            </div>

            {/* Call to action button */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink/80">
                  CTA Button Label
                </label>
                <input
                  type="text"
                  value={buttonLabel}
                  onChange={(e) => setButtonLabel(e.target.value)}
                  placeholder="e.g. Read Full Article"
                  className="w-full rounded-lg border border-hairline bg-white px-3.5 py-2 text-sm text-ink placeholder:text-muted/50 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink/80">
                  CTA Button Link
                </label>
                <input
                  type="url"
                  value={buttonUrl}
                  onChange={(e) => setButtonUrl(e.target.value)}
                  placeholder="https://thestudentchapters.org/..."
                  className="w-full rounded-lg border border-hairline bg-white px-3.5 py-2 text-sm text-ink placeholder:text-muted/50 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
                />
              </div>
            </div>

            {/* Test Send Row */}
            <div className="border-t border-hairline/60 pt-4 space-y-3 bg-cream/20 p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-ink uppercase tracking-wider">
                  Send Test Email First:
                </label>
                <span className="text-[11px] text-muted">Test before full broadcast</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder={user?.email || 'admin@thestudentchapters.org'}
                  className="flex-1 rounded-lg border border-hairline bg-white px-3 py-2 text-xs text-ink placeholder:text-muted/50 focus:border-brand focus:outline-none"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSendTest}
                  disabled={sendingTest}
                  className="shrink-0"
                >
                  {sendingTest ? 'Sending Test…' : 'Send Test'}
                </Button>
              </div>
            </div>

            {/* Primary Broadcast CTA */}
            <div className="pt-2">
              <Button
                type="button"
                size="lg"
                onClick={() => setShowConfirmModal(true)}
                disabled={broadcasting || activeAudienceCount === 0}
                className="w-full justify-center shadow-lg shadow-brand/20 py-3"
                arrow
              >
                {broadcasting
                  ? 'Dispatching Campaign…'
                  : `Broadcast to ${activeAudienceCount} ${
                      targetAudience === 'subscribers'
                        ? 'Subscribers'
                        : targetAudience === 'members'
                        ? 'Members'
                        : 'Recipients'
                    }`}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Visual Preview */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
              <Eye className="h-4 w-4 text-brand" />
              <span>2. Live Inbox Preview</span>
            </div>
            <div className="flex items-center gap-1 bg-cream/60 p-1 rounded-lg border border-hairline">
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`p-1.5 rounded text-xs transition-colors ${
                  previewDevice === 'desktop' ? 'bg-white shadow text-brand font-bold' : 'text-muted hover:text-ink'
                }`}
                title="Desktop View"
              >
                <Monitor className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`p-1.5 rounded text-xs transition-colors ${
                  previewDevice === 'mobile' ? 'bg-white shadow text-brand font-bold' : 'text-muted hover:text-ink'
                }`}
                title="Mobile View"
              >
                <Smartphone className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Email Preview Frame */}
          <div className="rounded-2xl border border-hairline bg-[#F8F7F3] p-4 sm:p-6 overflow-hidden shadow-inner flex justify-center">
            <div
              className={`w-full bg-white rounded-xl shadow-md border border-hairline/80 overflow-hidden transition-all ${
                previewDevice === 'mobile' ? 'max-w-[340px]' : 'max-w-[560px]'
              }`}
            >
              {/* Top gradient strip */}
              <div className="h-1.5 w-full bg-gradient-to-r from-brand via-gold to-brand" />

              {/* Email Brand Header */}
              <div className="p-5 text-center border-b border-hairline/40">
                <span className="font-display text-base font-extrabold uppercase tracking-[0.18em] text-brand block">
                  THE STUDENT CHAPTERS
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-muted block mt-0.5">
                  National Student Media &amp; Knowledge Network
                </span>
              </div>

              {/* Email Content */}
              <div className="p-6 space-y-4 text-left">
                {heading && (
                  <h3 className="font-display text-lg sm:text-xl font-bold text-ink leading-snug">{heading}</h3>
                )}

                <div className="text-xs sm:text-sm text-ink/80 space-y-3 leading-relaxed">
                  {body
                    .split('\n\n')
                    .filter(Boolean)
                    .map((paragraph, i) => (
                      <p key={i} className="whitespace-pre-line">
                        {paragraph}
                      </p>
                    ))}
                </div>

                {buttonLabel && buttonUrl && (
                  <div className="text-center pt-3 pb-1">
                    <span className="inline-block bg-brand hover:bg-brand-dark text-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded shadow-sm">
                      {buttonLabel} &rarr;
                    </span>
                  </div>
                )}
              </div>

              {/* Email Footer */}
              <div className="p-4 bg-cream/30 border-t border-hairline/40 text-center text-[10px] text-muted space-y-1">
                <p>&copy; {new Date().getFullYear()} THE STUDENT CHAPTERS™. All rights reserved.</p>
                <p>Independent student journalism, academic intelligence, and campus career awareness.</p>
                <p className="text-brand">
                  <u>Website</u> &bull; <u>Unsubscribe Preferences</u>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Broadcast History Table */}
      <div className="rounded-2xl border border-hairline bg-white p-6 shadow-sm space-y-4">
        <h2 className="font-display text-lg font-bold text-ink flex items-center gap-2">
          <Clock className="h-5 w-5 text-brand" />
          Broadcast History
        </h2>

        {logs.length === 0 ? (
          <p className="text-xs text-muted py-6 text-center">No broadcasts have been sent yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-hairline bg-cream/30 text-muted uppercase font-bold tracking-wider">
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3">Audience</th>
                  <th className="py-2.5 px-3">Delivered</th>
                  <th className="py-2.5 px-3">Sender</th>
                  <th className="py-2.5 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline/50">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-cream/20 transition-colors">
                    <td className="py-3 px-3 font-semibold text-ink max-w-[240px] truncate">{log.subject}</td>
                    <td className="py-3 px-3">
                      <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand uppercase tracking-wider">
                        {log.targetAudience}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-600">
                      {log.sentCount} / {log.recipientCount}
                    </td>
                    <td className="py-3 px-3 text-muted">{log.sentBy?.name || 'Admin'}</td>
                    <td className="py-3 px-3 text-muted">{new Date(log.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <Megaphone className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-ink">Confirm Broadcast Dispatch</h3>
              <p className="text-xs text-muted mt-1.5">
                You are about to send this email to{' '}
                <strong className="text-ink font-bold">
                  {activeAudienceCount} recipients ({targetAudience})
                </strong>
                . This action cannot be undone.
              </p>
            </div>

            <div className="bg-cream/30 p-3 rounded-lg text-left text-xs space-y-1 border border-hairline/60">
              <p>
                <strong>Subject:</strong> {subject}
              </p>
              <p>
                <strong>Audience:</strong> {targetAudience.toUpperCase()}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 rounded-lg border border-hairline px-4 py-2.5 text-xs font-semibold text-ink hover:bg-cream"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteBroadcast}
                className="flex-1 rounded-lg bg-brand px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-dark shadow-md"
              >
                Confirm &amp; Send Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
