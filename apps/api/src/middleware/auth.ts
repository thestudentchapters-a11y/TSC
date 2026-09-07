import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { type IUser } from '../models/User';
import { env } from '../config/env';
import { ApiError } from '../utils/apiError';
import { asyncHandler } from '../utils/asyncHandler';

export interface AuthRequest extends Request {
  user?: IUser;
}

export interface JwtPayload {
  sub: string;
  role: string;
}

/** Verify the bearer access token and attach the user. */
export const requireAuth = asyncHandler(async (req: AuthRequest, _res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : (req.cookies?.token as string | undefined);
  if (!token) throw ApiError.unauthorized('Authentication required');

  let payload: JwtPayload;
  try {
    payload = jwt.verify(token, env.jwtSecret) as JwtPayload;
  } catch {
    throw ApiError.unauthorized('Invalid or expired token');
  }

  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) throw ApiError.unauthorized('Account not found or deactivated');
  req.user = user;
  next();
});

/** Role-based authorization. */
const ROLE_LEVEL: Record<string, number> = { member: 1, editor: 2, admin: 3 };

export const requireRole = (...roles: Array<'member' | 'editor' | 'admin'>) =>
  asyncHandler(async (req: AuthRequest, _res, next) => {
    if (!req.user) throw ApiError.unauthorized('Authentication required');
    if ((ROLE_LEVEL[req.user.role] ?? 0) < Math.min(...roles.map((r) => ROLE_LEVEL[r]))) {
      throw ApiError.forbidden('You do not have permission to perform this action');
    }
    next();
  });

export const requireEditor = requireRole('editor');
export const requireAdmin = requireRole('admin');

/** Require editor/admin role OR a specific granular permission granted to the member. */
export const requirePermissionOrEditor = (permission: string) =>
  asyncHandler(async (req: AuthRequest, _res, next) => {
    if (!req.user) throw ApiError.unauthorized('Authentication required');
    if (req.user.role === 'admin' || req.user.role === 'editor') {
      return next();
    }
    const perms = (req.user as any).customPermissions as string[] | undefined;
    if (perms && Array.isArray(perms) && perms.includes(permission)) {
      return next();
    }
    throw ApiError.forbidden(`You do not have the "${permission}" permission to perform this action`);
  });

/** Optional auth — attaches user if a valid token exists, never blocks. */
export const optionalAuth = asyncHandler(async (req: AuthRequest, _res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (token) {
    try {
      const payload = jwt.verify(token, env.jwtSecret) as JwtPayload;
      const user = await User.findById(payload.sub);
      if (user && user.isActive) req.user = user;
    } catch {
      /* ignore — optional */
    }
  }
  next();
});
