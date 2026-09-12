import Link from 'next/link';
import Image from 'next/image';
import { Clock, Lightbulb, Mic, Play, Rocket, Target, Video } from 'lucide-react';
import { CategoryPill, DemoChip } from '@/components/common/CategoryPill';
import type { PodcastCategory, PodcastEpisode } from '@/types/content';
import { formatDate, getPodcastThumbnail } from '@/lib/utils';

export const podcastCategoryIcon: Record<PodcastCategory, typeof Mic> = {
  'Student Voices': Mic,
  'Founder Stories': Rocket,
  'Career Conversations': Target,
  'Ideas & Perspectives': Lightbulb,
};

export function PodcastCard({ episode, priority = false }: { episode: PodcastEpisode; priority?: boolean }) {
  const categoryName = episode.category || 'Student Voices';
  const Icon = podcastCategoryIcon[categoryName] || Mic;
  const imageSrc = getPodcastThumbnail(episode, '/images/podcast/podcast-host.jpg');
  const imageAlt = episode.imageAlt || episode.title || 'Podcast episode';
  const dateStr = formatDate(episode.date || (episode as any).publishedAt || (episode as any).createdAt);
  const hasVideo = !!(episode.youtubeUrl || episode.videoUrl || episode.platforms?.youtube);

  return (
    <Link
      href={`/podcast/${episode.slug}`}
      className="card-base card-hover group flex h-full w-[264px] shrink-0 flex-col overflow-hidden snap-start sm:w-[288px]"
    >
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority={priority}
          sizes="300px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-ink/25 transition-colors duration-300 group-hover:bg-ink/10" aria-hidden />
        <span className="absolute left-3 top-3 rounded-[4px] bg-brand-dark/95 px-2 py-1 font-display text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
          E{String(episode.episodeNumber).padStart(2, '0')}
        </span>
        {hasVideo && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-[4px] bg-black/75 backdrop-blur-sm px-2 py-1 font-display text-[9.5px] font-bold uppercase tracking-wider text-white shadow-sm">
            <Video className="h-3 w-3 text-gold" />
            <span>Video</span>
          </span>
        )}
        <span
          aria-hidden
          className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-gold text-ink shadow-lift transition-transform duration-300 group-hover:scale-110"
        >
          <Play className="ml-0.5 h-4 w-4 fill-current" />
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="flex min-h-[1.75rem] flex-wrap items-center gap-2">
          <CategoryPill>
            <Icon aria-hidden className="mr-1 h-3 w-3" />
            {categoryName}
          </CategoryPill>
          {episode.demo && <DemoChip />}
        </div>
        <h3 className="font-display text-[15px] font-bold leading-snug transition-colors group-hover:text-brand line-clamp-2 min-h-[2.5rem]">
          {episode.title}
        </h3>
        <p className="text-xs font-medium text-muted truncate min-h-[1.25rem]">with {episode.guest}</p>
        <p className="mt-auto flex items-center gap-2 border-t border-hairline pt-2.5 text-[11px] font-medium uppercase tracking-wider text-muted">
          <Clock aria-hidden className="h-3 w-3 text-gold-deep" />
          {episode.durationLabel}
          {dateStr && (
            <>
              <span aria-hidden>•</span>
              <span className="truncate">{dateStr}</span>
            </>
          )}
        </p>
      </div>
    </Link>
  );
}
