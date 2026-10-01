import type { Metadata } from 'next';
import { PageHeader } from '@/components/common/PageHeader';
import { CampaignDocumentariesView } from '@/components/campaign/CampaignDocumentariesView';
import { getCampaignBySlug } from '@/lib/data';
import { flagshipCampaign } from '@/data/content';

export const metadata: Metadata = {
  title: 'All India Career Awareness Youth Documentary Series',
  description:
    'Real Careers. Real People. Real Possibilities. A TSC original documentary series taking students beyond generic career advice and into the real world.',
  alternates: { canonical: '/campaigns/all-india-career-awareness' },
};

export const revalidate = 60;

export default async function CampaignPage() {
  const campaign = (await getCampaignBySlug('all-india-career-awareness')) || flagshipCampaign;

  return (
    <>
      <PageHeader
        dark
        eyebrow={campaign?.eyebrow || 'Campaigns • Nationwide'}
        title={
          <>
            All India Career Awareness
            <span className="mt-1 block text-gold">Youth Documentary Series</span>
          </>
        }
      >
        <p className="font-serif text-xl italic text-cream sm:text-2xl">
          {campaign?.headline || 'Real Careers. Real People. Real Possibilities.'}
        </p>
      </PageHeader>

      <CampaignDocumentariesView initialCampaign={campaign} showBackLink={false} />
    </>
  );
}
