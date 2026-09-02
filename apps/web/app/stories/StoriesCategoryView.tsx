import { Suspense } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { StoryCard } from '@/components/cards/StoryCard';
import { SearchBar } from '@/components/common/SearchBar';
import { EmptyState } from '@/components/common/States';
import { StaggerGrid, StaggerItem } from '@/components/common/Reveal';
import { getStories } from '@/lib/data';
import type { StoryCategory } from '@/types/content';

const META: Record<StoryCategory, { eyebrow: string; title: string; description: string; base: string }> = {
  student: {
    eyebrow: 'Stories / Student',
    title: 'Personal journeys, achievements, challenges and experiences.',
    description: 'Every student carries a story — of effort, setback, discovery and growth. These are those journeys.',
    base: '/stories/student',
  },
  startup: {
    eyebrow: 'Stories / Startup',
    title: 'Young founders and ideas turning into businesses.',
    description: 'From hostel-room prototypes to first customers — the honest, unglamorous middle of the startup journey.',
    base: '/stories/startup',
  },
  campus: {
    eyebrow: 'Stories / Campus',
    title: "What's happening inside India's colleges and universities.",
    description: 'The clubs, communities, initiatives and everyday moments that define campus life.',
    base: '/stories/campus',
  },
};

/** Shared category listing for /stories/student | startup | campus */
export default async function StoriesCategoryView({
  category,
  q,
}: {
  category: StoryCategory;
  q?: string;
}) {
  const meta = META[category];
  const all = (await getStories()).filter((s) => s.status === 'published' && s.category === category);
  const term = (q ?? '').trim().toLowerCase();
  const items = term
    ? all.filter((s) => [s.title, s.dek, s.author, s.campus].some((f) => f?.toLowerCase().includes(term)))
    : all;

  return (
    <>
      <PageHeader eyebrow={meta.eyebrow} title={meta.title} description={meta.description}>
        <Suspense fallback={null}>
          <SearchBar basePath={meta.base} defaultValue={q ?? ''} placeholder="Search these stories…" />
        </Suspense>
      </PageHeader>
      <section className="section-pad">
        <div className="container-tsc">
          {items.length === 0 ? (
            <EmptyState
              title="No stories found"
              description="Try a different search — or share your own story with TSC."
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
