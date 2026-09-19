import mongoose, { Schema, type Model } from 'mongoose';

export interface IPodcastEpisode {
  _id: mongoose.Types.ObjectId;
  show?: mongoose.Types.ObjectId | string;
  episodeNumber?: number;
  title: string;
  slug: string;
  description?: string;
  guest?: string;
  guestRole?: string;
  category?: 'Student Voices' | 'Founder Stories' | 'Career Conversations' | 'Ideas & Perspectives' | string;
  durationSeconds?: number;
  durationLabel?: string;
  date?: string;
  audioUrl?: string;
  videoUrl?: string;
  youtubeUrl?: string;
  image?: string;
  platforms?: { youtube?: string; spotify?: string; apple?: string };
  transcript?: string;
  thumbnail?: string;
  publishedAt?: Date;
  status?: 'draft' | 'published' | 'archived';
  featured?: boolean;
  createdBy?: mongoose.Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const PodcastEpisodeSchema = new Schema(
  {
    show: { type: Schema.Types.Mixed, index: true },
    episodeNumber: { type: Number, default: 1 },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: '' },
    guest: { type: String },
    guestRole: { type: String },
    category: {
      type: String,
      default: 'Student Voices',
      index: true,
    },
    durationSeconds: { type: Number, default: 0 },
    durationLabel: { type: String },
    date: { type: String },
    audioUrl: { type: String },
    videoUrl: { type: String },
    youtubeUrl: { type: String },
    image: { type: String },
    platforms: { youtube: String, spotify: String, apple: String },
    transcript: { type: String },
    thumbnail: { type: String },
    publishedAt: { type: Date },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft', index: true },
    featured: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

const PodcastEpisode: Model<IPodcastEpisode> =
  mongoose.models.PodcastEpisode ?? mongoose.model<IPodcastEpisode>('PodcastEpisode', PodcastEpisodeSchema);
export default PodcastEpisode;
