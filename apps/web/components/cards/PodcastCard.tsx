import Link from 'next/link';
import Image from 'next/image';
import { Clock, Lightbulb, Mic, Play, Rocket, Target } from 'lucide-react';
import { CategoryPill, DemoChip } from '@/components/common/CategoryPill';
import type { PodcastCategory, PodcastEpisode } from '@/types/content';
import { formatDate } from '@/lib/utils';

export const podcastCategoryIcon: Record<PodcastCategory, typeof Mic> = {
  'Student Voices': Mic,
  'Founder Stories': Rocket,
  'Career Conversations': Target,
  'Ideas & Perspectives': Lightbulb,
};

/** Podcast episode card — thumbnail with play overlay, guest, duration, category icon. */
export function PodcastCard({ episode, priority = false }: { episode: PodcastEpisode; priority?: boolean }) {
  const Icon = podcastCategoryIcon[episode.category];
  return (
    <Link
      href={`/podcast/${episode.slug}`}
      className="card-base card-hover group flex w-[264px] shrink-0 flex-col overflow-hidden snap-start sm:w-[288px]"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={episode.image}
          alt={episode.imageAlt}
          fill
          priority={priority}
          sizes="300px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-ink/25 transition-colors duration-300 group-hover:bg-ink/10" aria-hidden />
        <span className="absolute left-3 top-3 rounded-[4px] bg-brand-dark/95 px-2 py-1 font-display text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
          E{String(episode.episodeNumber).padStart(2, '0')}
        </span>
        <span
          aria-hidden
          className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-gold text-ink shadow-lift transition-transform duration-300 group-hover:scale-110"
        >
          <Play className="ml-0.5 h-4 w-4 fill-current" />
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <CategoryPill>
            <Icon aria-hidden className="mr-1 h-3 w-3" />
            {episode.category}
          </CategoryPill>
          {episode.demo && <DemoChip />}
        </div>
        <h3 className="font-display text-[15px] font-bold leading-snug transition-colors group-hover:text-brand">
          {episode.title}
        </h3>
        <p className="text-xs font-medium text-muted">with {episode.guest}</p>
        <p className="mt-auto flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted">
          <Clock aria-hidden className="h-3 w-3 text-gold-deep" />
          {episode.durationLabel}
          <span aria-hidden>•</span>
          {formatDate(episode.date)}
        </p>
      </div>
    </Link>
  );
}
