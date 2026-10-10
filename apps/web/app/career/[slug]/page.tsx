import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Briefcase,
  Building2,
  CalendarDays,
  ChevronRight,
  GraduationCap,
  Home,
  MapPin,
  Split,
  Sprout,
  Wifi,
  ArrowLeft,
  Share2,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { CategoryPill } from '@/components/common/CategoryPill';
import { Button } from '@/components/common/Button';
import { OpportunityCard } from '@/components/cards/OpportunityCard';
import { getOpportunityBySlug, getOpportunities } from '@/lib/data';
import { daysUntil, formatDate, initialsOf } from '@/lib/utils';
import type { OpportunityType, WorkMode } from '@/types/content';

export const revalidate = 60;

export async function generateStaticParams() {
  const opps = await getOpportunities();
  return opps.slice(0, 30).map((o) => ({ slug: o.slug }));
}

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const opp = await getOpportunityBySlug(params.slug);
  if (!opp) return { title: 'Opportunity not found' };
  return {
    title: `${opp.title} at ${opp.organization} — Career`,
    description: opp.description,
    alternates: { canonical: `/career/${opp.slug}` },
  };
}

const typeVariant: Record<OpportunityType, 'brand' | 'gold' | 'ink' | 'outline'> = {
  Job: 'brand',
  Internship: 'gold',
  Fellowship: 'ink',
  Scholarship: 'outline',
  'Career Awareness': 'brand',
};

const modeIcon: Record<WorkMode, typeof Wifi> = {
  Remote: Wifi,
  Hybrid: Split,
  'On-site': Home,
};

export default async function OpportunitySlugPage({ params }: Props) {
  const opportunity = await getOpportunityBySlug(params.slug);
  if (!opportunity) notFound();

  const all = (await getOpportunities()).filter((o) => o.active);
  const related = all.filter((o) => o.id !== opportunity.id && o.type === opportunity.type).slice(0, 3);

  const days = daysUntil(opportunity.deadline);
  const isClosed = days < 0;
  const isSoon = days >= 0 && days <= 7;
  const ModeIcon = modeIcon[opportunity.mode];

  const targetApplicationUrl =
    opportunity.applicationUrl && opportunity.applicationUrl.trim().length > 0
      ? opportunity.applicationUrl
      : `https://www.google.com/search?q=${encodeURIComponent(
          `${opportunity.organization.replace(/\[Demo.*?\]/g, '').trim()} ${opportunity.title} careers apply`
        )}`;

  const paragraphs = opportunity.description
    ? opportunity.description.split(/\n\n+/).filter(Boolean)
    : [];

  return (
    <>
      <PageHeader
        compact
        eyebrow={`Career / ${opportunity.type}`}
        title={opportunity.title}
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium uppercase tracking-wider text-muted">
          <span className="inline-flex items-center gap-1">
            <Building2 aria-hidden className="h-3.5 w-3.5 text-brand" />
            {opportunity.organization}
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <MapPin aria-hidden className="h-3.5 w-3.5 text-brand" />
            {opportunity.location}
          </span>
          <CategoryPill variant={typeVariant[opportunity.type]}>
            {opportunity.type}
          </CategoryPill>
        </div>

        <nav aria-label="Breadcrumb" className="mt-6">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-muted">
            <li><Link href="/" className="hover:text-brand">Home</Link></li>
            <li aria-hidden><ChevronRight className="h-3 w-3" /></li>
            <li><Link href="/career" className="hover:text-brand">Career</Link></li>
            <li aria-hidden><ChevronRight className="h-3 w-3" /></li>
            <li className="text-ink/70" aria-current="page">{opportunity.title}</li>
          </ol>
        </nav>
      </PageHeader>

      <section className="section-pad">
        <div className="container-tsc max-w-7xl">
          {/* Back link */}
          <div className="mb-8">
            <Link
              href="/career"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to all opportunities</span>
            </Link>
          </div>

          <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
            {/* Main Content Area */}
            <div className="space-y-8 lg:col-span-8">
              {/* Highlight Card */}
              <div className="card-base rounded-2xl border border-hairline bg-white p-6 sm:p-8 shadow-card">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <span
                      aria-hidden
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-brand/20 bg-brand-50 font-display text-lg font-bold text-brand shadow-xs"
                    >
                      {initialsOf(opportunity.organization.replace(/\[Demo.*?\]/g, '').trim() || 'TSC')}
                    </span>
                    <div>
                      <h1 className="font-display text-2xl sm:text-3xl font-bold leading-tight text-ink">
                        {opportunity.title}
                      </h1>
                      <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-muted">
                        <Building2 aria-hidden className="h-4 w-4 shrink-0 text-brand" />
                        <span>{opportunity.organization}</span>
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-muted">
                        <MapPin aria-hidden className="h-3.5 w-3.5 shrink-0 text-brand" />
                        <span>{opportunity.location}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <CategoryPill variant={typeVariant[opportunity.type]}>
                      {opportunity.type}
                    </CategoryPill>
                    <span className="inline-flex items-center gap-1 rounded-full border border-hairline bg-cream px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                      <ModeIcon aria-hidden className="mr-1 h-3.5 w-3.5 text-brand" />
                      {opportunity.mode}
                    </span>
                  </div>
                </div>

                {/* Quick Info Grid */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5 rounded-xl border border-hairline bg-slate-50/70 p-4 text-xs">
                  <div className="flex items-start gap-2.5">
                    <GraduationCap className="h-4 w-4 shrink-0 text-brand mt-0.5" />
                    <div>
                      <span className="block font-bold uppercase tracking-wider text-muted text-[10px]">
                        Eligibility
                      </span>
                      <span className="mt-0.5 font-medium text-ink/90 text-[13px]">
                        {opportunity.eligibility}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <CalendarDays className="h-4 w-4 shrink-0 text-gold-deep mt-0.5" />
                    <div>
                      <span className="block font-bold uppercase tracking-wider text-muted text-[10px]">
                        Application Deadline
                      </span>
                      <span className="mt-0.5 font-medium text-ink/90 text-[13px]">
                        {formatDate(opportunity.deadline)} ({isClosed ? 'Closed' : `${days} days left`})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                {opportunity.skills && opportunity.skills.length > 0 && (
                  <div className="mt-8">
                    <h2 className="font-display text-xs font-bold uppercase tracking-[0.14em] text-muted mb-3">
                      Skills & Competencies
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {opportunity.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full border border-hairline bg-slate-50 px-3.5 py-1 text-xs font-medium text-ink/80"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Detailed Description */}
                <div className="mt-8 border-t border-hairline pt-6">
                  <h2 className="font-display text-xs font-bold uppercase tracking-[0.14em] text-brand mb-4">
                    Description & Opportunity Details
                  </h2>
                  <div className="space-y-4 font-serif text-[18px] sm:text-[19px] leading-[1.85] text-ink/90">
                    {paragraphs.length > 0 ? (
                      paragraphs.map((p, idx) => <p key={idx}>{p}</p>)
                    ) : (
                      <p>{opportunity.description}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Sidebar Action Card */}
            <aside className="space-y-6 lg:col-span-4 lg:sticky lg:top-24 lg:self-start">
              <div className="card-base p-6 text-center sm:text-left space-y-4">
                <h3 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-ink">
                  Apply for this role
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  Submit your application directly through the official hiring portal of {opportunity.organization}.
                </p>

                <Button
                  size="md"
                  variant="primary"
                  href={targetApplicationUrl}
                  arrow
                  className="w-full justify-center !py-3 shadow-md"
                  ariaLabel={`Quick apply for ${opportunity.title}`}
                >
                  Quick Apply Now
                </Button>


                <p className="text-[11px] text-muted text-center">
                  Deadline: <span className="font-bold text-ink">{formatDate(opportunity.deadline)}</span>
                </p>
              </div>

              {/* Hidden trigger card that opens popup if user opened via slug */}
              <div className="hidden">
                <OpportunityCard opportunity={opportunity} defaultOpen={true} />
              </div>
            </aside>
          </div>

          {/* Related Opportunities */}
          {related.length > 0 && (
            <div className="mt-16 border-t border-hairline pt-12">
              <h2 className="font-display text-xl font-bold tracking-tight">
                More {opportunity.type} Opportunities
              </h2>
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((o) => (
                  <OpportunityCard key={o.id} opportunity={o} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
