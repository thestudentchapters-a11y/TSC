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
import Subscriber from '../models/Subscriber';
import ContactMessage from '../models/ContactMessage';

import { createContentService } from '../services/content.service';
import { submissionService } from '../services/engagement.service';
import { emailService } from '../services/email.service';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth, requireEditor, requireAdmin, type AuthRequest } from '../middleware/auth';
import { authRouter } from './auth.routes';
import { engagementRouter } from './engagement.routes';
import { hiringRouter } from './hiring.routes';
import { broadcastRouter } from './broadcast.routes';
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

  /* ── Auth + engagement + hiring + broadcast ─────────────────────────── */
  app.use('/', authRouter);
  app.use('/', engagementRouter);
  app.use('/', hiringRouter);
  app.use('/', broadcastRouter);

  /* ── Content collections ────────────────────────────────────────────── */
  function contentRoutes(basePath: string, model: Parameters<typeof createContentService>[0], filterKeys?: string[], slugLookup = true) {
    const service = createContentService(model, filterKeys);

    app.get(
      basePath,
      asyncHandler(async (req: Request, res: Response) => {
        const result = await service.list(req.query as Record<string, unknown>);
        res.json({ success: true, ...result, items: result.data });
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
        const author = req.body.author || req.user?.name || 'TSC Editorial Team';
        const doc = await service.create({ ...req.body, createdBy: req.user?._id, author });
        res.status(201).json({ success: true, data: doc });
      })
    );

    app.put(
      `${basePath}/:id`,
      requireAuth,
      requireEditor,
      asyncHandler(async (req: AuthRequest, res: Response) => {
        if (basePath === '/api/story-submissions' && req.body.status) {
          const doc = await submissionService.moderate(
            'story',
            req.params.id,
            req.body.status,
            req.body.reviewNote,
            String(req.user?._id || '')
          );
          return res.json({ success: true, data: doc });
        }
        if (basePath === '/api/campus-submissions' && req.body.status) {
          const doc = await submissionService.moderate(
            'campus',
            req.params.id,
            req.body.status,
            req.body.reviewNote,
            String(req.user?._id || '')
          );
          return res.json({ success: true, data: doc });
        }
        res.json({ success: true, data: await service.update(req.params.id, req.body) });
      })
    );

    app.delete(
      `${basePath}/:id`,
      requireAuth,
      requireEditor,
      asyncHandler(async (req: Request, res: Response) => {
        const idOrSlug = req.params.id;

        if (basePath === '/api/stories') {
          try {
            const story = isObjectId(idOrSlug)
              ? await Story.findById(idOrSlug)
              : await Story.findOne({ slug: idOrSlug });

            if (story) {
              const query: Record<string, any>[] = [];
              if ((story as any).submissionId) {
                query.push({ _id: (story as any).submissionId });
              }
              if (story.title) {
                query.push({ storyTitle: story.title });
              }
              if (query.length > 0) {
                await StorySubmission.updateMany(
                  { $or: query },
                  { status: 'pending', reviewNote: 'Returned to pending queue after published story was deleted from admin stories.' }
                );
              }
            }
          } catch (err) {
            console.error('[Story Delete Hook Error]:', err);
          }
        } else if (basePath === '/api/news') {
          try {
            const article = isObjectId(idOrSlug)
              ? await Article.findById(idOrSlug)
              : await Article.findOne({ slug: idOrSlug });

            if (article) {
              const query: Record<string, any>[] = [];
              if ((article as any).submissionId) {
                query.push({ _id: (article as any).submissionId });
              }
              if (article.title) {
                query.push({ newsTitle: article.title });
              }
              if (query.length > 0) {
                await CampusSubmission.updateMany(
                  { $or: query },
                  { status: 'pending', reviewNote: 'Returned to pending queue after published news was deleted.' }
                );
              }
            }
          } catch (err) {
            console.error('[News Delete Hook Error]:', err);
          }
        } else if (basePath === '/api/media') {
          try {
            const isOid = isObjectId(idOrSlug);
            if (isOid) {
              await Media.findByIdAndDelete(idOrSlug);
            } else {
              const decoded = decodeURIComponent(idOrSlug);
              await Media.findOneAndDelete({
                $or: [
                  { url: decoded },
                  { url: idOrSlug },
                  { publicId: decoded },
                  { publicId: idOrSlug },
                  { filename: decoded },
                ],
              });
            }
            return res.json({ success: true, data: null });
          } catch (err) {
            console.error('[Media Delete Error]:', err);
          }
        }

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
  app.get(
    '/api/campaigns',
    asyncHandler(async (req: Request, res: Response) => {
      const filter: any = {};
      if (req.query.status) {
        filter.status = req.query.status;
      }
      const campaigns = await Campaign.find(filter).sort({ featured: -1, createdAt: -1 }).lean();
      const SEEDED_EPISODE_SLUGS = new Set([
        'the-doctor',
        'the-founder',
        'the-civil-servant',
        'the-creator',
        'the-engineer',
        'the-educator',
      ]);

      const isAutoSeededEpisode = (ep: any) => {
        if (!ep) return false;
        const id = String(ep.id || ep._id || '');
        if (['ce1', 'ce2', 'ce3', 'ce4', 'ce5', 'ce6'].includes(id)) return true;
        const slug = String(ep.slug || '').toLowerCase();
        if (SEEDED_EPISODE_SLUGS.has(slug)) return true;
        return false;
      };

      const allEpisodes = (await CampaignEpisode.find({}).sort({ episodeNumber: -1, createdAt: -1 }).lean())
        .filter((ep) => !isAutoSeededEpisode(ep));

      let campaignList = campaigns;
      const hasFeaturedInDb = campaigns.some((c) => Boolean(c.featured));

      if (!campaignList.some((c) => c.slug === 'all-india-career-awareness')) {
        const defaultCamp: any = {
          _id: 'camp1',
          slug: 'all-india-career-awareness',
          eyebrow: 'TSC ORIGINAL CAMPAIGN',
          title: 'ALL INDIA CAREER AWARENESS YOUTH DOCUMENTARY SERIES',
          headline: 'Real Careers. Real People. Real Possibilities.',
          description:
            'What if students could see what a career actually looks like before choosing one? Our All India Career Awareness Youth Documentary Series takes students beyond generic career advice and into the real world — meeting professionals, entrepreneurs, creators, specialists and people building meaningful careers across different industries. Because sometimes, discovering what\'s possible is the first step towards discovering what you want.',
          stills: [
            { image: '/images/campaign/campaign-1.jpg', alt: 'Documentary still 1' },
            { image: '/images/campaign/campaign-2.jpg', alt: 'Documentary still 2' },
            { image: '/images/campaign/campaign-3.jpg', alt: 'Documentary still 3' },
          ],
          categories: ['Medicine', 'Public Administration', 'Technology', 'Media & Creation', 'Engineering', 'Education', 'Entrepreneurship'],
          locations: ['Patna', 'Delhi', 'Bengaluru', 'Mumbai', 'Hyderabad', 'Kochi'],
          status: 'published',
          featured: !hasFeaturedInDb,
        };
        campaignList = [defaultCamp, ...campaignList];
      }

      // Ensure featured campaign is placed first for home page and listings
      campaignList.sort((a: any, b: any) => {
        const aFeat = Boolean(a.featured) ? 1 : 0;
        const bFeat = Boolean(b.featured) ? 1 : 0;
        if (bFeat !== aFeat) return bFeat - aFeat;
        return new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime();
      });

      const populated = campaignList.map((camp: any) => {
        const isDefault = camp.slug === 'all-india-career-awareness';
        const campIds = new Set([String(camp._id), camp.slug, (camp as any).id].filter(Boolean));
        if (isDefault) {
          campIds.add('camp1');
          campIds.add('all-india-career-awareness');
        }

        const seenKeys = new Set<string>();
        const episodes = allEpisodes
          .filter((ep: any) => {
            if ((!ep.campaign || ep.campaign === 'camp1') && isDefault) return true;
            if (campIds.has(String(ep.campaign))) return true;
            if (ep.campaignSlug && ep.campaignSlug === camp.slug) return true;
            return false;
          })
          .filter((ep: any) => {
            const key = (ep.slug || ep.title || (ep.episodeNumber ? `ep-${ep.episodeNumber}` : '') || String(ep._id || '')).trim().toLowerCase();
            if (!key) return true;
            if (seenKeys.has(key)) return false;
            seenKeys.add(key);
            return true;
          })
          .sort((a: any, b: any) => (Number(b.episodeNumber) || 0) - (Number(a.episodeNumber) || 0));

        return {
          ...camp,
          episodes,
        };
      });

      res.json({
        success: true,
        data: populated,
        items: populated,
      });
    })
  );

  app.get(
    '/api/campaigns/:idOrSlug',
    asyncHandler(async (req: Request, res: Response) => {
      const key = req.params.idOrSlug;
      let doc: any = isObjectId(key)
        ? await Campaign.findById(key).lean()
        : await Campaign.findOne({ slug: key }).lean();

      const isDefault = key === 'all-india-career-awareness' || doc?.slug === 'all-india-career-awareness';

      if (!doc && isDefault) {
        doc = {
          _id: 'camp1' as any,
          slug: 'all-india-career-awareness',
          eyebrow: 'TSC ORIGINAL CAMPAIGN',
          title: 'ALL INDIA CAREER AWARENESS YOUTH DOCUMENTARY SERIES',
          headline: 'Real Careers. Real People. Real Possibilities.',
          description:
            'What if students could see what a career actually looks like before choosing one? Our All India Career Awareness Youth Documentary Series takes students beyond generic career advice and into the real world — meeting professionals, entrepreneurs, creators, specialists and people building meaningful careers across different industries. Because sometimes, discovering what\'s possible is the first step towards discovering what you want.',
          stills: [
            { image: '/images/campaign/campaign-1.jpg', alt: 'Documentary still 1' },
            { image: '/images/campaign/campaign-2.jpg', alt: 'Documentary still 2' },
            { image: '/images/campaign/campaign-3.jpg', alt: 'Documentary still 3' },
          ],
          categories: ['Medicine', 'Public Administration', 'Technology', 'Media & Creation', 'Engineering', 'Education', 'Entrepreneurship'],
          locations: ['Patna', 'Delhi', 'Bengaluru', 'Mumbai', 'Hyderabad', 'Kochi'],
          status: 'published',
          featured: true,
        };
      }

      if (!doc) throw ApiError.notFound('Campaign not found');

      const campaignIdentifiers: any[] = [doc._id, String(doc._id), doc.slug];
      if ((doc as any).id) campaignIdentifiers.push((doc as any).id);
      if (isDefault) {
        campaignIdentifiers.push('camp1', 'all-india-career-awareness');
      }

      const orConditions: any[] = [
        { campaign: { $in: campaignIdentifiers } },
        { campaignSlug: doc.slug },
      ];

      if (isDefault) {
        orConditions.push(
          { campaign: { $exists: false } },
          { campaign: null },
          { campaign: '' },
          { campaign: 'default' }
        );
      }

      const SEEDED_EPISODE_SLUGS = new Set([
        'the-doctor',
        'the-founder',
        'the-civil-servant',
        'the-creator',
        'the-engineer',
        'the-educator',
      ]);

      const isAutoSeededEpisode = (ep: any) => {
        if (!ep) return false;
        const id = String(ep.id || ep._id || '');
        if (['ce1', 'ce2', 'ce3', 'ce4', 'ce5', 'ce6'].includes(id)) return true;
        const slug = String(ep.slug || '').toLowerCase();
        if (SEEDED_EPISODE_SLUGS.has(slug)) return true;
        return false;
      };

      const seenKeys = new Set<string>();
      const episodes = (await CampaignEpisode.find({ $or: orConditions })
        .sort({ episodeNumber: -1, createdAt: -1 })
        .lean())
        .filter((ep) => !isAutoSeededEpisode(ep))
        .filter((ep: any) => {
          const key = (ep.slug || ep.title || (ep.episodeNumber ? `ep-${ep.episodeNumber}` : '') || String(ep._id || '')).trim().toLowerCase();
          if (!key) return true;
          if (seenKeys.has(key)) return false;
          seenKeys.add(key);
          return true;
        });

      res.json({
        success: true,
        data: {
          ...doc,
          episodes,
        },
      });
    })
  );

  app.post(
    '/api/campaigns',
    requireAuth,
    requireEditor,
    asyncHandler(async (req: AuthRequest, res: Response) => {
      const data: Record<string, any> = { ...req.body, createdBy: req.user?._id };
      delete data._id;
      delete data.id;

      if (data.featured === true) {
        await Campaign.updateMany({}, { $set: { featured: false } });
      }

      const created = await Campaign.create(data);
      res.status(201).json({ success: true, data: created });
    })
  );

  app.put(
    '/api/campaigns/:idOrSlug',
    requireAuth,
    requireEditor,
    asyncHandler(async (req: AuthRequest, res: Response) => {
      const key = req.params.idOrSlug;
      const data: Record<string, any> = { ...req.body, updatedAt: new Date() };
      delete data._id;
      delete data.id;

      const isOid = isObjectId(key);
      let query: any = isOid ? { _id: key } : { slug: key };
      if (!isOid && key === 'camp1') {
        query = { slug: 'all-india-career-awareness' };
      }

      if (data.featured === true) {
        const excludeFilter: any[] = [];
        if (query._id) excludeFilter.push({ _id: { $ne: query._id } });
        if (query.slug) excludeFilter.push({ slug: { $ne: query.slug } });
        await Campaign.updateMany(
          excludeFilter.length > 0 ? { $and: excludeFilter } : {},
          { $set: { featured: false } }
        );
      }

      const updated = await Campaign.findOneAndUpdate(query, data, {
        new: true,
        runValidators: true,
        upsert: true,
      }).lean();

      res.json({ success: true, data: updated });
    })
  );

  contentRoutes('/api/campaigns', Campaign, ['status'], false);
  contentRoutes('/api/campaign-episodes', CampaignEpisode, ['status', 'campaign'], false);
  contentRoutes('/api/categories', Category, ['section'], false);
  contentRoutes('/api/tags', Tag, undefined, false);
  contentRoutes('/api/media', Media, ['type'], false);
  contentRoutes('/api/subscribers', Subscriber, ['status', 'source'], false);
  contentRoutes('/api/story-submissions', StorySubmission, ['status', 'category'], false);
  contentRoutes('/api/campus-submissions', CampusSubmission, ['status', 'category'], false);
  contentRoutes('/api/contact-messages', ContactMessage, ['status'], false);

  /* ── Contact Message Admin Reply ────────────────────────────────────── */
  app.post(
    '/api/contact-messages/:id/reply',
    requireAuth,
    requireEditor,
    asyncHandler(async (req: AuthRequest, res) => {
      const { replyMessage, subject } = req.body;
      if (!replyMessage || typeof replyMessage !== 'string' || !replyMessage.trim()) {
        throw ApiError.badRequest('Reply message is required');
      }

      const msg = await ContactMessage.findById(req.params.id);
      if (!msg) throw ApiError.notFound('Contact message not found');

      // Send email to the student/user
      await emailService.sendContactReply(
        msg.email,
        msg.name,
        subject || msg.subject,
        replyMessage.trim()
      );

      // Automatically update status to replied
      msg.status = 'replied';
      await msg.save();

      res.json({
        success: true,
        message: `Reply sent successfully to ${msg.email}`,
        data: msg,
      });
    })
  );

  app.put(
    '/api/contact-messages/:id/status',
    requireAuth,
    requireEditor,
    asyncHandler(async (req: AuthRequest, res) => {
      const { status } = req.body;
      if (!['new', 'read', 'replied'].includes(status)) {
        throw ApiError.badRequest('Status must be new, read, or replied');
      }

      const msg = await ContactMessage.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );
      if (!msg) throw ApiError.notFound('Contact message not found');

      res.json({ success: true, data: msg });
    })
  );

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
          // Lossless & perceptual optimization: prevents excessive storage usage on Cloudinary
          transformation: 'c_limit,w_2048,h_2048,q_auto:good,f_auto',
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

  app.delete(
    '/api/submissions/:kind(story|campus)/:id',
    requireAuth,
    requireEditor,
    asyncHandler(async (req: AuthRequest, res) => {
      if (req.params.kind === 'story') {
        await StorySubmission.findByIdAndDelete(req.params.id);
      } else {
        await CampusSubmission.findByIdAndDelete(req.params.id);
      }
      res.json({ success: true, data: null });
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
  app.post(
    '/api/users',
    requireAuth,
    requireAdmin,
    asyncHandler(async (req: Request, res: Response) => {
      const { name, email, password, role, college, city, state, customPermissions } = req.body;
      if (!name || !email || !password) {
        throw ApiError.badRequest('Name, email, and password are required');
      }
      const existing = await User.findOne({ email: email.toLowerCase().trim() });
      if (existing) {
        throw ApiError.conflict('A user with this email already exists');
      }
      const validRole = ['editor', 'admin'].includes(role) ? role : 'editor';
      const user = await User.create({
        name,
        email: email.toLowerCase().trim(),
        passwordHash: password,
        role: validRole,
        college: college || '',
        city: city || '',
        state: state || '',
        customPermissions: Array.isArray(customPermissions) ? customPermissions : [],
        isEmailVerified: true,
      });
      res.status(201).json({ success: true, data: user });
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
