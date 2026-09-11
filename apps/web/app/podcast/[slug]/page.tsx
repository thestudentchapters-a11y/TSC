import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ChevronRight, Clock, Calendar, Mic2 } from 'lucide-react';
import { PageHeader, DemoNotice } from '@/components/common/PageHeader';
import { CategoryPill } from '@/components/common/CategoryPill';
import { PodcastMediaSection } from '@/components/podcast/PodcastMediaSection';
import { PodcastCard } from '@/components/cards/PodcastCard';
import { ShareButtons, SaveButton } from '@/components/common/ShareButtons';
import { Reveal } from '@/components/common/Reveal';
import { getEpisodeBySlug, getEpisodes } from '@/lib/data';
import { formatDate, formatDuration } from '@/lib/utils';
import { site } from '@/lib/site';

export const revalidate = 300;

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ep = await getEpisodeBySlug(params.slug);
  if (!ep) return { title: 'Episode not found' };
  return {
    title: `E${String(ep.episodeNumber).padStart(2, '0')} — ${ep.title}`,
    description: ep.description,
    alternates: { canonical: `/podcast/${ep.slug}` },
    openGraph: { title: ep.title, description: ep.description, images: [{ url: ep.image, alt: ep.imageAlt }] },
  };
}

export default async function EpisodePage({ params }: Props) {
  const episode = await getEpisodeBySlug(params.slug);
  if (!episode) notFound();

  const all = await getEpisodes();
  const more = all.filter((e) => e.id !== episode.id).slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'PodcastEpisode',
    episodeNumber: episode.episodeNumber,
    name: episode.title,
    description: episode.description,
    datePublished: episode.date,
    timeRequired: `PT${Math.round(Number(episode.durationLabel.split(':')[0]) || 30)}M`,
    associatedMedia: { '@type': 'MediaObject', contentUrl: episode.audioUrl ? `${site.url}${episode.audioUrl}` : undefined },
    partOfSeries: { '@type': 'PodcastSeries', name: 'TSC Podcast' },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <PageHeader eyebrow={`TSC Podcast / Episode ${String(episode.episodeNumber).padStart(2, '0')}`} title={episode.title}>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium uppercase tracking-wider text-muted">
          <CategoryPill><Mic2 aria-hidden className="mr-1 h-3 w-3" />{episode.category}</CategoryPill>
          <span>with {episode.guest}</span>
          <span className="inline-flex items-center gap-1"><Clock aria-hidden className="h-3.5 w-3.5" /> {episode.durationLabel}</span>
          <span className="inline-flex items-center gap-1"><Calendar aria-hidden className="h-3.5 w-3.5" /> {formatDate(episode.date)}</span>
        </div>
        <nav aria-label="Breadcrumb" className="mt-6">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-muted">
            <li><Link href="/" className="hover:text-brand">Home</Link></li>
            <li aria-hidden><ChevronRight className="h-3 w-3" /></li>
            <li><Link href="/podcast" className="hover:text-brand">Podcast</Link></li>
          </ol>
        </nav>
      </PageHeader>

      <section className="section-pad">
        <div className="container-tsc max-w-5xl">
          <DemoNotice className="mb-8" />
          <Reveal>
            <div className="relative aspect-[16/8] overflow-hidden rounded-md">
              <Image src={episode.image} alt={episode.imageAlt} fill priority sizes="100vw" className="object-cover" />
            </div>
          </Reveal>

          <div className="mt-8 grid gap-12 lg:grid-cols-12">
            <div className="space-y-8 lg:col-span-8">
              <p className="text-[15px] leading-8 text-ink/80">{episode.description}</p>
              <p className="rounded-md border border-brand/20 bg-brand-50 px-4 py-3 text-sm text-ink/75">
                <span className="font-display font-bold text-brand">Guest — </span>
                {episode.guest}, {episode.guestRole}
              </p>

              <div>
                <h2 className="font-display text-lg font-bold">
                  {episode.youtubeUrl ? 'Watch & Listen' : 'Listen'}
                </h2>
                <div className="mt-4">
                  <PodcastMediaSection
                    youtubeUrl={episode.youtubeUrl}
                    audioUrl={episode.audioUrl}
                    title={episode.title}
                    thumbnail={episode.image}
                  />
                </div>
              </div>

              <div>
                <h2 className="font-display text-lg font-bold">Transcript</h2>
                <div className="prose-tsc mt-3">
                  {episode.transcript.map((line, i) => (
                    <p key={i} className="text-[13.5px] leading-7 text-muted">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <aside className="space-y-6 lg:col-span-4">
              <div className="card-base space-y-5 p-5">
                <ShareButtons title={episode.title} path={`/podcast/${episode.slug}`} />
                <div className="border-t border-hairline pt-5">
                  <SaveButton itemType="episode" itemId={episode.id} title={episode.title} className="w-full justify-center" />
                </div>
              </div>
              <div className="rounded-md border border-hairline bg-white p-5">
                <h3 className="font-display text-sm font-bold uppercase tracking-[0.14em]">Also find us on</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(['youtube', 'spotify', 'apple'] as const).map((p) => {
                    const url = episode.platforms[p];
                    const label = p === 'apple' ? 'Apple Podcasts' : p[0].toUpperCase() + p.slice(1);
                    return url ? (
                      <a key={p} href={url} target="_blank" rel="noopener noreferrer" className="rounded-full bg-brand px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-brand-dark">
                        {label}
                      </a>
                    ) : (
                      <span key={p} className="rounded-full border border-hairline bg-cream px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted" title="Link to be configured">
                        {label}
                      </span>
                    );
                  })}
                </div>
              </div>
            </aside>
          </div>

          <div className="mt-16 border-t border-hairline pt-10">
            <h2 className="font-display text-xl font-bold tracking-tight">More episodes</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((ep) => (
                <PodcastCard key={ep.id} episode={ep} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
