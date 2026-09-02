import mongoose, { Schema, type Model } from 'mongoose';

export interface INotification {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  title: string;
  body: string;
  type: 'info' | 'opportunity' | 'event' | 'story' | 'moderation';
  link?: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    body: { type: String },
    type: { type: String, enum: ['info', 'opportunity', 'event', 'story', 'moderation'], default: 'info' },
    link: { type: String },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

const Notification: Model<INotification> =
  mongoose.models.Notification ?? mongoose.model<INotification>('Notification', NotificationSchema);
export default Notification;
