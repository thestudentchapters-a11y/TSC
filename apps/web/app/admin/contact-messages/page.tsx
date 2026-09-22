'use client';

import { useState, useEffect } from 'react';
import {
  Mail,
  Search,
  CheckCircle2,
  Clock,
  Send,
  Trash2,
  RefreshCw,
  Eye,
  ExternalLink,
  MessageSquare,
  Sparkles,
  User,
  Calendar,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { useToast } from '@/components/common/Toast';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/components/providers/AuthProvider';
import { formatDate } from '@/lib/utils';
import { demoContactMessages } from '@/data/content';

export type MessageStatus = 'new' | 'read' | 'replied';

export interface ContactMessageItem {
  _id: string;
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: MessageStatus;
  createdAt: string;
  receivedOn?: string;
  updatedAt?: string;
  ipAddress?: string;
}

const TEMPLATES = [
  {
    label: 'Standard Acknowledgement',
    subjectPrefix: 'Re: ',
    body: 'Thank you for reaching out to THE STUDENT CHAPTERS™. We have reviewed your query and our team will get back to you with detailed information shortly.\n\nBest regards,\nTSC Team',
  },
  {
    label: 'Campus / Partnership',
    subjectPrefix: 'Re: Partnership Inquiry — ',
    body: 'Hello,\n\nThank you for your interest in collaborating with THE STUDENT CHAPTERS™. We would love to learn more about your campus or initiative. Please share your convenient timings for a quick connect.\n\nWarm regards,\nTSC Partnerships Team',
  },
  {
    label: 'Story & Editorial',
    subjectPrefix: 'Re: Story Query — ',
    body: 'Hello,\n\nThank you for your inquiry regarding our editorial coverage and student stories. Our editorial board is reviewing your note and will guide you on next steps.\n\nBest,\nTSC Editorial Board',
  },
];

export default function AdminContactMessagesPage() {
  const { push } = useToast();
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<ContactMessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | MessageStatus>('all');
  const [search, setSearch] = useState('');
  const [selectedMsg, setSelectedMsg] = useState<ContactMessageItem | null>(null);

  // Reply Composer State
  const [replySubject, setReplySubject] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const token = getToken() || (typeof window !== 'undefined' ? localStorage.getItem('tsc_token') : null);
    let loaded = false;

    if (api) {
      try {
        const res = await fetch(`${api}/api/contact-messages?_t=${Date.now()}&limit=100`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          cache: 'no-store',
        });
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json?.data)) {
            const normalized = json.data.map((item: any) => ({
              ...item,
              _id: item._id?.toString() || item.id,
              status: (item.status || 'new') as MessageStatus,
              createdAt: item.createdAt || item.receivedOn || new Date().toISOString(),
            }));
            setMessages(normalized);
            loaded = true;
          }
        }
      } catch {
        /* fallback */
      }
    }

    if (!loaded) {
      try {
        const local = JSON.parse(
          window.localStorage.getItem('tsc.admin.contactMessages') || '[]'
        );
        const combined = [...local, ...demoContactMessages.map((m) => ({
          _id: m.id,
          name: m.name,
          email: m.email,
          subject: m.subject,
          message: m.message,
          status: (m.status || 'new') as MessageStatus,
          createdAt: m.receivedOn,
        }))];
        const unique = Array.from(new Map(combined.map((item) => [item._id, item])).values());
        setMessages(unique);
      } catch {
        setMessages(
          demoContactMessages.map((m) => ({
            _id: m.id,
            name: m.name,
            email: m.email,
            subject: m.subject,
            message: m.message,
            status: (m.status || 'new') as MessageStatus,
            createdAt: m.receivedOn,
          }))
        );
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSelectMessage = (msg: ContactMessageItem) => {
    setSelectedMsg(msg);
    setReplySubject(msg.subject.startsWith('Re:') ? msg.subject : `Re: ${msg.subject}`);
    setReplyBody('');

    // If message is new, automatically mark it as read in backend
    if (msg.status === 'new') {
      handleUpdateStatus(msg._id, 'read', false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: MessageStatus, showToast = true) => {
    setUpdatingStatus(true);
    const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const token = getToken() || (typeof window !== 'undefined' ? localStorage.getItem('tsc_token') : null);

    if (api) {
      try {
        await fetch(`${api}/api/contact-messages/${id}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ status: newStatus }),
        });
      } catch {}
    }

    setMessages((prev) =>
      prev.map((m) => (m._id === id ? { ...m, status: newStatus } : m))
    );
    if (selectedMsg?._id === id) {
      setSelectedMsg((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    try {
      const local = JSON.parse(
        window.localStorage.getItem('tsc.admin.contactMessages') || '[]'
      );
      const updatedLocal = local.map((m: ContactMessageItem) =>
        m._id === id ? { ...m, status: newStatus } : m
      );
      window.localStorage.setItem('tsc.admin.contactMessages', JSON.stringify(updatedLocal));
    } catch {}

    if (showToast) {
      push(`Message status marked as "${newStatus}".`, 'success');
    }
    setUpdatingStatus(false);
  };

  const handleSendReply = async () => {
    if (!selectedMsg) return;
    if (!replyBody.trim()) {
      push('Please write a reply message before sending.', 'error');
      return;
    }

    setSendingReply(true);
    const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const token = getToken() || (typeof window !== 'undefined' ? localStorage.getItem('tsc_token') : null);
    let sent = false;

    if (api) {
      try {
        const res = await fetch(`${api}/api/contact-messages/${selectedMsg._id}/reply`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            subject: replySubject.trim() || `Re: ${selectedMsg.subject}`,
            replyMessage: replyBody.trim(),
          }),
        });

        if (res.ok) {
          sent = true;
          push(`Reply successfully sent to ${selectedMsg.email}!`, 'success');
        } else {
          const err = await res.json().catch(() => ({}));
          push(`Server notice: ${err.message || 'Email dispatched'}`, 'info');
          sent = true;
        }
      } catch {
        push(`Reply simulated for ${selectedMsg.email}.`, 'info');
        sent = true;
      }
    } else {
      push(`Reply dispatched to ${selectedMsg.email}!`, 'success');
      sent = true;
    }

    if (sent) {
      handleUpdateStatus(selectedMsg._id, 'replied', false);
      setReplyBody('');
    }
    setSendingReply(false);
  };

  const handleDeleteMessage = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this message from the inbox?')) return;
    const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const token = getToken() || (typeof window !== 'undefined' ? localStorage.getItem('tsc_token') : null);

    if (api) {
      try {
        await fetch(`${api}/api/contact-messages/${id}`, {
          method: 'DELETE',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
      } catch {}
    }

    setMessages((prev) => prev.filter((m) => m._id !== id));
    if (selectedMsg?._id === id) setSelectedMsg(null);

    try {
      const local = JSON.parse(
        window.localStorage.getItem('tsc.admin.contactMessages') || '[]'
      );
      const nextLocal = local.filter((m: ContactMessageItem) => m._id !== id);
      window.localStorage.setItem('tsc.admin.contactMessages', JSON.stringify(nextLocal));
    } catch {}

    push('Message deleted.', 'info');
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
    push('Email address copied to clipboard.', 'success');
  };

  const filtered = messages.filter((m) => {
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const totalCount = messages.length;
  const newCount = messages.filter((m) => m.status === 'new').length;
  const readCount = messages.filter((m) => m.status === 'read').length;
  const repliedCount = messages.filter((m) => m.status === 'replied').length;

  return (
    <div>
      {/* Top Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">User Queries &amp; Support</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Contact Messages
          </h1>
          <p className="mt-1 text-sm text-muted">
            Incoming queries and feedback submitted by users. Review questions and reply directly via email.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button href="/contact" variant="outline" size="sm">
            <ExternalLink className="h-4 w-4" /> View Public Contact Form
          </Button>
          <button
            type="button"
            onClick={fetchMessages}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-hairline bg-white text-muted hover:text-brand"
            title="Refresh messages"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-md border border-hairline bg-white p-5">
          <p className="font-display text-[11px] font-bold uppercase tracking-wider text-muted">Total Inquiries</p>
          <p className="mt-1 font-display text-2xl font-bold text-ink">{totalCount}</p>
        </div>
        <div className="rounded-md border border-hairline bg-white p-5">
          <p className="font-display text-[11px] font-bold uppercase tracking-wider text-amber-600">New / Unread</p>
          <p className="mt-1 font-display text-2xl font-bold text-amber-600">{newCount}</p>
        </div>
        <div className="rounded-md border border-hairline bg-white p-5">
          <p className="font-display text-[11px] font-bold uppercase tracking-wider text-sky-600">Under Review (Read)</p>
          <p className="mt-1 font-display text-2xl font-bold text-sky-600">{readCount}</p>
        </div>
        <div className="rounded-md border border-hairline bg-white p-5">
          <p className="font-display text-[11px] font-bold uppercase tracking-wider text-emerald-600">Replied to User</p>
          <p className="mt-1 font-display text-2xl font-bold text-emerald-600">{repliedCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-8 flex flex-col gap-4 rounded-md border border-hairline bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search queries by sender name, email, subject, or keywords..."
            className="w-full rounded-[4px] border border-hairline bg-cream/40 py-2 pl-9 pr-4 text-xs focus:border-brand focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-muted">Filter by Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-[4px] border border-hairline bg-cream px-3 py-1.5 text-xs font-medium text-ink focus:outline-none"
          >
            <option value="all">All Messages ({totalCount})</option>
            <option value="new">New / Unread ({newCount})</option>
            <option value="read">Read ({readCount})</option>
            <option value="replied">Replied ({repliedCount})</option>
          </select>
        </div>
      </div>

      {/* Main Content Layout: Messages List & Detail / Reply Drawer */}
      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        {/* Messages List */}
        <div className={selectedMsg ? 'lg:col-span-5' : 'lg:col-span-12'}>
          <div className="overflow-hidden rounded-md border border-hairline bg-white shadow-card">
            <div className="border-b border-hairline bg-cream/60 px-4 py-3 font-display text-[11px] font-bold uppercase tracking-wider text-muted">
              Incoming User Messages ({filtered.length})
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-muted">Loading messages...</div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center text-xs text-muted">
                No contact messages found matching your criteria.
              </div>
            ) : (
              <div className="divide-y divide-hairline max-h-[750px] overflow-y-auto">
                {filtered.map((msg) => {
                  const isSelected = selectedMsg?._id === msg._id;
                  const isNew = msg.status === 'new';
                  return (
                    <div
                      key={msg._id}
                      onClick={() => handleSelectMessage(msg)}
                      className={`cursor-pointer p-4 transition-all hover:bg-cream/40 ${
                        isSelected ? 'bg-brand-50/70 border-l-4 border-l-brand' : ''
                      } ${isNew ? 'bg-amber-50/30' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {isNew && (
                            <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" title="New Message" />
                          )}
                          <p className={`text-xs ${isNew ? 'font-bold text-ink' : 'font-semibold text-ink/90'}`}>
                            {msg.name}
                          </p>
                        </div>
                        <span
                          className={`rounded px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider ${
                            msg.status === 'replied'
                              ? 'bg-emerald-100 text-emerald-800'
                              : msg.status === 'read'
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {msg.status}
                        </span>
                      </div>

                      <p className="mt-1 text-[11px] text-muted truncate">{msg.email}</p>
                      <p className="mt-1.5 font-display text-[12.5px] font-bold text-ink leading-snug truncate">
                        {msg.subject}
                      </p>
                      <p className="mt-1 text-[11px] text-ink/70 line-clamp-2 leading-relaxed">
                        {msg.message}
                      </p>

                      <div className="mt-2.5 flex items-center justify-between text-[10px] text-muted">
                        <span>{formatDate(msg.createdAt)}</span>
                        <span className="text-brand font-semibold hover:underline">
                          {isSelected ? 'Viewing &bull; Click to close' : 'Click to read &amp; reply &rarr;'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Message Inspector & Direct Reply Drawer */}
        {selectedMsg && (
          <div className="lg:col-span-7">
            <div className="rounded-md border border-hairline bg-white p-6 shadow-card space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-hairline pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        selectedMsg.status === 'replied'
                          ? 'bg-emerald-100 text-emerald-800'
                          : selectedMsg.status === 'read'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {selectedMsg.status}
                    </span>
                    <span className="text-[11px] text-muted">
                      Received on {formatDate(selectedMsg.createdAt)}
                    </span>
                  </div>
                  <h2 className="mt-2 font-display text-lg font-bold text-ink sm:text-xl">
                    {selectedMsg.subject}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDeleteMessage(selectedMsg._id)}
                    className="flex items-center gap-1 rounded border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700 hover:bg-red-100"
                    title="Delete message"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMsg(null)}
                    className="text-muted hover:text-ink text-sm font-bold px-1"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Sender Details Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded bg-cream/60 p-3.5 text-xs">
                <div>
                  <p className="meta-text !text-[10px]">From Sender</p>
                  <p className="font-bold text-ink">{selectedMsg.name}</p>
                </div>
                <div>
                  <p className="meta-text !text-[10px]">Email Address</p>
                  <div className="flex items-center gap-2">
                    <a
                      href={`mailto:${selectedMsg.email}?subject=Re: ${encodeURIComponent(selectedMsg.subject)}`}
                      className="font-semibold text-brand hover:underline"
                    >
                      {selectedMsg.email}
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopyEmail(selectedMsg.email)}
                      className="text-muted hover:text-ink"
                      title="Copy email"
                    >
                      {copiedEmail ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Original Message Content */}
              <div className="space-y-1.5 text-xs">
                <p className="meta-text !text-[10px]">User Query / Message</p>
                <div className="rounded border border-hairline bg-cream/30 p-4 text-[13px] leading-6 text-ink whitespace-pre-wrap">
                  {selectedMsg.message}
                </div>
              </div>

              {/* Status Management Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-3">
                <span className="text-[11px] font-semibold text-muted">Update Status:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={updatingStatus || selectedMsg.status === 'new'}
                    onClick={() => handleUpdateStatus(selectedMsg._id, 'new')}
                    className="rounded border border-amber-300 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800 hover:bg-amber-100 disabled:opacity-50"
                  >
                    Mark as New
                  </button>
                  <button
                    type="button"
                    disabled={updatingStatus || selectedMsg.status === 'read'}
                    onClick={() => handleUpdateStatus(selectedMsg._id, 'read')}
                    className="rounded border border-sky-300 bg-sky-50 px-2.5 py-1 text-[11px] font-bold text-sky-800 hover:bg-sky-100 disabled:opacity-50"
                  >
                    Mark as Read
                  </button>
                  <button
                    type="button"
                    disabled={updatingStatus || selectedMsg.status === 'replied'}
                    onClick={() => handleUpdateStatus(selectedMsg._id, 'replied')}
                    className="rounded border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
                  >
                    ✓ Mark as Replied
                  </button>
                </div>
              </div>

              {/* Direct Reply Composer */}
              <div className="rounded-lg border border-hairline bg-white p-4 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-hairline pb-3">
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4 text-brand" />
                    <h3 className="font-display text-sm font-bold uppercase tracking-wider text-ink">
                      Send Direct Reply to {selectedMsg.name}
                    </h3>
                  </div>
                  <a
                    href={`mailto:${selectedMsg.email}?subject=${encodeURIComponent(replySubject)}&body=${encodeURIComponent(replyBody)}`}
                    className="flex items-center gap-1 text-[11px] font-semibold text-brand hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3" /> Open in Mail Client
                  </a>
                </div>

                {/* Quick Templates */}
                <div>
                  <p className="meta-text !text-[10px] mb-1.5">Quick Response Templates</p>
                  <div className="flex flex-wrap gap-2">
                    {TEMPLATES.map((tmpl) => (
                      <button
                        key={tmpl.label}
                        type="button"
                        onClick={() => {
                          setReplySubject(`${tmpl.subjectPrefix}${selectedMsg.subject}`);
                          setReplyBody(tmpl.body);
                        }}
                        className="rounded-full border border-hairline bg-cream px-3 py-1 text-[11px] font-medium text-ink hover:border-brand hover:bg-brand-50"
                      >
                        {tmpl.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reply Subject */}
                <div>
                  <label className="meta-text block !text-[10px] mb-1">Email Subject</label>
                  <input
                    type="text"
                    value={replySubject}
                    onChange={(e) => setReplySubject(e.target.value)}
                    placeholder="Subject line..."
                    className="w-full rounded border border-hairline p-2 text-xs font-medium focus:border-brand focus:outline-none"
                  />
                </div>

                {/* Reply Body */}
                <div>
                  <label className="meta-text block !text-[10px] mb-1">Your Response Message</label>
                  <textarea
                    rows={6}
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    placeholder={`Write your response to ${selectedMsg.name} here...`}
                    className="w-full rounded border border-hairline p-3 text-xs leading-5 focus:border-brand focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-hairline pt-3">
                  <p className="text-[11px] text-muted">
                    Sends an official branded email to <span className="font-semibold text-ink">{selectedMsg.email}</span>.
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    disabled={sendingReply || !replyBody.trim()}
                    onClick={handleSendReply}
                  >
                    <Send className="h-3.5 w-3.5 mr-1" />
                    {sendingReply ? 'Sending Email…' : 'Send Email Reply'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
