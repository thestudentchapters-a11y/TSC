'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Rocket,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Play,
  Film,
  Sparkles,
  MapPin,
  Clock,
  Layers,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  Video,
} from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { useToast } from '@/components/common/Toast';
import { ImageUploadInput } from '@/components/admin/ImageUploadInput';
import { flagshipCampaign } from '@/data/content';
import { type Campaign, type CampaignEpisode } from '@/types/content';
import { slugify, getYoutubeThumbnailUrl } from '@/lib/utils';

export function CampaignsAdmin() {
  const { push } = useToast();
  const api = process.env.NEXT_PUBLIC_API_URL;

  const [campaigns, setCampaigns] = useState<Campaign[]>([flagshipCampaign]);
  const [selectedCampaignSlug, setSelectedCampaignSlug] = useState<string>(
    flagshipCampaign.slug
  );
  const [loading, setLoading] = useState(true);

  // Campaign Modal State
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [campaignForm, setCampaignForm] = useState<{
    id?: string;
    title: string;
    slug: string;
    eyebrow: string;
    headline: string;
    description: string;
    categories: string;
    locations: string;
    stills: Array<{ image: string; alt: string }>;
    status: 'draft' | 'published' | 'archived';
    featured: boolean;
  }>({
    title: '',
    slug: '',
    eyebrow: 'TSC ORIGINAL CAMPAIGN',
    headline: '',
    description: '',
    categories: '',
    locations: '',
    stills: [
      { image: '/images/campaign/campaign-1.jpg', alt: 'Documentary still 1' },
      { image: '/images/campaign/campaign-2.jpg', alt: 'Documentary still 2' },
      { image: '/images/campaign/campaign-3.jpg', alt: 'Documentary still 3' },
    ],
    status: 'published',
    featured: false,
  });

  // Episode Modal State
  const [isEpisodeModalOpen, setIsEpisodeModalOpen] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<CampaignEpisode | null>(null);
  const [episodeForm, setEpisodeForm] = useState<{
    id?: string;
    campaignSlug: string;
    title: string;
    slug: string;
    episodeNumber: number;
    professional: string;
    profession: string;
    location: string;
    description: string;
    videoUrl: string;
    image: string;
    durationLabel: string;
    status: 'Released' | 'Coming Soon';
  }>({
    campaignSlug: flagshipCampaign.slug,
    title: '',
    slug: '',
    episodeNumber: 1,
    professional: '',
    profession: '',
    location: '',
    description: '',
    videoUrl: '',
    image: '',
    durationLabel: '25 min',
    status: 'Released',
  });

  // Load campaigns & episodes from API and LocalStorage
  const loadData = async () => {
    setLoading(true);
    let loadedCampaigns: Campaign[] = [flagshipCampaign];

    // 1. Try fetching from database API
    if (api) {
      try {
        const res = await fetch(`${api}/api/campaigns`);
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.data) && json.data.length > 0) {
            loadedCampaigns = json.data.map((c: any) => ({
              id: c.id || c._id?.toString() || c.slug,
              slug: c.slug || slugify(c.title),
              eyebrow: c.eyebrow || 'TSC ORIGINAL CAMPAIGN',
              title: c.title,
              headline: c.headline || '',
              description: c.description || '',
              categories: Array.isArray(c.categories) ? c.categories : [],
              locations: Array.isArray(c.locations) ? c.locations : [],
              stills: Array.isArray(c.stills) && c.stills.length > 0
                ? c.stills
                : flagshipCampaign.stills,
              episodes: Array.isArray(c.episodes) ? c.episodes : [],
              status: c.status || 'published',
              featured: Boolean(c.featured),
            }));
          }
        }
      } catch {
        // fallback to local storage
      }
    }

    // 2. Check local storage overrides
    if (typeof window !== 'undefined') {
      try {
        const saved = window.localStorage.getItem('tsc_admin_campaigns');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            loadedCampaigns = parsed;
          }
        }
      } catch {}
    }

    setCampaigns(loadedCampaigns);
    if (!loadedCampaigns.some((c) => c.slug === selectedCampaignSlug)) {
      setSelectedCampaignSlug(loadedCampaigns[0]?.slug || flagshipCampaign.slug);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [api]);

  // Persist helper
  const persistCampaigns = async (nextCampaigns: Campaign[]) => {
    setCampaigns(nextCampaigns);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('tsc_admin_campaigns', JSON.stringify(nextCampaigns));
    }
  };

  const selectedCampaign = useMemo(() => {
    return (
      campaigns.find((c) => c.slug === selectedCampaignSlug) ||
      campaigns[0] ||
      flagshipCampaign
    );
  }, [campaigns, selectedCampaignSlug]);

  // ----------------------------------------------------
  // Campaign Handlers
  // ----------------------------------------------------
  const handleOpenNewCampaign = () => {
    setEditingCampaign(null);
    setCampaignForm({
      title: '',
      slug: '',
      eyebrow: 'TSC ORIGINAL CAMPAIGN',
      headline: 'Real Careers. Real People. Real Possibilities.',
      description: '',
      categories: 'Technology, Media, Healthcare, Entrepreneurship',
      locations: 'Delhi, Mumbai, Bengaluru, Patna',
      stills: [
        { image: '/images/campaign/campaign-1.jpg', alt: 'Documentary still 1' },
        { image: '/images/campaign/campaign-2.jpg', alt: 'Documentary still 2' },
        { image: '/images/campaign/campaign-3.jpg', alt: 'Documentary still 3' },
      ],
      status: 'published',
      featured: false,
    });
    setIsCampaignModalOpen(true);
  };

  const handleEditCampaign = (camp: Campaign) => {
    setEditingCampaign(camp);
    setCampaignForm({
      id: camp.id,
      title: camp.title,
      slug: camp.slug,
      eyebrow: camp.eyebrow || 'TSC ORIGINAL CAMPAIGN',
      headline: camp.headline || '',
      description: camp.description || '',
      categories: (camp.categories || []).join(', '),
      locations: (camp.locations || []).join(', '),
      stills: camp.stills?.length
        ? camp.stills
        : [
            { image: '/images/campaign/campaign-1.jpg', alt: 'Documentary still 1' },
            { image: '/images/campaign/campaign-2.jpg', alt: 'Documentary still 2' },
            { image: '/images/campaign/campaign-3.jpg', alt: 'Documentary still 3' },
          ],
      status: camp.status || 'published',
      featured: Boolean(camp.featured),
    });
    setIsCampaignModalOpen(true);
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignForm.title.trim()) {
      push('Please provide a campaign title', 'error');
      return;
    }

    const slug = campaignForm.slug.trim() || slugify(campaignForm.title);
    const categories = campaignForm.categories
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const locations = campaignForm.locations
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const token = typeof window !== 'undefined' ? localStorage.getItem('tsc_token') : null;

    if (editingCampaign) {
      // Update existing
      const updatedCampaign: Campaign = {
        ...editingCampaign,
        title: campaignForm.title,
        slug,
        eyebrow: campaignForm.eyebrow,
        headline: campaignForm.headline,
        description: campaignForm.description,
        categories,
        locations,
        stills: campaignForm.stills,
        status: campaignForm.status,
        featured: campaignForm.featured,
      };

      const next = campaigns.map((c) => (c.slug === editingCampaign.slug ? updatedCampaign : c));
      await persistCampaigns(next);

      // Sync to API
      if (api && token) {
        try {
          await fetch(`${api}/api/campaigns/${editingCampaign.id || editingCampaign.slug}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updatedCampaign),
          });
        } catch {}
      }

      push(`Campaign "${campaignForm.title}" updated successfully!`, 'success');
    } else {
      // Create new
      const newCampaign: Campaign = {
        id: `camp_${Date.now()}`,
        title: campaignForm.title,
        slug,
        eyebrow: campaignForm.eyebrow,
        headline: campaignForm.headline,
        description: campaignForm.description,
        categories,
        locations,
        stills: campaignForm.stills,
        episodes: [],
        status: campaignForm.status,
        featured: campaignForm.featured,
      };

      const next = [...campaigns, newCampaign];
      await persistCampaigns(next);
      setSelectedCampaignSlug(slug);

      // Sync to API
      if (api && token) {
        try {
          await fetch(`${api}/api/campaigns`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(newCampaign),
          });
        } catch {}
      }

      push(`Campaign "${campaignForm.title}" created successfully!`, 'success');
    }

    setIsCampaignModalOpen(false);
  };

  const handleDeleteCampaign = async (camp: Campaign) => {
    if (camp.slug === 'all-india-career-awareness') {
      push('The flagship campaign cannot be deleted.', 'error');
      return;
    }
    if (!confirm(`Are you sure you want to delete campaign "${camp.title}"?`)) {
      return;
    }

    const next = campaigns.filter((c) => c.slug !== camp.slug);
    await persistCampaigns(next);
    setSelectedCampaignSlug(next[0]?.slug || flagshipCampaign.slug);

    const token = typeof window !== 'undefined' ? localStorage.getItem('tsc_token') : null;
    if (api && token) {
      try {
        await fetch(`${api}/api/campaigns/${camp.id || camp.slug}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {}
    }

    push(`Campaign "${camp.title}" deleted.`, 'info');
  };

  // ----------------------------------------------------
  // Documentary Episode Handlers
  // ----------------------------------------------------
  const handleOpenNewEpisode = () => {
    setEditingEpisode(null);
    const existingCount = selectedCampaign.episodes?.length || 0;
    setEpisodeForm({
      campaignSlug: selectedCampaign.slug,
      title: '',
      slug: '',
      episodeNumber: existingCount + 1,
      professional: '',
      profession: '',
      location: selectedCampaign.locations?.[0] || 'Patna',
      description: '',
      videoUrl: '',
      image: '',
      durationLabel: '25 min',
      status: 'Released',
    });
    setIsEpisodeModalOpen(true);
  };

  const handleEditEpisode = (ep: CampaignEpisode) => {
    setEditingEpisode(ep);
    setEpisodeForm({
      id: ep.id,
      campaignSlug: selectedCampaign.slug,
      title: ep.title,
      slug: ep.slug,
      episodeNumber: ep.episodeNumber,
      professional: ep.professional,
      profession: ep.profession,
      location: ep.location,
      description: ep.description,
      videoUrl: ep.videoUrl || '',
      image: ep.image || '',
      durationLabel: ep.durationLabel || '25 min',
      status: ep.status,
    });
    setIsEpisodeModalOpen(true);
  };

  const handleVideoUrlChange = (url: string) => {
    const extractedThumb = getYoutubeThumbnailUrl(url, 'hq');
    setEpisodeForm((prev) => ({
      ...prev,
      videoUrl: url,
      image: extractedThumb || prev.image || '/images/campaign/campaign-1.jpg',
    }));
  };

  const handleSaveEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!episodeForm.title.trim()) {
      push('Please provide an episode title', 'error');
      return;
    }

    const slug = episodeForm.slug.trim() || slugify(episodeForm.title);
    const thumb =
      episodeForm.image.trim() ||
      (episodeForm.videoUrl ? getYoutubeThumbnailUrl(episodeForm.videoUrl, 'hq') : null) ||
      '/images/campaign/campaign-1.jpg';

    const token = typeof window !== 'undefined' ? localStorage.getItem('tsc_token') : null;

    let targetCamp = campaigns.find((c) => c.slug === episodeForm.campaignSlug) || selectedCampaign;
    let updatedEpisodes: CampaignEpisode[] = [];

    if (editingEpisode) {
      const updated: CampaignEpisode = {
        ...editingEpisode,
        title: episodeForm.title,
        slug,
        episodeNumber: Number(episodeForm.episodeNumber) || 1,
        professional: episodeForm.professional,
        profession: episodeForm.profession,
        location: episodeForm.location,
        description: episodeForm.description,
        videoUrl: episodeForm.videoUrl.trim() || null,
        image: thumb,
        imageAlt: `${episodeForm.title} (documentary still)`,
        durationLabel: episodeForm.durationLabel,
        status: episodeForm.status,
      };

      updatedEpisodes = (targetCamp.episodes || []).map((e) =>
        e.id === editingEpisode.id ? updated : e
      );

      if (api && token) {
        try {
          await fetch(`${api}/api/campaign-episodes/${editingEpisode.id || editingEpisode.slug}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ ...updated, campaign: targetCamp.id }),
          });
        } catch {}
      }
      push(`Documentary episode "${episodeForm.title}" updated!`, 'success');
    } else {
      const newEp: CampaignEpisode = {
        id: `ep_${Date.now()}`,
        campaign: targetCamp.id,
        title: episodeForm.title,
        slug,
        episodeNumber: Number(episodeForm.episodeNumber) || (targetCamp.episodes?.length || 0) + 1,
        professional: episodeForm.professional,
        profession: episodeForm.profession,
        location: episodeForm.location,
        description: episodeForm.description,
        videoUrl: episodeForm.videoUrl.trim() || null,
        image: thumb,
        imageAlt: `${episodeForm.title} (documentary still)`,
        durationLabel: episodeForm.durationLabel,
        status: episodeForm.status,
      };

      updatedEpisodes = [...(targetCamp.episodes || []), newEp];

      if (api && token) {
        try {
          await fetch(`${api}/api/campaign-episodes`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ ...newEp, campaign: targetCamp.id }),
          });
        } catch {}
      }
      push(`Documentary episode "${episodeForm.title}" published!`, 'success');
    }

    const nextCampaigns = campaigns.map((c) =>
      c.slug === targetCamp.slug ? { ...c, episodes: updatedEpisodes } : c
    );
    await persistCampaigns(nextCampaigns);
    setIsEpisodeModalOpen(false);
  };

  const handleDeleteEpisode = async (ep: CampaignEpisode) => {
    if (!confirm(`Are you sure you want to delete episode "${ep.title}"?`)) {
      return;
    }

    const updatedEpisodes = (selectedCampaign.episodes || []).filter((e) => e.id !== ep.id);
    const nextCampaigns = campaigns.map((c) =>
      c.slug === selectedCampaign.slug ? { ...c, episodes: updatedEpisodes } : c
    );
    await persistCampaigns(nextCampaigns);

    const token = typeof window !== 'undefined' ? localStorage.getItem('tsc_token') : null;
    if (api && token) {
      try {
        await fetch(`${api}/api/campaign-episodes/${ep.id || ep.slug}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {}
    }

    push(`Episode "${ep.title}" removed.`, 'info');
  };

  const handleResetToDemo = () => {
    if (confirm('Reset all campaigns and documentary episodes to default factory seed data?')) {
      persistCampaigns([flagshipCampaign]);
      setSelectedCampaignSlug(flagshipCampaign.slug);
      push('Campaigns reset to demo defaults.', 'info');
    }
  };

  return (
    <div className="pb-16">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-hairline pb-6">
        <div>
          <p className="eyebrow">Admin Center</p>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Campaigns &amp; Documentary Series
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Create nationwide youth campaigns, wire documentary episodes with automated thumbnail extraction, and publish video cards directly to public campaign pages.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Button variant="outline" size="sm" onClick={handleResetToDemo}>
            <RefreshCw className="h-3.5 w-3.5" /> Reset Demo Seed
          </Button>
          <Button variant="outline" size="sm" onClick={handleOpenNewCampaign}>
            <Plus className="h-3.5 w-3.5" /> Create Campaign
          </Button>
          <Button size="sm" onClick={handleOpenNewEpisode} arrow>
            <Video className="h-3.5 w-3.5" /> Add Documentary
          </Button>
        </div>
      </div>

      {/* Campaign Selector / Switcher */}
      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.14em] text-ink">
            <Rocket className="h-4 w-4 text-brand" /> Active Campaigns ({campaigns.length})
          </h2>
          <span className="text-xs text-muted">Select a campaign below to view and edit its documentary series</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((camp) => {
            const isSelected = camp.slug === selectedCampaign.slug;
            const epCount = camp.episodes?.length || 0;

            return (
              <div
                key={`camp-card-${camp.slug}`}
                onClick={() => setSelectedCampaignSlug(camp.slug)}
                className={`group relative flex flex-col justify-between rounded-lg border p-5 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-brand bg-brand-50/40 shadow-sm ring-1 ring-brand'
                    : 'border-hairline bg-white hover:border-brand/40 hover:bg-cream/40'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="rounded-[4px] bg-gold/30 px-2 py-0.5 font-display text-[9px] font-bold uppercase tracking-wider text-gold-deep">
                      {camp.slug === 'all-india-career-awareness' ? 'Flagship' : 'Campaign'}
                    </span>
                    <span className="rounded-full bg-cream px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted">
                      {camp.status || 'published'}
                    </span>
                  </div>

                  <h3 className="mt-3 font-display text-base font-bold text-ink transition-colors group-hover:text-brand">
                    {camp.title}
                  </h3>
                  <p className="mt-1 font-serif text-xs italic text-brand line-clamp-1">{camp.headline}</p>
                  <p className="mt-2 text-xs leading-relaxed text-muted line-clamp-2">{camp.description}</p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-hairline/60 pt-3 text-xs">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-ink/80">
                    <Film className="h-3.5 w-3.5 text-brand" /> {epCount} Episodes
                  </span>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Link
                      href={`/campaigns/${camp.slug}`}
                      target="_blank"
                      className="rounded p-1 text-muted hover:bg-cream hover:text-brand"
                      title="View live campaign page"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleEditCampaign(camp)}
                      className="rounded p-1 text-muted hover:bg-cream hover:text-brand"
                      title="Edit campaign settings"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    {camp.slug !== 'all-india-career-awareness' && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCampaign(camp)}
                        className="rounded p-1 text-muted hover:bg-red-50 hover:text-red-600"
                        title="Delete campaign"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Documentary Episodes Section for Selected Campaign */}
      <section className="rounded-xl border border-hairline bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg font-bold text-ink">
                Documentary Episodes for &ldquo;{selectedCampaign.title}&rdquo;
              </h2>
              <Link
                href={`/campaigns/${selectedCampaign.slug}#episodes`}
                target="_blank"
                className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-brand hover:underline"
              >
                Live Preview <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
            <p className="mt-1 text-xs text-muted">
              Add video URLs, auto-extract thumbnails, and manage career cards published to{' '}
              <code className="rounded bg-cream px-1.5 py-0.5 text-ink">/campaigns/{selectedCampaign.slug}#episodes</code>.
            </p>
          </div>

          <Button size="sm" onClick={handleOpenNewEpisode} arrow>
            <Plus className="h-3.5 w-3.5" /> Add Episode to this Campaign
          </Button>
        </div>

        {/* Episode Grid */}
        {(!selectedCampaign.episodes || selectedCampaign.episodes.length === 0) ? (
          <div className="my-12 rounded-lg border border-dashed border-hairline bg-cream/30 p-10 text-center">
            <Film className="mx-auto h-8 w-8 text-muted" />
            <p className="mt-3 font-display text-sm font-bold text-ink">No documentary episodes yet</p>
            <p className="mt-1 text-xs text-muted">
              Click &ldquo;Add Episode to this Campaign&rdquo; above to create your first documentary card.
            </p>
            <Button size="sm" variant="outline" className="mt-4" onClick={handleOpenNewEpisode}>
              <Plus className="h-3.5 w-3.5" /> Add First Episode
            </Button>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {selectedCampaign.episodes.map((ep, idx) => {
              const hasVideo = Boolean(ep.videoUrl);

              return (
                <div
                  key={`ep-card-${ep.id || idx}`}
                  className="flex flex-col overflow-hidden rounded-lg border border-hairline bg-cream/30 transition-all hover:border-brand/40 hover:bg-white hover:shadow-md"
                >
                  {/* Thumbnail Banner */}
                  <div className="relative aspect-video w-full overflow-hidden bg-ink/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ep.image || '/images/campaign/campaign-1.jpg'}
                      alt={ep.title}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute left-3 top-3 rounded-[4px] bg-brand-dark/95 px-2 py-1 font-display text-[9px] font-bold uppercase tracking-wider text-gold shadow-sm">
                      Episode {String(ep.episodeNumber).padStart(2, '0')}
                    </span>
                    <span className={`absolute bottom-3 right-3 rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider shadow-sm ${
                      ep.status === 'Released'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-ink/80 text-cream'
                    }`}>
                      {ep.status}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-display text-[15px] font-bold text-ink">{ep.title}</h4>
                        <p className="text-[11.5px] font-semibold text-brand">
                          {ep.profession || 'Profession'} • <span className="text-muted">{ep.location || 'Location'}</span>
                        </p>
                      </div>
                    </div>

                    <p className="mt-2 text-xs leading-relaxed text-muted line-clamp-2">{ep.description}</p>

                    {/* Video URL Link */}
                    {hasVideo && (
                      <div className="mt-3 flex items-center gap-1.5 rounded bg-white p-2 border border-hairline text-[11px] text-muted">
                        <Video className="h-3.5 w-3.5 text-brand shrink-0" />
                        <span className="truncate font-mono">{ep.videoUrl}</span>
                        <a
                          href={ep.videoUrl!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-auto text-brand hover:underline shrink-0"
                          title="Open Video"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div className="mt-auto flex items-center justify-between border-t border-hairline pt-3 text-xs">
                      <span className="text-[11px] text-muted">
                        {ep.professional ? `Feat: ${ep.professional}` : ep.durationLabel}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditEpisode(ep)}
                          className="!px-2 !py-1 text-xs"
                        >
                          <Pencil className="h-3 w-3" /> Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEpisode(ep)}
                          className="!px-2 !py-1 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" /> Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ---------------------------------------------------- */}
      {/* Modal 1: Create / Edit Campaign                      */}
      {/* ---------------------------------------------------- */}
      {isCampaignModalOpen && (
        <Modal
          open={isCampaignModalOpen}
          onClose={() => setIsCampaignModalOpen(false)}
          title={editingCampaign ? `Edit Campaign: ${editingCampaign.title}` : 'Create New Campaign'}
        >
          <form onSubmit={handleSaveCampaign} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink">
                Campaign Title *
              </label>
              <input
                type="text"
                required
                value={campaignForm.title}
                onChange={(e) => setCampaignForm((v) => ({ ...v, title: e.target.value }))}
                placeholder="e.g. Green Innovations & Climate Careers"
                className="mt-1 w-full rounded-md border border-hairline bg-white px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink">
                  URL Slug (Auto-generated if blank)
                </label>
                <input
                  type="text"
                  value={campaignForm.slug}
                  onChange={(e) => setCampaignForm((v) => ({ ...v, slug: e.target.value }))}
                  placeholder="green-innovations"
                  className="mt-1 w-full rounded-md border border-hairline bg-white px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink">
                  Eyebrow Badge
                </label>
                <input
                  type="text"
                  value={campaignForm.eyebrow}
                  onChange={(e) => setCampaignForm((v) => ({ ...v, eyebrow: e.target.value }))}
                  placeholder="TSC ORIGINAL CAMPAIGN"
                  className="mt-1 w-full rounded-md border border-hairline bg-white px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink">
                Headline / Motto
              </label>
              <input
                type="text"
                value={campaignForm.headline}
                onChange={(e) => setCampaignForm((v) => ({ ...v, headline: e.target.value }))}
                placeholder="Real Careers. Real People. Real Possibilities."
                className="mt-1 w-full rounded-md border border-hairline bg-white px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink">
                Campaign Description / Narrative
              </label>
              <textarea
                rows={3}
                value={campaignForm.description}
                onChange={(e) => setCampaignForm((v) => ({ ...v, description: e.target.value }))}
                placeholder="Detailed narrative for the series shown on the campaign header..."
                className="mt-1 w-full rounded-md border border-hairline bg-white px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink">
                  Career Categories (comma-separated)
                </label>
                <input
                  type="text"
                  value={campaignForm.categories}
                  onChange={(e) => setCampaignForm((v) => ({ ...v, categories: e.target.value }))}
                  placeholder="Technology, Clean Energy, Healthcare"
                  className="mt-1 w-full rounded-md border border-hairline bg-white px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink">
                  Locations Filmed (comma-separated)
                </label>
                <input
                  type="text"
                  value={campaignForm.locations}
                  onChange={(e) => setCampaignForm((v) => ({ ...v, locations: e.target.value }))}
                  placeholder="Patna, Bengaluru, Delhi, Mumbai"
                  className="mt-1 w-full rounded-md border border-hairline bg-white px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                />
              </div>
            </div>

            {/* Campaign Stills */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink">
                Featured Stills / Banner Image URL
              </label>
              <ImageUploadInput
                label="Primary Still / Banner Photo"
                value={campaignForm.stills[0]?.image || ''}
                onChange={(url) => {
                  const updated = [...campaignForm.stills];
                  updated[0] = { image: url, alt: campaignForm.title };
                  setCampaignForm((v) => ({ ...v, stills: updated }));
                }}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink">
                  Status
                </label>
                <select
                  value={campaignForm.status}
                  onChange={(e) =>
                    setCampaignForm((v) => ({ ...v, status: e.target.value as any }))
                  }
                  className="mt-1 w-full rounded-md border border-hairline bg-white px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="camp-feat"
                  checked={campaignForm.featured}
                  onChange={(e) => setCampaignForm((v) => ({ ...v, featured: e.target.checked }))}
                  className="h-4 w-4 rounded border-hairline text-brand focus:ring-brand"
                />
                <label htmlFor="camp-feat" className="text-xs font-bold uppercase tracking-wider text-ink cursor-pointer">
                  Featured on Homepage
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 border-t border-hairline pt-4">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsCampaignModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                {editingCampaign ? 'Save Changes' : 'Create Campaign'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ---------------------------------------------------- */}
      {/* Modal 2: Create / Edit Documentary Episode           */}
      {/* ---------------------------------------------------- */}
      {isEpisodeModalOpen && (
        <Modal
          open={isEpisodeModalOpen}
          onClose={() => setIsEpisodeModalOpen(false)}
          title={editingEpisode ? `Edit Documentary: ${editingEpisode.title}` : 'Add Documentary Episode'}
        >
          <form onSubmit={handleSaveEpisode} className="space-y-4">
            {/* Campaign Association */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink">
                Campaign
              </label>
              <select
                value={episodeForm.campaignSlug}
                onChange={(e) => setEpisodeForm((v) => ({ ...v, campaignSlug: e.target.value }))}
                className="mt-1 w-full rounded-md border border-hairline bg-white px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
              >
                {campaigns.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Video Link with Live Auto-Thumbnail Extraction */}
            <div className="rounded-lg border border-hairline bg-cream/40 p-3.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-ink">
                Documentary Video URL (YouTube, Vimeo, Cloudinary)
              </label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="text"
                  value={episodeForm.videoUrl}
                  onChange={(e) => handleVideoUrlChange(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full rounded-md border border-hairline bg-white px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                />
              </div>
              <p className="mt-1 text-[11px] text-muted">
                ✨ Paste any YouTube link to auto-extract high-resolution thumbnail and wire one-click video watch.
              </p>
            </div>

            {/* Live Interactive Card Preview */}
            <div className="rounded-lg border border-gold/30 bg-gold-50/20 p-3">
              <span className="flex items-center gap-1 font-display text-[11px] font-bold uppercase tracking-wider text-gold-deep">
                <Sparkles className="h-3.5 w-3.5" /> Live Documentary Card Preview
              </span>
              <div className="mt-2.5 max-w-sm overflow-hidden rounded-md border border-hairline bg-white shadow-sm">
                <div className="relative aspect-video w-full overflow-hidden bg-ink/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={episodeForm.image || '/images/campaign/campaign-1.jpg'}
                    alt="Card Preview"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute left-2.5 top-2.5 rounded-[4px] bg-brand-dark/95 px-2 py-0.5 font-display text-[9px] font-bold uppercase tracking-wider text-gold">
                    Episode {String(episodeForm.episodeNumber).padStart(2, '0')}
                  </span>
                  {episodeForm.status === 'Released' && (
                    <span className="absolute bottom-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-gold text-ink shadow-sm">
                      <Play className="ml-0.5 h-3 w-3 fill-current" />
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-display text-sm font-bold text-ink">
                    {episodeForm.title || 'Episode Title'}
                  </p>
                  <p className="text-[11px] font-semibold text-brand">
                    {episodeForm.profession || 'Profession'} • <span className="text-muted">{episodeForm.location || 'Location'}</span>
                  </p>
                  <p className="mt-1 text-[11px] text-muted line-clamp-2">
                    {episodeForm.description || 'Description summary will appear here on public campaign page.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink">
                  Episode Number *
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={episodeForm.episodeNumber}
                  onChange={(e) =>
                    setEpisodeForm((v) => ({ ...v, episodeNumber: Number(e.target.value) }))
                  }
                  className="mt-1 w-full rounded-md border border-hairline bg-white px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-ink">
                  Episode Title *
                </label>
                <input
                  type="text"
                  required
                  value={episodeForm.title}
                  onChange={(e) => setEpisodeForm((v) => ({ ...v, title: e.target.value }))}
                  placeholder="e.g. The Solar Engineer"
                  className="mt-1 w-full rounded-md border border-hairline bg-white px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink">
                  Featured Professional Name
                </label>
                <input
                  type="text"
                  value={episodeForm.professional}
                  onChange={(e) => setEpisodeForm((v) => ({ ...v, professional: e.target.value }))}
                  placeholder="e.g. Anand Kumar"
                  className="mt-1 w-full rounded-md border border-hairline bg-white px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink">
                  Profession / Career Field
                </label>
                <input
                  type="text"
                  value={episodeForm.profession}
                  onChange={(e) => setEpisodeForm((v) => ({ ...v, profession: e.target.value }))}
                  placeholder="e.g. Clean Tech & Energy"
                  className="mt-1 w-full rounded-md border border-hairline bg-white px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink">
                  Filming Location
                </label>
                <input
                  type="text"
                  value={episodeForm.location}
                  onChange={(e) => setEpisodeForm((v) => ({ ...v, location: e.target.value }))}
                  placeholder="e.g. Patna"
                  className="mt-1 w-full rounded-md border border-hairline bg-white px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink">
                  Duration
                </label>
                <input
                  type="text"
                  value={episodeForm.durationLabel}
                  onChange={(e) => setEpisodeForm((v) => ({ ...v, durationLabel: e.target.value }))}
                  placeholder="25 min"
                  className="mt-1 w-full rounded-md border border-hairline bg-white px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink">
                  Status
                </label>
                <select
                  value={episodeForm.status}
                  onChange={(e) =>
                    setEpisodeForm((v) => ({ ...v, status: e.target.value as any }))
                  }
                  className="mt-1 w-full rounded-md border border-hairline bg-white px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                >
                  <option value="Released">Released (Live Video)</option>
                  <option value="Coming Soon">Coming Soon</option>
                </select>
              </div>
            </div>

            {/* Custom Thumbnail Image */}
            <div>
              <ImageUploadInput
                label="Custom Thumbnail Image (or leave as auto-extracted from YouTube)"
                value={episodeForm.image}
                onChange={(url) => setEpisodeForm((v) => ({ ...v, image: url }))}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink">
                Episode Description / Synopsis
              </label>
              <textarea
                rows={3}
                value={episodeForm.description}
                onChange={(e) => setEpisodeForm((v) => ({ ...v, description: e.target.value }))}
                placeholder="A synopsis of the day in the life, challenges, and insights shared in this documentary..."
                className="mt-1 w-full rounded-md border border-hairline bg-white px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2.5 border-t border-hairline pt-4">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsEpisodeModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                {editingEpisode ? 'Save Episode Changes' : 'Publish Documentary Episode'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
