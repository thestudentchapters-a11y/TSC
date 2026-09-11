import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { Mic, Rocket, Target, Lightbulb } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { PodcastCard, podcastCategoryIcon } from '@/components/cards/PodcastCard';
import { PodcastMediaSection } from '@/components/podcast/PodcastMediaSection';
import { FilterBar } from '@/components/common/FilterBar';
import { EmptyState } from '@/components/common/States';
import { StaggerGrid, StaggerItem, Reveal } from '@/components/common/Reveal';
import { getEpisodes } from '@/lib/data';
import { formatDate, getPodcastThumbnail } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'TSC Podcast — Conversations That Matter',
  description:
    "Some lessons aren't found in textbooks. TSC Podcast brings students, founders, educators, professionals, creators and changemakers into conversations about careers, entrepreneurship, education, life, failures, opportunities and everything young people are figuring out.",
  alternates: { canonical: '/podcast' },
};

export const revalidate = 300;

const CATEGORY_DESC: { name: 'Student Voices' | 'Founder Stories' | 'Career Conversations' | 'Ideas & Perspectives'; desc: string }[] = [
  { name: 'Student Voices', desc: 'Real students, real journeys — the voices behind the stories.' },
  { name: 'Founder Stories', desc: 'Founders on the unglamorous middle between idea and impact.' },
  { name: 'Career Conversations', desc: 'Professionals on what their work actually looks like.' },
  { name: 'Ideas & Perspectives', desc: 'Fresh thinking on learning, work and life.' },
];

export default async function PodcastPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const all = await getEpisodes();
  const categories = Array.from(new Set(all.map((e) => e.category)));
  const filtered = searchParams.category
    ? all.filter((e) => e.category === searchParams.category)
    : all;
  const featured = all.find((e) => e.featured) ?? all[0];
  const rest = filtered.filter((e) => e.id !== featured?.id || !!searchParams.category);

  return (
    <>
      <PageHeader
        eyebrow="06 — TSC Podcast"
        title="Conversations That Matter."
        description="Some lessons aren't found in textbooks. They're found in conversations. TSC Podcast brings students, founders, educators, professionals, creators and changemakers into conversations about careers, entrepreneurship, education, life, failures, opportunities and everything young people are figuring out."
      >
        <Suspense fallback={null}>
          <FilterBar
            basePath="/podcast"
            filters={[{ key: 'category', label: 'Category', options: categories.map((c) => ({ value: c, label: c })) }]}
          />
        </Suspense>
      </PageHeader>

      <section className="section-pad">
        <div className="container-tsc">
          {/* categories */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORY_DESC.map((c, i) => {
              const Icon = podcastCategoryIcon[c.name] ?? Mic;
              return (
                <Reveal key={c.name} delay={i * 0.06}>
                  <Link
                    href={`/podcast?category=${encodeURIComponent(c.name)}`}
                    className="card-base card-hover group flex h-full items-start gap-3.5 p-5"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] bg-brand-50 text-brand transition-all duration-300 group-hover:bg-brand group-hover:text-white">
                      <Icon aria-hidden className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block font-display text-[12.5px] font-bold uppercase tracking-[0.12em]">{c.name}</span>
                      <span className="mt-1 block text-[12px] leading-5 text-muted">{c.desc}</span>
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>

          {/* featured episode */}
          {featured && !searchParams.category && (() => {
            const hasVideo = !!(featured.youtubeUrl || featured.videoUrl || featured.platforms?.youtube);
            const featuredThumbnail = getPodcastThumbnail(featured);

            return (
              <div className="mt-12 grid gap-8 rounded-md border border-hairline bg-white p-6 sm:p-8 lg:grid-cols-12">
                <Reveal className="lg:col-span-6">
                  {hasVideo ? (
                    <div className="overflow-hidden rounded-lg">
                      <PodcastMediaSection
                        youtubeUrl={featured.youtubeUrl || featured.videoUrl || featured.platforms?.youtube}
                        audioUrl={featured.audioUrl}
                        title={featured.title}
                        thumbnail={featuredThumbnail}
                        defaultMode="video"
                      />
                    </div>
                  ) : (
                    <Link href={`/podcast/${featured.slug}`} className="group relative block overflow-hidden rounded-md">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={featuredThumbnail} alt={featured.imageAlt} className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </Link>
                  )}
                </Reveal>
                <div className="flex flex-col justify-center gap-4 lg:col-span-6">
                  <Reveal delay={0.08}>
                    <p className="eyebrow !text-gold-deep">Featured • Episode {String(featured.episodeNumber).padStart(2, '0')}</p>
                    <h2 className="mt-2 font-display text-2xl font-bold">
                      <Link href={`/podcast/${featured.slug}`} className="hover:text-brand transition-colors">
                        {featured.title}
                      </Link>
                    </h2>
                    <p className="mt-2 text-sm leading-7 text-muted">{featured.description}</p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted">
                      with {featured.guest} — {featured.guestRole} • {featured.durationLabel} • {formatDate(featured.date)}
                    </p>
                  </Reveal>
                  {!hasVideo && (
                    <Reveal delay={0.14}>
                      <div className="mt-2">
                        <PodcastMediaSection
                          youtubeUrl={null}
                          audioUrl={featured.audioUrl}
                          title={featured.title}
                          thumbnail={featuredThumbnail}
                        />
                      </div>
                    </Reveal>
                  )}
                  <div className="pt-2">
                    <Link
                      href={`/podcast/${featured.slug}`}
                      className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand hover:text-brand-dark transition-colors"
                    >
                      View Full Episode Page & Transcript →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* episodes */}
          <h2 className="mt-14 font-display text-sm font-bold uppercase tracking-[0.2em] text-brand">
            {searchParams.category ? `Category: ${searchParams.category}` : 'All Episodes'}
          </h2>
          {rest.length === 0 ? (
            <div className="mt-8">
              <EmptyState title="No episodes here yet" description="New episodes drop regularly — check back soon." />
            </div>
          ) : (
            <StaggerGrid className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((ep, i) => (
                <StaggerItem key={ep.id}>
                  <div className="[&>a]:!w-full">
                    <PodcastCard episode={ep} priority={i < 3} />
                  </div>
                </StaggerItem>
              ))}
            </StaggerGrid>
          )}

          {/* platform links */}
          <div className="mt-14 flex flex-col items-start gap-3 rounded-md border border-hairline bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-display text-base font-bold">Listen wherever you get your podcasts</h3>
              <p className="mt-1 text-[13px] text-muted">YouTube • Spotify • Apple Podcasts — links configurable by the admin team.</p>
            </div>
            <div className="flex gap-2">
              {['YouTube', 'Spotify', 'Apple'].map((p) => (
                <span key={p} className="rounded-full border border-hairline bg-cream px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted" title="Link to be configured">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
