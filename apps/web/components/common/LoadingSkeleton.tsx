import { cn } from '@/lib/utils';

/** Animated skeleton blocks for loading states. */
export function LoadingSkeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-hairline/80', className)} aria-hidden />;
}

export function CardSkeleton() {
  return (
    <div className="card-base overflow-hidden" aria-hidden>
      <LoadingSkeleton className="aspect-[16/10] rounded-none" />
      <div className="space-y-3 p-5">
        <LoadingSkeleton className="h-3 w-20" />
        <LoadingSkeleton className="h-5 w-full" />
        <LoadingSkeleton className="h-5 w-3/4" />
        <div className="flex gap-3 pt-2">
          <LoadingSkeleton className="h-3 w-16" />
          <LoadingSkeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ArticleRowSkeleton() {
  return (
    <div className="card-base flex gap-5 p-5" aria-hidden>
      <LoadingSkeleton className="hidden h-28 w-44 shrink-0 sm:block" />
      <div className="flex-1 space-y-3 py-1">
        <LoadingSkeleton className="h-3 w-24" />
        <LoadingSkeleton className="h-5 w-full" />
        <LoadingSkeleton className="h-5 w-2/3" />
        <LoadingSkeleton className="h-3 w-36" />
      </div>
    </div>
  );
}

export function PageSkeleton({ title = true }: { title?: boolean }) {
  return (
    <div className="container-tsc section-pad">
      {title && (
        <div className="mb-10 space-y-4">
          <LoadingSkeleton className="h-3 w-40" />
          <LoadingSkeleton className="h-9 w-2/3 max-w-xl" />
          <LoadingSkeleton className="h-3 w-full max-w-2xl" />
        </div>
      )}
      <CardGridSkeleton />
    </div>
  );
}
