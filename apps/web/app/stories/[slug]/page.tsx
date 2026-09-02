import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ChevronRight, Clock } from 'lucide-react';
import { PageHeader, ContentBody, DemoNotice } from '@/components/common/PageHeader';
import { CategoryPill } from '@/components/common/CategoryPill';
import { ShareButtons, SaveButton } from '@/components/common/ShareButtons';
import { StoryCard } from '@/components/cards/StoryCard';
import { Reveal } from '@/components/common/Reveal';
import { Button } from '@/components/common/Button';
import { getStoryBySlug, getStories } from '@/lib/data';
import { formatDate } from '@/lib/utils';

export const revalidate = 120;

type Props = { params: { slug: string } };

const CATEGORY_LABEL = { student: 'Student', startup: 'Startup', campus: 'Campus' } as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const story = await getStoryBySlug(params.slug);
  if (!story) return { title: 'Story not found' };
  return {
    title: story.title,
    description: story.dek,
    alternates: { canonical: `/stories/${story.slug}` },
    openGraph: {
      type: 'article',
      title: story.title,
      description: story.dek,
      publishedTime: story.date,
      images: [{ url: story.image, alt: story.imageAlt }],
    },
  };
}

export default async function StoryDetailPage({ params }: Props) {
  const story = await getStoryBySlug(params.slug);
  if (!story) notFound();

  const all = await getStories();
  const related = all.filter((s) => s.id !== story.id && s.category === story.category).slice(0, 3);

  return (
    <>
      <PageHeader eyebrow={`Stories / ${CATEGORY_LABEL[story.category]}`} title={story.title}>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium uppercase tracking-wider text-muted">
          <CategoryPill variant={story.category === 'startup' ? 'gold' : story.category === 'campus' ? 'ink' : 'brand'}>
            {CATEGORY_LABEL[story.category]}
          </CategoryPill>
          <span>{story.author}</span>
          <span>{formatDate(story.date)}</span>
          <span className="inline-flex items-center gap-1">
            <Clock aria-hidden className="h-3.5 w-3.5" /> {story.readingTime} min read
          </span>
          {story.campus && <span className="text-brand">{story.campus}</span>}
        </div>
        <nav aria-label="Breadcrumb" className="mt-6">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-muted">
            <li><Link href="/" className="hover:text-brand">Home</Link></li>
            <li aria-hidden><ChevronRight className="h-3 w-3" /></li>
            <li><Link href="/stories" className="hover:text-brand">Stories</Link></li>
            <li aria-hidden><ChevronRight className="h-3 w-3" /></li>
            <li><Link href={`/stories/${story.category}`} className="hover:text-brand">{CATEGORY_LABEL[story.category]}</Link></li>
          </ol>
        </nav>
      </PageHeader>

      <article className="section-pad">
        <div className="container-tsc max-w-5xl">
          <Reveal>
            <div className="relative aspect-[16/8] overflow-hidden rounded-md">
              <Image src={story.image} alt={story.imageAlt} fill priority sizes="(max-width: 1024px) 100vw, 66vw" className="object-cover" />
            </div>
          </Reveal>

          <div className="mt-10 grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <DemoNotice className="mb-8" />
              <p className="mb-8 font-serif text-xl italic leading-8 text-brand sm:text-2xl">{story.dek}</p>
              <ContentBody paragraphs={story.content} />

              {story.quote && (
                <blockquote className="my-10 border-l-4 border-gold bg-white p-6 shadow-card sm:p-8">
                  <p className="font-serif text-lg italic leading-8 text-ink sm:text-xl">“{story.quote.text}”</p>
                  <cite className="mt-4 block font-display text-xs font-bold uppercase tracking-[0.16em] text-brand not-italic">
                    — {story.quote.person}
                  </cite>
                </blockquote>
              )}
            </div>

            <aside className="space-y-6 lg:col-span-4">
              <div className="card-base space-y-5 p-5">
                <ShareButtons title={story.title} path={`/stories/${story.slug}`} />
                <div className="border-t border-hairline pt-5">
                  <SaveButton itemType="story" itemId={story.id} title={story.title} className="w-full justify-center" />
                </div>
              </div>
              <div className="rounded-md border border-gold/40 bg-gold-50 p-5">
                <h3 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-gold-deep">
                  Have a story like this?
                </h3>
                <p className="mt-2 text-[13px] leading-6 text-ink/70">
                  Your journey could inspire someone else. Tell us yours.
                </p>
                <Button href="/share-your-story" size="sm" className="mt-4">
                  Share Your Story
                </Button>
              </div>
            </aside>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-hairline bg-white section-pad">
          <div className="container-tsc">
            <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
              More {CATEGORY_LABEL[story.category]} stories
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((s) => (
                <StoryCard key={s.id} story={s} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
