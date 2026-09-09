/**
 * Seed script — populates MongoDB with clearly-fictional demo content
 * and creates demo accounts for every role.
 *
 *   npm run seed
 *
 * ⚠ Demo content is for development/preview only — never presented as real
 * TSC reporting. The homepage copy in the web app IS the real TSC copy.
 */
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db';
import User from '../models/User';
import Membership from '../models/Membership';
import Article from '../models/Article';
import Story from '../models/Story';
import Campus from '../models/Campus';
import PodcastEpisode from '../models/PodcastEpisode';
import Event from '../models/Event';
import Opportunity from '../models/Opportunity';
import CurrentAffairsEdition from '../models/CurrentAffairsEdition';
import LegalArticle from '../models/LegalArticle';
import Campaign from '../models/Campaign';
import CampaignEpisode from '../models/CampaignEpisode';
import { StorySubmission, CampusSubmission } from '../models/Submission';
import ContactMessage from '../models/ContactMessage';
import SiteSettings from '../models/SiteSettings';
import { slugify } from '../utils/slugify';
import { seedData } from './seedData';

async function seed() {
  await connectDB();

  // eslint-disable-next-line no-console
  console.log('⏳ Clearing collections…');
  await Promise.all([
    User.deleteMany({}), Membership.deleteMany({}), Article.deleteMany({}), Story.deleteMany({}),
    Campus.deleteMany({}), PodcastEpisode.deleteMany({}), Event.deleteMany({}), Opportunity.deleteMany({}),
    CurrentAffairsEdition.deleteMany({}), LegalArticle.deleteMany({}), Campaign.deleteMany({}),
    CampaignEpisode.deleteMany({}), StorySubmission.deleteMany({}), CampusSubmission.deleteMany({}),
    ContactMessage.deleteMany({}), SiteSettings.deleteMany({}),
  ]);

  /* Official Administrative & Newsroom Accounts */
  const [admin, editor, member] = await User.create([
    { name: 'TSC Administrator', email: 'admin@thestudentchapters.org', passwordHash: 'TSCAdmin@2026!', role: 'admin' },
    { name: 'TSC Senior Editor', email: 'editor@thestudentchapters.org', passwordHash: 'TSCEditor@2026!', role: 'editor' },
    { name: 'Aarav Sharma', email: 'member@thestudentchapters.org', passwordHash: 'TSCMember@2026!', role: 'member', college: 'Patna University', city: 'Patna' },
  ]);
  await Membership.create({ user: member._id, memberCode: 'TSC-IND001', status: 'active' });

  /* News */
  const articles = await Article.insertMany(
    seedData.news.map((n) => ({ ...n, slug: slugify(n.title), author: editor._id, status: 'published' }))
  );

  /* Stories */
  await Story.insertMany(
    seedData.stories.map((s) => ({ ...s, slug: slugify(s.title), author: editor._id, status: 'published' }))
  );

  /* Campuses */
  const campuses = await Campus.insertMany(
    seedData.campuses.map((c) => ({ ...c, slug: slugify(c.name) }))
  );

  /* Podcast */
  await PodcastEpisode.insertMany(
    seedData.podcasts.map((p) => ({ ...p, slug: slugify(p.title), status: 'published' }))
  );

  /* Events */
  await Event.insertMany(
    seedData.events.map((e) => ({ ...e, slug: slugify(e.title), createdBy: editor._id }))
  );

  /* Opportunities */
  await Opportunity.insertMany(
    seedData.opportunities.map((o) => ({ ...o, slug: slugify(o.title), createdBy: editor._id, status: 'active' }))
  );

  /* Current affairs */
  await CurrentAffairsEdition.insertMany(
    seedData.editions.map((e) => ({ ...e, slug: slugify(e.title), author: editor._id, status: 'published' }))
  );

  /* Legal awareness */
  await LegalArticle.insertMany(
    seedData.legal.map((l) => ({ ...l, slug: slugify(l.title), author: editor._id, status: 'published' }))
  );

  /* Campaign + episodes */
  const campaign = await Campaign.create({ ...seedData.campaign, slug: 'all-india-career-awareness', status: 'published', createdBy: editor._id });
  await CampaignEpisode.insertMany(
    seedData.campaignEpisodes.map((e) => ({ ...e, slug: slugify(e.title), campaign: campaign._id }))
  );

  /* Submissions + inbox + settings */
  await StorySubmission.insertMany(seedData.storySubmissions);
  await CampusSubmission.insertMany(seedData.campusSubmissions);
  await ContactMessage.insertMany(seedData.contactMessages);
  await SiteSettings.create({});

  // eslint-disable-next-line no-console
  console.log(`
✅ Seed complete!

   Official Administrative Accounts:
   • admin@thestudentchapters.org   / TSCAdmin@2026!    (Administrator)
   • editor@thestudentchapters.org  / TSCEditor@2026!   (Senior Editor)
   • member@thestudentchapters.org  / TSCMember@2026!   (Member)

   ${articles.length} news articles · ${seedData.stories.length} stories · ${campuses.length} campuses
   ${seedData.podcasts.length} podcast episodes · ${seedData.events.length} events · ${seedData.opportunities.length} opportunities
`);
  await disconnectDB();
}

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed:', err);
  process.exit(1);
});
