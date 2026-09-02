import type { Metadata } from 'next';
import { PageHeader } from '@/components/common/PageHeader';
import OpportunityListing from '@/components/career/OpportunityListing';

export const metadata: Metadata = {
  title: 'Jobs — Early-Career Opportunities',
  description: 'Discover jobs and early-career opportunities for students and young professionals.',
  alternates: { canonical: '/career/jobs' },
};

export const revalidate = 120;

export default async function JobsPage({
  searchParams,
}: {
  searchParams: { type?: string; mode?: string; location?: string; sort?: string };
}) {
  return (
    <>
      <PageHeader
        eyebrow="Career / Jobs"
        title="Jobs & Early-Career Opportunities"
        description="Discover jobs and early-career opportunities for students and young professionals. Filter by work mode and location, and sort by closing deadline."
      />
      <section className="section-pad">
        <div className="container-tsc">
          <OpportunityListing basePath="/career/jobs" lockedType="Job" searchParams={searchParams} />
        </div>
      </section>
    </>
  );
}
