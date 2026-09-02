import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Reveal } from '@/components/common/Reveal';
import { getCampaign } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Campaigns — TSC Originals',
  description:
    'TSC original campaigns, starting with the All India Career Awareness Youth Documentary Series — Real Careers. Real People. Real Possibilities.',
  alternates: { canonical: '/campaigns' },
};

export const revalidate = 300;

export default async function CampaignsPage() {
  const campaign = await getCampaign();

  return (
    <>
      <PageHeader
        eyebrow="TSC Original Campaigns"
        title="Campaigns That Take Students Into the Real World."
        description="TSC builds campaigns that go beyond content — on-ground, on-camera and online. Here is what we are building right now."
      />

      <section className="section-pad">
        <div className="container-tsc">
          <Reveal>
            <Link
              href={`/campaigns/${campaign.slug}`}
              className="card-base card-hover group grid overflow-hidden lg:grid-cols-2"
            >
              <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-[360px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={campaign.stills[0].image} alt={campaign.stills[0].alt} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <span className="absolute left-4 top-4 rounded-[4px] bg-gold px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-[0.16em] text-ink">
                  Flagship Campaign
                </span>
              </div>
              <div className="flex flex-col justify-center gap-4 p-6 sm:p-10">
                <p className="eyebrow !text-gold-deep">{campaign.eyebrow}</p>
                <h2 className="font-display text-2xl font-bold leading-tight transition-colors group-hover:text-brand sm:text-3xl">
                  All India Career Awareness
                  <span className="block text-gold">Youth Documentary Series</span>
                </h2>
                <p className="font-serif text-lg italic text-brand">{campaign.headline}</p>
                <p className="line-clamp-3 text-[14px] leading-7 text-muted">{campaign.description}</p>
                <span className="mt-2 inline-flex items-center gap-2 font-display text-[12px] font-bold uppercase tracking-[0.14em] text-brand">
                  <span className="cta-underline">Explore the Series</span>
                  <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                </span>
              </div>
            </Link>
          </Reveal>

          <p className="mt-8 text-center text-sm italic text-muted">
            More campaigns are in development — announced first in the TSC community.
          </p>
        </div>
      </section>
    </>
  );
}
