import mongoose, { Schema, Document } from 'mongoose';

export interface IBroadcastLog extends Document {
  subject: string;
  previewText?: string;
  heading?: string;
  body: string;
  buttonLabel?: string;
  buttonUrl?: string;
  targetAudience: 'all' | 'subscribers' | 'members';
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  sentBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const broadcastLogSchema = new Schema<IBroadcastLog>(
  {
    subject: { type: String, required: true, trim: true },
    previewText: { type: String, trim: true },
    heading: { type: String, trim: true },
    body: { type: String, required: true },
    buttonLabel: { type: String, trim: true },
    buttonUrl: { type: String, trim: true },
    targetAudience: {
      type: String,
      enum: ['all', 'subscribers', 'members'],
      default: 'all',
    },
    recipientCount: { type: Number, default: 0 },
    sentCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
    sentBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.models.BroadcastLog || mongoose.model<IBroadcastLog>('BroadcastLog', broadcastLogSchema);
