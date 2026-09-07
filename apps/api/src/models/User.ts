import mongoose, { Schema, type Model, type Document, type InferSchemaType } from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true, select: false },
    dateOfBirth: { type: Date },
    college: { type: String, trim: true },
    course: { type: String, trim: true },
    graduationYear: { type: Number },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    interests: [{ type: String }],
    skills: [{ type: String }],
    linkedin: { type: String, trim: true },
    instagram: { type: String, trim: true },
    avatarUrl: { type: String, trim: true },
    role: { type: String, enum: ['member', 'editor', 'admin'], default: 'member', index: true },
    customPermissions: [{ type: String }],
    isActive: { type: Boolean, default: true },
    refreshTokens: [{ type: String, select: false }],
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.passwordHash;
        delete ret.refreshTokens;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export interface IUser extends InferSchemaType<typeof UserSchema>, Document {
  comparePassword(candidate: string): Promise<boolean>;
}

UserSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

UserSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.passwordHash);
};

const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ?? mongoose.model<IUser>('User', UserSchema);
export default User;
