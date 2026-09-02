'use client';

import { SearchX, AlertTriangle, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';

/** Empty state for filtered/dynamic lists. */
export function EmptyState({
  title = 'Nothing here yet',
  description = 'No matching items were found. Try different filters or check back soon.',
  action,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card-base flex flex-col items-center gap-4 px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand">
        <SearchX aria-hidden className="h-6 w-6" />
      </span>
      <div className="max-w-md space-y-1.5">
        <h3 className="font-display text-lg font-bold">{title}</h3>
        <p className="text-sm leading-6 text-muted">{description}</p>
      </div>
      {action ?? (
        <Button href="/news" variant="outline" size="sm">
          Browse Latest News
        </Button>
      )}
    </div>
  );
}

/** Error state with a retry action (client-side refresh). */
export function ErrorState({
  title = 'Something went wrong',
  description = 'We could not load this content. Please try again.',
  error,
}: {
  title?: string;
  description?: string;
  error?: Error & { digest?: string };
}) {
  const router = useRouter();
  return (
    <div className="card-base flex flex-col items-center gap-4 border-gold/40 px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-50 text-gold-deep">
        <AlertTriangle aria-hidden className="h-6 w-6" />
      </span>
      <div className="max-w-md space-y-1.5">
        <h3 className="font-display text-lg font-bold">{title}</h3>
        <p className="text-sm leading-6 text-muted">{description}</p>
        {error?.digest && <p className="text-xs text-muted/70">Ref: {error.digest}</p>}
      </div>
      <div className="flex gap-3">
        <Button size="sm" onClick={() => router.refresh()}>
          <RotateCcw aria-hidden className="h-4 w-4" /> Retry
        </Button>
        <Button href="/" variant="outline" size="sm">
          Go Home
        </Button>
      </div>
    </div>
  );
}
