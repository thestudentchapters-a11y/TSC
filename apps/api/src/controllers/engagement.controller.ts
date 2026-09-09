import type { Request, Response } from 'express';
import { contactService, eventService, savedItemService, submissionService, subscriberService } from '../services/engagement.service';
import { asyncHandler } from '../utils/asyncHandler';
import type { AuthRequest } from '../middleware/auth';

export const submitStory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const doc = await submissionService.submitStory(req.body, req.user ? String(req.user._id) : undefined);
  res.status(201).json({
    success: true,
    message: 'Story / Article submitted — our editors will review it soon.',
    data: { id: String(doc._id), status: doc.status },
  });
});

export const submitCampusNews = asyncHandler(async (req: AuthRequest, res: Response) => {
  const doc = await submissionService.submitCampusNews(req.body, req.user ? String(req.user._id) : undefined);
  res.status(201).json({
    success: true,
    message: 'Campus news submitted — it is now in the review queue.',
    data: { id: String(doc._id), status: doc.status },
  });
});

export const submitCareerApply = asyncHandler(async (req: AuthRequest, res: Response) => {
  const doc = await submissionService.submitCareerApplication(req.body, req.user ? String(req.user._id) : undefined);
  res.status(201).json({
    success: true,
    message: 'Application submitted successfully — the recruiting team will review it.',
    data: { id: String(doc._id), status: doc.status },
  });
});

export const getMySubmissions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await submissionService.getMySubmissions(String(req.user!._id), req.user?.email);
  res.json({ success: true, data });
});

export const contact = asyncHandler(async (req: Request, res: Response) => {
  const result = await contactService.create(req.body, {
    ip: req.ip,
    ua: req.headers['user-agent'],
  });
  res.status(201).json({ success: true, message: 'Message sent — the TSC team will reply soon.', data: result });
});

export const subscribeNewsletter = asyncHandler(async (req: Request, res: Response) => {
  if (req.body.honey || req.body.website) {
    return res.status(200).json({ success: true, message: 'Subscribed — welcome to TSC.' });
  }
  const result = await subscriberService.subscribe(req.body.email, {
    source: req.body.source || 'website_footer',
    ip: req.ip,
    ua: req.headers['user-agent'] as string,
  });

  if (result.alreadySubscribed) {
    return res.status(409).json({
      success: false,
      alreadySubscribed: true,
      message: 'Already Subscribed',
    });
  }

  res.status(201).json({
    success: true,
    message: result.message,
    data: result.subscriber,
  });
});

export const registerForEvent = asyncHandler(async (req: AuthRequest, res: Response) => {
  const reg = await eventService.register(req.params.id, req.body, req.user ? String(req.user._id) : undefined);
  res.status(201).json({ success: true, message: 'Registration confirmed.', data: { id: String(reg._id) } });
});

export const toggleSaved = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { itemType, itemId, title, href } = req.body;
  const result = await savedItemService.toggle(String(req.user!._id), itemType, itemId, title, href);
  res.json({ success: true, data: result });
});

export const listSaved = asyncHandler(async (req: AuthRequest, res: Response) => {
  const items = await savedItemService.list(String(req.user!._id));
  res.json({ success: true, data: items });
});

