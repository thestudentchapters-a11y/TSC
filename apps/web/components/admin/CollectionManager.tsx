'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Pencil, Plus, Search, Star, Trash2, X, Mail, Send, Sparkles, ShieldCheck, RefreshCw } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Field, Input, Textarea, Select, Checkbox } from '@/components/forms/Form';
import { Button } from '@/components/common/Button';
import { useToast } from '@/components/common/Toast';
import { collections, type CollectionDef, type FieldDef } from '@/lib/admin-collections';
import { cn, formatDate, slugify } from '@/lib/utils';

/* Demo datasets used as the base layer (replaced by API when connected). */
import {
  demoArticles, demoStories, demoCampuses, demoEpisodes, demoEvents,
  demoOpportunities, demoEditions, demoLegalArticles, flagshipCampaign,
  demoMembers, demoStorySubmissions, demoCampusSubmissions, demoContactMessages,
} from '@/data/content';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SEEDS: Record<string, any[]> = {
  articles: demoArticles,
  stories: demoStories,
  campuses: demoCampuses,
  episodes: demoEpisodes,
  events: demoEvents,
  opportunities: demoOpportunities,
  editions: demoEditions,
  legal: demoLegalArticles,
  campaign: [flagshipCampaign],
  members: demoMembers,
  storySubmissions: demoStorySubmissions,
  campusSubmissions: demoCampusSubmissions,
  contactMessages: demoContactMessages,
};

type Row = Record<string, unknown> & { id: string };

function loadRows(def: CollectionDef): Row[] {
  const overlay = (() => {
    try {
      return JSON.parse(window.localStorage.getItem(`tsc.admin.${def.key}`) ?? '{}') as { added?: Row[]; edits?: Record<string, Row>; deleted?: string[] };
    } catch {
      return {};
    }
  })();
  const base = (SEEDS[def.seedKey] ?? []).map((r) => ({ ...r })) as Row[];
  const rows = [
    ...(overlay.added ?? []),
    ...base.map((r) => ({ ...r, ...(overlay.edits?.[r.id] ?? {}) })),
  ];
  return rows.filter((r) => !(overlay.deleted ?? []).includes(r.id));
}

function persist(def: CollectionDef, rows: Row[], originalIds: Set<string>) {
  const added = rows.filter((r) => !originalIds.has(r.id));
  const edits: Record<string, Row> = {};
  const deleted: string[] = [];
  // store diffs simply: added rows + edited seeds; deleted = seeds missing from rows
  const overlay = {
    added: added.map((r) => ({ ...r })),
    edits,
    deleted,
  };
  // For simplicity in demo mode we persist the full list under `added` when seeds were edited
  const seedIds = Array.from(originalIds);
  const keptSeedIds = rows.map((r) => r.id).filter((id) => originalIds.has(id));
  overlay.deleted = seedIds.filter((id) => !keptSeedIds.includes(id));
  const editedSeeds = rows.filter((r) => originalIds.has(r.id) && SEEDS[def.seedKey]?.find((s) => (s as Row).id === r.id && JSON.stringify(s) !== JSON.stringify(r)));
  overlay.edits = Object.fromEntries(editedSeeds.map((r) => [r.id, r]));
  window.localStorage.setItem(`tsc.admin.${def.key}`, JSON.stringify(overlay));
}

/**
 * Generic collection manager: list, search, create, edit, delete, publish
 * and feature toggles. With the API connected it syncs over REST; in demo
 * mode edits persist in this browser (clearly labelled).
 */
export function CollectionManager({ collectionKey, presetFilter }: { collectionKey: string; presetFilter?: Record<string, string> }) {
  const def = collections[collectionKey];
  const { push } = useToast();
  const api = process.env.NEXT_PUBLIC_API_URL;
  const token = typeof window !== 'undefined' ? localStorage.getItem('tsc_token') : null;

  const [rows, setRows] = useState<Row[]>([]);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const originalIds = useMemo(() => new Set((SEEDS[def?.seedKey] ?? []).map((r) => (r as Row).id)), [def]);

  // Broadcast & Auto Write Mail Review State
  const [broadcastRow, setBroadcastRow] = useState<Row | null>(null);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastPreview, setBroadcastPreview] = useState('');
  const [broadcastHeading, setBroadcastHeading] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [broadcastButtonLabel, setBroadcastButtonLabel] = useState('');
  const [broadcastButtonUrl, setBroadcastButtonUrl] = useState('');
  const [broadcastAudience, setBroadcastAudience] = useState<'all' | 'subscribers' | 'members'>('all');
  const [broadcastTestEmail, setBroadcastTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [generatingDraft, setGeneratingDraft] = useState(false);

  useEffect(() => {
    if (def) setRows(loadRows(def));
    setReady(true);
  }, [def]);

  const save = useCallback(
    (updated: Row[]) => {
      if (!def) return;
      setRows(updated);
      if (!api) persist(def, updated, originalIds);
    },
    [def, api, originalIds]
  );

  if (!def) {
    return <p className="text-sm text-muted">Unknown collection “{collectionKey}”.</p>;
  }
  if (!ready) return <p className="text-sm text-muted">Loading…</p>;

  let visible = rows;
  if (presetFilter) {
    visible = visible.filter((r) => Object.entries(presetFilter).every(([k, v]) => String(r[k]) === v));
  }
  if (statusFilter && def.filters) {
    visible = visible.filter((r) => String(r[def.filters!.key]) === statusFilter);
  }
  if (query) {
    const q = query.toLowerCase();
    visible = visible.filter((r) => Object.values(r).some((v) => typeof v === 'string' && v.toLowerCase().includes(q)));
  }

  const toggleField = (row: Row, field: string) => {
    const updated = rows.map((r) => (r.id === row.id ? { ...r, [field]: !r[field] } : r));
    save(updated);
    push(`${field === 'featured' ? 'Featured flag' : 'Value'} updated.`, 'success');
  };

  const remove = (row: Row) => {
    if (!window.confirm(`Delete “${String(row.title ?? row.name ?? row.id)}”? This cannot be undone in demo mode.`)) return;
    save(rows.filter((r) => r.id !== row.id));
    push('Deleted.', 'info');
  };

  const upsert = (row: Row) => {
    const exists = rows.some((r) => r.id === row.id);
    save(exists ? rows.map((r) => (r.id === row.id ? row : r)) : [row, ...rows]);
    setEditing(null);
    setCreating(false);
    push(exists ? 'Item updated.' : 'Item created.', 'success');
  };

  const handleOpenRowBroadcast = async (row: Row) => {
    setBroadcastRow(row);
    setIsBroadcastOpen(true);
    setGeneratingDraft(true);

    const title = String(row.title || row.name || 'Important Update');
    const summary = String(row.summary || row.excerpt || row.description || row.intro || '');
    const slug = String(row.slug || row.id || '');

    try {
      if (api) {
        const res = await fetch(`${api}/api/admin/broadcasts/auto-write`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            contentType: collectionKey,
            title,
            summary,
            slug,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          const d = json.data;
          setBroadcastSubject(d.subject);
          setBroadcastPreview(d.previewText || d.subject);
          setBroadcastHeading(d.heading || d.subject);
          setBroadcastBody(d.body);
          setBroadcastButtonLabel(d.buttonLabel || 'Read Full Story');
          setBroadcastButtonUrl(d.buttonUrl || `https://thestudentchapters.org/${collectionKey}/${slug}`);
          setGeneratingDraft(false);
          return;
        }
      }
    } catch {}

    // Fallback draft
    setBroadcastSubject(`📢 New on TSC: ${title}`);
    setBroadcastPreview(summary ? summary.slice(0, 80) : 'Read the latest published update.');
    setBroadcastHeading(title);
    setBroadcastBody(`Dear Reader,\n\nA new ${def.singular.toLowerCase()} has been published on THE STUDENT CHAPTERS™:\n\n**${title}**\n\n${summary || 'Explore the full story and campus insights directly on our platform.'}\n\nOur editorial team brings you authentic voices and investigative narratives from the heart of universities.`);
    setBroadcastButtonLabel(`Read ${def.singular}`);
    setBroadcastButtonUrl(`https://thestudentchapters.org/${collectionKey}/${slug}`);
    setGeneratingDraft(false);
  };

  const handleSendBroadcastTest = async () => {
    if (!broadcastSubject.trim() || !broadcastBody.trim()) {
      push('Please provide a subject and body message.', 'error');
      return;
    }
    setSendingTest(true);
    try {
      if (api) {
        await fetch(`${api}/api/admin/broadcasts/test`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            subject: broadcastSubject,
            previewText: broadcastPreview,
            heading: broadcastHeading,
            body: broadcastBody,
            buttonLabel: broadcastButtonLabel,
            buttonUrl: broadcastButtonUrl,
            testEmail: broadcastTestEmail,
          }),
        });
      }
      push('Test email dispatched to admin inbox!', 'success');
    } catch {
      push('Test email simulated.', 'info');
    } finally {
      setSendingTest(false);
    }
  };

  const handleDispatchRowBroadcast = async () => {
    setDispatching(true);
    try {
      if (api) {
        await fetch(`${api}/api/admin/broadcasts/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            targetAudience: broadcastAudience,
            subject: broadcastSubject,
            previewText: broadcastPreview,
            heading: broadcastHeading,
            body: broadcastBody,
            buttonLabel: broadcastButtonLabel,
            buttonUrl: broadcastButtonUrl,
          }),
        });
      }
      push('🎉 Broadcast email dispatched to recipients!', 'success');
      setIsBroadcastOpen(false);
    } catch {
      push('Broadcast simulated.', 'success');
      setIsBroadcastOpen(false);
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div>
      {/* toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-[6px] border border-hairline bg-white px-3.5 py-2.5">
            <Search aria-hidden className="h-4 w-4 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${def.title.toLowerCase()}…`}
              aria-label={`Search ${def.title}`}
              className="w-56 bg-transparent text-sm focus:outline-none"
            />
          </div>
          {def.filters && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label={def.filters.label}
              className="rounded-[6px] border border-hairline bg-white px-3 py-2.5 text-sm"
            >
              <option value="">All {def.filters.label.toLowerCase()}</option>
              {def.filters.options.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          )}
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            {visible.length} item{visible.length === 1 ? '' : 's'}
          </span>
        </div>
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus aria-hidden className="h-4 w-4" /> New {def.singular}
        </Button>
      </div>

      {!api && (
        <p className="mt-4 rounded-md border border-gold/40 bg-gold-50 px-4 py-2.5 text-xs leading-5 text-ink/70">
          <strong>Demo mode:</strong> edits are saved in this browser only. Connect the TSC API
          (NEXT_PUBLIC_API_URL) for live database CRUD with auth.
        </p>
      )}

      {/* table */}
      <div className="mt-6 overflow-x-auto rounded-md border border-hairline bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-hairline bg-cream">
              {def.columns.map((c) => (
                <th key={c.name} className="px-4 py-3 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                  {c.label}
                </th>
              ))}
              <th className="px-4 py-3 text-right font-display text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {visible.map((row) => (
                <motion.tr
                  key={row.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="border-b border-hairline/70 last:border-0 hover:bg-cream/60"
                >
                  {def.columns.map((c, i) => (
                    <td key={c.name} className={cn('px-4 py-3', i === 0 && 'font-semibold text-ink')}>
                      <CellRender row={row} col={c} onToggle={() => c.type === 'bool' && toggleField(row, c.name)} />
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {def.fields.some((f) => f.name === 'featured') && (
                        <button
                          type="button"
                          aria-label="Toggle featured"
                          title="Toggle featured"
                          onClick={() => toggleField(row, 'featured')}
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-full border transition-colors',
                            row.featured ? 'border-gold bg-gold-50 text-gold-deep' : 'border-hairline text-muted hover:border-gold hover:text-gold-deep'
                          )}
                        >
                          <Star className={cn('h-3.5 w-3.5', row.featured ? 'fill-current' : undefined)} />
                        </button>
                      )}
                      <button
                        type="button"
                        aria-label="Auto Write Mail & Broadcast"
                        title="Auto write notification mail & broadcast"
                        onClick={() => handleOpenRowBroadcast(row)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-hairline text-muted transition-colors hover:border-brand hover:text-brand"
                      >
                        <Mail aria-hidden className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label="Edit"
                        onClick={() => setEditing(row)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-hairline text-muted transition-colors hover:border-brand hover:text-brand"
                      >
                        <Pencil aria-hidden className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label="Delete"
                        onClick={() => remove(row)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-hairline text-muted transition-colors hover:border-red-400 hover:text-red-600"
                      >
                        <Trash2 aria-hidden className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
            {visible.length === 0 && (
              <tr>
                <td colSpan={def.columns.length + 1} className="px-4 py-10 text-center text-sm text-muted">
                  Nothing here yet — create the first {def.singular.toLowerCase()}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* editor modal */}
      <Modal open={!!editing || creating} onClose={() => { setEditing(null); setCreating(false); }} title={editing ? `Edit ${def.singular}` : `New ${def.singular}`} wide>
        <ItemForm def={def} initial={editing} onSubmit={upsert} onCancel={() => { setEditing(null); setCreating(false); }} />
      </Modal>

      {/* broadcast review modal */}
      {isBroadcastOpen && broadcastRow && (
        <Modal
          open={isBroadcastOpen}
          onClose={() => {
            if (!dispatching) setIsBroadcastOpen(false);
          }}
          title={`📧 Auto Write & Broadcast: ${String(broadcastRow.title ?? broadcastRow.name ?? 'Item')}`}
          wide
        >
          <div className="space-y-5">
            <div className="rounded-xl border border-gold/40 bg-gold-50 p-3.5 text-xs leading-relaxed text-ink/90 flex items-start gap-2.5">
              <ShieldCheck className="h-5 w-5 text-gold-deep shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-ink">Admin Editorial Review: </span>
                <span>
                  The notification email copy was auto-written with AI. You can customize any field, send a test email to your inbox, and approve before broadcasting to subscribers.
                </span>
              </div>
            </div>

            {generatingDraft ? (
              <div className="p-8 text-center text-sm text-muted">
                <RefreshCw className="h-5 w-5 animate-spin mx-auto text-brand mb-2" />
                Drafting notification email copy…
              </div>
            ) : (
              <div className="space-y-4 text-left">
                <div>
                  <label className="mb-1 block font-display text-xs font-bold uppercase tracking-wider text-ink">
                    Target Audience:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setBroadcastAudience('all')}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all text-center border ${
                        broadcastAudience === 'all'
                          ? 'border-brand bg-brand text-white shadow-sm'
                          : 'border-hairline bg-cream/40 text-ink/80 hover:bg-cream'
                      }`}
                    >
                      All Combined Reach
                    </button>
                    <button
                      type="button"
                      onClick={() => setBroadcastAudience('subscribers')}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all text-center border ${
                        broadcastAudience === 'subscribers'
                          ? 'border-brand bg-brand text-white shadow-sm'
                          : 'border-hairline bg-cream/40 text-ink/80 hover:bg-cream'
                      }`}
                    >
                      Subscribers
                    </button>
                    <button
                      type="button"
                      onClick={() => setBroadcastAudience('members')}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all text-center border ${
                        broadcastAudience === 'members'
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
                    value={broadcastSubject}
                    onChange={(e) => setBroadcastSubject(e.target.value)}
                    className="w-full rounded-md border border-hairline px-3 py-2 text-xs focus:border-brand focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-display text-xs font-bold text-ink">
                    Banner Headline
                  </label>
                  <input
                    type="text"
                    value={broadcastHeading}
                    onChange={(e) => setBroadcastHeading(e.target.value)}
                    className="w-full rounded-md border border-hairline px-3 py-2 text-xs focus:border-brand focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-display text-xs font-bold text-ink">
                    Body Message <span className="text-gold-deep">*</span>
                  </label>
                  <textarea
                    rows={5}
                    value={broadcastBody}
                    onChange={(e) => setBroadcastBody(e.target.value)}
                    className="w-full rounded-md border border-hairline px-3 py-2 text-xs focus:border-brand focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block font-display text-xs font-bold text-ink">CTA Button Label</label>
                    <input
                      type="text"
                      value={broadcastButtonLabel}
                      onChange={(e) => setBroadcastButtonLabel(e.target.value)}
                      className="w-full rounded-md border border-hairline px-3 py-1.5 text-xs focus:border-brand focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-display text-xs font-bold text-ink">CTA Button Link</label>
                    <input
                      type="text"
                      value={broadcastButtonUrl}
                      onChange={(e) => setBroadcastButtonUrl(e.target.value)}
                      className="w-full rounded-md border border-hairline px-3 py-1.5 text-xs focus:border-brand focus:outline-none"
                    />
                  </div>
                </div>

                {/* Test send */}
                <div className="bg-cream/40 p-3 rounded-lg border border-hairline flex gap-2 items-center">
                  <input
                    type="email"
                    value={broadcastTestEmail}
                    onChange={(e) => setBroadcastTestEmail(e.target.value)}
                    placeholder="admin@thestudentchapters.org"
                    className="flex-1 rounded border border-hairline px-2.5 py-1.5 text-xs bg-white focus:outline-none"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSendBroadcastTest}
                    disabled={sendingTest}
                  >
                    {sendingTest ? 'Sending…' : 'Send Test'}
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 border-t border-hairline pt-4">
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsBroadcastOpen(false)}
                disabled={dispatching}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleDispatchRowBroadcast}
                disabled={dispatching || generatingDraft}
                className="min-w-[170px]"
              >
                {dispatching ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" /> Dispatching…
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

function CellRender({ row, col, onToggle }: { row: Row; col: { name: string; label: string; type?: string }; onToggle: () => void }) {
  const value = row[col.name];
  if (col.type === 'bool') {
    return (
      <button type="button" onClick={onToggle} className={cn('rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider', value ? 'border-brand/30 bg-brand-50 text-brand' : 'border-hairline text-muted')}>
        {value ? 'Yes' : 'No'}
      </button>
    );
  }
  if (col.type === 'status') {
    const tone =
      value === 'published' || value === 'active' || value === 'approved'
        ? 'border-brand/30 bg-brand-50 text-brand'
        : value === 'rejected' || value === 'cancelled'
          ? 'border-red-200 bg-red-50 text-red-600'
          : 'border-gold/40 bg-gold-50 text-gold-deep';
    return <span className={cn('rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider', tone)}>{String(value ?? '—')}</span>;
  }
  if (col.type === 'badge') {
    return <span className="rounded-full border border-hairline bg-cream px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted">{String(value ?? '—')}</span>;
  }
  if (col.type === 'date') {
    return <span className="text-muted">{value ? formatDate(String(value)) : '—'}</span>;
  }
  const text = typeof value === 'string' || typeof value === 'number' ? String(value) : '—';
  return <span className="line-clamp-1 max-w-[280px]">{text}</span>;
}

function ItemForm({ def, initial, onSubmit, onCancel }: { def: CollectionDef; initial: Row | null; onSubmit: (row: Row) => void; onCancel: () => void }) {
  const [values, setValues] = useState<Record<string, unknown>>(() => ({ ...(initial ?? {}) }));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setField = (name: string, value: unknown) => setValues((v) => ({ ...v, [name]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    for (const f of def.fields) {
      if (f.required && (values[f.name] === undefined || values[f.name] === null || values[f.name] === '')) {
        errs[f.name] = `${f.label} is required.`;
      }
    }
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const title = String(values.title ?? values.name ?? '');
    const row: Row = {
      ...values,
      id: initial?.id ?? `new-${Date.now()}`,
      slug: values.slug ? String(values.slug) : slugify(title || 'item'),
      createdAt: initial?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Row;
    onSubmit(row);
  };

  const renderField = (f: FieldDef) => {
    const v = values[f.name];
    const id = `f-${f.name}`;
    switch (f.type) {
      case 'textarea':
        return <Textarea id={id} value={String(v ?? '')} onChange={(e) => setField(f.name, e.target.value)} />;
      case 'select':
        return (
          <Select id={id} value={String(v ?? '')} onChange={(e) => setField(f.name, e.target.value)}>
            <option value="">Select…</option>
            {f.options?.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </Select>
        );
      case 'checkbox':
        return <Checkbox id={id} label={f.label} checked={!!v} onChange={(e) => setField(f.name, e.target.checked)} />;
      case 'date':
        return <Input id={id} type="date" value={String(v ?? '').slice(0, 10)} onChange={(e) => setField(f.name, e.target.value)} />;
      case 'number':
        return <Input id={id} type="number" value={String(v ?? '')} onChange={(e) => setField(f.name, Number(e.target.value))} />;
      case 'image':
        return (
          <div className="space-y-2">
            <Input id={id} value={String(v ?? '')} onChange={(e) => setField(f.name, e.target.value)} placeholder="/images/… or https://…" />
            {v ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={String(v)} alt="Preview" className="h-20 w-32 rounded border border-hairline object-cover" />
            ) : null}
          </div>
        );
      case 'tags':
        return <Input id={id} value={Array.isArray(v) ? (v as string[]).join(', ') : String(v ?? '')} onChange={(e) => setField(f.name, e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} placeholder="comma, separated, tags" />;
      default:
        return <Input id={id} value={String(v ?? '')} onChange={(e) => setField(f.name, e.target.value)} />;
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        {def.fields.map((f) => (
          <div key={f.name} className={cn(f.width === 'half' ? 'sm:col-span-1' : 'sm:col-span-2')}>
            {f.type === 'checkbox' ? (
              renderField(f)
            ) : (
              <Field label={f.label} htmlFor={`f-${f.name}`} required={f.required} error={errors[f.name]} hint={f.hint}>
                {renderField(f)}
              </Field>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-3 border-t border-hairline pt-4">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X aria-hidden className="h-4 w-4" /> Cancel
        </Button>
        <Button type="submit" size="sm" arrow>
          {initial ? 'Save Changes' : `Create ${def.singular}`}
        </Button>
      </div>
    </form>
  );
}
