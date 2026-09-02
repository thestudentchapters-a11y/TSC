import mongoose, { Schema, type Model } from 'mongoose';

export interface ISavedItem {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  itemType: 'article' | 'story' | 'episode' | 'event' | 'opportunity';
  itemId: mongoose.Types.ObjectId;
  title: string;
  href: string;
  createdAt: Date;
  updatedAt: Date;
}

const SavedItemSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    itemType: { type: String, enum: ['article', 'story', 'episode', 'event', 'opportunity'], required: true },
    itemId: { type: Schema.Types.ObjectId, required: true },
    title: { type: String },
    href: { type: String },
  },
  { timestamps: true }
);

SavedItemSchema.index({ user: 1, itemType: 1, itemId: 1 }, { unique: true });

const SavedItem: Model<ISavedItem> =
  mongoose.models.SavedItem ?? mongoose.model<ISavedItem>('SavedItem', SavedItemSchema);
export default SavedItem;
