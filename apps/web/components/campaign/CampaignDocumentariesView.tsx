'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { MapPin, Play, ArrowLeft, Sparkles } from 'lucide-react';
import { DemoNotice } from '@/components/common/PageHeader';
import { StaggerGrid, StaggerItem, Reveal } from '@/components/common/Reveal';
import { Button } from '@/components/common/Button';
import { type Campaign, type CampaignEpisode } from '@/types/content';
import { getPublicApiUrl } from '@/lib/utils';

interface CampaignDocumentariesViewProps {
  initialCampaign: Campaign;
  showBackLink?: boolean;
}

export function CampaignDocumentariesView({
  initialCampaign,
  showBackLink = false,
}: CampaignDocumentariesViewProps) {
  const [campaign, setCampaign] = useState<Campaign>(initialCampaign);

  useEffect(() => {
    let isMounted = true;

    const syncCampaignData = async () => {
      let currentEpisodes = Array.isArray(initialCampaign.episodes)
        ? [...initialCampaign.episodes]
        : [];
      let updatedCamp: Campaign = { ...initialCampaign };

      // 1. Fetch from database API
      const api = getPublicApiUrl();
      if (api) {
        try {
          const res = await fetch(`${api}/api/campaigns/${initialCampaign.slug}`, {
            cache: 'no-store',
          });
          if (res.ok) {
            const json = await res.json();
            const apiData = json?.data;
            if (apiData) {
              if (Array.isArray(apiData.episodes) && apiData.episodes.length > 0) {
                currentEpisodes = apiData.episodes;
              }
              if (Array.isArray(apiData.stills) && apiData.stills.length > 0) {
                updatedCamp.stills = apiData.stills;
              }
              updatedCamp = {
                ...updatedCamp,
                ...apiData,
                episodes: currentEpisodes,
              };
            }
          }
        } catch {
          // ignore network failure, fallback to initial/local
        }
      }

      // 2. Sync from local storage overrides (instant admin view & offline sync)
      if (typeof window !== 'undefined') {
        try {
          const saved = window.localStorage.getItem('tsc_admin_campaigns');
          if (saved) {
            const parsed: Campaign[] = JSON.parse(saved);
            const localMatch = parsed.find(
              (c) => c.slug === initialCampaign.slug || c.id === initialCampaign.id
            );
            if (localMatch) {
              if (Array.isArray(localMatch.stills) && localMatch.stills.length > 0) {
                updatedCamp.stills = localMatch.stills;
              }
              if (localMatch.title) updatedCamp.title = localMatch.title;
              if (localMatch.headline) updatedCamp.headline = localMatch.headline;
              if (localMatch.description) updatedCamp.description = localMatch.description;
              if (localMatch.categories) updatedCamp.categories = localMatch.categories;
              if (localMatch.locations) updatedCamp.locations = localMatch.locations;

              if (Array.isArray(localMatch.episodes) && localMatch.episodes.length > 0) {
                const epMap = new Map<string, CampaignEpisode>();
                // Keep API / initial episodes first
                currentEpisodes.forEach((ep) => {
                  const key = ep.id || ep.slug || String(ep.episodeNumber);
                  epMap.set(key, ep);
                });
                // Overlay / merge local admin episodes
                localMatch.episodes.forEach((ep) => {
                  const key = ep.id || ep.slug || String(ep.episodeNumber);
                  epMap.set(key, ep);
                });
                currentEpisodes = Array.from(epMap.values());
              }
            }
          }
        } catch {
          /* ignore */
        }
      }

      // Always sort episodes so the latest documentary is first!
      currentEpisodes.sort(
        (a, b) => (Number(b.episodeNumber) || 0) - (Number(a.episodeNumber) || 0)
      );

      if (isMounted) {
        setCampaign({
          ...updatedCamp,
          episodes: currentEpisodes,
        });
      }
    };

    syncCampaignData();

    const handleUpdate = () => {
      syncCampaignData();
    };

    window.addEventListener('storage', handleUpdate);
    window.addEventListener('tsc_campaigns_updated', handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('tsc_campaigns_updated', handleUpdate);
    };
  }, [initialCampaign]);

  const episodes = useMemo(() => {
    return [...(campaign.episodes ?? [])].sort(
      (a, b) => (Number(b.episodeNumber) || 0) - (Number(a.episodeNumber) || 0)
    );
  }, [campaign.episodes]);

  const latestEpisode = episodes[0];
  const released = useMemo(
    () => episodes.filter((e) => e.status === 'Released'),
    [episodes]
  );

  return (
    <section className="section-pad">
      <div className="container-tsc">
        {showBackLink && (
          <div className="mb-6">
            <Link
              href="/campaigns"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted transition-colors hover:text-brand"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> All Campaigns
            </Link>
          </div>
        )}

        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <DemoNotice className="mb-8" />
            <p className="text-[15px] leading-8 text-muted">{campaign.description}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="#episodes" size="lg" arrow>
                Explore the Series
              </Button>
              {released.length > 0 && (
                <span className="relative inline-flex">
                  <span aria-hidden className="absolute inset-0 animate-play-pulse rounded-[4px] bg-gold/60" />
                  <Button href="#episodes" variant="accent" size="lg" className="relative">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ink text-gold">
                      <Play aria-hidden className="ml-0.5 h-2.5 w-2.5 fill-current" />
                    </span>
                    Watch Documentaries ({released.length})
                  </Button>
                </span>
              )}
            </div>
          </div>

          {campaign.stills && campaign.stills.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-3 lg:col-span-5">
              {campaign.stills.map((s, i) => (
                <Reveal key={`${s.image}-${i}`} delay={i * 0.1}>
                  <div className="group relative overflow-hidden rounded-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={s.image}
                      alt={s.alt || `Campaign still ${i + 1}`}
                      className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-3 text-[10px] font-bold uppercase tracking-[0.16em] text-cream">
                      Behind the scenes {String(i + 1).padStart(2, '0')}
                    </figcaption>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </div>

        {/* categories & locations */}
        {((campaign.categories && campaign.categories.length > 0) ||
          (campaign.locations && campaign.locations.length > 0)) && (
          <div className="mt-14 grid gap-8 border-t border-hairline pt-10 lg:grid-cols-2">
            {campaign.categories && campaign.categories.length > 0 && (
              <div>
                <h2 className="font-display text-sm font-bold uppercase tracking-[0.18em] text-brand">
                  Career categories covered
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {campaign.categories.map((c, idx) => (
                    <span
                      key={`cat-${c}-${idx}`}
                      className="rounded-full border border-hairline bg-white px-3.5 py-2 text-[12px] font-bold uppercase tracking-[0.08em] text-ink/70"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {campaign.locations && campaign.locations.length > 0 && (
              <div>
                <h2 className="font-display text-sm font-bold uppercase tracking-[0.18em] text-brand">
                  Filmed across India
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {campaign.locations.map((l, idx) => (
                    <span
                      key={`loc-${l}-${idx}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand-50 px-3.5 py-2 text-[12px] font-bold text-brand"
                    >
                      <MapPin aria-hidden className="h-3 w-3" /> {l}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* documentary episodes */}
        <div id="episodes" className="mt-16 scroll-mt-24 border-t border-hairline pt-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="font-display text-2xl font-bold tracking-tight">Documentary Episodes</h2>
                <span className="rounded-full bg-gold/20 border border-gold/40 px-2.5 py-0.5 font-display text-[10px] font-bold uppercase tracking-wider text-gold-deep">
                  Latest First
                </span>
              </div>
              <p className="mt-2 max-w-2xl text-[14px] leading-6 text-muted">
                Professionals, entrepreneurs, creators and specialists — real people, real careers, real possibilities.
              </p>
            </div>
            <span className="rounded-full border border-gold/40 bg-gold-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-gold-deep">
              {episodes.length} Episodes Available
            </span>
          </div>

          {/* Featured / Latest Documentary Hero Spotlight */}
          {latestEpisode && (
            <div className="mt-8 overflow-hidden rounded-xl border border-brand/20 bg-gradient-to-br from-brand-50/70 via-white to-gold-50/30 p-6 shadow-sm sm:p-8">
              <div className="grid gap-6 md:grid-cols-12 md:items-center">
                <div className="md:col-span-7">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-[4px] bg-brand px-2.5 py-1 font-display text-[10px] font-bold uppercase tracking-[0.16em] text-gold shadow-sm">
                      <Sparkles className="h-3 w-3 fill-current" /> Latest Release • Featured Documentary
                    </span>
                    <span className="rounded-[4px] bg-ink/10 px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-wider text-ink">
                      Episode {String(latestEpisode.episodeNumber).padStart(2, '0')}
                    </span>
                  </div>

                  <h3 className="mt-3 font-display text-xl font-bold text-ink sm:text-2xl">
                    {latestEpisode.title}
                  </h3>

                  <p className="mt-1.5 text-xs font-semibold uppercase tracking-wider text-brand">
                    {latestEpisode.profession || 'Specialist'} • <span className="text-muted">{latestEpisode.location || 'India'}</span>
                    {latestEpisode.professional ? ` — ${latestEpisode.professional}` : ''}
                  </p>

                  <p className="mt-3 text-[14px] leading-relaxed text-muted line-clamp-3">
                    {latestEpisode.description}
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-4">
                    {latestEpisode.status === 'Released' && latestEpisode.videoUrl ? (
                      <a
                        href={latestEpisode.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-md bg-gold px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-ink shadow-sm transition-all hover:bg-gold-deep hover:text-white"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" /> Watch Latest Documentary ({latestEpisode.durationLabel || '25 min'})
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-ink/80 px-4 py-2 text-xs font-bold uppercase tracking-wider text-cream">
                        Coming Soon ({latestEpisode.durationLabel || '25 min'})
                      </span>
                    )}
                  </div>
                </div>

                <div className="md:col-span-5">
                  <div className="relative aspect-video overflow-hidden rounded-lg bg-ink/10 shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={latestEpisode.image || '/images/campaign/campaign-1.jpg'}
                      alt={latestEpisode.imageAlt || latestEpisode.title}
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                    {latestEpisode.status === 'Released' && latestEpisode.videoUrl && (
                      <a
                        href={latestEpisode.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 flex items-center justify-center bg-ink/20 transition-all hover:bg-ink/30"
                      >
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold text-ink shadow-lift transition-transform duration-300 hover:scale-110 hover:bg-gold-deep hover:text-white">
                          <Play className="ml-0.5 h-6 w-6 fill-current" />
                        </span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {episodes.length === 0 ? (
            <div className="mt-8 rounded-lg border border-dashed border-hairline bg-cream/40 p-12 text-center text-muted">
              <p className="font-display text-base font-bold text-ink">No documentary episodes published yet</p>
              <p className="mt-1 text-xs">Episodes added in the Admin panel will appear here automatically.</p>
            </div>
          ) : (
            <StaggerGrid className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {episodes.map((ep, idx) => {
                const isReleased = ep.status === 'Released' && !!ep.videoUrl;
                const CardWrapper = isReleased ? 'a' : 'div';
                const wrapperProps = isReleased
                  ? {
                      href: ep.videoUrl!,
                      target: '_blank',
                      rel: 'noopener noreferrer',
                      title: `Watch ${ep.title} on ${ep.videoUrl!.includes('youtube') ? 'YouTube' : 'video host'}`,
                    }
                  : {};

                return (
                  <StaggerItem key={`campaign-ep-${ep.id || idx}-${ep.episodeNumber}-${ep.slug}`}>
                    <CardWrapper
                      {...wrapperProps}
                      className="card-base card-hover group flex h-full flex-col overflow-hidden text-inherit no-underline cursor-pointer"
                    >
                      <div className="relative aspect-video overflow-hidden bg-ink/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={ep.image || '/images/campaign/campaign-1.jpg'}
                          alt={ep.imageAlt || ep.title}
                          className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                            ep.status === 'Coming Soon' ? 'grayscale-[35%]' : ''
                          }`}
                        />
                        <span className="absolute left-3 top-3 rounded-[4px] bg-brand-dark/95 px-2 py-1 font-display text-[10px] font-bold uppercase tracking-[0.14em] text-gold shadow-sm">
                          Episode {String(ep.episodeNumber).padStart(2, '0')}
                        </span>
                        {idx === 0 && (
                          <span className="absolute right-3 top-3 rounded-[4px] bg-gold px-2 py-1 font-display text-[9px] font-bold uppercase tracking-[0.14em] text-ink shadow-sm">
                            Latest
                          </span>
                        )}
                        {isReleased ? (
                          <span
                            aria-hidden
                            className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-gold text-ink shadow-lift transition-all duration-300 group-hover:scale-110 group-hover:bg-gold-deep group-hover:text-white"
                          >
                            <Play className="ml-0.5 h-4 w-4 fill-current" />
                          </span>
                        ) : (
                          <span className="absolute bottom-3 right-3 rounded-full bg-ink/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-cream">
                            Coming Soon
                          </span>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col gap-2 p-5">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-display text-lg font-bold transition-colors group-hover:text-brand">
                            {ep.title}
                          </h3>
                        </div>
                        <p className="text-[12px] font-semibold uppercase tracking-wider text-brand">
                          {ep.profession || 'Specialist'} • <span className="text-muted">{ep.location || 'India'}</span>
                        </p>
                        <p className="text-[13.5px] leading-6 text-muted">{ep.description}</p>
                        <div className="mt-auto flex items-center justify-between border-t border-hairline/60 pt-3 text-[11px] font-medium uppercase tracking-wider text-muted">
                          <span>{ep.professional || 'TSC Feature'}</span>
                          <span className="flex items-center gap-1 font-bold text-ink/80">
                            {isReleased && <span className="text-gold-deep font-semibold">Watch ↗</span>}
                            <span>{ep.durationLabel || '25 min'}</span>
                          </span>
                        </div>
                      </div>
                    </CardWrapper>
                  </StaggerItem>
                );
              })}
            </StaggerGrid>
          )}
        </div>

        {/* featured professionals */}
        {episodes.some((e) => e.professional) && (
          <div className="mt-16 border-t border-hairline pt-12">
            <h2 className="font-display text-2xl font-bold tracking-tight">Professionals featured</h2>
            <StaggerGrid className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {episodes
                .filter((ep) => Boolean(ep.professional))
                .map((ep, idx) => (
                  <StaggerItem key={`campaign-prof-${ep.id || idx}-${ep.episodeNumber}-${ep.slug}`}>
                    <div className="flex items-center gap-4 rounded-md border border-hairline bg-white p-4">
                      <span
                        aria-hidden
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 font-display text-sm font-bold text-brand"
                      >
                        {String(ep.episodeNumber).padStart(2, '0')}
                      </span>
                      <div>
                        <p className="font-display text-[14px] font-bold">{ep.title.replace('The ', '')}</p>
                        <p className="text-[12px] text-muted">
                          {ep.profession} — {ep.professional}
                        </p>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
            </StaggerGrid>
          </div>
        )}

        {/* related career resources */}
        <div className="mt-16 grid gap-4 rounded-md bg-brand-50 p-8 sm:grid-cols-3">
          {[
            {
              title: 'Career Awareness Hub',
              desc: 'Explore career fields beyond the obvious choices.',
              href: '/career/careers',
            },
            {
              title: 'Career Conversations',
              desc: 'Podcast episodes with professionals across industries.',
              href: '/podcast?category=Career%20Conversations',
            },
            {
              title: 'Career Events',
              desc: 'Workshops and sessions happening near you.',
              href: '/events?category=Career',
            },
          ].map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="group rounded-md bg-white p-5 shadow-card transition-transform hover:-translate-y-1"
            >
              <p className="font-display text-[15px] font-bold transition-colors group-hover:text-brand">
                {r.title}
              </p>
              <p className="mt-1.5 text-[13px] leading-5 text-muted">{r.desc}</p>
              <span className="cta-underline mt-3 inline-block font-display text-[11px] font-bold uppercase tracking-[0.14em] text-brand">
                Visit
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
