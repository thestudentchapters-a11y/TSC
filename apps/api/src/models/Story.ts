import mongoose, { Schema, type Model } from 'mongoose';

export interface IStory {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  dek: string;
  category: 'student' | 'startup' | 'campus';
  content: string;
  image: string;
  imageAlt: string;
  author: mongoose.Types.ObjectId | string;
  campus?: mongoose.Types.ObjectId | string;
  quote?: { text: string; person: string };
  readingTime: number;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  submittedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StorySchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    dek: { type: String, required: true },
    category: { type: String, enum: ['student', 'startup', 'campus'], required: true, index: true },
    content: { type: String, required: true },
    image: { type: String },
    imageAlt: { type: String },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    campus: { type: Schema.Types.ObjectId, ref: 'Campus' },
    quote: { text: String, person: String },
    readingTime: { type: Number, default: 4 },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft', index: true },
    featured: { type: Boolean, default: false },
    submittedBy: { type: String },
  },
  { timestamps: true }
);

StorySchema.index({ title: 'text', dek: 'text' });

const Story: Model<IStory> = mongoose.models.Story ?? mongoose.model<IStory>('Story', StorySchema);
export default Story;
