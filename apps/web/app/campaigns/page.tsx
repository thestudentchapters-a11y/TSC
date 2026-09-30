import type { Metadata } from 'next';
import { PageHeader } from '@/components/common/PageHeader';
import { CampaignsListView } from '@/components/campaign/CampaignsListView';
import { getCampaigns } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Campaigns — TSC Originals',
  description:
    'TSC original campaigns, starting with the All India Career Awareness Youth Documentary Series — Real Careers. Real People. Real Possibilities.',
  alternates: { canonical: '/campaigns' },
};

export const revalidate = 60;

export default async function CampaignsPage() {
  const allCampaigns = await getCampaigns();

  return (
    <>
      <PageHeader
        eyebrow="TSC Original Campaigns"
        title="Campaigns That Take Students Into the Real World."
        description="TSC builds campaigns that go beyond content — on-ground, on-camera and online. Here is what we are building right now."
      />

      <section className="section-pad">
        <CampaignsListView initialCampaigns={allCampaigns} />
      </section>
    </>
  );
}
