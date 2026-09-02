import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { EventCard } from '@/components/cards/EventCard';
import { FilterBar } from '@/components/common/FilterBar';
import { EmptyState } from '@/components/common/States';
import { StaggerGrid, StaggerItem } from '@/components/common/Reveal';
import { getEvents } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Events — Experience. Participate. Connect.',
  description:
    "The best opportunities often begin with showing up. Discover workshops, competitions, conferences, career sessions, campus programmes, networking events and youth initiatives happening around you.",
  alternates: { canonical: '/events' },
};

export const revalidate = 120;

export default async function EventsPage({
  searchParams,
}: {
  searchParams: { category?: string; status?: string };
}) {
  const all = await getEvents();
  const categories = Array.from(new Set(all.map((e) => e.category))).sort();
  const statuses = ['upcoming', 'ongoing', 'past'];

  let items = all;
  if (searchParams.category) items = items.filter((e) => e.category === searchParams.category);
  if (searchParams.status) items = items.filter((e) => e.status === searchParams.status);
  items = [...items].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <>
      <PageHeader
        eyebrow="07 — Experience. Participate. Connect."
        title="Don't Just Watch From the Sidelines."
        description="The best opportunities often begin with showing up. Discover workshops, competitions, conferences, career sessions, campus programmes, networking events and youth initiatives happening around you."
      >
        <Suspense fallback={null}>
          <div className="flex flex-wrap gap-6">
            <FilterBar
              basePath="/events"
              filters={[
                { key: 'status', label: 'Status', options: statuses.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) })) },
                { key: 'category', label: 'Category', options: categories.map((c) => ({ value: c, label: c })), type: 'select' },
              ]}
            />
          </div>
        </Suspense>
      </PageHeader>

      <section className="section-pad">
        <div className="container-tsc">
          {items.length === 0 ? (
            <EmptyState title="No events match these filters" description="Try clearing a filter — new events are added regularly." />
          ) : (
            <StaggerGrid className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((e, i) => (
                <StaggerItem key={e.id}>
                  <EventCard event={e} priority={i < 3} />
                </StaggerItem>
              ))}
            </StaggerGrid>
          )}
        </div>
      </section>
    </>
  );
}
