import Link from 'next/link';
import Image from 'next/image';
import { CategoryPill, DemoChip } from '@/components/common/CategoryPill';
import type { Story, StoryCategory } from '@/types/content';
import { formatDate } from '@/lib/utils';

const pillVariant: Record<string, 'brand' | 'gold' | 'ink'> = {
  student: 'brand',
  startup: 'gold',
  campus: 'ink',
};

const categoryLabel: Record<string, string> = {
  student: 'Student',
  startup: 'Startup',
  campus: 'Campus',
};

/** Story card — image, category pill, headline, one-line dek. */
export function StoryCard({ story, priority = false }: { story: Story; priority?: boolean }) {
  const cat = story.category || 'student';
  const isObjectId = typeof story.author === 'string' && /^[a-f\d]{24}$/i.test(story.author);
  const authorName = (!isObjectId && story.author) ? story.author : 'TSC Contributor';
  const imageSrc = story.image || '/images/stories/story-1.jpg';
  const imageAlt = story.imageAlt || story.title || 'Story image';
  const dateStr = formatDate(story.date);

  return (
    <Link href={`/stories/${story.slug}`} className="card-base card-hover group flex h-full flex-col overflow-hidden">
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden">
        <Image
          src={imageSrc}
          alt={imageAlt}
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
        <div className="flex min-h-[1.75rem] flex-wrap items-center gap-2">
          <CategoryPill variant={pillVariant[cat] || 'brand'}>{categoryLabel[cat] || cat}</CategoryPill>
          {story.demo && <DemoChip />}
        </div>
        <h3 className="font-display text-lg font-bold leading-snug transition-colors group-hover:text-brand line-clamp-2 min-h-[3.25rem]">
          {story.title}
        </h3>
        <p className="line-clamp-2 text-sm leading-6 text-muted min-h-[3rem]">{story.dek}</p>
        <div className="mt-auto flex items-center gap-2 border-t border-hairline pt-3 text-xs font-medium uppercase tracking-wider text-muted">
          <span className="truncate">{authorName}</span>
          {dateStr && (
            <>
              <span aria-hidden>•</span>
              <span className="shrink-0">{dateStr}</span>
            </>
          )}
          <span aria-hidden>•</span>
          <span className="shrink-0">{story.readingTime || 4} min</span>
        </div>
      </div>
    </Link>
  );
}
