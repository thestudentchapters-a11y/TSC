import type { Metadata } from 'next';
import { PageHeader } from '@/components/common/PageHeader';
import OpportunityListing from '@/components/career/OpportunityListing';

export const metadata: Metadata = {
  title: 'Internships — Practical Experience',
  description: 'Gain practical experience, build your skills and understand the world of work.',
  alternates: { canonical: '/career/internships' },
};

export const revalidate = 120;

export default async function InternshipsPage({
  searchParams,
}: {
  searchParams: { type?: string; mode?: string; location?: string; sort?: string };
}) {
  return (
    <>
      <PageHeader
        eyebrow="Career / Internships"
        title="Internships That Teach What Classrooms Can't"
        description="Gain practical experience, build your skills and understand the world of work. Filter by work mode and location, and sort by closing deadline."
      />
      <section className="section-pad">
        <div className="container-tsc">
          <OpportunityListing basePath="/career/internships" lockedType="Internship" searchParams={searchParams} />
        </div>
      </section>
    </>
  );
}
