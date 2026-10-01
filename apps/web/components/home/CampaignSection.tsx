'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Play, X, Film, Sparkles, MapPin, ExternalLink, Video } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Reveal, StaggerGrid, StaggerItem } from '@/components/common/Reveal';
import type { Campaign, CampaignEpisode } from '@/types/content';
import { getVideoEmbedInfo, getPublicApiUrl, slugify } from '@/lib/utils';
import { isAutoSeededEpisode } from '@/lib/data';

/**
 * Flagship/Featured campaign section on the homepage.
 * - Displays the admin-selected featured campaign in real time.
 * - Showcases its behind-the-scenes stills and documentary episodes directly on the homepage.
 * - Features interactive click-to-play video modals so visitors can watch documentaries immediately.
 */
export function CampaignSection({ campaign }: { campaign: Campaign }) {
  const [activeCampaign, setActiveCampaign] = useState<Campaign>(campaign);
  const [playingEpisode, setPlayingEpisode] = useState<CampaignEpisode | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(true);

  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['-12%', '12%']);

  useEffect(() => {
    setActiveCampaign(campaign);
  }, [campaign]);

  useEffect(() => {
    let isMounted = true;

    const sync = async () => {
      try {
        let currentCampaign: Campaign = campaign;

        // 1. Check direct localStorage overrides
        const storedFeatured = localStorage.getItem('tsc_featured_campaign');
        if (storedFeatured) {
          const parsed = JSON.parse(storedFeatured);
          if (parsed && parsed.slug) {
            currentCampaign = parsed;
          }
        } else {
          const storedList =
            localStorage.getItem('tsc_admin_campaigns') ||
            localStorage.getItem('tsc_custom_campaigns');
          if (storedList) {
            const list = JSON.parse(storedList);
            if (Array.isArray(list) && list.length > 0) {
              const feat = list.find((c: any) => Boolean(c.featured)) || list[0];
              if (feat) {
                currentCampaign = feat;
              }
            }
          }
        }

        // 2. Check if admin panel saved episodes for this campaign
        const adminData = localStorage.getItem('tsc_admin_campaigns');
        if (adminData) {
          const parsedAdmin = JSON.parse(adminData);
          if (Array.isArray(parsedAdmin)) {
            const matched = parsedAdmin.find((c: any) => c.slug === currentCampaign.slug);
            if (matched && Array.isArray(matched.episodes)) {
              const epMap = new Map<string, CampaignEpisode>();
              (currentCampaign.episodes || []).forEach((e) => {
                const k = (e.slug || slugify(e.title) || (e.episodeNumber ? `ep-${e.episodeNumber}` : '') || e.id).trim().toLowerCase();
                epMap.set(k, e);
              });
              matched.episodes.filter((ep: any) => !isAutoSeededEpisode(ep)).forEach((e: any) => {
                const k = (e.slug || slugify(e.title) || (e.episodeNumber ? `ep-${e.episodeNumber}` : '') || e.id).trim().toLowerCase();
                epMap.set(k, e);
              });
              currentCampaign = {
                ...currentCampaign,
                ...matched,
                episodes: Array.from(epMap.values()),
              };
            }
          }
        }

        if (isMounted) {
          setActiveCampaign(currentCampaign);
        }

        // 3. Background fetch from database API for real-time consistency
        const api = getPublicApiUrl();
        if (api && currentCampaign.slug) {
          try {
            const res = await fetch(`${api}/api/campaigns/${currentCampaign.slug}`);
            if (res.ok && isMounted) {
              const json = await res.json();
              if (json?.data) {
                const apiCamp = json.data;
                const freshEps = (apiCamp.episodes || []).filter((ep: any) => !isAutoSeededEpisode(ep));
                setActiveCampaign((prev) => {
                  if (prev.slug === apiCamp.slug) {
                    const epMap = new Map<string, CampaignEpisode>();
                    (prev.episodes || []).forEach((e) => {
                      const k = (e.slug || slugify(e.title) || (e.episodeNumber ? `ep-${e.episodeNumber}` : '') || e.id).trim().toLowerCase();
                      epMap.set(k, e);
                    });
                    freshEps.forEach((e: any) => {
                      const k = (e.slug || slugify(e.title) || (e.episodeNumber ? `ep-${e.episodeNumber}` : '') || e.id).trim().toLowerCase();
                      epMap.set(k, e);
                    });
                    return {
                      ...prev,
                      ...apiCamp,
                      episodes: Array.from(epMap.values()),
                    };
                  }
                  return prev;
                });
              }
            }
          } catch {}
        }
      } catch {}
    };

    sync();
    window.addEventListener('tsc_campaigns_updated', sync);
    window.addEventListener('storage', sync);
    return () => {
      isMounted = false;
      window.removeEventListener('tsc_campaigns_updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, [campaign]);

  // Handle escape key to close video modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && playingEpisode) {
        setPlayingEpisode(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playingEpisode]);

  const stills = activeCampaign.stills?.length
    ? activeCampaign.stills
    : [
        { image: '/images/campaign/campaign-1.jpg', alt: 'Documentary still 01' },
        { image: '/images/campaign/campaign-2.jpg', alt: 'Documentary still 02' },
        { image: '/images/campaign/campaign-3.jpg', alt: 'Documentary still 03' },
      ];

  const bgImage = stills[1]?.image ?? stills[0]?.image ?? '/images/campaign/campaign-2.jpg';

  const seenEpisodeKeys = new Set<string>();
  const episodes = (activeCampaign.episodes || [])
    .filter((ep) => !isAutoSeededEpisode(ep))
    .filter((ep) => {
      const key = (ep.slug || (ep.title ? slugify(ep.title) : '') || (ep.episodeNumber ? `ep-${ep.episodeNumber}` : '') || ep.id).trim().toLowerCase();
      if (!key || seenEpisodeKeys.has(key)) return false;
      seenEpisodeKeys.add(key);
      return true;
    });
  const latestEpisode = episodes[0];

  const embedInfo = playingEpisode?.videoUrl ? getVideoEmbedInfo(playingEpisode.videoUrl) : null;
  const embedUrlWithAutoplay = embedInfo?.embedUrl
    ? embedInfo.embedUrl.includes('?')
      ? `${embedInfo.embedUrl}&autoplay=1`
      : `${embedInfo.embedUrl}?autoplay=1`
    : null;

  const scrollToEpisodes = () => {
    const el = document.getElementById('home-documentaries-grid');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section ref={ref} aria-label="Featured campaign" className="relative overflow-hidden bg-brand-dark">
      {/* Parallax ambient background */}
      <motion.div aria-hidden className="absolute inset-[-14%] opacity-[0.16]" style={{ y: bgY }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={bgImage} alt="" className="h-full w-full object-cover" />
      </motion.div>
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-brand-dark via-brand-dark/85 to-brand-dark" />

      <div className="container-tsc section-pad relative">
        {/* Header / Narrative */}
        <div className="mx-auto max-w-4xl text-center">
          <Reveal>
            <p className="eyebrow justify-center !text-gold">
              <span aria-hidden className="h-1.5 w-1.5 rounded-[2px] bg-gold" />
              {activeCampaign.eyebrow || 'TSC ORIGINAL CAMPAIGN'}
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-5 font-display text-[1.7rem] font-bold uppercase leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-[2.9rem]">
              {activeCampaign.title}
            </h2>
          </Reveal>
          {activeCampaign.headline && (
            <Reveal delay={0.16}>
              <p className="mt-5 font-serif text-xl italic text-cream sm:text-2xl">{activeCampaign.headline}</p>
            </Reveal>
          )}
          {activeCampaign.description && (
            <Reveal delay={0.22}>
              <p className="mx-auto mt-6 max-w-3xl text-[14.5px] leading-7 text-white/75 sm:text-[15px] sm:leading-8">
                {activeCampaign.description}
              </p>
            </Reveal>
          )}

          {/* Action CTAs */}
          <Reveal delay={0.3}>
            <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button href={`/campaigns/${activeCampaign.slug}`} variant="light" size="lg" arrow>
                Explore Campaign Page
              </Button>

              {episodes.length > 0 ? (
                <button
                  type="button"
                  onClick={scrollToEpisodes}
                  className="relative inline-flex items-center gap-2.5 rounded-full bg-gold px-7 py-3.5 font-display text-[13px] font-bold uppercase tracking-[0.08em] text-ink shadow-lift transition-all hover:bg-gold-deep hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-ink text-gold">
                    <span aria-hidden className="absolute -inset-1 animate-ping rounded-full bg-gold/40" />
                    <Play aria-hidden className="ml-0.5 h-3 w-3 fill-current" />
                  </span>
                  Watch Documentaries ({episodes.length})
                </button>
              ) : (
                <Link
                  href={`/campaigns/${activeCampaign.slug}#episodes`}
                  className="relative inline-flex items-center gap-2.5 rounded-full bg-gold px-7 py-3.5 font-display text-[13px] font-bold uppercase tracking-[0.08em] text-ink shadow-lift transition-colors hover:bg-gold-deep"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-gold">
                    <Play aria-hidden className="ml-0.5 h-3 w-3 fill-current" />
                  </span>
                  Watch Documentaries
                </Link>
              )}
            </div>
          </Reveal>
        </div>

        {/* Behind The Scenes Stills (Hero Gallery) */}
        <div className="mt-16 grid gap-5 sm:grid-cols-3">
          {stills.slice(0, 3).map((s, i) => (
            <motion.figure
              key={`${s.image}-${i}`}
              className="group relative overflow-hidden rounded-md border border-white/10"
              initial={{ opacity: 0, y: reduce ? 0 : 40 * (i + 1) * 0.5 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.image}
                alt={s.alt || `Documentary still ${String(i + 1).padStart(2, '0')}`}
                className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-4 text-[11px] font-bold uppercase tracking-[0.16em] text-cream">
                {s.alt || `Documentary still ${String(i + 1).padStart(2, '0')}`}
              </figcaption>
            </motion.figure>
          ))}
        </div>

        {/* ── Documentary Episodes Showcase (Home Grid) ────────────────── */}
        <div id="home-documentaries-grid" className="mt-20 scroll-mt-16 border-t border-white/10 pt-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold/20 text-gold">
                  <Film className="h-4 w-4" />
                </span>
                <h3 className="font-display text-xl font-bold uppercase tracking-wide text-white sm:text-2xl">
                  Documentary Episodes
                </h3>
                <span className="rounded-full border border-gold/40 bg-gold/15 px-2.5 py-0.5 font-display text-[10px] font-bold uppercase tracking-wider text-gold">
                  {episodes.length} {episodes.length === 1 ? 'Episode' : 'Episodes'}
                </span>
              </div>
              <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-white/70">
                Direct from &ldquo;{activeCampaign.title}&rdquo; — real career stories and insights from industry professionals. Click any episode to stream immediately.
              </p>
            </div>

            <Link
              href={`/campaigns/${activeCampaign.slug}#episodes`}
              className="inline-flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-wider text-gold hover:text-white transition-colors"
            >
              Series Hub &amp; Full Archive <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>

          {episodes.length === 0 ? (
            <div className="mt-8 rounded-lg border border-dashed border-white/15 bg-white/[0.02] p-10 text-center text-white/60">
              <Film className="mx-auto h-8 w-8 text-gold/60" />
              <p className="mt-3 font-display text-sm font-bold text-white">No documentary episodes added yet</p>
              <p className="mt-1 text-xs text-white/50">
                Documentaries published in the admin panel for &ldquo;{activeCampaign.title}&rdquo; will appear here automatically.
              </p>
              <div className="mt-5">
                <Button href={`/campaigns/${activeCampaign.slug}`} variant="light" size="sm">
                  View Campaign Details
                </Button>
              </div>
            </div>
          ) : (
            <StaggerGrid className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {episodes.map((ep, idx) => {
                const isReleased = ep.status === 'Released' && !!ep.videoUrl;

                return (
                  <StaggerItem key={`home-campaign-ep-${ep.id || idx}-${ep.episodeNumber}`}>
                    <div
                      onClick={() => {
                        if (isReleased) {
                          setIsVideoLoading(true);
                          setPlayingEpisode(ep);
                        }
                      }}
                      className={`group relative flex h-full flex-col overflow-hidden rounded-lg border border-white/10 bg-white/[0.04] backdrop-blur-sm transition-all duration-300 ${
                        isReleased
                          ? 'cursor-pointer hover:-translate-y-1 hover:border-gold/60 hover:bg-white/[0.07] hover:shadow-xl'
                          : 'opacity-85'
                      }`}
                    >
                      {/* 16:9 Thumbnail Container */}
                      <div className="relative aspect-video overflow-hidden bg-black/40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={ep.image || '/images/campaign/campaign-1.jpg'}
                          alt={ep.title}
                          className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                            ep.status === 'Coming Soon' ? 'grayscale-[30%]' : ''
                          }`}
                        />

                        {/* Top Left: Episode Number Badge */}
                        <span className="absolute left-3 top-3 rounded-[4px] bg-brand-dark/95 px-2.5 py-1 font-display text-[10px] font-bold uppercase tracking-[0.14em] text-gold shadow-md border border-gold/20">
                          Episode {String(ep.episodeNumber).padStart(2, '0')}
                        </span>

                        {/* Top Right: Latest Badge */}
                        {idx === 0 && (
                          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-[4px] bg-gold px-2.5 py-1 font-display text-[9px] font-bold uppercase tracking-[0.14em] text-ink shadow-md">
                            <Sparkles className="h-2.5 w-2.5 fill-current" /> Latest
                          </span>
                        )}

                        {/* Play Action Overlay */}
                        {isReleased ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-ink/20 opacity-90 transition-opacity duration-300 group-hover:opacity-100 group-hover:bg-ink/35">
                            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold text-ink shadow-lift transition-transform duration-300 group-hover:scale-110 group-hover:bg-gold-deep group-hover:text-white">
                              <Play className="ml-0.5 h-5 w-5 fill-current" />
                            </span>
                          </div>
                        ) : (
                          <span className="absolute bottom-3 right-3 rounded-full bg-ink/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-cream border border-white/10">
                            Coming Soon
                          </span>
                        )}

                        {/* Bottom Right Duration Pill */}
                        {isReleased && ep.durationLabel && (
                          <span className="absolute bottom-2.5 right-2.5 rounded bg-black/80 px-2 py-0.5 text-[10px] font-semibold text-white/90">
                            {ep.durationLabel}
                          </span>
                        )}
                      </div>

                      {/* Content Card Body */}
                      <div className="flex flex-1 flex-col p-4 sm:p-5">
                        <h4 className="font-display text-base font-bold text-white transition-colors group-hover:text-gold line-clamp-1">
                          {ep.title}
                        </h4>

                        <p className="mt-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gold-deep">
                          <span>{ep.profession || 'Professional'}</span>
                          {ep.location && (
                            <>
                              <span className="text-white/30">•</span>
                              <span className="inline-flex items-center gap-0.5 text-white/60 font-medium">
                                <MapPin className="h-3 w-3" /> {ep.location}
                              </span>
                            </>
                          )}
                        </p>

                        {ep.description && (
                          <p className="mt-2 text-[12.5px] leading-relaxed text-white/70 line-clamp-2">
                            {ep.description}
                          </p>
                        )}

                        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs">
                          <span className="font-display text-[11px] font-bold uppercase tracking-wider text-gold group-hover:underline">
                            {isReleased ? 'Watch Episode ▶' : 'In Production'}
                          </span>
                          {ep.professional && (
                            <span className="text-[11px] text-white/60 truncate max-w-[130px]">
                              {ep.professional}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerGrid>
          )}

          {episodes.length > 0 && (
            <div className="mt-10 text-center">
              <Button href={`/campaigns/${activeCampaign.slug}#episodes`} variant="light" size="sm" arrow>
                Explore Full Campaign Hub &amp; All Episodes
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ── Interactive Click-to-Play Video Modal ──────────────────────── */}
      <AnimatePresence>
        {playingEpisode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPlayingEpisode(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-4xl overflow-hidden rounded-xl border border-white/20 bg-brand-dark shadow-2xl z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between border-b border-white/10 bg-black/40 px-5 py-3.5">
                <div className="flex items-center gap-2 truncate pr-4">
                  <span className="rounded bg-gold px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-wider text-ink">
                    Episode {String(playingEpisode.episodeNumber).padStart(2, '0')}
                  </span>
                  <span className="font-display text-sm font-bold text-white truncate">
                    {playingEpisode.title}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPlayingEpisode(null)}
                  className="rounded-full p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                  title="Close player (Esc)"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Video Player Screen (16:9) */}
              <div className="relative aspect-video w-full bg-black">
                {embedInfo?.type === 'direct' ? (
                  <video
                    src={embedInfo.embedUrl}
                    controls
                    autoPlay
                    playsInline
                    className="h-full w-full"
                  >
                    Your browser does not support HTML5 video playback.
                  </video>
                ) : embedUrlWithAutoplay ? (
                  <>
                    {isVideoLoading && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink/90 text-white/80 z-10 pointer-events-none">
                        <div className="h-9 w-9 animate-spin rounded-full border-2 border-gold border-t-transparent mb-3" />
                        <p className="font-display text-xs font-bold uppercase tracking-wider text-gold">
                          Loading Documentary…
                        </p>
                      </div>
                    )}
                    <iframe
                      src={embedUrlWithAutoplay}
                      title={`${playingEpisode.title} — Documentary Episode`}
                      className="absolute inset-0 h-full w-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                      allowFullScreen
                      loading="lazy"
                      onLoad={() => setIsVideoLoading(false)}
                    />
                  </>
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center text-white/70">
                    <Video className="h-10 w-10 text-gold mb-2" />
                    <p className="text-sm font-medium">Video preview link:</p>
                    <a
                      href={playingEpisode.videoUrl || undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 text-xs text-gold underline break-all"
                    >
                      {playingEpisode.videoUrl}
                    </a>
                  </div>
                )}
              </div>

              {/* Episode Info Footer */}
              <div className="bg-black/60 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="font-display text-base font-bold text-white">
                      {playingEpisode.title}
                    </h4>
                    <p className="mt-0.5 text-xs text-gold">
                      {playingEpisode.profession || 'Specialist'}
                      {playingEpisode.professional ? ` — ${playingEpisode.professional}` : ''}
                      {playingEpisode.location ? ` • ${playingEpisode.location}` : ''}
                    </p>
                  </div>

                  {playingEpisode.videoUrl && (
                    <a
                      href={playingEpisode.videoUrl || undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded border border-white/20 bg-white/5 px-3 py-1.5 font-display text-[11px] font-bold uppercase tracking-wider text-white hover:bg-white/10 hover:border-gold hover:text-gold transition-colors"
                    >
                      Watch on Video Host <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>

                {playingEpisode.description && (
                  <p className="mt-3 text-xs leading-relaxed text-white/70">
                    {playingEpisode.description}
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
