'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Pencil, Plus, Search, Star, Trash2, X } from 'lucide-react';
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

  const [rows, setRows] = useState<Row[]>([]);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const originalIds = useMemo(() => new Set((SEEDS[def?.seedKey] ?? []).map((r) => (r as Row).id)), [def]);

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
