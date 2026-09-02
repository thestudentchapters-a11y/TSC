import mongoose, { Schema, type Model } from 'mongoose';

export interface ICurrentAffairsEdition {
  _id: mongoose.Types.ObjectId;
  month: string;
  year: number;
  title: string;
  slug: string;
  intro: string;
  cover: string;
  coverAlt: string;
  topics: Array<'India' | 'World' | 'Economy' | 'Science & Technology' | 'Education'>;
  articles: Array<{ title: string; category: string; summary: string; readingTime: number }>;
  pdfUrl?: string;
  author?: mongoose.Types.ObjectId | string;
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const EditionSchema = new Schema(
  {
    month: { type: String, required: true },
    year: { type: Number, required: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    intro: { type: String },
    cover: { type: String },
    coverAlt: { type: String },
    topics: [{ type: String }],
    articles: [
      {
        title: String,
        category: String,
        summary: String,
        readingTime: { type: Number, default: 4 },
      },
    ],
    pdfUrl: { type: String },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft', index: true },
  },
  { timestamps: true }
);

const CurrentAffairsEdition: Model<ICurrentAffairsEdition> =
  mongoose.models.CurrentAffairsEdition ??
  mongoose.model<ICurrentAffairsEdition>('CurrentAffairsEdition', EditionSchema);
export default CurrentAffairsEdition;
