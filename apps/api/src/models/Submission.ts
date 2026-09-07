import mongoose, { Schema, type Model } from 'mongoose';

/* ── StorySubmission: community submissions → admin review queue ─────────── */
export interface IStorySubmission {
  _id: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId | string;
  name: string;
  email: string;
  phone?: string;
  college?: string;
  city: string;
  state: string;
  storyTitle: string;
  storyCategory: string;
  storyContent: string;
  images: string[];
  videoUrl?: string;
  socialLinks?: string;
  consent: boolean;
  status: 'pending' | 'under review' | 'approved' | 'rejected';
  reviewedBy?: mongoose.Types.ObjectId | string;
  reviewNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StorySubmissionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String },
    college: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    storyTitle: { type: String, required: true },
    storyCategory: { type: String, required: true },
    storyContent: { type: String, required: true },
    images: [{ type: String }],
    videoUrl: { type: String },
    socialLinks: { type: String },
    consent: { type: Boolean, default: false },
    status: { type: String, enum: ['pending', 'under review', 'approved', 'rejected'], default: 'pending', index: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewNote: { type: String },
  },
  { timestamps: true }
);

export const StorySubmission: Model<IStorySubmission> =
  (mongoose.models.StorySubmission as Model<IStorySubmission>) ??
  mongoose.model<IStorySubmission>('StorySubmission', StorySubmissionSchema);

/* ── CampusSubmission ──────────────────────────────────────────────────────── */
export interface ICampusSubmission {
  _id: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId | string;
  name: string;
  email: string;
  college: string;
  campus: string;
  city: string;
  state: string;
  newsTitle: string;
  category: string;
  description: string;
  eventDate?: Date;
  images: string[];
  supportingLinks?: string;
  consent: boolean;
  status: 'pending' | 'under review' | 'approved' | 'rejected';
  reviewedBy?: mongoose.Types.ObjectId | string;
  reviewNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CampusSubmissionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    college: { type: String },
    campus: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    newsTitle: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    eventDate: { type: Date },
    images: [{ type: String }],
    supportingLinks: { type: String },
    consent: { type: Boolean, default: false },
    status: { type: String, enum: ['pending', 'under review', 'approved', 'rejected'], default: 'pending', index: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewNote: { type: String },
  },
  { timestamps: true }
);

export const CampusSubmission: Model<ICampusSubmission> =
  (mongoose.models.CampusSubmission as Model<ICampusSubmission>) ??
  mongoose.model<ICampusSubmission>('CampusSubmission', CampusSubmissionSchema);
