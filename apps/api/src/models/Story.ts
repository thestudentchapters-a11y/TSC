import mongoose, { Schema, type Model } from 'mongoose';

export interface IStory {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  dek?: string;
  category: 'student' | 'startup' | 'campus' | string;
  content: string;
  image?: string;
  imageAlt?: string;
  author?: mongoose.Types.ObjectId | string;
  campus?: mongoose.Types.ObjectId | string;
  date?: string;
  quote?: { text: string; person: string };
  readingTime?: number;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  submittedBy?: string;
  createdBy?: mongoose.Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const StorySchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    dek: { type: String, default: '' },
    category: { type: String, default: 'student', index: true },
    content: { type: Schema.Types.Mixed, default: '' },
    image: { type: String },
    imageAlt: { type: String },
    author: { type: Schema.Types.Mixed },
    campus: { type: Schema.Types.Mixed },
    date: { type: String },
    quote: { text: String, person: String },
    readingTime: { type: Number, default: 4 },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft', index: true },
    featured: { type: Boolean, default: false },
    submittedBy: { type: String },
    createdBy: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

StorySchema.index({ title: 'text', dek: 'text' });

const Story: Model<IStory> = mongoose.models.Story ?? mongoose.model<IStory>('Story', StorySchema);
export default Story;
