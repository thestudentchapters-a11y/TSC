import { Suspense } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { StoriesFeed } from '@/components/stories/StoriesFeed';
import { SearchBar } from '@/components/common/SearchBar';
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

  return (
    <>
      <PageHeader eyebrow={meta.eyebrow} title={meta.title} description={meta.description}>
        <Suspense fallback={null}>
          <SearchBar basePath={meta.base} defaultValue={q ?? ''} placeholder="Search these stories…" />
        </Suspense>
      </PageHeader>
      <section className="section-pad">
        <div className="container-tsc">
          <StoriesFeed
            initialStories={all}
            category={category}
            query={q ?? ''}
          />
        </div>
      </section>
    </>
  );
}
