import type { Metadata } from 'next';
import { PageHeader } from '@/components/common/PageHeader';
import OpportunityListing from '@/components/career/OpportunityListing';

export const metadata: Metadata = {
  title: 'Fellowships — Programmes for Young People',
  description: 'Discover fellowships, programmes and opportunities designed to help young people grow.',
  alternates: { canonical: '/career/fellowships' },
};

export const revalidate = 120;

export default async function FellowshipsPage({
  searchParams,
}: {
  searchParams: { type?: string; mode?: string; location?: string; sort?: string };
}) {
  return (
    <>
      <PageHeader
        eyebrow="Career / Fellowships"
        title="Fellowships, Programmes & Scholarships"
        description="Discover fellowships, programmes and opportunities designed to help young people grow. Filter by work mode and location, and sort by closing deadline."
      />
      <section className="section-pad">
        <div className="container-tsc">
          <OpportunityListing basePath="/career/fellowships" lockedType="Fellowship" searchParams={searchParams} />
        </div>
      </section>
    </>
  );
}
