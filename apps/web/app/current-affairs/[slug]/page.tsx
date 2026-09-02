import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ChevronRight, Clock, FileDown } from 'lucide-react';
import { PageHeader, DemoNotice } from '@/components/common/PageHeader';
import { ShareButtons } from '@/components/common/ShareButtons';
import { Reveal } from '@/components/common/Reveal';
import { getEditionBySlug, getEditions } from '@/lib/data';
import { site } from '@/lib/site';

export const revalidate = 300;

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ed = await getEditionBySlug(params.slug);
  if (!ed) return { title: 'Edition not found' };
  return {
    title: ed.title,
    description: ed.intro,
    alternates: { canonical: `/current-affairs/${ed.slug}` },
    openGraph: { title: ed.title, description: ed.intro, images: [{ url: ed.cover, alt: ed.coverAlt }] },
  };
}

export default async function EditionPage({ params }: Props) {
  const edition = await getEditionBySlug(params.slug);
  if (!edition) notFound();

  const others = (await getEditions()).filter((e) => e.id !== edition.id);

  return (
    <>
      <PageHeader eyebrow="Monthly Current Affairs" title={edition.title}>
        <div className="flex flex-wrap gap-1.5">
          {edition.topics.map((t) => (
            <span key={t} className="rounded-full border border-brand/25 bg-brand-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-brand">
              {t}
            </span>
          ))}
        </div>
        <nav aria-label="Breadcrumb" className="mt-6">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-muted">
            <li><Link href="/" className="hover:text-brand">Home</Link></li>
            <li aria-hidden><ChevronRight className="h-3 w-3" /></li>
            <li><Link href="/current-affairs" className="hover:text-brand">Current Affairs</Link></li>
            <li aria-hidden><ChevronRight className="h-3 w-3" /></li>
            <li className="text-ink/70" aria-current="page">{edition.month} {edition.year}</li>
          </ol>
        </nav>
      </PageHeader>

      <section className="section-pad">
        <div className="container-tsc grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7 lg:order-2">
            <DemoNotice className="mb-8" />
            <h2 className="font-display text-xl font-bold">In this edition</h2>
            <div className="mt-6 space-y-4">
              {edition.articles.map((a, i) => (
                <Reveal key={a.title} delay={i * 0.06}>
                  <article className="card-base card-hover flex items-start gap-4 p-5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] bg-gold font-display text-sm font-bold text-ink">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand">{a.category}</p>
                      <h3 className="mt-1 font-display text-[16px] font-bold leading-snug">{a.title}</h3>
                      <p className="mt-1.5 text-[13.5px] leading-6 text-muted">{a.summary}</p>
                      <p className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-muted">
                        <Clock aria-hidden className="h-3 w-3 text-gold-deep" /> {a.readingTime} min read
                      </p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>

            <div className="mt-8 rounded-md border border-dashed border-hairline bg-white px-5 py-4">
              <p className="flex items-center gap-2 text-[13px] font-semibold text-muted">
                <FileDown aria-hidden className="h-4 w-4 text-brand" />
                Downloadable PDF for this edition will be available here once configured by the editorial team.
              </p>
            </div>
          </div>

          <aside className="space-y-6 lg:col-span-5 lg:order-1">
            <Reveal>
              <div className="relative aspect-[4/5] overflow-hidden rounded-md">
                <Image src={edition.cover} alt={edition.coverAlt} fill priority sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" />
              </div>
            </Reveal>
            <div className="card-base p-5">
              <p className="font-serif text-[15px] italic leading-7 text-ink/80">{edition.intro}</p>
              <div className="mt-5 border-t border-hairline pt-5">
                <ShareButtons title={edition.title} path={`/current-affairs/${edition.slug}`} />
              </div>
            </div>
            {others.length > 0 && (
              <div className="card-base p-5">
                <h3 className="font-display text-sm font-bold uppercase tracking-[0.14em]">Other editions</h3>
                <ul className="mt-4 space-y-3">
                  {others.map((o) => (
                    <li key={o.id}>
                      <Link href={`/current-affairs/${o.slug}`} className="group flex items-center justify-between gap-3 text-sm font-medium">
                        <span className="cta-underline text-brand">{o.month} {o.year}</span>
                        <ChevronRight aria-hidden className="h-4 w-4 text-muted transition-transform group-hover:translate-x-1" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </section>
    </>
  );
}
