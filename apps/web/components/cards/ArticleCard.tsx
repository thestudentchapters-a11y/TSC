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
  const meta = (
    <div className="meta-text flex flex-wrap items-center gap-x-3 gap-y-1">
      <span className="inline-flex items-center gap-1">
        <User aria-hidden className="h-3 w-3" /> {article.author}
      </span>
      <span aria-hidden>•</span>
      <span>{formatDate(article.date)}</span>
      <span aria-hidden>•</span>
      <span className="inline-flex items-center gap-1">
        <Clock aria-hidden className="h-3 w-3" /> {article.readingTime} min read
      </span>
    </div>
  );

  if (variant === 'horizontal') {
    return (
      <Link
        href={`/news/${article.slug}`}
        className="card-base card-hover group flex gap-5 p-4 sm:p-5"
      >
        <div className="relative hidden w-44 shrink-0 overflow-hidden rounded-sm sm:block">
          <Image
            src={article.image}
            alt={article.imageAlt}
            fill
            sizes="200px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="min-w-0 flex-1 space-y-2.5 py-1">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryPill>{article.category}</CategoryPill>
            {article.demo && <DemoChip />}
          </div>
          <h3 className="font-display text-[17px] font-bold leading-snug transition-colors group-hover:text-brand">
            {article.title}
          </h3>
          <p className="line-clamp-2 text-sm leading-6 text-muted">{article.excerpt}</p>
          {meta}
        </div>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link href={`/news/${article.slug}`} className="card-base card-hover group grid overflow-hidden lg:grid-cols-2">
        <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-[340px]">
          <Image
            src={article.image}
            alt={article.imageAlt}
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
            <CategoryPill>{article.category}</CategoryPill>
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
    <Link href={`/news/${article.slug}`} className="card-base card-hover group flex flex-col overflow-hidden">
      <div className={cn('relative aspect-[16/10] overflow-hidden')}>
        <Image
          src={article.image}
          alt={article.imageAlt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <CategoryPill>{article.category}</CategoryPill>
          {article.demo && <DemoChip />}
        </div>
        <h3 className="font-display text-lg font-bold leading-snug transition-colors group-hover:text-brand">
          {article.title}
        </h3>
        <p className="line-clamp-2 text-sm leading-6 text-muted">{article.excerpt}</p>
        <div className="mt-auto space-y-3 pt-1">
          {meta}
          <span className="cta-underline font-display text-[11px] font-bold uppercase tracking-[0.14em] text-brand">
            Read Story
          </span>
        </div>
      </div>
    </Link>
  );
}
