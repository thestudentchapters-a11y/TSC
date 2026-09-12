/**
 * Server-side data access layer.
 * - When NEXT_PUBLIC_API_URL is set, content is pulled from the TSC REST API.
 * - Otherwise (and on any API failure) it falls back to bundled demo content,
 *   so the platform always renders — with graceful loading/error states upstream.
 */
import type {
  Article, Story, Campus, PodcastEpisode, TscEvent, Opportunity,
  CurrentAffairsEdition, LegalArticle, Campaign, SearchHit,
} from '@/types/content';
import {
  demoArticles, demoStories, demoCampuses, demoEpisodes, demoEvents,
  demoOpportunities, demoEditions, demoLegalArticles, flagshipCampaign,
} from '@/data/content';
import { getYoutubeThumbnailUrl, getPodcastThumbnail } from '@/lib/utils';

const API = process.env.NEXT_PUBLIC_API_URL;

const isObjectId = (v: any) => typeof v === 'string' && /^[a-f\d]{24}$/i.test(v);

function normalizeArticle(raw: any): Article {
  if (!raw) return demoArticles[0];
  return {
    id: raw.id || raw._id?.toString() || raw.slug,
    slug: raw.slug || '',
    title: raw.title || 'Untitled',
    excerpt: raw.excerpt || '',
    content: Array.isArray(raw.content)
      ? raw.content
      : typeof raw.content === 'string'
      ? raw.content.split('\n\n').filter(Boolean)
      : [],
    category:
      (typeof raw.category === 'object' && raw.category?.name ? raw.category.name : raw.category) ||
      'Student News',
    tags: Array.isArray(raw.tags)
      ? raw.tags.map((t: any) => (typeof t === 'string' ? t : t?.name || '')).filter(Boolean)
      : [],
    author:
      (typeof raw.author === 'object' && raw.author?.name ? raw.author.name : null) ||
      (typeof raw.author === 'string' && !isObjectId(raw.author) ? raw.author : null) ||
      'TSC Editorial',
    campus: typeof raw.campus === 'object' && raw.campus?.name ? raw.campus.name : raw.campus || '',
    date: raw.date || raw.publishAt || raw.createdAt || new Date().toISOString(),
    readingTime: raw.readingTime || 3,
    image: raw.image || raw.featuredImage || '/images/news/news-1.jpg',
    imageAlt: raw.imageAlt || raw.title || 'News image',
    featured: Boolean(raw.featured),
    status: raw.status || 'published',
    demo: raw.demo,
  };
}

function normalizeStory(raw: any): Story {
  if (!raw) return demoStories[0];
  return {
    id: raw.id || raw._id?.toString() || raw.slug,
    slug: raw.slug || '',
    title: raw.title || '',
    dek: raw.dek || '',
    category: raw.category || 'student',
    image: raw.image || '/images/stories/story-1.jpg',
    imageAlt: raw.imageAlt || raw.title || 'Story image',
    author:
      (typeof raw.author === 'object' && raw.author?.name ? raw.author.name : null) ||
      (typeof raw.author === 'string' && !isObjectId(raw.author) ? raw.author : null) ||
      'TSC Contributor',
    authorRole: raw.authorRole || 'Student',
    campus: typeof raw.campus === 'object' && raw.campus?.name ? raw.campus.name : raw.campus || '',
    date: raw.date || raw.createdAt || new Date().toISOString(),
    readingTime: raw.readingTime || 4,
    content: Array.isArray(raw.content)
      ? raw.content
      : typeof raw.content === 'string'
      ? raw.content.split('\n\n').filter(Boolean)
      : [],
    quote: raw.quote,
    featured: Boolean(raw.featured),
    status: raw.status || 'published',
    demo: raw.demo,
  };
}

function normalizeCampus(raw: any): Campus {
  if (!raw) return demoCampuses[0];
  return {
    id: raw.id || raw._id?.toString() || raw.slug,
    slug: raw.slug || '',
    name: raw.name || '',
    university: raw.university || '',
    city: raw.city || '',
    state: raw.state || '',
    type: raw.type || 'College',
    description: raw.description || '',
    image: raw.image || '/images/campus/campus-1.jpg',
    imageAlt: raw.imageAlt || raw.name || 'Campus image',
    categories: Array.isArray(raw.categories) ? raw.categories : [],
    latestStory: raw.latestStory,
    upcomingEvent: raw.upcomingEvent,
    counts: raw.counts,
    demo: raw.demo,
  };
}

function normalizeEpisode(raw: any): PodcastEpisode {
  if (!raw) return demoEpisodes[0];
  const videoUrl = raw.videoUrl || raw.youtubeUrl || raw.platforms?.youtube || null;
  const audioUrl = videoUrl ? null : (raw.audioUrl || '/audio/tsc-placeholder-audio.wav');
  const youtubeThumb = videoUrl ? getYoutubeThumbnailUrl(videoUrl, 'hq') : null;
  return {
    id: raw.id || raw._id?.toString() || raw.slug,
    slug: raw.slug || '',
    episodeNumber: raw.episodeNumber || 1,
    title: raw.title || '',
    description: raw.description || '',
    guest: raw.guest || 'TSC Guest',
    guestRole: raw.guestRole || '',
    category: raw.category || 'Student Voices',
    durationLabel: raw.durationLabel || '30 mins',
    date: raw.date || raw.publishedAt || raw.createdAt || new Date().toISOString(),
    image: youtubeThumb || raw.image || raw.thumbnail || '/images/podcast/podcast-host.jpg',
    imageAlt: raw.imageAlt || raw.title || 'Podcast episode',
    audioUrl: audioUrl,
    videoUrl: videoUrl,
    youtubeUrl: videoUrl,
    platforms: {
      youtube: raw.platforms?.youtube || videoUrl,
      spotify: raw.platforms?.spotify || null,
      apple: raw.platforms?.apple || null,
    },
    transcript: Array.isArray(raw.transcript)
      ? raw.transcript
      : typeof raw.transcript === 'string'
      ? raw.transcript.split('\n\n').filter(Boolean)
      : [],
    featured: Boolean(raw.featured),
    demo: Boolean(raw.demo),
  };
}

function normalizeEvent(raw: any): TscEvent {
  if (!raw) return demoEvents[0];
  return {
    id: raw.id || raw._id?.toString() || raw.slug,
    slug: raw.slug || '',
    title: raw.title || '',
    dek: raw.dek || '',
    description: Array.isArray(raw.description)
      ? raw.description
      : typeof raw.description === 'string'
      ? raw.description.split('\n\n').filter(Boolean)
      : [],
    date: raw.date || raw.createdAt || new Date().toISOString(),
    time: raw.time || raw.startTime || '10:00 AM',
    venue: raw.venue || '',
    city: raw.city || '',
    state: raw.state || '',
    organizer: raw.organizer || 'THE STUDENT CHAPTERS',
    category: raw.category || 'General',
    image: raw.image || '/images/events/event-summit.jpg',
    imageAlt: raw.imageAlt || raw.title || 'Event image',
    registrationUrl: raw.registrationUrl || null,
    registrationDeadline: raw.registrationDeadline || raw.date || new Date().toISOString(),
    status: raw.status || 'upcoming',
    featured: Boolean(raw.featured),
    demo: raw.demo,
  };
}

function normalizeOpportunity(raw: any): Opportunity {
  if (!raw) return demoOpportunities[0];
  return {
    id: raw.id || raw._id?.toString() || raw.slug,
    slug: raw.slug || '',
    title: raw.title || '',
    organization: raw.organization || '',
    type: raw.type || 'Job',
    mode: raw.mode || 'Remote',
    location: raw.location || 'India',
    eligibility: raw.eligibility || 'Students & graduates',
    deadline: raw.deadline || raw.createdAt || new Date().toISOString(),
    description: typeof raw.description === 'string'
      ? raw.description
      : Array.isArray(raw.description)
      ? raw.description.join('\n\n')
      : '',
    skills: Array.isArray(raw.skills) ? raw.skills : [],
    applicationUrl: raw.applicationUrl || raw.applyUrl || null,
    featured: Boolean(raw.featured),
    active: raw.active ?? (raw.status !== 'archived'),
    postedOn: raw.postedOn || raw.createdAt || new Date().toISOString(),
    demo: raw.demo,
  };
}

function normalizeEdition(raw: any): CurrentAffairsEdition {
  if (!raw) return demoEditions[0];
  return {
    id: raw.id || raw._id?.toString() || raw.slug,
    slug: raw.slug || '',
    month: raw.month || '',
    year: Number(raw.year) || new Date().getFullYear(),
    title: raw.title || '',
    intro: raw.intro || '',
    cover: raw.cover || '/images/affairs/current-affairs-cover.jpg',
    coverAlt: raw.coverAlt || raw.title || 'Edition cover',
    topics: Array.isArray(raw.topics) ? raw.topics : ['India', 'Education'],
    articles: Array.isArray(raw.articles)
      ? raw.articles.map((art: any) => ({
          title: art.title || '',
          category: art.category || 'India',
          summary: art.summary || '',
          content: Array.isArray(art.content)
            ? art.content
            : typeof art.content === 'string'
            ? art.content.split('\n\n').filter(Boolean)
            : undefined,
          keyPoints: Array.isArray(art.keyPoints) ? art.keyPoints : undefined,
          readingTime: art.readingTime || 3,
        }))
      : [],
    pdfUrl: raw.pdfUrl || null,
    demo: raw.demo,
  };
}

function normalizeLegal(raw: any): LegalArticle {
  if (!raw) return demoLegalArticles[0];
  return {
    id: raw.id || raw._id?.toString() || raw.slug,
    slug: raw.slug || '',
    title: raw.title || '',
    topic: raw.topic || 'Student Rights',
    summary: raw.summary || '',
    content: Array.isArray(raw.content)
      ? raw.content
      : typeof raw.content === 'string'
      ? raw.content.split('\n\n').filter(Boolean)
      : [],
    keyPoints: Array.isArray(raw.keyPoints) ? raw.keyPoints : [],
    readingTime: raw.readingTime || 4,
    date: raw.date || raw.createdAt || new Date().toISOString(),
    demo: raw.demo,
  };
}

async function withApi<T>(path: string, fallback: T, transform?: (data: any) => T): Promise<T> {
  if (!API) return fallback;
  try {
    const res = await fetch(`${API}${path}`, {
      next: { revalidate: 60 },
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`API responded ${res.status}`);
    const json = (await res.json()) as { data?: any };
    const rawData = json.data ?? json;
    if (transform && rawData) {
      return transform(rawData);
    }
    return (rawData as T) ?? fallback;
  } catch (err) {
    console.warn(`[TSC] API unavailable for ${path}; serving demo content.`, err);
    return fallback;
  }
}

/* News */
export const getArticles = () =>
  withApi<Article[]>('/api/news?limit=24', demoArticles, (data) =>
    Array.isArray(data) ? data.map(normalizeArticle) : demoArticles
  );
export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  const item = await withApi<Article | null>(`/api/news/${slug}`, null, (data) =>
    data ? normalizeArticle(data) : null
  );
  if (item) return item;
  const items = await getArticles();
  return items.find((a) => a.slug === slug);
}

/* Stories */
export const getStories = () =>
  withApi<Story[]>('/api/stories', demoStories, (data) =>
    Array.isArray(data) ? data.map(normalizeStory) : demoStories
  );
export async function getStoryBySlug(slug: string): Promise<Story | undefined> {
  const item = await withApi<Story | null>(`/api/stories/${slug}`, null, (data) =>
    data ? normalizeStory(data) : null
  );
  if (item) return item;
  const items = await getStories();
  return items.find((s) => s.slug === slug);
}

/* Campuses */
export const getCampuses = () =>
  withApi<Campus[]>('/api/campuses', demoCampuses, (data) =>
    Array.isArray(data) ? data.map(normalizeCampus) : demoCampuses
  );
export async function getCampusBySlug(slug: string): Promise<Campus | undefined> {
  const item = await withApi<Campus | null>(`/api/campuses/${slug}`, null, (data) =>
    data ? normalizeCampus(data) : null
  );
  if (item) return item;
  const items = await getCampuses();
  return items.find((c) => c.slug === slug);
}

/* Podcast */
export const getEpisodes = () =>
  withApi<PodcastEpisode[]>('/api/podcasts', demoEpisodes, (data) =>
    Array.isArray(data) ? data.map(normalizeEpisode) : demoEpisodes
  );
export async function getEpisodeBySlug(slug: string): Promise<PodcastEpisode | undefined> {
  const items = await getEpisodes();
  const directMatch = items.find((e) => e.slug === slug);
  if (directMatch) return directMatch;

  const item = await withApi<PodcastEpisode | null>(`/api/podcasts/${slug}`, null, (data) =>
    data ? normalizeEpisode(data) : null
  );
  if (item) return item;

  return (
    items.find((e) => slug.includes(e.slug) || e.slug.includes(slug)) ||
    (slug === 'what-nobody-tells-you-about-your-first-startup' ? items[0] : undefined) ||
    items[0]
  );
}

/* Events */
export const getEvents = () =>
  withApi<TscEvent[]>('/api/events', demoEvents, (data) =>
    Array.isArray(data) ? data.map(normalizeEvent) : demoEvents
  );
export async function getEventBySlug(slug: string): Promise<TscEvent | undefined> {
  const item = await withApi<TscEvent | null>(`/api/events/${slug}`, null, (data) =>
    data ? normalizeEvent(data) : null
  );
  if (item) return item;
  const items = await getEvents();
  return items.find((e) => e.slug === slug);
}

/* Opportunities */
export const getOpportunities = () =>
  withApi<Opportunity[]>('/api/opportunities', demoOpportunities, (data) =>
    Array.isArray(data) ? data.map(normalizeOpportunity) : demoOpportunities
  );

/* Current Affairs */
export const getEditions = () =>
  withApi<CurrentAffairsEdition[]>('/api/current-affairs', demoEditions, (data) =>
    Array.isArray(data) ? data.map(normalizeEdition) : demoEditions
  );
export async function getEditionBySlug(slug: string): Promise<CurrentAffairsEdition | undefined> {
  const item = await withApi<CurrentAffairsEdition | null>(`/api/current-affairs/${slug}`, null, (data) =>
    data ? normalizeEdition(data) : null
  );
  if (item) return item;
  const items = await getEditions();
  return items.find((e) => e.slug === slug);
}

/* Legal Awareness */
export const getLegalArticles = () =>
  withApi<LegalArticle[]>('/api/legal-awareness', demoLegalArticles, (data) =>
    Array.isArray(data) ? data.map(normalizeLegal) : demoLegalArticles
  );
export async function getLegalBySlug(slug: string): Promise<LegalArticle | undefined> {
  const item = await withApi<LegalArticle | null>(`/api/legal-awareness/${slug}`, null, (data) =>
    data ? normalizeLegal(data) : null
  );
  if (item) return item;
  const items = await getLegalArticles();
  return items.find((l) => l.slug === slug);
}

/* Campaigns */
export const getCampaign = () => withApi<Campaign>('/api/campaigns/all-india-career-awareness', flagshipCampaign);

/* Site Settings */
export interface SiteSettingsData {
  siteName?: string;
  tagline?: string;
  contactEmail?: string;
  officeAddress?: string;
  social?: {
    instagram?: string;
    youtube?: string;
    linkedin?: string;
    facebook?: string;
  };
  whatsappUrl?: string;
  konnectxUrl?: string;
  homepage?: {
    heroEyebrow?: string;
    campaignSlug?: string;
    sectionsEnabled?: Record<string, boolean>;
    heroPanels?: Array<{ src: string; alt: string }>;
    promoImages?: {
      writeStory?: string;
      campusNews?: string;
      communityBg?: string;
    };
  };
}

export const getSiteSettings = () => withApi<SiteSettingsData>('/api/settings', {});

/* ── Global search across all content types ── */
export async function searchAll(query: string): Promise<SearchHit[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const [articles, stories, campuses, episodes, events, opportunities, editions, legal] = await Promise.all([
    getArticles(), getStories(), getCampuses(), getEpisodes(),
    getEvents(), getOpportunities(), getEditions(), getLegalArticles(),
  ]);
  const hits: SearchHit[] = [];
  const match = (...fields: Array<string | undefined>) =>
    fields.some((f) => !!f && f.toLowerCase().includes(q));

  for (const a of articles) {
    if (match(a.title, a.excerpt, a.category, ...a.tags))
      hits.push({ type: 'News', title: a.title, summary: a.excerpt, image: a.image, date: a.date, category: a.category, href: `/news/${a.slug}` });
  }
  for (const s of stories) {
    if (match(s.title, s.dek, s.category, s.campus))
      hits.push({ type: 'Story', title: s.title, summary: s.dek, image: s.image, date: s.date, category: s.category, href: `/stories/${s.slug}` });
  }
  for (const c of campuses) {
    if (match(c.name, c.university, c.city, c.state, c.description))
      hits.push({ type: 'Campus', title: c.name, summary: `${c.university} • ${c.city}, ${c.state}`, image: c.image, category: c.type, href: `/campus/${c.slug}` });
  }
  for (const p of episodes) {
    if (match(p.title, p.description, p.guest, p.category))
      hits.push({ type: 'Podcast', title: `E${String(p.episodeNumber).padStart(2, '0')} — ${p.title}`, summary: p.description, image: p.image, date: p.date, category: p.category, href: `/podcast/${p.slug}` });
  }
  for (const e of events) {
    if (match(e.title, e.dek, e.city, e.category, e.state))
      hits.push({ type: 'Event', title: e.title, summary: `${e.dek} • ${e.city}, ${e.state}`, image: e.image, date: e.date, category: e.category, href: `/events/${e.slug}` });
  }
  for (const o of opportunities) {
    if (match(o.title, o.organization, o.location, o.type, o.description))
      hits.push({ type: 'Opportunity', title: o.title, summary: `${o.organization} • ${o.location}`, date: o.deadline, category: o.type, href: `/career/${o.type === 'Job' ? 'jobs' : o.type === 'Internship' ? 'internships' : o.type === 'Fellowship' ? 'fellowships' : 'careers'}` });
  }
  for (const ed of editions) {
    if (match(ed.title, ed.intro, ed.month))
      hits.push({ type: 'Current Affairs', title: ed.title, summary: ed.intro, image: ed.cover, date: `${ed.month} ${ed.year}`, href: `/current-affairs/${ed.slug}` });
    for (const art of ed.articles) {
      if (match(art.title, art.summary))
        hits.push({ type: 'Current Affairs', title: art.title, summary: art.summary, image: ed.cover, date: `${ed.month} ${ed.year}`, category: art.category, href: `/current-affairs/${ed.slug}` });
    }
  }
  for (const l of legal) {
    if (match(l.title, l.summary, l.topic))
      hits.push({ type: 'Legal Awareness', title: l.title, summary: l.summary, date: l.date, category: l.topic, href: `/legal-awareness/${l.slug}` });
  }
  return hits;
}
