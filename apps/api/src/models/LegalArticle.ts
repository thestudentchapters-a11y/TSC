import mongoose, { Schema, type Model } from 'mongoose';

export interface ILegalArticle {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  topic?: 'Student Rights' | 'Cyber Safety' | 'Digital Rights' | 'Education Laws' | string;
  summary?: string;
  content: string;
  keyPoints?: string[];
  readingTime?: number;
  author?: mongoose.Types.ObjectId | string;
  date?: string;
  status: 'draft' | 'published' | 'archived';
  disclaimerAccepted?: boolean;
  createdBy?: mongoose.Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const LegalArticleSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    topic: {
      type: String,
      default: 'Student Rights',
      index: true,
    },
    summary: { type: String, default: '' },
    content: { type: String, required: true },
    keyPoints: [{ type: String }],
    readingTime: { type: Number, default: 4 },
    author: { type: Schema.Types.Mixed },
    date: { type: String },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft', index: true },
    disclaimerAccepted: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

const LegalArticle: Model<ILegalArticle> =
  mongoose.models.LegalArticle ?? mongoose.model<ILegalArticle>('LegalArticle', LegalArticleSchema);
export default LegalArticle;
