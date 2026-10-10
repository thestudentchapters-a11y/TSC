'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Briefcase,
  Building2,
  CalendarDays,
  Check,
  ExternalLink,
  GraduationCap,
  Home,
  MapPin,
  Share2,
  Split,
  Sprout,
  Wifi,
  X,
  Clock,
  Sparkles,
} from 'lucide-react';
import { CategoryPill } from '@/components/common/CategoryPill';
import { Button } from '@/components/common/Button';
import type { Opportunity, OpportunityType, WorkMode } from '@/types/content';
import { cn, daysUntil, formatDate, initialsOf } from '@/lib/utils';

interface OpportunityDetailModalProps {
  opportunity: Opportunity | null;
  isOpen: boolean;
  onClose: () => void;
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

export function OpportunityDetailModal({
  opportunity,
  isOpen,
  onClose,
}: OpportunityDetailModalProps) {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!mounted || !isOpen || !opportunity) return null;

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

  const handleCopyLink = () => {
    const slugUrl = `${window.location.origin}/career/${opportunity.slug}`;
    navigator.clipboard.writeText(slugUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const paragraphs = opportunity.description
    ? opportunity.description.split(/\n\n+/).filter(Boolean)
    : [];

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-opp-title"
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-3 sm:p-6 pt-20 sm:pt-24 md:pt-28 pb-4 sm:pb-8"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        className="relative z-10 flex max-h-[calc(100dvh-6.5rem)] sm:max-h-[calc(100dvh-8.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-hairline bg-white shadow-2xl animate-in zoom-in-95 duration-200 sm:translate-y-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Modal Header */}
        <div className="flex items-center justify-between border-b border-hairline bg-slate-50/80 px-6 py-4 backdrop-blur-xs">
          <div className="flex items-center gap-2">
            <CategoryPill variant={typeVariant[opportunity.type]}>
              {opportunity.type === 'Career Awareness' ? (
                <Sprout aria-hidden className="mr-1 h-3.5 w-3.5" />
              ) : (
                <Briefcase aria-hidden className="mr-1 h-3.5 w-3.5" />
              )}
              {opportunity.type}
            </CategoryPill>
            <span className="inline-flex items-center gap-1 rounded-full border border-hairline bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-muted">
              <ModeIcon aria-hidden className="mr-1 h-3.5 w-3.5 text-brand" />
              {opportunity.mode}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              title="Copy link to opportunity"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-hairline bg-white px-3 text-xs font-semibold text-muted transition-colors hover:border-brand/40 hover:text-brand"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-green-600" />
                  <span className="text-green-600 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Share</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close details"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-hairline bg-white text-muted transition-colors hover:bg-slate-100 hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 space-y-7">
          {/* Main Title & Org Hero */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <span
                aria-hidden
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-brand/20 bg-brand-50 font-display text-lg font-bold text-brand shadow-xs"
              >
                {initialsOf(opportunity.organization.replace(/\[Demo.*?\]/g, '').trim() || 'TSC')}
              </span>
              <div>
                <h2
                  id="modal-opp-title"
                  className="font-display text-xl sm:text-2xl font-bold leading-tight text-ink"
                >
                  {opportunity.title}
                </h2>
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

            {/* Deadline Status Badge */}
            <div
              className={cn(
                'inline-flex sm:self-start shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold',
                isClosed
                  ? 'border-slate-200 bg-slate-100 text-muted'
                  : isSoon
                    ? 'border-gold/60 bg-gold-50 text-gold-deep'
                    : 'border-brand/20 bg-brand-50 text-brand'
              )}
            >
              <CalendarDays className="h-4 w-4" />
              <span>
                {isClosed ? 'Applications Closed' : `${days} days left`}
              </span>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 rounded-xl border border-hairline bg-slate-50/70 p-4 text-xs">
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
                  {formatDate(opportunity.deadline)}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <ModeIcon className="h-4 w-4 shrink-0 text-brand mt-0.5" />
              <div>
                <span className="block font-bold uppercase tracking-wider text-muted text-[10px]">
                  Work Arrangement
                </span>
                <span className="mt-0.5 font-medium text-ink/90 text-[13px]">
                  {opportunity.mode} • {opportunity.location}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Clock className="h-4 w-4 shrink-0 text-muted mt-0.5" />
              <div>
                <span className="block font-bold uppercase tracking-wider text-muted text-[10px]">
                  Posted Date
                </span>
                <span className="mt-0.5 font-medium text-ink/90 text-[13px]">
                  {formatDate(opportunity.postedOn)}
                </span>
              </div>
            </div>
          </div>

          {/* Skills Required */}
          {opportunity.skills && opportunity.skills.length > 0 && (
            <div>
              <h3 className="font-display text-xs font-bold uppercase tracking-[0.14em] text-muted mb-3 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-brand" />
                <span>Skills & Competencies</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {opportunity.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-hairline bg-white px-3 py-1 text-xs font-medium text-ink/80 shadow-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Full Detailed Description */}
          <div>
            <h3 className="font-display text-xs font-bold uppercase tracking-[0.14em] text-brand mb-3">
              Description & Details
            </h3>
            <div className="rounded-xl border border-hairline bg-white p-5 sm:p-6 shadow-xs space-y-4 font-serif text-[17px] sm:text-[18px] leading-[1.8] text-ink/90">
              {paragraphs.length > 0 ? (
                paragraphs.map((p, idx) => <p key={idx}>{p}</p>)
              ) : (
                <p>{opportunity.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-hairline bg-slate-50/90 px-6 py-4">
          <p className="text-xs text-muted">
            <span className="font-bold">Deadline:</span> {formatDate(opportunity.deadline)}
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-hairline bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-ink/70 hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
            <Button
              size="md"
              variant="primary"
              href={targetApplicationUrl}
              arrow
              className="!px-6 !py-2.5 shadow-md"
              ariaLabel={`Quick apply for ${opportunity.title}`}
            >
              Quick Apply
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
