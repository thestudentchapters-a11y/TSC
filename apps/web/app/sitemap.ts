import type { MetadataRoute } from 'next';
import {
  getArticles, getStories, getCampuses, getEpisodes, getEvents, getEditions, getLegalArticles,
} from '@/lib/data';
import { site } from '@/lib/site';

function parseSafeDate(d?: string | Date): Date {
  if (!d) return new Date();
  const date = new Date(d);
  return isNaN(date.getTime()) ? new Date() : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, stories, campuses, episodes, events, editions, legal] = await Promise.all([
    getArticles(), getStories(), getCampuses(), getEpisodes(), getEvents(), getEditions(), getLegalArticles(),
  ]);

  const staticRoutes = [
    '', '/news', '/stories', '/stories/student', '/stories/startup', '/stories/campus', '/campus',
    '/podcast', '/events', '/career', '/career/jobs', '/career/internships', '/career/fellowships',
    '/career/careers', '/current-affairs', '/legal-awareness', '/campaigns',
    '/campaigns/all-india-career-awareness', '/community', '/membership', '/share-your-story',
    '/share-campus-news', '/about', '/contact', '/search', '/konnectx', '/mytagapp',
  ].map((path) => ({
    url: `${site.url}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.8,
  }));

  return [
    ...staticRoutes,
    ...articles.map((a) => ({ url: `${site.url}/news/${a.slug}`, lastModified: parseSafeDate(a.date), changeFrequency: 'monthly' as const, priority: 0.7 })),
    ...stories.map((s) => ({ url: `${site.url}/stories/${s.slug}`, lastModified: parseSafeDate(s.date), changeFrequency: 'monthly' as const, priority: 0.7 })),
    ...campuses.map((c) => ({ url: `${site.url}/campus/${c.slug}`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 })),
    ...episodes.map((e) => ({ url: `${site.url}/podcast/${e.slug}`, lastModified: parseSafeDate(e.date), changeFrequency: 'monthly' as const, priority: 0.6 })),
    ...events.map((e) => ({ url: `${site.url}/events/${e.slug}`, lastModified: parseSafeDate(e.date), changeFrequency: 'weekly' as const, priority: 0.6 })),
    ...editions.map((e) => ({ url: `${site.url}/current-affairs/${e.slug}`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 })),
    ...legal.map((l) => ({ url: `${site.url}/legal-awareness/${l.slug}`, lastModified: parseSafeDate(l.date), changeFrequency: 'yearly' as const, priority: 0.5 })),
  ];
}
