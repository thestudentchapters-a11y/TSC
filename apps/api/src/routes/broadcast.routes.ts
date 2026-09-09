import { Router, type Response } from 'express';
import { requireAuth, requireAdmin, requireEditor, type AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/apiError';
import Subscriber from '../models/Subscriber';
import User from '../models/User';
import BroadcastLog from '../models/BroadcastLog';
import { emailService } from '../services/email.service';

export const broadcastRouter = Router();

/**
 * Get Audience Stats (subscriber count, member count, deduplicated total)
 */
broadcastRouter.get(
  '/api/admin/broadcasts/audience-stats',
  requireAuth,
  requireEditor,
  asyncHandler(async (_req: AuthRequest, res: Response) => {
    const [subscribers, members] = await Promise.all([
      Subscriber.find({ status: 'active' }).select('email').lean(),
      User.find({ isActive: true }).select('email').lean(),
    ]);

    const subscriberEmails = subscribers.map((s) => s.email.toLowerCase());
    const memberEmails = members.map((m) => m.email.toLowerCase());
    const uniqueAll = Array.from(new Set([...subscriberEmails, ...memberEmails]));

    res.json({
      success: true,
      data: {
        subscriberCount: subscriberEmails.length,
        memberCount: memberEmails.length,
        totalUniqueCount: uniqueAll.length,
      },
    });
  })
);

/**
 * List Past Broadcast Campaigns
 */
broadcastRouter.get(
  '/api/admin/broadcasts',
  requireAuth,
  requireEditor,
  asyncHandler(async (_req: AuthRequest, res: Response) => {
    const logs = await BroadcastLog.find().sort({ createdAt: -1 }).limit(50).populate('sentBy', 'name email').lean();
    res.json({ success: true, data: logs });
  })
);

/**
 * Send a Test Broadcast Email to Admin
 */
broadcastRouter.post(
  '/api/admin/broadcasts/test',
  requireAuth,
  requireEditor,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { subject, previewText, heading, body, buttonLabel, buttonUrl, testEmail } = req.body;

    if (!subject || !body) {
      throw ApiError.badRequest('Subject and body message are required.');
    }

    const targetEmail = (testEmail || req.user?.email || '').trim();
    if (!targetEmail) {
      throw ApiError.badRequest('Admin email address not found.');
    }

    const result = await emailService.sendBroadcastNotification([targetEmail], {
      subject: `[TEST] ${subject}`,
      previewText: previewText || 'Preview Test Broadcast',
      heading: heading || subject,
      body,
      buttonLabel,
      buttonUrl,
    });

    res.json({
      success: true,
      message: `Test email sent to ${targetEmail}`,
      details: result,
    });
  })
);

/**
 * Broadcast Campaign to Selected Audience
 */
broadcastRouter.post(
  '/api/admin/broadcasts/send',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { subject, previewText, heading, body, buttonLabel, buttonUrl, targetAudience = 'all' } = req.body;

    if (!subject || !body) {
      throw ApiError.badRequest('Subject and body are required.');
    }

    let recipientEmails: string[] = [];

    if (targetAudience === 'subscribers') {
      const subs = await Subscriber.find({ status: 'active' }).select('email').lean();
      recipientEmails = subs.map((s) => s.email.toLowerCase());
    } else if (targetAudience === 'members') {
      const users = await User.find({ isActive: true }).select('email').lean();
      recipientEmails = users.map((u) => u.email.toLowerCase());
    } else {
      // 'all' audience - combined & deduplicated
      const [subs, users] = await Promise.all([
        Subscriber.find({ status: 'active' }).select('email').lean(),
        User.find({ isActive: true }).select('email').lean(),
      ]);
      const subEmails = subs.map((s) => s.email.toLowerCase());
      const userEmails = users.map((u) => u.email.toLowerCase());
      recipientEmails = Array.from(new Set([...subEmails, ...userEmails]));
    }

    if (recipientEmails.length === 0) {
      throw ApiError.badRequest('No active recipients found for the selected audience.');
    }

    const sendResult = await emailService.sendBroadcastNotification(recipientEmails, {
      subject,
      previewText,
      heading: heading || subject,
      body,
      buttonLabel,
      buttonUrl,
    });

    const log = await BroadcastLog.create({
      subject,
      previewText,
      heading,
      body,
      buttonLabel,
      buttonUrl,
      targetAudience,
      recipientCount: recipientEmails.length,
      sentCount: sendResult.sentCount,
      failedCount: sendResult.failedCount,
      sentBy: req.user?._id,
    });

    res.status(201).json({
      success: true,
      message: `Broadcast sent to ${sendResult.sentCount} recipients.`,
      data: log,
      result: sendResult,
    });
  })
);
