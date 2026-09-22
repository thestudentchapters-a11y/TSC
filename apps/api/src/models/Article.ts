import mongoose, { Schema, type Model } from 'mongoose';

export interface IArticle {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category?: mongoose.Types.ObjectId | string;
  tags?: mongoose.Types.ObjectId[] | string[];
  author?: mongoose.Types.ObjectId | string;
  campus?: string;
  date?: string;
  image?: string;
  featuredImage?: string;
  gallery?: string[];
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  publishAt?: Date;
  readingTime?: number;
  seoTitle?: string;
  seoDescription?: string;
  submittedBy?: string;
  submissionId?: mongoose.Types.ObjectId | string;
  createdBy?: mongoose.Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const ArticleSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: { type: String, default: '' },
    content: { type: Schema.Types.Mixed, default: '' },
    category: { type: Schema.Types.Mixed, index: true },
    tags: [{ type: Schema.Types.Mixed }],
    author: { type: Schema.Types.Mixed, default: 'TSC Editorial Team', index: true },
    campus: { type: String },
    date: { type: String },
    image: { type: String },
    featuredImage: { type: String },
    gallery: [{ type: String }],
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft', index: true },
    featured: { type: Boolean, default: false, index: true },
    publishAt: { type: Date },
    readingTime: { type: Number, default: 3 },
    seoTitle: { type: String },
    seoDescription: { type: String },
    submittedBy: { type: String },
    submissionId: { type: Schema.Types.Mixed },
    createdBy: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

ArticleSchema.index({ title: 'text', excerpt: 'text' });

const Article: Model<IArticle> =
  mongoose.models.Article ?? mongoose.model<IArticle>('Article', ArticleSchema);
export default Article;
