import { z } from 'zod';

const email = z.string().trim().email('Please provide a valid email address');
const password = z.string().min(8, 'Password must be at least 8 characters');
const phone = z.string().regex(/^[\d+\-\s()]{8,18}$/, 'Please provide a valid phone number (at least 8 digits)').optional().or(z.literal(''));

export const registerSchema = z.object({
  name: z.string().trim().min(3, 'Name must be at least 3 characters'),
  email,
  password,
  phone,
  college: z.string().trim().optional(),
  course: z.string().trim().optional(),
  graduationYear: z.coerce.number().int().min(2000).max(2035).optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  interests: z.string().optional(),
  skills: z.string().optional(),
});

export const loginSchema = z.object({ email, password: z.string().min(1, 'Password is required') });

export const storySubmissionSchema = z.object({
  name: z.string().trim().min(3),
  email,
  phone,
  college: z.string().trim().optional(),
  city: z.string().trim().min(2),
  state: z.string().trim().min(2),
  title: z.string().trim().min(6),
  category: z.string().trim().min(2),
  content: z.string().trim().min(100, 'Please tell the story in at least 100 characters'),
  videoUrl: z.string().trim().url().optional().or(z.literal('')),
  social: z.string().trim().optional(),
  consent: z.literal(true, { message: 'Consent is required' }),
});

export const campusSubmissionSchema = z.object({
  name: z.string().trim().min(3),
  email,
  college: z.string().trim().optional(),
  campus: z.string().trim().min(2),
  city: z.string().trim().min(2),
  state: z.string().trim().min(2),
  title: z.string().trim().min(6),
  category: z.string().trim().min(2),
  description: z.string().trim().min(80, 'Please describe the news in at least 80 characters'),
  eventDate: z.string().optional(),
  links: z.string().trim().optional(),
  consent: z.literal(true, { message: 'Consent is required' }),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2),
  email,
  subject: z.string().trim().min(3),
  message: z.string().trim().min(20, 'Message must be at least 20 characters'),
  website: z.string().optional(), // honeypot — bots fill this
});

export const eventRegistrationSchema = z.object({
  name: z.string().trim().min(3),
  email,
  phone,
});

const contentBase = {
  title: z.string().trim().min(4),
  slug: z.string().trim().optional(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  image: z.string().trim().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  featured: z.boolean().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  publishAt: z.string().optional(),
};

export const articleSchema = z.object({ ...contentBase, author: z.string().optional() });
export const storySchema = z.object({
  ...contentBase,
  dek: z.string().optional(),
  category: z.enum(['student', 'startup', 'campus']).optional(),
});

export const eventSchema = z.object({
  title: z.string().trim().min(4),
  slug: z.string().trim().optional(),
  dek: z.string().optional(),
  description: z.string().optional(),
  date: z.string(),
  time: z.string().optional(),
  venue: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  organizer: z.string().optional(),
  category: z.string().optional(),
  registrationUrl: z.string().optional(),
  registrationDeadline: z.string().optional(),
  image: z.string().optional(),
  status: z.enum(['upcoming', 'ongoing', 'past', 'cancelled']).optional(),
  featured: z.boolean().optional(),
});

export const opportunitySchema = z.object({
  title: z.string().trim().min(4),
  slug: z.string().trim().optional(),
  organization: z.string().trim().min(2),
  type: z.enum(['Job', 'Internship', 'Fellowship', 'Scholarship', 'Career Awareness']),
  mode: z.enum(['Remote', 'Hybrid', 'On-site']).optional(),
  location: z.string().optional(),
  eligibility: z.string().optional(),
  deadline: z.string(),
  description: z.string().optional(),
  skills: z.array(z.string()).optional(),
  applicationUrl: z.string().optional(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
});

export const updateMeSchema = z.object({
  name: z.string().trim().min(3).optional(),
  phone,
  college: z.string().trim().optional(),
  course: z.string().trim().optional(),
  graduationYear: z.coerce.number().int().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  interests: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  linkedin: z.string().trim().optional(),
  instagram: z.string().trim().optional(),
  avatarUrl: z.string().trim().optional(),
});

export const moderateSubmissionSchema = z.object({
  status: z.enum(['pending', 'under review', 'approved', 'rejected']),
  reviewNote: z.string().optional(),
});

export const hiringApplicationSchema = z.object({
  type: z.enum(['Internship', 'Job']),
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  email,
  phone: z.string().trim().min(8, 'Please provide a valid phone number'),
  location: z.string().trim().min(2, 'Please specify your city/state'),
  department: z.string().trim().min(2, 'Please select a track/department'),
  experienceLevel: z.string().trim().min(2, 'Please specify your experience level or year of study'),
  collegeOrCompany: z.string().trim().min(2, 'Please specify your college or current organization'),
  linkedinUrl: z.string().trim().url().optional().or(z.literal('')),
  portfolioUrl: z.string().trim().url().optional().or(z.literal('')),
  resumeUrl: z.string().trim().min(3, 'Please provide a resume link or document URL'),
  coverLetter: z.string().trim().min(30, 'Please share at least 30 characters about why you want to join TSC'),
  availability: z.string().trim().min(2, 'Please specify your availability/joining timeline'),
});

