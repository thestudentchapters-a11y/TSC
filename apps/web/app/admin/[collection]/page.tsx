'use client';

import { CollectionManager } from '@/components/admin/CollectionManager';
import { collections } from '@/lib/admin-collections';

/**
 * Generic collection admin route.
 * Sidebar aliases: /admin/jobs, /admin/internships, /admin/fellowships map to
 * the opportunities collection with a preset type filter.
 */
export default function AdminCollectionPage({ params }: { params: { collection: string } }) {
  const collection = params.collection;
  const key =
    collection === 'jobs' || collection === 'internships' || collection === 'fellowships'
      ? 'opportunities'
      : collection;
  const def = collections[key];
  const preset =
    collection === 'jobs'
      ? { type: 'Job' }
      : collection === 'internships'
        ? { type: 'Internship' }
        : collection === 'fellowships'
          ? { type: 'Fellowship' }
          : undefined;

  const label =
    collection === 'jobs'
      ? 'Jobs'
      : collection === 'internships'
        ? 'Internships'
        : collection === 'fellowships'
          ? 'Fellowships'
          : def?.title ?? collection;

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow">Manage</p>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight">{label}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          {preset
            ? `Create, edit and retire ${label.toLowerCase()} — every change respects the draft → publish workflow.`
            : def?.description ?? 'Manage this content type.'}
        </p>
      </div>
      <CollectionManager collectionKey={key} presetFilter={preset} />
    </div>
  );
}
