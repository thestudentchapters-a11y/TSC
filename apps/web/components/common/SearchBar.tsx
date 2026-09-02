'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Search input that routes to /search (or a custom base). */
export function SearchBar({
  basePath = '/search',
  placeholder = 'Search stories, news, opportunities, events…',
  defaultValue = '',
  className,
  autoFocus = false,
}: {
  basePath?: string;
  placeholder?: string;
  defaultValue?: string;
  className?: string;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const [q, setQ] = useState(defaultValue);

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const term = q.trim();
        router.push(term ? `${basePath}?q=${encodeURIComponent(term)}` : basePath);
      }}
      className={cn(
        'flex w-full items-center gap-2 rounded-[6px] border border-hairline bg-white px-4 py-3 shadow-card transition-colors focus-within:border-brand',
        className
      )}
    >
      <Search aria-hidden className="h-4 w-4 shrink-0 text-brand" />
      <label htmlFor="tsc-search" className="sr-only">
        Search
      </label>
      <input
        id="tsc-search"
        type="search"
        value={q}
        autoFocus={autoFocus}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-ink placeholder:text-muted/70 focus:outline-none"
      />
      <button
        type="submit"
        className="shrink-0 rounded-[4px] bg-brand px-4 py-2 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-brand-dark"
      >
        Search
      </button>
    </form>
  );
}
