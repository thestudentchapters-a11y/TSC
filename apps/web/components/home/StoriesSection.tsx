'use client';

import { useState, useEffect } from 'react';
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

export function StoriesSection({ stories: initialStories }: { stories: Story[] }) {
  const [items, setItems] = useState<Story[]>(initialStories);
  const [tab, setTab] = useState<StoryCategory | 'all'>('all');
  const api = process.env.NEXT_PUBLIC_API_URL || '';

  useEffect(() => {
    setItems(initialStories);
  }, [initialStories]);

  useEffect(() => {
    const sync = () => {
      let localItems: Story[] = [];
      try {
        const stored: Story[] = JSON.parse(
          window.localStorage.getItem('tsc.custom.stories') || '[]'
        );

        let adminStoryItems: Story[] = [];
        const adminStoriesRaw = window.localStorage.getItem('tsc.admin.stories');
        if (adminStoriesRaw) {
          const parsed = JSON.parse(adminStoriesRaw);
          const added = parsed.added || [];
          const edits = Object.values(parsed.edits || {});
          adminStoryItems = [...added, ...edits].map((item: any) => ({
            id: item.id || item._id?.toString() || item.slug,
            slug: item.slug || '',
            title: item.title || item.storyTitle || 'Untitled Story',
            dek: item.dek || item.summary || '',
            category: item.category || 'student',
            image: item.image || '/images/stories/story-1.jpg',
            imageAlt: item.title || 'Story image',
            author: item.author || 'TSC Contributor',
            authorRole: item.authorRole || 'Student',
            campus: item.campus || '',
            date: item.date || item.createdAt || new Date().toISOString(),
            readingTime: item.readingTime || 4,
            content: Array.isArray(item.content) ? item.content : [item.content || item.summary || ''],
            quote: item.quote,
            featured: Boolean(item.featured),
            status: item.status || 'published',
          }));
        }

        localItems = [...stored, ...adminStoryItems].filter(
          (s) => s && (s.status === 'published' || !s.status)
        );
      } catch {
        /* ignore */
      }

      if (localItems.length > 0) {
        setItems((prev) => {
          const existingIds = new Set(prev.map((s) => s.id));
          const existingTitles = new Set(prev.map((s) => s.title.toLowerCase().trim()));
          const newOnes = localItems.filter(
            (s) => !existingIds.has(s.id) && !existingTitles.has(s.title.toLowerCase().trim())
          );
          return [...newOnes, ...prev];
        });
      }

      if (api) {
        fetch(`${api}/api/stories?_t=${Date.now()}&limit=20`, { cache: 'no-store' })
          .then((res) => (res.ok ? res.json() : null))
          .then((json) => {
            const rawItems = Array.isArray(json?.items)
              ? json.items
              : Array.isArray(json?.data)
                ? json.data
                : Array.isArray(json)
                  ? json
                  : [];
            if (rawItems.length > 0) {
              const mapped: Story[] = rawItems.map((item: any) => ({
                id: item.id || item._id?.toString() || item.slug,
                slug: item.slug || '',
                title: item.title || item.storyTitle || 'Untitled Story',
                dek: item.dek || item.summary || '',
                category: item.category || 'student',
                image: item.image || '/images/stories/story-1.jpg',
                imageAlt: item.title || 'Story image',
                author: typeof item.author === 'object' ? item.author?.name : item.author || 'TSC Contributor',
                authorRole: item.authorRole || 'Student',
                campus: item.campus || '',
                date: item.date || item.createdAt || new Date().toISOString(),
                readingTime: item.readingTime || 4,
                content: Array.isArray(item.content) ? item.content : [item.content || ''],
                quote: item.quote,
                featured: Boolean(item.featured),
                status: item.status || 'published',
              }));

              const published = mapped.filter((s) => !s.status || s.status.toLowerCase() === 'published');
              setItems((prev) => {
                const liveIds = new Set(published.map((s) => s.id));
                const liveTitles = new Set(published.map((s) => s.title.toLowerCase().trim()));
                const remaining = prev.filter(
                  (p) => !liveIds.has(p.id) && !liveTitles.has(p.title.toLowerCase().trim())
                );
                return [...published, ...remaining];
              });
            }
          })
          .catch(() => {});
      }
    };

    sync();
    window.addEventListener('storage', sync);
    window.addEventListener('focus', sync);
    window.addEventListener('pageshow', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('focus', sync);
      window.removeEventListener('pageshow', sync);
    };
  }, [api]);

  const filtered = tab === 'all' ? items : items.filter((s) => s.category === tab);
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
