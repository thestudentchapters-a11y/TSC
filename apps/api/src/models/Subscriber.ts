import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscriber extends Document {
  email: string;
  status: 'active' | 'unsubscribed';
  source?: string;
  ipAddress?: string;
  userAgent?: string;
  subscribedAt: Date;
  unsubscribedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const subscriberSchema = new Schema<ISubscriber>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'unsubscribed'],
      default: 'active',
      index: true,
    },
    source: {
      type: String,
      default: 'website_footer',
    },
    ipAddress: { type: String },
    userAgent: { type: String },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    unsubscribedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Subscriber || mongoose.model<ISubscriber>('Subscriber', subscriberSchema);
