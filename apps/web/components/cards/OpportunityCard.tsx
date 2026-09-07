'use client';

import { useState } from 'react';
import {
  Briefcase, Building2, CalendarDays, GraduationCap, MapPin, Wifi, Home, Split, Sprout,
} from 'lucide-react';
import { CategoryPill } from '@/components/common/CategoryPill';
import { Button } from '@/components/common/Button';
import { ApplyOpportunityModal } from '@/components/career/ApplyOpportunityModal';
import type { Opportunity, OpportunityType, WorkMode } from '@/types/content';
import { cn, daysUntil, formatDate, initialsOf } from '@/lib/utils';

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

/** Opportunity card — org block, deadline badge, location, type tag, skills. */
export function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const [applyOpen, setApplyOpen] = useState(false);
  const days = daysUntil(opportunity.deadline);
  const ModeIcon = modeIcon[opportunity.mode];
  const soon = days >= 0 && days <= 7;

  return (
    <>
      <article className="card-base card-hover group flex h-full flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3 min-h-[3.25rem]">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span
              aria-hidden
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[6px] border border-brand/20 bg-brand-50 font-display text-sm font-bold text-brand"
            >
              {initialsOf(opportunity.organization.replace(/\[Demo.*?\]/g, '').trim() || 'TSC')}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-[16px] font-bold leading-snug transition-colors group-hover:text-brand line-clamp-2 min-h-[2.5rem]">
                {opportunity.title}
              </h3>
              <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-muted truncate">
                <Building2 aria-hidden className="h-3 w-3 shrink-0" />
                <span className="truncate">{opportunity.organization}</span>
              </p>
            </div>
          </div>
          <span
            className={cn(
              'flex shrink-0 flex-col items-center rounded-[6px] border px-2.5 py-1.5',
              soon ? 'border-gold/60 bg-gold-50' : 'border-hairline bg-cream'
            )}
          >
            <span className={cn('font-display text-sm font-bold leading-none', soon ? 'text-gold-deep' : 'text-ink')}>
              {days >= 0 ? `${days}` : '—'}
            </span>
            <span className="mt-1 text-[9px] font-bold uppercase tracking-wider text-muted">
              {days >= 0 ? 'days left' : 'closed'}
            </span>
          </span>
        </div>

        <div className="flex min-h-[1.75rem] flex-wrap items-center gap-2">
          <CategoryPill variant={typeVariant[opportunity.type]}>
            {opportunity.type === 'Career Awareness' ? (
              <Sprout aria-hidden className="mr-1 h-3 w-3" />
            ) : (
              <Briefcase aria-hidden className="mr-1 h-3 w-3" />
            )}
            {opportunity.type}
          </CategoryPill>
          <span className="inline-flex items-center gap-1 rounded-full border border-hairline bg-cream px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
            <ModeIcon aria-hidden className="mr-1 h-3 w-3 text-brand" />
            {opportunity.mode}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted truncate">
            <MapPin aria-hidden className="h-3.5 w-3.5 shrink-0 text-brand" />
            <span className="truncate">{opportunity.location}</span>
          </span>
        </div>

        <p className="line-clamp-2 text-sm leading-6 text-muted min-h-[3rem]">{opportunity.description}</p>

        <div className="flex h-[1.75rem] min-h-[1.75rem] flex-wrap gap-1.5 overflow-hidden">
          {opportunity.skills.slice(0, 4).map((s) => (
            <span key={s} className="rounded-full border border-hairline bg-white px-2.5 py-0.5 text-[11px] font-medium text-ink/70">
              {s}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-hairline pt-4">
          <p className="flex flex-col gap-0.5 text-[11px] leading-4 text-muted min-w-0 flex-1">
            <span className="inline-flex items-center gap-1 truncate">
              <GraduationCap aria-hidden className="h-3 w-3 shrink-0 text-brand" />
              <span className="truncate">{opportunity.eligibility}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays aria-hidden className="h-3 w-3 shrink-0 text-gold-deep" />
              Deadline: {formatDate(opportunity.deadline)}
            </span>
          </p>
          <Button
            size="sm"
            variant="primary"
            arrow
            onClick={() => setApplyOpen(true)}
            className="shrink-0"
          >
            Quick Apply
          </Button>
        </div>
      </article>

      <ApplyOpportunityModal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        opportunity={opportunity}
      />
    </>
  );
}
