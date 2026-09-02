import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { FileDown, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { StaggerGrid, StaggerItem } from '@/components/common/Reveal';
import { getEditions } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Monthly Current Affairs — Understand the World Beyond Your Campus',
  description:
    "The world changes every day. Our monthly current affairs edition brings together important developments across India and the world — explained in a way that's relevant and easy to understand.",
  alternates: { canonical: '/current-affairs' },
};

export const revalidate = 300;

export default async function CurrentAffairsPage() {
  const editions = await getEditions();

  return (
    <>
      <PageHeader
        eyebrow="05 — Know More"
        title="Understand the World Beyond Your Campus."
        description="The world changes every day. Staying informed shouldn't mean scrolling through hundreds of headlines. Our monthly current affairs edition brings together important developments across India and the world — explained in a way that's relevant and easy to understand."
      />

      <section className="section-pad">
        <div className="container-tsc">
          <StaggerGrid className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {editions.map((ed) => (
              <StaggerItem key={ed.id}>
                <Link href={`/current-affairs/${ed.slug}`} className="card-base card-hover group flex h-full flex-col overflow-hidden">
                  <div className="relative aspect-[4/5] sm:aspect-[4/4.4]">
                    <Image src={ed.cover} alt={ed.coverAlt} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    <span className="absolute right-3 top-3 rounded-[4px] bg-gold px-2.5 py-1 font-display text-[10px] font-bold uppercase tracking-[0.14em] text-ink">
                      {ed.month} {ed.year}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <h2 className="font-display text-lg font-bold leading-snug transition-colors group-hover:text-brand">
                      {ed.title}
                    </h2>
                    <p className="line-clamp-2 text-[13.5px] leading-6 text-muted">{ed.intro}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {ed.topics.map((t) => (
                        <span key={t} className="rounded-full border border-hairline bg-cream px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-ink/60">
                          {t === 'Science & Technology' ? 'Sci-Tech' : t}
                        </span>
                      ))}
                    </div>
                    <span className="mt-auto inline-flex items-center gap-2 pt-2 font-display text-[11px] font-bold uppercase tracking-[0.14em] text-brand">
                      <span className="cta-underline">Read This Edition</span>
                      <ArrowRight aria-hidden className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerGrid>

          <p className="mt-10 flex items-center justify-center gap-2 text-xs italic text-muted">
            <FileDown aria-hidden className="h-3.5 w-3.5" />
            Every edition includes a downloadable PDF — enabled once the API and media storage are connected.
          </p>
        </div>
      </section>
    </>
  );
}
