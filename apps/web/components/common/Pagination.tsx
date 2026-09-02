import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/** URL-driven pagination (works with server components). */
export function Pagination({
  page,
  totalPages,
  basePath,
  query = {},
}: {
  page: number;
  totalPages: number;
  basePath: string;
  query?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const hrefFor = (p: number) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v && k !== 'page') params.set(k, v);
    });
    if (p > 1) params.set('page', String(p));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} aria-label="Previous page" className="flex h-9 w-9 items-center justify-center rounded-[4px] border border-hairline bg-white text-ink transition-colors hover:border-brand hover:text-brand">
          <ChevronLeft aria-hidden className="h-4 w-4" />
        </Link>
      ) : (
        <span className="flex h-9 w-9 items-center justify-center rounded-[4px] border border-hairline bg-cream text-muted/40" aria-hidden>
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}
      {pages.map((p) => (
        <Link
          key={p}
          href={hrefFor(p)}
          aria-current={p === page ? 'page' : undefined}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-[4px] border font-display text-sm font-bold transition-colors',
            p === page
              ? 'border-brand bg-brand text-white'
              : 'border-hairline bg-white text-ink hover:border-brand hover:text-brand'
          )}
        >
          {p}
        </Link>
      ))}
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} aria-label="Next page" className="flex h-9 w-9 items-center justify-center rounded-[4px] border border-hairline bg-white text-ink transition-colors hover:border-brand hover:text-brand">
          <ChevronRight aria-hidden className="h-4 w-4" />
        </Link>
      ) : (
        <span className="flex h-9 w-9 items-center justify-center rounded-[4px] border border-hairline bg-cream text-muted/40" aria-hidden>
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
