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
  Star,
} from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { useToast } from '@/components/common/Toast';
import { ImageUploadInput } from '@/components/admin/ImageUploadInput';
import { flagshipCampaign } from '@/data/content';
import { type Campaign, type CampaignEpisode } from '@/types/content';
import { slugify, getYoutubeThumbnailUrl, getPublicApiUrl } from '@/lib/utils';
import { isAutoSeededEpisode } from '@/lib/data';

export function CampaignsAdmin() {
  const { push } = useToast();
  const api = getPublicApiUrl();

  const getAdminToken = () =>
    typeof window !== 'undefined'
      ? localStorage.getItem('tsc_token') || localStorage.getItem('tsc.token')
      : null;

  const [campaigns, setCampaigns] = useState<Campaign[]>([flagshipCampaign]);
  const [selectedCampaignSlug, setSelectedCampaignSlug] = useState<string>(
    flagshipCampaign.slug
  );
  const [loading, setLoading] = useState(true);

  // Campaign Modal State
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [savingCampaign, setSavingCampaign] = useState(false);
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
  const [savingEpisode, setSavingEpisode] = useState(false);
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

  // Dedicated Behind The Scenes Stills Modal State
  const [isStillsModalOpen, setIsStillsModalOpen] = useState(false);
  const [savingStills, setSavingStills] = useState(false);
  const [stillsForm, setStillsForm] = useState<Array<{ image: string; alt: string }>>([
    { image: '/images/campaign/campaign-1.jpg', alt: 'Behind the scenes 01' },
    { image: '/images/campaign/campaign-2.jpg', alt: 'Behind the scenes 02' },
    { image: '/images/campaign/campaign-3.jpg', alt: 'Behind the scenes 03' },
  ]);

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
              id: c._id?.toString() || c.id || c.slug,
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
              episodes: Array.isArray(c.episodes)
                ? c.episodes.filter((ep: any) => !isAutoSeededEpisode(ep))
                : [],
              status: c.status || 'published',
              featured: Boolean(c.featured),
            }));
          }
        }
      } catch {
        // fallback to local storage
      }
    }

    // 2. Check local storage overrides and merge seamlessly
    if (typeof window !== 'undefined') {
      try {
        const saved = window.localStorage.getItem('tsc_admin_campaigns');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const campMap = new Map<string, Campaign>();
            loadedCampaigns.forEach((c) => campMap.set(c.slug, c));
            parsed.forEach((localCamp: Campaign) => {
              const existing = campMap.get(localCamp.slug);
              const cleanLocalEpisodes = (localCamp.episodes || []).filter(
                (ep) => !isAutoSeededEpisode(ep)
              );
              if (existing) {
                const epMap = new Map<string, CampaignEpisode>();
                (existing.episodes || [])
                  .filter((ep) => !isAutoSeededEpisode(ep))
                  .forEach((e) => {
                    const key = (e.slug || slugify(e.title) || (e.episodeNumber ? `ep-${e.episodeNumber}` : '') || e.id).trim().toLowerCase();
                    epMap.set(key, e);
                  });
                cleanLocalEpisodes.forEach((e) => {
                  const key = (e.slug || slugify(e.title) || (e.episodeNumber ? `ep-${e.episodeNumber}` : '') || e.id).trim().toLowerCase();
                  const existingEp = epMap.get(key);
                  epMap.set(key, {
                    ...existingEp,
                    ...e,
                    id: existingEp?.id || e.id,
                  });
                });
                campMap.set(localCamp.slug, {
                  ...existing,
                  ...localCamp,
                  id: existing.id || localCamp.id,
                  episodes: Array.from(epMap.values()).sort(
                    (a, b) => (Number(b.episodeNumber) || 0) - (Number(a.episodeNumber) || 0)
                  ),
                });
              } else {
                const epMap = new Map<string, CampaignEpisode>();
                cleanLocalEpisodes.forEach((e) => {
                  const key = (e.slug || slugify(e.title) || (e.episodeNumber ? `ep-${e.episodeNumber}` : '') || e.id).trim().toLowerCase();
                  epMap.set(key, e);
                });
                campMap.set(localCamp.slug, {
                  ...localCamp,
                  episodes: Array.from(epMap.values()),
                });
              }
            });
            loadedCampaigns = Array.from(campMap.values());
          }
        }
      } catch {}
    }

    // Deduplicate episodes within each campaign to prevent doubles
    loadedCampaigns = loadedCampaigns.map((c) => {
      const seen = new Set<string>();
      const dedupedEpisodes = (c.episodes || []).filter((ep) => {
        if (!ep || isAutoSeededEpisode(ep)) return false;
        const key = (ep.slug || slugify(ep.title) || (ep.episodeNumber ? `ep-${ep.episodeNumber}` : '') || ep.id).trim().toLowerCase();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      return {
        ...c,
        episodes: dedupedEpisodes,
      };
    });

    // Ensure accurate single active featured campaign
    let foundFeatured = false;
    loadedCampaigns = loadedCampaigns.map((c) => {
      if (Boolean(c.featured)) {
        if (!foundFeatured) {
          foundFeatured = true;
          return { ...c, featured: true };
        }
        return { ...c, featured: false };
      }
      return { ...c, featured: false };
    });

    if (!foundFeatured && loadedCampaigns.length > 0) {
      const defaultFeat =
        loadedCampaigns.find((c) => c.slug === 'all-india-career-awareness') || loadedCampaigns[0];
      loadedCampaigns = loadedCampaigns.map((c) => ({
        ...c,
        featured: c.slug === defaultFeat.slug,
      }));
    }

    // Immediately persist cleaned campaigns back to localStorage
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('tsc_admin_campaigns', JSON.stringify(loadedCampaigns));
        window.localStorage.setItem('tsc_custom_campaigns', JSON.stringify(loadedCampaigns));
        const activeFeat = loadedCampaigns.find((c) => Boolean(c.featured)) || loadedCampaigns[0];
        if (activeFeat) {
          window.localStorage.setItem('tsc_featured_campaign', JSON.stringify(activeFeat));
        }
        window.dispatchEvent(new Event('tsc_campaigns_updated'));
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
      try {
        window.localStorage.setItem('tsc_admin_campaigns', JSON.stringify(nextCampaigns));
        window.localStorage.setItem('tsc_custom_campaigns', JSON.stringify(nextCampaigns));
        const activeFeat = nextCampaigns.find((c) => Boolean(c.featured)) || nextCampaigns[0];
        if (activeFeat) {
          window.localStorage.setItem('tsc_featured_campaign', JSON.stringify(activeFeat));
        }
        window.dispatchEvent(new Event('tsc_campaigns_updated'));
      } catch {
        /* ignore */
      }
    }
  };

  const handleSetFeaturedCampaign = async (camp: Campaign) => {
    const next = campaigns.map((c) => ({
      ...c,
      featured: c.slug === camp.slug,
    }));
    await persistCampaigns(next);

    const token = getAdminToken();
    if (api && token) {
      try {
        await fetch(`${api}/api/campaigns/${camp.id || camp.slug}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ featured: true }),
        });
      } catch {}
    }

    push(`"${camp.title}" is now featured on the homepage!`, 'success');
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
            { image: '/images/campaign/campaign-1.jpg', alt: 'Behind the scenes 01' },
            { image: '/images/campaign/campaign-2.jpg', alt: 'Behind the scenes 02' },
            { image: '/images/campaign/campaign-3.jpg', alt: 'Behind the scenes 03' },
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
      const el = document.getElementById('camp-title');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus();
      }
      return;
    }

    setSavingCampaign(true);
    try {
      const slug = campaignForm.slug.trim() || slugify(campaignForm.title);
      const categories = campaignForm.categories
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const locations = campaignForm.locations
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const token = getAdminToken();

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

        let next = campaigns.map((c) => (c.slug === editingCampaign.slug ? updatedCampaign : c));
        if (campaignForm.featured) {
          next = next.map((c) => ({ ...c, featured: c.slug === slug }));
        }
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
        let newCampaign: Campaign = {
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

        // Sync to API
        if (api && token) {
          try {
            const res = await fetch(`${api}/api/campaigns`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(newCampaign),
            });
            if (res.ok) {
              const resJson = await res.json();
              if (resJson?.data?._id || resJson?.data?.id) {
                newCampaign = {
                  ...newCampaign,
                  id: (resJson.data._id || resJson.data.id).toString(),
                };
              }
            }
          } catch {}
        }

        let next = [...campaigns, newCampaign];
        if (campaignForm.featured) {
          next = next.map((c) => ({ ...c, featured: c.slug === slug }));
        }
        await persistCampaigns(next);
        setSelectedCampaignSlug(slug);

        push(`Campaign "${campaignForm.title}" created successfully!`, 'success');
      }

      setIsCampaignModalOpen(false);
    } finally {
      setSavingCampaign(false);
    }
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

    const token = getAdminToken();
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

  const handleOpenStillsEditor = (targetCamp?: Campaign) => {
    const camp = targetCamp || selectedCampaign;
    const currentStills = camp.stills?.length
      ? camp.stills
      : [
          { image: '/images/campaign/campaign-1.jpg', alt: 'Behind the scenes 01' },
          { image: '/images/campaign/campaign-2.jpg', alt: 'Behind the scenes 02' },
          { image: '/images/campaign/campaign-3.jpg', alt: 'Behind the scenes 03' },
        ];
    setStillsForm(currentStills);
    setIsStillsModalOpen(true);
  };

  const handleSaveStills = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingStills(true);
    try {
      const sanitizedStills = stillsForm
        .filter((s) => s.image && s.image.trim())
        .map((s, idx) => ({
          image: s.image.trim(),
          alt: s.alt?.trim() || `Behind the scenes ${String(idx + 1).padStart(2, '0')}`,
        }));

      const finalStills = sanitizedStills.length > 0 ? sanitizedStills : flagshipCampaign.stills;

      const updatedCampaign: Campaign = {
        ...selectedCampaign,
        stills: finalStills,
      };

      const next = campaigns.map((c) =>
        c.slug === selectedCampaign.slug ? updatedCampaign : c
      );
      await persistCampaigns(next);

      const token = getAdminToken();
      if (api && token) {
        try {
          await fetch(`${api}/api/campaigns/${selectedCampaign.id || selectedCampaign.slug}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ stills: finalStills }),
          });
        } catch {}
      }

      push('Behind the Scenes hero images updated successfully!', 'success');
      setIsStillsModalOpen(false);
    } catch {
      push('Failed to save Behind the Scenes images.', 'error');
    } finally {
      setSavingStills(false);
    }
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

    setSavingEpisode(true);
    try {
      const slug = episodeForm.slug.trim() || slugify(episodeForm.title);
      const thumb =
        episodeForm.image.trim() ||
        (episodeForm.videoUrl ? getYoutubeThumbnailUrl(episodeForm.videoUrl, 'hq') : null) ||
        '/images/campaign/campaign-1.jpg';

      const token = getAdminToken();

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
              body: JSON.stringify({
                ...updated,
                campaign: targetCamp.id || targetCamp.slug,
                campaignSlug: targetCamp.slug,
              }),
            });
          } catch {}
        }

        push(`Episode "${episodeForm.title}" updated successfully!`, 'success');
      } else {
        let newEpisode: CampaignEpisode = {
          id: `ep_${Date.now()}`,
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

        if (api && token) {
          try {
            const res = await fetch(`${api}/api/campaign-episodes`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                ...newEpisode,
                campaign: targetCamp.id || targetCamp.slug,
                campaignSlug: targetCamp.slug,
              }),
            });
            if (res.ok) {
              const resJson = await res.json();
              if (resJson?.data?._id || resJson?.data?.id) {
                newEpisode = {
                  ...newEpisode,
                  id: (resJson.data._id || resJson.data.id).toString(),
                };
              }
            }
          } catch {}
        }

        const epMap = new Map<string, CampaignEpisode>();
        (targetCamp.episodes || []).forEach((e) => {
          const k = (e.slug || slugify(e.title) || (e.episodeNumber ? `ep-${e.episodeNumber}` : '') || e.id).trim().toLowerCase();
          epMap.set(k, e);
        });
        const newKey = (newEpisode.slug || slugify(newEpisode.title) || (newEpisode.episodeNumber ? `ep-${newEpisode.episodeNumber}` : '') || newEpisode.id).trim().toLowerCase();
        epMap.set(newKey, newEpisode);
        updatedEpisodes = Array.from(epMap.values()).sort(
          (a, b) => (Number(b.episodeNumber) || 0) - (Number(a.episodeNumber) || 0)
        );

        push(`Episode "${episodeForm.title}" added to campaign!`, 'success');
      }

      const nextCampaigns = campaigns.map((c) =>
        c.slug === targetCamp.slug ? { ...c, episodes: updatedEpisodes } : c
      );
      await persistCampaigns(nextCampaigns);
      setIsEpisodeModalOpen(false);
    } finally {
      setSavingEpisode(false);
    }
  };

  const handleDeleteEpisode = async (ep: CampaignEpisode) => {
    if (!confirm(`Are you sure you want to delete episode "${ep.title}"?`)) {
      return;
    }

    const targetKey = (ep.slug || slugify(ep.title) || (ep.episodeNumber ? `ep-${ep.episodeNumber}` : '') || ep.id).trim().toLowerCase();
    const updatedEpisodes = (selectedCampaign.episodes || []).filter((e) => {
      const k = (e.slug || slugify(e.title) || (e.episodeNumber ? `ep-${e.episodeNumber}` : '') || e.id).trim().toLowerCase();
      return e.id !== ep.id && k !== targetKey;
    });
    const nextCampaigns = campaigns.map((c) =>
      c.slug === selectedCampaign.slug ? { ...c, episodes: updatedEpisodes } : c
    );
    await persistCampaigns(nextCampaigns);

    const token = getAdminToken();
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
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="rounded-[4px] bg-gold/30 px-2 py-0.5 font-display text-[9px] font-bold uppercase tracking-wider text-gold-deep">
                        {camp.slug === 'all-india-career-awareness' ? 'Flagship' : 'Campaign'}
                      </span>
                      {camp.featured && (
                        <span className="rounded-full bg-gold/20 border border-gold/50 px-2 py-0.5 font-display text-[9px] font-bold uppercase tracking-wider text-gold-deep inline-flex items-center gap-1">
                          <Star className="h-2.5 w-2.5 fill-gold-deep text-gold-deep" /> Homepage Feature
                        </span>
                      )}
                    </div>
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
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-ink/80">
                      <Film className="h-3.5 w-3.5 text-brand" /> {epCount} Episodes
                    </span>
                    {!camp.featured && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetFeaturedCampaign(camp);
                        }}
                        className="rounded border border-gold/40 bg-gold/10 px-2 py-0.5 font-display text-[9px] font-bold uppercase tracking-wider text-gold-deep hover:bg-gold hover:text-ink transition-colors flex items-center gap-1"
                        title="Set this campaign to feature on the homepage"
                      >
                        <Star className="h-2.5 w-2.5" /> Feature on Home
                      </button>
                    )}
                  </div>

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

      {/* Behind The Scenes Stills Section for Selected Campaign */}
      <section className="mb-10 rounded-xl border border-hairline bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg font-bold text-ink">
                Behind The Scenes Images ({selectedCampaign.title})
              </h2>
              <span className="rounded-full bg-brand-50 border border-brand/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">
                {selectedCampaign.stills?.length || 3} Images
              </span>
              {selectedCampaign.featured && (
                <span className="rounded-full bg-gold/20 border border-gold/40 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold-deep inline-flex items-center gap-1">
                  <Star className="h-3 w-3 fill-gold-deep text-gold-deep" /> Currently on Homepage
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-muted">
              These images appear in the hero section of the public campaign page (labeled &ldquo;Behind the scenes 01, 02, 03&rdquo;).
              Upload new photos or replace them below.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!selectedCampaign.featured && (
              <Button size="sm" variant="accent" onClick={() => handleSetFeaturedCampaign(selectedCampaign)}>
                <Star className="h-3.5 w-3.5 fill-current" /> Feature on Homepage
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => handleOpenStillsEditor()}>
              <Pencil className="h-3.5 w-3.5" /> Change Hero Images
            </Button>
          </div>
        </div>

        {/* Stills Preview Grid */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {(selectedCampaign.stills?.length
            ? selectedCampaign.stills
            : [
                { image: '/images/campaign/campaign-1.jpg', alt: 'Behind the scenes 01' },
                { image: '/images/campaign/campaign-2.jpg', alt: 'Behind the scenes 02' },
                { image: '/images/campaign/campaign-3.jpg', alt: 'Behind the scenes 03' },
              ]
          ).map((still, idx) => (
            <div
              key={`admin-hero-still-${idx}-${still.image}`}
              className="group relative overflow-hidden rounded-lg border border-hairline bg-cream/30 p-2.5 transition-all hover:border-brand/40 hover:shadow-sm"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md bg-ink/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={still.image || `/images/campaign/campaign-${(idx % 3) + 1}.jpg`}
                  alt={still.alt || `Behind the scenes ${String(idx + 1).padStart(2, '0')}`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent p-3 text-[10px] font-bold uppercase tracking-[0.16em] text-cream">
                  Behind the scenes {String(idx + 1).padStart(2, '0')}
                </div>
              </div>

              <div className="mt-3 px-1 pb-1">
                <p className="text-[12px] font-bold text-ink truncate" title={still.alt || `Behind the scenes ${String(idx + 1).padStart(2, '0')}`}>
                  {still.alt || `Behind the scenes 0${idx + 1}`}
                </p>
                <p className="mt-0.5 text-[11px] text-muted truncate" title={still.image}>
                  {still.image}
                </p>
                <button
                  type="button"
                  onClick={() => handleOpenStillsEditor()}
                  className="mt-2.5 w-full rounded border border-hairline bg-white py-1.5 text-center font-display text-[10px] font-bold uppercase tracking-wider text-brand transition-colors hover:border-brand hover:bg-brand-50"
                >
                  Change Image
                </button>
              </div>
            </div>
          ))}
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
              <span className="rounded-full bg-gold/20 border border-gold/40 px-2 py-0.5 font-display text-[9px] font-bold uppercase tracking-wider text-gold-deep">
                Latest Featured First
              </span>
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
            {[...(selectedCampaign.episodes || [])]
              .sort((a, b) => (Number(b.episodeNumber) || 0) - (Number(a.episodeNumber) || 0))
              .map((ep, idx) => {
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
                      {idx === 0 && (
                        <span className="absolute left-24 top-3 rounded-[4px] bg-gold px-2 py-1 font-display text-[9px] font-bold uppercase tracking-wider text-ink shadow-sm">
                          Latest Featured
                        </span>
                      )}
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

            {/* Behind the Scenes Stills Manager */}
            <div className="rounded-lg border border-hairline bg-cream/40 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink">
                    Behind the Scenes Images (Hero Section)
                  </label>
                  <p className="text-[11px] text-muted">
                    These images appear in the hero section labeled &ldquo;Behind the scenes 01, 02, 03&rdquo;.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setCampaignForm((v) => ({
                      ...v,
                      stills: [
                        ...v.stills,
                        {
                          image: '/images/campaign/campaign-1.jpg',
                          alt: `Behind the scenes ${String(v.stills.length + 1).padStart(2, '0')}`,
                        },
                      ],
                    }))
                  }
                  className="inline-flex items-center gap-1 rounded border border-hairline bg-white px-2 py-1 text-[11px] font-bold uppercase text-brand hover:bg-brand-50"
                >
                  <Plus className="h-3 w-3" /> Add Still
                </button>
              </div>

              <div className="space-y-4">
                {campaignForm.stills.map((still, idx) => (
                  <div key={`form-still-${idx}`} className="rounded-md border border-hairline bg-white p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-display text-xs font-bold text-ink">
                        Behind the scenes {String(idx + 1).padStart(2, '0')}
                      </span>
                      {campaignForm.stills.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = campaignForm.stills.filter((_, i) => i !== idx);
                            setCampaignForm((v) => ({ ...v, stills: updated }));
                          }}
                          className="text-red-500 hover:text-red-700 text-xs"
                          title="Remove still"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <ImageUploadInput
                      label={`Image ${idx + 1}`}
                      value={still.image || ''}
                      onChange={(url) => {
                        const updated = [...campaignForm.stills];
                        updated[idx] = {
                          image: url,
                          alt: still.alt || `Behind the scenes ${String(idx + 1).padStart(2, '0')}`,
                        };
                        setCampaignForm((v) => ({ ...v, stills: updated }));
                      }}
                    />
                    <input
                      type="text"
                      value={still.alt || ''}
                      onChange={(e) => {
                        const updated = [...campaignForm.stills];
                        updated[idx] = { ...updated[idx], alt: e.target.value };
                        setCampaignForm((v) => ({ ...v, stills: updated }));
                      }}
                      placeholder={`Caption / Alt (e.g. Behind the scenes 0${idx + 1})`}
                      className="mt-2 w-full rounded border border-hairline bg-white px-2.5 py-1 text-xs text-ink focus:border-brand focus:outline-none"
                    />
                  </div>
                ))}
              </div>
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
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsCampaignModalOpen(false)} disabled={savingCampaign}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={savingCampaign}>
                {savingCampaign ? (
                  <span className="flex items-center gap-1.5">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Saving…
                  </span>
                ) : (
                  editingCampaign ? 'Save Changes' : 'Create Campaign'
                )}
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
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsEpisodeModalOpen(false)} disabled={savingEpisode}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={savingEpisode}>
                {savingEpisode ? (
                  <span className="flex items-center gap-1.5">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Saving…
                  </span>
                ) : (
                  editingEpisode ? 'Save Episode Changes' : 'Publish Documentary Episode'
                )}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ---------------------------------------------------- */}
      {/* Modal 3: Edit Behind The Scenes Hero Stills          */}
      {/* ---------------------------------------------------- */}
      {isStillsModalOpen && (
        <Modal
          open={isStillsModalOpen}
          onClose={() => setIsStillsModalOpen(false)}
          title={`Behind The Scenes Images: ${selectedCampaign.title}`}
        >
          <form onSubmit={handleSaveStills} className="space-y-4">
            <p className="text-xs text-muted">
              Update the 3 images displayed in the hero section labeled &ldquo;Behind the scenes 01, 02, 03&rdquo;. You can upload new images from device or paste image URLs.
            </p>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {stillsForm.map((still, idx) => (
                <div key={`stills-form-item-${idx}`} className="rounded-lg border border-hairline bg-cream/30 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-display text-xs font-bold uppercase tracking-wider text-ink">
                      Behind the scenes {String(idx + 1).padStart(2, '0')}
                    </span>
                    {stillsForm.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setStillsForm((v) => v.filter((_, i) => i !== idx))}
                        className="text-red-500 hover:text-red-700 text-xs"
                        title="Remove image"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <ImageUploadInput
                    label={`Image URL / Upload (${idx + 1})`}
                    value={still.image || ''}
                    onChange={(url) => {
                      const updated = [...stillsForm];
                      updated[idx] = {
                        image: url,
                        alt: still.alt || `Behind the scenes ${String(idx + 1).padStart(2, '0')}`,
                      };
                      setStillsForm(updated);
                    }}
                  />

                  <div className="mt-2.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-muted">
                      Caption / Alt Text
                    </label>
                    <input
                      type="text"
                      value={still.alt || ''}
                      onChange={(e) => {
                        const updated = [...stillsForm];
                        updated[idx] = { ...updated[idx], alt: e.target.value };
                        setStillsForm(updated);
                      }}
                      placeholder={`Behind the scenes ${String(idx + 1).padStart(2, '0')}`}
                      className="mt-1 w-full rounded-md border border-hairline bg-white px-3 py-1.5 text-xs text-ink focus:border-brand focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-hairline pt-4">
              <button
                type="button"
                onClick={() =>
                  setStillsForm((v) => [
                    ...v,
                    {
                      image: '/images/campaign/campaign-1.jpg',
                      alt: `Behind the scenes ${String(v.length + 1).padStart(2, '0')}`,
                    },
                  ])
                }
                className="inline-flex items-center gap-1 rounded border border-hairline bg-white px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider text-brand hover:bg-brand-50"
              >
                <Plus className="h-3.5 w-3.5" /> Add Another Still
              </button>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsStillsModalOpen(false)}
                  disabled={savingStills}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={savingStills}>
                  {savingStills ? (
                    <span className="flex items-center gap-1.5">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Saving…
                    </span>
                  ) : (
                    'Save Behind The Scenes Images'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
