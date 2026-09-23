'use client';

import { useState, useEffect, useMemo } from 'react';
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

export function NewsSection({ articles: initialArticles }: { articles: Article[] }) {
  const [items, setItems] = useState<Article[]>(initialArticles);
  const api = process.env.NEXT_PUBLIC_API_URL || '';

  useEffect(() => {
    setItems(initialArticles);
  }, [initialArticles]);

  useEffect(() => {
    const sync = () => {
      let localItems: Article[] = [];
      try {
        const storedNews: Article[] = JSON.parse(
          window.localStorage.getItem('tsc.custom.news') || '[]'
        );
        const storedArticles: Article[] = JSON.parse(
          window.localStorage.getItem('tsc.custom.articles') || '[]'
        );

        let adminNewsItems: Article[] = [];
        const adminNewsRaw = window.localStorage.getItem('tsc.admin.news');
        if (adminNewsRaw) {
          const parsed = JSON.parse(adminNewsRaw);
          const added = parsed.added || [];
          const edits = Object.values(parsed.edits || {});
          adminNewsItems = [...added, ...edits].map((item: any) => ({
            id: item.id || item._id?.toString() || item.slug,
            slug: item.slug || '',
            title: item.title || item.newsTitle || 'Untitled',
            excerpt: item.excerpt || item.summary || '',
            content: Array.isArray(item.content) ? item.content : [item.content || item.summary || ''],
            category: item.category || 'Student News',
            tags: Array.isArray(item.tags) ? item.tags : [],
            author: item.author || 'TSC Campus Desk',
            campus: item.campus || '',
            date: item.date || item.createdAt || new Date().toISOString(),
            readingTime: item.readingTime || 3,
            image: item.image || '/images/news/news-1.jpg',
            imageAlt: item.title || 'News image',
            featured: Boolean(item.featured),
            status: item.status || 'published',
          }));
        }

        localItems = [...storedNews, ...storedArticles, ...adminNewsItems].filter(
          (a) => a && (a.status === 'published' || !a.status)
        );
      } catch {
        /* ignore */
      }

      if (localItems.length > 0) {
        setItems((prev) => {
          const existingIds = new Set(prev.map((a) => a.id));
          const existingTitles = new Set(prev.map((a) => a.title.toLowerCase().trim()));
          const newOnes = localItems.filter(
            (item) => !existingIds.has(item.id) && !existingTitles.has(item.title.toLowerCase().trim())
          );
          return [...newOnes, ...prev];
        });
      }

      if (api) {
        fetch(`${api}/api/news?_t=${Date.now()}&limit=20`, { cache: 'no-store' })
          .then((res) => (res.ok ? res.json() : null))
          .then((json) => {
            if (json && Array.isArray(json.data) && json.data.length > 0) {
              const mapped: Article[] = json.data.map((item: any) => ({
                id: item.id || item._id?.toString() || item.slug,
                slug: item.slug || '',
                title: item.title || item.newsTitle || 'Untitled',
                excerpt: item.excerpt || item.summary || '',
                content: Array.isArray(item.content) ? item.content : [item.content || ''],
                category: typeof item.category === 'object' ? item.category?.name : item.category || 'Student News',
                tags: Array.isArray(item.tags) ? item.tags.map((t: any) => t?.name || t) : [],
                author: typeof item.author === 'object' ? item.author?.name : item.author || 'TSC Editorial',
                campus: item.campus || '',
                date: item.date || item.createdAt || new Date().toISOString(),
                readingTime: item.readingTime || 3,
                image: item.image || item.featuredImage || '/images/news/news-1.jpg',
                imageAlt: item.title || 'News image',
                featured: Boolean(item.featured),
                status: item.status || 'published',
              }));

              const published = mapped.filter((a) => !a.status || a.status.toLowerCase() === 'published');
              setItems((prev) => {
                const liveIds = new Set(published.map((a) => a.id));
                const liveTitles = new Set(published.map((a) => a.title.toLowerCase().trim()));
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

  const featured = items.find((a) => a.featured) ?? items[0];
  const secondary = items.filter((a) => a.id !== featured?.id).slice(0, 3);

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
