import mongoose, { Schema, type Model } from 'mongoose';

export interface IEvent {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  dek?: string;
  description?: string;
  date: Date | string;
  endDate?: Date | string;
  startTime?: string;
  endTime?: string;
  time?: string;
  venue?: string;
  city?: string;
  state?: string;
  organizer?: string;
  category?: string;
  registrationUrl?: string;
  registrationDeadline?: Date | string;
  image?: string;
  imageAlt?: string;
  capacity?: number;
  status?: 'upcoming' | 'ongoing' | 'past' | 'cancelled';
  featured?: boolean;
  createdBy?: mongoose.Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    dek: { type: String, default: '' },
    description: { type: String, default: '' },
    date: { type: Schema.Types.Mixed, required: true, index: true },
    endDate: { type: Schema.Types.Mixed },
    startTime: { type: String },
    endTime: { type: String },
    time: { type: String },
    venue: { type: String },
    city: { type: String, index: true },
    state: { type: String, index: true },
    organizer: { type: String },
    category: { type: String, index: true },
    registrationUrl: { type: String },
    registrationDeadline: { type: Schema.Types.Mixed },
    image: { type: String },
    imageAlt: { type: String },
    capacity: { type: Number },
    status: { type: String, enum: ['upcoming', 'ongoing', 'past', 'cancelled'], default: 'upcoming', index: true },
    featured: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

const Event: Model<IEvent> = mongoose.models.Event ?? mongoose.model<IEvent>('Event', EventSchema);
export default Event;
