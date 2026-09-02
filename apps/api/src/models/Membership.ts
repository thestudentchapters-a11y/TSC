import mongoose, { Schema, type Model } from 'mongoose';

export interface IMembership {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  memberCode: string;
  status: 'active' | 'pending' | 'expired' | 'cancelled';
  startedAt: Date;
  endsAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MembershipSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    memberCode: { type: String, unique: true },
    status: { type: String, enum: ['active', 'pending', 'expired', 'cancelled'], default: 'active', index: true },
    startedAt: { type: Date, default: Date.now },
    endsAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

const Membership: Model<IMembership> =
  mongoose.models.Membership ?? mongoose.model<IMembership>('Membership', MembershipSchema);
export default Membership;
