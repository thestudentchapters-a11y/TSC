import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, Newspaper, PenLine } from 'lucide-react';
import { DemoChip } from '@/components/common/CategoryPill';
import type { Campus } from '@/types/content';
import { formatDate } from '@/lib/utils';

export function CampusCard({ campus, priority = false }: { campus: Campus; priority?: boolean }) {
  const imageSrc = campus.image || '/images/campus/campus-1.jpg';
  const altText = campus.imageAlt || campus.name || 'Campus image';
  const locationText = [campus.university, [campus.city, campus.state].filter(Boolean).join(', ')].filter(Boolean).join(' • ');

  return (
    <Link href={`/campus/${campus.slug}`} className="card-base card-hover group flex h-full flex-col overflow-hidden">
      <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden">
        <Image
          src={imageSrc}
          alt={altText}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" aria-hidden />
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2">
          <h3 className="font-display text-lg font-bold leading-tight text-white line-clamp-1">{campus.name}</h3>
          {campus.demo && <DemoChip className="bg-white/90 shrink-0" />}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3.5 p-5">
        {locationText && (
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted truncate min-h-[1.25rem]">
            <MapPin aria-hidden className="h-3.5 w-3.5 shrink-0 text-brand" />
            <span className="truncate">{locationText}</span>
          </p>
        )}
        <p className="line-clamp-2 text-sm leading-6 text-muted min-h-[3rem]">{campus.description || 'Discover campus initiatives, student stories, and opportunities.'}</p>
        
        {(campus.latestStory?.title || campus.upcomingEvent?.title) && (
          <div className="mt-auto space-y-2 border-t border-hairline pt-3.5">
            {campus.latestStory?.title && (
              <p className="flex items-start gap-2 text-[13px] leading-5 text-ink/80">
                <PenLine aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-deep" />
                <span className="min-w-0 flex-1">
                  <span className="meta-text block !text-[10px]">Latest story</span>
                  <span className="font-medium transition-colors group-hover:text-brand line-clamp-1">{campus.latestStory.title}</span>
                </span>
              </p>
            )}
            {campus.upcomingEvent?.title && (
              <p className="flex items-start gap-2 text-[13px] leading-5 text-ink/80">
                <Calendar aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-deep" />
                <span className="min-w-0 flex-1">
                  <span className="meta-text block !text-[10px]">Upcoming event</span>
                  <span className="font-medium transition-colors group-hover:text-brand line-clamp-1">{campus.upcomingEvent.title}</span>
                </span>
              </p>
            )}
          </div>
        )}

        <span className="cta-underline mt-auto pt-1 font-display text-[11px] font-bold uppercase tracking-[0.14em] text-brand">
          <Newspaper aria-hidden className="mr-1 inline h-3.5 w-3.5" /> Explore Campus
        </span>
      </div>
    </Link>
  );
}
