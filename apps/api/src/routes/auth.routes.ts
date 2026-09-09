import { Router } from 'express';
import { loginSchema, registerSchema, updateMeSchema } from '../validators';
import { validate } from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimit';
import { requireAuth, type AuthRequest } from '../middleware/auth';
import { login, logout, me, refresh, register, updateMe, changeCredentials, resendVerification, verifyEmail } from '../controllers/auth.controller';
import { asyncHandler } from '../utils/asyncHandler';

export const authRouter = Router();

authRouter.post('/api/auth/register', authLimiter, validate(registerSchema), register);
authRouter.post('/api/auth/login', authLimiter, validate(loginSchema), login);
authRouter.post('/api/auth/resend-verification', authLimiter, resendVerification);
authRouter.get('/api/auth/verify-email', verifyEmail);
authRouter.post('/api/auth/verify-email', verifyEmail);
authRouter.post('/api/auth/refresh', asyncHandler(refresh));
authRouter.post('/api/auth/logout', requireAuth, logout);
authRouter.get('/api/users/me', requireAuth, me);
authRouter.put('/api/users/me', requireAuth, validate(updateMeSchema), updateMe);
authRouter.post('/api/auth/change-credentials', requireAuth, changeCredentials);
