import Link from 'next/link';
import { Landmark, Globe2, TrendingUp, Atom, BookOpen } from 'lucide-react';
import { SectionHeading } from '@/components/common/SectionHeading';
import { Reveal } from '@/components/common/Reveal';
import { ImageReveal as ImageRevealCmp } from '@/components/common/ImageReveal';
import { TextCTA } from '@/components/common/Button';
import type { CurrentAffairsEdition } from '@/types/content';
import { formatDate } from '@/lib/utils';

const TOPICS = [
  { icon: Landmark, name: 'India', desc: 'Government, policy, society, national developments' },
  { icon: Globe2, name: 'World', desc: 'International events shaping global affairs' },
  { icon: TrendingUp, name: 'Economy', desc: 'Business, markets, employment' },
  { icon: Atom, name: 'Science & Technology', desc: 'New technologies, discoveries, innovations' },
  { icon: BookOpen, name: 'Education', desc: 'Policies, reforms affecting students' },
];

export function CurrentAffairsSection({ edition }: { edition?: CurrentAffairsEdition }) {
  return (
    <section aria-label="Monthly current affairs" className="section-pad">
      <div className="container-tsc grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <SectionHeading
            number="05"
            eyebrow="Know More"
            title="Understand the World Beyond Your Campus."
            description="The world changes every day. Staying informed shouldn't mean scrolling through hundreds of headlines. Our monthly current affairs edition brings together important developments across India and the world — explained in a way that's relevant and easy to understand."
          />

          <ul className="mt-9 space-y-4">
            {TOPICS.map((t, i) => {
              const Icon = t.icon;
              return (
                <Reveal key={t.name} delay={i * 0.07}>
                  <li className="group flex items-center gap-4 border-b border-hairline pb-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] border border-brand/20 bg-brand-50 text-brand transition-all duration-300 group-hover:bg-brand group-hover:text-white">
                      <Icon aria-hidden className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-display text-[13.5px] font-bold uppercase tracking-[0.1em]">{t.name}</h3>
                      <p className="text-[13px] text-muted">{t.desc}</p>
                    </div>
                  </li>
                </Reveal>
              );
            })}
          </ul>

          <div className="mt-8">
            <TextCTA href="/current-affairs">Read Monthly Current Affairs</TextCTA>
          </div>
        </div>

        {/* Latest edition card */}
        {edition && (
          <div className="lg:col-span-5">
            <Reveal delay={0.15}>
              <Link
                href={`/current-affairs/${edition.slug}`}
                className="card-base card-hover group block overflow-hidden"
              >
                <ImageRevealCmp
                  src={edition.cover}
                  alt={edition.coverAlt}
                  className="aspect-[4/5] sm:aspect-[16/10] lg:aspect-[4/5]"
                  curtain="brand"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
                <div className="space-y-3 p-6">
                  <p className="eyebrow !text-gold-deep">Latest Edition • {edition.month} {edition.year}</p>
                  <h3 className="font-display text-xl font-bold leading-snug transition-colors group-hover:text-brand">
                    {edition.title}
                  </h3>
                  <p className="line-clamp-2 text-sm leading-6 text-muted">{edition.intro}</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {edition.topics.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-hairline bg-cream px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-ink/60"
                      >
                        {t === 'Science & Technology' ? 'Sci-Tech' : t}
                      </span>
                    ))}
                  </div>
                  <p className="pt-1 text-[11px] font-medium uppercase tracking-wider text-muted">
                    Published {formatDate(`${edition.year}-${String(
                      ['January','February','March','April','May','June','July','August','September','October','November','December'].indexOf(edition.month) + 1
                    ).padStart(2, '0')}-01`)}
                  </p>
                </div>
              </Link>
            </Reveal>
          </div>
        )}
      </div>
    </section>
  );
}
