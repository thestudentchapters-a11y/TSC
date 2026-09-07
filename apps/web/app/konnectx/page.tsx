import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ExternalLink,
  Globe,
  MessageSquare,
  Radio,
  Share2,
  Sparkles,
  Users,
  Briefcase,
  Layers,
  GraduationCap,
  ShieldCheck,
  Smartphone,
  Compass,
  ArrowRight,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/common/Button';
import { Reveal, StaggerGrid, StaggerItem } from '@/components/common/Reveal';

export const metadata: Metadata = {
  title: 'KonnectX — Social Learning & Real Networking Platform',
  description:
    'Discover KonnectX: Where education meets opportunity. Connect with peers, mentors, creators, and professionals in a modern student social network.',
  alternates: { canonical: '/konnectx' },
};

const OFFICIAL_URL = 'https://konnectx.app/';
const APP_STORE_URL = 'https://apps.apple.com/in/app/konnectx-student-network/id6759776830';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.mytagapp';

const CORE_FEATURES = [
  {
    icon: Share2,
    badge: 'Content & Stories',
    title: 'Create & Share Authentically',
    desc: 'Express yourself through rich multimedia posts, project showcases, classroom breakthroughs, and unfiltered thoughts. Share what truly matters to you.',
  },
  {
    icon: Radio,
    badge: 'Short Video',
    title: 'Reels & Visual Stories',
    desc: 'Engage with short-form educational and creative videos. Showcase your college projects, club events, talent, and day-in-the-life moments.',
  },
  {
    icon: Users,
    badge: 'Networking',
    title: 'Professional & Peer Networking',
    desc: 'Bridge the gap between campus life and industry. Build genuine relationships with mentors, faculty, alumni, and driven peers across India.',
  },
  {
    icon: Briefcase,
    badge: 'Opportunities',
    title: 'Career & Job Discovery',
    desc: 'Discover internships, student gigs, research opportunities, and startup roles that align with your genuine skills and passion.',
  },
  {
    icon: MessageSquare,
    badge: 'Real-time Chat',
    title: 'Messaging & Group Collaboration',
    desc: 'Collaborate seamlessly on hackathons, campus initiatives, study circles, and startup ideas with instant direct and group messaging.',
  },
  {
    icon: Layers,
    badge: 'Communities',
    title: 'Campus Hubs & Interest Circles',
    desc: 'Join dedicated college chapters, technical societies, cultural clubs, and regional discussion forums with verified student memberships.',
  },
];

const HIGHLIGHTS = [
  { label: 'Pilot Phase', value: 'Live Now', desc: 'Available across iOS, Android, and Web' },
  { label: 'Purpose-Built', value: 'Students & Faculty', desc: 'Zero noise, authentic social learning' },
  { label: 'Integrations', value: 'TSC Network', desc: 'Connected with The Student Chapters' },
  { label: 'Access', value: '100% Free', desc: 'Open to students & young changemakers' },
];

const FAQS = [
  {
    q: 'What is KonnectX?',
    a: 'KonnectX is a dedicated social learning and professional networking platform designed specifically for students, educators, and young professionals to connect, collaborate, and discover opportunities.',
  },
  {
    q: 'How does KonnectX connect with The Student Chapters (TSC)?',
    a: 'While TSC serves as the premier student media, editorial, and journalism publication, KonnectX provides the interactive real-time networking and social communication backbone for our campus communities.',
  },
  {
    q: 'Is KonnectX free for students?',
    a: 'Yes, KonnectX is completely free to download and use for students, teachers, campus club leads, and young professionals across India.',
  },
  {
    q: 'Where can I access KonnectX?',
    a: 'You can access KonnectX directly on the web at konnectx.app, as well as on iOS via the Apple App Store and on Android via Google Play.',
  },
];

export default function KonnectXPage() {
  return (
    <>
      <PageHeader
        eyebrow="Ecosystem Partner • Social Learning"
        title="The Future of Social Learning & Real Networking."
        description="Where education meets opportunity. Connect, create, and grow with the next generation of social networking designed for students, teachers, and professionals."
      >
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* CTA 1: Official Website */}
          <Button href={OFFICIAL_URL} size="md" arrow>
            <Globe aria-hidden className="h-4 w-4" /> Visit konnectx.app
          </Button>

          {/* CTA 2: Launch Web App */}
          <Button href={OFFICIAL_URL} variant="accent" size="md">
            <Sparkles aria-hidden className="h-4 w-4" /> Launch Web App
          </Button>

          {/* CTA 3: App Store */}
          <Button href={APP_STORE_URL} variant="outline" size="md">
            <Smartphone aria-hidden className="h-4 w-4" /> App Store
          </Button>

          {/* CTA 4: Google Play */}
          <Button href={PLAY_STORE_URL} variant="outline" size="md">
            <Smartphone aria-hidden className="h-4 w-4" /> Google Play
          </Button>
        </div>
      </PageHeader>

      {/* Stats Bar */}
      <section className="border-b border-hairline bg-white py-10">
        <div className="container-tsc grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {HIGHLIGHTS.map((h, i) => (
            <Reveal key={h.label} delay={i * 0.08}>
              <div className="rounded-md border border-hairline bg-cream p-5">
                <p className="font-display text-xs font-bold uppercase tracking-wider text-muted">{h.label}</p>
                <p className="mt-1 font-display text-2xl font-bold text-brand">{h.value}</p>
                <p className="mt-1 text-xs text-ink/70">{h.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Main Feature Cards */}
      <section className="section-pad">
        <div className="container-tsc">
          <div className="max-w-3xl">
            <p className="eyebrow">Designed For Authenticity, Growth &amp; Purpose</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Everything You Need to Build Your Academic &amp; Creative Future.
            </h2>
            <p className="mt-3 text-[15px] leading-7 text-muted">
              Traditional social media is cluttered with distractions. KonnectX focuses on purposeful connection,
              creative expression, project sharing, and tangible opportunities.
            </p>
          </div>

          <StaggerGrid className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CORE_FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <StaggerItem key={feat.title}>
                  <div className="card-base card-hover group flex h-full flex-col justify-between p-6">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="flex h-12 w-12 items-center justify-center rounded-[8px] bg-brand-50 text-brand transition-all duration-300 group-hover:bg-brand group-hover:text-white">
                          <Icon aria-hidden className="h-6 w-6" />
                        </span>
                        <span className="rounded-full border border-hairline bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold-deep">
                          {feat.badge}
                        </span>
                      </div>
                      <h3 className="mt-5 font-display text-lg font-bold min-h-[1.75rem]">{feat.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted">{feat.desc}</p>
                    </div>
                    <div className="mt-6 border-t border-hairline pt-4">
                      <a
                        href={OFFICIAL_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cta-underline inline-flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-[0.14em] text-brand"
                      >
                        Explore Feature <ExternalLink aria-hidden className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerGrid>
        </div>
      </section>

      {/* Why Join Banner */}
      <section className="bg-brand-dark py-16 text-white">
        <div className="container-tsc grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="space-y-4 lg:col-span-7">
            <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-gold">
              Live Pilot Stage
            </span>
            <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Be Real. Be Unfiltered. <br />
              <span className="text-gold">Discover Who You Truly Are.</span>
            </h2>
            <p className="text-[15px] leading-7 text-white/80">
              Join thousands of college students, startup founders, campus club leaders, and mentors already shaping
              the community on KonnectX. Connect your profile and build a portfolio that matters.
            </p>
            <ul className="grid gap-2.5 pt-2 text-sm text-white/90 sm:grid-cols-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-gold" /> Verified Student ID badges
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-gold" /> Cross-campus collaborations
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-gold" /> Direct mentor messaging
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-gold" /> Early internship alerts
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-white/15 bg-white/[0.05] p-8 lg:col-span-5">
            <h3 className="font-display text-xl font-bold text-white">Ready to connect?</h3>
            <p className="text-xs leading-5 text-white/70">
              Open KonnectX on your browser or install on your phone to get started in less than a minute.
            </p>

            {/* CTA 5: Primary Action */}
            <Button
              href={OFFICIAL_URL}
              variant="accent"
              size="lg"
              arrow
              className="w-full justify-center"
            >
              <Globe className="h-4 w-4" /> Open KonnectX Web Portal
            </Button>

            {/* CTA 6: Direct Mobile CTA */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button
                href={APP_STORE_URL}
                variant="light"
                size="sm"
                className="justify-center border-white/30 text-white hover:bg-white/10"
              >
                Apple App Store
              </Button>
              <Button
                href={PLAY_STORE_URL}
                variant="light"
                size="sm"
                className="justify-center border-white/30 text-white hover:bg-white/10"
              >
                Google Play
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="section-pad bg-white">
        <div className="container-tsc max-w-4xl">
          <div className="text-center">
            <p className="eyebrow justify-center">Got Questions?</p>
            <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">Frequently Asked Questions</h2>
          </div>

          <div className="mt-10 divide-y divide-hairline rounded-md border border-hairline bg-cream/40">
            {FAQS.map((faq) => (
              <div key={faq.q} className="p-6">
                <h3 className="font-display text-base font-bold text-ink">{faq.q}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{faq.a}</p>
              </div>
            ))}
          </div>

          {/* CTA 7: Bottom Action */}
          <div className="mt-12 text-center">
            <Button href={OFFICIAL_URL} size="lg" arrow>
              Go to Official KonnectX Website
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
