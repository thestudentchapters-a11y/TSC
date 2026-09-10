import SiteSettings from '../models/SiteSettings';
import Subscriber from '../models/Subscriber';
import User from '../models/User';
import BroadcastLog from '../models/BroadcastLog';
import { emailService } from './email.service';
import { autoWriteBroadcastEmail, type EmailWriterInput } from './emailWriterAi.service';
import { logger } from '../utils/logger';

export interface PublishBroadcastTriggerOptions extends EmailWriterInput {
  force?: boolean;
}

export const notificationBroadcaster = {
  /**
   * Evaluates settings and dispatches an automated notification email when new content is published.
   */
  async broadcastOnPublish(options: PublishBroadcastTriggerOptions): Promise<{
    skipped: boolean;
    reason?: string;
    sentCount?: number;
    failedCount?: number;
    logId?: string;
  }> {
    const type = options.contentType || 'current-affairs';

    // 1. Fetch site settings to check if auto-broadcast is enabled for this content type
    const settings = await SiteSettings.findById('global').lean();
    const automations = settings?.emailAutomations;

    let automationConfig: { enabled: boolean; autoBroadcastOnPublish: boolean; targetAudience: 'all' | 'subscribers' | 'members' } | undefined;

    if (type === 'current-affairs') {
      automationConfig = automations?.currentAffairs ?? { enabled: true, autoBroadcastOnPublish: true, targetAudience: 'all' };
    } else if (type === 'news') {
      automationConfig = automations?.news ?? { enabled: false, autoBroadcastOnPublish: false, targetAudience: 'all' };
    } else if (type === 'stories') {
      automationConfig = automations?.stories ?? { enabled: false, autoBroadcastOnPublish: false, targetAudience: 'all' };
    } else if (type === 'campuses') {
      automationConfig = automations?.campuses ?? { enabled: false, autoBroadcastOnPublish: false, targetAudience: 'all' };
    } else if (type === 'opportunities') {
      automationConfig = automations?.opportunities ?? { enabled: false, autoBroadcastOnPublish: false, targetAudience: 'all' };
    } else if (type === 'legal') {
      automationConfig = automations?.legalAwareness ?? { enabled: false, autoBroadcastOnPublish: false, targetAudience: 'all' };
    }

    if (!options.force && (!automationConfig?.enabled || !automationConfig?.autoBroadcastOnPublish)) {
      logger.info(`[NotificationBroadcaster] Auto-broadcast disabled for ${type}. Skipping.`);
      return { skipped: true, reason: `Auto-broadcast disabled for ${type}` };
    }

    const targetAudience = automationConfig?.targetAudience || 'all';

    // 2. Fetch audience recipients
    let recipientEmails: string[] = [];
    if (targetAudience === 'subscribers') {
      const subs = await Subscriber.find({ status: 'active' }).select('email').lean();
      recipientEmails = subs.map((s) => s.email.toLowerCase());
    } else if (targetAudience === 'members') {
      const users = await User.find({ isActive: true }).select('email').lean();
      recipientEmails = users.map((u) => u.email.toLowerCase());
    } else {
      const [subs, users] = await Promise.all([
        Subscriber.find({ status: 'active' }).select('email').lean(),
        User.find({ isActive: true }).select('email').lean(),
      ]);
      const subEmails = subs.map((s) => s.email.toLowerCase());
      const userEmails = users.map((u) => u.email.toLowerCase());
      recipientEmails = Array.from(new Set([...subEmails, ...userEmails]));
    }

    if (recipientEmails.length === 0) {
      logger.info(`[NotificationBroadcaster] No recipients found for ${targetAudience}. Skipping dispatch.`);
      return { skipped: true, reason: 'No recipients available' };
    }

    logger.info(`[NotificationBroadcaster] Auto-generating email for ${type} ("${options.title || 'Untitled'}")...`);
    const emailDraft = await autoWriteBroadcastEmail(options);

    logger.info(`[NotificationBroadcaster] Dispatching automated broadcast to ${recipientEmails.length} recipients (${targetAudience})...`);
    const sendResult = await emailService.sendBroadcastNotification(recipientEmails, {
      subject: emailDraft.subject,
      previewText: emailDraft.previewText,
      heading: emailDraft.heading,
      body: emailDraft.body,
      buttonLabel: emailDraft.buttonLabel,
      buttonUrl: emailDraft.buttonUrl,
    });

    const log = await BroadcastLog.create({
      subject: emailDraft.subject,
      previewText: emailDraft.previewText,
      heading: emailDraft.heading,
      body: emailDraft.body,
      buttonLabel: emailDraft.buttonLabel,
      buttonUrl: emailDraft.buttonUrl,
      targetAudience,
      recipientCount: recipientEmails.length,
      sentCount: sendResult.sentCount,
      failedCount: sendResult.failedCount,
    });

    logger.info(`[NotificationBroadcaster] Automated broadcast completed! Sent: ${sendResult.sentCount}, Failed: ${sendResult.failedCount}`);

    return {
      skipped: false,
      sentCount: sendResult.sentCount,
      failedCount: sendResult.failedCount,
      logId: String(log._id),
    };
  },
};
