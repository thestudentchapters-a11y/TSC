import type { Metadata } from 'next';
import StoriesCategoryView from '../StoriesCategoryView';

export const metadata: Metadata = {
  title: 'Student Stories',
  description: 'Personal journeys, achievements, challenges and experiences.',
  alternates: { canonical: '/stories/student' },
};

export const revalidate = 120;

export default async function StudentStoriesPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  return <StoriesCategoryView category="student" q={searchParams.q} />;
}
