import Link from 'next/link';
import Image from 'next/image';
import { Clock, User } from 'lucide-react';
import { CategoryPill, DemoChip } from '@/components/common/CategoryPill';
import type { Article } from '@/types/content';
import { cn, formatDate } from '@/lib/utils';

/** Editorial article card — featured / default / horizontal variants. */
export function ArticleCard({
  article,
  variant = 'default',
  priority = false,
}: {
  article: Article;
  variant?: 'featured' | 'default' | 'horizontal';
  priority?: boolean;
}) {
  const isObjectId = typeof article.author === 'string' && /^[a-f\d]{24}$/i.test(article.author);
  const authorName = (!isObjectId && article.author) ? article.author : 'TSC Editorial';
  const imageSrc = article.image || (article as any).featuredImage || '/images/news/news-1.jpg';
  const imageAlt = article.imageAlt || article.title || 'News story';
  const categoryName = (typeof article.category === 'object' && (article.category as any)?.name ? (article.category as any).name : article.category) || 'Student News';
  const dateStr = formatDate(article.date || (article as any).publishAt || (article as any).createdAt);

  const meta = (
    <div className="meta-text flex flex-wrap items-center gap-x-3 gap-y-1">
      <span className="inline-flex items-center gap-1">
        <User aria-hidden className="h-3 w-3" /> {authorName}
      </span>
      {dateStr && (
        <>
          <span aria-hidden>•</span>
          <span>{dateStr}</span>
        </>
      )}
      <span aria-hidden>•</span>
      <span className="inline-flex items-center gap-1">
        <Clock aria-hidden className="h-3 w-3" /> {article.readingTime || 3} min read
      </span>
    </div>
  );

  if (variant === 'horizontal') {
    return (
      <Link
        href={`/news/${article.slug}`}
        className="card-base card-hover group flex h-full gap-5 p-4 sm:p-5"
      >
        <div className="relative hidden w-44 shrink-0 overflow-hidden rounded-sm sm:block">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="200px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <CategoryPill>{categoryName}</CategoryPill>
              {article.demo && <DemoChip />}
            </div>
            <h3 className="font-display text-[17px] font-bold leading-snug transition-colors group-hover:text-brand line-clamp-2 min-h-[3rem]">
              {article.title}
            </h3>
            <p className="line-clamp-2 text-sm leading-6 text-muted">{article.excerpt}</p>
          </div>
          <div className="mt-auto pt-3">
            {meta}
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link href={`/news/${article.slug}`} className="card-base card-hover group grid overflow-hidden lg:grid-cols-2">
        <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-[340px]">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            priority={priority}
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <span className="absolute left-4 top-4">
            <CategoryPill variant="ink">Featured</CategoryPill>
          </span>
        </div>
        <div className="flex flex-col justify-center gap-4 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryPill>{categoryName}</CategoryPill>
            {article.demo && <DemoChip />}
          </div>
          <h3 className="font-display text-2xl font-bold leading-tight transition-colors group-hover:text-brand sm:text-[1.7rem]">
            {article.title}
          </h3>
          <p className="line-clamp-3 text-[15px] leading-7 text-muted">{article.excerpt}</p>
          {meta}
          <span className="cta-underline w-fit font-display text-[12px] font-bold uppercase tracking-[0.14em] text-brand">
            Read Full Story
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/news/${article.slug}`} className="card-base card-hover group flex h-full flex-col overflow-hidden">
      <div className={cn('relative aspect-[16/10] w-full shrink-0 overflow-hidden')}>
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex min-h-[1.75rem] flex-wrap items-center gap-2">
          <CategoryPill>{categoryName}</CategoryPill>
          {article.demo && <DemoChip />}
        </div>
        <h3 className="font-display text-lg font-bold leading-snug transition-colors group-hover:text-brand line-clamp-2 min-h-[3.25rem]">
          {article.title}
        </h3>
        <p className="line-clamp-2 text-sm leading-6 text-muted min-h-[3rem]">{article.excerpt}</p>
        <div className="mt-auto space-y-3 pt-2">
          {meta}
          <span className="cta-underline font-display text-[11px] font-bold uppercase tracking-[0.14em] text-brand">
            Read Story
          </span>
        </div>
      </div>
    </Link>
  );
}
