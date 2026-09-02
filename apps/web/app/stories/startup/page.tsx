import type { Metadata } from 'next';
import StoriesCategoryView from '../StoriesCategoryView';

export const metadata: Metadata = {
  title: 'Startup Stories',
  description: 'Young founders, student entrepreneurs and ideas turning into businesses.',
  alternates: { canonical: '/stories/startup' },
};

export const revalidate = 120;

export default async function StartupStoriesPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  return <StoriesCategoryView category="startup" q={searchParams.q} />;
}
