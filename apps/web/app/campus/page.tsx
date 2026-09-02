import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { CampusCard } from '@/components/cards/CampusCard';
import { FilterBar } from '@/components/common/FilterBar';
import { SearchBar } from '@/components/common/SearchBar';
import { EmptyState } from '@/components/common/States';
import { StaggerGrid, StaggerItem } from '@/components/common/Reveal';
import { getCampuses } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Campus — India’s Campuses Have a Story to Tell',
  description:
    'Every campus has its own culture, people, ideas and energy. Explore campus directories, news, events, achievements, clubs and initiatives.',
  alternates: { canonical: '/campus' },
};

export const revalidate = 300;

export default async function CampusPage({
  searchParams,
}: {
  searchParams: { q?: string; state?: string };
}) {
  const all = await getCampuses();
  const q = (searchParams.q ?? '').trim().toLowerCase();
  const state = searchParams.state;

  let items = all;
  if (state) items = items.filter((c) => c.state === state);
  if (q) {
    items = items.filter((c) =>
      [c.name, c.university, c.city, c.state, c.description].some((f) => f.toLowerCase().includes(q))
    );
  }

  const states = Array.from(new Set(all.map((c) => c.state))).sort();

  return (
    <>
      <PageHeader
        eyebrow="03 — Campus"
        title="India's Campuses Have a Story to Tell."
        description="Every campus has its own culture, people, ideas and energy. TSC brings those stories together — from student achievements and campus events to clubs, communities, innovations and the everyday experiences that define student life."
      >
        <div className="flex flex-col gap-5">
          <SearchBar basePath="/campus" defaultValue={searchParams.q ?? ''} placeholder="Search campuses by name, city or university…" />
          <Suspense fallback={null}>
            <FilterBar
              basePath="/campus"
              filters={[
                { key: 'state', label: 'State', options: states.map((s) => ({ value: s, label: s })), type: 'select' },
              ]}
            />
          </Suspense>
        </div>
      </PageHeader>

      <section className="section-pad">
        <div className="container-tsc">
          <p className="meta-text mb-6">
            {items.length} campus{items.length === 1 ? '' : 'es'} in the directory
            {state ? ` · ${state}` : ''}
          </p>
          {items.length === 0 ? (
            <EmptyState
              title="No campuses found"
              description="Try a different search or clear the state filter."
            />
          ) : (
            <StaggerGrid className="grid gap-6 sm:grid-cols-2">
              {items.map((c, i) => (
                <StaggerItem key={c.id}>
                  <CampusCard campus={c} priority={i < 2} />
                </StaggerItem>
              ))}
            </StaggerGrid>
          )}
        </div>
      </section>
    </>
  );
}
