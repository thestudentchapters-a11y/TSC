import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const TICKER_ITEMS = [
  'Campus Updates',
  'Student Achievements',
  'Jobs & Internships',
  'Startup Stories',
  'Youth Events',
  'Education Updates',
];

/**
 * "WHAT'S HAPPENING NOW" — continuously auto-scrolling marquee.
 * Pure CSS animation (pauses on hover/focus); degrades gracefully
 * with prefers-reduced-motion via globals.css.
 */
export function AnimatedTicker() {
  const Row = ({ hidden }: { hidden?: boolean }) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden}>
      {TICKER_ITEMS.map((item, i) => (
        <span key={i} className="flex items-center">
          <span className="whitespace-nowrap px-5 text-[13px] font-medium tracking-wide text-white/85">
            {item}
          </span>
          <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-[2px] bg-gold" />
        </span>
      ))}
    </div>
  );

  return (
    <section aria-label="What's happening now" className="marquee relative z-10 bg-brand-dark">
      <div className="container-tsc flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:gap-6">
        <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-start">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-gold" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gold" />
            </span>
            <span className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-gold sm:text-xs">
              What&apos;s Happening Now
            </span>
          </div>
          <Link
            href="/news"
            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/80 transition-colors hover:text-gold sm:hidden"
          >
            View All <ArrowRight aria-hidden className="h-3 w-3" />
          </Link>
        </div>
        <div className="marquee-mask relative min-w-0 flex-1 overflow-hidden">
          <div className="marquee-track animate-marquee">
            <Row />
            <Row hidden />
          </div>
        </div>
        <Link
          href="/news"
          className="hidden shrink-0 items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white/85 transition-colors hover:text-gold sm:flex"
        >
          View All News <ArrowRight aria-hidden className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}
