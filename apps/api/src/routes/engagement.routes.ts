import { Router } from 'express';
import {
  campusSubmissionSchema, contactSchema, eventRegistrationSchema, storySubmissionSchema,
} from '../validators';
import { validate } from '../middleware/validate';
import { formLimiter } from '../middleware/rateLimit';
import { optionalAuth } from '../middleware/auth';
import {
  contact, getMySubmissions, listSaved, registerForEvent, submitCampusNews, submitStory, submitCareerApply, toggleSaved, subscribeNewsletter,
} from '../controllers/engagement.controller';
import { requireAuth } from '../middleware/auth';

export const engagementRouter = Router();

/* Public & member submission forms — rate-limited + validated + honeypot protected */
engagementRouter.post('/api/submissions/story', formLimiter, optionalAuth, validate(storySubmissionSchema), submitStory);
engagementRouter.post('/api/submissions/campus', formLimiter, optionalAuth, validate(campusSubmissionSchema), submitCampusNews);
engagementRouter.post('/api/submissions/career-apply', formLimiter, optionalAuth, submitCareerApply);
engagementRouter.post('/api/contact', formLimiter, validate(contactSchema), contact);
engagementRouter.post('/api/newsletter/subscribe', formLimiter, subscribeNewsletter);
engagementRouter.post('/api/subscribe', formLimiter, subscribeNewsletter);
engagementRouter.post('/api/events/:id/register', formLimiter, optionalAuth, validate(eventRegistrationSchema), registerForEvent);

/* Submissions tracking (member auth) */
engagementRouter.get('/api/submissions/my', requireAuth, getMySubmissions);

/* Saved items (auth) */
engagementRouter.post('/api/saved', requireAuth, toggleSaved);
engagementRouter.get('/api/saved', requireAuth, listSaved);
