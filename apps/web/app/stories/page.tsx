import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { StoryCard } from '@/components/cards/StoryCard';
import { FilterBar } from '@/components/common/FilterBar';
import { SearchBar } from '@/components/common/SearchBar';
import { EmptyState } from '@/components/common/States';
import { StaggerGrid, StaggerItem } from '@/components/common/Reveal';
import { getStories } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Stories — Student · Startup · Campus',
  description:
    'Real people. Real journeys. Student stories, startup stories and campus stories from across India.',
  alternates: { canonical: '/stories' },
};

export const revalidate = 120;

export default async function StoriesPage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string; page?: string };
}) {
  const all = (await getStories()).filter((s) => s.status === 'published');

  const category = searchParams.category;
  const q = (searchParams.q ?? '').trim().toLowerCase();

  let filtered = category ? all.filter((s) => s.category === category) : all;
  if (q) {
    filtered = filtered.filter((s) =>
      [s.title, s.dek, s.author, s.campus].some((f) => f?.toLowerCase().includes(q))
    );
  }

  const perPage = 6;
  const page = Math.max(1, Number(searchParams.page ?? '1') || 1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const items = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <>
      <PageHeader
        eyebrow="02 — Real People. Real Journeys."
        title="Every Student Has a Story."
        description="Behind every achievement is a journey. Behind every idea is a person. And behind every campus is a community full of stories waiting to be discovered."
      >
        <div className="flex flex-col gap-5">
          <SearchBar basePath="/stories" defaultValue={searchParams.q ?? ''} placeholder="Search stories by title, author or campus…" />
          <Suspense fallback={null}>
            <FilterBar
              basePath="/stories"
              filters={[
                {
                  key: 'category',
                  label: 'Category',
                  options: [
                    { value: 'student', label: 'Student' },
                    { value: 'startup', label: 'Startup' },
                    { value: 'campus', label: 'Campus' },
                  ],
                },
              ]}
            />
          </Suspense>
        </div>
      </PageHeader>

      <section className="section-pad">
        <div className="container-tsc">
          {items.length === 0 ? (
            <EmptyState
              title={q ? `No stories match “${searchParams.q}”` : 'No stories in this category yet'}
              description="Try a different search or category — or be the first to share yours."
              action={
                <Suspense fallback={null}>
                  <FilterBar basePath="/stories" filters={[{ key: 'category', label: 'Category', options: [] }]} className="hidden" />
                </Suspense>
              }
            />
          ) : (
            <StaggerGrid className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((s, i) => (
                <StaggerItem key={s.id}>
                  <StoryCard story={s} priority={i < 3} />
                </StaggerItem>
              ))}
            </StaggerGrid>
          )}
        </div>
      </section>
    </>
  );
}
