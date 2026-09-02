import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, Newspaper, PenLine } from 'lucide-react';
import { DemoChip } from '@/components/common/CategoryPill';
import type { Campus } from '@/types/content';
import { formatDate } from '@/lib/utils';

/** Campus directory card — hero image, campus meta, latest story + upcoming event previews. */
export function CampusCard({ campus, priority = false }: { campus: Campus; priority?: boolean }) {
  return (
    <Link href={`/campus/${campus.slug}`} className="card-base card-hover group flex flex-col overflow-hidden">
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          src={campus.image}
          alt={campus.imageAlt}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" aria-hidden />
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2">
          <h3 className="font-display text-lg font-bold leading-tight text-white">{campus.name}</h3>
          {campus.demo && <DemoChip className="bg-white/90" />}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3.5 p-5">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
          <MapPin aria-hidden className="h-3.5 w-3.5 text-brand" />
          {campus.university} • {campus.city}, {campus.state}
        </p>
        <p className="line-clamp-2 text-sm leading-6 text-muted">{campus.description}</p>
        <div className="mt-auto space-y-2 border-t border-hairline pt-3.5">
          <p className="flex items-start gap-2 text-[13px] leading-5 text-ink/80">
            <PenLine aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-deep" />
            <span>
              <span className="meta-text block !text-[10px]">Latest story</span>
              <span className="font-medium transition-colors group-hover:text-brand">{campus.latestStory.title}</span>
            </span>
          </p>
          <p className="flex items-start gap-2 text-[13px] leading-5 text-ink/80">
            <Calendar aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-deep" />
            <span>
              <span className="meta-text block !text-[10px]">Upcoming event</span>
              <span className="font-medium transition-colors group-hover:text-brand">{campus.upcomingEvent.title}</span>
              <span className="ml-1.5 text-xs text-muted">• {formatDate(campus.upcomingEvent.date)}</span>
            </span>
          </p>
        </div>
        <span className="cta-underline font-display text-[11px] font-bold uppercase tracking-[0.14em] text-brand">
          <Newspaper aria-hidden className="mr-1 inline h-3.5 w-3.5" /> Explore Campus
        </span>
      </div>
    </Link>
  );
}
