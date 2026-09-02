import Link from 'next/link';
import { ShieldCheck, ShieldAlert, Fingerprint, Scale, ArrowRight } from 'lucide-react';
import { SectionHeading } from '@/components/common/SectionHeading';
import { StaggerGrid, StaggerItem } from '@/components/common/Reveal';
import { TextCTA } from '@/components/common/Button';

const TOPICS = [
  { icon: ShieldCheck, title: 'Student Rights', desc: 'Understand your rights within educational institutions.', href: '/legal-awareness?topic=Student%20Rights' },
  { icon: ShieldAlert, title: 'Cyber Safety', desc: 'Know what to do when things go wrong online.', href: '/legal-awareness?topic=Cyber%20Safety' },
  { icon: Fingerprint, title: 'Digital Rights', desc: 'Understand privacy, online identity and responsible digital participation.', href: '/legal-awareness?topic=Digital%20Rights' },
  { icon: Scale, title: 'Education Laws', desc: 'Simplified explainers on rules, regulations and policies affecting students.', href: '/legal-awareness?topic=Education%20Laws' },
];

export function LegalSection() {
  return (
    <section aria-label="Legal awareness" className="section-pad">
      <div className="container-tsc">
        <SectionHeading
          number="08"
          eyebrow="Know Your Rights"
          title="Because Knowing Your Rights Matters."
          description="Students encounter legal, digital and institutional situations every day — but understanding your rights isn't always easy. TSC's Legal Awareness section simplifies important legal topics and explains them in language students can actually understand."
        />

        <StaggerGrid className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TOPICS.map((t) => {
            const Icon = t.icon;
            return (
              <StaggerItem key={t.title}>
                <Link
                  href={t.href}
                  className="card-base card-hover group flex h-full flex-col p-6"
                >
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-[8px] bg-brand text-white transition-all duration-300 group-hover:rotate-[-6deg] group-hover:bg-gold group-hover:text-ink">
                    <Icon aria-hidden className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 font-display text-[15px] font-bold">{t.title}</h3>
                  <p className="mt-2 flex-1 text-[13.5px] leading-6 text-muted">{t.desc}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 font-display text-[11px] font-bold uppercase tracking-[0.14em] text-brand">
                    <span className="cta-underline">Learn More</span>
                    <ArrowRight aria-hidden className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerGrid>

        <div className="mt-10 flex flex-col gap-4 border-t border-hairline pt-8 sm:flex-row sm:items-center sm:justify-between">
          <TextCTA href="/legal-awareness">Explore Legal Awareness</TextCTA>
          <p className="text-xs italic text-muted">
            Content is for general awareness and does not constitute legal advice.
          </p>
        </div>
      </div>
    </section>
  );
}
