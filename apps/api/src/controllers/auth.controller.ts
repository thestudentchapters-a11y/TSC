import type { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { asyncHandler } from '../utils/asyncHandler';
import type { AuthRequest } from '../middleware/auth';
import { ApiError } from '../utils/apiError';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { user, tokens } = await authService.register(req.body);
  res.status(201).json({ success: true, data: { user, token: tokens.token, refreshToken: tokens.refreshToken } });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { user, tokens } = await authService.login(email, password);
  res.json({ success: true, data: { user, token: tokens.token, refreshToken: tokens.refreshToken } });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = (req.body?.refreshToken as string) ?? (req.cookies?.refreshToken as string);
  if (!refreshToken) throw ApiError.unauthorized('Refresh token required');
  const tokens = await authService.refresh(refreshToken);
  res.json({ success: true, data: tokens });
});

export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  const refreshToken = (req.body?.refreshToken as string) ?? (req.cookies?.refreshToken as string);
  if (req.user) await authService.logout(String(req.user._id), refreshToken);
  res.clearCookie('token');
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Signed out' });
});

export const me = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await authService.me(String(req.user!._id));
  res.json({ success: true, data });
});

export const updateMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  Object.assign(user, req.body);
  await user.save();
  const data = await authService.me(String(user._id));
  res.json({ success: true, data });
});
