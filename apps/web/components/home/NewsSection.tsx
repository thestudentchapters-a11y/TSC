import { Newspaper, GraduationCap, Users, Cpu } from 'lucide-react';
import { SectionHeading } from '@/components/common/SectionHeading';
import { StaggerGrid, StaggerItem } from '@/components/common/Reveal';
import { ArticleCard } from '@/components/cards/ArticleCard';
import { TextCTA } from '@/components/common/Button';
import type { Article } from '@/types/content';

const CATEGORIES = [
  { icon: Newspaper, name: 'Student News', desc: 'Stories and updates that directly impact students and young people.' },
  { icon: GraduationCap, name: 'Education', desc: 'Important developments across schools, colleges, universities and the education ecosystem.' },
  { icon: Users, name: 'Youth & Society', desc: "People, movements and developments shaping India's young generation." },
  { icon: Cpu, name: 'Technology & Innovation', desc: 'Emerging technologies, innovations and ideas transforming the world around us.' },
];

export function NewsSection({ articles }: { articles: Article[] }) {
  const featured = articles.find((a) => a.featured) ?? articles[0];
  const secondary = articles.filter((a) => a.id !== featured?.id).slice(0, 3);

  return (
    <section aria-label="Latest news" className="section-pad">
      <div className="container-tsc">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            number="01"
            eyebrow="Stay Informed"
            title={<span className="italic">What&apos;s Happening Around You?</span>}
            description="From education and technology to youth affairs, campus developments and student achievements — stay updated with the news that matters to the next generation."
          />
        </div>

        <div className="mt-12 grid gap-6">
          {featured && (
            <div className="reveal-fade">
              <ArticleCard article={featured} variant="featured" priority />
            </div>
          )}
          <StaggerGrid className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {secondary.map((a) => (
              <StaggerItem key={a.id}>
                <ArticleCard article={a} />
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>

        {/* Category descriptions */}
        <StaggerGrid className="mt-12 grid gap-4 border-t border-hairline pt-10 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            return (
              <StaggerItem key={c.name}>
                <div className="group flex h-full gap-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] border border-brand/20 bg-brand-50 text-brand transition-all duration-300 group-hover:bg-brand group-hover:text-white">
                    <Icon aria-hidden className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-[13px] font-bold uppercase tracking-[0.12em]">{c.name}</h3>
                    <p className="mt-1.5 text-[12.5px] leading-5 text-muted">{c.desc}</p>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerGrid>

        <div className="mt-10 border-t border-hairline pt-8">
          <TextCTA href="/news">Explore Latest News</TextCTA>
        </div>
      </div>
    </section>
  );
}
