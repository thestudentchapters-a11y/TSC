'use client';

import React, { useState } from 'react';
import {
  Clock,
  ChevronDown,
  CheckCircle2,
  BookOpen,
  FileDown,
  Sparkles,
  Layers,
  Check,
  ListFilter,
  ExternalLink
} from 'lucide-react';
import type { AffairArticle } from '@/types/content';
import { Reveal } from '@/components/common/Reveal';

interface InteractiveEditionReaderProps {
  articles: AffairArticle[];
  pdfUrl?: string | null;
  editionSlug: string;
}

export function InteractiveEditionReader({ articles, pdfUrl, editionSlug }: InteractiveEditionReaderProps) {
  // Start with the first section open by default, or empty
  const [expanded, setExpanded] = useState<Record<number, boolean>>({
    0: true,
  });

  const targetPdfUrl = pdfUrl || `/current-affairs/${editionSlug}/pdf`;
  const downloadPdfUrl = pdfUrl || `/current-affairs/${editionSlug}/pdf?download=true`;

  const toggleSection = (index: number) => {
    setExpanded((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const expandAll = () => {
    const all: Record<number, boolean> = {};
    articles.forEach((_, idx) => {
      all[idx] = true;
    });
    setExpanded(all);
  };

  const collapseAll = () => {
    setExpanded({});
  };

  const handleJump = (index: number) => {
    setExpanded((prev) => ({
      ...prev,
      [index]: true,
    }));
    const el = document.getElementById(`section-${index}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const allOpen = articles.length > 0 && articles.every((_, idx) => expanded[idx]);

  return (
    <div className="space-y-8">
      {/* Quick Navigation Pills & Expand Controls */}
      <div className="rounded-xl border border-hairline bg-cream/60 p-4 sm:p-5 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <p className="font-display text-xs font-bold uppercase tracking-wider text-ink/70 flex items-center gap-1.5">
            <ListFilter className="h-3.5 w-3.5 text-brand" /> Jump to Section in this Edition:
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={allOpen ? collapseAll : expandAll}
              className="text-[11px] font-bold text-brand hover:text-brand-dark transition-colors px-2 py-1 rounded bg-brand/10 hover:bg-brand/15"
            >
              {allOpen ? 'Collapse All' : 'Expand All Sections'}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {articles.map((a, i) => (
            <button
              type="button"
              key={a.title}
              onClick={() => handleJump(i)}
              className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold transition-all ${
                expanded[i]
                  ? 'border-brand bg-brand text-white shadow-sm'
                  : 'border-hairline bg-white text-ink hover:border-brand/60 hover:text-brand'
              }`}
            >
              <span className={`font-bold ${expanded[i] ? 'text-gold' : 'text-gold-deep'}`}>
                0{i + 1}.
              </span>
              <span>{a.category}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Expandable Article Cards */}
      <div className="space-y-6">
        {articles.map((a, i) => {
          const isOpen = Boolean(expanded[i]);

          // Prepare bulleted content items
          const contentBullets =
            a.content && a.content.length > 0
              ? a.content
              : [
                  `Key Policy & Regulatory Context: This month's updates in ${a.category} establish new frameworks directly impacting student academics and campus transitions.`,
                  `Institutional & Real-world Implementation: Universities, industry leaders, and administrative boards are standardizing procedures to ensure transparent credit recognition and experiential training.`,
                  `Student & Career Outlook: Understanding these shifts provides students and competitive exam aspirants with a critical strategic edge in interviews, fellowships, and academic planning.`
                ];

          return (
            <Reveal key={a.title} delay={i * 0.04}>
              <article
                id={`section-${i}`}
                className={`card-base relative scroll-mt-28 transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? 'border-brand/40 shadow-md ring-1 ring-brand/10'
                    : 'hover:border-brand/30 hover:shadow-sm'
                }`}
              >
                {/* Clickable Card Header */}
                <button
                  type="button"
                  onClick={() => toggleSection(i)}
                  className="w-full text-left p-5 sm:p-6 flex flex-col gap-3 transition-colors hover:bg-cream/20 cursor-pointer"
                  aria-expanded={isOpen}
                >
                  {/* Top Meta Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 w-full">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded bg-gold font-display text-xs font-bold text-ink">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="rounded-full bg-brand/10 px-3 py-1 font-display text-[11px] font-bold uppercase tracking-wider text-brand">
                        {a.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted">
                        <Clock aria-hidden className="h-3.5 w-3.5 text-gold-deep" /> {a.readingTime} min read
                      </span>

                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full border transition-transform duration-300 ${
                          isOpen
                            ? 'rotate-180 bg-brand text-white border-brand'
                            : 'bg-cream text-ink/70 border-hairline'
                        }`}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </span>
                    </div>
                  </div>

                  {/* Headline */}
                  <h2 className="font-display text-lg sm:text-xl font-bold leading-snug text-ink pr-6">
                    {a.title}
                  </h2>

                  {/* Preview / Teaser when collapsed */}
                  {!isOpen && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 pt-1">
                      <p className="text-xs sm:text-[13px] text-muted line-clamp-2 sm:line-clamp-1 italic">
                        {a.summary}
                      </p>
                      <span className="shrink-0 text-[11px] font-bold text-brand uppercase tracking-wider underline underline-offset-4">
                        Tap to expand
                      </span>
                    </div>
                  )}
                </button>

                {/* Expanded Detailed Data (Bulleted Format) */}
                {isOpen && (
                  <div className="border-t border-hairline bg-white px-5 pb-7 pt-5 sm:px-8 space-y-6 animate-fadeIn">
                    {/* Executive Summary Callout Box */}
                    <div className="rounded-r-lg border-l-4 border-gold bg-gold/10 p-4 text-[13.5px] leading-relaxed text-ink/90">
                      <p className="font-semibold text-gold-deep uppercase tracking-wider text-[10px] mb-1">
                        Executive Summary
                      </p>
                      <p className="font-medium">{a.summary}</p>
                    </div>

                    {/* Key Takeaways & Highlights (Bulleted) */}
                    {a.keyPoints && a.keyPoints.length > 0 && (
                      <div className="rounded-xl border border-hairline bg-cream/40 p-4 sm:p-5">
                        <p className="mb-3 font-display text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Key Developments &amp; Takeaways:
                        </p>
                        <ul className="space-y-2.5 text-[13.5px] leading-relaxed text-ink/85">
                          {a.keyPoints.map((pt, idx) => (
                            <li key={idx} className="flex items-start gap-2.5">
                              <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                <Check className="h-2.5 w-2.5 stroke-[3]" />
                              </span>
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* In-Depth Detailed Breakdown (Bulleted Format) */}
                    <div className="rounded-xl border border-hairline/80 bg-white p-4 sm:p-5 shadow-sm">
                      <h3 className="font-display text-xs font-bold uppercase tracking-[0.14em] text-brand flex items-center gap-2 mb-4">
                        <BookOpen className="h-4 w-4" /> Comprehensive In-Depth Breakdown (Bulleted Analysis):
                      </h3>

                      <ul className="space-y-3.5 text-[14px] leading-relaxed text-ink/85 font-sans">
                        {contentBullets.map((p, pIdx) => (
                          <li key={pIdx} className="flex items-start gap-3 rounded-lg bg-cream/20 p-3 border border-hairline/60">
                            <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/10 font-display text-[10px] font-bold text-brand">
                              {pIdx + 1}
                            </span>
                            <span className="leading-6">{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </article>
            </Reveal>
          );
        })}
      </div>

      {/* Download / Open PDF Dossier Banner */}
      <div className="mt-10 rounded-xl border border-dashed border-brand/40 bg-brand-50/60 p-6 text-center sm:text-left sm:flex sm:items-center sm:justify-between gap-6">
        <div>
          <h3 className="font-display text-base font-bold text-brand flex items-center justify-center sm:justify-start gap-2">
            <FileDown className="h-4 w-4" /> Full Monthly Dossier (PDF)
          </h3>
          <p className="mt-1 text-xs text-muted">
            Read online in high-res format or download offline print-ready PDF with all 5 sections.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-wrap items-center justify-center sm:justify-end gap-2.5 shrink-0">
          <a
            href={targetPdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-base border border-brand/30 bg-white text-brand hover:bg-brand-50 inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg shadow-sm transition"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Open PDF in New Tab
          </a>

          <a
            href={downloadPdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-base btn-primary inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg shadow-sm transition"
          >
            <FileDown className="h-3.5 w-3.5" /> Download PDF
          </a>
        </div>
      </div>
    </div>
  );
}
