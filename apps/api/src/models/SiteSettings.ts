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
    heroPanels?: Array<{ src: string; alt: string }>;
    promoImages?: {
      writeStory?: string;
      campusNews?: string;
      communityBg?: string;
    };
  };
  emailAutomations?: {
    currentAffairs?: {
      enabled: boolean;
      autoBroadcastOnPublish: boolean;
      targetAudience: 'all' | 'subscribers' | 'members';
    };
    news?: {
      enabled: boolean;
      autoBroadcastOnPublish: boolean;
      targetAudience: 'all' | 'subscribers' | 'members';
    };
    stories?: {
      enabled: boolean;
      autoBroadcastOnPublish: boolean;
      targetAudience: 'all' | 'subscribers' | 'members';
    };
    campuses?: {
      enabled: boolean;
      autoBroadcastOnPublish: boolean;
      targetAudience: 'all' | 'subscribers' | 'members';
    };
    opportunities?: {
      enabled: boolean;
      autoBroadcastOnPublish: boolean;
      targetAudience: 'all' | 'subscribers' | 'members';
    };
    legalAwareness?: {
      enabled: boolean;
      autoBroadcastOnPublish: boolean;
      targetAudience: 'all' | 'subscribers' | 'members';
    };
  };
  updatedAt: Date;
}

/** Single-document settings store (key: 'global'). */
const SiteSettingsSchema = new Schema(
  {
    _id: { type: String, default: 'global' },
    siteName: { type: String, default: 'THE STUDENT CHAPTERS™' },
    tagline: { type: String, default: 'Your Campus. Your Voice. Your Future.' },
    contactEmail: { type: String },
    officeAddress: { type: String, default: 'B-HUB, Maurya Lok Complex, New Dak Bunglow Rd, Patna, Bihar 800001' },
    social: {
      instagram: { type: String, default: 'https://www.instagram.com/studentchapters/' },
      youtube: { type: String, default: 'https://www.youtube.com/channel/UC8IGnEOSxDVqd1AviLa-5qA' },
      linkedin: { type: String, default: 'https://in.linkedin.com/company/the-student-chapters' },
      facebook: { type: String, default: 'https://www.facebook.com/people/The-Student-Chapters/61562542822959/' },
    },
    whatsappUrl: { type: String },
    konnectxUrl: { type: String, default: 'https://konnectx.app/' },
    homepage: {
      heroEyebrow: { type: String },
      campaignSlug: { type: String, default: 'all-india-career-awareness' },
      sectionsEnabled: { type: Schema.Types.Mixed },
      heroPanels: [
        {
          src: { type: String, required: true },
          alt: { type: String, default: '' },
        },
      ],
      promoImages: {
        writeStory: { type: String, default: '/images/participation/write-story.jpg' },
        campusNews: { type: String, default: '/images/participation/campus-news.jpg' },
        communityBg: { type: String, default: '/images/community/community-1.jpg' },
      },
    },
    emailAutomations: {
      currentAffairs: {
        enabled: { type: Boolean, default: true },
        autoBroadcastOnPublish: { type: Boolean, default: true },
        targetAudience: { type: String, enum: ['all', 'subscribers', 'members'], default: 'all' },
      },
      news: {
        enabled: { type: Boolean, default: false },
        autoBroadcastOnPublish: { type: Boolean, default: false },
        targetAudience: { type: String, enum: ['all', 'subscribers', 'members'], default: 'all' },
      },
      stories: {
        enabled: { type: Boolean, default: false },
        autoBroadcastOnPublish: { type: Boolean, default: false },
        targetAudience: { type: String, enum: ['all', 'subscribers', 'members'], default: 'all' },
      },
      campuses: {
        enabled: { type: Boolean, default: false },
        autoBroadcastOnPublish: { type: Boolean, default: false },
        targetAudience: { type: String, enum: ['all', 'subscribers', 'members'], default: 'all' },
      },
      opportunities: {
        enabled: { type: Boolean, default: false },
        autoBroadcastOnPublish: { type: Boolean, default: false },
        targetAudience: { type: String, enum: ['all', 'subscribers', 'members'], default: 'all' },
      },
      legalAwareness: {
        enabled: { type: Boolean, default: false },
        autoBroadcastOnPublish: { type: Boolean, default: false },
        targetAudience: { type: String, enum: ['all', 'subscribers', 'members'], default: 'all' },
      },
    },
  },
  { timestamps: true }
);

const SiteSettings: Model<ISiteSettings> =
  mongoose.models.SiteSettings ?? mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema);
export default SiteSettings;
