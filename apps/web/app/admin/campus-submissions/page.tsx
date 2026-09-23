'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  School,
  Newspaper,
  BookOpen,
  Layers,
  Search,
  Check,
  X,
  Pencil,
  Trash2,
  ExternalLink,
  Eye,
  AlertCircle,
  Clock,
  User,
  Mail,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { useToast } from '@/components/common/Toast';
import { demoCampusSubmissions } from '@/data/content';
import { formatDate, slugify } from '@/lib/utils';
import { useAuth } from '@/components/providers/AuthProvider';

export interface CampusSubmissionItem {
  id: string;
  _id?: string;
  name: string;
  email: string;
  campus: string;
  college?: string;
  city?: string;
  state?: string;
  title: string;
  newsTitle?: string;
  storyTitle?: string;
  type: 'news' | 'story';
  category: string;
  summary: string;
  description?: string;
  content?: string;
  images?: string[];
  image?: string;
  supportingLinks?: string;
  status: 'pending' | 'under review' | 'approved' | 'rejected';
  submittedOn: string;
}

export default function CampusSubmissionsAdminPage() {
  const { push } = useToast();
  const [submissions, setSubmissions] = useState<CampusSubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Tabs: 'all' | 'news' | 'story'
  const [filterType, setFilterType] = useState<'all' | 'news' | 'story'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [campusFilter, setCampusFilter] = useState('');

  // Modal state
  const [editingSub, setEditingSub] = useState<CampusSubmissionItem | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const { getToken } = useAuth();
  const api = process.env.NEXT_PUBLIC_API_URL;
  const token = getToken() || (typeof window !== 'undefined' ? (localStorage.getItem('tsc_token') || localStorage.getItem('tsc.token')) : null);

  // Helper to normalize any incoming submission
  const normalizeSubmission = (item: any): CampusSubmissionItem => {
    const isStory =
      item.type === 'story' ||
      (!item.type &&
        (String(item.category || '').toLowerCase() === 'campus' ||
          String(item.category || '').toLowerCase() === 'student' ||
          String(item.category || '').toLowerCase() === 'startup' ||
          Boolean(item.storyTitle)));

    const titleVal = item.newsTitle || item.storyTitle || item.title || 'Untitled Submission';
    const imgs = Array.isArray(item.images) ? item.images : item.image ? [item.image] : [];

    return {
      id: String(item.id || item._id || `cs-${Math.random()}`),
      _id: item._id ? String(item._id) : undefined,
      name: item.name || 'Anonymous Submitter',
      email: item.email || '',
      campus: item.campus || item.college || 'General Campus',
      college: item.college || '',
      city: item.city || '',
      state: item.state || '',
      title: titleVal,
      newsTitle: isStory ? undefined : titleVal,
      storyTitle: isStory ? titleVal : undefined,
      type: isStory ? 'story' : 'news',
      category: item.category || (isStory ? 'Campus Story' : 'Campus News'),
      summary: item.summary || item.description || item.storyContent || item.content || '',
      description: item.description || item.summary || '',
      content: item.content || item.storyContent || item.description || item.summary || '',
      images: imgs,
      image: imgs[0] || item.image || (isStory ? '/images/stories/story-1.jpg' : '/images/news/news-1.jpg'),
      supportingLinks: item.supportingLinks || item.links || '',
      status: (['pending', 'under review', 'approved', 'rejected'].includes(item.status)
        ? item.status
        : 'pending') as any,
      submittedOn: item.submittedOn || item.createdAt || new Date().toISOString(),
    };
  };

  // Load submissions from API, local storage, and seeds
  const loadSubmissions = useCallback(() => {
    let localItems: CampusSubmissionItem[] = [];
    try {
      const stored = window.localStorage.getItem('tsc.admin.campusSubmissions');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          localItems = parsed.map(normalizeSubmission);
        }
      }

      const overlayRaw = window.localStorage.getItem('tsc.admin.campus-submissions');
      if (overlayRaw) {
        const overlay = JSON.parse(overlayRaw);
        if (Array.isArray(overlay.added)) {
          const addedNorm: CampusSubmissionItem[] = overlay.added.map(normalizeSubmission);
          localItems = [...addedNorm, ...localItems.filter((l: CampusSubmissionItem) => !addedNorm.some((a: CampusSubmissionItem) => a.id === l.id))];
        }
      }
    } catch {
      /* ignore */
    }

    const seedItems = demoCampusSubmissions.map(normalizeSubmission);
    const combinedMap = new Map<string, CampusSubmissionItem>();

    for (const item of seedItems) {
      combinedMap.set(item.id, item);
    }
    for (const item of localItems) {
      combinedMap.set(item.id, item);
    }

    setSubmissions(Array.from(combinedMap.values()));
    setLoading(false);

    if (api) {
      const headers = {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      fetch(`${api}/api/submissions/campus?_t=${Date.now()}&limit=100`, { headers, cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (json && Array.isArray(json.data) && json.data.length > 0) {
            const apiItems = json.data.map(normalizeSubmission);
            setSubmissions((prev) => {
              const map = new Map<string, CampusSubmissionItem>();
              for (const p of prev) map.set(p.id, p);
              for (const a of apiItems) map.set(a.id, a);
              const merged = Array.from(map.values());
              try {
                window.localStorage.setItem('tsc.admin.campusSubmissions', JSON.stringify(merged));
              } catch { }
              return merged;
            });
          }
        })
        .catch(() => { });

      fetch(`${api}/api/campus-submissions?_t=${Date.now()}&limit=100`, { headers, cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (json && Array.isArray(json.data) && json.data.length > 0) {
            const apiItems = json.data.map(normalizeSubmission);
            setSubmissions((prev) => {
              const map = new Map<string, CampusSubmissionItem>();
              for (const p of prev) map.set(p.id, p);
              for (const a of apiItems) map.set(a.id, a);
              const merged = Array.from(map.values());
              try {
                window.localStorage.setItem('tsc.admin.campusSubmissions', JSON.stringify(merged));
              } catch { }
              return merged;
            });
          }
        })
        .catch(() => { });
    }
  }, [api, token]);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  const persistSubmissions = (updated: CampusSubmissionItem[]) => {
    setSubmissions(updated);
    try {
      window.localStorage.setItem('tsc.admin.campusSubmissions', JSON.stringify(updated));
      window.localStorage.setItem('tsc.admin.campus-submissions', JSON.stringify({ added: updated }));
    } catch (err) {
      console.warn('LocalStorage quota exceeded:', err);
    }
  };

  const publishApprovedItem = (sub: CampusSubmissionItem) => {
    const campusName = String(sub.campus || sub.college || '').trim();
    const title = String(sub.title || 'Campus Submission').trim();
    const content = String(sub.content || sub.summary || sub.description || '').trim();
    const image = sub.image || (sub.images && sub.images[0]) || (sub.type === 'story' ? '/images/stories/story-1.jpg' : '/images/news/news-1.jpg');

    if (sub.type === 'story') {
      try {
        const customStories = JSON.parse(window.localStorage.getItem('tsc.custom.stories') || '[]');
        const newStory = {
          id: `approved-story-${sub.id}`,
          slug: slugify(title),
          title: title,
          dek: content ? content.slice(0, 160).trim() + '…' : 'Student submission on TSC',
          category: String(sub.category || 'campus').toLowerCase(),
          content: content,
          campus: campusName,
          image: image,
          author: sub.name || 'TSC Contributor',
          authorRole: 'Student',
          date: new Date().toISOString().slice(0, 10),
          status: 'published',
          featured: false,
        };
        const filtered = customStories.filter((s: any) => s.id !== newStory.id && s.title !== newStory.title);
        window.localStorage.setItem('tsc.custom.stories', JSON.stringify([newStory, ...filtered]));
      } catch { }
    } else {
      try {
        const customArticles = JSON.parse(window.localStorage.getItem('tsc.custom.articles') || '[]');
        const newArticle = {
          id: `approved-news-${sub.id}`,
          slug: slugify(title),
          title: title,
          excerpt: content ? content.slice(0, 180).trim() + '…' : 'Campus news on TSC',
          content: content,
          category: String(sub.category || 'Campus News'),
          campus: campusName,
          image: image,
          author: sub.name || 'TSC Campus Reporter',
          date: new Date().toISOString().slice(0, 10),
          status: 'published',
          featured: false,
        };
        const filtered = customArticles.filter((a: any) => a.id !== newArticle.id && a.title !== newArticle.title);
        window.localStorage.setItem('tsc.custom.articles', JSON.stringify([newArticle, ...filtered]));
      } catch { }
    }
  };

  const handleApprove = async (sub: CampusSubmissionItem) => {
    const updated = submissions.map((s) => (s.id === sub.id ? { ...s, status: 'approved' as const } : s));
    persistSubmissions(updated);
    publishApprovedItem({ ...sub, status: 'approved' });

    if (api) {
      try {
        const endpointId = sub._id || sub.id;
        await fetch(`${api}/api/submissions/campus/${endpointId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ status: 'approved' }),
        });
      } catch { }
    }

    push(
      `🎉 Approved! "${sub.title}" is now published live on Main ${sub.type === 'story' ? 'Stories' : 'News'} and the ${sub.campus || 'Campus'} page.`,
      'success'
    );
  };

  const handleReject = async (sub: CampusSubmissionItem) => {
    const updated = submissions.map((s) => (s.id === sub.id ? { ...s, status: 'rejected' as const } : s));
    persistSubmissions(updated);

    if (api) {
      try {
        const endpointId = sub._id || sub.id;
        await fetch(`${api}/api/submissions/campus/${endpointId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ status: 'rejected' }),
        });
      } catch { }
    }

    push(`Submission "${sub.title}" marked as rejected.`, 'info');
  };

  const handleDelete = async (sub: CampusSubmissionItem) => {
    if (!confirm(`Are you sure you want to permanently delete submission "${sub.title}"?`)) return;

    const updated = submissions.filter((s) => s.id !== sub.id);
    persistSubmissions(updated);

    if (api) {
      try {
        const endpointId = sub._id || sub.id;
        await fetch(`${api}/api/submissions/campus/${endpointId}`, {
          method: 'DELETE',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
      } catch { }
    }

    push('Submission deleted successfully.', 'info');
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSub) return;
    setSaving(true);

    try {
      const updatedItem = { ...editingSub };
      const updatedList = submissions.map((s) => (s.id === updatedItem.id ? updatedItem : s));
      persistSubmissions(updatedList);

      if (updatedItem.status === 'approved') {
        publishApprovedItem(updatedItem);
      }

      if (api) {
        const endpointId = updatedItem._id || updatedItem.id;
        await fetch(`${api}/api/submissions/campus/${endpointId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(updatedItem),
        });
      }

      setIsEditOpen(false);
      push('Submission updated successfully.', 'success');
    } catch (err: any) {
      push(`Failed to save: ${err?.message || err}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const allCount = submissions.length;
  const newsCount = useMemo(() => submissions.filter((s) => s.type === 'news').length, [submissions]);
  const storiesCount = useMemo(() => submissions.filter((s) => s.type === 'story').length, [submissions]);

  const uniqueCampuses = useMemo(() => {
    const set = new Set<string>();
    for (const s of submissions) {
      if (s.campus) set.add(s.campus);
    }
    return Array.from(set).sort();
  }, [submissions]);

  const filteredRows = useMemo(() => {
    return submissions.filter((sub) => {
      if (filterType === 'news' && sub.type !== 'news') return false;
      if (filterType === 'story' && sub.type !== 'story') return false;

      if (statusFilter && sub.status !== statusFilter) return false;

      if (campusFilter && sub.campus !== campusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = sub.title.toLowerCase().includes(q);
        const matchesName = sub.name.toLowerCase().includes(q);
        const matchesCampus = sub.campus.toLowerCase().includes(q);
        const matchesCategory = sub.category.toLowerCase().includes(q);
        const matchesEmail = sub.email.toLowerCase().includes(q);
        if (!matchesTitle && !matchesName && !matchesCampus && !matchesCategory && !matchesEmail) {
          return false;
        }
      }

      return true;
    });
  }, [submissions, filterType, statusFilter, campusFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="eyebrow">MANAGE</p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink">Campus Submissions</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Review, approve, and moderate campus news and student stories submitted across campuses.
        </p>
      </div>

      {/* Three Filter Buttons / Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto rounded-lg bg-cream/70 p-1 border border-hairline/70 w-fit">
        <button
          type="button"
          onClick={() => setFilterType('all')}
          className={`inline-flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-bold transition-all ${filterType === 'all'
              ? 'bg-brand text-white shadow-sm'
              : 'text-muted hover:text-ink hover:bg-cream'
            }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>All Campus Submissions ({allCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterType('news')}
          className={`inline-flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-bold transition-all ${filterType === 'news'
              ? 'bg-brand text-white shadow-sm'
              : 'text-muted hover:text-ink hover:bg-cream'
            }`}
        >
          <Newspaper className="h-3.5 w-3.5" />
          <span>Campus News ({newsCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterType('story')}
          className={`inline-flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-bold transition-all ${filterType === 'story'
              ? 'bg-brand text-white shadow-sm'
              : 'text-muted hover:text-ink hover:bg-cream'
            }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>Campus Stories ({storiesCount})</span>
        </button>
      </div>

      {/* Summary count and controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs font-bold text-ink tracking-tight">
          Showing {filteredRows.length}{' '}
          {filterType === 'all'
            ? 'campus submissions'
            : filterType === 'news'
              ? 'campus news submissions'
              : 'campus story submissions'}
          {campusFilter ? ` for "${campusFilter}"` : ''}
        </span>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search input */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search submissions…"
              className="w-48 sm:w-60 rounded-md border border-hairline bg-white pl-8 pr-3 py-1.5 text-xs text-ink focus:border-brand focus:outline-none"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-hairline bg-white px-3 py-1.5 text-xs text-ink focus:border-brand focus:outline-none"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="under review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Campus filter */}
          {uniqueCampuses.length > 0 && (
            <select
              value={campusFilter}
              onChange={(e) => setCampusFilter(e.target.value)}
              className="rounded-md border border-hairline bg-white px-3 py-1.5 text-xs text-ink focus:border-brand focus:outline-none max-w-[150px] truncate"
            >
              <option value="">All Campuses</option>
              {uniqueCampuses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('');
              setCampusFilter('');
              loadSubmissions();
            }}
            title="Refresh submissions"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="overflow-x-auto rounded-md border border-hairline bg-white shadow-sm">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-hairline bg-cream font-display text-[11px] font-bold uppercase tracking-wider text-muted">
              <th className="px-4 py-3">News / Story Headline</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Campus</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted">
                  <AlertCircle className="mx-auto h-6 w-6 text-muted/50 mb-2" />
                  <p className="font-semibold text-ink">No submissions found</p>
                  <p className="text-[11px] text-muted mt-0.5">
                    {searchQuery || statusFilter || campusFilter
                      ? 'Try clearing your search or status filters.'
                      : 'Submissions sent by students from campus pages will appear here.'}
                  </p>
                </td>
              </tr>
            ) : (
              filteredRows.map((sub) => (
                <tr key={sub.id} className="hover:bg-cream/40 transition-colors">
                  {/* Headline & Thumbnail */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={sub.image || (sub.type === 'story' ? '/images/stories/story-1.jpg' : '/images/news/news-1.jpg')}
                        alt={sub.title}
                        className="h-10 w-16 rounded object-cover border border-hairline shrink-0 bg-cream"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            sub.type === 'story' ? '/images/stories/story-1.jpg' : '/images/news/news-1.jpg';
                        }}
                      />
                      <div className="min-w-0 max-w-sm">
                        <p className="font-bold text-ink truncate text-xs" title={sub.title}>
                          {sub.title}
                        </p>
                        <p className="text-[11px] text-muted truncate mt-0.5">
                          By <span className="font-semibold text-ink/80">{sub.name}</span>
                          {sub.email ? ` • ${sub.email}` : ''}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Submission Type */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    {sub.type === 'story' ? (
                      <span className="inline-flex items-center gap-1 rounded bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200 uppercase tracking-wider">
                        <BookOpen className="h-3 w-3" /> Story
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200 uppercase tracking-wider">
                        <Newspaper className="h-3 w-3" /> News
                      </span>
                    )}
                  </td>

                  {/* Campus */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 rounded bg-cream px-2 py-0.5 text-[11px] font-semibold text-ink border border-hairline">
                      <School className="h-3 w-3 text-muted shrink-0" />
                      <span className="max-w-[140px] truncate">{sub.campus || 'General Campus'}</span>
                    </span>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="rounded-full bg-cream px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted border border-hairline">
                      {sub.category}
                    </span>
                  </td>

                  {/* Submitted Date */}
                  <td className="px-4 py-3 whitespace-nowrap text-muted text-[11px]">
                    {formatDate(sub.submittedOn)}
                  </td>

                  {/* Status Badge */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${sub.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : sub.status === 'rejected'
                            ? 'bg-red-50 text-red-700 border-red-300'
                            : 'bg-gold-50 text-gold-deep border-gold/50'
                        }`}
                    >
                      {sub.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* One-Click Approve */}
                      {sub.status !== 'approved' && (
                        <button
                          type="button"
                          onClick={() => handleApprove(sub)}
                          title={`Approve and publish live as ${sub.type === 'story' ? 'Story' : 'News'}`}
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {/* Reject */}
                      {sub.status !== 'rejected' && (
                        <button
                          type="button"
                          onClick={() => handleReject(sub)}
                          title="Reject submission"
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {/* View / Edit Modal */}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSub({ ...sub });
                          setIsEditOpen(true);
                        }}
                        title="View details & edit"
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-hairline text-muted hover:border-brand hover:text-brand hover:bg-brand-50 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDelete(sub)}
                        title="Delete submission"
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-hairline text-muted hover:border-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View & Edit Modal */}
      {editingSub && (
        <Modal
          open={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title={`Review Submission — ${editingSub.type === 'story' ? 'Campus Story' : 'Campus News'}`}
          wide
        >
          <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
            {/* Type selector */}
            <div>
              <label className="block font-bold text-ink mb-1">Submission Type</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSub({ ...editingSub, type: 'news' })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border font-bold text-xs ${editingSub.type === 'news'
                      ? 'border-brand bg-brand text-white'
                      : 'border-hairline bg-cream text-muted'
                    }`}
                >
                  <Newspaper className="h-3.5 w-3.5" /> Campus News
                </button>
                <button
                  type="button"
                  onClick={() => setEditingSub({ ...editingSub, type: 'story' })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border font-bold text-xs ${editingSub.type === 'story'
                      ? 'border-brand bg-brand text-white'
                      : 'border-hairline bg-cream text-muted'
                    }`}
                >
                  <BookOpen className="h-3.5 w-3.5" /> Campus Story
                </button>
              </div>
            </div>

            {/* Headline / Title */}
            <div>
              <label className="block font-bold text-ink mb-1">
                Headline / Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={editingSub.title}
                onChange={(e) => setEditingSub({ ...editingSub, title: e.target.value })}
                className="w-full rounded-md border border-hairline px-3 py-2 text-xs focus:border-brand focus:outline-none"
              />
            </div>

            {/* Submitter details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-ink mb-1">Submitter Name</label>
                <input
                  type="text"
                  value={editingSub.name}
                  onChange={(e) => setEditingSub({ ...editingSub, name: e.target.value })}
                  className="w-full rounded-md border border-hairline px-3 py-1.5 text-xs focus:border-brand focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-ink mb-1">Submitter Email</label>
                <input
                  type="email"
                  value={editingSub.email}
                  onChange={(e) => setEditingSub({ ...editingSub, email: e.target.value })}
                  className="w-full rounded-md border border-hairline px-3 py-1.5 text-xs focus:border-brand focus:outline-none"
                />
              </div>
            </div>

            {/* Campus & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-ink mb-1">Associated Campus</label>
                <input
                  type="text"
                  value={editingSub.campus}
                  onChange={(e) => setEditingSub({ ...editingSub, campus: e.target.value })}
                  className="w-full rounded-md border border-hairline px-3 py-1.5 text-xs focus:border-brand focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-ink mb-1">Category</label>
                <input
                  type="text"
                  value={editingSub.category}
                  onChange={(e) => setEditingSub({ ...editingSub, category: e.target.value })}
                  className="w-full rounded-md border border-hairline px-3 py-1.5 text-xs focus:border-brand focus:outline-none"
                />
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className="block font-bold text-ink mb-1">Image URL</label>
              <input
                type="text"
                value={editingSub.image || ''}
                onChange={(e) => setEditingSub({ ...editingSub, image: e.target.value })}
                placeholder="https://..."
                className="w-full rounded-md border border-hairline px-3 py-1.5 text-xs focus:border-brand focus:outline-none"
              />
              {editingSub.image && (
                <div className="mt-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={editingSub.image}
                    alt="Preview"
                    className="h-20 w-32 rounded object-cover border border-hairline"
                  />
                </div>
              )}
            </div>

            {/* Summary / Description */}
            <div>
              <label className="block font-bold text-ink mb-1">Summary / Body Content</label>
              <textarea
                rows={4}
                value={editingSub.content || editingSub.summary || editingSub.description || ''}
                onChange={(e) =>
                  setEditingSub({
                    ...editingSub,
                    summary: e.target.value,
                    content: e.target.value,
                    description: e.target.value,
                  })
                }
                className="w-full rounded-md border border-hairline px-3 py-2 text-xs focus:border-brand focus:outline-none"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block font-bold text-ink mb-1">Moderation Status</label>
              <select
                value={editingSub.status}
                onChange={(e) => setEditingSub({ ...editingSub, status: e.target.value as any })}
                className="w-full rounded-md border border-hairline px-3 py-1.5 text-xs focus:border-brand focus:outline-none"
              >
                <option value="pending">Pending</option>
                <option value="under review">Under Review</option>
                <option value="approved">Approved (Live on Site)</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between border-t border-hairline pt-4 mt-4">
              {editingSub.status !== 'approved' ? (
                <Button
                  type="button"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => {
                    handleApprove(editingSub);
                    setIsEditOpen(false);
                  }}
                >
                  <Check className="h-3.5 w-3.5" /> Approve &amp; Publish Immediately
                </Button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}