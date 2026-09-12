'use client';

import { SingleCampusAdmin } from '@/components/admin/SingleCampusAdmin';

export default function AdminSingleCampusPage({
  params,
}: {
  params: { slug: string };
}) {
  return <SingleCampusAdmin slug={params.slug} />;
}
