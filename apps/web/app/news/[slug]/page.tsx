import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Clock, User, ChevronRight } from 'lucide-react';
import { PageHeader, ContentBody, DemoNotice } from '@/components/common/PageHeader';
import { CategoryPill } from '@/components/common/CategoryPill';
import { ShareButtons, SaveButton } from '@/components/common/ShareButtons';
import { ArticleCard } from '@/components/cards/ArticleCard';
import { Reveal } from '@/components/common/Reveal';
import { getArticleBySlug, getArticles } from '@/lib/data';
import { formatDate, readingTimeFromContent } from '@/lib/utils';
import { site } from '@/lib/site';

export const revalidate = 120;

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);
  if (!article) return { title: 'Article not found' };
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/news/${article.slug}` },
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.excerpt,
      publishedTime: article.date,
      authors: [article.author],
      images: [{ url: article.image, alt: article.imageAlt }],
    },
    twitter: { card: 'summary_large_image', title: article.title, description: article.excerpt },
  };
}

export default async function ArticlePage({ params }: Props) {
  const article = await getArticleBySlug(params.slug);
  if (!article) notFound();

  const all = await getArticles();
  const related = all
    .filter((a) => a.id !== article.id && a.category === article.category)
    .slice(0, 3);
  const fallbackRelated = all.filter((a) => a.id !== article.id).slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt,
    image: [`${site.url}${article.image}`],
    datePublished: article.date,
    author: { '@type': 'Person', name: article.author },
    publisher: { '@type': 'Organization', name: site.name, logo: { '@type': 'ImageObject', url: `${site.url}/brand/tsc-logo.jpg` } },
    mainEntityOfPage: `${site.url}/news/${article.slug}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <PageHeader eyebrow="Latest News" title={article.title}>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium uppercase tracking-wider text-muted">
          <CategoryPill>{article.category}</CategoryPill>
          <span className="inline-flex items-center gap-1">
            <User aria-hidden className="h-3.5 w-3.5" /> {article.author}
          </span>
          <span>{formatDate(article.date)}</span>
          <span className="inline-flex items-center gap-1">
            <Clock aria-hidden className="h-3.5 w-3.5" /> {article.readingTime || readingTimeFromContent(article.content)} min read
          </span>
        </div>
        <nav aria-label="Breadcrumb" className="mt-6">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-muted">
            <li><Link href="/" className="hover:text-brand">Home</Link></li>
            <li aria-hidden><ChevronRight className="h-3 w-3" /></li>
            <li><Link href="/news" className="hover:text-brand">News</Link></li>
            <li aria-hidden><ChevronRight className="h-3 w-3" /></li>
            <li className="max-w-[240px] truncate text-ink/70" aria-current="page">{article.title}</li>
          </ol>
        </nav>
      </PageHeader>

      <article className="section-pad">
        <div className="container-tsc max-w-6xl">
          <Reveal>
            <div className="relative aspect-[16/8] overflow-hidden rounded-md">
              <Image src={article.image} alt={article.imageAlt} fill priority sizes="(max-width: 1024px) 100vw, 66vw" className="object-cover" />
            </div>
          </Reveal>

          <div className="mt-10 grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <DemoNotice className="mb-8" />
              <ContentBody paragraphs={article.content} />

              <div className="mt-8 flex flex-wrap gap-2">
                {article.tags.map((t) => (
                  <span key={t} className="rounded-full border border-hairline bg-white px-3 py-1 text-[11px] font-semibold text-ink/60">
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            <aside className="space-y-6 lg:col-span-4">
              <div className="card-base space-y-5 p-5">
                <ShareButtons title={article.title} path={`/news/${article.slug}`} />
                <div className="border-t border-hairline pt-5">
                  <SaveButton itemType="article" itemId={article.id} title={article.title} className="w-full justify-center" />
                </div>
              </div>
              <div className="rounded-md border border-brand/20 bg-brand-50 p-5">
                <h3 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-brand">
                  Want stories like this?
                </h3>
                <p className="mt-2 text-[13px] leading-6 text-ink/70">
                  Get the latest from campuses across India — join the TSC community.
                </p>
                <Link href="/membership" className="cta-underline mt-3 inline-block font-display text-[11.5px] font-bold uppercase tracking-[0.14em] text-brand">
                  Join TSC
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </article>

      <section className="border-t border-hairline bg-white section-pad">
        <div className="container-tsc">
          <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">More in {article.category}</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(related.length ? related : fallbackRelated).map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
