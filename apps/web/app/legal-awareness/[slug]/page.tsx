import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, CheckCircle2, ChevronRight, Clock, Info, Scale, ShieldCheck } from 'lucide-react';
import { PageHeader, DemoNotice } from '@/components/common/PageHeader';
import { ShareButtons } from '@/components/common/ShareButtons';
import { CategoryPill } from '@/components/common/CategoryPill';
import { TextCTA } from '@/components/common/Button';
import { LegalDescription } from '@/components/legal/LegalDescription';
import { getLegalBySlug, getLegalArticles } from '@/lib/data';
import { formatDate } from '@/lib/utils';

export const revalidate = 60;

export async function generateStaticParams() {
  const articles = await getLegalArticles();
  return articles.slice(0, 30).map((a) => ({ slug: a.slug }));
}

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getLegalBySlug(params.slug);
  if (!article) return { title: 'Explainer not found' };
  return {
    title: `${article.title} — Legal Awareness`,
    description: article.summary,
    alternates: { canonical: `/legal-awareness/${article.slug}` },
  };
}

export default async function LegalArticlePage({ params }: Props) {
  const article = await getLegalBySlug(params.slug);
  if (!article) notFound();

  const allArticles = await getLegalArticles();
  const related = allArticles.filter((l) => l.id !== article.id && l.topic === article.topic).slice(0, 4);
  const otherArticles = allArticles.filter((l) => l.id !== article.id).slice(0, 3);

  return (
    <>
      <PageHeader compact eyebrow={`Legal Awareness / ${article.topic}`} title={article.title}>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium uppercase tracking-wider text-muted">
          <span className="inline-flex items-center gap-1">
            <Calendar aria-hidden className="h-3.5 w-3.5 text-brand" />
            {formatDate(article.date)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock aria-hidden className="h-3.5 w-3.5 text-brand" />
            {article.readingTime} min read
          </span>
          <CategoryPill variant="outline">{article.topic}</CategoryPill>
        </div>
        <nav aria-label="Breadcrumb" className="mt-6">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-muted">
            <li><Link href="/" className="hover:text-brand">Home</Link></li>
            <li aria-hidden><ChevronRight className="h-3 w-3" /></li>
            <li><Link href="/legal-awareness" className="hover:text-brand">Legal Awareness</Link></li>
            <li aria-hidden><ChevronRight className="h-3 w-3" /></li>
            <li className="text-ink/70" aria-current="page">{article.title}</li>
          </ol>
        </nav>
      </PageHeader>

      <section className="section-pad">
        <div className="container-tsc">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
            <div className="space-y-10 lg:col-span-8">
              <DemoNotice />

              {/* Main Content Display matching Campus Profile Description */}
              <LegalDescription
                content={article.content}
                summary={article.summary}
                topic={article.topic}
                title={article.title}
              />

              {/* Key Takeaways */}
              {article.keyPoints && article.keyPoints.length > 0 && (
                <div className="rounded-xl border border-brand/20 bg-brand-50/50 p-6 sm:p-7 shadow-xs">
                  <h3 className="flex items-center gap-2 font-display text-base font-bold text-ink">
                    <CheckCircle2 aria-hidden className="h-5 w-5 text-gold-deep" />
                    Key takeaways
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {article.keyPoints.map((k) => (
                      <li key={k} className="flex items-start gap-2.5 text-[16px] leading-relaxed text-ink/85">
                        <CheckCircle2 aria-hidden className="mt-1 h-4 w-4 shrink-0 text-gold-deep" />
                        <span>{k}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Disclaimer */}
              <p className="flex items-start gap-2.5 rounded-xl border border-gold/40 bg-gold-50/60 p-5 text-xs italic leading-5 text-ink/70">
                <Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" />
                <span>
                  Content is for general awareness and does not constitute legal advice. For specific situations,
                  consult a qualified legal professional or your institution&apos;s student affairs office.
                </span>
              </p>
            </div>

            <aside className="space-y-6 lg:col-span-4 lg:sticky lg:top-24 lg:self-start">
              {/* At a glance (matching campus profile sidebar) */}
              <div className="card-base p-5">
                <h3 className="font-display text-sm font-bold uppercase tracking-[0.14em]">At a glance</h3>
                <dl className="mt-4 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-2 text-muted">
                      <Scale aria-hidden className="h-4 w-4 text-brand" /> Domain
                    </dt>
                    <dd className="font-display font-bold">{article.topic}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-2 text-muted">
                      <Clock aria-hidden className="h-4 w-4 text-brand" /> Reading Time
                    </dt>
                    <dd className="font-display font-bold">{article.readingTime} min</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-2 text-muted">
                      <Calendar aria-hidden className="h-4 w-4 text-brand" /> Published
                    </dt>
                    <dd className="font-display font-bold">{formatDate(article.date)}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-2 text-muted">
                      <ShieldCheck aria-hidden className="h-4 w-4 text-brand" /> Key Points
                    </dt>
                    <dd className="font-display font-bold">{article.keyPoints?.length ?? 0}</dd>
                  </div>
                </dl>
              </div>

              {/* Share */}
              <div className="card-base p-5">
                <ShareButtons title={article.title} path={`/legal-awareness/${article.slug}`} />
              </div>

              {/* Know your rights CTA */}
              <div className="rounded-md border border-gold/40 bg-gold-50 p-5">
                <h3 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-gold-deep">
                  Know your rights
                </h3>
                <p className="mt-2 text-[13px] leading-6 text-ink/70">
                  Have questions or want to see a specific student rights topic covered in TSC? Let us know.
                </p>
                <TextCTA href="/contact" className="mt-3 !text-[11.5px] !text-gold-deep">
                  Contact Editorial Team
                </TextCTA>
              </div>

              {/* More in topic */}
              {related.length > 0 && (
                <div className="card-base p-5">
                  <h3 className="font-display text-sm font-bold uppercase tracking-[0.14em]">More in {article.topic}</h3>
                  <ul className="mt-4 space-y-4">
                    {related.map((r) => (
                      <li key={r.id}>
                        <Link href={`/legal-awareness/${r.slug}`} className="group block">
                          <p className="font-display text-[14px] font-bold leading-snug transition-colors group-hover:text-brand">{r.title}</p>
                          <p className="mt-1 line-clamp-2 text-[12.5px] leading-5 text-muted">{r.summary}</p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          </div>

          {/* Explore other explainers (matching explore other campuses on campus profile page) */}
          {otherArticles.length > 0 && (
            <div className="mt-16 border-t border-hairline pt-10">
              <h2 className="font-display text-xl font-bold tracking-tight">Explore other legal explainers</h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {otherArticles.map((l) => (
                  <Link
                    key={l.id}
                    href={`/legal-awareness/${l.slug}`}
                    className="card-base card-hover group flex h-full flex-col gap-3 p-6"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand">{l.topic}</p>
                    <h3 className="font-display text-[16px] font-bold leading-snug transition-colors group-hover:text-brand line-clamp-2">
                      {l.title}
                    </h3>
                    <p className="line-clamp-2 text-[13px] leading-relaxed text-muted">{l.summary}</p>
                    <p className="mt-auto flex items-center gap-3 border-t border-hairline pt-3 text-[11px] font-medium uppercase tracking-wider text-muted">
                      <span>{l.readingTime} min read</span>
                      <span aria-hidden>•</span>
                      <span className="cta-underline text-brand">Read explainer</span>
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

