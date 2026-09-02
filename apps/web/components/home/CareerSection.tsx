import { Briefcase, Rocket, GraduationCap, Sprout } from 'lucide-react';
import { SectionHeading } from '@/components/common/SectionHeading';
import { StaggerGrid, StaggerItem } from '@/components/common/Reveal';
import { OpportunityCard } from '@/components/cards/OpportunityCard';
import { TextCTA } from '@/components/common/Button';
import type { Opportunity } from '@/types/content';

const PATHS = [
  { icon: Briefcase, title: 'Jobs', copy: 'Discover jobs and early-career opportunities for students and young professionals.', cta: 'Explore Jobs', href: '/career/jobs' },
  { icon: Rocket, title: 'Internships', copy: 'Gain practical experience, build your skills and understand the world of work.', cta: 'Find Internships', href: '/career/internships' },
  { icon: GraduationCap, title: 'Fellowships', copy: 'Discover fellowships, programmes and opportunities designed to help young people grow.', cta: 'Explore Fellowships', href: '/career/fellowships' },
  { icon: Sprout, title: 'Career Awareness', copy: 'Explore careers beyond the obvious choices and learn from people who are already on the journey.', cta: 'Explore Careers', href: '/career/careers' },
];

export function CareerSection({ opportunities }: { opportunities: Opportunity[] }) {
  return (
    <section aria-label="Career and opportunities" className="bg-white section-pad">
      <div className="container-tsc">
        <SectionHeading
          number="04"
          eyebrow="Your Next Step"
          title={<span>Opportunities Don&apos;t Always Come Looking for You.</span>}
          description="Your college years are more than a degree. They are the time to explore, experiment and build the foundation for your career. Discover opportunities that can help you take your next step — whether you're looking for your first internship, your first job, a fellowship or simply trying to understand what's possible."
        />

        <StaggerGrid className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PATHS.map((p) => {
            const Icon = p.icon;
            return (
              <StaggerItem key={p.title}>
                <div className="card-base card-hover group flex h-full flex-col p-6">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-[8px] bg-gold-50 text-gold-deep transition-all duration-300 group-hover:-rotate-6 group-hover:bg-gold group-hover:text-ink">
                    <Icon aria-hidden className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
                  </span>
                  <h3 className="mt-5 font-display text-base font-bold">{p.title}</h3>
                  <p className="mt-2.5 flex-1 text-[13.5px] leading-6 text-muted">{p.copy}</p>
                  <div className="mt-5">
                    <TextCTA href={p.href} className="!text-[11.5px]">
                      {p.cta}
                    </TextCTA>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerGrid>

        {/* featured live opportunities */}
        {opportunities.length > 0 && (
          <div className="mt-14 border-t border-hairline pt-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-display text-sm font-bold uppercase tracking-[0.18em] text-ink">
                Featured opportunities <span className="text-gold-deep">·</span>{' '}
                <span className="font-medium normal-case tracking-normal text-muted">live listings from the career hub</span>
              </h3>
              <TextCTA href="/career" className="!text-[11.5px]">
                View All
              </TextCTA>
            </div>
            <StaggerGrid className="mt-7 grid gap-5 lg:grid-cols-3">
              {opportunities.slice(0, 3).map((o) => (
                <StaggerItem key={o.id}>
                  <OpportunityCard opportunity={o} />
                </StaggerItem>
              ))}
            </StaggerGrid>
          </div>
        )}
      </div>
    </section>
  );
}
