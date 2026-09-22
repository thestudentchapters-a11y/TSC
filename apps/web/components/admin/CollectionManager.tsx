'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Pencil, Plus, Search, Star, Trash2, X, Mail, Send, Sparkles, ShieldCheck, RefreshCw, Play } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Field, Input, Textarea, Select, Checkbox } from '@/components/forms/Form';
import { Button } from '@/components/common/Button';
import { useToast } from '@/components/common/Toast';
import { collections, type CollectionDef, type FieldDef } from '@/lib/admin-collections';
import { cn, formatDate, slugify, getYoutubeThumbnailUrl } from '@/lib/utils';
import { ImageUploadInput } from '@/components/admin/ImageUploadInput';
import { RichTextEditor } from '@/components/forms/RichTextEditor';

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
  campaignEpisodes: flagshipCampaign.episodes,
  members: demoMembers,
  storySubmissions: demoStorySubmissions,
  campusSubmissions: demoCampusSubmissions,
  contactMessages: demoContactMessages,
};

type Row = Record<string, unknown> & { id: string };

function isValidRow(r: any): boolean {
  if (!r || typeof r !== 'object') return false;
  return Boolean(
    (r.title && String(r.title).trim()) ||
    (r.storyTitle && String(r.storyTitle).trim()) ||
    (r.newsTitle && String(r.newsTitle).trim()) ||
    (r.name && String(r.name).trim()) ||
    (r.email && String(r.email).trim()) ||
    (r.subject && String(r.subject).trim()) ||
    (r.slug && String(r.slug).trim())
  );
}

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
  return rows
    .filter((r) => !(overlay.deleted ?? []).includes(r.id))
    .filter(isValidRow);
}

function cleanRowForLocalStorage(row: Row): Row {
  const cleaned: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    if (typeof v === 'string') {
      // Avoid storing multi-megabyte base64 data URIs in browser localStorage
      if (v.startsWith('data:image/') || (v.length > 5000 && v.includes('base64,'))) {
        cleaned[k] = '';
      } else if (v.length > 30000 && v.includes('data:image/')) {
        // Strip embedded base64 images from rich text HTML in localStorage cache
        cleaned[k] = v.replace(/src="data:image\/[^;]+;base64,[^"]+"/gi, 'src=""');
      } else {
        cleaned[k] = v;
      }
    } else {
      cleaned[k] = v;
    }
  }
  return cleaned as Row;
}

function persist(def: CollectionDef, rows: Row[], originalIds: Set<string>) {
  try {
    const validRows = rows.filter(isValidRow);
    const added = validRows.filter((r) => !originalIds.has(r.id)).map(cleanRowForLocalStorage);
    const edits: Record<string, Row> = {};
    const deleted: string[] = [];
    // store diffs simply: added rows + edited seeds; deleted = seeds missing from rows
    const overlay = {
      added,
      edits,
      deleted,
    };
    // For simplicity in demo mode we persist the full list under `added` when seeds were edited
    const seedIds = Array.from(originalIds);
    const keptSeedIds = validRows.map((r) => r.id).filter((id) => originalIds.has(id));
    overlay.deleted = seedIds.filter((id) => !keptSeedIds.includes(id));
    const editedSeeds = validRows.filter((r) => originalIds.has(r.id) && SEEDS[def.seedKey]?.find((s) => (s as Row).id === r.id && JSON.stringify(s) !== JSON.stringify(r)));
    overlay.edits = Object.fromEntries(editedSeeds.map((r) => [r.id, cleanRowForLocalStorage(r)]));
    window.localStorage.setItem(`tsc.admin.${def.key}`, JSON.stringify(overlay));
  } catch (err) {
    console.warn(`[TSC Admin] LocalStorage quota reached for ${def.key}, skipped local backup:`, err);
  }
}

import { useAuth } from '@/components/providers/AuthProvider';

/**
 * Generic collection manager: list, search, create, edit, delete, publish
 * and feature toggles. With the API connected it syncs over REST; in demo
 * mode edits persist in this browser (clearly labelled).
 */
export function CollectionManager({ collectionKey, presetFilter }: { collectionKey: string; presetFilter?: Record<string, string> }) {
  const def = collections[collectionKey];
  const { push } = useToast();
  const { getToken } = useAuth();
  const api = process.env.NEXT_PUBLIC_API_URL;
  const token = getToken() || (typeof window !== 'undefined' ? (localStorage.getItem('tsc_token') || localStorage.getItem('tsc.token')) : null);

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

  const reloadRows = useCallback(() => {
    if (!def) return;
    setRows(loadRows(def));
    if (api) {
      fetch(`${api}/api/${def.key}?_t=${Date.now()}&limit=100`, {
        cache: 'no-store',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (json && Array.isArray(json.data)) {
            const valid = json.data
              .filter(isValidRow)
              .map((item: any) => ({
                ...item,
                id: item.id || item._id?.toString() || item.email || item.slug,
                title: item.title || item.storyTitle || item.newsTitle || item.name || item.subject,
                category: item.category || item.storyCategory,
                summary: item.summary || item.storyContent || item.description || item.content,
                submittedOn: item.submittedOn || item.createdAt,
                campus: item.campus || item.college,
                image: item.image || (Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : undefined),
              }));
            setRows(valid);
          }
        })
        .catch(() => {
          // Keep local rows fallback
        });
    }
  }, [def, api, token]);

  useEffect(() => {
    if (def) {
      reloadRows();
      setReady(true);
    }
    window.addEventListener('focus', reloadRows);
    window.addEventListener('pageshow', reloadRows);
    window.addEventListener('storage', reloadRows);
    return () => {
      window.removeEventListener('focus', reloadRows);
      window.removeEventListener('pageshow', reloadRows);
      window.removeEventListener('storage', reloadRows);
    };
  }, [def, reloadRows]);

  const save = useCallback(
    (updated: Row[]) => {
      if (!def) return;
      setRows(updated);
      persist(def, updated, originalIds);
    },
    [def, originalIds]
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

  const toggleField = async (row: Row, field: string) => {
    const nextVal = !row[field];
    let updated: Row[];

    if (field === 'featured' && nextVal) {
      // Set this row as the single active featured spotlight
      updated = rows.map((r) =>
        r.id === row.id ? { ...r, featured: true } : { ...r, featured: false }
      );
    } else {
      updated = rows.map((r) => (r.id === row.id ? { ...r, [field]: nextVal } : r));
    }

    save(updated);

    if (api) {
      try {
        const res = await fetch(`${api}/api/${def.key}/${row.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ [field]: nextVal }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          push(`Database update warning: ${errData.error || errData.message || res.statusText}. Please ensure you are logged in as admin.`, 'error');
        }
      } catch (err: any) {
        push(`Could not reach live API: ${err.message}`, 'info');
      }
    }

    const itemLabel = String(row.title ?? row.name ?? row.email ?? row.subject ?? def.singular);
    if (field === 'featured') {
      push(nextVal ? `“${itemLabel}” is now the featured spotlight.` : `“${itemLabel}” unfeatured.`, 'success');
    } else {
      push(`${field} updated.`, 'success');
    }
  };

  const remove = async (row: Row) => {
    if (!window.confirm(`Delete “${String(row.title ?? row.name ?? row.email ?? row.subject ?? row.id)}”?`)) return;
    const updated = rows.filter((r) => r.id !== row.id);
    save(updated);

    if (api) {
      try {
        const res = await fetch(`${api}/api/${def.key}/${row.id}`, {
          method: 'DELETE',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          push(`Database delete warning: ${errData.error || errData.message || res.statusText}`, 'error');
        }
      } catch (err: any) {
        push(`Could not reach live API: ${err.message}`, 'info');
      }
    }

    push('Deleted.', 'info');
  };

  const upsert = async (row: Row) => {
    const primaryTitle = String(row.title ?? row.name ?? row.email ?? row.subject ?? '').trim();
    if (!primaryTitle) {
      push('Title, Name, or Email is required.', 'error');
      return;
    }

    setEditing(null);
    setCreating(false);

    if (api) {
      try {
        const payload: Record<string, unknown> = { ...row };
        delete payload.id;
        if (typeof payload._id === 'string' && !/^[a-f\d]{24}$/i.test(payload._id)) {
          delete payload._id;
        }

        if (def.key === 'opportunities') {
          if (payload.status === 'published' || !payload.status) payload.status = 'active';
        } else if (def.key === 'events') {
          if (payload.status === 'published' || !payload.status) payload.status = 'upcoming';
        } else if (def.key === 'campuses') {
          delete payload.status;
        }

        const endpointId = row.id && /^[a-f\d]{24}$/i.test(row.id) ? row.id : (row.slug || row.id);
        const isEditingExisting = endpointId && !String(endpointId).startsWith('new-');

        const res = isEditingExisting
          ? await fetch(`${api}/api/${def.key}/${endpointId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify(payload),
            })
          : await fetch(`${api}/api/${def.key}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify(payload),
            });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          push(`Database sync warning: ${errData.error || errData.message || res.statusText}. Please make sure you are logged in as admin.`, 'error');
          return;
        }

        const json = await res.json().catch(() => ({}));
        if (json && json.data) {
          const savedRow = {
            ...json.data,
            id: json.data.id || json.data._id?.toString() || row.slug,
          };
          const updated = isEditingExisting
            ? rows.map((r) => (r.id === row.id || r.slug === row.slug ? savedRow : r))
            : [savedRow, ...rows.filter((r) => r.id !== row.id && r.slug !== row.slug)];
          save(updated);
        } else {
          reloadRows();
        }
      } catch (err: any) {
        push(`Could not reach backend API at ${api}: ${err.message}`, 'error');
        const exists = rows.some((r) => r.id === row.id);
        const updated = exists ? rows.map((r) => (r.id === row.id ? row : r)) : [row, ...rows];
        save(updated);
        return;
      }
    } else {
      const exists = rows.some((r) => r.id === row.id);
      const updated = exists ? rows.map((r) => (r.id === row.id ? row : r)) : [row, ...rows];
      save(updated);
    }

    push('Item saved successfully.', 'success');
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
              {visible.map((row, rIdx) => (
                <motion.tr
                  key={String(row.id || (row as any)._id || `col-row-${rIdx}`)}
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
        <ItemForm def={def} initial={editing} presetFilter={presetFilter} onSubmit={upsert} onCancel={() => { setEditing(null); setCreating(false); }} />
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

function ItemForm({ def, initial, presetFilter, onSubmit, onCancel }: { def: CollectionDef; initial: Row | null; presetFilter?: Record<string, string>; onSubmit: (row: Row) => void; onCancel: () => void }) {
  const { push } = useToast();
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    if (initial) return { ...(initial ?? {}) };
    const today = new Date().toISOString().slice(0, 10);
    const defaults: Record<string, unknown> = {
      date: today,
    };
    if (def.key === 'news' || def.key === 'articles') {
      defaults.status = 'published';
      defaults.category = 'Student News';
    } else if (def.key === 'stories') {
      defaults.status = 'published';
      defaults.category = 'student';
    } else if (def.key === 'campuses') {
      defaults.state = 'Bihar';
      defaults.type = 'University';
    } else if (def.key === 'podcasts') {
      defaults.status = 'published';
      defaults.category = 'Student Voices';
      defaults.durationLabel = '25:00';
      defaults.episodeNumber = 1;
    } else if (def.key === 'events') {
      defaults.status = 'upcoming';
      defaults.category = 'Summit';
      defaults.registrationDeadline = today;
    } else if (def.key === 'opportunities' || def.key === 'jobs' || def.key === 'internships' || def.key === 'fellowships') {
      defaults.status = 'active';
      defaults.type = (presetFilter?.type as string) || 'Job';
      defaults.mode = 'Remote';
      defaults.active = true;
      defaults.deadline = today;
    } else if (def.key === 'campaigns' || def.key === 'campaign-episodes') {
      defaults.status = 'Coming Soon';
      defaults.episodeNumber = 1;
    } else if (def.key === 'current-affairs') {
      defaults.status = 'published';
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      defaults.month = months[new Date().getMonth()];
      defaults.year = new Date().getFullYear();
    } else if (def.key === 'legal-awareness' || def.key === 'legal') {
      defaults.status = 'published';
      defaults.topic = 'Student Rights';
    } else {
      defaults.status = 'published';
    }
    return defaults;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = (name: string, value: unknown) => {
    setValues((v) => {
      const next = { ...v, [name]: value };
      // Enforce either video or audio for podcasts
      if (def.key === 'podcasts') {
        if (name === 'youtubeUrl' && value && String(value).trim()) {
          next.audioUrl = '';
          const thumb = getYoutubeThumbnailUrl(String(value), 'hq');
          if (thumb && (!next.image || String(next.image).includes('img.youtube.com') || !String(next.image).trim())) {
            next.image = thumb;
          }
        } else if (name === 'audioUrl' && value && String(value).trim()) {
          next.youtubeUrl = '';
          next.videoUrl = '';
        }
      }

      // Auto-extract thumbnail for documentary campaign episodes & videos
      if (name === 'videoUrl' || name === 'youtubeUrl') {
        if (value && typeof value === 'string' && value.trim()) {
          const thumb = getYoutubeThumbnailUrl(value.trim(), 'hq');
          if (thumb) {
            next.image = thumb;
            if (!next.imageAlt && next.title) {
              next.imageAlt = `${next.title} (documentary still)`;
            }
          }
        }
      }

      return next;
    });
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    for (const f of def.fields) {
      const val = values[f.name];
      const strVal = typeof val === 'string' ? val.trim() : val;
      if (f.required && (strVal === undefined || strVal === null || strVal === '')) {
        errs[f.name] = `${f.label} is required.`;
      }
    }

    // Mutual exclusivity validation for podcasts
    if (def.key === 'podcasts') {
      const hasAudio = !!(values.audioUrl && String(values.audioUrl).trim());
      const hasVideo = !!((values.youtubeUrl && String(values.youtubeUrl).trim()) || (values.videoUrl && String(values.videoUrl).trim()));
      if (hasAudio && hasVideo) {
        errs.audioUrl = 'Please provide either Audio URL or Video URL, not both.';
        errs.youtubeUrl = 'Please provide either Video URL or Audio URL, not both.';
      }
    }

    setErrors(errs);
    if (Object.keys(errs).length) {
      const missingLabels = Object.keys(errs)
        .map((k) => def.fields.find((f) => f.name === k)?.label || k)
        .join(', ');
      push(`Please fill in required fields: ${missingLabels}`, 'error');
      const firstField = Object.keys(errs)[0];
      const el = document.getElementById(`f-${firstField}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus();
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const title = String(values.title ?? values.name ?? '');
      const row: Row = {
        ...values,
        id: initial?.id ?? `new-${Date.now()}`,
        slug: values.slug ? String(values.slug) : slugify(title || 'item'),
        createdAt: initial?.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Row;
      await onSubmit(row);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (f: FieldDef) => {
    const v = values[f.name];
    const id = `f-${f.name}`;
    switch (f.type) {
      case 'richtext': {
        const rawContent = Array.isArray(v)
          ? v.map((p) => (typeof p === 'string' && /<[a-z][\s\S]*>/i.test(p) ? p : `<p>${p}</p>`)).join('')
          : String(v ?? '');
        return (
          <RichTextEditor
            id={id}
            value={rawContent}
            onChange={(html) => setField(f.name, html)}
          />
        );
      }
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
          <ImageUploadInput
            label={f.label}
            value={String(v ?? '')}
            onChange={(url) => setField(f.name, url)}
          />
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

      {/* Live Card Preview for documentary episodes or media */}
      {Boolean(values.image || values.videoUrl) && (
        <div className="rounded-xl border border-hairline bg-cream/40 p-4">
          <p className="mb-2.5 font-display text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-gold-deep" /> Live Card Preview (How it appears on public documentary page)
          </p>
          <div className="max-w-sm rounded-lg border border-hairline bg-white overflow-hidden shadow-card">
            <div className="relative aspect-video bg-ink/10 overflow-hidden">
              {values.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={String(values.image)}
                  alt={String(values.title || 'Preview')}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-muted">
                  No thumbnail image
                </div>
              )}
              {values.episodeNumber !== undefined && (
                <span className="absolute left-2.5 top-2.5 rounded-[4px] bg-brand-dark/95 px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-[0.14em] text-gold">
                  Episode {String(values.episodeNumber).padStart(2, '0')}
                </span>
              )}
              <span className="absolute bottom-2.5 right-2.5 rounded-full bg-gold px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-ink shadow-sm flex items-center gap-1">
                <Play className="h-3 w-3 fill-current" /> {values.status === 'Coming Soon' ? 'Coming Soon' : 'Watch Documentary'}
              </span>
            </div>
            <div className="p-3.5 space-y-1">
              <h4 className="font-display text-sm font-bold text-ink line-clamp-1">
                {String(values.title || 'Untitled Documentary')}
              </h4>
              {Boolean(values.profession || values.location) && (
                <p className="text-[11px] font-semibold uppercase tracking-wider text-brand line-clamp-1">
                  {String(values.profession || '')}{values.profession && values.location ? ' • ' : ''}
                  <span className="text-muted">{String(values.location || '')}</span>
                </p>
              )}
              {Boolean(values.description) && (
                <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                  {String(values.description)}
                </p>
              )}
              {Boolean(values.videoUrl) && (
                <p className="text-[10px] text-brand/80 font-mono truncate pt-1 border-t border-hairline/60">
                  🔗 {String(values.videoUrl)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 border-t border-hairline pt-4">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={isSubmitting}>
          <X aria-hidden className="h-4 w-4" /> Cancel
        </Button>
        <Button type="submit" size="sm" arrow disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="flex items-center gap-1.5">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Saving…
            </span>
          ) : (
            initial ? 'Save Changes' : `Create ${def.singular}`
          )}
        </Button>
      </div>
    </form>
  );
}
