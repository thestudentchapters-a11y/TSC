import mongoose, { Schema, type Model } from 'mongoose';

/**
 * Media metadata — files live on an external provider (e.g. Cloudinary),
 * never inside MongoDB.
 */
export interface IMedia {
  _id: mongoose.Types.ObjectId;
  url: string;
  publicId: string;
  filename: string;
  altText: string;
  caption?: string;
  type: 'image' | 'audio' | 'video' | 'document';
  dimensions?: { width: number; height: number };
  sizeBytes?: number;
  uploadedBy?: mongoose.Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const MediaSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String },
    filename: { type: String, required: true },
    altText: { type: String, required: true },
    caption: { type: String },
    type: { type: String, enum: ['image', 'audio', 'video', 'document'], default: 'image' },
    dimensions: { width: Number, height: Number },
    sizeBytes: { type: Number },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const Media: Model<IMedia> = mongoose.models.Media ?? mongoose.model<IMedia>('Media', MediaSchema);
export default Media;
