import mongoose, { Schema, type Model } from 'mongoose';

export interface IOpportunity {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  organization: string;
  organizationLogo?: string;
  type: 'Job' | 'Internship' | 'Fellowship' | 'Scholarship' | 'Career Awareness' | string;
  mode?: 'Remote' | 'Hybrid' | 'On-site' | string;
  location?: string;
  eligibility?: string;
  deadline: Date | string;
  description: string;
  skills?: string[];
  stipend?: string;
  applicationUrl?: string;
  status?: 'active' | 'expired' | 'archived' | 'published' | 'draft';
  featured?: boolean;
  active?: boolean;
  createdBy?: mongoose.Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const OpportunitySchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    organization: { type: String, required: true },
    organizationLogo: { type: String },
    type: {
      type: String,
      required: true,
      index: true,
    },
    mode: { type: String, default: 'On-site', index: true },
    location: { type: String, index: true },
    eligibility: { type: String },
    deadline: { type: Schema.Types.Mixed, default: () => new Date(Date.now() + 30 * 24 * 3600 * 1000), index: true },
    description: { type: String, default: '' },
    skills: [{ type: String }],
    stipend: { type: String },
    applicationUrl: { type: String },
    status: { type: String, enum: ['active', 'expired', 'archived', 'published', 'draft'], default: 'active', index: true },
    featured: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

const Opportunity: Model<IOpportunity> =
  mongoose.models.Opportunity ?? mongoose.model<IOpportunity>('Opportunity', OpportunitySchema);
export default Opportunity;
