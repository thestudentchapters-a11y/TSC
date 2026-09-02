import mongoose, { Schema, type Model } from 'mongoose';

export interface IContactMessage {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContactMessageSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['new', 'read', 'replied'], default: 'new', index: true },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

const ContactMessage: Model<IContactMessage> =
  mongoose.models.ContactMessage ?? mongoose.model<IContactMessage>('ContactMessage', ContactMessageSchema);
export default ContactMessage;
