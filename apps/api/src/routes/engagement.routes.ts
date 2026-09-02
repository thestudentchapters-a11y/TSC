import { Router } from 'express';
import {
  campusSubmissionSchema, contactSchema, eventRegistrationSchema, storySubmissionSchema,
} from '../validators';
import { validate } from '../middleware/validate';
import { formLimiter } from '../middleware/rateLimit';
import { optionalAuth } from '../middleware/auth';
import {
  contact, listSaved, registerForEvent, submitCampusNews, submitStory, toggleSaved,
} from '../controllers/engagement.controller';
import { requireAuth } from '../middleware/auth';

export const engagementRouter = Router();

/* Public forms — rate-limited + validated + honeypot protected */
engagementRouter.post('/api/submissions/story', formLimiter, validate(storySubmissionSchema), submitStory);
engagementRouter.post('/api/submissions/campus', formLimiter, validate(campusSubmissionSchema), submitCampusNews);
engagementRouter.post('/api/contact', formLimiter, validate(contactSchema), contact);
engagementRouter.post('/api/events/:id/register', formLimiter, optionalAuth, validate(eventRegistrationSchema), registerForEvent);

/* Saved items (auth) */
engagementRouter.post('/api/saved', requireAuth, toggleSaved);
engagementRouter.get('/api/saved', requireAuth, listSaved);
