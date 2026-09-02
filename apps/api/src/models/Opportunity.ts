import mongoose, { Schema, type Model } from 'mongoose';

export interface IOpportunity {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  organization: string;
  organizationLogo?: string;
  type: 'Job' | 'Internship' | 'Fellowship' | 'Scholarship' | 'Career Awareness';
  mode: 'Remote' | 'Hybrid' | 'On-site';
  location: string;
  eligibility: string;
  deadline: Date;
  description: string;
  skills: string[];
  stipend?: string;
  applicationUrl?: string;
  status: 'active' | 'expired' | 'archived';
  featured: boolean;
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
      enum: ['Job', 'Internship', 'Fellowship', 'Scholarship', 'Career Awareness'],
      required: true,
      index: true,
    },
    mode: { type: String, enum: ['Remote', 'Hybrid', 'On-site'], default: 'On-site', index: true },
    location: { type: String, index: true },
    eligibility: { type: String },
    deadline: { type: Date, required: true, index: true },
    description: { type: String, required: true },
    skills: [{ type: String }],
    stipend: { type: String },
    applicationUrl: { type: String },
    status: { type: String, enum: ['active', 'expired', 'archived'], default: 'active', index: true },
    featured: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const Opportunity: Model<IOpportunity> =
  mongoose.models.Opportunity ?? mongoose.model<IOpportunity>('Opportunity', OpportunitySchema);
export default Opportunity;
