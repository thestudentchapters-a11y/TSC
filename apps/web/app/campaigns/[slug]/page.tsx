import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/common/PageHeader';
import { CampaignDocumentariesView } from '@/components/campaign/CampaignDocumentariesView';
import { getCampaignBySlug, getCampaigns } from '@/lib/data';

export const revalidate = 60;

export async function generateStaticParams() {
  const campaigns = await getCampaigns();
  return campaigns.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const campaign = await getCampaignBySlug(params.slug);
  if (!campaign) {
    return { title: 'Campaign Not Found — TSC' };
  }
  return {
    title: `${campaign.title} — TSC Campaigns`,
    description: campaign.headline || campaign.description,
    alternates: { canonical: `/campaigns/${campaign.slug}` },
  };
}

export default async function DynamicCampaignPage({
  params,
}: {
  params: { slug: string };
}) {
  const campaign = await getCampaignBySlug(params.slug);
  if (!campaign) {
    notFound();
  }

  return (
    <>
      <PageHeader
        compact
        dark
        eyebrow={campaign.eyebrow || 'Campaigns • Nationwide'}
        title={campaign.title}
      >
        <p className="font-serif text-xl italic text-cream sm:text-2xl">
          {campaign.headline || 'Real Careers. Real People. Real Possibilities.'}
        </p>
      </PageHeader>

      <CampaignDocumentariesView initialCampaign={campaign} showBackLink={true} />
    </>
  );
}
