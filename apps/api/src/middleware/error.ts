import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { ApiError } from '../utils/apiError';
import { logger } from '../utils/logger';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

/** Centralised error handling — keeps stack traces out of responses. */
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  let error: ApiError;
  if (err instanceof ApiError) {
    error = err;
  } else if (err instanceof mongoose.Error.ValidationError) {
    error = new ApiError(422, Object.values(err.errors)[0]?.message ?? 'Validation failed', 'VALIDATION_ERROR');
  } else if (err instanceof mongoose.Error.CastError) {
    error = new ApiError(400, `Invalid ${err.path}: ${err.value}`);
  } else if ((err as { code?: number })?.code === 11000) {
    const field = Object.keys((err as { keyValue?: Record<string, unknown> }).keyValue ?? {})[0] ?? 'field';
    error = new ApiError(409, `Duplicate value for ${field}`);
  } else {
    error = new ApiError(500, err instanceof Error ? err.message : 'Internal server error');
  }

  if (error.statusCode >= 500) logger.error(`${req.method} ${req.originalUrl}`, err);

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    code: error.code,
    ...(process.env.NODE_ENV !== 'production' && err instanceof Error && { stack: err.stack?.split('\n').slice(0, 4) }),
  });
}
