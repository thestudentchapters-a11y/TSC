import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getEditionBySlug } from '@/lib/data';
import { PdfActionBar } from '@/components/current-affairs/PdfActionBar';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

type Props = { params: { slug: string }; searchParams?: { download?: string; print?: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ed = await getEditionBySlug(params.slug);
  if (!ed) return { title: 'PDF Dossier Not Found — TSC' };
  return {
    title: `${ed.title} (PDF Dossier) — The Student Chapters`,
    description: `Official PDF Monthly Dossier for ${ed.month} ${ed.year}. High-yield current affairs, policy analysis, and student insights.`,
  };
}

export default async function EditionPdfPage({ params, searchParams }: Props) {
  const edition = await getEditionBySlug(params.slug);
  if (!edition) notFound();

  const autoPrint = searchParams?.download === 'true' || searchParams?.print === 'true';

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 print:bg-white print:text-black">
      {/* Client Action Bar (Hidden in Print) */}
      <PdfActionBar
        title={`${edition.month} ${edition.year} Dossier`}
        editionSlug={edition.slug}
        autoPrint={autoPrint}
      />

      {/* Main Print Document Canvas */}
      <main className="mx-auto max-w-4xl bg-white p-4 sm:p-8 md:p-12 my-3 sm:my-6 md:my-10 shadow-xl print:shadow-none print:m-0 print:p-6 print:max-w-none rounded-lg sm:rounded-xl print:rounded-none border border-slate-200 print:border-none">
        
        {/* Document Header / Masthead */}
        <header className="border-b-2 border-brand pb-5 sm:pb-6 mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative h-12 w-12 shrink-0">
              <Image
                src="/TSC Logo.png"
                alt="TSC Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div>
              <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-brand">
                The Student Chapters • Official Dossier
              </p>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">
                Current Affairs — {edition.month} {edition.year}
              </h1>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-block rounded bg-gold px-3 py-1 font-display text-xs font-bold text-ink uppercase tracking-wider">
              Monthly Edition
            </span>
            <p className="mt-1 text-[11px] text-slate-500">
              Published: {edition.month} 2026
            </p>
          </div>
        </header>

        {/* Editorial Overview Section */}
        <section className="mb-8 rounded-lg bg-amber-50/70 p-5 border-l-4 border-gold">
          <h2 className="font-display text-xs font-bold uppercase tracking-[0.14em] text-gold-deep mb-1.5">
            Editorial Note &amp; Context
          </h2>
          <p className="font-serif text-[14px] italic leading-relaxed text-slate-800">
            {edition.intro}
          </p>
        </section>

        {/* Table of Topics */}
        <div className="mb-10 flex flex-wrap gap-2 border-y border-slate-200 py-3">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider self-center mr-2">
            Coverage:
          </span>
          {edition.topics.map((t, idx) => (
            <span
              key={t}
              className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 border border-slate-200"
            >
              0{idx + 1}. {t}
            </span>
          ))}
        </div>

        {/* 5 Pillar Articles Breakdown */}
        <div className="space-y-10">
          {edition.articles.map((a, i) => {
            const bullets =
              a.content && a.content.length > 0
                ? a.content
                : [
                    `Key Policy & Regulatory Context: This month's updates in ${a.category} establish new frameworks directly impacting student academics and campus transitions.`,
                    `Institutional & Real-world Implementation: Universities, industry leaders, and administrative boards are standardizing procedures to ensure transparent credit recognition and experiential training.`,
                    `Student & Career Outlook: Understanding these shifts provides students and competitive exam aspirants with a critical strategic edge in interviews, fellowships, and academic planning.`
                  ];

            return (
              <article
                key={a.title}
                className="break-inside-avoid border-b border-slate-200 pb-8 last:border-b-0"
              >
                {/* Article Header */}
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded bg-gold font-display text-[11px] font-bold text-ink">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="rounded bg-brand/10 px-2.5 py-0.5 font-display text-[11px] font-bold uppercase tracking-wider text-brand">
                      {a.category}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    {a.readingTime} min read
                  </span>
                </div>

                <h3 className="font-display text-lg sm:text-xl font-bold text-ink mb-3 leading-snug">
                  {a.title}
                </h3>

                {/* Executive Summary */}
                <div className="mb-4 rounded bg-slate-50 p-3.5 border-l-2 border-brand text-[13px] leading-relaxed text-slate-700">
                  <strong className="text-brand font-semibold block text-[11px] uppercase tracking-wider mb-1">
                    Summary Overview:
                  </strong>
                  {a.summary}
                </div>

                {/* Key Takeaways */}
                {a.keyPoints && a.keyPoints.length > 0 && (
                  <div className="mb-4 rounded-md bg-emerald-50/60 p-3.5 border border-emerald-100">
                    <h4 className="font-display text-[11px] font-bold uppercase tracking-wider text-emerald-800 mb-2">
                      Key Developments &amp; Takeaways:
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-800">
                      {a.keyPoints.map((pt, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-600 shrink-0" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Bulleted In-Depth Analysis */}
                <div className="mt-3">
                  <h4 className="font-display text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-2">
                    In-Depth Analysis &amp; Student Impact:
                  </h4>
                  <ul className="space-y-2 text-xs leading-relaxed text-slate-800">
                    {bullets.map((b, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2.5">
                        <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[9px] font-bold text-slate-700">
                          {bIdx + 1}
                        </span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>

        {/* Document Footer */}
        <footer className="mt-12 pt-6 border-t-2 border-slate-200 text-center text-xs text-slate-500">
          <p className="font-semibold text-slate-700">
            The Student Chapters (TSC) • All India Student News &amp; Policy Network
          </p>
          <p className="mt-1 text-[11px]">
            Generated directly from the official TSC Digital Archives. For interactive discussion and web edition, visit thestudentchapters.org
          </p>
        </footer>
      </main>
    </div>
  );
}
