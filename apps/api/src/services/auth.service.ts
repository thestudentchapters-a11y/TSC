import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User, { type IUser } from '../models/User';
import Membership from '../models/Membership';
import Notification from '../models/Notification';
import { env } from '../config/env';
import { ApiError } from '../utils/apiError';
import { emailService } from './email.service';

interface Tokens { token: string; refreshToken: string }

function signTokens(user: IUser): Tokens {
  const token = jwt.sign({ sub: String(user._id), role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpires as never,
  });
  const refreshToken = jwt.sign({ sub: String(user._id), type: 'refresh' }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpires as never,
  });
  return { token, refreshToken };
}

async function issueMembership(userId: unknown) {
  const memberCode = `TSC-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  await Membership.create({ user: userId, memberCode, status: 'active' });
  await Notification.create({
    user: userId,
    title: 'Welcome to THE STUDENT CHAPTERS™',
    body: 'Your chapter starts here. Explore stories, opportunities and events.',
    type: 'info',
  });
  return memberCode;
}

export const authService = {
  async register(payload: {
    name: string; email: string; password: string; phone?: string; college?: string;
    city?: string; state?: string; interests?: string; skills?: string;
  }): Promise<{ user: ReturnType<typeof toPublicUser>; tokens: Tokens }> {
    const exists = await User.findOne({ email: payload.email.toLowerCase() });
    if (exists) throw ApiError.conflict('An account with this email already exists');

    const verifyToken = crypto.randomBytes(32).toString('hex');
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await User.create({
      name: payload.name,
      email: payload.email.toLowerCase(),
      passwordHash: payload.password,
      phone: payload.phone || undefined,
      college: payload.college,
      city: payload.city,
      state: payload.state,
      interests: payload.interests?.split(',').map((s) => s.trim()).filter(Boolean),
      skills: payload.skills?.split(',').map((s) => s.trim()).filter(Boolean),
      role: 'member',
      isEmailVerified: false,
      emailVerificationToken: verifyToken,
      emailVerificationCode: verifyCode,
      emailVerificationExpires: verifyExpiry,
    });
    await issueMembership(user._id);
    const tokens = signTokens(user);
    user.refreshTokens = [tokens.refreshToken];
    await user.save();

    // Send verification email in background
    emailService
      .sendAccountVerification(user.email, user.name, verifyToken, verifyCode)
      .catch((e) => console.error('[Verification Email Error]:', e));

    return { user: toPublicUser(user), tokens };
  },

  async resendVerification(email: string) {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) throw ApiError.badRequest('Email address is required.');

    const user = await User.findOne({ email: cleanEmail }).select('+emailVerificationToken +emailVerificationCode +emailVerificationExpires');
    if (!user) {
      // Return success to avoid email enumeration
      return { success: true, message: 'If an account exists, a verification email has been sent.' };
    }

    if (user.isEmailVerified) {
      return { success: true, message: 'This account email is already verified.' };
    }

    const verifyToken = crypto.randomBytes(32).toString('hex');
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.emailVerificationToken = verifyToken;
    user.emailVerificationCode = verifyCode;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    await emailService.sendAccountVerification(user.email, user.name, verifyToken, verifyCode);

    return { success: true, message: 'Verification email sent successfully. Please check your inbox.' };
  },

  async verifyEmail(token?: string, code?: string) {
    if (!token && !code) {
      throw ApiError.badRequest('Verification token or code is required.');
    }

    const query: Record<string, any> = {
      emailVerificationExpires: { $gt: new Date() },
    };

    if (token) query.emailVerificationToken = token;
    else if (code) query.emailVerificationCode = code;

    const user = await User.findOne(query).select('+emailVerificationToken +emailVerificationCode +emailVerificationExpires');
    if (!user) {
      throw ApiError.badRequest('Invalid or expired verification link/code. Please request a new one.');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return { success: true, message: 'Email address verified successfully!', user: toPublicUser(user) };
  },

  async login(email: string, password: string): Promise<{ user: ReturnType<typeof toPublicUser>; tokens: Tokens }> {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash +refreshTokens');
    if (!user || !(await user.comparePassword(password))) {
      throw ApiError.unauthorized('Incorrect email or password');
    }
    if (!user.isActive) throw ApiError.forbidden('This account has been deactivated');
    const tokens = signTokens(user);
    user.refreshTokens = [...(user.refreshTokens ?? []).slice(-4), tokens.refreshToken];
    await user.save();
    return { user: toPublicUser(user), tokens };
  },

  async refresh(refreshToken: string): Promise<Tokens> {
    let payload: { sub: string; type?: string };
    try {
      payload = jwt.verify(refreshToken, env.jwtRefreshSecret) as { sub: string; type?: string };
    } catch {
      throw ApiError.unauthorized('Invalid refresh token');
    }
    if (payload.type !== 'refresh') throw ApiError.unauthorized('Invalid refresh token');
    const user = await User.findById(payload.sub).select('+refreshTokens');
    if (!user || !(user.refreshTokens ?? []).includes(refreshToken)) {
      throw ApiError.unauthorized('Refresh token no longer valid');
    }
    const tokens = signTokens(user);
    user.refreshTokens = [...(user.refreshTokens ?? []).filter((t) => t !== refreshToken), tokens.refreshToken];
    await user.save();
    return tokens;
  },

  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (!refreshToken) return;
    const user = await User.findById(userId).select('+refreshTokens');
    if (!user) return;
    user.refreshTokens = (user.refreshTokens ?? []).filter((t) => t !== refreshToken);
    await user.save();
  },

  async me(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound('User not found');
    const membership = await Membership.findOne({ user: userId }).sort({ createdAt: -1 });
    return { user: toPublicUser(user), membership };
  },

  async changeCredentials(
    userId: string,
    payload: { currentPassword?: string; newEmail?: string; newPassword?: string; name?: string }
  ) {
    const user = await User.findById(userId).select('+passwordHash');
    if (!user) throw ApiError.notFound('User not found');

    if (payload.currentPassword) {
      const isMatch = await user.comparePassword(payload.currentPassword);
      if (!isMatch) throw ApiError.badRequest('Current password does not match');
    }

    if (payload.newEmail && payload.newEmail.trim().toLowerCase() !== user.email) {
      const cleanEmail = payload.newEmail.trim().toLowerCase();
      const exists = await User.findOne({ email: cleanEmail, _id: { $ne: user._id } });
      if (exists) throw ApiError.conflict('An account with this email already exists');
      user.email = cleanEmail;
      user.isEmailVerified = false;
    }

    if (payload.newPassword) {
      if (payload.newPassword.length < 6) {
        throw ApiError.badRequest('New password must be at least 6 characters long');
      }
      user.passwordHash = payload.newPassword;
    }

    if (payload.name && payload.name.trim()) {
      user.name = payload.name.trim();
    }

    await user.save();
    return toPublicUser(user);
  },
};

function toPublicUser(user: IUser) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    isEmailVerified: !!user.isEmailVerified,
    college: user.college,
    city: user.city,
    state: user.state,
    avatarUrl: user.avatarUrl,
  };
}

