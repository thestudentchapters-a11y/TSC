import mongoose, { Schema, type Model } from 'mongoose';

/** A podcast show (e.g. "TSC Podcast"). Episodes live in PodcastEpisode. */
export interface IPodcast {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  platforms: { youtube?: string; spotify?: string; apple?: string };
  host: mongoose.Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const PodcastSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    coverImage: { type: String },
    platforms: { youtube: String, spotify: String, apple: String },
    host: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const Podcast: Model<IPodcast> = mongoose.models.Podcast ?? mongoose.model<IPodcast>('Podcast', PodcastSchema);
export default Podcast;
