import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Fingerprint, Scale, ShieldAlert, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { StaggerGrid, StaggerItem } from '@/components/common/Reveal';
import { getLegalArticles } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Legal Awareness — Know Your Rights',
  description:
    "Because knowing your rights matters. Simplified explainers on student rights, cyber safety, digital rights and education laws — in language students can actually understand.",
  alternates: { canonical: '/legal-awareness' },
};

export const revalidate = 300;

const TOPIC_META: Record<string, { icon: typeof Scale; desc: string }> = {
  'Student Rights': { icon: ShieldCheck, desc: 'Understand your rights within educational institutions.' },
  'Cyber Safety': { icon: ShieldAlert, desc: 'Know what to do when things go wrong online.' },
  'Digital Rights': { icon: Fingerprint, desc: 'Understand privacy, online identity and responsible digital participation.' },
  'Education Laws': { icon: Scale, desc: 'Simplified explainers on rules, regulations and policies affecting students.' },
};

export default async function LegalAwarenessPage({
  searchParams,
}: {
  searchParams: { topic?: string };
}) {
  const all = await getLegalArticles();
  const topic = searchParams.topic;
  const topics = Array.from(new Set(all.map((l) => l.topic)));
  const items = topic ? all.filter((l) => l.topic === topic) : all;

  return (
    <>
      <PageHeader
        eyebrow="08 — Know Your Rights"
        title="Because Knowing Your Rights Matters."
        description="Students encounter legal, digital and institutional situations every day — but understanding your rights isn't always easy. TSC's Legal Awareness section simplifies important legal topics and explains them in language students can actually understand."
      >
        <div className="flex flex-wrap gap-2">
          {topics.map((t) => {
            const active = t === topic;
            return (
              <Link
                key={t}
                href={active ? '/legal-awareness' : `/legal-awareness?topic=${encodeURIComponent(t)}`}
                aria-pressed={active}
                className={`rounded-full border px-4 py-2 font-display text-[11.5px] font-bold uppercase tracking-[0.12em] transition-all ${
                  active
                    ? 'border-brand bg-brand text-white shadow-card'
                    : 'border-hairline bg-white text-ink/70 hover:border-brand hover:text-brand'
                }`}
              >
                {t}
              </Link>
            );
          })}
        </div>
      </PageHeader>

      <section className="section-pad">
        <div className="container-tsc">
          {/* topic cards */}
          <StaggerGrid className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {topics.map((t) => {
              const meta = TOPIC_META[t] ?? { icon: Scale, desc: '' };
              const Icon = meta.icon;
              return (
                <StaggerItem key={t}>
                  <Link href={`/legal-awareness?topic=${encodeURIComponent(t)}`} className="card-base card-hover group flex h-full flex-col p-6">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-[8px] bg-brand text-white transition-all duration-300 group-hover:-rotate-6 group-hover:bg-gold group-hover:text-ink">
                      <Icon aria-hidden className="h-6 w-6" />
                    </span>
                    <h2 className="mt-5 font-display text-[15px] font-bold min-h-[1.5rem]">{t}</h2>
                    <p className="mt-2 flex-1 text-[13px] leading-6 text-muted min-h-[3rem]">{meta.desc}</p>
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-4 font-display text-[11px] font-bold uppercase tracking-[0.14em] text-brand">
                      <span className="cta-underline">Explore</span>
                      <ArrowRight aria-hidden className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </Link>
                </StaggerItem>
              );
            })}
          </StaggerGrid>

          {/* articles */}
          <div className="mt-14 border-t border-hairline pt-10">
            <h2 className="font-display text-xl font-bold tracking-tight">
              {topic ? `Explainers — ${topic}` : 'All explainers'}
            </h2>
            <div className="mt-7 grid gap-6 sm:grid-cols-2">
              {items.map((l) => (
                <Link key={l.id} href={`/legal-awareness/${l.slug}`} className="card-base card-hover group flex h-full flex-col gap-3 p-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand">{l.topic}</p>
                  <h3 className="font-display text-[17px] font-bold leading-snug transition-colors group-hover:text-brand line-clamp-2 min-h-[3rem]">{l.title}</h3>
                  <p className="line-clamp-2 text-[13.5px] leading-6 text-muted min-h-[3rem]">{l.summary}</p>
                  <p className="mt-auto flex items-center gap-3 border-t border-hairline pt-3 text-[11px] font-medium uppercase tracking-wider text-muted">
                    <span>{l.readingTime} min read</span>
                    <span aria-hidden>•</span>
                    <span className="cta-underline text-brand">Read explainer</span>
                  </p>
                </Link>
              ))}
            </div>
          </div>

      <p className="mt-10 rounded-md border border-hairline bg-white px-5 py-4 text-xs italic text-muted">
        Content is for general awareness and does not constitute legal advice.
      </p>
        </div>
      </section>
    </>
  );
}
