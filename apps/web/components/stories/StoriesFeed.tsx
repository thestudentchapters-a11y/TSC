'use client';

import { useState, useEffect } from 'react';
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
  const [stories, setStories] = useState<Story[]>(initialStories);

  useEffect(() => {
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
  }, []);

  const published = stories.filter((s) => s.status === 'published');
  let filtered = category ? published.filter((s) => s.category === category) : published;

  const q = query.trim().toLowerCase();
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
