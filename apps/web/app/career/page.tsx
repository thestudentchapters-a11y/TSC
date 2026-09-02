import type { Metadata } from 'next';
import Link from 'next/link';
import { Briefcase, Rocket, GraduationCap, Sprout, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SectionHeading } from '@/components/common/SectionHeading';
import { OpportunityCard } from '@/components/cards/OpportunityCard';
import { StaggerGrid, StaggerItem, Reveal } from '@/components/common/Reveal';
import { getOpportunities } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Career & Opportunities — Your Next Step',
  description:
    "Your college years are more than a degree. Discover jobs, internships, fellowships and career awareness resources that help you take your next step.",
  alternates: { canonical: '/career' },
};

export const revalidate = 120;

const PATHS = [
  { icon: Briefcase, title: 'Jobs', copy: 'Discover jobs and early-career opportunities for students and young professionals.', cta: 'Explore Jobs →', href: '/career/jobs' },
  { icon: Rocket, title: 'Internships', copy: 'Gain practical experience, build your skills and understand the world of work.', cta: 'Find Internships →', href: '/career/internships' },
  { icon: GraduationCap, title: 'Fellowships', copy: 'Discover fellowships, programmes and opportunities designed to help young people grow.', cta: 'Explore Fellowships →', href: '/career/fellowships' },
  { icon: Sprout, title: 'Career Awareness', copy: 'Explore careers beyond the obvious choices and learn from people who are already on the journey.', cta: 'Explore Careers →', href: '/career/careers' },
];

export default async function CareerPage() {
  const opportunities = (await getOpportunities()).filter((o) => o.active);
  const featured = opportunities.filter((o) => o.featured);

  return (
    <>
      <PageHeader
        eyebrow="04 — Your Next Step"
        title="Opportunities Don't Always Come Looking for You."
        description="Your college years are more than a degree. They are the time to explore, experiment and build the foundation for your career. Discover opportunities that can help you take your next step — whether you're looking for your first internship, your first job, a fellowship or simply trying to understand what's possible."
      />

      <section className="section-pad">
        <div className="container-tsc">
          <StaggerGrid className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PATHS.map((p) => {
              const Icon = p.icon;
              return (
                <StaggerItem key={p.title}>
                  <Link href={p.href} className="card-base card-hover group flex h-full flex-col p-6">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-[8px] bg-gold-50 text-gold-deep transition-all duration-300 group-hover:-rotate-6 group-hover:bg-gold group-hover:text-ink">
                      <Icon aria-hidden className="h-6 w-6" />
                    </span>
                    <h2 className="mt-5 font-display text-lg font-bold">{p.title}</h2>
                    <p className="mt-2.5 flex-1 text-[13.5px] leading-6 text-muted">{p.copy}</p>
                    <span className="mt-5 inline-flex items-center gap-2 font-display text-[11.5px] font-bold uppercase tracking-[0.14em] text-brand">
                      <span className="cta-underline">{p.cta}</span>
                      <ArrowRight aria-hidden className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </Link>
                </StaggerItem>
              );
            })}
          </StaggerGrid>

          <div className="mt-16 border-t border-hairline pt-12">
            <SectionHeading
              eyebrow="Featured"
              title="Handpicked from the career hub"
              description="A selection of live listings — jobs, internships, fellowships and scholarships posted by organisations and curated by TSC."
            />
            <StaggerGrid className="mt-10 grid gap-6 lg:grid-cols-3">
              {(featured.length ? featured : opportunities).slice(0, 3).map((o) => (
                <StaggerItem key={o.id}>
                  <OpportunityCard opportunity={o} />
                </StaggerItem>
              ))}
            </StaggerGrid>
          </div>

          <Reveal delay={0.1}>
            <div className="mt-16 grid gap-6 rounded-md border border-brand/20 bg-brand-50 p-8 sm:grid-cols-2 sm:items-center">
              <div>
                <p className="eyebrow">Explore visually</p>
                <h3 className="mt-2 font-display text-xl font-bold">
                  See what a career actually looks like — before choosing one.
                </h3>
                <p className="mt-2 text-[14px] leading-6 text-ink/70">
                  The All India Career Awareness Youth Documentary Series takes you into the real world of
                  professionals across industries.
                </p>
              </div>
              <div className="sm:text-right">
                <Link
                  href="/campaigns/all-india-career-awareness"
                  className="inline-flex items-center gap-2 rounded-[4px] bg-brand px-6 py-3 font-display text-xs font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-brand-dark"
                >
                  Watch the Series <ArrowRight aria-hidden className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
