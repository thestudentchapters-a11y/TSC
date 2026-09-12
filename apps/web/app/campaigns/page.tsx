import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Film, MapPin } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Reveal, StaggerGrid, StaggerItem } from '@/components/common/Reveal';
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
  const publishedCampaigns = allCampaigns.filter((c) => c.status !== 'archived');
  const flagship =
    publishedCampaigns.find((c) => c.slug === 'all-india-career-awareness') ||
    publishedCampaigns[0];
  const others = publishedCampaigns.filter((c) => c.slug !== flagship?.slug);

  return (
    <>
      <PageHeader
        eyebrow="TSC Original Campaigns"
        title="Campaigns That Take Students Into the Real World."
        description="TSC builds campaigns that go beyond content — on-ground, on-camera and online. Here is what we are building right now."
      />

      <section className="section-pad">
        <div className="container-tsc">
          {flagship && (
            <Reveal>
              <Link
                href={`/campaigns/${flagship.slug}`}
                className="card-base card-hover group grid overflow-hidden lg:grid-cols-2"
              >
                <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-[360px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={flagship.stills?.[0]?.image || '/images/campaign/campaign-1.jpg'}
                    alt={flagship.stills?.[0]?.alt || flagship.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="absolute left-4 top-4 rounded-[4px] bg-gold px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-[0.16em] text-ink shadow-sm">
                    {flagship.featured ? 'Flagship Campaign' : 'Featured Campaign'}
                  </span>
                </div>
                <div className="flex flex-col justify-center gap-4 p-6 sm:p-10">
                  <p className="eyebrow !text-gold-deep">{flagship.eyebrow || 'TSC ORIGINAL CAMPAIGN'}</p>
                  <h2 className="font-display text-2xl font-bold leading-tight transition-colors group-hover:text-brand sm:text-3xl">
                    {flagship.title}
                  </h2>
                  <p className="font-serif text-lg italic text-brand">{flagship.headline}</p>
                  <p className="line-clamp-3 text-[14px] leading-7 text-muted">{flagship.description}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 font-display text-[12px] font-bold uppercase tracking-[0.14em] text-brand">
                      <span className="cta-underline">Explore the Series</span>
                      <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-cream px-3 py-1 text-[11px] font-medium text-muted">
                      <Film className="h-3 w-3 text-brand" />
                      {flagship.episodes?.length || 0} Episodes
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          )}

          {/* Other Campaigns Grid */}
          {others.length > 0 && (
            <div className="mt-14 border-t border-hairline pt-10">
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-bold tracking-tight">More Original Campaigns</h2>
                  <p className="mt-1 text-sm text-muted">Explore our full roster of youth and campus initiatives.</p>
                </div>
              </div>

              <StaggerGrid className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {others.map((camp) => (
                  <StaggerItem key={camp.slug}>
                    <Link
                      href={`/campaigns/${camp.slug}`}
                      className="card-base card-hover group flex h-full flex-col overflow-hidden text-inherit no-underline"
                    >
                      <div className="relative aspect-video overflow-hidden bg-ink/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={camp.stills?.[0]?.image || '/images/campaign/campaign-2.jpg'}
                          alt={camp.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <span className="absolute left-3 top-3 rounded-[4px] bg-brand-dark/95 px-2 py-1 font-display text-[10px] font-bold uppercase tracking-[0.14em] text-gold shadow-sm">
                          {camp.eyebrow || 'Campaign'}
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <h3 className="font-display text-lg font-bold transition-colors group-hover:text-brand">
                          {camp.title}
                        </h3>
                        <p className="mt-1 font-serif text-sm italic text-brand">{camp.headline}</p>
                        <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-muted">
                          {camp.description}
                        </p>
                        <div className="mt-auto flex items-center justify-between border-t border-hairline/60 pt-3 text-[11px] font-medium uppercase tracking-wider text-muted">
                          <span className="flex items-center gap-1">
                            <Film className="h-3 w-3 text-brand" />
                            {camp.episodes?.length || 0} Episodes
                          </span>
                          <span className="cta-underline font-bold text-brand">View Series &rarr;</span>
                        </div>
                      </div>
                    </Link>
                  </StaggerItem>
                ))}
              </StaggerGrid>
            </div>
          )}

          <p className="mt-12 text-center text-sm italic text-muted">
            More campaigns are in development — announced first in the TSC community.
          </p>
        </div>
      </section>
    </>
  );
}
