'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
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
  const searchParamsHook = useSearchParams();
  const [articles, setArticles] = useState<Article[]>(initialArticles);

  useEffect(() => {
    setArticles(initialArticles);
  }, [initialArticles]);

  const loadLocal = () => {
    try {
      const storedNews: Article[] = JSON.parse(
        window.localStorage.getItem('tsc.custom.news') || '[]'
      );
      const storedArticles: Article[] = JSON.parse(
        window.localStorage.getItem('tsc.custom.articles') || '[]'
      );
      const combined = [...storedNews, ...storedArticles].filter(
        (a) => a && (a.status === 'published' || !a.status)
      );
      if (combined.length > 0) {
        setArticles((prev) => {
          const ids = new Set(prev.map((a) => a.id));
          const newItems = combined.filter((s) => !ids.has(s.id));
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

  const normalize = (str?: string) => {
    if (!str) return '';
    try {
      return decodeURIComponent(str.replace(/\+/g, ' ')).trim().toLowerCase();
    } catch {
      return str.trim().toLowerCase();
    }
  };

  const activeCategory = searchParamsHook?.get('category') ?? currentCategory ?? '';
  const activePage = Number(searchParamsHook?.get('page')) || currentPage || 1;
  const normCategory = normalize(activeCategory);

  const published = articles.filter(
    (a) => !a.status || a.status.toLowerCase() === 'published'
  );
  
  const filtered = normCategory
    ? published.filter((a) => normalize(a.category) === normCategory)
    : published;

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const page = Math.min(activePage, totalPages);
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
