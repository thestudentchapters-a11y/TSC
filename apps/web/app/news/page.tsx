import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { NewsFeed } from '@/components/news/NewsFeed';
import { FilterBar } from '@/components/common/FilterBar';
import { getArticles } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Latest News',
  description:
    'Student news, education updates, youth & society stories and technology & innovation — the news that matters to the next generation.',
  alternates: { canonical: '/news' },
};

export const revalidate = 120;

const PER_PAGE = 6;

export default async function NewsPage({
  searchParams,
}: {
  searchParams: { page?: string; category?: string };
}) {
  const all = (await getArticles()).filter((a) => a.status === 'published');
  const categories = Array.from(new Set(all.map((a) => a.category)));
  const page = Math.max(1, Number(searchParams.page ?? '1') || 1);

  return (
    <>
      <PageHeader
        eyebrow="01 — Stay Informed"
        title="What's Happening Around You?"
        description="From education and technology to youth affairs, campus developments and student achievements — stay updated with the news that matters to the next generation."
      >
        <Suspense fallback={null}>
          <FilterBar
            basePath="/news"
            filters={[
              {
                key: 'category',
                label: 'Category',
                options: categories.map((c) => ({ value: c, label: c })),
              },
            ]}
          />
        </Suspense>
      </PageHeader>

      <section className="section-pad">
        <div className="container-tsc">
          <NewsFeed
            initialArticles={all}
            currentCategory={searchParams.category}
            currentPage={page}
            perPage={PER_PAGE}
            searchParams={searchParams}
          />
        </div>
      </section>
    </>
  );
}
