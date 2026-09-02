import Link from 'next/link';
import Image from 'next/image';
import { CategoryPill, DemoChip } from '@/components/common/CategoryPill';
import type { Story, StoryCategory } from '@/types/content';
import { formatDate } from '@/lib/utils';

const pillVariant: Record<StoryCategory, 'brand' | 'gold' | 'ink'> = {
  student: 'brand',
  startup: 'gold',
  campus: 'ink',
};

const categoryLabel: Record<StoryCategory, string> = {
  student: 'Student',
  startup: 'Startup',
  campus: 'Campus',
};

/** Story card — image, category pill, headline, one-line dek. */
export function StoryCard({ story, priority = false }: { story: Story; priority?: boolean }) {
  return (
    <Link href={`/stories/${story.slug}`} className="card-base card-hover group flex flex-col overflow-hidden">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={story.image}
          alt={story.imageAlt}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gold transition-transform duration-500 group-hover:scale-x-100"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <CategoryPill variant={pillVariant[story.category]}>{categoryLabel[story.category]}</CategoryPill>
          {story.demo && <DemoChip />}
        </div>
        <h3 className="font-display text-lg font-bold leading-snug transition-colors group-hover:text-brand">
          {story.title}
        </h3>
        <p className="line-clamp-2 text-sm leading-6 text-muted">{story.dek}</p>
        <div className="mt-auto flex items-center gap-2 pt-2 text-xs font-medium uppercase tracking-wider text-muted">
          <span>{story.author}</span>
          <span aria-hidden>•</span>
          <span>{formatDate(story.date)}</span>
          <span aria-hidden>•</span>
          <span>{story.readingTime} min</span>
        </div>
      </div>
    </Link>
  );
}
