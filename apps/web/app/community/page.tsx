import type { Metadata } from 'next';
import { Bell, Globe, HeartHandshake, Megaphone, MessageCircle, Sparkles, Users } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SectionHeading } from '@/components/common/SectionHeading';
import { StaggerGrid, StaggerItem, Reveal } from '@/components/common/Reveal';
import { Button } from '@/components/common/Button';
import { CTASection } from '@/components/common/CTASection';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Community — Join the Movement',
  description:
    'TSC is building a network of students, campus communities, creators, entrepreneurs and young professionals who believe that young voices deserve a bigger platform.',
  alternates: { canonical: '/community' },
};

const BENEFITS = [
  { icon: Megaphone, title: 'BE HEARD', desc: 'Share your ideas, stories and experiences.' },
  { icon: Sparkles, title: 'BE DISCOVERED', desc: 'Showcase your work, achievements and initiatives.' },
  { icon: Users, title: 'BE CONNECTED', desc: 'Meet students and young people from different campuses and communities.' },
  { icon: Bell, title: 'BE INFORMED', desc: 'Get access to stories, opportunities, events and resources.' },
  { icon: HeartHandshake, title: 'BE INVOLVED', desc: 'Participate in campaigns, events and initiatives.' },
];

export default function CommunityPage() {
  return (
    <>
      <PageHeader
        eyebrow="10 — Join the Movement"
        title="Your Chapter Starts Here."
        description="TSC is building a network of students, campus communities, creators, entrepreneurs and young professionals who believe that young voices deserve a bigger platform."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button href="/membership" size="lg" arrow>
            Become a Member
          </Button>
          <Button href="/share-your-story" variant="outline" size="lg" arrow>
            Share Your Story
          </Button>
        </div>
      </PageHeader>

      <section className="section-pad">
        <div className="container-tsc">
          <StaggerGrid className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {BENEFITS.map((b) => {
              const Icon = b.icon;
              return (
                <StaggerItem key={b.title}>
                  <div className="card-base card-hover group flex h-full flex-col items-center gap-4 p-6 text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full border border-brand/20 bg-brand-50 text-brand transition-all duration-300 group-hover:-translate-y-1 group-hover:border-gold group-hover:bg-gold group-hover:text-ink">
                      <Icon aria-hidden className="h-5 w-5" />
                    </span>
                    <div>
                      <h2 className="font-display text-[12.5px] font-bold uppercase tracking-[0.16em]">{b.title}</h2>
                      <p className="mt-2 text-[12.5px] leading-5 text-muted">{b.desc}</p>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerGrid>

          <div className="mt-16 grid gap-8 lg:grid-cols-2">
            <Reveal>
              <div className="flex h-full flex-col justify-center gap-4 rounded-md border border-hairline bg-white p-8">
                <p className="eyebrow">Contribute</p>
                <h2 className="font-display text-2xl font-bold">Students are the content, the contributors and the community.</h2>
                <p className="text-[14.5px] leading-7 text-muted">
                  TSC isn&apos;t a platform where students simply consume content. If you have a story, an
                  idea, an achievement or a campus update — this is your platform.
                </p>
                <div className="mt-2 flex flex-wrap gap-3">
                  <Button href="/share-your-story" size="sm" arrow>Share Your Story</Button>
                  <Button href="/share-campus-news" variant="outline" size="sm" arrow>Share Campus News</Button>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.12}>
              <div className="flex h-full flex-col justify-center gap-4 rounded-md bg-brand-dark p-8 text-white">
                <p className="eyebrow !text-gold">Channels</p>
                <h2 className="font-display text-2xl font-bold text-white">Stay Connected. Stay Ahead.</h2>
                <p className="text-[14.5px] leading-7 text-white/70">
                  Get selected updates on student opportunities, events, career resources, stories and TSC
                  initiatives directly through your preferred channel. No noise. Just things worth knowing.
                </p>
                <div className="mt-2 flex flex-wrap gap-3">
                  {site.whatsappUrl ? (
                    <Button href={site.whatsappUrl} variant="accent" size="sm" arrow>
                      <MessageCircle aria-hidden className="h-4 w-4" /> Join WhatsApp Community
                    </Button>
                  ) : (
                    <span className="rounded-[4px] border border-dashed border-white/30 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-white/50">
                      WhatsApp — link to be configured
                    </span>
                  )}
                  {site.konnectxUrl ? (
                    <Button href={site.konnectxUrl} variant="light" size="sm" arrow>
                      <Globe aria-hidden className="h-4 w-4" /> KonnectX
                    </Button>
                  ) : (
                    <span className="rounded-[4px] border border-dashed border-white/30 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-white/50">
                      KonnectX — link to be configured
                    </span>
                  )}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <CTASection
        eyebrow="Join the Movement"
        title="Your Chapter Starts Here."
        copy="TSC is building a network of students, campus communities, creators, entrepreneurs and young professionals who believe that young voices deserve a bigger platform."
        primary={{ label: 'Join the Student Chapters™ / Become a Member', href: '/membership' }}
        secondary={{ label: 'Explore Campaigns', href: '/campaigns' }}
        variant="brand"
      />
    </>
  );
}
