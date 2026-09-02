import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { ArticleCard } from '@/components/cards/ArticleCard';
import { FilterBar } from '@/components/common/FilterBar';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/States';
import { StaggerGrid, StaggerItem } from '@/components/common/Reveal';
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

  const filtered = searchParams.category
    ? all.filter((a) => a.category === searchParams.category)
    : all;

  const page = Math.max(1, Number(searchParams.page ?? '1') || 1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const items = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

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
          {items.length === 0 ? (
            <EmptyState
              title="No stories in this category yet"
              description="Try another category — or check the full newsroom for the latest updates."
            />
          ) : (
            <>
              <StaggerGrid className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((a, i) => (
                  <StaggerItem key={a.id}>
                    <ArticleCard article={a} priority={i < 3} />
                  </StaggerItem>
                ))}
              </StaggerGrid>
              <Pagination page={page} totalPages={totalPages} basePath="/news" query={searchParams} />
            </>
          )}
        </div>
      </section>
    </>
  );
}
