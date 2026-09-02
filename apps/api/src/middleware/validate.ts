import type { NextFunction, Request, Response } from 'express';
import { ZodError, type ZodSchema } from 'zod';
import { ApiError } from '../utils/apiError';

/** Validate req.body against a zod schema; replaces body with parsed data. */
export const validate = (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const details = err.errors.map((e) => ({ field: e.path.join('.'), message: e.message }));
      next(new ApiError(422, details[0]?.message ?? 'Validation failed', 'VALIDATION_ERROR'));
      return;
    }
    next(err);
  }
};
