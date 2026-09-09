import { CampusSubmission, StorySubmission, CareerSubmission } from '../models/Submission';
import type { Model } from 'mongoose';
import ContactMessage from '../models/ContactMessage';
import EventRegistration from '../models/EventRegistration';
import Event from '../models/Event';
import Notification from '../models/Notification';
import SavedItem from '../models/SavedItem';
import { ApiError } from '../utils/apiError';

import Story from '../models/Story';
import User from '../models/User';
import { slugify } from '../utils/slugify';

/** Community submissions (story / campus news / articles) + review workflow. */
export const submissionService = {
  async submitStory(payload: Record<string, unknown>, userId?: string) {
    const doc = await StorySubmission.create({
      user: userId || undefined,
      name: payload.name,
      email: payload.email,
      phone: payload.phone || undefined,
      college: payload.college,
      city: payload.city,
      state: payload.state,
      storyTitle: payload.title || payload.storyTitle,
      storyCategory: payload.category || payload.storyCategory || 'student',
      storyContent: payload.content || payload.storyContent,
      images: Array.isArray(payload.images) ? payload.images : payload.image ? [payload.image] : [],
      videoUrl: payload.videoUrl || undefined,
      socialLinks: payload.social || payload.socialLinks,
      consent: true,
      status: 'pending',
    });
    return doc;
  },

  async submitCampusNews(payload: Record<string, unknown>, userId?: string) {
    const doc = await CampusSubmission.create({
      user: userId || undefined,
      name: payload.name,
      email: payload.email,
      college: payload.college,
      campus: payload.campus || payload.college,
      city: payload.city,
      state: payload.state,
      newsTitle: payload.title || payload.newsTitle,
      category: payload.category || 'campus',
      description: payload.description || payload.content,
      eventDate: payload.eventDate ? new Date(payload.eventDate as string) : undefined,
      images: Array.isArray(payload.images) ? payload.images : payload.image ? [payload.image] : [],
      supportingLinks: payload.links || payload.supportingLinks,
      consent: true,
      status: 'pending',
    });
    return doc;
  },

  async submitCareerApplication(payload: Record<string, unknown>, userId?: string) {
    const doc = await CareerSubmission.create({
      user: userId || undefined,
      opportunityId: payload.opportunityId,
      opportunityTitle: payload.opportunityTitle,
      organization: payload.organization,
      type: payload.type || 'Job',
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      college: payload.college,
      resumeUrl: payload.resumeUrl,
      portfolioUrl: payload.portfolioUrl,
      note: payload.note,
      status: 'pending',
    });
    return doc;
  },

  async getMySubmissions(userId: string, email?: string) {
    const query = email ? { $or: [{ user: userId }, { email: email.toLowerCase() }] } : { user: userId };
    const [stories, campus] = await Promise.all([
      StorySubmission.find(query).sort({ createdAt: -1 }),
      CampusSubmission.find(query).sort({ createdAt: -1 }),
    ]);
    return { stories, campus };
  },

  async moderate(kind: 'story' | 'campus', id: string, status: string, reviewNote?: string, reviewer?: string) {
    const model: Model<any> = kind === 'story' ? StorySubmission : CampusSubmission;
    const doc = await model.findByIdAndUpdate(id, { status, reviewNote, reviewedBy: reviewer }, { new: true });
    if (!doc) throw ApiError.notFound('Submission not found');

    const title = kind === 'story' ? doc.storyTitle : doc.newsTitle;
    let targetUserId = doc.user ? String(doc.user) : undefined;
    if (!targetUserId && doc.email) {
      const u = await User.findOne({ email: doc.email.toLowerCase() });
      if (u) targetUserId = String(u._id);
    }

    // When a story is approved by admin/editor, automatically publish to Story collection if not exists
    if (kind === 'story' && status === 'approved') {
      const baseSlug = slugify(doc.storyTitle || 'story');
      let uniqueSlug = baseSlug;
      let counter = 1;
      while (await Story.findOne({ slug: uniqueSlug })) {
        uniqueSlug = `${baseSlug}-${counter++}`;
      }

      const validCategories: Array<'student' | 'startup' | 'campus'> = ['student', 'startup', 'campus'];
      const rawCategory = (doc.storyCategory || 'student').toLowerCase();
      const storyCat = validCategories.includes(rawCategory as any) ? (rawCategory as 'student' | 'startup' | 'campus') : 'student';

      await Story.create({
        title: doc.storyTitle,
        slug: uniqueSlug,
        dek: doc.storyContent ? doc.storyContent.slice(0, 160).trim() + '…' : 'Student submission on TSC',
        category: storyCat,
        content: doc.storyContent,
        image: doc.images && doc.images.length > 0 ? doc.images[0] : '/images/hero/hero-collab.jpg',
        imageAlt: doc.storyTitle,
        author: doc.user || reviewer,
        readingTime: Math.max(1, Math.ceil((doc.storyContent?.split(' ').length || 100) / 200)),
        status: 'published',
        featured: false,
        submittedBy: doc.name,
      });

      if (targetUserId) {
        await Notification.create({
          user: targetUserId,
          title: `🎉 Article Approved & Published!`,
          body: `Your article "${title}" has been approved by our editorial team and is now live on THE STUDENT CHAPTERS™!`,
          type: 'submission',
          link: `/stories/${uniqueSlug}`,
        });
      }
    } else if (targetUserId) {
      if (status === 'rejected') {
        await Notification.create({
          user: targetUserId,
          title: `Submission Update: ${title}`,
          body: `Your submission "${title}" was not approved. Editorial feedback: ${reviewNote || 'Please review guidelines and resubmit.'}`,
          type: 'submission',
        });
      } else if (status === 'under review') {
        await Notification.create({
          user: targetUserId,
          title: `In Review: ${title}`,
          body: `Your submission "${title}" is currently under review by our editors.`,
          type: 'submission',
        });
      }
    }

    return doc;
  },
};

/** Contact-form inbox. */
export const contactService = {
  async create(payload: Record<string, unknown>, meta?: { ip?: string; ua?: string }) {
    // Honeypot: silently accept but do not store bot submissions.
    if (payload.website) return { ok: true, stored: false };
    const doc = await ContactMessage.create({
      name: payload.name,
      email: payload.email,
      subject: payload.subject,
      message: payload.message,
      ipAddress: meta?.ip,
      userAgent: meta?.ua,
    });
    return { ok: true, stored: true, id: String(doc._id) };
  },
};

/** Event registrations. */
export const eventService = {
  async register(eventId: string, payload: { name: string; email: string; phone?: string }, userId?: string) {
    const event = await Event.findById(eventId);
    if (!event) throw ApiError.notFound('Event not found');
    if (event.status === 'cancelled') throw ApiError.badRequest('This event has been cancelled');
    if (event.registrationDeadline && new Date(event.registrationDeadline) < new Date()) {
      throw ApiError.badRequest('Registration for this event has closed');
    }
    if (event.capacity) {
      const count = await EventRegistration.countDocuments({ event: eventId, status: 'registered' });
      if (count >= event.capacity) throw ApiError.conflict('This event is fully booked');
    }
    const existing = await EventRegistration.findOne({ event: eventId, email: payload.email.toLowerCase() });
    if (existing) throw ApiError.conflict('This email is already registered for this event');
    const reg = await EventRegistration.create({
      event: eventId,
      user: userId,
      name: payload.name,
      email: payload.email.toLowerCase(),
      phone: payload.phone,
    });
    if (userId) {
      await Notification.create({
        user: userId,
        title: `Registered: ${event.title}`,
        body: `You are registered for ${event.title}. See you there!`,
        type: 'event',
        link: `/events/${event.slug}`,
      });
    }
    return reg;
  },
};

/** Saved items (member dashboard). */
export const savedItemService = {
  async toggle(userId: string, itemType: string, itemId: string, title: string, href: string) {
    const existing = await SavedItem.findOne({ user: userId, itemType, itemId });
    if (existing) {
      await existing.deleteOne();
      return { saved: false };
    }
    await SavedItem.create({ user: userId, itemType, itemId, title, href });
    return { saved: true };
  },
  async list(userId: string) {
    return SavedItem.find({ user: userId }).sort({ createdAt: -1 });
  },
};

/** Newsletter subscriptions & database deduplication. */
export const subscriberService = {
  async subscribe(email: string, meta?: { source?: string; ip?: string; ua?: string }) {
    const normalized = (email || '').toLowerCase().trim();
    if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      throw ApiError.badRequest('Please enter a valid email address.');
    }

    const existing = await (await import('../models/Subscriber')).default.findOne({ email: normalized });
    if (existing) {
      if (existing.status === 'active') {
        return {
          alreadySubscribed: true,
          message: 'Already Subscribed',
          subscriber: existing,
        };
      }
      // Re-activate if was previously unsubscribed
      existing.status = 'active';
      existing.subscribedAt = new Date();
      if (meta?.source) existing.source = meta.source;
      if (meta?.ip) existing.ipAddress = meta.ip;
      if (meta?.ua) existing.userAgent = meta.ua;
      await existing.save();
      return {
        alreadySubscribed: false,
        reactivated: true,
        message: 'Subscribed — welcome back to TSC.',
        subscriber: existing,
      };
    }

    const doc = await (await import('../models/Subscriber')).default.create({
      email: normalized,
      status: 'active',
      source: meta?.source || 'website_footer',
      ipAddress: meta?.ip,
      userAgent: meta?.ua,
      subscribedAt: new Date(),
    });

    return {
      alreadySubscribed: false,
      message: 'Subscribed — welcome to TSC.',
      subscriber: doc,
    };
  },
};

