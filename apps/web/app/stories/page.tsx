import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { StoriesFeed } from '@/components/stories/StoriesFeed';
import { FilterBar } from '@/components/common/FilterBar';
import { SearchBar } from '@/components/common/SearchBar';
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
          <StoriesFeed
            initialStories={all}
            category={searchParams.category}
            query={searchParams.q ?? ''}
          />
        </div>
      </section>
    </>
  );
}
