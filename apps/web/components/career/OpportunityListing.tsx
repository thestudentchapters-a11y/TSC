import { Suspense } from 'react';
import { OpportunityCard } from '@/components/cards/OpportunityCard';
import { FilterBar } from '@/components/common/FilterBar';
import { EmptyState } from '@/components/common/States';
import { StaggerGrid, StaggerItem } from '@/components/common/Reveal';
import { getOpportunities } from '@/lib/data';
import type { OpportunityType } from '@/types/content';

const TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'Job', label: 'Jobs' },
  { value: 'Internship', label: 'Internships' },
  { value: 'Fellowship', label: 'Fellowships' },
  { value: 'Scholarship', label: 'Scholarships' },
];

const MODE_OPTIONS = [
  { value: 'Remote', label: 'Remote' },
  { value: 'Hybrid', label: 'Hybrid' },
  { value: 'On-site', label: 'On-site' },
];

/** Shared opportunity listing with filters (type, mode, location, deadline sort). */
export default async function OpportunityListing({
  basePath,
  lockedType,
  searchParams,
}: {
  basePath: string;
  lockedType?: OpportunityType;
  searchParams: { type?: string; mode?: string; location?: string; sort?: string };
}) {
  const all = (await getOpportunities()).filter((o) => o.active);

  let items = lockedType ? all.filter((o) => o.type === lockedType) : all;
  if (searchParams.type) items = items.filter((o) => o.type === searchParams.type);
  if (searchParams.mode) items = items.filter((o) => o.mode === searchParams.mode);
  if (searchParams.location) items = items.filter((o) => o.location.includes(searchParams.location!));

  if (searchParams.sort === 'deadline') items = [...items].sort((a, b) => +new Date(a.deadline) - +new Date(b.deadline));
  else items = [...items].sort((a, b) => +new Date(b.featured ? 0 : 1) - +new Date(a.featured ? 0 : 1));

  const locations = Array.from(new Set(all.map((o) => o.location.split(',')[0]))).sort();

  return (
    <>
      <Suspense fallback={null}>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
          {!lockedType && (
            <FilterBar
              basePath={basePath}
              filters={[{ key: 'type', label: 'Type', options: TYPE_OPTIONS }]}
            />
          )}
          <FilterBar
            basePath={basePath}
            filters={[
              { key: 'mode', label: 'Work mode', options: MODE_OPTIONS, type: 'select' },
              { key: 'location', label: 'Location', options: locations.map((l) => ({ value: l, label: l })), type: 'select' },
              { key: 'sort', label: 'Sort by', options: [{ value: 'deadline', label: 'Closing soon' }], type: 'select' },
            ]}
          />
        </div>
      </Suspense>

      <div className="mt-8">
        <p className="meta-text mb-6">
          {items.length} opportunit{items.length === 1 ? 'y' : 'ies'} found
        </p>
        {items.length === 0 ? (
          <EmptyState
            title="No opportunities match these filters"
            description="Try widening your filters — new roles are posted as organisations share them with TSC."
          />
        ) : (
          <StaggerGrid className="grid gap-6 lg:grid-cols-2">
            {items.map((o) => (
              <StaggerItem key={o.id}>
                <OpportunityCard opportunity={o} />
              </StaggerItem>
            ))}
          </StaggerGrid>
        )}
      </div>
    </>
  );
}
