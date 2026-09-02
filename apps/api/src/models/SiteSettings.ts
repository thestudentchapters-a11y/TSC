import mongoose, { Schema, type Model } from 'mongoose';

export interface ISiteSettings {
  _id: mongoose.Types.ObjectId;
  siteName: string;
  tagline: string;
  contactEmail?: string;
  officeAddress?: string;
  social: {
    instagram?: string;
    youtube?: string;
    linkedin?: string;
    facebook?: string;
  };
  whatsappUrl?: string;
  konnectxUrl?: string;
  homepage: {
    heroEyebrow?: string;
    campaignSlug?: string;
    sectionsEnabled?: Record<string, boolean>;
  };
  updatedAt: Date;
}

/** Single-document settings store (key: 'global'). */
const SiteSettingsSchema = new Schema(
  {
    _id: { type: String, default: 'global' },
    siteName: { type: String, default: 'THE STUDENT CHAPTERS' },
    tagline: { type: String, default: 'Your Campus. Your Voice. Your Future.' },
    contactEmail: { type: String },
    officeAddress: { type: String },
    social: {
      instagram: { type: String, default: 'https://www.instagram.com/studentchapters/' },
      youtube: { type: String },
      linkedin: { type: String },
      facebook: { type: String },
    },
    whatsappUrl: { type: String },
    konnectxUrl: { type: String },
    homepage: {
      heroEyebrow: { type: String },
      campaignSlug: { type: String, default: 'all-india-career-awareness' },
      sectionsEnabled: { type: Schema.Types.Mixed },
    },
  },
  { timestamps: true }
);

const SiteSettings: Model<ISiteSettings> =
  mongoose.models.SiteSettings ?? mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema);
export default SiteSettings;
