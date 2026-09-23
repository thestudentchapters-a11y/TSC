'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { StoryCard } from '@/components/cards/StoryCard';
import { EmptyState } from '@/components/common/States';
import { StaggerGrid, StaggerItem } from '@/components/common/Reveal';
import type { Story } from '@/types/content';

interface StoriesFeedProps {
  initialStories: Story[];
  category?: string;
  query?: string;
}

export function StoriesFeed({
  initialStories,
  category,
  query = '',
}: StoriesFeedProps) {
  const searchParamsHook = useSearchParams();
  const [stories, setStories] = useState<Story[]>(initialStories);

  useEffect(() => {
    setStories(initialStories);
  }, [initialStories]);

  const api = process.env.NEXT_PUBLIC_API_URL || '';

  const syncStories = () => {
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
      setStories((prev) => {
        const existingIds = new Set(prev.map((s) => s.id));
        const existingTitles = new Set(prev.map((s) => s.title.toLowerCase().trim()));
        const newOnes = localItems.filter(
          (s) => !existingIds.has(s.id) && !existingTitles.has(s.title.toLowerCase().trim())
        );
        return [...newOnes, ...prev];
      });
    }

    if (api) {
      fetch(`${api}/api/stories?_t=${Date.now()}&limit=100`, { cache: 'no-store' })
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
            setStories((prev) => {
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

  useEffect(() => {
    syncStories();
    window.addEventListener('storage', syncStories);
    window.addEventListener('focus', syncStories);
    window.addEventListener('pageshow', syncStories);
    return () => {
      window.removeEventListener('storage', syncStories);
      window.removeEventListener('focus', syncStories);
      window.removeEventListener('pageshow', syncStories);
    };
  }, []);

  const activeCategory = searchParamsHook?.get('category') ?? category ?? '';
  const activeQuery = searchParamsHook?.get('q') ?? query ?? '';

  const normalize = (str?: string) => {
    if (!str) return '';
    try {
      return decodeURIComponent(str.replace(/\+/g, ' ')).trim().toLowerCase();
    } catch {
      return str.trim().toLowerCase();
    }
  };

  const normCat = normalize(activeCategory);

  const published = stories.filter((s) => !s.status || s.status.toLowerCase() === 'published');
  let filtered = normCat
    ? published.filter((s) => normalize(s.category) === normCat)
    : published;

  const q = activeQuery.trim().toLowerCase();
  if (q) {
    filtered = filtered.filter((s) =>
      [s.title, s.dek, s.author, s.campus].some((f) => f?.toLowerCase().includes(q))
    );
  }

  if (filtered.length === 0) {
    return (
      <EmptyState
        title={q ? `No stories match “${query}”` : 'No stories in this category yet'}
        description="Try a different search or category — or be the first to share yours."
      />
    );
  }

  return (
    <StaggerGrid className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map((s, i) => (
        <StaggerItem key={s.id}>
          <StoryCard story={s} priority={i < 3} />
        </StaggerItem>
      ))}
    </StaggerGrid>
  );
}
