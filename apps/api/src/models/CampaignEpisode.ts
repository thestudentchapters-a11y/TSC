import mongoose, { Schema, type Model } from 'mongoose';

export interface ICampaignEpisode {
  _id: mongoose.Types.ObjectId;
  campaign: mongoose.Types.ObjectId | string;
  episodeNumber: number;
  title: string;
  slug: string;
  professional: string;
  profession: string;
  location: string;
  description: string;
  videoUrl?: string;
  image: string;
  imageAlt: string;
  durationLabel: string;
  status: 'Released' | 'Coming Soon';
  createdAt: Date;
  updatedAt: Date;
}

const CampaignEpisodeSchema = new Schema(
  {
    campaign: { type: Schema.Types.ObjectId, ref: 'Campaign', required: false, index: true },
    episodeNumber: { type: Number, required: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    professional: { type: String },
    profession: { type: String },
    location: { type: String },
    description: { type: String },
    videoUrl: { type: String },
    image: { type: String },
    imageAlt: { type: String },
    durationLabel: { type: String },
    status: { type: String, enum: ['Released', 'Coming Soon'], default: 'Coming Soon' },
  },
  { timestamps: true }
);

const CampaignEpisode: Model<ICampaignEpisode> =
  mongoose.models.CampaignEpisode ?? mongoose.model<ICampaignEpisode>('CampaignEpisode', CampaignEpisodeSchema);
export default CampaignEpisode;
