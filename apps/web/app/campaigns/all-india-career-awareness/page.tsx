import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Play } from 'lucide-react';
import { PageHeader, DemoNotice } from '@/components/common/PageHeader';
import { StaggerGrid, StaggerItem, Reveal } from '@/components/common/Reveal';
import { Button } from '@/components/common/Button';
import { getCampaign } from '@/lib/data';

export const metadata: Metadata = {
  title: 'All India Career Awareness Youth Documentary Series',
  description:
    'Real Careers. Real People. Real Possibilities. A TSC original documentary series taking students beyond generic career advice and into the real world.',
  alternates: { canonical: '/campaigns/all-india-career-awareness' },
};

export const revalidate = 300;

export default async function CampaignPage() {
  const campaign = await getCampaign();
  const episodes = campaign?.episodes ?? [];
  const released = episodes.filter((e) => e.status === 'Released');
  const upcoming = episodes.filter((e) => e.status === 'Coming Soon');

  return (
    <>
      <PageHeader dark eyebrow={campaign?.eyebrow || 'Campaigns • Nationwide'} title={
        <>
          All India Career Awareness
          <span className="mt-1 block text-gold">Youth Documentary Series</span>
        </>
      }>
        <p className="font-serif text-xl italic text-cream sm:text-2xl">{campaign?.headline || 'Real Careers. Real People. Real Possibilities.'}</p>
      </PageHeader>

      <section className="section-pad">
        <div className="container-tsc">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <DemoNotice className="mb-8" />
              <p className="text-[15px] leading-8 text-muted">{campaign.description}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button href="#episodes" size="lg" arrow>
                  Explore the Series
                </Button>
                <span className="relative inline-flex">
                  <span aria-hidden className="absolute inset-0 animate-play-pulse rounded-[4px] bg-gold/60" />
                  <Button href="#episodes" variant="accent" size="lg" className="relative">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ink text-gold">
                      <Play aria-hidden className="ml-0.5 h-2.5 w-2.5 fill-current" />
                    </span>
                    Watch Documentaries
                  </Button>
                </span>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 lg:col-span-5">
              {(campaign?.stills ?? []).map((s, i) => (
                <Reveal key={s.image} delay={i * 0.1}>
                  <div className="group relative overflow-hidden rounded-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.image} alt={s.alt} className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-3 text-[10px] font-bold uppercase tracking-[0.16em] text-cream">
                      Behind the scenes {String(i + 1).padStart(2, '0')}
                    </figcaption>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* categories & locations */}
          <div className="mt-14 grid gap-8 border-t border-hairline pt-10 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-sm font-bold uppercase tracking-[0.18em] text-brand">Career categories covered</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {(campaign?.categories ?? []).map((c) => (
                  <span key={c} className="rounded-full border border-hairline bg-white px-3.5 py-2 text-[12px] font-bold uppercase tracking-[0.08em] text-ink/70">
                    {c}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h2 className="font-display text-sm font-bold uppercase tracking-[0.18em] text-brand">Filmed across India</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {(campaign?.locations ?? []).map((l) => (
                  <span key={l} className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand-50 px-3.5 py-2 text-[12px] font-bold text-brand">
                    <MapPin aria-hidden className="h-3 w-3" /> {l}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* episodes */}
          <div id="episodes" className="mt-16 scroll-mt-24 border-t border-hairline pt-12">
            <h2 className="font-display text-2xl font-bold tracking-tight">Documentary Episodes</h2>
            <p className="mt-2 max-w-2xl text-[14px] leading-6 text-muted">
              Professionals, entrepreneurs, creators and specialists — real people, real careers, real
              possibilities. [Demo episode listings — video embeds are configured by the editorial team.]
            </p>
            <StaggerGrid className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(campaign?.episodes ?? []).map((ep) => (
                <StaggerItem key={ep.id}>
                  <article className="card-base card-hover group flex h-full flex-col overflow-hidden">
                    <div className="relative aspect-video overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={ep.image} alt={ep.imageAlt} className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${ep.status === 'Coming Soon' ? 'grayscale-[35%]' : ''}`} />
                      <span className="absolute left-3 top-3 rounded-[4px] bg-brand-dark/95 px-2 py-1 font-display text-[10px] font-bold uppercase tracking-[0.14em] text-gold">
                        Episode {String(ep.episodeNumber).padStart(2, '0')}
                      </span>
                      {ep.status === 'Released' ? (
                        <span aria-hidden className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-gold text-ink shadow-lift transition-transform duration-300 group-hover:scale-110">
                          <Play className="ml-0.5 h-4 w-4 fill-current" />
                        </span>
                      ) : (
                        <span className="absolute bottom-3 right-3 rounded-full bg-ink/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-cream">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-5">
                      <h3 className="font-display text-lg font-bold">{ep.title}</h3>
                      <p className="text-[12px] font-semibold uppercase tracking-wider text-brand">
                        {ep.profession} • <span className="text-muted">{ep.location}</span>
                      </p>
                      <p className="text-[13.5px] leading-6 text-muted">{ep.description}</p>
                      <p className="mt-auto pt-2 text-[11px] font-medium uppercase tracking-wider text-muted">
                        {ep.professional} • {ep.durationLabel}
                      </p>
                    </div>
                  </article>
                </StaggerItem>
              ))}
            </StaggerGrid>
          </div>

          {/* featured professionals */}
          <div className="mt-16 border-t border-hairline pt-12">
            <h2 className="font-display text-2xl font-bold tracking-tight">Professionals featured</h2>
            <StaggerGrid className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(campaign?.episodes ?? []).map((ep) => (
                <StaggerItem key={ep.id}>
                  <div className="flex items-center gap-4 rounded-md border border-hairline bg-white p-4">
                    <span aria-hidden className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 font-display text-sm font-bold text-brand">
                      {String(ep.episodeNumber).padStart(2, '0')}
                    </span>
                    <div>
                      <p className="font-display text-[14px] font-bold">{ep.title.replace('The ', '')}</p>
                      <p className="text-[12px] text-muted">{ep.profession} — {ep.professional}</p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGrid>
          </div>

          {/* related career resources */}
          <div className="mt-16 grid gap-4 rounded-md bg-brand-50 p-8 sm:grid-cols-3">
            {[
              { title: 'Career Awareness Hub', desc: 'Explore career fields beyond the obvious choices.', href: '/career/careers' },
              { title: 'Career Conversations', desc: 'Podcast episodes with professionals across industries.', href: '/podcast?category=Career%20Conversations' },
              { title: 'Career Events', desc: 'Workshops and sessions happening near you.', href: '/events?category=Career' },
            ].map((r) => (
              <Link key={r.href} href={r.href} className="group rounded-md bg-white p-5 shadow-card transition-transform hover:-translate-y-1">
                <p className="font-display text-[15px] font-bold transition-colors group-hover:text-brand">{r.title}</p>
                <p className="mt-1.5 text-[13px] leading-5 text-muted">{r.desc}</p>
                <span className="cta-underline mt-3 inline-block font-display text-[11px] font-bold uppercase tracking-[0.14em] text-brand">Visit</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
