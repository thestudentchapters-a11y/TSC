import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Award, Calendar, ChevronRight, Lightbulb, MapPin, Newspaper, PenLine, Users } from 'lucide-react';
import { PageHeader, DemoNotice } from '@/components/common/PageHeader';
import { CampusCard } from '@/components/cards/CampusCard';
import { CategoryPill } from '@/components/common/CategoryPill';
import { Reveal } from '@/components/common/Reveal';
import { TextCTA } from '@/components/common/Button';
import { getCampusBySlug, getCampuses, getStories, getEvents } from '@/lib/data';
import { formatDate } from '@/lib/utils';

export const revalidate = 300;

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const campus = await getCampusBySlug(params.slug);
  if (!campus) return { title: 'Campus not found' };
  return {
    title: `${campus.name} — Campus Directory`,
    description: campus.description,
    alternates: { canonical: `/campus/${campus.slug}` },
    openGraph: { title: campus.name, description: campus.description, images: [{ url: campus.image, alt: campus.imageAlt }] },
  };
}

export default async function CampusProfilePage({ params }: Props) {
  const campus = await getCampusBySlug(params.slug);
  if (!campus) notFound();

  const [stories, events, campuses] = await Promise.all([getStories(), getEvents(), getCampuses()]);
  const campusStories = stories.filter((s) => s.campus?.includes(campus.name.split(' ')[0])).slice(0, 3);
  const campusEvents = events.filter((e) => e.state === campus.state).slice(0, 3);
  const otherCampuses = campuses.filter((c) => c.id !== campus.id).slice(0, 3);

  return (
    <>
      <PageHeader eyebrow="Campus Directory" title={campus.name}>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium uppercase tracking-wider text-muted">
          <span className="inline-flex items-center gap-1">
            <MapPin aria-hidden className="h-3.5 w-3.5 text-brand" />
            {campus.university} • {campus.city}, {campus.state}
          </span>
          <CategoryPill variant="outline">{campus.type}</CategoryPill>
        </div>
        <nav aria-label="Breadcrumb" className="mt-6">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-muted">
            <li><Link href="/" className="hover:text-brand">Home</Link></li>
            <li aria-hidden><ChevronRight className="h-3 w-3" /></li>
            <li><Link href="/campus" className="hover:text-brand">Campus</Link></li>
            <li aria-hidden><ChevronRight className="h-3 w-3" /></li>
            <li className="text-ink/70" aria-current="page">{campus.name}</li>
          </ol>
        </nav>
      </PageHeader>

      <section className="section-pad">
        <div className="container-tsc">
          <Reveal>
            <div className="relative aspect-[16/7] overflow-hidden rounded-md">
              <Image src={campus.image} alt={campus.imageAlt} fill priority sizes="100vw" className="object-cover" />
            </div>
          </Reveal>

          <div className="mt-10 grid gap-12 lg:grid-cols-12">
            <div className="space-y-10 lg:col-span-8">
              <DemoNotice />
              <div>
                <h2 className="font-display text-xl font-bold">About the campus</h2>
                <p className="mt-3 text-[15px] leading-7 text-muted">{campus.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {campus.categories.map((c) => (
                    <CategoryPill key={c} variant="outline">{c}</CategoryPill>
                  ))}
                </div>
              </div>

              {/* News & stories from campus */}
              <div>
                <h2 className="flex items-center gap-2 font-display text-xl font-bold">
                  <Newspaper aria-hidden className="h-5 w-5 text-brand" /> News &amp; stories
                </h2>
                <div className="mt-5 space-y-3">
                  {(campusStories.length ? campusStories : stories.slice(0, 3)).map((s) => (
                    <Link
                      key={s.id}
                      href={`/stories/${s.slug}`}
                      className="card-base card-hover group flex items-center justify-between gap-4 p-4"
                    >
                      <div>
                        <p className="meta-text !text-[10px]">{formatDate(s.date)} • {s.category}</p>
                        <p className="mt-1 font-display text-[15px] font-bold transition-colors group-hover:text-brand">{s.title}</p>
                        <p className="mt-1 line-clamp-1 text-[13px] text-muted">{s.dek}</p>
                      </div>
                      <ChevronRight aria-hidden className="h-5 w-5 shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-brand" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Events */}
              <div>
                <h2 className="flex items-center gap-2 font-display text-xl font-bold">
                  <Calendar aria-hidden className="h-5 w-5 text-brand" /> Events
                </h2>
                <div className="mt-5 space-y-3">
                  {(campusEvents.length ? campusEvents : events.slice(0, 2)).map((e) => (
                    <Link
                      key={e.id}
                      href={`/events/${e.slug}`}
                      className="card-base card-hover group flex items-center justify-between gap-4 p-4"
                    >
                      <div>
                        <p className="meta-text !text-[10px]">{formatDate(e.date)} • {e.city}</p>
                        <p className="mt-1 font-display text-[15px] font-bold transition-colors group-hover:text-brand">{e.title}</p>
                      </div>
                      <ChevronRight aria-hidden className="h-5 w-5 shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-brand" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <aside className="space-y-6 lg:col-span-4">
              <div className="card-base p-5">
                <h3 className="font-display text-sm font-bold uppercase tracking-[0.14em]">At a glance</h3>
                <dl className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-2 text-muted"><PenLine aria-hidden className="h-4 w-4 text-brand" /> Stories</dt>
                    <dd className="font-display font-bold">{campus.counts?.stories ?? 0}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-2 text-muted"><Calendar aria-hidden className="h-4 w-4 text-brand" /> Events</dt>
                    <dd className="font-display font-bold">{campus.counts?.events ?? 0}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-2 text-muted"><Users aria-hidden className="h-4 w-4 text-brand" /> Contributors</dt>
                    <dd className="font-display font-bold">{campus.counts?.contributors ?? 0}</dd>
                  </div>
                </dl>
                <p className="mt-3 text-[11px] italic text-muted">Demo counts — real metrics populate from the API.</p>
              </div>

              {(campus.latestStory?.title || campus.upcomingEvent?.title) && (
                <div className="rounded-md border border-brand/20 bg-brand-50 p-5">
                  <h3 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.14em] text-brand">
                    <Lightbulb aria-hidden className="h-4 w-4" /> From this campus
                  </h3>
                  <ul className="mt-4 space-y-3 text-sm">
                    {campus.latestStory?.title && (
                      <li className="flex items-start gap-2 text-ink/80">
                        <Award aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" />
                        {campus.latestStory.title}
                      </li>
                    )}
                    {campus.upcomingEvent?.title && (
                      <li className="flex items-start gap-2 text-ink/80">
                        <Calendar aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" />
                        {campus.upcomingEvent.title} {campus.upcomingEvent.date ? `— ${formatDate(campus.upcomingEvent.date)}` : ''}
                      </li>
                    )}
                  </ul>
                  {campus.upcomingEvent?.slug && (
                    <div className="mt-4">
                      <TextCTA href={`/events/${campus.upcomingEvent.slug}`} className="!text-[11.5px]">
                        View Event
                      </TextCTA>
                    </div>
                  )}
                </div>
              )}

              <div className="rounded-md border border-gold/40 bg-gold-50 p-5">
                <h3 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-gold-deep">
                  Study at this campus?
                </h3>
                <p className="mt-2 text-[13px] leading-6 text-ink/70">
                  Share news, achievements and initiatives from your campus with TSC.
                </p>
                <TextCTA href="/share-campus-news" className="mt-3 !text-[11.5px] !text-gold-deep">
                  Submit Campus News
                </TextCTA>
              </div>
            </aside>
          </div>

          {otherCampuses.length > 0 && (
            <div className="mt-16 border-t border-hairline pt-10">
              <h2 className="font-display text-xl font-bold tracking-tight">Explore other campuses</h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {otherCampuses.map((c) => (
                  <CampusCard key={c.id} campus={c} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
