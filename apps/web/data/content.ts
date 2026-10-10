/**
 * The Student Chapters (TSC) Content Data.
 * Developed by Ayush.
 *
 * Production configuration: Pre-seeded sample data removed.
 * Content is managed dynamically via database and admin dashboard.
 */
import type {
  Article, Story, Campus, PodcastEpisode, TscEvent, Opportunity,
  CurrentAffairsEdition, LegalArticle, Campaign, StorySubmissionRecord,
  CampusSubmissionRecord, ContactMessageRecord, MemberRecord, NotificationRecord,
} from '@/types/content';

/* ─────────────────────────── NEWS ─────────────────────────── */
export const demoArticles: Article[] = [];

/* ─────────────────────────── STORIES ─────────────────────────── */
export const demoStories: Story[] = [];

/* ─────────────────────────── CAMPUS DIRECTORY ─────────────────────────── */
export const demoCampuses: Campus[] = [];

/* ─────────────────────────── PODCAST ─────────────────────────── */
export const demoEpisodes: PodcastEpisode[] = [];

/* ─────────────────────────── EVENTS ─────────────────────────── */
export const demoEvents: TscEvent[] = [];

/* ─────────────────────────── CAREER / OPPORTUNITIES ─────────────────────────── */
export const demoOpportunities: Opportunity[] = [];

/* ─────────────────────────── CURRENT AFFAIRS EDITIONS ─────────────────────────── */
export const demoEditions: CurrentAffairsEdition[] = [];

/* ─────────────────────────── LEGAL AWARENESS ─────────────────────────── */
export const demoLegalArticles: LegalArticle[] = [];

/* ─────────────────────────── FLAGSHIP CAMPAIGN ─────────────────────────── */
export const flagshipCampaign: Campaign = {
  id: 'camp1',
  slug: 'all-india-career-awareness',
  eyebrow: 'TSC ORIGINAL CAMPAIGN',
  title: 'ALL INDIA CAREER AWARENESS YOUTH DOCUMENTARY SERIES',
  headline: 'Real Careers. Real People. Real Possibilities.',
  description: '',
  stills: [],
  categories: [],
  locations: [],
  episodes: [],
};

/* ─────────────────────────── ADMIN / DASHBOARD DATA ─────────────────────────── */
export const demoStorySubmissions: StorySubmissionRecord[] = [];

export const demoCampusSubmissions: CampusSubmissionRecord[] = [];

export const demoContactMessages: ContactMessageRecord[] = [];

export const demoMembers: MemberRecord[] = [];

export const demoNotifications: NotificationRecord[] = [];
