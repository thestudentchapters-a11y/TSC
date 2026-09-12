'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  School,
  Newspaper,
  BookOpen,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  ExternalLink,
  MapPin,
  Building2,
  User,
  Share2,
  Check,
  X,
  ShieldCheck,
  ArrowLeft,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Field, Input, Textarea, Select, Checkbox } from '@/components/forms/Form';
import { ImageUploadInput } from '@/components/admin/ImageUploadInput';
import { useToast } from '@/components/common/Toast';
import {
  type Campus,
  type Article,
  type Story,
  type ContentStatus,
  type CampusSubmissionRecord,
  type StorySubmissionRecord,
  type NewsCategory,
  type StoryCategory,
} from '@/types/content';
import {
  demoCampuses,
  demoArticles,
  demoStories,
  demoCampusSubmissions,
  demoStorySubmissions,
} from '@/data/content';
import { slugify, formatDate, cn } from '@/lib/utils';

type SubTabType = 'news' | 'stories' | 'submissions';

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

export function SingleCampusAdmin({ slug }: { slug: string }) {
  const { push } = useToast();

  const [activeTab, setActiveTab] = useState<SubTabType>('news');
  const [searchQuery, setSearchQuery] = useState('');

  // Data states
  const [campuses, setCampuses] = useState<Campus[]>(demoCampuses);
  const [articles, setArticles] = useState<Article[]>(demoArticles);
  const [stories, setStories] = useState<Story[]>(demoStories);
  const [campusSubs, setCampusSubs] = useState<CampusSubmissionRecord[]>(demoCampusSubmissions);
  const [storySubs, setStorySubs] = useState<StorySubmissionRecord[]>(demoStorySubmissions);

  // Modals
  const [isCampusModalOpen, setIsCampusModalOpen] = useState(false);
  const [campusForm, setCampusForm] = useState({
    name: '',
    university: '',
    city: '',
    state: '',
    type: 'Engineering College',
    description: '',
    image: '/images/campus/campus-1.jpg',
    categories: '',
  });

  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<Article | null>(null);
  const [newsForm, setNewsForm] = useState({
    title: '',
    category: 'Student News' as NewsCategory,
    author: '',
    excerpt: '',
    content: '',
    image: '/images/news/news-1.jpg',
    tags: '',
    status: 'published' as ContentStatus,
    featured: false,
  });

  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [storyForm, setStoryForm] = useState({
    title: '',
    category: 'campus' as StoryCategory,
    author: '',
    authorRole: 'Student Contributor',
    dek: '',
    content: '',
    image: '/images/stories/story-1.jpg',
    status: 'published' as ContentStatus,
    featured: false,
  });

  const [reviewingSubmission, setReviewingSubmission] = useState<{
    type: 'campus' | 'story';
    data: CampusSubmissionRecord | StorySubmissionRecord;
  } | null>(null);

  // Load datasets
  useEffect(() => {
    try {
      const storedCampuses = window.localStorage.getItem('tsc.admin.campuses');
      if (storedCampuses) {
        const parsed = JSON.parse(storedCampuses);
        if (parsed.added || parsed.edits) {
          const merged = [
            ...(parsed.added || []),
            ...demoCampuses.map((c) => parsed.edits?.[c.id] || c),
          ].filter((c) => !(parsed.deleted || []).includes(c.id));
          setCampuses(merged);
        }
      }

      const storedArticles = window.localStorage.getItem('tsc.custom.articles');
      if (storedArticles) {
        setArticles([...JSON.parse(storedArticles), ...demoArticles]);
      }

      const storedStories = window.localStorage.getItem('tsc.custom.stories');
      if (storedStories) {
        setStories([...JSON.parse(storedStories), ...demoStories]);
      }

      const storedCampusSubs = window.localStorage.getItem('tsc.admin.campusSubmissions');
      if (storedCampusSubs) {
        setCampusSubs(JSON.parse(storedCampusSubs));
      }

      const storedStorySubs = window.localStorage.getItem('tsc.admin.storySubmissions');
      if (storedStorySubs) {
        setStorySubs(JSON.parse(storedStorySubs));
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Match current campus
  const campus = useMemo(() => {
    return (
      campuses.find((c) => c.slug === slug || c.id === slug) ||
      demoCampuses.find((c) => c.slug === slug || c.id === slug) ||
      campuses[0]
    );
  }, [campuses, slug]);

  const campusPrefix = useMemo(() => {
    return campus?.name ? campus.name.split(' ')[0].toLowerCase() : '';
  }, [campus]);

  // Sync helpers
  const saveArticlesToLocal = (updated: Article[]) => {
    setArticles(updated);
    try {
      window.localStorage.setItem(
        'tsc.custom.articles',
        JSON.stringify(updated.filter((a) => a.demo !== true))
      );
    } catch {
      /* ignore */
    }
  };

  const saveStoriesToLocal = (updated: Story[]) => {
    setStories(updated);
    try {
      window.localStorage.setItem(
        'tsc.custom.stories',
        JSON.stringify(updated.filter((s) => s.demo !== true))
      );
    } catch {
      /* ignore */
    }
  };

  const saveCampusesToLocal = (updated: Campus[]) => {
    setCampuses(updated);
    try {
      window.localStorage.setItem('tsc.admin.campuses', JSON.stringify({ added: updated }));
    } catch {
      /* ignore */
    }
  };

  // Filtered lists specifically for this campus
  const campusArticles = useMemo(() => {
    if (!campus) return [];
    return articles.filter((a) => {
      const matchCampus =
        a.campus?.toLowerCase() === campus.name.toLowerCase() ||
        (campusPrefix && a.campus?.toLowerCase().includes(campusPrefix)) ||
        a.tags?.some(
          (t) =>
            t.toLowerCase() === campus.slug.toLowerCase() ||
            t.toLowerCase() === campus.name.toLowerCase()
        );
      const matchSearch =
        !searchQuery ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.author.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCampus && matchSearch;
    });
  }, [articles, campus, campusPrefix, searchQuery]);

  const campusStories = useMemo(() => {
    if (!campus) return [];
    return stories.filter((s) => {
      const matchCampus =
        s.campus?.toLowerCase() === campus.name.toLowerCase() ||
        (campusPrefix && s.campus?.toLowerCase().includes(campusPrefix));
      const matchSearch =
        !searchQuery ||
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.author && s.author.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCampus && matchSearch;
    });
  }, [stories, campus, campusPrefix, searchQuery]);

  const campusSubmissions = useMemo(() => {
    if (!campus) return [];
    const list: Array<{
      type: 'campus' | 'story';
      id: string;
      title: string;
      submitter: string;
      email: string;
      campus: string;
      category: string;
      summary: string;
      status: string;
      submittedOn: string;
      raw: CampusSubmissionRecord | StorySubmissionRecord;
    }> = [
      ...campusSubs
        .filter(
          (cs) =>
            cs.campus?.toLowerCase() === campus.name.toLowerCase() ||
            (campusPrefix && cs.campus?.toLowerCase().includes(campusPrefix))
        )
        .map((cs) => ({
          type: 'campus' as const,
          id: cs.id,
          title: cs.title,
          submitter: cs.name,
          email: cs.email,
          campus: cs.campus,
          category: cs.category,
          summary: cs.summary,
          status: cs.status,
          submittedOn: cs.submittedOn,
          raw: cs,
        })),
      ...storySubs
        .filter(
          (ss) =>
            ss.college?.toLowerCase() === campus.name.toLowerCase() ||
            (campusPrefix && ss.college?.toLowerCase().includes(campusPrefix))
        )
        .map((ss) => ({
          type: 'story' as const,
          id: ss.id,
          title: ss.title,
          submitter: ss.name,
          email: ss.email,
          campus: ss.college,
          category: ss.category,
          summary: ss.summary,
          status: ss.status,
          submittedOn: ss.submittedOn,
          raw: ss,
        })),
    ];
    return list;
  }, [campusSubs, storySubs, campus, campusPrefix]);

  // Modals Open
  const handleOpenNewsModal = (article?: Article) => {
    if (article) {
      setEditingNews(article);
      setNewsForm({
        title: article.title,
        category: article.category,
        author: article.author,
        excerpt: article.excerpt,
        content: Array.isArray(article.content)
          ? article.content.join('\n\n')
          : (article.content as any) || '',
        image: article.image,
        tags: article.tags?.join(', ') || '',
        status: article.status || 'published',
        featured: !!article.featured,
      });
    } else {
      setEditingNews(null);
      setNewsForm({
        title: '',
        category: 'Student News',
        author: 'Campus Editorial Team',
        excerpt: '',
        content: '',
        image: '/images/news/news-1.jpg',
        tags: campus?.slug || '',
        status: 'published',
        featured: false,
      });
    }
    setIsNewsModalOpen(true);
  };

  const handleSaveNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsForm.title.trim()) {
      push('Please enter a headline.', 'error');
      return;
    }
    if (!campus) return;

    if (editingNews) {
      const updated = articles.map((a) =>
        a.id === editingNews.id
          ? {
              ...a,
              title: newsForm.title,
              category: newsForm.category,
              author: newsForm.author,
              excerpt: newsForm.excerpt || newsForm.content.slice(0, 140) + '…',
              content: newsForm.content.split('\n\n').filter(Boolean),
              image: newsForm.image,
              tags: newsForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
              featured: newsForm.featured,
              status: newsForm.status as ContentStatus,
            }
          : a
      );
      saveArticlesToLocal(updated);
      push('News article updated successfully.', 'success');
    } else {
      const newArticle: Article = {
        id: `news-${Date.now()}`,
        slug: slugify(newsForm.title),
        title: newsForm.title,
        campus: campus.name,
        category: newsForm.category,
        author: newsForm.author || 'Campus Correspondent',
        excerpt: newsForm.excerpt || newsForm.content.slice(0, 140) + '…',
        content: newsForm.content.split('\n\n').filter(Boolean),
        date: new Date().toISOString(),
        readingTime: Math.max(1, Math.round(newsForm.content.split(/\s+/).length / 200)),
        image: newsForm.image,
        imageAlt: newsForm.title,
        tags: newsForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
        featured: newsForm.featured,
        status: newsForm.status as ContentStatus,
      };
      saveArticlesToLocal([newArticle, ...articles]);
      push(`Posted campus news for ${campus.name}!`, 'success');
    }
    setIsNewsModalOpen(false);
  };

  const handleDeleteNews = (id: string) => {
    if (confirm('Delete this campus news article? This cannot be undone.')) {
      const updated = articles.filter((a) => a.id !== id);
      saveArticlesToLocal(updated);
      push('News article deleted.', 'success');
    }
  };

  const handleOpenStoryModal = (story?: Story) => {
    if (story) {
      setEditingStory(story);
      setStoryForm({
        title: story.title,
        category: story.category,
        author: story.author || '',
        authorRole: story.authorRole || 'Student Contributor',
        dek: story.dek,
        content: Array.isArray(story.content)
          ? story.content.join('\n\n')
          : (story.content as any) || '',
        image: story.image,
        status: story.status || 'published',
        featured: !!story.featured,
      });
    } else {
      setEditingStory(null);
      setStoryForm({
        title: '',
        category: 'campus',
        author: '',
        authorRole: 'Student Contributor',
        dek: '',
        content: '',
        image: '/images/stories/story-1.jpg',
        status: 'published',
        featured: false,
      });
    }
    setIsStoryModalOpen(true);
  };

  const handleSaveStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyForm.title.trim()) {
      push('Please enter a story headline.', 'error');
      return;
    }
    if (!campus) return;

    if (editingStory) {
      const updated = stories.map((s) =>
        s.id === editingStory.id
          ? {
              ...s,
              title: storyForm.title,
              campus: campus.name,
              category: storyForm.category,
              author: storyForm.author,
              authorRole: storyForm.authorRole,
              dek: storyForm.dek,
              content: storyForm.content.split('\n\n').filter(Boolean),
              image: storyForm.image,
              status: storyForm.status as ContentStatus,
              featured: storyForm.featured,
            }
          : s
      );
      saveStoriesToLocal(updated);
      push('Campus story updated successfully.', 'success');
    } else {
      const newStory: Story = {
        id: `story-${Date.now()}`,
        slug: slugify(storyForm.title),
        title: storyForm.title,
        campus: campus.name,
        category: storyForm.category,
        author: storyForm.author || 'Student Contributor',
        authorRole: storyForm.authorRole || 'Student',
        dek: storyForm.dek || storyForm.content.slice(0, 120) + '…',
        content: storyForm.content.split('\n\n').filter(Boolean),
        date: new Date().toISOString(),
        readingTime: Math.max(2, Math.round(storyForm.content.split(/\s+/).length / 200)),
        image: storyForm.image,
        imageAlt: storyForm.title,
        featured: storyForm.featured,
        status: storyForm.status as ContentStatus,
      };
      saveStoriesToLocal([newStory, ...stories]);
      push(`Published campus story for ${campus.name}!`, 'success');
    }
    setIsStoryModalOpen(false);
  };

  const handleDeleteStory = (id: string) => {
    if (confirm('Delete this campus story? This cannot be undone.')) {
      const updated = stories.filter((s) => s.id !== id);
      saveStoriesToLocal(updated);
      push('Campus story deleted.', 'success');
    }
  };

  const handleOpenEditCampus = () => {
    if (!campus) return;
    setCampusForm({
      name: campus.name,
      university: campus.university,
      city: campus.city,
      state: campus.state,
      type: campus.type,
      description: campus.description,
      image: campus.image,
      categories: campus.categories?.join(', ') || '',
    });
    setIsCampusModalOpen(true);
  };

  const handleSaveCampus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campusForm.name.trim() || !campusForm.city.trim()) {
      push('Name and city are required.', 'error');
      return;
    }

    const updated = campuses.map((c) =>
      c.id === campus.id
        ? {
            ...c,
            name: campusForm.name,
            university: campusForm.university,
            city: campusForm.city,
            state: campusForm.state,
            type: campusForm.type,
            description: campusForm.description,
            image: campusForm.image,
            categories: campusForm.categories
              .split(',')
              .map((cat) => cat.trim())
              .filter(Boolean),
          }
        : c
    );
    saveCampusesToLocal(updated);
    push(`Updated details for ${campusForm.name}.`, 'success');
    setIsCampusModalOpen(false);
  };

  const handleApproveSubmission = (type: 'campus' | 'story', raw: any) => {
    if (type === 'campus') {
      const cs = raw as CampusSubmissionRecord;
      const newArticle: Article = {
        id: `news-${Date.now()}`,
        slug: slugify(cs.title),
        title: cs.title,
        campus: cs.campus,
        category: 'Student News',
        author: cs.name,
        excerpt: cs.summary,
        content: [cs.summary],
        date: new Date().toISOString(),
        readingTime: 2,
        image: '/images/news/news-1.jpg',
        imageAlt: cs.title,
        tags: [cs.category, 'Student Report'],
        featured: false,
        status: 'published',
      };
      saveArticlesToLocal([newArticle, ...articles]);
      const updatedSubs = campusSubs.map((s) => (s.id === cs.id ? { ...s, status: 'approved' as const } : s));
      setCampusSubs(updatedSubs);
      window.localStorage.setItem('tsc.admin.campusSubmissions', JSON.stringify(updatedSubs));
      push(`Approved and published submission to news!`, 'success');
    } else {
      const ss = raw as StorySubmissionRecord;
      const newStory: Story = {
        id: `story-${Date.now()}`,
        slug: slugify(ss.title),
        title: ss.title,
        campus: ss.college,
        category: (ss.category as StoryCategory) || 'student',
        author: ss.name,
        authorRole: 'Student Contributor',
        dek: ss.summary,
        content: [ss.summary],
        date: new Date().toISOString(),
        readingTime: 3,
        image: '/images/stories/story-1.jpg',
        imageAlt: ss.title,
        featured: false,
        status: 'published',
      };
      saveStoriesToLocal([newStory, ...stories]);
      const updatedSubs = storySubs.map((s) => (s.id === ss.id ? { ...s, status: 'approved' as const } : s));
      setStorySubs(updatedSubs);
      window.localStorage.setItem('tsc.admin.storySubmissions', JSON.stringify(updatedSubs));
      push(`Approved and published submission to stories!`, 'success');
    }
    setReviewingSubmission(null);
  };

  const handleRejectSubmission = (type: 'campus' | 'story', id: string) => {
    if (type === 'campus') {
      const updated = campusSubs.map((s) => (s.id === id ? { ...s, status: 'rejected' as const } : s));
      setCampusSubs(updated);
      window.localStorage.setItem('tsc.admin.campusSubmissions', JSON.stringify(updated));
    } else {
      const updated = storySubs.map((s) => (s.id === id ? { ...s, status: 'rejected' as const } : s));
      setStorySubs(updated);
      window.localStorage.setItem('tsc.admin.storySubmissions', JSON.stringify(updated));
    }
    push('Submission marked as rejected.', 'success');
    setReviewingSubmission(null);
  };

  if (!campus) {
    return (
      <div className="p-12 text-center">
        <School className="mx-auto h-12 w-12 text-muted/50" />
        <h2 className="mt-4 font-display text-xl font-bold">Campus Not Found</h2>
        <p className="mt-2 text-sm text-muted">The requested campus slug does not exist.</p>
        <Link href="/admin/campuses" className="mt-4 inline-block text-sm font-bold text-brand underline">
          &larr; Return to Campus Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/campuses"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-hairline bg-white text-muted hover:border-brand hover:text-brand transition-colors"
            title="Back to all campuses"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs text-muted">
              <Link href="/admin/campuses" className="hover:text-brand">
                Campuses
              </Link>
              <span>/</span>
              <span className="font-semibold text-ink">{campus.name}</span>
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-ink flex items-center gap-2 mt-0.5">
              <span>{campus.name}</span>
              <span className="rounded-full bg-cream border border-hairline px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-brand">
                {campus.type}
              </span>
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/campus/${campus.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-md border border-hairline bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-cream hover:text-brand transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" /> View Public Page
          </Link>
          <Button size="sm" variant="outline" onClick={handleOpenEditCampus}>
            <Pencil className="h-3.5 w-3.5 mr-1" /> Edit Campus Info
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleOpenNewsModal()}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Post News
          </Button>
          <Button size="sm" onClick={() => handleOpenStoryModal()}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Post Story
          </Button>
        </div>
      </div>

      {/* Campus Summary Banner Card */}
      <div className="card-base flex flex-col md:flex-row items-stretch gap-6 overflow-hidden p-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={campus.image}
          alt={campus.name}
          className="h-36 md:h-auto md:w-56 rounded-lg object-cover border border-hairline shrink-0"
        />
        <div className="flex-1 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
              <span className="flex items-center gap-1 font-semibold text-ink">
                <Building2 className="h-3.5 w-3.5 text-brand" /> {campus.university}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-brand" /> {campus.city}, {campus.state}
              </span>
            </div>
            <p className="mt-2.5 text-xs text-muted leading-relaxed max-w-3xl">
              {campus.description || 'Verified student chapter on The Student Chapters™ network.'}
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3 border-t border-hairline/60 pt-3 text-center sm:text-left">
            <div className="rounded-lg bg-blue-50/60 border border-blue-100 p-2.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-blue-800">Campus News</p>
              <p className="font-display text-lg font-bold text-blue-950 mt-0.5">{campusArticles.length}</p>
            </div>
            <div className="rounded-lg bg-emerald-50/60 border border-emerald-100 p-2.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Student Stories</p>
              <p className="font-display text-lg font-bold text-emerald-950 mt-0.5">{campusStories.length}</p>
            </div>
            <div className="rounded-lg bg-gold-50/60 border border-gold-100 p-2.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gold-deep">Submissions</p>
              <p className="font-display text-lg font-bold text-gold-deep mt-0.5">{campusSubmissions.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Search Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-hairline pb-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto rounded-lg bg-cream/70 p-1 border border-hairline/70">
          <button
            type="button"
            onClick={() => setActiveTab('news')}
            className={cn(
              'inline-flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-bold transition-all',
              activeTab === 'news'
                ? 'bg-brand text-white shadow-sm'
                : 'text-muted hover:text-ink'
            )}
          >
            <Newspaper className="h-3.5 w-3.5" />
            <span>Campus News ({campusArticles.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stories')}
            className={cn(
              'inline-flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-bold transition-all',
              activeTab === 'stories'
                ? 'bg-brand text-white shadow-sm'
                : 'text-muted hover:text-ink'
            )}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Campus Stories ({campusStories.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('submissions')}
            className={cn(
              'inline-flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-bold transition-all',
              activeTab === 'submissions'
                ? 'bg-gold-deep text-white shadow-sm'
                : 'text-muted hover:text-ink'
            )}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Campus Submissions ({campusSubmissions.length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab} for ${campus.name}…`}
            className="w-full rounded-md border border-hairline bg-white pl-8 pr-3 py-1.5 text-xs text-ink placeholder:text-muted focus:border-brand focus:outline-none"
          />
        </div>
      </div>

      {/* TAB 1: CAMPUS NEWS */}
      {activeTab === 'news' && (
        <div className="space-y-4">
          {campusArticles.length === 0 ? (
            <div className="card-base p-10 text-center space-y-3">
              <Newspaper className="mx-auto h-8 w-8 text-muted/40" />
              <p className="font-display text-sm font-bold text-ink">No News Articles Found for {campus.name}</p>
              <p className="text-xs text-muted max-w-sm mx-auto">
                Post breaking headlines, academic updates, student union reports, and event summaries.
              </p>
              <Button size="sm" onClick={() => handleOpenNewsModal()}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Post First Campus News
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border border-hairline bg-white">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-hairline bg-cream font-display text-[11px] font-bold uppercase tracking-wider text-muted">
                    <th className="px-4 py-3">News Headline</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Author</th>
                    <th className="px-4 py-3">Published Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {campusArticles.map((article) => (
                    <tr key={article.id} className="hover:bg-cream/40 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={article.image}
                            alt={article.title}
                            className="h-10 w-14 rounded object-cover border border-hairline shrink-0"
                          />
                          <div>
                            <p className="font-bold text-ink line-clamp-1">{article.title}</p>
                            <p className="text-[11px] text-muted line-clamp-1">{article.excerpt}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-block rounded bg-blue-50 border border-blue-200/80 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                          {article.category}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-muted font-medium">
                        {article.author}
                      </td>
                      <td className="px-4 py-3.5 text-muted">
                        {formatDate(article.date)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            'inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border',
                            article.status === 'published'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : 'bg-amber-50 text-amber-700 border-amber-300'
                          )}
                        >
                          {article.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/news/${article.slug}`}
                            target="_blank"
                            title="View Public Article"
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-hairline text-muted hover:border-brand hover:text-brand transition-colors"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleOpenNewsModal(article)}
                            title="Edit News"
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-hairline text-muted hover:border-brand hover:text-brand transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteNews(article.id)}
                            title="Delete News"
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-hairline text-muted hover:border-red-500 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CAMPUS STORIES */}
      {activeTab === 'stories' && (
        <div className="space-y-4">
          {campusStories.length === 0 ? (
            <div className="card-base p-10 text-center space-y-3">
              <BookOpen className="mx-auto h-8 w-8 text-muted/40" />
              <p className="font-display text-sm font-bold text-ink">No Stories Found for {campus.name}</p>
              <p className="text-xs text-muted max-w-sm mx-auto">
                Publish inspiring student founder journeys, changemaker interviews, and campus project spotlights.
              </p>
              <Button size="sm" onClick={() => handleOpenStoryModal()}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Post First Campus Story
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border border-hairline bg-white">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-hairline bg-cream font-display text-[11px] font-bold uppercase tracking-wider text-muted">
                    <th className="px-4 py-3">Story Title</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Author</th>
                    <th className="px-4 py-3">Published Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {campusStories.map((story) => (
                    <tr key={story.id} className="hover:bg-cream/40 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={story.image}
                            alt={story.title}
                            className="h-10 w-14 rounded object-cover border border-hairline shrink-0"
                          />
                          <div>
                            <p className="font-bold text-ink line-clamp-1">{story.title}</p>
                            <p className="text-[11px] text-muted line-clamp-1">{story.dek}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-block rounded bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-[10px] font-bold text-emerald-800 capitalize">
                          {story.category} Story
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-muted font-medium">
                        {story.author || 'Student Contributor'}
                      </td>
                      <td className="px-4 py-3.5 text-muted">
                        {formatDate(story.date)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            'inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border',
                            story.status === 'published'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : 'bg-amber-50 text-amber-700 border-amber-300'
                          )}
                        >
                          {story.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/stories/${story.slug}`}
                            target="_blank"
                            title="View Public Story"
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-hairline text-muted hover:border-brand hover:text-brand transition-colors"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleOpenStoryModal(story)}
                            title="Edit Story"
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-hairline text-muted hover:border-brand hover:text-brand transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteStory(story.id)}
                            title="Delete Story"
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-hairline text-muted hover:border-red-500 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CAMPUS SUBMISSIONS */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          {campusSubmissions.length === 0 ? (
            <div className="card-base p-10 text-center space-y-2">
              <ShieldCheck className="mx-auto h-8 w-8 text-muted/40" />
              <p className="font-display text-sm font-bold text-ink">No Incoming Submissions for {campus.name}</p>
              <p className="text-xs text-muted">
                Tips and stories submitted by students from this campus chapter will appear here for review.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border border-hairline bg-white">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-hairline bg-cream font-display text-[11px] font-bold uppercase tracking-wider text-muted">
                    <th className="px-4 py-3">Submission</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Submitted By</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {campusSubmissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-cream/40 transition-colors">
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-ink">{sub.title}</p>
                        <p className="text-[11px] text-muted line-clamp-1">{sub.summary}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-block rounded bg-gold-50 border border-gold/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold-deep">
                          {sub.type}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-ink">{sub.submitter}</p>
                        <p className="text-[11px] text-muted">{sub.email}</p>
                      </td>
                      <td className="px-4 py-3.5 text-muted">
                        {formatDate(sub.submittedOn)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            'inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border',
                            sub.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : sub.status === 'rejected'
                              ? 'bg-red-50 text-red-700 border-red-300'
                              : 'bg-gold-50 text-gold-deep border-gold/50'
                          )}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setReviewingSubmission({ type: sub.type, data: sub.raw })
                          }
                        >
                          Review &amp; Moderate
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: EDIT CAMPUS DETAILS */}
      {isCampusModalOpen && (
        <Modal
          open={isCampusModalOpen}
          onClose={() => setIsCampusModalOpen(false)}
          title={`Edit Campus: ${campus.name}`}
        >
          <form onSubmit={handleSaveCampus} className="space-y-4">
            <Field label="Campus Name" htmlFor="c-name" required>
              <Input
                id="c-name"
                value={campusForm.name}
                onChange={(e) => setCampusForm({ ...campusForm, name: e.target.value })}
                required
              />
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Affiliated University" htmlFor="c-uni">
                <Input
                  id="c-uni"
                  value={campusForm.university}
                  onChange={(e) => setCampusForm({ ...campusForm, university: e.target.value })}
                />
              </Field>
              <Field label="Institution Type" htmlFor="c-type">
                <Select
                  id="c-type"
                  value={campusForm.type}
                  onChange={(e) => setCampusForm({ ...campusForm, type: e.target.value })}
                >
                  <option value="Central University">Central University</option>
                  <option value="State University">State University</option>
                  <option value="Engineering College">Engineering College</option>
                  <option value="Medical College">Medical College</option>
                  <option value="Management Institute">Management Institute</option>
                  <option value="Law School">Law School</option>
                </Select>
              </Field>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="City" htmlFor="c-city" required>
                <Input
                  id="c-city"
                  value={campusForm.city}
                  onChange={(e) => setCampusForm({ ...campusForm, city: e.target.value })}
                  required
                />
              </Field>
              <Field label="State" htmlFor="c-state" required>
                <Input
                  id="c-state"
                  value={campusForm.state}
                  onChange={(e) => setCampusForm({ ...campusForm, state: e.target.value })}
                  required
                />
              </Field>
            </div>

            <ImageUploadInput
              label="Campus Banner Photo"
              value={campusForm.image}
              onChange={(url) => setCampusForm({ ...campusForm, image: url })}
            />

            <Field label="Campus Overview & Mission" htmlFor="c-desc">
              <Textarea
                id="c-desc"
                rows={3}
                value={campusForm.description}
                onChange={(e) => setCampusForm({ ...campusForm, description: e.target.value })}
              />
            </Field>

            <div className="flex justify-end gap-2.5 border-t border-hairline pt-4">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsCampusModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save Campus Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 2: CREATE / EDIT NEWS FOR THIS CAMPUS */}
      {isNewsModalOpen && (
        <Modal
          open={isNewsModalOpen}
          onClose={() => setIsNewsModalOpen(false)}
          title={editingNews ? `Edit News: ${editingNews.title}` : `Post News for ${campus.name}`}
        >
          <form onSubmit={handleSaveNews} className="space-y-4">
            <Field label="Headline / Title" htmlFor="n-title" required>
              <Input
                id="n-title"
                placeholder="e.g. Annual Tech Symposium Announced with 25+ Keynotes"
                value={newsForm.title}
                onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                required
              />
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="News Category" htmlFor="n-cat" required>
                <Select
                  id="n-cat"
                  value={newsForm.category}
                  onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value as NewsCategory })}
                >
                  {NEWS_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Author / Byline" htmlFor="n-auth" required>
                <Input
                  id="n-auth"
                  value={newsForm.author}
                  onChange={(e) => setNewsForm({ ...newsForm, author: e.target.value })}
                  placeholder="e.g. Campus Bureau"
                  required
                />
              </Field>
            </div>

            <ImageUploadInput
              label="Featured Image"
              value={newsForm.image}
              onChange={(url) => setNewsForm({ ...newsForm, image: url })}
            />

            <Field label="Short Excerpt" htmlFor="n-exc">
              <Textarea
                id="n-exc"
                rows={2}
                placeholder="Brief summary for listings and social cards"
                value={newsForm.excerpt}
                onChange={(e) => setNewsForm({ ...newsForm, excerpt: e.target.value })}
              />
            </Field>

            <Field label="Full Article Body (Paragraphs separated by blank line)" htmlFor="n-body" required>
              <Textarea
                id="n-body"
                rows={6}
                placeholder="Write full article body text..."
                value={newsForm.content}
                onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                required
              />
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Tags (comma-separated)" htmlFor="n-tags">
                <Input
                  id="n-tags"
                  value={newsForm.tags}
                  onChange={(e) => setNewsForm({ ...newsForm, tags: e.target.value })}
                  placeholder="e.g. tech, research, campus-fest"
                />
              </Field>

              <Field label="Publishing Status" htmlFor="n-stat">
                <Select
                  id="n-stat"
                  value={newsForm.status}
                  onChange={(e) => setNewsForm({ ...newsForm, status: e.target.value as ContentStatus })}
                >
                  <option value="published">Published (Live Immediately)</option>
                  <option value="draft">Draft</option>
                </Select>
              </Field>
            </div>

            <div className="flex justify-end gap-2.5 border-t border-hairline pt-4">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsNewsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                {editingNews ? 'Update News Article' : 'Publish Campus News'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 3: CREATE / EDIT STORY FOR THIS CAMPUS */}
      {isStoryModalOpen && (
        <Modal
          open={isStoryModalOpen}
          onClose={() => setIsStoryModalOpen(false)}
          title={editingStory ? `Edit Story: ${editingStory.title}` : `Post Story for ${campus.name}`}
        >
          <form onSubmit={handleSaveStory} className="space-y-4">
            <Field label="Story Title" htmlFor="s-title" required>
              <Input
                id="s-title"
                placeholder="e.g. From Dorm Room to Seed Funding: The Story of Three 3rd-Year Coders"
                value={storyForm.title}
                onChange={(e) => setStoryForm({ ...storyForm, title: e.target.value })}
                required
              />
            </Field>

            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Story Track" htmlFor="s-cat" required>
                <Select
                  id="s-cat"
                  value={storyForm.category}
                  onChange={(e) => setStoryForm({ ...storyForm, category: e.target.value as StoryCategory })}
                >
                  {STORY_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Student / Author Name" htmlFor="s-auth" required>
                <Input
                  id="s-auth"
                  value={storyForm.author}
                  onChange={(e) => setStoryForm({ ...storyForm, author: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  required
                />
              </Field>

              <Field label="Role / Department" htmlFor="s-role">
                <Input
                  id="s-role"
                  value={storyForm.authorRole}
                  onChange={(e) => setStoryForm({ ...storyForm, authorRole: e.target.value })}
                  placeholder="e.g. Founder & 3rd Year B.Tech"
                />
              </Field>
            </div>

            <ImageUploadInput
              label="Cover / Profile Photo"
              value={storyForm.image}
              onChange={(url) => setStoryForm({ ...storyForm, image: url })}
            />

            <Field label="Story Dek / Pull Quote" htmlFor="s-dek">
              <Textarea
                id="s-dek"
                rows={2}
                placeholder="A compelling one or two line summary of the journey..."
                value={storyForm.dek}
                onChange={(e) => setStoryForm({ ...storyForm, dek: e.target.value })}
              />
            </Field>

            <Field label="Full Story Narrative (Paragraphs separated by blank line)" htmlFor="s-body" required>
              <Textarea
                id="s-body"
                rows={6}
                placeholder="Write the full student story narrative..."
                value={storyForm.content}
                onChange={(e) => setStoryForm({ ...storyForm, content: e.target.value })}
                required
              />
            </Field>

            <div className="flex justify-between items-center border-t border-hairline pt-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-ink">
                <input
                  type="checkbox"
                  checked={storyForm.featured}
                  onChange={(e) => setStoryForm({ ...storyForm, featured: e.target.checked })}
                  className="rounded border-hairline text-brand"
                />
                Feature in Top Stories
              </label>

              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsStoryModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  {editingStory ? 'Update Story' : 'Publish Story'}
                </Button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 4: REVIEW INCOMING SUBMISSION */}
      {reviewingSubmission && (
        <Modal
          open={!!reviewingSubmission}
          onClose={() => setReviewingSubmission(null)}
          title={`Review Submission: ${reviewingSubmission.data.title}`}
        >
          <div className="space-y-4 text-xs">
            <div className="rounded-md border border-hairline bg-cream p-3.5 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-ink text-sm">{reviewingSubmission.data.title}</p>
                  <p className="text-muted mt-0.5">
                    Submitted by <span className="font-semibold text-ink">{reviewingSubmission.data.name}</span> (
                    {reviewingSubmission.data.email})
                  </p>
                </div>
                <span className="rounded-full bg-gold-50 border border-gold/40 px-2.5 py-0.5 font-bold uppercase tracking-wider text-gold-deep text-[10px]">
                  {reviewingSubmission.type}
                </span>
              </div>
            </div>

            <div>
              <p className="font-bold text-ink uppercase tracking-wider text-[11px] mb-1">Summary / Context</p>
              <p className="text-muted leading-relaxed rounded-md border border-hairline bg-white p-3">
                {reviewingSubmission.data.summary}
              </p>
            </div>

            <div className="flex justify-between items-center border-t border-hairline pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleRejectSubmission(reviewingSubmission.type, reviewingSubmission.data.id)}
                className="text-red-600 hover:bg-red-50 hover:border-red-300"
              >
                <X className="h-3.5 w-3.5 mr-1" /> Reject Submission
              </Button>

              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setReviewingSubmission(null)}>
                  Close
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleApproveSubmission(reviewingSubmission.type, reviewingSubmission.data)}
                >
                  <Check className="h-3.5 w-3.5 mr-1" /> Approve &amp; Publish Live
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
