'use client';

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { ErrorState } from '@/components/common/States';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container-tsc flex min-h-[70vh] items-center justify-center pt-24">
      <div className="w-full max-w-xl">
        <div className="mb-6 flex items-center justify-center gap-3 text-gold-deep">
          <AlertTriangle aria-hidden className="h-6 w-6" />
          <p className="font-display text-sm font-bold uppercase tracking-[0.2em]">Error 500</p>
        </div>
        <ErrorState
          title="Something went wrong on our side."
          description="An unexpected error occurred while rendering this page. Please retry — if it persists, the TSC team has been notified."
          error={error}
        />
        <div className="mt-6 flex justify-center">
          <Button onClick={reset} size="md">
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
