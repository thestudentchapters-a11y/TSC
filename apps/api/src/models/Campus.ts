import mongoose, { Schema, type Model } from 'mongoose';

export interface ICampus {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  university: string;
  city: string;
  state: string;
  type: string;
  description: string;
  image: string;
  imageAlt: string;
  categories: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CampusSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    university: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    type: { type: String, default: 'University' },
    description: { type: String, default: '' },
    image: { type: String },
    imageAlt: { type: String },
    categories: [{ type: String }],
  },
  { timestamps: true }
);

const Campus: Model<ICampus> = mongoose.models.Campus ?? mongoose.model<ICampus>('Campus', CampusSchema);
export default Campus;
