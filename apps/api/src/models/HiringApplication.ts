import mongoose, { Schema, type Document, type Model } from 'mongoose';

export type HiringType = 'Internship' | 'Job';
export type HiringStatus = 'pending' | 'reviewed' | 'shortlisted' | 'interviewing' | 'rejected' | 'hired';

export interface IHiringApplication extends Document {
  type: HiringType;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  department: string;
  experienceLevel: string;
  collegeOrCompany: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  resumeUrl: string;
  coverLetter: string;
  availability: string;
  status: HiringStatus;
  adminNotes?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const hiringApplicationSchema = new Schema<IHiringApplication>(
  {
    type: { type: String, enum: ['Internship', 'Job'], required: true, index: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    phone: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true, index: true },
    experienceLevel: { type: String, required: true, trim: true },
    collegeOrCompany: { type: String, required: true, trim: true },
    linkedinUrl: { type: String, trim: true },
    portfolioUrl: { type: String, trim: true },
    resumeUrl: { type: String, required: true, trim: true },
    coverLetter: { type: String, required: true },
    availability: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'shortlisted', 'interviewing', 'rejected', 'hired'],
      default: 'pending',
      index: true,
    },
    adminNotes: { type: String, trim: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const HiringApplication: Model<IHiringApplication> =
  mongoose.models.HiringApplication ||
  mongoose.model<IHiringApplication>('HiringApplication', hiringApplicationSchema);

export default HiringApplication;
