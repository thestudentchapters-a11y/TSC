'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArticleCard } from '@/components/cards/ArticleCard';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/States';
import { StaggerGrid, StaggerItem } from '@/components/common/Reveal';
import { getPublicApiUrl } from '@/lib/utils';
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
  perPage = 12,
  searchParams,
}: NewsFeedProps) {
  const searchParamsHook = useSearchParams();
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const api = getPublicApiUrl();

  useEffect(() => {
    setArticles(initialArticles);
  }, [initialArticles]);

  const syncArticles = () => {
    // 1. Gather all local custom/admin news
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
      setArticles((prev) => {
        const existingIds = new Set(prev.map((a) => a.id));
        const existingTitles = new Set(prev.map((a) => a.title.toLowerCase().trim()));
        const newOnes = localItems.filter(
          (item) => !existingIds.has(item.id) && !existingTitles.has(item.title.toLowerCase().trim())
        );
        return [...newOnes, ...prev];
      });
    }

    // 2. Live fetch from API in browser
    if (api) {
      fetch(`${api}/api/news?_t=${Date.now()}&limit=100`, { cache: 'no-store' })
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
            const mapped: Article[] = rawItems.map((item: any) => ({
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

            const published = mapped
              .filter((a) => !a.status || a.status.toLowerCase() === 'published')
              .sort((a, b) => {
                const timeA = new Date(a.date || 0).getTime();
                const timeB = new Date(b.date || 0).getTime();
                return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
              });

            if (published.length > 0) {
              setArticles(published);
            }
          }
        })
        .catch(() => {});
    }
  };

  useEffect(() => {
    syncArticles();
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
