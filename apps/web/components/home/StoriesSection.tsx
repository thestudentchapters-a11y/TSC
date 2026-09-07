'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { School, Rocket, User } from 'lucide-react';
import { SectionHeading } from '@/components/common/SectionHeading';
import { StoryCard } from '@/components/cards/StoryCard';
import { TextCTA } from '@/components/common/Button';
import type { Story, StoryCategory } from '@/types/content';
import { cn } from '@/lib/utils';

const TABS: { key: StoryCategory | 'all'; label: string; icon: typeof User; desc: string }[] = [
  { key: 'all', label: 'All', icon: User, desc: 'Every journey, across categories.' },
  { key: 'student', label: 'Student', icon: User, desc: 'Personal journeys, achievements, challenges and experiences.' },
  { key: 'startup', label: 'Startup', icon: Rocket, desc: 'Young founders, student entrepreneurs and ideas turning into businesses.' },
  { key: 'campus', label: 'Campus', icon: School, desc: "What's happening inside India's colleges and universities." },
];

export function StoriesSection({ stories }: { stories: Story[] }) {
  const [tab, setTab] = useState<StoryCategory | 'all'>('all');
  const filtered = tab === 'all' ? stories : stories.filter((s) => s.category === tab);
  const activeTab = TABS.find((t) => t.key === tab)!;

  return (
    <section aria-label="Student stories" className="bg-white section-pad">
      <div className="container-tsc">
        <SectionHeading
          number="02"
          eyebrow="Real People. Real Journeys."
          title="Every Student Has a Story."
          description="Behind every achievement is a journey. Behind every idea is a person. And behind every campus is a community full of stories waiting to be discovered. We tell the stories of students who are building, creating, experimenting, leading and making a difference."
        />

        {/* Tabs */}
        <div className="mt-10 flex flex-wrap items-center gap-2" role="tablist" aria-label="Story categories">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = t.key === tab;
            return (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.key)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-4 py-2.5 font-display text-[11.5px] font-bold uppercase tracking-[0.12em] transition-all duration-300',
                  active
                    ? 'border-brand bg-brand text-white shadow-card'
                    : 'border-hairline bg-cream text-ink/70 hover:border-brand hover:text-brand'
                )}
              >
                <Icon aria-hidden className={cn('h-3.5 w-3.5', active && 'text-gold')} />
                {t.label}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-[13px] italic text-muted">{activeTab.desc}</p>

        {/* Grid */}
        <div className="mt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filtered.slice(0, 6).map((s, i) => (
                <motion.div
                  key={s.id}
                  className="h-full"
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] }}
                >
                  <StoryCard story={s} priority={i < 3} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-8">
          <TextCTA href="/stories">Read All Stories</TextCTA>
          <Link
            href="/share-your-story"
            className="cta-underline font-display text-[12px] font-bold uppercase tracking-[0.14em] text-gold-deep"
          >
            ✍️ Share Your Story
          </Link>
        </div>
      </div>
    </section>
  );
}
