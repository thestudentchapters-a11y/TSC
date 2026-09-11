'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Newspaper,
  PenLine,
  Plus,
  School,
  Sparkles,
  BookOpen,
  Send,
  Calendar,
  ChevronRight,
  CheckCircle2,
  Tag,
  User,
  X,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { useToast } from '@/components/common/Toast';
import { ArticleCard } from '@/components/cards/ArticleCard';
import { StoryCard } from '@/components/cards/StoryCard';
import { ImageUploadInput } from '@/components/admin/ImageUploadInput';
import { type Campus, type Article, type Story, type NewsCategory, type StoryCategory } from '@/types/content';
import { slugify, formatDate } from '@/lib/utils';

interface CampusNewsAndStoriesHubProps {
  campus: Campus;
  initialArticles: Article[];
  initialStories: Story[];
}

const NEWS_CATEGORIES: NewsCategory[] = [
  'Student News',
  'Education',
  'Youth & Society',
  'Technology & Innovation',
];

const STORY_CATEGORIES: { value: StoryCategory; label: string }[] = [
  { value: 'campus', label: 'Campus Life & Initiatives' },
  { value: 'student', label: 'Student Journey & Achievements' },
  { value: 'startup', label: 'Student Startup & Innovation' },
];

export function CampusNewsAndStoriesHub({
  campus,
  initialArticles,
  initialStories,
}: CampusNewsAndStoriesHubProps) {
  const { push } = useToast();
  const [activeTab, setActiveTab] = useState<'news' | 'stories'>('news');

  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [stories, setStories] = useState<Story[]>(initialStories);

  // Add News Modal State
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [newsTitle, setNewsTitle] = useState('');
  const [newsExcerpt, setNewsExcerpt] = useState('');
  const [newsCategory, setNewsCategory] = useState<NewsCategory>('Student News');
  const [newsContent, setNewsContent] = useState('');
  const [newsAuthor, setNewsAuthor] = useState('');
  const [newsImage, setNewsImage] = useState('/images/news/news-1.jpg');
  const [newsTags, setNewsTags] = useState('Campus News, Student Initiative');
  const [submittingNews, setSubmittingNews] = useState(false);

  // Add Story Modal State
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [storyTitle, setStoryTitle] = useState('');
  const [storyDek, setStoryDek] = useState('');
  const [storyCategory, setStoryCategory] = useState<StoryCategory>('campus');
  const [storyContent, setStoryContent] = useState('');
  const [storyAuthor, setStoryAuthor] = useState('');
  const [storyAuthorRole, setStoryAuthorRole] = useState('Student Reporter');
  const [storyImage, setStoryImage] = useState('/images/stories/story-1.jpg');
  const [submittingStory, setSubmittingStory] = useState(false);

  // Load custom saved stories/news for this campus from localStorage
  useEffect(() => {
    try {
      const storedArticles: Article[] = JSON.parse(
        window.localStorage.getItem('tsc.custom.articles') || '[]'
      );
      const storedStories: Story[] = JSON.parse(
        window.localStorage.getItem('tsc.custom.stories') || '[]'
      );

      const campusArticleMatches = storedArticles.filter(
        (a) =>
          a.campus?.toLowerCase() === campus.name.toLowerCase() ||
          a.campus?.toLowerCase().includes(campus.name.toLowerCase().split(' ')[0])
      );

      const campusStoryMatches = storedStories.filter(
        (s) =>
          s.campus?.toLowerCase() === campus.name.toLowerCase() ||
          s.campus?.toLowerCase().includes(campus.name.toLowerCase().split(' ')[0])
      );

      if (campusArticleMatches.length > 0) {
        setArticles((prev) => {
          const ids = new Set(prev.map((p) => p.id));
          const toAdd = campusArticleMatches.filter((m) => !ids.has(m.id));
          return [...toAdd, ...prev];
        });
      }

      if (campusStoryMatches.length > 0) {
        setStories((prev) => {
          const ids = new Set(prev.map((p) => p.id));
          const toAdd = campusStoryMatches.filter((m) => !ids.has(m.id));
          return [...toAdd, ...prev];
        });
      }
    } catch {
      /* noop */
    }
  }, [campus.name]);

  // Submit News
  const handlePublishNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle.trim() || !newsExcerpt.trim()) {
      push('Please provide a news headline and summary.', 'error');
      return;
    }

    setSubmittingNews(true);

    const slug = slugify(`${newsTitle}-${campus.name.split(' ')[0]}-${Date.now().toString(36)}`);
    const newArticle: Article = {
      id: `art-local-${Date.now()}`,
      slug,
      title: newsTitle.trim(),
      excerpt: newsExcerpt.trim(),
      content: newsContent.trim()
        ? newsContent.split('\n\n').filter(Boolean)
        : [newsExcerpt.trim()],
      category: newsCategory,
      tags: newsTags.split(',').map((t) => t.trim()).filter(Boolean),
      author: newsAuthor.trim() || 'Campus Correspondent',
      campus: campus.name,
      date: new Date().toISOString(),
      readingTime: Math.max(2, Math.ceil((newsContent.length || newsExcerpt.length) / 500)),
      image: newsImage || '/images/news/news-1.jpg',
      imageAlt: newsTitle.trim(),
      featured: false,
      status: 'published',
    };

    // Save to local cache
    try {
      const existing: Article[] = JSON.parse(
        window.localStorage.getItem('tsc.custom.articles') || '[]'
      );
      window.localStorage.setItem(
        'tsc.custom.articles',
        JSON.stringify([newArticle, ...existing.filter((a) => a.id !== newArticle.id)])
      );
    } catch {
      /* noop */
    }

    // Try posting to API if online
    const api = process.env.NEXT_PUBLIC_API_URL;
    if (api) {
      try {
        const token = window.localStorage.getItem('tsc_token');
        await fetch(`${api}/api/news`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(newArticle),
        });
      } catch {
        /* fallback handled */
      }
    }

    setArticles((prev) => [newArticle, ...prev]);
    setSubmittingNews(false);
    setIsNewsModalOpen(false);

    // Reset Form
    setNewsTitle('');
    setNewsExcerpt('');
    setNewsContent('');
    setNewsAuthor('');

    push(
      `Campus News published for ${campus.name}! It is now live on this campus and the Main News page.`,
      'success'
    );
  };

  // Submit Story
  const handlePublishStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyTitle.trim() || !storyDek.trim()) {
      push('Please provide a story title and one-line summary.', 'error');
      return;
    }

    setSubmittingStory(true);

    const slug = slugify(`${storyTitle}-${campus.name.split(' ')[0]}-${Date.now().toString(36)}`);
    const newStory: Story = {
      id: `story-local-${Date.now()}`,
      slug,
      title: storyTitle.trim(),
      dek: storyDek.trim(),
      category: storyCategory,
      image: storyImage || '/images/stories/story-1.jpg',
      imageAlt: storyTitle.trim(),
      author: storyAuthor.trim() || 'Campus Contributor',
      authorRole: storyAuthorRole.trim() || 'Student',
      campus: campus.name,
      date: new Date().toISOString(),
      readingTime: Math.max(3, Math.ceil((storyContent.length || storyDek.length) / 500)),
      content: storyContent.trim()
        ? storyContent.split('\n\n').filter(Boolean)
        : [storyDek.trim()],
      featured: false,
      status: 'published',
    };

    // Save to local cache
    try {
      const existing: Story[] = JSON.parse(
        window.localStorage.getItem('tsc.custom.stories') || '[]'
      );
      window.localStorage.setItem(
        'tsc.custom.stories',
        JSON.stringify([newStory, ...existing.filter((s) => s.id !== newStory.id)])
      );
    } catch {
      /* noop */
    }

    // Try posting to API if online
    const api = process.env.NEXT_PUBLIC_API_URL;
    if (api) {
      try {
        const token = window.localStorage.getItem('tsc_token');
        await fetch(`${api}/api/stories`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(newStory),
        });
      } catch {
        /* fallback handled */
      }
    }

    setStories((prev) => [newStory, ...prev]);
    setSubmittingStory(false);
    setIsStoryModalOpen(false);

    // Reset Form
    setStoryTitle('');
    setStoryDek('');
    setStoryContent('');
    setStoryAuthor('');

    push(
      `Campus Story published for ${campus.name}! It is now live on this campus and the Main Stories page.`,
      'success'
    );
  };

  return (
    <div className="space-y-8">
      {/* Header & Quick Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-hairline pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-xl font-bold text-ink">Campus News &amp; Stories</h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-0.5 text-[11px] font-bold text-brand">
              <School className="h-3 w-3" /> {campus.name}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">
            Posts added here are featured on this campus directory and cross-published to the Main News &amp; Main Stories feeds.
          </p>
        </div>

        {/* Post Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsNewsModalOpen(true)}
            className="text-xs"
          >
            <Plus className="mr-1 h-3.5 w-3.5 text-brand" /> Post Campus News
          </Button>

          <Button
            size="sm"
            variant="accent"
            onClick={() => setIsStoryModalOpen(true)}
            className="text-xs"
          >
            <PenLine className="mr-1 h-3.5 w-3.5" /> Share Campus Story
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-hairline">
        <button
          type="button"
          onClick={() => setActiveTab('news')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 font-display text-xs font-bold uppercase tracking-wider transition-colors ${
            activeTab === 'news'
              ? 'border-brand text-brand'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <Newspaper className="h-4 w-4" /> Campus News &amp; Updates ({articles.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('stories')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 font-display text-xs font-bold uppercase tracking-wider transition-colors ${
            activeTab === 'stories'
              ? 'border-brand text-brand'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <BookOpen className="h-4 w-4" /> Campus Stories &amp; Voices ({stories.length})
        </button>
      </div>

      {/* News Tab Content */}
      {activeTab === 'news' && (
        <div className="space-y-6">
          {articles.length === 0 ? (
            <div className="rounded-lg border border-dashed border-hairline bg-cream/30 p-8 text-center">
              <Newspaper className="mx-auto h-8 w-8 text-muted/50 mb-2" />
              <h3 className="font-display text-base font-bold text-ink">No News Reported Yet</h3>
              <p className="mt-1 text-xs text-muted max-w-md mx-auto">
                Be the first to share campus developments, research breakthroughs, club activities, or announcements from {campus.name}.
              </p>
              <Button
                size="sm"
                variant="primary"
                onClick={() => setIsNewsModalOpen(true)}
                className="mt-4"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Post First Campus News
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {articles.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          )}

          <div className="flex items-center justify-between rounded-lg border border-hairline bg-cream/40 p-4 text-xs">
            <span className="text-muted">
              Want to see stories from all colleges across India?
            </span>
            <Link
              href="/news"
              className="font-display font-bold text-brand hover:underline inline-flex items-center gap-1"
            >
              Explore Main Newsroom <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Stories Tab Content */}
      {activeTab === 'stories' && (
        <div className="space-y-6">
          {stories.length === 0 ? (
            <div className="rounded-lg border border-dashed border-hairline bg-cream/30 p-8 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-muted/50 mb-2" />
              <h3 className="font-display text-base font-bold text-ink">No Stories Shared Yet</h3>
              <p className="mt-1 text-xs text-muted max-w-md mx-auto">
                Share inspiring student journeys, maker projects, startups, or community initiatives emerging from {campus.name}.
              </p>
              <Button
                size="sm"
                variant="accent"
                onClick={() => setIsStoryModalOpen(true)}
                className="mt-4"
              >
                <PenLine className="mr-1.5 h-3.5 w-3.5" /> Share Campus Story
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {stories.map((s) => (
                <StoryCard key={s.id} story={s} />
              ))}
            </div>
          )}

          <div className="flex items-center justify-between rounded-lg border border-hairline bg-cream/40 p-4 text-xs">
            <span className="text-muted">
              Discover student voices, startup founders, and changemakers across India:
            </span>
            <Link
              href="/stories"
              className="font-display font-bold text-brand hover:underline inline-flex items-center gap-1"
            >
              Explore All Stories <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* ── Post Campus News Modal ── */}
      {isNewsModalOpen && (
        <Modal
          open={isNewsModalOpen}
          onClose={() => setIsNewsModalOpen(false)}
          title={`Post News — ${campus.name}`}
          wide
        >
          <form onSubmit={handlePublishNews} className="space-y-5">
            {/* Campus Lock Badge */}
            <div className="flex items-center gap-2 rounded-md border border-brand/20 bg-brand-50/70 p-3 text-xs">
              <School className="h-4 w-4 text-brand shrink-0" />
              <div>
                <p className="font-bold text-brand">Campus Affiliation: {campus.name}</p>
                <p className="text-[11px] text-muted">
                  This news will be published to <strong>{campus.name}</strong> and cross-listed in the <strong>Main News Page</strong>.
                </p>
              </div>
            </div>

            <div>
              <label className="mb-1 block font-display text-xs font-bold text-ink">
                News Headline <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newsTitle}
                onChange={(e) => setNewsTitle(e.target.value)}
                placeholder="e.g. Campus Robotics Team Wins National AI Challenge"
                className="w-full rounded-md border border-hairline px-3 py-2 text-sm focus:border-brand focus:outline-none"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block font-display text-xs font-bold text-ink">
                  Category
                </label>
                <select
                  value={newsCategory}
                  onChange={(e) => setNewsCategory(e.target.value as NewsCategory)}
                  className="w-full rounded-md border border-hairline px-3 py-2 text-sm focus:border-brand focus:outline-none"
                >
                  {NEWS_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block font-display text-xs font-bold text-ink">
                  Reporter / Author Name
                </label>
                <input
                  type="text"
                  value={newsAuthor}
                  onChange={(e) => setNewsAuthor(e.target.value)}
                  placeholder="e.g. Student Editorial Lead"
                  className="w-full rounded-md border border-hairline px-3 py-2 text-sm focus:border-brand focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block font-display text-xs font-bold text-ink">
                Brief Excerpt / Summary <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={newsExcerpt}
                onChange={(e) => setNewsExcerpt(e.target.value)}
                placeholder="A concise 1-2 sentence overview of what happened..."
                className="w-full rounded-md border border-hairline px-3 py-2 text-sm focus:border-brand focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block font-display text-xs font-bold text-ink">
                Full News Details / Report
              </label>
              <textarea
                rows={5}
                value={newsContent}
                onChange={(e) => setNewsContent(e.target.value)}
                placeholder="Write the full report here. Separate paragraphs with double enter..."
                className="w-full rounded-md border border-hairline px-3 py-2 text-sm focus:border-brand focus:outline-none"
              />
            </div>

            {/* Cover Image */}
            <div>
              <ImageUploadInput
                label="News Cover Image"
                value={newsImage}
                onChange={(url) => setNewsImage(url)}
                helpText="Upload a photo from the event or paste an image URL."
              />
            </div>

            <div>
              <label className="mb-1 block font-display text-xs font-bold text-ink">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={newsTags}
                onChange={(e) => setNewsTags(e.target.value)}
                placeholder="e.g. Robotics, Hackathon, Campus Life"
                className="w-full rounded-md border border-hairline px-3 py-2 text-sm focus:border-brand focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-hairline pt-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsNewsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={submittingNews}
              >
                {submittingNews ? 'Publishing…' : 'Publish Campus News'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Share Campus Story Modal ── */}
      {isStoryModalOpen && (
        <Modal
          open={isStoryModalOpen}
          onClose={() => setIsStoryModalOpen(false)}
          title={`Share Story — ${campus.name}`}
          wide
        >
          <form onSubmit={handlePublishStory} className="space-y-5">
            {/* Campus Lock Badge */}
            <div className="flex items-center gap-2 rounded-md border border-gold/40 bg-gold-50/70 p-3 text-xs">
              <Sparkles className="h-4 w-4 text-gold-deep shrink-0" />
              <div>
                <p className="font-bold text-gold-deep">Campus Spotlight: {campus.name}</p>
                <p className="text-[11px] text-muted">
                  This story will be published to <strong>{campus.name}</strong> and cross-listed on the <strong>Main Stories Page</strong>.
                </p>
              </div>
            </div>

            <div>
              <label className="mb-1 block font-display text-xs font-bold text-ink">
                Story Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={storyTitle}
                onChange={(e) => setStoryTitle(e.target.value)}
                placeholder="e.g. How Four Students Built an EV Prototype in the Campus Workshop"
                className="w-full rounded-md border border-hairline px-3 py-2 text-sm focus:border-brand focus:outline-none"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block font-display text-xs font-bold text-ink">
                  Story Category
                </label>
                <select
                  value={storyCategory}
                  onChange={(e) => setStoryCategory(e.target.value as StoryCategory)}
                  className="w-full rounded-md border border-hairline px-3 py-2 text-sm focus:border-brand focus:outline-none"
                >
                  {STORY_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block font-display text-xs font-bold text-ink">
                  Author &amp; Campus Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={storyAuthor}
                    onChange={(e) => setStoryAuthor(e.target.value)}
                    placeholder="Author name"
                    className="rounded-md border border-hairline px-3 py-2 text-sm focus:border-brand focus:outline-none"
                  />
                  <input
                    type="text"
                    value={storyAuthorRole}
                    onChange={(e) => setStoryAuthorRole(e.target.value)}
                    placeholder="e.g. Final Year Student"
                    className="rounded-md border border-hairline px-3 py-2 text-sm focus:border-brand focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1 block font-display text-xs font-bold text-ink">
                Story Hook / Dek <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={storyDek}
                onChange={(e) => setStoryDek(e.target.value)}
                placeholder="The inspiring takeaway or 1-line hook of this journey..."
                className="w-full rounded-md border border-hairline px-3 py-2 text-sm focus:border-brand focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block font-display text-xs font-bold text-ink">
                Full Story Narrative
              </label>
              <textarea
                rows={5}
                value={storyContent}
                onChange={(e) => setStoryContent(e.target.value)}
                placeholder="Share the full journey: the idea, challenges faced, learning curves, and where it is headed today..."
                className="w-full rounded-md border border-hairline px-3 py-2 text-sm focus:border-brand focus:outline-none"
              />
            </div>

            {/* Cover Image */}
            <div>
              <ImageUploadInput
                label="Story Cover Image"
                value={storyImage}
                onChange={(url) => setStoryImage(url)}
                helpText="Upload a photo of the students/project or paste an image URL."
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-hairline pt-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsStoryModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="accent"
                size="sm"
                disabled={submittingStory}
              >
                {submittingStory ? 'Publishing…' : 'Publish Campus Story'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
