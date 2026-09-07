/**
 * Central site configuration for THE STUDENT CHAPTERS (TSC).
 * Community links (WhatsApp / KonnectX) are admin-configurable via env /
 * SiteSettings — they are never hardcoded to unknown URLs.
 */
export const site = {
  name: 'THE STUDENT CHAPTERS™',
  shortName: 'TSC',
  tagline: 'Your Campus. Your Voice. Your Future.',
  motto: 'Students are Watching, Observing & Learning',
  concept: 'Discover. Learn. Connect. Create.',
  description:
    'The Student Chapters™ is a platform built for the next generation — bringing together student stories, campus news, career opportunities, current affairs, events, podcasts, legal awareness and communities from across India.',
  address: 'B-HUB, Maurya Lok Complex, New Dak Bunglow Rd, Patna, Bihar 800001',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  email: '', // [TO BE CONFIGURED] official contact email — set via admin → Settings
  whatsappUrl: process.env.NEXT_PUBLIC_WHATSAPP_URL ?? '',
  konnectxUrl: process.env.NEXT_PUBLIC_KONNECTX_URL ?? 'https://konnectx.app/',
  social: {
    instagram: 'https://www.instagram.com/studentchapters/',
    youtube: 'https://www.youtube.com/channel/UC8IGnEOSxDVqd1AviLa-5qA',
    linkedin: 'https://in.linkedin.com/company/the-student-chapters',
    facebook: 'https://www.facebook.com/people/The-Student-Chapters/61562542822959/',
  },
} as const;

export interface NavLink {
  label: string;
  href: string;
  description?: string;
  children?: NavLink[];
}

export const mainNav: NavLink[] = [
  { label: 'News', href: '/news' },
  {
    label: 'Stories',
    href: '/stories',
    children: [
      { label: 'Student', href: '/stories/student', description: 'Personal journeys, achievements, challenges and experiences.' },
      { label: 'Startup', href: '/stories/startup', description: 'Young founders, student entrepreneurs and ideas turning into businesses.' },
      { label: 'Campus', href: '/stories/campus', description: "What's happening inside India's colleges and universities." },
    ],
  },
  { label: 'Campus', href: '/campus' },
  { label: 'Podcast', href: '/podcast' },
  { label: 'Events', href: '/events' },
  {
    label: 'Career',
    href: '/career',
    children: [
      { label: 'Jobs', href: '/career/jobs', description: 'Jobs and early-career opportunities.' },
      { label: 'Internships', href: '/career/internships', description: 'Practical experience and real-world skills.' },
      { label: 'Fellowships', href: '/career/fellowships', description: 'Programmes designed to help young people grow.' },
      { label: 'Career Awareness', href: '/career/careers', description: 'Careers beyond the obvious choices.' },
    ],
  },
  { label: 'Current Affairs', href: '/current-affairs' },
  { label: 'Legal Awareness', href: '/legal-awareness' },
  {
    label: 'Hiring',
    href: '/hiring',
    children: [
      { label: 'Internships', href: '/hiring?type=Internship', description: 'Student internships, editorial fellowships & creative roles.' },
      { label: 'Jobs', href: '/hiring?type=Job', description: 'Full-time positions, editorial & engineering opportunities.' },
    ],
  },
  {
    label: 'Community',
    href: '/community',
    children: [
      { label: 'Campaigns', href: '/campaigns', description: 'All India Career Awareness Youth Documentary Series.' },
      { label: 'Join TSC', href: '/membership', description: 'Become a member of the movement.' },
      { label: 'Membership', href: '/membership', description: 'What membership includes.' },
      { label: 'Share Your Story', href: '/share-your-story', description: 'Your journey could inspire someone else.' },
      { label: 'Share Campus News', href: '/share-campus-news', description: "What's happening at your campus?" },
      { label: 'KonnectX', href: '/konnectx', description: 'Social learning & student networking platform.' },
      { label: 'MY TAG APP', href: '/mytagapp', description: 'Admission EdTech portal & e-Career counseling.' },
    ],
  },
];

export const footerNav = {
  explore: [
    { label: 'Latest News', href: '/news' },
    { label: 'Stories', href: '/stories' },
    { label: 'Campus', href: '/campus' },
    { label: 'Podcast', href: '/podcast' },
    { label: 'Events', href: '/events' },
    { label: 'Jobs', href: '/career/jobs' },
    { label: 'Current Affairs', href: '/current-affairs' },
    { label: 'Legal Awareness', href: '/legal-awareness' },
  ],
  community: [
    { label: 'Join TSC', href: '/membership' },
    { label: 'Membership', href: '/membership' },
    { label: 'Share Your Story', href: '/share-your-story' },
    { label: 'Share Campus News', href: '/share-campus-news' },
    { label: 'Campaigns', href: '/campaigns' },
    { label: 'KonnectX', href: '/konnectx' },
    { label: 'MY TAG APP', href: '/mytagapp' },
  ],
  about: [
    { label: 'About Us', href: '/about' },
    { label: 'We’re Hiring', href: '/hiring' },
    { label: 'Our Mission', href: '/about#mission' },
    { label: 'Our Team', href: '/about#team' },
    { label: 'Contact Us', href: '/contact' },
  ],
};
