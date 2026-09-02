'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { cn } from '@/lib/utils';

export interface FilterOption { value: string; label: string }
export interface FilterDef { key: string; label: string; options: FilterOption[]; type?: 'pills' | 'select' }

/**
 * URL-driven filter bar (works with server components).
 * `pills` render as segmented category tabs, `select` as dropdowns.
 */
export function FilterBar({
  filters,
  basePath,
  className,
}: {
  filters: FilterDef[];
  basePath: string;
  className?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const apply = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (!value || next.get(key) === value) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    next.delete('page');
    const qs = next.toString();
    startTransition(() => router.push(qs ? `${basePath}?${qs}` : basePath, { scroll: false }));
  };

  return (
    <div className={cn('flex flex-col gap-4', pending && 'opacity-70', className)} aria-busy={pending}>
      {filters.map((f) => {
        const current = params.get(f.key) ?? '';
        if (f.type === 'select') {
          return (
            <div key={f.key} className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">{f.label}</span>
              <select
                aria-label={f.label}
                value={current}
                onChange={(e) => apply(f.key, e.target.value)}
                className="rounded-[4px] border border-hairline bg-white px-3 py-2 text-sm font-medium text-ink focus:border-brand focus:outline-none"
              >
                <option value="">All</option>
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          );
        }
        return (
          <div key={f.key} className="flex flex-wrap items-center gap-2" role="group" aria-label={f.label}>
            {f.options.map((o) => {
              const active = current === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => apply(f.key, active ? '' : o.value)}
                  className={cn(
                    'rounded-full border px-4 py-2 font-display text-[11px] font-bold uppercase tracking-[0.12em] transition-all',
                    active
                      ? 'border-brand bg-brand text-white shadow-card'
                      : 'border-hairline bg-white text-ink/70 hover:border-brand hover:text-brand'
                  )}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
