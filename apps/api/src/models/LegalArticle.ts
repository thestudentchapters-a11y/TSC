import mongoose, { Schema, type Model } from 'mongoose';

export interface ILegalArticle {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  topic: 'Student Rights' | 'Cyber Safety' | 'Digital Rights' | 'Education Laws';
  summary: string;
  content: string;
  keyPoints: string[];
  readingTime: number;
  author?: mongoose.Types.ObjectId | string;
  status: 'draft' | 'published' | 'archived';
  disclaimerAccepted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LegalArticleSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    topic: {
      type: String,
      enum: ['Student Rights', 'Cyber Safety', 'Digital Rights', 'Education Laws'],
      required: true,
      index: true,
    },
    summary: { type: String, required: true },
    content: { type: String, required: true },
    keyPoints: [{ type: String }],
    readingTime: { type: Number, default: 4 },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft', index: true },
    disclaimerAccepted: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const LegalArticle: Model<ILegalArticle> =
  mongoose.models.LegalArticle ?? mongoose.model<ILegalArticle>('LegalArticle', LegalArticleSchema);
export default LegalArticle;
