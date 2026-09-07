/**
 * Admin collection registry — drives the generic CRUD manager.
 * Each entry maps a content type to its list columns and form fields.
 */
import {
  Briefcase, CalendarDays, FileText, GraduationCap, Globe2, Images, LayoutDashboard,
  Mail, Mic, Newspaper, Rocket, School, Settings, Share2, Users,
} from 'lucide-react';

export type FieldType = 'text' | 'textarea' | 'select' | 'checkbox' | 'date' | 'number' | 'image' | 'tags';

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  options?: string[];
  required?: boolean;
  hint?: string;
  width?: 'full' | 'half';
}

export interface ColumnDef {
  name: string;
  label: string;
  type?: 'status' | 'badge' | 'date' | 'bool' | 'text';
}

export interface CollectionDef {
  key: string;
  title: string;
  singular: string;
  description: string;
  icon: typeof Newspaper;
  seedKey: string; // key in demo data
  columns: ColumnDef[];
  fields: FieldDef[];
  filters?: { key: string; label: string; options: string[] };
}

const statusField: FieldDef = {
  name: 'status',
  label: 'Status',
  type: 'select',
  options: ['draft', 'published', 'archived'],
  required: true,
};

const seoFields: FieldDef[] = [
  { name: 'seoTitle', label: 'SEO title', type: 'text', width: 'half' },
  { name: 'seoDescription', label: 'SEO description', type: 'textarea', width: 'half' },
];

const coreFields: FieldDef[] = [
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'slug', label: 'Slug', type: 'text', hint: 'Auto-generated from title if left blank', width: 'half' },
  { name: 'author', label: 'Author', type: 'text', width: 'half' },
  { name: 'excerpt', label: 'Excerpt / Dek', type: 'textarea' },
  { name: 'content', label: 'Content', type: 'textarea', hint: 'Separate paragraphs with a blank line' },
  { name: 'image', label: 'Featured image URL', type: 'image', width: 'half' },
  { name: 'tags', label: 'Tags', type: 'tags', width: 'half' },
  { name: 'category', label: 'Category', type: 'text', width: 'half' },
  { name: 'date', label: 'Date', type: 'date', width: 'half' },
  { name: 'featured', label: 'Featured', type: 'checkbox', width: 'half' },
  statusField,
  ...seoFields,
];

export const collections: Record<string, CollectionDef> = {
  news: {
    key: 'news', title: 'News', singular: 'Article', icon: Newspaper, seedKey: 'articles',
    description: 'Manage news articles — drafts, publishing, featured placement and SEO.',
    columns: [
      { name: 'title', label: 'Title' },
      { name: 'category', label: 'Category', type: 'badge' },
      { name: 'date', label: 'Date', type: 'date' },
      { name: 'status', label: 'Status', type: 'status' },
      { name: 'featured', label: 'Featured', type: 'bool' },
    ],
    fields: coreFields,
    filters: { key: 'status', label: 'Status', options: ['draft', 'published', 'archived'] },
  },
  stories: {
    key: 'stories', title: 'Stories', singular: 'Story', icon: FileText, seedKey: 'stories',
    description: 'Student, startup and campus stories.',
    columns: [
      { name: 'title', label: 'Title' },
      { name: 'category', label: 'Category', type: 'badge' },
      { name: 'date', label: 'Date', type: 'date' },
      { name: 'status', label: 'Status', type: 'status' },
      { name: 'featured', label: 'Featured', type: 'bool' },
    ],
    fields: [
      ...coreFields.slice(0, 6),
      { name: 'category', label: 'Category', type: 'select', options: ['student', 'startup', 'campus'], required: true, width: 'half' },
      { name: 'campus', label: 'Campus', type: 'text', width: 'half' },
      { name: 'image', label: 'Image URL', type: 'image', width: 'half' },
      { name: 'date', label: 'Date', type: 'date', width: 'half' },
      { name: 'featured', label: 'Featured', type: 'checkbox', width: 'half' },
      statusField,
    ],
    filters: { key: 'category', label: 'Category', options: ['student', 'startup', 'campus'] },
  },
  campuses: {
    key: 'campuses', title: 'Campuses', singular: 'Campus', icon: School, seedKey: 'campuses',
    description: 'Campus directory profiles.',
    columns: [
      { name: 'name', label: 'Campus' },
      { name: 'city', label: 'City' },
      { name: 'state', label: 'State', type: 'badge' },
      { name: 'type', label: 'Type', type: 'badge' },
    ],
    fields: [
      { name: 'name', label: 'Campus name', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text', width: 'half' },
      { name: 'university', label: 'University', type: 'text', width: 'half' },
      { name: 'city', label: 'City', type: 'text', width: 'half' },
      { name: 'state', label: 'State', type: 'text', width: 'half', required: true },
      { name: 'type', label: 'Institution type', type: 'text', width: 'half' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'image', label: 'Hero image URL', type: 'image', width: 'half' },
    ],
  },
  podcasts: {
    key: 'podcasts', title: 'Podcasts', singular: 'Episode', icon: Mic, seedKey: 'episodes',
    description: 'TSC Podcast episodes.',
    columns: [
      { name: 'episodeNumber', label: 'Ep #' },
      { name: 'title', label: 'Title' },
      { name: 'category', label: 'Category', type: 'badge' },
      { name: 'date', label: 'Date', type: 'date' },
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text', width: 'half' },
      { name: 'episodeNumber', label: 'Episode number', type: 'number', width: 'half' },
      { name: 'guest', label: 'Guest', type: 'text', width: 'half' },
      { name: 'guestRole', label: 'Guest role', type: 'text', width: 'half' },
      { name: 'category', label: 'Category', type: 'select', options: ['Student Voices', 'Founder Stories', 'Career Conversations', 'Ideas & Perspectives'], required: true, width: 'half' },
      { name: 'date', label: 'Date', type: 'date', width: 'half' },
      { name: 'durationLabel', label: 'Duration (e.g. 32:10)', type: 'text', width: 'half' },
      { name: 'audioUrl', label: 'Audio URL', type: 'text', width: 'half' },
      { name: 'image', label: 'Thumbnail URL', type: 'image', width: 'half' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'featured', label: 'Featured', type: 'checkbox', width: 'half' },
    ],
  },
  events: {
    key: 'events', title: 'Events', singular: 'Event', icon: CalendarDays, seedKey: 'events',
    description: 'Workshops, competitions, meetups and campus programmes.',
    columns: [
      { name: 'title', label: 'Event' },
      { name: 'date', label: 'Date', type: 'date' },
      { name: 'city', label: 'City' },
      { name: 'category', label: 'Category', type: 'badge' },
      { name: 'status', label: 'Status', type: 'status' },
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text', width: 'half' },
      { name: 'date', label: 'Date', type: 'date', required: true, width: 'half' },
      { name: 'time', label: 'Time', type: 'text', width: 'half' },
      { name: 'venue', label: 'Venue', type: 'text', width: 'half' },
      { name: 'city', label: 'City', type: 'text', width: 'half' },
      { name: 'state', label: 'State', type: 'text', width: 'half' },
      { name: 'organizer', label: 'Organizer', type: 'text', width: 'half' },
      { name: 'category', label: 'Category', type: 'text', width: 'half' },
      { name: 'status', label: 'Status', type: 'select', options: ['upcoming', 'ongoing', 'past', 'cancelled'], width: 'half' },
      { name: 'dek', label: 'One-line dek', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'registrationUrl', label: 'Registration URL', type: 'text', width: 'half' },
      { name: 'registrationDeadline', label: 'Registration deadline', type: 'date', width: 'half' },
      { name: 'image', label: 'Image URL', type: 'image', width: 'half' },
      { name: 'featured', label: 'Featured', type: 'checkbox', width: 'half' },
    ],
    filters: { key: 'status', label: 'Status', options: ['upcoming', 'ongoing', 'past', 'cancelled'] },
  },
  opportunities: {
    key: 'opportunities', title: 'Opportunities', singular: 'Opportunity', icon: Briefcase, seedKey: 'opportunities',
    description: 'Jobs, internships, fellowships and scholarships.',
    columns: [
      { name: 'title', label: 'Opportunity' },
      { name: 'organization', label: 'Organisation' },
      { name: 'type', label: 'Type', type: 'badge' },
      { name: 'deadline', label: 'Deadline', type: 'date' },
      { name: 'active', label: 'Active', type: 'bool' },
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text', width: 'half' },
      { name: 'organization', label: 'Organisation', type: 'text', required: true, width: 'half' },
      { name: 'type', label: 'Type', type: 'select', options: ['Job', 'Internship', 'Fellowship', 'Scholarship'], required: true, width: 'half' },
      { name: 'mode', label: 'Work mode', type: 'select', options: ['Remote', 'Hybrid', 'On-site'], width: 'half' },
      { name: 'location', label: 'Location', type: 'text', width: 'half' },
      { name: 'eligibility', label: 'Eligibility', type: 'text', width: 'half' },
      { name: 'deadline', label: 'Deadline', type: 'date', required: true, width: 'half' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'skills', label: 'Skills (tags)', type: 'tags' },
      { name: 'applicationUrl', label: 'Application URL', type: 'text', width: 'half' },
      { name: 'featured', label: 'Featured', type: 'checkbox', width: 'half' },
      { name: 'active', label: 'Active', type: 'checkbox', width: 'half' },
    ],
    filters: { key: 'type', label: 'Type', options: ['Job', 'Internship', 'Fellowship', 'Scholarship'] },
  },
  'current-affairs': {
    key: 'current-affairs', title: 'Current Affairs', singular: 'Edition', icon: Globe2, seedKey: 'editions',
    description: 'Monthly current affairs editions.',
    columns: [
      { name: 'title', label: 'Edition' },
      { name: 'month', label: 'Month' },
      { name: 'year', label: 'Year' },
      { name: 'pdfUrl', label: 'PDF', type: 'bool' },
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text', width: 'half' },
      { name: 'month', label: 'Month', type: 'text', required: true, width: 'half' },
      { name: 'year', label: 'Year', type: 'number', width: 'half' },
      { name: 'intro', label: 'Intro', type: 'textarea' },
      { name: 'cover', label: 'Cover image URL', type: 'image', width: 'half' },
      { name: 'pdfUrl', label: 'PDF URL', type: 'text', width: 'half' },
    ],
  },
  'legal-awareness': {
    key: 'legal-awareness', title: 'Legal Awareness', singular: 'Explainer', icon: FileText, seedKey: 'legal',
    description: 'Legal awareness explainers.',
    columns: [
      { name: 'title', label: 'Title' },
      { name: 'topic', label: 'Topic', type: 'badge' },
      { name: 'date', label: 'Date', type: 'date' },
      { name: 'status', label: 'Status', type: 'status' },
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text', width: 'half' },
      { name: 'topic', label: 'Topic', type: 'select', options: ['Student Rights', 'Cyber Safety', 'Digital Rights', 'Education Laws'], required: true, width: 'half' },
      { name: 'summary', label: 'Summary', type: 'textarea' },
      { name: 'content', label: 'Content', type: 'textarea' },
      { name: 'date', label: 'Date', type: 'date', width: 'half' },
      statusField,
    ],
    filters: { key: 'topic', label: 'Topic', options: ['Student Rights', 'Cyber Safety', 'Digital Rights', 'Education Laws'] },
  },
  campaigns: {
    key: 'campaigns', title: 'Campaigns', singular: 'Campaign', icon: Rocket, seedKey: 'campaign',
    description: 'TSC original campaigns and their episodes.',
    columns: [
      { name: 'title', label: 'Campaign' },
      { name: 'slug', label: 'Slug' },
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text', width: 'half' },
      { name: 'eyebrow', label: 'Eyebrow', type: 'text', width: 'half' },
      { name: 'headline', label: 'Headline', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
    ],
  },
  members: {
    key: 'members', title: 'Members', singular: 'Member', icon: Users, seedKey: 'members',
    description: 'Community members and their roles.',
    columns: [
      { name: 'name', label: 'Member' },
      { name: 'email', label: 'Email' },
      { name: 'role', label: 'Role', type: 'badge' },
      { name: 'joinedOn', label: 'Joined', type: 'date' },
      { name: 'status', label: 'Status', type: 'status' },
    ],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'text', required: true, width: 'half' },
      { name: 'college', label: 'College', type: 'text', width: 'half' },
      { name: 'city', label: 'City', type: 'text', width: 'half' },
      { name: 'role', label: 'Role', type: 'select', options: ['member', 'editor', 'admin'], width: 'half' },
      { name: 'joinedOn', label: 'Joined on', type: 'date', width: 'half' },
      { name: 'status', label: 'Status', type: 'select', options: ['active', 'pending'], width: 'half' },
    ],
    filters: { key: 'role', label: 'Role', options: ['member', 'editor', 'admin'] },
  },
  'story-submissions': {
    key: 'story-submissions', title: 'Story Submissions', singular: 'Submission', icon: Share2, seedKey: 'storySubmissions',
    description: 'Community story submissions awaiting review.',
    columns: [
      { name: 'title', label: 'Story' },
      { name: 'name', label: 'From' },
      { name: 'category', label: 'Category', type: 'badge' },
      { name: 'submittedOn', label: 'Submitted', type: 'date' },
      { name: 'status', label: 'Status', type: 'status' },
    ],
    fields: [
      { name: 'title', label: 'Story title', type: 'text', required: true },
      { name: 'name', label: 'Submitter', type: 'text', width: 'half' },
      { name: 'email', label: 'Email', type: 'text', width: 'half' },
      { name: 'college', label: 'College', type: 'text', width: 'half' },
      { name: 'category', label: 'Category', type: 'text', width: 'half' },
      { name: 'summary', label: 'Summary', type: 'textarea' },
      { name: 'status', label: 'Status', type: 'select', options: ['pending', 'under review', 'approved', 'rejected'], width: 'half' },
    ],
    filters: { key: 'status', label: 'Status', options: ['pending', 'under review', 'approved', 'rejected'] },
  },
  'campus-submissions': {
    key: 'campus-submissions', title: 'Campus Submissions', singular: 'Submission', icon: School, seedKey: 'campusSubmissions',
    description: 'Campus news submissions awaiting review.',
    columns: [
      { name: 'title', label: 'News' },
      { name: 'campus', label: 'Campus' },
      { name: 'category', label: 'Category', type: 'badge' },
      { name: 'submittedOn', label: 'Submitted', type: 'date' },
      { name: 'status', label: 'Status', type: 'status' },
    ],
    fields: [
      { name: 'title', label: 'News title', type: 'text', required: true },
      { name: 'name', label: 'Submitter', type: 'text', width: 'half' },
      { name: 'campus', label: 'Campus', type: 'text', width: 'half' },
      { name: 'category', label: 'Category', type: 'text', width: 'half' },
      { name: 'summary', label: 'Summary', type: 'textarea' },
      { name: 'status', label: 'Status', type: 'select', options: ['pending', 'under review', 'approved', 'rejected'], width: 'half' },
    ],
    filters: { key: 'status', label: 'Status', options: ['pending', 'under review', 'approved', 'rejected'] },
  },
  'contact-messages': {
    key: 'contact-messages', title: 'Contact Messages', singular: 'Message', icon: Mail, seedKey: 'contactMessages',
    description: 'Inbox for contact-form messages.',
    columns: [
      { name: 'subject', label: 'Subject' },
      { name: 'name', label: 'From' },
      { name: 'receivedOn', label: 'Received', type: 'date' },
      { name: 'status', label: 'Status', type: 'status' },
    ],
    fields: [
      { name: 'subject', label: 'Subject', type: 'text', required: true },
      { name: 'name', label: 'From', type: 'text', width: 'half' },
      { name: 'email', label: 'Email', type: 'text', width: 'half' },
      { name: 'message', label: 'Message', type: 'textarea' },
      { name: 'status', label: 'Status', type: 'select', options: ['new', 'read', 'replied'], width: 'half' },
    ],
    filters: { key: 'status', label: 'Status', options: ['new', 'read', 'replied'] },
  },
};

export const adminNavGroups: { label: string; items: { href: string; label: string; icon: typeof Newspaper }[] }[] = [
  {
    label: 'Overview',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Content',
    items: [
      { href: '/admin/news', label: 'News', icon: Newspaper },
      { href: '/admin/stories', label: 'Stories', icon: FileText },
      { href: '/admin/campuses', label: 'Campuses', icon: School },
      { href: '/admin/podcasts', label: 'Podcasts', icon: Mic },
      { href: '/admin/events', label: 'Events', icon: CalendarDays },
      { href: '/admin/jobs', label: 'Jobs', icon: Briefcase },
      { href: '/admin/internships', label: 'Internships', icon: Briefcase },
      { href: '/admin/fellowships', label: 'Fellowships', icon: GraduationCap },
      { href: '/admin/current-affairs', label: 'Current Affairs', icon: Globe2 },
      { href: '/admin/legal-awareness', label: 'Legal Awareness', icon: FileText },
      { href: '/admin/campaigns', label: 'Campaigns', icon: Rocket },
    ],
  },
  {
    label: 'People & Inbox',
    items: [
      { href: '/admin/hiring', label: 'Hiring Applications', icon: Briefcase },
      { href: '/admin/members', label: 'Members', icon: Users },
      { href: '/admin/story-submissions', label: 'Story Submissions', icon: Share2 },
      { href: '/admin/campus-submissions', label: 'Campus Submissions', icon: School },
      { href: '/admin/contact-messages', label: 'Contact Messages', icon: Mail },
    ],
  },
  {
    label: 'Configuration',
    items: [
      { href: '/admin/media', label: 'Media', icon: Images },
      { href: '/admin/homepage', label: 'Homepage', icon: LayoutDashboard },
      { href: '/admin/social-links', label: 'Social Links', icon: Share2 },
      { href: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
];
