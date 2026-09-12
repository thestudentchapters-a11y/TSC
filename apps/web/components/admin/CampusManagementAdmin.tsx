'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  School,
  Newspaper,
  BookOpen,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  Search,
  Filter,
  Pencil,
  Trash2,
  Eye,
  Send,
  ExternalLink,
  Sparkles,
  MapPin,
  Building2,
  User,
  Share2,
  Check,
  X,
  AlertCircle,
  ShieldCheck,
  Calendar,
  Layers,
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

type TabType = 'directory' | 'news' | 'stories' | 'approvals';

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

export function CampusManagementAdmin() {
  const { push } = useToast();
  const api = process.env.NEXT_PUBLIC_API_URL;

  const [activeTab, setActiveTab] = useState<TabType>('directory');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampusFilter, setSelectedCampusFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Data states
  const [campuses, setCampuses] = useState<Campus[]>(demoCampuses);
  const [articles, setArticles] = useState<Article[]>(demoArticles);
  const [stories, setStories] = useState<Story[]>(demoStories);
  const [campusSubs, setCampusSubs] = useState<CampusSubmissionRecord[]>(demoCampusSubmissions);
  const [storySubs, setStorySubs] = useState<StorySubmissionRecord[]>(demoStorySubmissions);

  // Modals
  const [isCampusModalOpen, setIsCampusModalOpen] = useState(false);
  const [editingCampus, setEditingCampus] = useState<Campus | null>(null);

  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<Article | null>(null);

  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);

  const [reviewingSubmission, setReviewingSubmission] = useState<{
    type: 'campus' | 'story';
    data: CampusSubmissionRecord | StorySubmissionRecord;
  } | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  // Campus Form State
  const [campusForm, setCampusForm] = useState({
    name: '',
    university: '',
    city: '',
    state: '',
    type: 'Engineering College',
    description: '',
    image: '/images/campus/campus-1.jpg',
    categories: 'Clubs & Communities, Campus Events',
  });

  // News Form State
  const [newsForm, setNewsForm] = useState({
    title: '',
    campus: '',
    category: 'Student News' as NewsCategory,
    excerpt: '',
    content: '',
    author: 'TSC Campus Desk',
    image: '/images/news/news-1.jpg',
    tags: 'Campus News, Student Initiative',
    status: 'published' as ContentStatus,
    featured: false,
  });

  // Story Form State
  const [storyForm, setStoryForm] = useState({
    title: '',
    campus: '',
    category: 'campus' as StoryCategory,
    author: '',
    authorRole: 'Student Contributor',
    dek: '',
    content: '',
    image: '/images/stories/story-1.jpg',
    status: 'published' as ContentStatus,
    featured: false,
  });

  // Load from localStorage or API
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

  // Sync helpers
  const saveCampusesToLocal = (updated: Campus[]) => {
    setCampuses(updated);
    try {
      window.localStorage.setItem('tsc.admin.campuses', JSON.stringify({ added: updated }));
    } catch {
      /* ignore */
    }
  };

  const saveArticlesToLocal = (updated: Article[]) => {
    setArticles(updated);
    try {
      window.localStorage.setItem('tsc.custom.articles', JSON.stringify(updated.filter((a) => a.demo !== true)));
    } catch {
      /* ignore */
    }
  };

  const saveStoriesToLocal = (updated: Story[]) => {
    setStories(updated);
    try {
      window.localStorage.setItem('tsc.custom.stories', JSON.stringify(updated.filter((s) => s.demo !== true)));
    } catch {
      /* ignore */
    }
  };

  // KPIs
  const campusArticlesCount = useMemo(
    () => articles.filter((a) => !!a.campus).length,
    [articles]
  );
  const campusStoriesCount = useMemo(
    () => stories.filter((s) => !!s.campus).length,
    [stories]
  );
  const pendingSubmissionsCount = useMemo(
    () =>
      campusSubs.filter((s) => s.status === 'pending' || s.status === 'under review').length +
      storySubs.filter((s) => s.status === 'pending' || s.status === 'under review').length,
    [campusSubs, storySubs]
  );

  // Campus Directory handlers
  const handleOpenCampusModal = (campus?: Campus) => {
    if (campus) {
      setEditingCampus(campus);
      setCampusForm({
        name: campus.name,
        university: campus.university,
        city: campus.city,
        state: campus.state,
        type: campus.type,
        description: campus.description,
        image: campus.image,
        categories: campus.categories.join(', '),
      });
    } else {
      setEditingCampus(null);
      setCampusForm({
        name: '',
        university: '',
        city: '',
        state: '',
        type: 'Engineering College',
        description: '',
        image: '/images/campus/campus-1.jpg',
        categories: 'Clubs & Communities, Campus Events',
      });
    }
    setIsCampusModalOpen(true);
  };

  const handleSaveCampus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campusForm.name.trim() || !campusForm.city.trim() || !campusForm.state.trim()) {
      push('Please fill in required campus fields (Name, City, State).', 'error');
      return;
    }

    if (editingCampus) {
      const updated = campuses.map((c) =>
        c.id === editingCampus.id
          ? {
              ...c,
              name: campusForm.name,
              university: campusForm.university || campusForm.name,
              city: campusForm.city,
              state: campusForm.state,
              type: campusForm.type,
              description: campusForm.description,
              image: campusForm.image,
              categories: campusForm.categories.split(',').map((s) => s.trim()).filter(Boolean),
            }
          : c
      );
      saveCampusesToLocal(updated);
      push(`Updated ${campusForm.name}`, 'success');
    } else {
      const newCampus: Campus = {
        id: `campus-${Date.now()}`,
        slug: slugify(campusForm.name),
        name: campusForm.name,
        university: campusForm.university || campusForm.name,
        city: campusForm.city,
        state: campusForm.state,
        type: campusForm.type,
        description: campusForm.description,
        image: campusForm.image,
        imageAlt: `${campusForm.name} campus building`,
        categories: campusForm.categories.split(',').map((s) => s.trim()).filter(Boolean),
      };
      saveCampusesToLocal([newCampus, ...campuses]);
      push(`Added ${campusForm.name} to directory`, 'success');
    }
    setIsCampusModalOpen(false);
  };

  const handleDeleteCampus = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      const updated = campuses.filter((c) => c.id !== id);
      saveCampusesToLocal(updated);
      push(`Deleted ${name}`, 'success');
    }
  };

  // News handlers
  const handleOpenNewsModal = (article?: Article) => {
    if (article) {
      setEditingNews(article);
      setNewsForm({
        title: article.title,
        campus: article.campus || (campuses[0]?.name ?? ''),
        category: article.category,
        excerpt: article.excerpt,
        content: Array.isArray(article.content) ? article.content.join('\n\n') : (article.content as any) || '',
        author: article.author,
        image: article.image,
        tags: Array.isArray(article.tags) ? article.tags.join(', ') : '',
        status: (article as any).status || 'published',
        featured: !!article.featured,
      });
    } else {
      setEditingNews(null);
      setNewsForm({
        title: '',
        campus: selectedCampusFilter !== 'all' ? selectedCampusFilter : (campuses[0]?.name ?? ''),
        category: 'Student News',
        excerpt: '',
        content: '',
        author: 'TSC Campus Desk',
        image: '/images/news/news-1.jpg',
        tags: 'Campus News, Student Initiative',
        status: 'published',
        featured: false,
      });
    }
    setIsNewsModalOpen(true);
  };

  const handleSaveNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsForm.title.trim() || !newsForm.campus.trim() || !newsForm.content.trim()) {
      push('Please provide title, campus association, and news content.', 'error');
      return;
    }

    if (editingNews) {
      const updated = articles.map((a) =>
        a.id === editingNews.id
          ? {
              ...a,
              title: newsForm.title,
              campus: newsForm.campus,
              category: newsForm.category,
              excerpt: newsForm.excerpt || newsForm.content.slice(0, 160) + '…',
              content: newsForm.content.split('\n\n').filter(Boolean),
              author: newsForm.author,
              image: newsForm.image,
              tags: newsForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
              featured: newsForm.featured,
            }
          : a
      );
      saveArticlesToLocal(updated);
      push('Campus news article updated.', 'success');
    } else {
      const newArticle: Article = {
        id: `news-${Date.now()}`,
        slug: slugify(newsForm.title),
        title: newsForm.title,
        campus: newsForm.campus,
        category: newsForm.category,
        excerpt: newsForm.excerpt || newsForm.content.slice(0, 160) + '…',
        content: newsForm.content.split('\n\n').filter(Boolean),
        author: newsForm.author,
        date: new Date().toISOString(),
        readingTime: Math.max(1, Math.round(newsForm.content.split(/\s+/).length / 200)),
        image: newsForm.image,
        imageAlt: newsForm.title,
        tags: newsForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
        featured: newsForm.featured,
        status: newsForm.status as ContentStatus,
      };
      saveArticlesToLocal([newArticle, ...articles]);
      push(`Posted campus news for ${newsForm.campus}!`, 'success');
    }
    setIsNewsModalOpen(false);
  };

  const handleDeleteNews = (id: string) => {
    if (confirm('Delete this campus news article?')) {
      const updated = articles.filter((a) => a.id !== id);
      saveArticlesToLocal(updated);
      push('News article deleted.', 'success');
    }
  };

  // Story handlers
  const handleOpenStoryModal = (story?: Story) => {
    if (story) {
      setEditingStory(story);
      setStoryForm({
        title: story.title,
        campus: story.campus || (campuses[0]?.name ?? ''),
        category: story.category,
        author: story.author || '',
        authorRole: story.authorRole || '',
        dek: story.dek,
        content: Array.isArray(story.content) ? story.content.join('\n\n') : (story.content as any) || '',
        image: story.image,
        status: story.status || 'published',
        featured: !!story.featured,
      });
    } else {
      setEditingStory(null);
      setStoryForm({
        title: '',
        campus: selectedCampusFilter !== 'all' ? selectedCampusFilter : (campuses[0]?.name ?? ''),
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

    if (editingStory) {
      const updated = stories.map((s) =>
        s.id === editingStory.id
          ? {
              ...s,
              title: storyForm.title,
              campus: storyForm.campus,
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
      push('Campus story updated.', 'success');
    } else {
      const newStory: Story = {
        id: `story-${Date.now()}`,
        slug: slugify(storyForm.title),
        title: storyForm.title,
        campus: storyForm.campus,
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
      push(`Posted campus story for ${storyForm.campus}!`, 'success');
    }
    setIsStoryModalOpen(false);
  };

  const handleDeleteStory = (id: string) => {
    if (confirm('Delete this campus story?')) {
      const updated = stories.filter((s) => s.id !== id);
      saveStoriesToLocal(updated);
      push('Story deleted.', 'success');
    }
  };

  // Approval & Moderation Actions
  const handleApproveSubmission = (
    type: 'campus' | 'story',
    sub: CampusSubmissionRecord | StorySubmissionRecord
  ) => {
    if (type === 'campus') {
      const cs = sub as CampusSubmissionRecord;
      // Publish as Campus Article
      const newArticle: Article = {
        id: `approved-news-${Date.now()}`,
        slug: slugify(cs.title),
        title: cs.title,
        campus: cs.campus,
        category: 'Student News',
        excerpt: cs.summary,
        content: [cs.summary, `Submitted by ${cs.name} (${cs.email}) from ${cs.campus}, ${cs.city}.`],
        author: cs.name,
        date: new Date().toISOString(),
        readingTime: 2,
        image: '/images/news/news-2.jpg',
        imageAlt: cs.title,
        tags: ['Campus News', cs.category, cs.city],
        featured: false,
        status: 'published',
      };

      saveArticlesToLocal([newArticle, ...articles]);

      // Update submission status
      const updatedSubs = campusSubs.map((s) =>
        s.id === cs.id ? { ...s, status: 'approved' as const } : s
      );
      setCampusSubs(updatedSubs);
      window.localStorage.setItem('tsc.admin.campusSubmissions', JSON.stringify(updatedSubs));

      push(`Approved and published "${cs.title}" to ${cs.campus} newsroom!`, 'success');
    } else {
      const ss = sub as StorySubmissionRecord;
      // Publish as Campus Story
      const newStory: Story = {
        id: `approved-story-${Date.now()}`,
        slug: slugify(ss.title),
        title: ss.title,
        campus: ss.college,
        category: ss.category.toLowerCase().includes('startup') ? 'startup' : ss.category.toLowerCase().includes('student') ? 'student' : 'campus',
        author: ss.name,
        authorRole: `Student • ${ss.college}`,
        dek: ss.summary,
        content: [ss.summary, `Contributed by ${ss.name} from ${ss.college}, ${ss.city}. Published with review.`],
        date: new Date().toISOString(),
        readingTime: 3,
        image: '/images/stories/story-3.jpg',
        imageAlt: ss.title,
        featured: false,
        status: 'published',
      };

      saveStoriesToLocal([newStory, ...stories]);

      // Update submission status
      const updatedSubs = storySubs.map((s) =>
        s.id === ss.id ? { ...s, status: 'approved' as const } : s
      );
      setStorySubs(updatedSubs);
      window.localStorage.setItem('tsc.admin.storySubmissions', JSON.stringify(updatedSubs));

      push(`Approved and published "${ss.title}" to campus stories!`, 'success');
    }

    setReviewingSubmission(null);
  };

  const handleRejectSubmission = (
    type: 'campus' | 'story',
    id: string
  ) => {
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

  // Filtered lists
  const filteredCampuses = useMemo(() => {
    return campuses.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.state.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [campuses, searchQuery]);

  const filteredNews = useMemo(() => {
    return articles.filter((a) => {
      const matchesSearch =
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.campus && a.campus.toLowerCase().includes(searchQuery.toLowerCase())) ||
        a.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCampus =
        selectedCampusFilter === 'all' ||
        (a.campus && a.campus.toLowerCase().includes(selectedCampusFilter.toLowerCase()));
      return matchesSearch && matchesCampus;
    });
  }, [articles, searchQuery, selectedCampusFilter]);

  const filteredStories = useMemo(() => {
    return stories.filter((s) => {
      const matchesSearch =
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.campus && s.campus.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.author && s.author.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCampus =
        selectedCampusFilter === 'all' ||
        (s.campus && s.campus.toLowerCase().includes(selectedCampusFilter.toLowerCase()));
      return matchesSearch && matchesCampus;
    });
  }, [stories, searchQuery, selectedCampusFilter]);

  const combinedSubmissions = useMemo(() => {
    const list: Array<{
      type: 'campus' | 'story';
      id: string;
      title: string;
      submitter: string;
      email: string;
      campus: string;
      city: string;
      category: string;
      summary: string;
      status: string;
      submittedOn: string;
      raw: CampusSubmissionRecord | StorySubmissionRecord;
    }> = [
      ...campusSubs.map((cs) => ({
        type: 'campus' as const,
        id: cs.id,
        title: cs.title,
        submitter: cs.name,
        email: cs.email,
        campus: cs.campus,
        city: cs.city,
        category: cs.category,
        summary: cs.summary,
        status: cs.status,
        submittedOn: cs.submittedOn,
        raw: cs,
      })),
      ...storySubs.map((ss) => ({
        type: 'story' as const,
        id: ss.id,
        title: ss.title,
        submitter: ss.name,
        email: ss.email,
        campus: ss.college,
        city: ss.city,
        category: ss.category,
        summary: ss.summary,
        status: ss.status,
        submittedOn: ss.submittedOn,
        raw: ss,
      })),
    ];

    return list.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.campus.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.submitter.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCampus =
        selectedCampusFilter === 'all' ||
        item.campus.toLowerCase().includes(selectedCampusFilter.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesCampus && matchesStatus;
    });
  }, [campusSubs, storySubs, searchQuery, selectedCampusFilter, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-hairline pb-6">
        <div>
          <p className="eyebrow">Campus Network Operations</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink">
            Campuses, News &amp; Stories Hub
          </h1>
          <p className="mt-1 text-xs text-muted max-w-2xl leading-relaxed">
            Manage official campus directories, publish verified campus news and student stories, and moderate incoming community submissions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => handleOpenNewsModal()}>
            <Plus className="h-3.5 w-3.5" /> Post Campus News
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleOpenStoryModal()}>
            <Plus className="h-3.5 w-3.5" /> Post Campus Story
          </Button>
          <Button size="sm" onClick={() => handleOpenCampusModal()}>
            <Plus className="h-3.5 w-3.5" /> New Campus Profile
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div
          onClick={() => setActiveTab('directory')}
          className={cn(
            'cursor-pointer rounded-xl border p-4 transition-all duration-200',
            activeTab === 'directory'
              ? 'border-brand bg-brand-50/50 shadow-sm'
              : 'border-hairline bg-white hover:border-brand/30'
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Campuses</span>
            <School className="h-4 w-4 text-brand" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-ink">{campuses.length}</p>
          <p className="mt-0.5 text-[11px] text-muted">Registered colleges</p>
        </div>

        <div
          onClick={() => setActiveTab('news')}
          className={cn(
            'cursor-pointer rounded-xl border p-4 transition-all duration-200',
            activeTab === 'news'
              ? 'border-brand bg-brand-50/50 shadow-sm'
              : 'border-hairline bg-white hover:border-brand/30'
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Campus News</span>
            <Newspaper className="h-4 w-4 text-blue-600" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-ink">{campusArticlesCount}</p>
          <p className="mt-0.5 text-[11px] text-muted">Published articles</p>
        </div>

        <div
          onClick={() => setActiveTab('stories')}
          className={cn(
            'cursor-pointer rounded-xl border p-4 transition-all duration-200',
            activeTab === 'stories'
              ? 'border-brand bg-brand-50/50 shadow-sm'
              : 'border-hairline bg-white hover:border-brand/30'
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Campus Stories</span>
            <BookOpen className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-ink">{campusStoriesCount}</p>
          <p className="mt-0.5 text-[11px] text-muted">Student features</p>
        </div>

        <div
          onClick={() => setActiveTab('approvals')}
          className={cn(
            'cursor-pointer rounded-xl border p-4 transition-all duration-200',
            activeTab === 'approvals'
              ? 'border-gold bg-gold-50 shadow-sm'
              : 'border-hairline bg-white hover:border-gold/40'
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gold-deep">Review Queue</span>
            <Clock className="h-4 w-4 text-gold-deep" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-gold-deep">{pendingSubmissionsCount}</p>
          <p className="mt-0.5 text-[11px] text-muted">Pending approval</p>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-hairline pb-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto rounded-lg bg-cream/70 p-1 border border-hairline/70">
          <button
            type="button"
            onClick={() => setActiveTab('directory')}
            className={cn(
              'inline-flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-bold transition-all',
              activeTab === 'directory'
                ? 'bg-brand text-white shadow-sm'
                : 'text-muted hover:text-ink'
            )}
          >
            <School className="h-3.5 w-3.5" />
            <span>Campus Directory ({campuses.length})</span>
          </button>

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
            <span>Campus News ({campusArticlesCount})</span>
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
            <span>Campus Stories ({campusStoriesCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('approvals')}
            className={cn(
              'inline-flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-bold transition-all',
              activeTab === 'approvals'
                ? 'bg-gold-deep text-white shadow-sm'
                : 'text-muted hover:text-ink'
            )}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Submissions &amp; Approvals ({pendingSubmissionsCount})</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, campus, city…"
              className="w-full rounded-md border border-hairline bg-white pl-8 pr-3 py-1.5 text-xs text-ink placeholder:text-muted focus:border-brand focus:outline-none"
            />
          </div>

          {/* Campus Filter */}
          {(activeTab === 'news' || activeTab === 'stories' || activeTab === 'approvals') && (
            <select
              value={selectedCampusFilter}
              onChange={(e) => setSelectedCampusFilter(e.target.value)}
              className="rounded-md border border-hairline bg-white px-2.5 py-1.5 text-xs text-ink focus:border-brand focus:outline-none"
            >
              <option value="all">All Campuses</option>
              {campuses.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          {/* Status Filter for Approvals */}
          {activeTab === 'approvals' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-hairline bg-white px-2.5 py-1.5 text-xs text-ink focus:border-brand focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="under review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          )}
        </div>
      </div>

      {/* Tab 1: Campus Directory */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-md border border-hairline bg-white">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-hairline bg-cream font-display text-[11px] font-bold uppercase tracking-wider text-muted">
                  <th className="px-4 py-3">Campus Name</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">News &amp; Stories</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCampuses.map((campus) => {
                  const prefix = campus.name.split(' ')[0].toLowerCase();
                  const newsCount = articles.filter(
                    (a) =>
                      a.campus?.toLowerCase() === campus.name.toLowerCase() ||
                      a.campus?.toLowerCase().includes(prefix)
                  ).length;
                  const storiesCount = stories.filter(
                    (s) =>
                      s.campus?.toLowerCase() === campus.name.toLowerCase() ||
                      s.campus?.toLowerCase().includes(prefix)
                  ).length;

                  return (
                    <tr
                      key={campus.id}
                      className="border-b border-hairline/60 last:border-0 hover:bg-cream/40 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/campuses/${campus.slug}`}
                          className="group flex items-center gap-3"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={campus.image}
                            alt={campus.name}
                            className="h-10 w-14 rounded object-cover border border-hairline shrink-0 group-hover:ring-1 group-hover:ring-brand"
                          />
                          <div>
                            <p className="font-bold text-ink group-hover:text-brand transition-colors flex items-center gap-1.5">
                              <span>{campus.name}</span>
                              <span className="opacity-0 group-hover:opacity-100 text-xs text-brand">&rarr;</span>
                            </p>
                            <p className="text-[11px] text-muted">{campus.university}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-brand" />
                          <span>
                            {campus.city}, {campus.state}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block rounded-full bg-cream px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink border border-hairline">
                          {campus.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/campuses/${campus.slug}`}
                          className="inline-flex items-center gap-2 rounded-md hover:bg-cream/80 p-1 -m-1 transition-colors"
                          title="Manage news and stories for this campus"
                        >
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700">
                            <Newspaper className="h-3 w-3" /> {newsCount} news
                          </span>
                          <span className="text-muted">•</span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                            <BookOpen className="h-3 w-3" /> {storiesCount} stories
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/campuses/${campus.slug}`}
                            className="hidden sm:inline-flex items-center gap-1 rounded bg-brand-50 border border-brand/20 px-2.5 py-1 text-[11px] font-bold text-brand hover:bg-brand hover:text-white transition-colors mr-1"
                          >
                            <Layers className="h-3 w-3" /> Manage Hub
                          </Link>
                          <Link
                            href={`/campus/${campus.slug}`}
                            target="_blank"
                            title="View Public Page"
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-hairline text-muted hover:border-brand hover:text-brand transition-colors"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleOpenCampusModal(campus)}
                            title="Edit Campus"
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-hairline text-muted hover:border-brand hover:text-brand transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCampus(campus.id, campus.name)}
                            title="Delete Campus"
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-hairline text-muted hover:border-red-500 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredCampuses.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted">
                      No campuses found. Click “New Campus Profile” to add one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Campus News */}
      {activeTab === 'news' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-cream/40 p-3 rounded-lg border border-hairline">
            <span className="text-xs font-semibold text-ink">
              Showing {filteredNews.length} campus news articles
              {selectedCampusFilter !== 'all' ? ` for "${selectedCampusFilter}"` : ''}
            </span>
            <Button size="sm" onClick={() => handleOpenNewsModal()}>
              <Plus className="h-3.5 w-3.5" /> Post News
            </Button>
          </div>

          <div className="overflow-x-auto rounded-md border border-hairline bg-white">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-hairline bg-cream font-display text-[11px] font-bold uppercase tracking-wider text-muted">
                  <th className="px-4 py-3">News Headline</th>
                  <th className="px-4 py-3">Campus</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredNews.map((article) => (
                  <tr
                    key={article.id}
                    className="border-b border-hairline/60 last:border-0 hover:bg-cream/40 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={article.image}
                          alt={article.title}
                          className="h-9 w-14 rounded object-cover border border-hairline shrink-0"
                        />
                        <div>
                          <p className="font-bold text-ink max-w-md truncate">{article.title}</p>
                          <p className="text-[11px] text-muted truncate">By {article.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded bg-brand-50 px-2 py-0.5 text-[10.5px] font-bold text-brand border border-brand/20">
                        <School className="h-3 w-3" /> {article.campus || 'General Campus'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-cream px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted border border-hairline">
                        {article.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted">{formatDate(article.date)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/news/${article.slug}`}
                          target="_blank"
                          title="View Live News"
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
                {filteredNews.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted">
                      No campus news articles matching the filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Campus Stories */}
      {activeTab === 'stories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-cream/40 p-3 rounded-lg border border-hairline">
            <span className="text-xs font-semibold text-ink">
              Showing {filteredStories.length} campus stories
              {selectedCampusFilter !== 'all' ? ` for "${selectedCampusFilter}"` : ''}
            </span>
            <Button size="sm" onClick={() => handleOpenStoryModal()}>
              <Plus className="h-3.5 w-3.5" /> Post Story
            </Button>
          </div>

          <div className="overflow-x-auto rounded-md border border-hairline bg-white">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-hairline bg-cream font-display text-[11px] font-bold uppercase tracking-wider text-muted">
                  <th className="px-4 py-3">Story Title</th>
                  <th className="px-4 py-3">Campus</th>
                  <th className="px-4 py-3">Student / Guest</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStories.map((story) => (
                  <tr
                    key={story.id}
                    className="border-b border-hairline/60 last:border-0 hover:bg-cream/40 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={story.image}
                          alt={story.title}
                          className="h-9 w-14 rounded object-cover border border-hairline shrink-0"
                        />
                        <div>
                          <p className="font-bold text-ink max-w-md truncate">{story.title}</p>
                          <p className="text-[11px] text-muted truncate">{story.dek}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10.5px] font-bold text-emerald-800 border border-emerald-200">
                        <School className="h-3 w-3" /> {story.campus || 'General Campus'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      <p className="font-semibold text-ink">{story.author}</p>
                      <p className="text-[10.5px] text-muted">{story.authorRole}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-cream px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted border border-hairline">
                        {story.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted">{formatDate(story.date)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/stories/${story.slug}`}
                          target="_blank"
                          title="View Live Story"
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
                {filteredStories.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted">
                      No campus stories matching the filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Submissions & Approvals */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-gold/40 bg-gold-50 p-4 text-xs leading-relaxed text-ink/90 flex items-start gap-2.5">
            <ShieldCheck className="h-5 w-5 text-gold-deep shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-ink">Campus Content Moderation Queue: </span>
              <span>
                Review submissions sent by student contributors and campus representatives. Approving a submission immediately publishes it as a live Campus News Article or Campus Story.
              </span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-md border border-hairline bg-white">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-hairline bg-cream font-display text-[11px] font-bold uppercase tracking-wider text-muted">
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Headline / Title</th>
                  <th className="px-4 py-3">Campus &amp; Submitter</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody>
                {combinedSubmissions.map((sub) => (
                  <tr
                    key={sub.id}
                    className="border-b border-hairline/60 last:border-0 hover:bg-cream/40 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                          sub.type === 'campus'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        )}
                      >
                        {sub.type === 'campus' ? <Newspaper className="h-3 w-3" /> : <BookOpen className="h-3 w-3" />}
                        {sub.type === 'campus' ? 'News' : 'Story'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-ink max-w-md">{sub.title}</p>
                      <p className="text-[11px] text-muted line-clamp-1">{sub.summary}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-brand flex items-center gap-1">
                        <School className="h-3 w-3" /> {sub.campus}
                      </p>
                      <p className="text-[11px] text-muted">
                        {sub.submitter} ({sub.email}) • {sub.city}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-muted">{formatDate(sub.submittedOn)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                          sub.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                            : sub.status === 'rejected'
                            ? 'bg-red-50 text-red-700 border border-red-300'
                            : 'bg-amber-50 text-amber-800 border border-amber-300'
                        )}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setReviewingSubmission({
                              type: sub.type,
                              data: sub.raw,
                            })
                          }
                          className="h-7 text-xs px-2.5"
                        >
                          <Eye className="h-3 w-3" /> Review
                        </Button>

                        {sub.status !== 'approved' && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleApproveSubmission(sub.type, sub.raw)}
                            className="h-7 text-xs px-2.5 bg-emerald-600 hover:bg-emerald-700"
                          >
                            <Check className="h-3 w-3" /> Approve
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {combinedSubmissions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted">
                      No submissions in the moderation queue.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Campus Form Modal */}
      <Modal
        open={isCampusModalOpen}
        onClose={() => setIsCampusModalOpen(false)}
        title={editingCampus ? `Edit ${editingCampus.name}` : 'Add New Campus Profile'}
        wide
      >
        <form onSubmit={handleSaveCampus} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Campus Name" htmlFor="c-name" required>
              <Input
                id="c-name"
                value={campusForm.name}
                onChange={(e) => setCampusForm({ ...campusForm, name: e.target.value })}
                placeholder="e.g. Nalanda Institute of Technology"
              />
            </Field>

            <Field label="University / Affiliation" htmlFor="c-uni">
              <Input
                id="c-uni"
                value={campusForm.university}
                onChange={(e) => setCampusForm({ ...campusForm, university: e.target.value })}
                placeholder="e.g. Nalanda University"
              />
            </Field>

            <Field label="City" htmlFor="c-city" required>
              <Input
                id="c-city"
                value={campusForm.city}
                onChange={(e) => setCampusForm({ ...campusForm, city: e.target.value })}
                placeholder="e.g. Patna"
              />
            </Field>

            <Field label="State" htmlFor="c-state" required>
              <Input
                id="c-state"
                value={campusForm.state}
                onChange={(e) => setCampusForm({ ...campusForm, state: e.target.value })}
                placeholder="e.g. Bihar"
              />
            </Field>

            <Field label="Institution Type" htmlFor="c-type">
              <Input
                id="c-type"
                value={campusForm.type}
                onChange={(e) => setCampusForm({ ...campusForm, type: e.target.value })}
                placeholder="e.g. Engineering College / University Campus / School"
              />
            </Field>

            <Field label="Categories & Tags (comma separated)" htmlFor="c-cats">
              <Input
                id="c-cats"
                value={campusForm.categories}
                onChange={(e) => setCampusForm({ ...campusForm, categories: e.target.value })}
                placeholder="Clubs & Communities, Campus Events"
              />
            </Field>
          </div>

          <Field label="Description" htmlFor="c-desc">
            <Textarea
              id="c-desc"
              value={campusForm.description}
              onChange={(e) => setCampusForm({ ...campusForm, description: e.target.value })}
              placeholder="About this campus, clubs, student culture, and active chapters…"
              className="min-h-[100px]"
            />
          </Field>

          <ImageUploadInput
            label="Hero Image URL"
            value={campusForm.image}
            onChange={(url) => setCampusForm({ ...campusForm, image: url })}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-hairline">
            <Button variant="outline" size="sm" onClick={() => setIsCampusModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit">
              {editingCampus ? 'Save Changes' : 'Create Campus'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Campus News Post/Edit Modal */}
      <Modal
        open={isNewsModalOpen}
        onClose={() => setIsNewsModalOpen(false)}
        title={editingNews ? 'Edit Campus News Article' : 'Post News to Campus Newsroom'}
        wide
      >
        <form onSubmit={handleSaveNews} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="News Headline" htmlFor="n-title" required>
              <Input
                id="n-title"
                value={newsForm.title}
                onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                placeholder="e.g. Student Robot Team Wins National Hackathon"
              />
            </Field>

            <Field label="Target Campus" htmlFor="n-campus" required>
              <Select
                id="n-campus"
                value={newsForm.campus}
                onChange={(e) => setNewsForm({ ...newsForm, campus: e.target.value })}
              >
                <option value="">Select Campus…</option>
                {campuses.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.city})
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Category" htmlFor="n-cat">
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

            <Field label="Author / Reporter" htmlFor="n-auth">
              <Input
                id="n-auth"
                value={newsForm.author}
                onChange={(e) => setNewsForm({ ...newsForm, author: e.target.value })}
                placeholder="TSC Campus Desk or Student Name"
              />
            </Field>
          </div>

          <Field label="Short Excerpt (dek)" htmlFor="n-excerpt">
            <Input
              id="n-excerpt"
              value={newsForm.excerpt}
              onChange={(e) => setNewsForm({ ...newsForm, excerpt: e.target.value })}
              placeholder="1-2 sentences summarizing the campus news development…"
            />
          </Field>

          <Field label="News Content" htmlFor="n-content" required>
            <Textarea
              id="n-content"
              value={newsForm.content}
              onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
              placeholder="Full story, event details, background, and quotes from organizers/students…"
              className="min-h-[160px]"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <ImageUploadInput
              label="Article Thumbnail / Cover Image"
              value={newsForm.image}
              onChange={(url) => setNewsForm({ ...newsForm, image: url })}
            />

            <Field label="Tags (comma separated)" htmlFor="n-tags">
              <Input
                id="n-tags"
                value={newsForm.tags}
                onChange={(e) => setNewsForm({ ...newsForm, tags: e.target.value })}
                placeholder="Hackathon, Tech Club, Engineering"
              />
            </Field>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-hairline">
            <Button variant="outline" size="sm" onClick={() => setIsNewsModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit">
              {editingNews ? 'Save Changes' : 'Publish Campus News'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Campus Story Post/Edit Modal */}
      <Modal
        open={isStoryModalOpen}
        onClose={() => setIsStoryModalOpen(false)}
        title={editingStory ? 'Edit Campus Story' : 'Post Campus Story'}
        wide
      >
        <form onSubmit={handleSaveStory} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Story Title" htmlFor="s-title" required>
              <Input
                id="s-title"
                value={storyForm.title}
                onChange={(e) => setStoryForm({ ...storyForm, title: e.target.value })}
                placeholder="e.g. From Hostel Room to Campus Startup"
              />
            </Field>

            <Field label="Associated Campus" htmlFor="s-campus" required>
              <Select
                id="s-campus"
                value={storyForm.campus}
                onChange={(e) => setStoryForm({ ...storyForm, campus: e.target.value })}
              >
                <option value="">Select Campus…</option>
                {campuses.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.city})
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Student / Creator Name" htmlFor="s-author">
              <Input
                id="s-author"
                value={storyForm.author}
                onChange={(e) => setStoryForm({ ...storyForm, author: e.target.value })}
                placeholder="e.g. Ishaan Verma"
              />
            </Field>

            <Field label="Role / Year" htmlFor="s-role">
              <Input
                id="s-role"
                value={storyForm.authorRole}
                onChange={(e) => setStoryForm({ ...storyForm, authorRole: e.target.value })}
                placeholder="e.g. Founder & 3rd Year CSE Student"
              />
            </Field>

            <Field label="Story Category" htmlFor="s-cat">
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
          </div>

          <Field label="One-line Dek / Summary" htmlFor="s-dek">
            <Input
              id="s-dek"
              value={storyForm.dek}
              onChange={(e) => setStoryForm({ ...storyForm, dek: e.target.value })}
              placeholder="The essence of what happened, struggle, and outcome…"
            />
          </Field>

          <Field label="Story Narrative" htmlFor="s-content" required>
            <Textarea
              id="s-content"
              value={storyForm.content}
              onChange={(e) => setStoryForm({ ...storyForm, content: e.target.value })}
              placeholder="Tell the journey — starting point, challenges, mentors, milestones, and advice for fellow students…"
              className="min-h-[160px]"
            />
          </Field>

          <ImageUploadInput
            label="Story Cover Image"
            value={storyForm.image}
            onChange={(url) => setStoryForm({ ...storyForm, image: url })}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-hairline">
            <Button variant="outline" size="sm" onClick={() => setIsStoryModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit">
              {editingStory ? 'Save Changes' : 'Publish Story'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Review Submission Modal */}
      {reviewingSubmission && (
        <Modal
          open={!!reviewingSubmission}
          onClose={() => setReviewingSubmission(null)}
          title={`Review Submission: ${reviewingSubmission.data.title}`}
          wide
        >
          <div className="space-y-4 text-xs">
            <div className="grid gap-3 rounded-lg border border-hairline bg-cream/40 p-3.5 sm:grid-cols-2">
              <div>
                <p className="meta-text !text-[10px]">Submitter</p>
                <p className="font-bold text-ink mt-0.5">{reviewingSubmission.data.name}</p>
                <p className="text-muted">{reviewingSubmission.data.email}</p>
              </div>
              <div>
                <p className="meta-text !text-[10px]">Campus / College</p>
                <p className="font-bold text-brand mt-0.5">
                  {(reviewingSubmission.data as any).campus || (reviewingSubmission.data as any).college}
                </p>
                <p className="text-muted">
                  {reviewingSubmission.data.city}, {reviewingSubmission.data.state}
                </p>
              </div>
            </div>

            <div>
              <p className="meta-text !text-[10px]">Submission Title</p>
              <p className="font-display text-base font-bold text-ink mt-0.5">
                {reviewingSubmission.data.title}
              </p>
            </div>

            <div>
              <p className="meta-text !text-[10px]">Summary &amp; Content</p>
              <div className="mt-1 rounded-md border border-hairline bg-white p-3.5 text-xs leading-relaxed text-ink/80 max-h-48 overflow-y-auto">
                {reviewingSubmission.data.summary}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-hairline pt-4">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    handleRejectSubmission(
                      reviewingSubmission.type,
                      reviewingSubmission.data.id
                    )
                  }
                  className="text-red-600 hover:border-red-400"
                >
                  <X className="h-3.5 w-3.5" /> Reject Submission
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setReviewingSubmission(null)}>
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() =>
                    handleApproveSubmission(
                      reviewingSubmission.type,
                      reviewingSubmission.data
                    )
                  }
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Check className="h-3.5 w-3.5" /> Approve &amp; Publish to Campus
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
