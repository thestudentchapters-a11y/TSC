import { CampusSubmission, StorySubmission } from '../models/Submission';
import type { Model } from 'mongoose';
import ContactMessage from '../models/ContactMessage';
import EventRegistration from '../models/EventRegistration';
import Event from '../models/Event';
import Notification from '../models/Notification';
import SavedItem from '../models/SavedItem';
import { ApiError } from '../utils/apiError';

/** Community submissions (story / campus news) + review workflow. */
export const submissionService = {
  async submitStory(payload: Record<string, unknown>) {
    const doc = await StorySubmission.create({
      name: payload.name,
      email: payload.email,
      phone: payload.phone || undefined,
      college: payload.college,
      city: payload.city,
      state: payload.state,
      storyTitle: payload.title,
      storyCategory: payload.category,
      storyContent: payload.content,
      videoUrl: payload.videoUrl || undefined,
      socialLinks: payload.social,
      consent: true,
      status: 'pending',
    });
    return doc;
  },

  async submitCampusNews(payload: Record<string, unknown>) {
    const doc = await CampusSubmission.create({
      name: payload.name,
      email: payload.email,
      college: payload.college,
      campus: payload.campus,
      city: payload.city,
      state: payload.state,
      newsTitle: payload.title,
      category: payload.category,
      description: payload.description,
      eventDate: payload.eventDate ? new Date(payload.eventDate as string) : undefined,
      supportingLinks: payload.links,
      consent: true,
      status: 'pending',
    });
    return doc;
  },

  async moderate(kind: 'story' | 'campus', id: string, status: string, reviewNote?: string, reviewer?: string) {
    const model: Model<any> = kind === 'story' ? StorySubmission : CampusSubmission;
    const doc = await model.findByIdAndUpdate(id, { status, reviewNote, reviewedBy: reviewer }, { new: true });
    if (!doc) throw ApiError.notFound('Submission not found');
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
