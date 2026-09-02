import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, ChevronRight, Info } from 'lucide-react';
import { PageHeader, ContentBody, DemoNotice } from '@/components/common/PageHeader';
import { ShareButtons } from '@/components/common/ShareButtons';
import { Reveal } from '@/components/common/Reveal';
import { getLegalBySlug, getLegalArticles } from '@/lib/data';
import { formatDate } from '@/lib/utils';

export const revalidate = 300;

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getLegalBySlug(params.slug);
  if (!article) return { title: 'Explainer not found' };
  return {
    title: article.title,
    description: article.summary,
    alternates: { canonical: `/legal-awareness/${article.slug}` },
  };
}

export default async function LegalArticlePage({ params }: Props) {
  const article = await getLegalBySlug(params.slug);
  if (!article) notFound();

  const related = (await getLegalArticles()).filter((l) => l.id !== article.id && l.topic === article.topic);

  return (
    <>
      <PageHeader eyebrow={`Legal Awareness / ${article.topic}`} title={article.title}>
        <p className="text-xs font-medium uppercase tracking-wider text-muted">
          {formatDate(article.date)} • {article.readingTime} min read
        </p>
        <nav aria-label="Breadcrumb" className="mt-6">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-muted">
            <li><Link href="/" className="hover:text-brand">Home</Link></li>
            <li aria-hidden><ChevronRight className="h-3 w-3" /></li>
            <li><Link href="/legal-awareness" className="hover:text-brand">Legal Awareness</Link></li>
          </ol>
        </nav>
      </PageHeader>

      <section className="section-pad">
        <div className="container-tsc max-w-6xl grid gap-12 lg:grid-cols-12">
          <article className="lg:col-span-8">
            <DemoNotice className="mb-8" />
            <p className="mb-8 font-serif text-xl italic leading-8 text-brand">{article.summary}</p>
            <ContentBody paragraphs={article.content} />

            <div className="mt-10 rounded-md border border-brand/20 bg-brand-50 p-6">
              <h2 className="font-display text-base font-bold">Key takeaways</h2>
              <ul className="mt-4 space-y-3">
                {article.keyPoints.map((k) => (
                  <li key={k} className="flex items-start gap-2.5 text-[14px] leading-6 text-ink/80">
                    <CheckCircle2 aria-hidden className="mt-1 h-4 w-4 shrink-0 text-gold-deep" />
                    {k}
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-8 flex items-start gap-2.5 rounded-md border border-gold/40 bg-gold-50/60 p-4 text-xs italic leading-5 text-ink/70">
              <Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" />
              Content is for general awareness and does not constitute legal advice. For specific situations,
              consult a qualified legal professional or your institution&apos;s student affairs office.
            </p>
          </article>

          <aside className="space-y-6 lg:col-span-4">
            <div className="card-base p-5">
              <ShareButtons title={article.title} path={`/legal-awareness/${article.slug}`} />
            </div>
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
      </section>
    </>
  );
}
