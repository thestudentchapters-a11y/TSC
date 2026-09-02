import mongoose, { Schema, type Model } from 'mongoose';

export interface IEventRegistration {
  _id: mongoose.Types.ObjectId;
  event: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  status: 'registered' | 'cancelled' | 'attended';
  createdAt: Date;
  updatedAt: Date;
}

const EventRegistrationSchema = new Schema(
  {
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String },
    status: { type: String, enum: ['registered', 'cancelled', 'attended'], default: 'registered' },
  },
  { timestamps: true }
);

EventRegistrationSchema.index({ event: 1, email: 1 }, { unique: true });

const EventRegistration: Model<IEventRegistration> =
  mongoose.models.EventRegistration ??
  mongoose.model<IEventRegistration>('EventRegistration', EventRegistrationSchema);
export default EventRegistration;
