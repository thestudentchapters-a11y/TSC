import mongoose, { Schema, type Model } from 'mongoose';

export interface IArticle {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: mongoose.Types.ObjectId | string;
  tags: mongoose.Types.ObjectId[] | string[];
  author: mongoose.Types.ObjectId | string;
  featuredImage: string;
  gallery: string[];
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  publishAt: Date;
  readingTime: number;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ArticleSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', index: true },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    author: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    featuredImage: { type: String },
    gallery: [{ type: String }],
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft', index: true },
    featured: { type: Boolean, default: false, index: true },
    publishAt: { type: Date },
    readingTime: { type: Number, default: 3 },
    seoTitle: { type: String },
    seoDescription: { type: String },
  },
  { timestamps: true }
);

ArticleSchema.index({ title: 'text', excerpt: 'text' });

const Article: Model<IArticle> =
  mongoose.models.Article ?? mongoose.model<IArticle>('Article', ArticleSchema);
export default Article;
