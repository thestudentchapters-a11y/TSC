import type { Metadata } from 'next';
import { Hero } from '@/components/home/Hero';
import { AnimatedTicker } from '@/components/common/AnimatedTicker';
import { IntroSection } from '@/components/home/IntroSection';
import { NewsSection } from '@/components/home/NewsSection';
import { StoriesSection } from '@/components/home/StoriesSection';
import { CampusSection } from '@/components/home/CampusSection';
import { CareerSection } from '@/components/home/CareerSection';
import { CurrentAffairsSection } from '@/components/home/CurrentAffairsSection';
import { PodcastSection } from '@/components/home/PodcastSection';
import { EventsSection } from '@/components/home/EventsSection';
import { LegalSection } from '@/components/home/LegalSection';
import { CampaignSection } from '@/components/home/CampaignSection';
import { ParticipationSection } from '@/components/home/ParticipationSection';
import { CommunitySection } from '@/components/home/CommunitySection';
import { WhatsAppSection } from '@/components/home/WhatsAppSection';
import { CTASection } from '@/components/common/CTASection';
import {
  getArticles, getStories, getCampuses, getOpportunities, getEditions, getEpisodes, getEvents, getCampaign, getSiteSettings,
} from '@/lib/data';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: `${site.name} — ${site.tagline}`,
  description: site.description,
  alternates: { canonical: '/' },
};

export const revalidate = 300;

export default async function HomePage() {
  const [articles, stories, campuses, opportunities, editions, episodes, events, campaign, settings] = await Promise.all([
    getArticles(),
    getStories(),
    getCampuses(),
    getOpportunities(),
    getEditions(),
    getEpisodes(),
    getEvents(),
    getCampaign(),
    getSiteSettings(),
  ]);

  const latestEdition = [...editions].sort((a, b) => b.year - a.year)[0];

  return (
    <>
      <Hero initialPanels={settings?.homepage?.heroPanels} />
      <AnimatedTicker />
      <IntroSection />
      <NewsSection articles={articles} />
      <StoriesSection stories={stories} />
      <CampusSection campuses={campuses} />
      <CareerSection opportunities={opportunities.filter((o) => o.active)} />
      <CurrentAffairsSection edition={latestEdition} />
      <PodcastSection episodes={episodes} />
      <EventsSection events={events} />
      <LegalSection />
      <CampaignSection campaign={campaign} />
      <ParticipationSection initialImages={settings?.homepage?.promoImages} />
      <CommunitySection initialBg={settings?.homepage?.promoImages?.communityBg} />
      <WhatsAppSection />
      <CTASection
        eyebrow="Start Your Chapter"
        title={
          <>
            The Future Isn&apos;t Something You Wait For.
            <span className="mt-1 block font-serif italic text-gold">You Build It.</span>
          </>
        }
        copy="Your ideas matter. Your experiences matter. Your questions matter. Your voice matters. Start your chapter with TSC."
        primary={{ label: 'Join Us', href: '/konnectx' }}
        secondary={{ label: 'Explore the Platform', href: '/news' }}
      />
    </>
  );
}
