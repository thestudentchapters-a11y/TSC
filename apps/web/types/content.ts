/** Shared content types for TSC — mirror the Mongoose models in apps/api. */

export type ContentStatus = 'draft' | 'published' | 'archived';
export type SubmissionStatus = 'pending' | 'under review' | 'approved' | 'rejected';

export type NewsCategory =
  | 'Student News'
  | 'Education'
  | 'Youth & Society'
  | 'Technology & Innovation';

export type StoryCategory = 'student' | 'startup' | 'campus';

export type PodcastCategory =
  | 'Student Voices'
  | 'Founder Stories'
  | 'Career Conversations'
  | 'Ideas & Perspectives';

export type LegalTopic = 'Student Rights' | 'Cyber Safety' | 'Digital Rights' | 'Education Laws';

export type AffairTopic = 'India' | 'World' | 'Economy' | 'Science & Technology' | 'Education';

export type OpportunityType =
  | 'Job'
  | 'Internship'
  | 'Fellowship'
  | 'Scholarship'
  | 'Career Awareness';

export type WorkMode = 'Remote' | 'Hybrid' | 'On-site';

export type EventStatus = 'upcoming' | 'ongoing' | 'past' | 'cancelled';

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  category: NewsCategory;
  tags: string[];
  author: string;
  date: string; // ISO
  readingTime: number; // minutes
  image: string;
  imageAlt: string;
  featured: boolean;
  status: ContentStatus;
  demo?: boolean;
}

export interface Story {
  id: string;
  slug: string;
  title: string;
  dek: string;
  category: StoryCategory;
  image: string;
  imageAlt: string;
  author: string;
  authorRole: string;
  campus?: string;
  date: string;
  readingTime: number;
  content: string[];
  quote?: { text: string; person: string };
  featured: boolean;
  status: ContentStatus;
  demo?: boolean;
}

export interface Campus {
  id: string;
  slug: string;
  name: string;
  university: string;
  city: string;
  state: string;
  type: string;
  description: string;
  image: string;
  imageAlt: string;
  categories: string[];
  latestStory: { title: string; slug: string; date: string };
  upcomingEvent: { title: string; slug: string; date: string };
  counts: { stories: number; events: number; contributors: number };
  demo?: boolean;
}

export interface PodcastEpisode {
  id: string;
  slug: string;
  episodeNumber: number;
  title: string;
  description: string;
  guest: string;
  guestRole: string;
  category: PodcastCategory;
  durationLabel: string;
  date: string;
  image: string;
  imageAlt: string;
  audioUrl: string | null;
  videoUrl: string | null;
  platforms: { youtube: string | null; spotify: string | null; apple: string | null };
  transcript: string[];
  featured: boolean;
  demo?: boolean;
}

export interface TscEvent {
  id: string;
  slug: string;
  title: string;
  dek: string;
  description: string[];
  date: string; // ISO
  time: string;
  venue: string;
  city: string;
  state: string;
  organizer: string;
  category: string;
  image: string;
  imageAlt: string;
  registrationUrl: string | null;
  registrationDeadline: string;
  status: EventStatus;
  featured: boolean;
  demo?: boolean;
}

export interface Opportunity {
  id: string;
  slug: string;
  title: string;
  organization: string;
  type: OpportunityType;
  mode: WorkMode;
  location: string;
  eligibility: string;
  deadline: string; // ISO
  description: string;
  skills: string[];
  applicationUrl: string | null;
  featured: boolean;
  active: boolean;
  postedOn: string;
  demo?: boolean;
}

export interface AffairArticle {
  title: string;
  category: AffairTopic;
  summary: string;
  readingTime: number;
}

export interface CurrentAffairsEdition {
  id: string;
  slug: string;
  month: string;
  year: number;
  title: string;
  intro: string;
  cover: string;
  coverAlt: string;
  topics: AffairTopic[];
  articles: AffairArticle[];
  pdfUrl: string | null;
  demo?: boolean;
}

export interface LegalArticle {
  id: string;
  slug: string;
  title: string;
  topic: LegalTopic;
  summary: string;
  content: string[];
  keyPoints: string[];
  readingTime: number;
  date: string;
  demo?: boolean;
}

export interface CampaignEpisode {
  id: string;
  slug: string;
  episodeNumber: number;
  title: string;
  professional: string;
  profession: string;
  location: string;
  description: string;
  image: string;
  imageAlt: string;
  durationLabel: string;
  status: 'Released' | 'Coming Soon';
}

export interface Campaign {
  id: string;
  slug: string;
  eyebrow: string;
  title: string;
  headline: string;
  description: string;
  stills: { image: string; alt: string }[];
  episodes: CampaignEpisode[];
  categories: string[];
  locations: string[];
}

export interface StorySubmissionRecord {
  id: string;
  name: string;
  email: string;
  college: string;
  city: string;
  state: string;
  title: string;
  category: string;
  summary: string;
  status: SubmissionStatus;
  submittedOn: string;
}

export interface CampusSubmissionRecord {
  id: string;
  name: string;
  email: string;
  campus: string;
  city: string;
  state: string;
  title: string;
  category: string;
  summary: string;
  status: SubmissionStatus;
  submittedOn: string;
}

export interface ContactMessageRecord {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  receivedOn: string;
}

export interface MemberRecord {
  id: string;
  name: string;
  email: string;
  college: string;
  city: string;
  role: 'member' | 'editor' | 'admin';
  joinedOn: string;
  status: 'active' | 'pending';
}

export interface NotificationRecord {
  id: string;
  title: string;
  body: string;
  date: string;
  read: boolean;
  type: 'info' | 'opportunity' | 'event' | 'story';
}

export interface SearchHit {
  type: 'News' | 'Story' | 'Campus' | 'Podcast' | 'Event' | 'Opportunity' | 'Current Affairs' | 'Legal Awareness';
  title: string;
  summary: string;
  image?: string;
  date?: string;
  category?: string;
  href: string;
}
