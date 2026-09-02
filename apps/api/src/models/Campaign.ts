import mongoose, { Schema, type Model } from 'mongoose';

export interface ICampaign {
  _id: mongoose.Types.ObjectId;
  eyebrow: string;
  title: string;
  slug: string;
  headline: string;
  description: string;
  stills: Array<{ image: string; alt: string }>;
  categories: string[];
  locations: string[];
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  createdBy?: mongoose.Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema = new Schema(
  {
    eyebrow: { type: String, default: 'TSC ORIGINAL CAMPAIGN' },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    headline: { type: String },
    description: { type: String },
    stills: [{ image: String, alt: String }],
    categories: [{ type: String }],
    locations: [{ type: String }],
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft', index: true },
    featured: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const Campaign: Model<ICampaign> =
  mongoose.models.Campaign ?? mongoose.model<ICampaign>('Campaign', CampaignSchema);
export default Campaign;
