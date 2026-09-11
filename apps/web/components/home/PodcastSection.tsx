'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { SectionHeading } from '@/components/common/SectionHeading';
import { StaggerGrid, StaggerItem } from '@/components/common/Reveal';
import { PodcastCard } from '@/components/cards/PodcastCard';
import { TextCTA } from '@/components/common/Button';
import { PodcastPlayer } from '@/components/podcast/PodcastPlayer';
import type { PodcastEpisode } from '@/types/content';
import { formatDate, getPodcastThumbnail } from '@/lib/utils';

export function PodcastSection({ episodes }: { episodes: PodcastEpisode[] }) {
  const featured = episodes.find((e) => e.featured) ?? episodes[0];
  const rest = episodes.filter((e) => e.id !== featured?.id);

  return (
    <section aria-label="TSC Podcast" className="bg-brand-dark section-pad text-white">
      <div className="container-tsc">
        <SectionHeading
          dark
          number="06"
          eyebrow="TSC Podcast"
          title="Conversations That Matter."
          description="Some lessons aren't found in textbooks. They're found in conversations. TSC Podcast brings students, founders, educators, professionals, creators and changemakers into conversations about careers, entrepreneurship, education, life, failures, opportunities and everything young people are figuring out."
        />

        {/* featured episode */}
        {featured && (
          <div className="mt-12 grid gap-8 rounded-md border border-white/10 bg-white/[0.04] p-6 sm:p-8 lg:grid-cols-12">
            <motion.div
              className="lg:col-span-5"
              initial={{ opacity: 0, x: -22 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link href={`/podcast/${featured.slug}`} className="group relative block overflow-hidden rounded-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={getPodcastThumbnail(featured)} alt={featured.imageAlt} className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <span className="absolute inset-0 bg-ink/30 transition-colors group-hover:bg-ink/10" aria-hidden />
                <span
                  aria-hidden
                  className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gold text-ink shadow-lift transition-transform duration-300 group-hover:scale-110"
                >
                  <span className="absolute inset-0 animate-play-pulse rounded-full bg-gold" />
                  <svg viewBox="0 0 24 24" className="relative h-6 w-6 fill-current"><path d="M8 5v14l11-7z" /></svg>
                </span>
              </Link>
            </motion.div>

            <motion.div
              className="flex flex-col gap-4 lg:col-span-7"
              initial={{ opacity: 0, x: 22 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="eyebrow !text-gold">
                Featured • Episode {String(featured.episodeNumber).padStart(2, '0')}
              </p>
              <h3 className="font-display text-2xl font-bold text-white">{featured.title}</h3>
              <p className="text-sm leading-7 text-white/70">{featured.description}</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
                with {featured.guest} — {featured.guestRole} • {featured.durationLabel} • {formatDate(featured.date)}
              </p>
              <div className="[&_span]:!text-white/90">
                <PodcastPlayer audioUrl={featured.audioUrl} title={featured.title} />
              </div>
            </motion.div>
          </div>
        )}

        {/* episode row */}
        <div className="mt-10">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-display text-xs font-bold uppercase tracking-[0.2em] text-gold">Latest Episodes</h3>
            <TextCTA href="/podcast" dark className="!text-[11.5px]">
              All Episodes
            </TextCTA>
          </div>
          <StaggerGrid className="mt-6 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:thin]">
            {rest.map((ep) => (
              <StaggerItem key={ep.id} className="snap-start">
                <PodcastCard episode={ep} />
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>

        <div className="mt-6 border-t border-white/10 pt-8">
          <TextCTA href="/podcast" dark>
            Listen to TSC Podcast
          </TextCTA>
        </div>
      </div>
    </section>
  );
}
