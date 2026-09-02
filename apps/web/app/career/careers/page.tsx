import type { Metadata } from 'next';
import Link from 'next/link';
import { Activity, Atom, Banknote, BookOpen, Briefcase, Cpu, HeartPulse, Layers, Palette, Scale, Sprout, TreePine } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { StaggerGrid, StaggerItem, Reveal } from '@/components/common/Reveal';
import { Button } from '@/components/common/Button';
import { TextCTA } from '@/components/common/Button';

export const metadata: Metadata = {
  title: 'Career Awareness — Careers Beyond the Obvious',
  description:
    'Explore careers beyond the obvious choices and learn from people who are already on the journey. A TSC Career Awareness resource.',
  alternates: { canonical: '/career/careers' },
};

const FIELDS = [
  { icon: HeartPulse, name: 'Healthcare & Medicine', roles: 'Doctor, public health, allied health, healthcare management' },
  { icon: Briefcase, name: 'Business & Entrepreneurship', roles: 'Founders, product, sales, operations, consulting' },
  { icon: Cpu, name: 'Technology & Engineering', roles: 'Software, data, AI/ML, electronics, aerospace, civil' },
  { icon: Palette, name: 'Media, Design & Creation', roles: 'Journalism, filmmaking, design, writing, content' },
  { icon: Scale, name: 'Law, Policy & Public Service', roles: 'Advocacy, civil services, policy research, governance' },
  { icon: Banknote, name: 'Finance & Economics', roles: 'Analysis, investment, banking, fintech, accounting' },
  { icon: BookOpen, name: 'Education & Research', roles: 'Teaching, edtech, academic research, science communication' },
  { icon: TreePine, name: 'Environment & Sustainability', roles: 'Climate policy, conservation, ESG, green energy' },
  { icon: Activity, name: 'Sports, Fitness & Wellbeing', roles: 'Athletics, physiotherapy, psychology, coaching' },
  { icon: Layers, name: 'Applied Arts & Trades', roles: 'Culinary arts, fashion, photography, music, performance' },
  { icon: Atom, name: 'Science & Discovery', roles: 'Pure sciences, labs, space tech, biotechnology' },
  { icon: Banknote, name: 'Social Impact', roles: 'NGOs, fellowships, community development, CSR' },
];

export default function CareersAwarenessPage() {
  return (
    <>
      <PageHeader
        eyebrow="Career / Career Awareness"
        title="Careers Beyond the Obvious Choices."
        description="Most students choose from a list of careers they have actually heard of. Career Awareness exists to stretch that list — explore fields, understand what the work really looks like, and learn from people already on the journey."
      >
        <Button href="/campaigns/all-india-career-awareness" size="md" arrow>
          Watch the Documentary Series
        </Button>
      </PageHeader>

      <section className="section-pad">
        <div className="container-tsc">
          <StaggerGrid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FIELDS.map((f) => {
              const Icon = f.icon;
              return (
                <StaggerItem key={f.name}>
                  <div className="card-base card-hover group h-full p-5">
                    <div className="flex items-center gap-3.5">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] bg-brand-50 text-brand transition-all duration-300 group-hover:bg-brand group-hover:text-white">
                        <Icon aria-hidden className="h-5 w-5" />
                      </span>
                      <h2 className="font-display text-[14.5px] font-bold leading-snug">{f.name}</h2>
                    </div>
                    <p className="mt-3 text-[12.5px] leading-5 text-muted">{f.roles}</p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerGrid>

          <Reveal delay={0.1}>
            <div className="mt-14 grid gap-8 rounded-md border border-hairline bg-white p-8 lg:grid-cols-3">
              <div>
                <p className="eyebrow">How to use this</p>
                <h3 className="mt-2 font-display text-lg font-bold">A map, not a mandate.</h3>
                <p className="mt-2 text-[13.5px] leading-6 text-muted">
                  Career fields overlap and evolve. Use these as starting points to explore, then go deeper
                  with the documentary series and career conversations on the podcast.
                </p>
              </div>
              <div>
                <p className="eyebrow">Go deeper</p>
                <ul className="mt-3 space-y-2.5 text-sm">
                  <li><Link href="/campaigns/all-india-career-awareness" className="cta-underline font-semibold text-brand">All India Career Awareness Series →</Link></li>
                  <li><Link href="/podcast?category=Career%20Conversations" className="cta-underline font-semibold text-brand">Career Conversations on TSC Podcast →</Link></li>
                  <li><Link href="/events?category=Career" className="cta-underline font-semibold text-brand">Career events near you →</Link></li>
                </ul>
              </div>
              <div className="rounded-md bg-brand-50 p-5">
                <p className="font-serif text-lg italic text-brand">“Discovering what&apos;s possible is the first step towards discovering what you want.”</p>
              </div>
            </div>
          </Reveal>

          <div className="mt-12 flex flex-wrap gap-3 border-t border-hairline pt-8">
            <TextCTA href="/career/internships">Find Internships</TextCTA>
            <TextCTA href="/career/fellowships">Explore Fellowships</TextCTA>
          </div>
        </div>
      </section>
    </>
  );
}
