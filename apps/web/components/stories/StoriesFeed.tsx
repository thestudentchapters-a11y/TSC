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

  const loadLocal = () => {
    try {
      const stored: Story[] = JSON.parse(
        window.localStorage.getItem('tsc.custom.stories') || '[]'
      );
      if (stored.length > 0) {
        setStories((prev) => {
          const ids = new Set(prev.map((s) => s.id));
          const newItems = stored.filter((s) => !ids.has(s.id));
          return [...newItems, ...prev];
        });
      }
    } catch {
      /* noop */
    }
  };

  useEffect(() => {
    loadLocal();
    window.addEventListener('storage', loadLocal);
    window.addEventListener('focus', loadLocal);
    window.addEventListener('pageshow', loadLocal);
    return () => {
      window.removeEventListener('storage', loadLocal);
      window.removeEventListener('focus', loadLocal);
      window.removeEventListener('pageshow', loadLocal);
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
