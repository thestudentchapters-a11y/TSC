import { Router, type Request, type Response } from 'express';
import mongoose from 'mongoose';
import Article from '../models/Article';
import Story from '../models/Story';
import Campus from '../models/Campus';
import PodcastEpisode from '../models/PodcastEpisode';
import Event from '../models/Event';
import Opportunity from '../models/Opportunity';
import CurrentAffairsEdition from '../models/CurrentAffairsEdition';
import LegalArticle from '../models/LegalArticle';
import Campaign from '../models/Campaign';
import CampaignEpisode from '../models/CampaignEpisode';
import Media from '../models/Media';
import { Category, Tag } from '../models/Taxonomy';
import Notification from '../models/Notification';
import Membership from '../models/Membership';
import User from '../models/User';
import { StorySubmission, CampusSubmission } from '../models/Submission';

import { createContentService } from '../services/content.service';
import { submissionService } from '../services/engagement.service';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth, requireEditor, requireAdmin, type AuthRequest } from '../middleware/auth';
import { authRouter } from './auth.routes';
import { engagementRouter } from './engagement.routes';
import { moderateSubmissionSchema } from '../validators';
import { validate } from '../middleware/validate';
import { ApiError } from '../utils/apiError';

const isObjectId = (v: string) => mongoose.Types.ObjectId.isValid(v) && /^[a-f\d]{24}$/i.test(v);

export function registerRoutes(app: Router) {
  /* ── Health ─────────────────────────────────────────────────────────── */
  app.get('/health', (_req, res) => {
    res.json({ success: true, service: 'THE STUDENT CHAPTERS API', time: new Date().toISOString() });
  });

  /* ── Auth + engagement ──────────────────────────────────────────────── */
  app.use('/', authRouter);
  app.use('/', engagementRouter);

  /* ── Content collections ────────────────────────────────────────────── */
  function contentRoutes(basePath: string, model: Parameters<typeof createContentService>[0], filterKeys?: string[], slugLookup = true) {
    const service = createContentService(model, filterKeys);

    app.get(
      basePath,
      asyncHandler(async (req: Request, res: Response) => {
        const result = await service.list(req.query as Record<string, unknown>);
        res.json({ success: true, ...result });
      })
    );

    if (slugLookup) {
      app.get(
        `${basePath}/:idOrSlug`,
        asyncHandler(async (req: Request, res: Response) => {
          const key = req.params.idOrSlug;
          const doc = isObjectId(key)
            ? await model.findById(key).lean()
            : await model.findOne({ slug: key }).lean();
          if (!doc) throw ApiError.notFound(`${model.modelName} not found`);
          res.json({ success: true, data: doc });
        })
      );
    } else {
      app.get(
        `${basePath}/:id`,
        asyncHandler(async (req: Request, res: Response) => {
          res.json({ success: true, data: await service.getById(req.params.id) });
        })
      );
    }

    app.post(
      basePath,
      requireAuth,
      requireEditor,
      asyncHandler(async (req: AuthRequest, res: Response) => {
        const doc = await service.create({ ...req.body, createdBy: req.user!._id, author: req.body.author ?? req.user!._id });
        res.status(201).json({ success: true, data: doc });
      })
    );

    app.put(
      `${basePath}/:id`,
      requireAuth,
      requireEditor,
      asyncHandler(async (req: Request, res: Response) => {
        res.json({ success: true, data: await service.update(req.params.id, req.body) });
      })
    );

    app.delete(
      `${basePath}/:id`,
      requireAuth,
      requireEditor,
      asyncHandler(async (req: Request, res: Response) => {
        await service.remove(req.params.id);
        res.json({ success: true, data: null });
      })
    );
  }

  contentRoutes('/api/news', Article);
  contentRoutes('/api/stories', Story);
  contentRoutes('/api/campuses', Campus, ['state', 'city', 'type']);
  contentRoutes('/api/podcasts', PodcastEpisode, ['category', 'status']);
  contentRoutes('/api/events', Event, ['category', 'status', 'city', 'state']);
  contentRoutes('/api/opportunities', Opportunity, ['type', 'mode', 'status', 'location'], false);
  contentRoutes('/api/current-affairs', CurrentAffairsEdition, ['status', 'year', 'month']);
  contentRoutes('/api/legal-awareness', LegalArticle, ['topic', 'status']);
  contentRoutes('/api/campaigns', Campaign, ['status']);
  contentRoutes('/api/campaign-episodes', CampaignEpisode, ['status', 'campaign'], false);
  contentRoutes('/api/categories', Category, ['section'], false);
  contentRoutes('/api/tags', Tag, undefined, false);
  contentRoutes('/api/media', Media, ['type'], false);

  /* ── Submission moderation (admin/editor) ───────────────────────────── */
  app.get(
    '/api/submissions/story',
    requireAuth,
    requireEditor,
    asyncHandler(async (_req, res) => {
      const data = await StorySubmission.find().sort({ createdAt: -1 }).limit(100);
      res.json({ success: true, data });
    })
  );
  app.get(
    '/api/submissions/campus',
    requireAuth,
    requireEditor,
    asyncHandler(async (_req, res) => {
      const data = await CampusSubmission.find().sort({ createdAt: -1 }).limit(100);
      res.json({ success: true, data });
    })
  );
  app.put(
    '/api/submissions/:kind(story|campus)/:id',
    requireAuth,
    requireEditor,
    validate(moderateSubmissionSchema),
    asyncHandler(async (req: AuthRequest, res) => {
      const kind = req.params.kind === 'story' ? 'story' : 'campus';
      const doc = await submissionService.moderate(kind, req.params.id, req.body.status, req.body.reviewNote, String(req.user!._id));
      res.json({ success: true, data: doc });
    })
  );

  /* ── Memberships & notifications (member) ───────────────────────────── */
  app.get(
    '/api/memberships/me',
    requireAuth,
    asyncHandler(async (req: AuthRequest, res) => {
      const data = await Membership.findOne({ user: req.user!._id }).sort({ createdAt: -1 });
      res.json({ success: true, data });
    })
  );

  app.get(
    '/api/notifications',
    requireAuth,
    asyncHandler(async (req: AuthRequest, res) => {
      const data = await Notification.find({ user: req.user!._id }).sort({ createdAt: -1 }).limit(50);
      res.json({ success: true, data });
    })
  );
  app.put(
    '/api/notifications/:id/read',
    requireAuth,
    asyncHandler(async (req: AuthRequest, res) => {
      const data = await Notification.findOneAndUpdate(
        { _id: req.params.id, user: req.user!._id },
        { read: true },
        { new: true }
      );
      res.json({ success: true, data });
    })
  );

  /* ── Admin: users & stats ───────────────────────────────────────────── */
  app.get(
    '/api/users',
    requireAuth,
    requireAdmin,
    asyncHandler(async (_req, res) => {
      const data = await User.find().sort({ createdAt: -1 }).limit(200);
      res.json({ success: true, data });
    })
  );
  app.put(
    '/api/users/:id/role',
    requireAuth,
    requireAdmin,
    asyncHandler(async (req: Request, res) => {
      const { role } = req.body as { role: 'member' | 'editor' | 'admin' };
      if (!['member', 'editor', 'admin'].includes(role)) throw ApiError.badRequest('Invalid role');
      const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
      if (!user) throw ApiError.notFound('User not found');
      res.json({ success: true, data: user });
    })
  );

  app.get(
    '/api/admin/stats',
    requireAuth,
    requireEditor,
    asyncHandler(async (_req, res) => {
      const [members, newMembers, pendingStories, pendingCampus, articles, upcomingEvents, activeOpps, episodes, campusCount] =
        await Promise.all([
          User.countDocuments({ role: 'member' }),
          User.countDocuments({ role: 'member', createdAt: { $gte: new Date(Date.now() - 30 * 24 * 3600 * 1000) } }),
          StorySubmission.countDocuments({ status: 'pending' }),
          CampusSubmission.countDocuments({ status: 'pending' }),
          Article.countDocuments({ status: 'published' }),
          Event.countDocuments({ status: 'upcoming' }),
          Opportunity.countDocuments({ status: 'active' }),
          PodcastEpisode.countDocuments({}),
          Campus.countDocuments({}),
        ]);
      res.json({
        success: true,
        data: { members, newMembers, pendingStories, pendingCampus, articles, upcomingEvents, activeOpps, episodes, campusCount },
      });
    })
  );
}
