'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Megaphone, Sparkles, Users, Bell, HeartHandshake } from 'lucide-react';
import { SectionHeading } from '@/components/common/SectionHeading';
import { StaggerGrid, StaggerItem, Reveal } from '@/components/common/Reveal';
import { Button } from '@/components/common/Button';

const DEFAULT_COMMUNITY_BG = '/images/community/community-1.jpg';

const BENEFITS = [
  { icon: Megaphone, title: 'BE HEARD', desc: 'Share your ideas, stories and experiences.' },
  { icon: Sparkles, title: 'BE DISCOVERED', desc: 'Showcase your work, achievements and initiatives.' },
  { icon: Users, title: 'BE CONNECTED', desc: 'Meet students and young people from different campuses and communities.' },
  { icon: Bell, title: 'BE INFORMED', desc: 'Get access to stories, opportunities, events and resources.' },
  { icon: HeartHandshake, title: 'BE INVOLVED', desc: 'Participate in campaigns, events and initiatives.' },
];

export function CommunitySection({ initialBg }: { initialBg?: string }) {
  const [bgImg, setBgImg] = useState(initialBg || DEFAULT_COMMUNITY_BG);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('tsc.admin.promoImages');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.communityBg) setBgImg(parsed.communityBg);
      }
    } catch {
      /* noop */
    }

    const api = process.env.NEXT_PUBLIC_API_URL;
    if (api) {
      fetch(`${api}/api/settings`)
        .then((r) => r.json())
        .then((res) => {
          const promo = res?.data?.homepage?.promoImages;
          if (promo?.communityBg) setBgImg(promo.communityBg);
        })
        .catch(() => {
          /* keep current */
        });
    }
  }, []);

  return (
    <section aria-label="Community and membership" className="relative overflow-hidden section-pad">
      {/* soft community image band */}
      <div aria-hidden className="absolute inset-0">
        <Image
          src={bgImg}
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-[0.07]"
        />
      </div>

      <div className="container-tsc relative">
        <SectionHeading
          align="center"
          number="10"
          eyebrow="Join the Movement"
          title="Your Chapter Starts Here."
          description="TSC is building a network of students, campus communities, creators, entrepreneurs and young professionals who believe that young voices deserve a bigger platform."
        />

        <StaggerGrid className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {BENEFITS.map((b) => {
            const Icon = b.icon;
            return (
              <StaggerItem key={b.title}>
                <div className="card-base card-hover group flex h-full flex-col items-center gap-4 p-6 text-center">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-brand/20 bg-brand-50 text-brand transition-all duration-300 group-hover:-translate-y-1 group-hover:border-gold group-hover:bg-gold group-hover:text-ink">
                    <Icon aria-hidden className="h-5 w-5" />
                  </span>
                  <div className="flex flex-1 flex-col justify-start">
                    <h3 className="flex min-h-[2rem] items-center justify-center font-display text-[12.5px] font-bold uppercase tracking-[0.16em]">{b.title}</h3>
                    <p className="mt-2 flex-1 text-[12.5px] leading-5 text-muted">{b.desc}</p>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerGrid>

        <Reveal delay={0.2}>
          <div className="mt-12 flex justify-center">
            <Button href="/konnectx" size="lg" arrow>
              Join Us on KonnectX
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
