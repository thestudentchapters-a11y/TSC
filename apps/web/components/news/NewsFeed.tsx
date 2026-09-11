'use client';

import { useState, useEffect } from 'react';
import { ArticleCard } from '@/components/cards/ArticleCard';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/States';
import { StaggerGrid, StaggerItem } from '@/components/common/Reveal';
import type { Article } from '@/types/content';

interface NewsFeedProps {
  initialArticles: Article[];
  currentCategory?: string;
  currentPage: number;
  perPage?: number;
  searchParams: { page?: string; category?: string };
}

export function NewsFeed({
  initialArticles,
  currentCategory,
  currentPage,
  perPage = 6,
  searchParams,
}: NewsFeedProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);

  useEffect(() => {
    try {
      const stored: Article[] = JSON.parse(
        window.localStorage.getItem('tsc.custom.articles') || '[]'
      );
      if (stored.length > 0) {
        setArticles((prev) => {
          const ids = new Set(prev.map((a) => a.id));
          const newItems = stored.filter((s) => !ids.has(s.id));
          return [...newItems, ...prev];
        });
      }
    } catch {
      /* noop */
    }
  }, []);

  const published = articles.filter((a) => a.status === 'published');
  const filtered = currentCategory
    ? published.filter((a) => a.category === currentCategory)
    : published;

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const page = Math.min(currentPage, totalPages);
  const items = filtered.slice((page - 1) * perPage, page * perPage);

  if (items.length === 0) {
    return (
      <EmptyState
        title="No stories in this category yet"
        description="Try another category — or check the full newsroom for the latest updates."
      />
    );
  }

  return (
    <>
      <StaggerGrid className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((a, i) => (
          <StaggerItem key={a.id}>
            <ArticleCard article={a} priority={i < 3} />
          </StaggerItem>
        ))}
      </StaggerGrid>
      <Pagination page={page} totalPages={totalPages} basePath="/news" query={searchParams} />
    </>
  );
}
