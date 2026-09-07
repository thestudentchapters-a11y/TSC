import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ExternalLink,
  GraduationCap,
  School,
  Building2,
  CreditCard,
  Award,
  BarChart3,
  Search,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BookOpen,
  Compass,
  FileCheck,
  ShieldCheck,
  Globe,
  HelpCircle,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/common/Button';
import { Reveal, StaggerGrid, StaggerItem } from '@/components/common/Reveal';

export const metadata: Metadata = {
  title: 'MyTAG App — College, University & School Admission EdTech Portal',
  description:
    'TAG e-Career Counseling, streamlined applications, transparent fee payments, scholarship discovery, and college rank predictors — all in one centralized student portal.',
  alternates: { canonical: '/mytagapp' },
};

const OFFICIAL_URL = 'https://mytagapp.com/';

const PILLARS = [
  {
    icon: School,
    badge: 'Admissions',
    title: 'Centralized College & School Admissions',
    desc: 'One common platform to discover, compare, and apply to top schools, colleges, and universities across India with an effortless online admission workflow.',
  },
  {
    icon: Compass,
    badge: 'e-Counseling',
    title: 'TAG e-Career Counseling',
    desc: 'Personalized guidance, stream selector tools, and expert counseling to help students choose the right course and career pathway suited to their true strengths.',
  },
  {
    icon: BarChart3,
    badge: 'Smart Predictor',
    title: 'College & Rank Seat Predictor',
    desc: 'Enter your exam percentiles and scores (CUET, JEE, NEET, state boards) to accurately predict eligible colleges, cut-offs, and available seats.',
  },
  {
    icon: CreditCard,
    badge: 'Security',
    title: 'Secure Fee Payment Gateway',
    desc: 'Pay academic fees, admission tokens, and examination charges safely with instant digital receipts and milestone-based installment options.',
  },
  {
    icon: Award,
    badge: 'Financial Aid',
    title: 'Scholarship Schemes & Fee Waivers',
    desc: 'Direct access to government schemes, merit-based institutional scholarships, and tuition assistance programs to ensure education remains accessible.',
  },
  {
    icon: FileCheck,
    badge: 'Comparison',
    title: 'Side-by-Side Institution Comparison',
    desc: 'Compare colleges on NIRF rankings, infrastructure ratings, faculty credentials, placement statistics, and real alumni reviews before applying.',
  },
];

const METRICS = [
  { label: 'Institutions', value: '1,000+', desc: 'Schools, Colleges & Universities' },
  { label: 'Courses & Degrees', value: '500+', desc: 'Engineering, Medical, Arts & Commerce' },
  { label: 'Scholarships', value: '₹5 Cr+', desc: 'In eligible grants & fee waivers' },
  { label: 'Platform Type', value: 'Common EdTech', desc: 'Centralized single-window access' },
];

const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Explore & Compare',
    desc: 'Browse verified profiles of top schools, colleges, and professional universities with transparent fee and placement data.',
  },
  {
    step: '02',
    title: 'TAG e-Counseling',
    desc: 'Get expert counseling and run the rank predictor to zero in on the best stream and courses for your career goals.',
  },
  {
    step: '03',
    title: 'Single-Window Apply',
    desc: 'Fill one unified application form and submit documents directly to multiple chosen institutions simultaneously.',
  },
  {
    step: '04',
    title: 'Secure Admission & Fees',
    desc: 'Receive confirmed admission offers, claim merit scholarships, and complete fee payments through the secure gateway.',
  },
];

const FAQS = [
  {
    q: 'What is MyTAG App?',
    a: 'MyTAG App is a common EdTech and admission portal connecting students, parents, schools, and colleges. It streamlines counseling, institutional comparison, applications, fee payment, and scholarship matching.',
  },
  {
    q: 'How does TAG e-Career Counseling work?',
    a: 'TAG e-Career Counseling provides structured assessments, aptitude matching, course advisory, and direct counselor interaction to guide students through school-to-college and degree transitions.',
  },
  {
    q: 'Can I apply to multiple colleges with one form?',
    a: 'Yes! MyTAG App is designed as a centralized platform where you can apply to multiple partner colleges and schools without repeatedly filling separate application forms.',
  },
  {
    q: 'Is the fee payment gateway secure on MyTAG App?',
    a: 'Yes, MyTAG App integrates encrypted, bank-grade payment gateways that provide instant digital receipts and payment verification directly tied to your admission record.',
  },
];

export default function MyTagAppPage() {
  return (
    <>
      <PageHeader
        eyebrow="Ecosystem Partner • EdTech & Admissions"
        title="MyTAG App — Admission EdTech Portal & e-Career Counseling."
        description="A common platform for students, schools & colleges. Easy application & admission process, secure fee payments, scholarship schemes, side-by-side college comparison, and rank predictors."
      >
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* CTA 1: Official Portal */}
          <Button href={OFFICIAL_URL} size="md" arrow>
            <Globe aria-hidden className="h-4 w-4" /> Visit mytagapp.com
          </Button>

          {/* CTA 2: Explore Colleges */}
          <Button href={OFFICIAL_URL} variant="accent" size="md">
            <School aria-hidden className="h-4 w-4" /> Explore Colleges &amp; Schools
          </Button>

          {/* CTA 3: e-Career Counseling */}
          <Button href={OFFICIAL_URL} variant="outline" size="md">
            <Compass aria-hidden className="h-4 w-4" /> TAG e-Career Counseling
          </Button>

          {/* CTA 4: Scholarships */}
          <Button href={OFFICIAL_URL} variant="outline" size="md">
            <Award aria-hidden className="h-4 w-4" /> Scholarship Scheme
          </Button>
        </div>
      </PageHeader>

      {/* Metrics Bar */}
      <section className="border-b border-hairline bg-white py-10">
        <div className="container-tsc grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {METRICS.map((m, i) => (
            <Reveal key={m.label} delay={i * 0.08}>
              <div className="rounded-md border border-hairline bg-cream p-5">
                <p className="font-display text-xs font-bold uppercase tracking-wider text-muted">{m.label}</p>
                <p className="mt-1 font-display text-2xl font-bold text-brand">{m.value}</p>
                <p className="mt-1 text-xs text-ink/70">{m.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="section-pad">
        <div className="container-tsc">
          <div className="max-w-3xl">
            <p className="eyebrow">Smart Admissions. Clear Direction.</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Everything You Need to Navigate Your College &amp; School Admissions.
            </h2>
            <p className="mt-3 text-[15px] leading-7 text-muted">
              From choosing your stream after high school to securing seats in premier universities, MyTAG App provides
              a comprehensive, transparent, single-window admission ecosystem.
            </p>
          </div>

          <StaggerGrid className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PILLARS.map((p) => {
              const Icon = p.icon;
              return (
                <StaggerItem key={p.title}>
                  <div className="card-base card-hover group flex h-full flex-col justify-between p-6">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="flex h-12 w-12 items-center justify-center rounded-[8px] bg-brand-50 text-brand transition-all duration-300 group-hover:bg-brand group-hover:text-white">
                          <Icon aria-hidden className="h-6 w-6" />
                        </span>
                        <span className="rounded-full border border-hairline bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold-deep">
                          {p.badge}
                        </span>
                      </div>
                      <h3 className="mt-5 font-display text-lg font-bold min-h-[1.75rem]">{p.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted">{p.desc}</p>
                    </div>
                    <div className="mt-6 border-t border-hairline pt-4">
                      <a
                        href={OFFICIAL_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cta-underline inline-flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-[0.14em] text-brand"
                      >
                        Explore on MyTAG App <ExternalLink aria-hidden className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerGrid>
        </div>
      </section>

      {/* Step by Step Admission Flow */}
      <section className="bg-cream/60 section-pad border-y border-hairline">
        <div className="container-tsc">
          <div className="text-center max-w-2xl mx-auto">
            <p className="eyebrow justify-center">Simple 4-Step Process</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              How MyTAG App Works for You
            </h2>
            <p className="mt-3 text-sm text-muted">
              Say goodbye to multiple college counters, physical queues, and confusing admission procedures.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((step) => (
              <div key={step.step} className="card-base p-6 flex flex-col justify-between">
                <div>
                  <span className="font-display text-3xl font-bold text-gold-deep">{step.step}</span>
                  <h3 className="mt-4 font-display text-base font-bold">{step.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-muted">{step.desc}</p>
                </div>
                <div className="mt-6 pt-3 border-t border-hairline">
                  <span className="text-[11px] font-semibold text-brand inline-flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-gold-deep" /> Verified Step
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* High-Impact CTA Banner */}
      <section className="bg-brand-dark py-16 text-white">
        <div className="container-tsc grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="space-y-4 lg:col-span-7">
            <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-gold">
              Admissions Portal
            </span>
            <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Take the Guesswork Out of Admissions. <br />
              <span className="text-gold">Find Your Ideal School or College.</span>
            </h2>
            <p className="text-[15px] leading-7 text-white/80">
              Access real-time seat availability, predictive rank matching, scholarship eligibility, and verified
              institution profiles in one unified portal.
            </p>
            <ul className="grid gap-2.5 pt-2 text-sm text-white/90 sm:grid-cols-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-gold" /> Zero hidden fees or commissions
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-gold" /> Direct university integration
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-gold" /> Verified counselor assistance
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-gold" /> Scholarship eligibility checker
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-white/15 bg-white/[0.05] p-8 lg:col-span-5">
            <h3 className="font-display text-xl font-bold text-white">Start Your Application</h3>
            <p className="text-xs leading-5 text-white/70">
              Explore thousands of accredited courses and colleges or speak with an e-counselor on MyTAG App.
            </p>

            {/* CTA 5: Web Portal Action */}
            <Button
              href={OFFICIAL_URL}
              variant="accent"
              size="lg"
              arrow
              className="w-full justify-center"
            >
              <Globe className="h-4 w-4" /> Open MyTAG App Portal
            </Button>

            {/* CTA 6: Direct Application CTA */}
            <Button
              href={OFFICIAL_URL}
              variant="light"
              size="md"
              className="w-full justify-center border-white/30 text-white hover:bg-white/10"
            >
              <Search className="mr-1.5 h-4 w-4" /> Search Colleges &amp; Courses
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="section-pad bg-white">
        <div className="container-tsc max-w-4xl">
          <div className="text-center">
            <p className="eyebrow justify-center">Answers &amp; Clarity</p>
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
              Go to Official MyTAG App Website
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
