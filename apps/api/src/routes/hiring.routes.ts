import { Router, type Request, type Response } from 'express';
import { HiringApplication } from '../models/HiringApplication';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth, requireEditor, requireAdmin, type AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { hiringApplicationSchema } from '../validators';
import { ApiError } from '../utils/apiError';

export const hiringRouter = Router();

/* ── Public: Submit Application (Job or Internship) ──────────────────── */
hiringRouter.post(
  '/api/hiring',
  validate(hiringApplicationSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const application = await HiringApplication.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Your application has been received successfully! Our editorial and recruitment team will review it shortly.',
      data: {
        id: application._id,
        type: application.type,
        fullName: application.fullName,
        email: application.email,
        department: application.department,
        status: application.status,
        createdAt: application.createdAt,
      },
    });
  })
);

/* ── Admin / Editor: List Applications with filtering & search ──────── */
hiringRouter.get(
  '/api/hiring',
  requireAuth,
  requireEditor,
  asyncHandler(async (req: Request, res: Response) => {
    const { type, status, department, q } = req.query as Record<string, string | undefined>;
    const filter: Record<string, unknown> = {};

    if (type && ['Internship', 'Job'].includes(type)) {
      filter.type = type;
    }
    if (status) {
      filter.status = status;
    }
    if (department) {
      filter.department = department;
    }
    if (q) {
      const regex = new RegExp(q.trim(), 'i');
      filter.$or = [
        { fullName: regex },
        { email: regex },
        { collegeOrCompany: regex },
        { location: regex },
        { department: regex },
      ];
    }

    const applications = await HiringApplication.find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .populate('reviewedBy', 'name email');

    res.json({ success: true, count: applications.length, data: applications });
  })
);

/* ── Admin / Editor: Get single application details ──────────────────── */
hiringRouter.get(
  '/api/hiring/:id',
  requireAuth,
  requireEditor,
  asyncHandler(async (req: Request, res: Response) => {
    const application = await HiringApplication.findById(req.params.id).populate('reviewedBy', 'name email');
    if (!application) throw ApiError.notFound('Hiring application not found');
    res.json({ success: true, data: application });
  })
);

/* ── Admin / Editor: Update application status and admin notes ───────── */
hiringRouter.put(
  '/api/hiring/:id/status',
  requireAuth,
  requireEditor,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { status, adminNotes } = req.body as {
      status?: 'pending' | 'reviewed' | 'shortlisted' | 'interviewing' | 'rejected' | 'hired';
      adminNotes?: string;
    };

    const validStatuses = ['pending', 'reviewed', 'shortlisted', 'interviewing', 'rejected', 'hired'];
    if (status && !validStatuses.includes(status)) {
      throw ApiError.badRequest('Invalid status transition');
    }

    const updatePayload: Record<string, unknown> = {
      reviewedBy: req.user!._id,
    };
    if (status) updatePayload.status = status;
    if (adminNotes !== undefined) updatePayload.adminNotes = adminNotes;

    const application = await HiringApplication.findByIdAndUpdate(
      req.params.id,
      updatePayload,
      { new: true }
    ).populate('reviewedBy', 'name email');

    if (!application) throw ApiError.notFound('Hiring application not found');
    res.json({ success: true, message: 'Application status updated successfully', data: application });
  })
);

/* ── Admin Only: Delete Application ──────────────────────────────────── */
hiringRouter.delete(
  '/api/hiring/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const application = await HiringApplication.findByIdAndDelete(req.params.id);
    if (!application) throw ApiError.notFound('Hiring application not found');
    res.json({ success: true, message: 'Application deleted', data: null });
  })
);
