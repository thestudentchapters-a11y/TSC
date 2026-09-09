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
import SiteSettings from '../models/SiteSettings';
import { StorySubmission, CampusSubmission } from '../models/Submission';
import HiringApplication from '../models/HiringApplication';

import { createContentService } from '../services/content.service';
import { submissionService } from '../services/engagement.service';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth, requireEditor, requireAdmin, type AuthRequest } from '../middleware/auth';
import { authRouter } from './auth.routes';
import { engagementRouter } from './engagement.routes';
import { hiringRouter } from './hiring.routes';
import { moderateSubmissionSchema } from '../validators';
import { validate } from '../middleware/validate';
import { env } from '../config/env';
import { ApiError } from '../utils/apiError';
import { generateCurrentAffairsEdition } from '../services/currentAffairsAi.service';
import {
  checkAndAutoPublishMonthlyEdition,
  getNextScheduledReleaseDate,
  isLastDayOfMonth,
} from '../services/currentAffairsScheduler.service';

const isObjectId = (v: string) => mongoose.Types.ObjectId.isValid(v) && /^[a-f\d]{24}$/i.test(v);

export function registerRoutes(app: Router) {
  /* ── Health ─────────────────────────────────────────────────────────── */
  app.get('/health', (_req, res) => {
    res.json({ success: true, service: 'THE STUDENT CHAPTERS™ API', time: new Date().toISOString() });
  });

  /* ── Auth + engagement + hiring ─────────────────────────────────────── */
  app.use('/', authRouter);
  app.use('/', engagementRouter);
  app.use('/', hiringRouter);

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

  /* ── Current Affairs AI Generation & Scheduler Control ────────────────── */
  app.post(
    '/api/current-affairs/generate-ai',
    asyncHandler(async (req: Request, res: Response) => {
      const { month, year, overwrite, apiKey } = req.body;
      if (!month || !year) {
        return res.status(400).json({ success: false, error: 'Month and Year are required.' });
      }

      const generated = await generateCurrentAffairsEdition(String(month), Number(year), apiKey);

      // Check if already exists in DB
      const existing = await CurrentAffairsEdition.findOne({ month: String(month), year: Number(year) });
      let doc;
      if (existing) {
        if (overwrite) {
          doc = await CurrentAffairsEdition.findByIdAndUpdate(
            existing._id,
            { ...generated, updatedAt: new Date() },
            { new: true }
          );
        } else {
          doc = existing;
        }
      } else {
        doc = await CurrentAffairsEdition.create(generated);
      }

      res.status(200).json({ success: true, data: doc || generated, generated });
    })
  );

  app.get(
    '/api/current-affairs/scheduler/status',
    asyncHandler(async (_req: Request, res: Response) => {
      const now = new Date();
      const nextDate = getNextScheduledReleaseDate(now);
      const isTodayLastDay = isLastDayOfMonth(now);
      const count = await CurrentAffairsEdition.countDocuments();
      const latest = await CurrentAffairsEdition.findOne().sort({ year: -1, createdAt: -1 }).lean();

      res.json({
        success: true,
        data: {
          currentTime: now.toISOString(),
          isTodayLastDay,
          nextScheduledRelease: nextDate.toISOString(),
          totalEditions: count,
          latestEdition: latest ? { month: latest.month, year: latest.year, title: latest.title, status: latest.status } : null,
        },
      });
    })
  );

  app.post(
    '/api/current-affairs/scheduler/trigger',
    asyncHandler(async (_req: Request, res: Response) => {
      const created = await checkAndAutoPublishMonthlyEdition(true);
      res.json({ success: true, triggered: true, newEditionCreated: created });
    })
  );
  contentRoutes('/api/campaigns', Campaign, ['status']);
  contentRoutes('/api/campaign-episodes', CampaignEpisode, ['status', 'campaign'], false);
  contentRoutes('/api/categories', Category, ['section'], false);
  contentRoutes('/api/tags', Tag, undefined, false);
  contentRoutes('/api/media', Media, ['type'], false);

  /* ── Cloudinary Media Upload (admin/editor) ─────────────────────────── */
  app.post(
    '/api/media/upload',
    asyncHandler(async (req: AuthRequest, res) => {
      const { file, altText, caption } = req.body;
      if (!file) {
        return res.status(400).json({ success: false, error: 'Image file (data URL or base64) is required.' });
      }

      if (!env.cloudinary.cloudName || !env.cloudinary.apiKey || !env.cloudinary.apiSecret) {
        return res.status(500).json({ success: false, error: 'Cloudinary is not configured in server environment.' });
      }

      const auth = Buffer.from(`${env.cloudinary.apiKey}:${env.cloudinary.apiSecret}`).toString('base64');
      const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${env.cloudinary.cloudName}/image/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file,
          folder: 'tsc_media',
        }),
      });

      const cloudData = (await cloudRes.json()) as any;
      if (!cloudRes.ok) {
        return res.status(500).json({ success: false, error: cloudData.error?.message || 'Failed to upload to Cloudinary' });
      }

      const mediaDoc = await Media.create({
        url: cloudData.secure_url || cloudData.url,
        publicId: cloudData.public_id,
        filename: cloudData.original_filename || `tsc-upload-${Date.now()}`,
        altText: altText || 'Uploaded media asset',
        caption: caption || '',
        type: 'image',
        dimensions: { width: cloudData.width, height: cloudData.height },
        sizeBytes: cloudData.bytes,
        uploadedBy: req.user?._id,
      });

      res.status(201).json({
        success: true,
        data: mediaDoc,
        url: mediaDoc.url,
      });
    })
  );

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

  app.put(
    '/api/users/:id/permissions',
    requireAuth,
    requireAdmin,
    asyncHandler(async (req: Request, res) => {
      const { permissions } = req.body as { permissions: string[] };
      if (!Array.isArray(permissions)) throw ApiError.badRequest('Permissions must be an array of strings');
      const user = await User.findByIdAndUpdate(req.params.id, { customPermissions: permissions }, { new: true });
      if (!user) throw ApiError.notFound('User not found');
      res.json({ success: true, data: user });
    })
  );

  app.get(
    '/api/admin/stats',
    requireAuth,
    requireEditor,
    asyncHandler(async (_req, res) => {
      const [members, newMembers, pendingStories, pendingCampus, articles, upcomingEvents, activeOpps, episodes, campusCount, totalHiring, pendingHiring] =
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
          HiringApplication.countDocuments({}),
          HiringApplication.countDocuments({ status: 'pending' }),
        ]);
      res.json({
        success: true,
        data: { members, newMembers, pendingStories, pendingCampus, articles, upcomingEvents, activeOpps, episodes, campusCount, totalHiring, pendingHiring },
      });
    })
  );

  /* ── Site Settings (Admin & Public) ────────────────────────────────── */
  app.get(
    '/api/settings',
    asyncHandler(async (_req, res) => {
      const doc = await SiteSettings.findById('global').lean();
      res.json({ success: true, data: doc });
    })
  );

  app.put(
    '/api/settings',
    requireAuth,
    requireAdmin,
    asyncHandler(async (req: Request, res) => {
      const doc = await SiteSettings.findByIdAndUpdate('global', { ...req.body, _id: 'global' }, { upsert: true, new: true });
      res.json({ success: true, data: doc });
    })
  );
}
