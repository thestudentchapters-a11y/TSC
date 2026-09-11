import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, Users } from 'lucide-react';
import { CategoryPill } from '@/components/common/CategoryPill';
import { Button } from '@/components/common/Button';
import type { TscEvent } from '@/types/content';
import { cn, dateBadge } from '@/lib/utils';

/** Event card — bold date badge, venue, category tag, image, Register CTA. */
export function EventCard({ event, priority = false }: { event: TscEvent; priority?: boolean }) {
  const badge = dateBadge(event.date || (event as any).createdAt);
  const past = event.status === 'past' || event.status === 'cancelled';
  const imageSrc = event.image || '/images/events/event-summit.jpg';
  const imageAlt = event.imageAlt || event.title || 'Event image';

  return (
    <article className="card-base card-hover group flex h-full flex-col overflow-hidden">
      <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={cn('object-cover transition-transform duration-500 group-hover:scale-105', past && 'grayscale-[40%]')}
        />
        {/* date badge */}
        <div
          aria-hidden
          className="absolute left-4 top-4 flex flex-col items-center rounded-[6px] border border-white/20 bg-brand-dark/95 px-3 py-2 text-white shadow-lift"
        >
          <span className="font-display text-xl font-bold leading-none">{badge.day}</span>
          <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-gold">{badge.month}</span>
        </div>
        {past && (
          <span className="absolute right-4 top-4">
            <CategoryPill variant="outline" className="bg-white/90">
              {event.status === 'cancelled' ? 'Cancelled' : 'Past Event'}
            </CategoryPill>
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex min-h-[1.75rem] items-center">
          <CategoryPill>{event.category}</CategoryPill>
        </div>
        <h3 className="font-display text-lg font-bold leading-snug transition-colors group-hover:text-brand line-clamp-2 min-h-[3.25rem]">
          <Link href={`/events/${event.slug}`}>{event.title}</Link>
        </h3>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-muted min-h-[1.5rem] overflow-hidden">
          <span className="inline-flex items-center gap-1">
            <MapPin aria-hidden className="h-3.5 w-3.5 text-brand" />
            {event.city}, {event.state}
          </span>
          <span className="inline-flex items-center gap-1 truncate">
            <Users aria-hidden className="h-3.5 w-3.5 text-brand" />
            <span className="truncate">{event.organizer}</span>
          </span>
        </p>
        <p className="line-clamp-2 text-sm leading-6 text-muted min-h-[3rem]">{event.dek}</p>
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-hairline pt-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted">
            <Calendar aria-hidden className="h-3.5 w-3.5 text-gold-deep" />
            Reg. by {new Date(event.registrationDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </span>
          {past ? (
            <Button href={`/events/${event.slug}`} variant="outline" size="sm">
              View Details
            </Button>
          ) : (
            <Button href={`/events/${event.slug}`} size="sm" arrow>
              Register
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
