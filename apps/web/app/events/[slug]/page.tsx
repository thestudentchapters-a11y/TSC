import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Calendar, ChevronRight, Clock, MapPin, Users } from 'lucide-react';
import { PageHeader, ContentBody, DemoNotice } from '@/components/common/PageHeader';
import { CategoryPill } from '@/components/common/CategoryPill';
import { ShareButtons, SaveButton } from '@/components/common/ShareButtons';
import { EventCard } from '@/components/cards/EventCard';
import { Reveal } from '@/components/common/Reveal';
import { RegisterButton } from '@/components/events/RegisterButton';
import { getEventBySlug, getEvents } from '@/lib/data';
import { dateBadge, formatDate, formatDateLong, daysUntil } from '@/lib/utils';
import { site } from '@/lib/site';

export const revalidate = 120;

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = await getEventBySlug(params.slug);
  if (!event) return { title: 'Event not found' };
  return {
    title: event.title,
    description: event.dek,
    alternates: { canonical: `/events/${event.slug}` },
    openGraph: { title: event.title, description: event.dek, images: [{ url: event.image, alt: event.imageAlt }] },
  };
}

export default async function EventPage({ params }: Props) {
  const event = await getEventBySlug(params.slug);
  if (!event) notFound();

  const all = await getEvents();
  const related = all.filter((e) => e.id !== event.id && e.status === 'upcoming').slice(0, 3);
  const badge = dateBadge(event.date);
  const days = daysUntil(event.date);
  const closed = event.status === 'past' || event.status === 'cancelled' || daysUntil(event.registrationDeadline) < 0;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.dek,
    startDate: event.date,
    eventStatus:
      event.status === 'cancelled' ? 'https://schema.org/EventCancelled' : 'https://schema.org/EventScheduled',
    eventAttendanceMode: event.city.toLowerCase() === 'remote' ? 'https://schema.org/OnlineEventAttendanceMode' : 'https://schema.org/OfflineEventAttendanceMode',
    image: [`${site.url}${event.image}`],
    location: {
      '@type': 'Place',
      name: event.venue,
      address: { '@type': 'PostalAddress', addressLocality: event.city, addressRegion: event.state, addressCountry: 'IN' },
    },
    organizer: { '@type': 'Organization', name: event.organizer },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <PageHeader eyebrow="Events" title={event.title}>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium uppercase tracking-wider text-muted">
          <CategoryPill>{event.category}</CategoryPill>
          <span className="inline-flex items-center gap-1"><MapPin aria-hidden className="h-3.5 w-3.5" /> {event.city}, {event.state}</span>
          <span className="inline-flex items-center gap-1"><Calendar aria-hidden className="h-3.5 w-3.5" /> {formatDate(event.date)}</span>
          <span className="inline-flex items-center gap-1"><Users aria-hidden className="h-3.5 w-3.5" /> {event.organizer}</span>
        </div>
        <nav aria-label="Breadcrumb" className="mt-6">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-muted">
            <li><Link href="/" className="hover:text-brand">Home</Link></li>
            <li aria-hidden><ChevronRight className="h-3 w-3" /></li>
            <li><Link href="/events" className="hover:text-brand">Events</Link></li>
            <li aria-hidden><ChevronRight className="h-3 w-3" /></li>
            <li className="text-ink/70" aria-current="page">{event.title}</li>
          </ol>
        </nav>
      </PageHeader>

      <section className="section-pad">
        <div className="container-tsc max-w-6xl">
          <Reveal>
            <div className="relative aspect-[16/7] overflow-hidden rounded-md">
              <Image src={event.image} alt={event.imageAlt} fill priority sizes="100vw" className="object-cover" />
              <div className="absolute left-5 top-5 flex flex-col items-center rounded-[8px] border border-white/20 bg-brand-dark/95 px-4 py-3 text-white shadow-lift">
                <span className="font-display text-2xl font-bold leading-none">{badge.day}</span>
                <span className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-gold">{badge.month} {new Date(event.date).getFullYear()}</span>
              </div>
              {days >= 0 && event.status === 'upcoming' && (
                <span className="absolute right-5 top-5 rounded-full bg-gold px-3.5 py-1.5 font-display text-[11px] font-bold uppercase tracking-[0.14em] text-ink">
                  In {days} day{days === 1 ? '' : 's'}
                </span>
              )}
            </div>
          </Reveal>

          <div className="mt-10 grid gap-12 lg:grid-cols-12">
            <div className="space-y-8 lg:col-span-8">
              <DemoNotice />
              <div>
                <h2 className="font-serif text-xl italic leading-8 text-brand">{event.dek}</h2>
              </div>
              <ContentBody paragraphs={event.description} />

              <div className="grid gap-4 rounded-md border border-hairline bg-white p-6 sm:grid-cols-2">
                <div>
                  <p className="meta-text">Date</p>
                  <p className="mt-1 font-display text-sm font-bold">{formatDateLong(event.date)}</p>
                </div>
                <div>
                  <p className="meta-text">Time</p>
                  <p className="mt-1 inline-flex items-center gap-1.5 font-display text-sm font-bold"><Clock aria-hidden className="h-4 w-4 text-brand" />{event.time}</p>
                </div>
                <div>
                  <p className="meta-text">Venue</p>
                  <p className="mt-1 inline-flex items-center gap-1.5 font-display text-sm font-bold"><MapPin aria-hidden className="h-4 w-4 text-brand" />{event.venue}</p>
                </div>
                <div>
                  <p className="meta-text">Registration deadline</p>
                  <p className="mt-1 font-display text-sm font-bold">{formatDate(event.registrationDeadline)}</p>
                </div>
              </div>
            </div>

            <aside className="space-y-6 lg:col-span-4">
              <div className="card-base space-y-4 p-6">
                {closed ? (
                  <p className="rounded-md border border-hairline bg-cream px-4 py-3 text-center text-[13px] font-semibold text-muted">
                    {event.status === 'cancelled' ? 'This event was cancelled.' : 'Registrations are closed for this event.'}
                  </p>
                ) : (
                  <RegisterButton event={{ id: event.id, title: event.title, slug: event.slug }} />
                )}
                <p className="text-center text-[11px] text-muted">
                  Free registration • confirmation by email
                </p>
                <div className="border-t border-hairline pt-4">
                  <ShareButtons title={event.title} path={`/events/${event.slug}`} />
                </div>
                <div className="border-t border-hairline pt-4">
                  <SaveButton itemType="event" itemId={event.id} title={event.title} className="w-full justify-center" />
                </div>
              </div>
            </aside>
          </div>

          {related.length > 0 && (
            <div className="mt-16 border-t border-hairline pt-10">
              <h2 className="font-display text-xl font-bold tracking-tight">More events to show up for</h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((e) => (
                  <EventCard key={e.id} event={e} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
