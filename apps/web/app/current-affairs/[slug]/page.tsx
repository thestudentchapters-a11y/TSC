import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ChevronRight, FileDown, ExternalLink } from 'lucide-react';
import { PageHeader, DemoNotice } from '@/components/common/PageHeader';
import { ShareButtons } from '@/components/common/ShareButtons';
import { Reveal } from '@/components/common/Reveal';
import { InteractiveEditionReader } from '@/components/current-affairs/InteractiveEditionReader';
import { getEditionBySlug, getEditions } from '@/lib/data';
import { slugify } from '@/lib/utils';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

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
      <PageHeader eyebrow="Monthly Current Affairs Dossier" title={edition.title}>
        <div className="flex flex-wrap gap-1.5">
          {edition.topics.map((t) => (
            <span
              key={t}
              className="rounded-full border border-brand/25 bg-brand-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-brand"
            >
              {t}
            </span>
          ))}
        </div>
        <nav aria-label="Breadcrumb" className="mt-6">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-muted">
            <li>
              <Link href="/" className="hover:text-brand">
                Home
              </Link>
            </li>
            <li aria-hidden>
              <ChevronRight className="h-3 w-3" />
            </li>
            <li>
              <Link href="/current-affairs" className="hover:text-brand">
                Current Affairs
              </Link>
            </li>
            <li aria-hidden>
              <ChevronRight className="h-3 w-3" />
            </li>
            <li className="text-ink/70" aria-current="page">
              {edition.month} {edition.year}
            </li>
          </ol>
        </nav>
      </PageHeader>

      <section className="section-pad">
        <div className="container-tsc grid gap-12 lg:grid-cols-12 items-start">
          {/* Main Full Articles Reader */}
          <div className="lg:col-span-8 lg:order-2">
            <DemoNotice className="mb-8" />
            <InteractiveEditionReader
              articles={edition.articles}
              pdfUrl={edition.pdfUrl}
              editionSlug={edition.slug}
            />
          </div>

          {/* Sticky Sidebar */}
          <aside className="space-y-6 lg:col-span-4 lg:order-1 lg:sticky lg:top-24 lg:self-start">
            <Reveal>
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-hairline shadow-lift">
                <Image
                  src={edition.cover}
                  alt={edition.coverAlt}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
            </Reveal>

            {/* Quick PDF Action Card */}
            <div className="card-base p-4 bg-brand-50/50 border-brand/20 space-y-2.5">
              <p className="font-display text-[11px] font-bold uppercase tracking-wider text-brand flex items-center gap-1.5">
                <FileDown className="h-3.5 w-3.5" /> Printable Dossier
              </p>
              <div className="grid grid-cols-1 gap-2">
                <a
                  href={`/current-affairs/${edition.slug}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-base border border-brand/30 bg-white text-brand hover:bg-brand hover:text-white flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-md shadow-xs transition"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Open PDF in New Tab
                </a>
                <a
                  href={`/current-affairs/${edition.slug}/pdf?download=true`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-base btn-primary flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-md shadow-xs transition"
                >
                  <FileDown className="h-3.5 w-3.5" /> Download PDF
                </a>
              </div>
            </div>

            <div className="card-base p-5">
              <p className="eyebrow">Editorial Introduction</p>
              <p className="mt-2 font-serif text-[15px] italic leading-7 text-ink/80">{edition.intro}</p>
              <div className="mt-5 border-t border-hairline pt-5">
                <ShareButtons title={edition.title} path={`/current-affairs/${edition.slug}`} />
              </div>
            </div>

            {others.length > 0 && (
              <div className="card-base p-5">
                <h3 className="font-display text-sm font-bold uppercase tracking-[0.14em]">Other Editions</h3>
                <ul className="mt-4 space-y-3">
                  {others.map((o) => (
                    <li key={o.id}>
                      <Link
                        href={`/current-affairs/${o.slug}`}
                        className="group flex items-center justify-between gap-3 text-sm font-medium hover:text-brand"
                      >
                        <span className="cta-underline text-brand">
                          {o.month} {o.year}
                        </span>
                        <ChevronRight
                          aria-hidden
                          className="h-4 w-4 text-muted transition-transform group-hover:translate-x-1"
                        />
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
