import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchBar } from '@/components/common/SearchBar';
import { EmptyState } from '@/components/common/States';
import { StaggerGrid, StaggerItem } from '@/components/common/Reveal';
import { searchAll } from '@/lib/data';
import { cn, formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Search — THE STUDENT CHAPTERS',
  description: 'Search across TSC news, stories, campuses, podcasts, events, opportunities, current affairs and legal awareness.',
  alternates: { canonical: '/search' },
};

const TYPES = ['News', 'Story', 'Campus', 'Podcast', 'Event', 'Opportunity', 'Current Affairs', 'Legal Awareness'] as const;

const TYPE_COLOR: Record<string, string> = {
  News: 'border-brand/25 bg-brand-50 text-brand',
  Story: 'border-gold/40 bg-gold-50 text-gold-deep',
  Campus: 'border-ink/20 bg-ink text-cream',
  Podcast: 'border-brand/25 bg-brand-50 text-brand',
  Event: 'border-brand/25 bg-brand-50 text-brand',
  Opportunity: 'border-gold/40 bg-gold-50 text-gold-deep',
  'Current Affairs': 'border-hairline bg-white text-muted',
  'Legal Awareness': 'border-hairline bg-white text-muted',
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; type?: string };
}) {
  const q = searchParams.q?.trim() ?? '';
  const results = q ? await searchAll(q) : [];
  const filtered = searchParams.type ? results.filter((r) => r.type === searchParams.type) : results;

  return (
    <>
      <PageHeader
        eyebrow="Global Search"
        title={q ? <>Results for “{q}”</> : 'Search the Platform.'}
        description="Search across news, stories, campuses, podcasts, events, career opportunities, current affairs and legal awareness."
      >
        <SearchBar defaultValue={q} autoFocus={!q} />
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href={q ? `/search?q=${encodeURIComponent(q)}` : '/search'}
            className={cn(
              'rounded-full border px-4 py-2 font-display text-[11px] font-bold uppercase tracking-[0.12em] transition-all',
              !searchParams.type ? 'border-brand bg-brand text-white' : 'border-hairline bg-white text-ink/70 hover:border-brand hover:text-brand'
            )}
          >
            All ({results.length})
          </Link>
          {TYPES.map((t) => {
            const count = results.filter((r) => r.type === t).length;
            if (!q || count === 0) return null;
            const active = searchParams.type === t;
            return (
              <Link
                key={t}
                href={`/search?q=${encodeURIComponent(q)}&type=${encodeURIComponent(t)}`}
                className={cn(
                  'rounded-full border px-4 py-2 font-display text-[11px] font-bold uppercase tracking-[0.12em] transition-all',
                  active ? 'border-brand bg-brand text-white' : 'border-hairline bg-white text-ink/70 hover:border-brand hover:text-brand'
                )}
              >
                {t} ({count})
              </Link>
            );
          })}
        </div>
      </PageHeader>

      <section className="section-pad">
        <div className="container-tsc">
          {!q ? (
            <div className="card-base mx-auto max-w-lg px-6 py-14 text-center">
              <p className="font-serif text-lg italic text-brand">What are you looking for?</p>
              <p className="mt-3 text-sm leading-6 text-muted">
                Try “internship”, “Patna”, “startup”, “cyber safety” or a campus name to see live results
                across every TSC section.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title={`No results for “${q}”`}
              description="Check the spelling or try a broader term — or explore the sections from the navigation."
            />
          ) : (
            <>
              <p className="meta-text mb-6">
                {filtered.length} result{filtered.length === 1 ? '' : 's'}
                {searchParams.type ? ` in ${searchParams.type}` : ' across the platform'}
              </p>
              <StaggerGrid className="grid gap-5">
                {filtered.map((r) => (
                  <StaggerItem key={`${r.type}-${r.href}-${r.title}`}>
                    <Link href={r.href} className="card-base card-hover group flex gap-5 p-4 sm:p-5">
                      {r.image && (
                        <div className="relative hidden w-40 shrink-0 overflow-hidden rounded-sm sm:block">
                          <Image src={r.image} alt="" fill sizes="180px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1 space-y-2 py-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={cn('rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]', TYPE_COLOR[r.type])}>
                            {r.type}
                          </span>
                          {r.category && <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">{r.category}</span>}
                          {r.date && <span className="text-[11px] text-muted">• {formatDate(r.date)}</span>}
                        </div>
                        <h2 className="font-display text-[17px] font-bold leading-snug transition-colors group-hover:text-brand">
                          {r.title}
                        </h2>
                        <p className="line-clamp-2 text-[13.5px] leading-6 text-muted">{r.summary}</p>
                      </div>
                    </Link>
                  </StaggerItem>
                ))}
              </StaggerGrid>
            </>
          )}
        </div>
      </section>
    </>
  );
}
