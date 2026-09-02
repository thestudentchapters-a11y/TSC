import type { Request, Response } from 'express';
import type { Model } from 'mongoose';
import { createContentService } from '../services/content.service';
import { ApiError } from '../utils/apiError';
import type { AuthRequest } from '../middleware/auth';

/** Wire a controller factory to any model for CRUD endpoints. */
export function createContentController<T>(model: Model<T>, filterKeys?: string[]) {
  const service = createContentService(model, filterKeys);
  return {
    list: async (req: Request, res: Response) => {
      const result = await service.list(req.query as Record<string, unknown>);
      res.json({ success: true, ...result });
    },
    getBySlug: async (req: Request, res: Response) => {
      const doc = await service.getBySlug(req.params.slug);
      res.json({ success: true, data: doc });
    },
    getById: async (req: Request, res: Response) => {
      const doc = await service.getById(req.params.id);
      res.json({ success: true, data: doc });
    },
    create: async (req: AuthRequest, res: Response) => {
      if (!req.user) throw ApiError.unauthorized();
      const doc = await service.create({ ...req.body, createdBy: req.user._id, author: req.body.author ?? req.user._id });
      res.status(201).json({ success: true, data: doc });
    },
    update: async (req: Request, res: Response) => {
      const doc = await service.update(req.params.id, req.body);
      res.json({ success: true, data: doc });
    },
    remove: async (req: Request, res: Response) => {
      await service.remove(req.params.id);
      res.json({ success: true, data: null });
    },
  };
}
