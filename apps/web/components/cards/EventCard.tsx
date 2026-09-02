import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, Users } from 'lucide-react';
import { CategoryPill } from '@/components/common/CategoryPill';
import { Button } from '@/components/common/Button';
import type { TscEvent } from '@/types/content';
import { cn, dateBadge } from '@/lib/utils';

/** Event card — bold date badge, venue, category tag, image, Register CTA. */
export function EventCard({ event, priority = false }: { event: TscEvent; priority?: boolean }) {
  const badge = dateBadge(event.date);
  const past = event.status === 'past' || event.status === 'cancelled';

  return (
    <article className="card-base card-hover group flex flex-col overflow-hidden">
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          src={event.image}
          alt={event.imageAlt}
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
        <CategoryPill>{event.category}</CategoryPill>
        <h3 className="font-display text-lg font-bold leading-snug transition-colors group-hover:text-brand">
          <Link href={`/events/${event.slug}`}>{event.title}</Link>
        </h3>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-muted">
          <span className="inline-flex items-center gap-1">
            <MapPin aria-hidden className="h-3.5 w-3.5 text-brand" />
            {event.city}, {event.state}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users aria-hidden className="h-3.5 w-3.5 text-brand" />
            {event.organizer}
          </span>
        </p>
        <p className="line-clamp-2 text-sm leading-6 text-muted">{event.dek}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
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
