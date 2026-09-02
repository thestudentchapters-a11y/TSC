import type { Metadata } from 'next';
import StoriesCategoryView from '../StoriesCategoryView';

export const metadata: Metadata = {
  title: 'Campus Stories',
  description: "What's happening inside India's colleges and universities.",
  alternates: { canonical: '/stories/campus' },
};

export const revalidate = 120;

export default async function CampusStoriesPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  return <StoriesCategoryView category="campus" q={searchParams.q} />;
}
