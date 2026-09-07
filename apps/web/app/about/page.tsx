import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Briefcase as BriefcaseIcon, Compass, GraduationCap, HandHeart, Mic, Newspaper, Scale, TrendingUp, Users } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SectionHeading } from '@/components/common/SectionHeading';
import { StaggerGrid, StaggerItem, Reveal } from '@/components/common/Reveal';
import { Button } from '@/components/common/Button';
import { CTASection } from '@/components/common/CTASection';

export const metadata: Metadata = {
  title: 'About — THE STUDENT CHAPTERS™',
  description:
    'TSC exists to amplify student and youth voices and connect young people with information, opportunities, communities and experiences that help them grow.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About TSC"
        title="More Than News. A Platform for the Next Generation."
        description="THE STUDENT CHAPTERS™ (TSC) is India's student and youth platform where students discover information, opportunities, stories, communities and experiences while also contributing their own voices."
      />

      {/* About TSC */}
      <section className="section-pad">
        <div className="container-tsc grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <Reveal>
              <div className="relative aspect-[4/5] overflow-hidden rounded-md">
                <Image src="/images/about-campus.jpg" alt="Students walking across a university campus in India" fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" priority />
              </div>
            </Reveal>
          </div>
          <div className="space-y-6 lg:col-span-7">
            <Reveal>
              <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Students are not just learners.</h2>
              <p className="mt-4 text-[15px] leading-8 text-muted">
                They are creators, entrepreneurs, researchers, artists, leaders, changemakers and future
                professionals. But great ideas and great stories often remain inside classrooms and campuses.
                The Student Chapters™ exists to bring those voices out. We connect students and young people
                with the stories, opportunities, information, people and experiences that can help them move
                forward.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="flex flex-wrap items-center gap-3">
                <p className="font-serif text-xl italic text-brand">
                  Your Campus. Your Voice. Your Future.
                </p>
                <span aria-hidden className="hidden sm:inline text-hairline">•</span>
                <span className="rounded-full border border-gold/40 bg-gold-50 px-3 py-1 font-display text-xs font-bold uppercase tracking-wider text-gold-deep">
                  Students are Watching, Observing &amp; Learning
                </span>
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="text-[15px] leading-8 text-muted">
                Across news, stories, campus directories, career opportunities, current affairs, podcasts,
                events, legal awareness and campaigns — TSC is built around one idea: the next generation
                deserves a bigger platform, and deserves to be part of building it.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Mission / Vision */}
      <section id="mission" className="scroll-mt-24 border-y border-hairline bg-white section-pad">
        <div className="container-tsc grid gap-8 lg:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-md border border-brand/20 bg-brand-50 p-8">
              <p className="eyebrow">Our Mission</p>
              <h2 className="mt-3 font-display text-2xl font-bold">
                Amplify student &amp; youth voices across India.
              </h2>
              <p className="mt-4 text-[14.5px] leading-7 text-ink/70">
                TSC exists to amplify student and youth voices and connect young people with information,
                opportunities, communities and experiences that help them grow.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="h-full rounded-md border border-gold/40 bg-gold-50 p-8">
              <p className="eyebrow !text-gold-deep">Our Vision</p>
              <h2 className="mt-3 font-display text-2xl font-bold">
                A generation that discovers, learns, connects and creates.
              </h2>
              <p className="mt-4 text-[14.5px] leading-7 text-ink/70">
                A India where every student — in every town, campus and classroom — can see what is possible,
                find their people, and build their future with confidence. [Positioning statement — expand via admin.]
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* What we believe / What we do */}
      <section className="section-pad">
        <div className="container-tsc grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="What We Believe" title="Young voices deserve a bigger platform." />
            <ul className="mt-7 space-y-4">
              {[
                'Every student has a story worth telling.',
                'Information and opportunity should not depend on where you study.',
                'Careers should be understood before they are chosen.',
                'Knowing your rights is a life skill, not a luxury.',
                'Communities grow faster when students build them together.',
              ].map((b, i) => (
                <Reveal key={b} delay={i * 0.06}>
                  <li className="flex items-start gap-3 text-[14.5px] leading-7 text-ink/80">
                    <span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-[2px] bg-gold" />
                    {b}
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
          <div>
            <SectionHeading eyebrow="What We Do" title="A platform students help build." />
            <StaggerGrid className="mt-7 grid gap-4 sm:grid-cols-2">
              {[
                { icon: Newspaper, t: 'News & Campus Updates', d: 'Student news, education, youth affairs and innovation coverage.' },
                { icon: Users, t: 'Stories & Community', d: 'Student, startup and campus stories — written with students.' },
                { icon: BriefcaseIcon, t: 'Opportunities', d: 'Jobs, internships, fellowships and scholarships in one hub.' },
                { icon: Mic, t: 'Podcasts & Campaigns', d: 'Conversations that matter and documentary series on real careers.' },
                { icon: Scale, t: 'Legal Awareness', d: 'Rights, cyber safety and education laws — in plain language.' },
                { icon: TrendingUp, t: 'Current Affairs', d: 'Monthly editions explained for students.' },
              ].map((x) => {
                const Icon = x.icon;
                return (
                  <StaggerItem key={x.t}>
                    <div className="card-base card-hover group h-full p-5">
                      <Icon aria-hidden className="h-5 w-5 text-brand transition-transform duration-300 group-hover:scale-110" />
                      <h3 className="mt-3 font-display text-[13.5px] font-bold">{x.t}</h3>
                      <p className="mt-1.5 text-[12.5px] leading-5 text-muted">{x.d}</p>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerGrid>
          </div>
        </div>
      </section>

      {/* Why TSC exists / Community */}
      <section className="border-y border-hairline bg-white section-pad">
        <div className="container-tsc grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Why TSC Exists" title="Great ideas shouldn't stay inside classrooms." />
            <p className="mt-6 text-[15px] leading-8 text-muted">
              Students today are building, creating, organising and leading — but their work rarely travels
              beyond their campus gates. Meanwhile, the information students need (opportunities, rights,
              career clarity, credible news) is scattered, noisy and rarely written for them. TSC bridges
              both gaps: taking student voices further, and bringing the wider world closer.
            </p>
          </div>
          <div>
            <SectionHeading eyebrow="Our Community" title="Built by students, for students." />
            <p className="mt-6 text-[15px] leading-8 text-muted">
              Members, campus contributors, editors, founders, educators and young professionals — TSC is a
              growing network across Indian campuses. Members submit stories and campus news, contribute to
              campaigns, host events and shape what the platform becomes.
            </p>
            <div className="mt-6 flex gap-3">
              <Button href="/membership" size="md" arrow>Join TSC</Button>
              <Button href="/community" variant="outline" size="md" arrow>Explore Community</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Team / Impact — placeholders, no invented facts */}
      <section id="team" className="scroll-mt-24 section-pad">
        <div className="container-tsc grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Our Team" title="The people behind TSC." />
            <div className="mt-7 rounded-md border border-dashed border-hairline bg-white p-8 text-center">
              <Users aria-hidden className="mx-auto h-8 w-8 text-muted/50" />
              <p className="mt-4 font-display text-sm font-bold uppercase tracking-[0.14em] text-muted">
                [TO BE CONFIGURED]
              </p>
              <p className="mx-auto mt-2 max-w-sm text-[13.5px] leading-6 text-muted">
                Team profiles, roles and photos are published here once configured by the TSC team via the
                admin panel. We never publish unverified details.
              </p>
            </div>
          </div>
          <div>
            <SectionHeading eyebrow="Our Impact" title="What the community has built." />
            <div className="mt-7 rounded-md border border-dashed border-hairline bg-white p-8 text-center">
              <TrendingUp aria-hidden className="mx-auto h-8 w-8 text-muted/50" />
              <p className="mt-4 font-display text-sm font-bold uppercase tracking-[0.14em] text-muted">
                [TO BE CONFIGURED]
              </p>
              <p className="mx-auto mt-2 max-w-sm text-[13.5px] leading-6 text-muted">
                Verified impact numbers (members, campuses, stories, events) are populated from live data
                once the platform is connected — TSC does not publish invented statistics.
              </p>
              <p className="mt-4 text-xs italic text-muted/80">
                Live counts visible on the <Link href="/admin" className="text-brand underline">admin dashboard</Link> in demo mode.
              </p>
            </div>
          </div>
        </div>
      </section>

      <CTASection
        eyebrow="Join the Movement"
        title="Your Chapter Starts Here."
        copy="TSC is building a network of students, campus communities, creators, entrepreneurs and young professionals who believe that young voices deserve a bigger platform."
        primary={{ label: 'Join TSC', href: '/membership' }}
        secondary={{ label: 'Contact Us', href: '/contact' }}
      />
    </>
  );
}
