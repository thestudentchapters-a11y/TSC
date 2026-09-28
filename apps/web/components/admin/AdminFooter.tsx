'use client';

import { Heart } from 'lucide-react';

/**
 * Minimal admin footer strip.
 * Matches official TSC branding with copyright and creator attribution.
 */
export function AdminFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="shrink-0 border-t border-white/10 bg-brand-dark text-cream/90 z-20">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-8 py-3.5 text-xs">
        <p className="font-medium text-cream/90 text-center sm:text-left">
          © {year} THE STUDENT CHAPTERS™. All rights reserved.
        </p>
        <a
          href="https://kynyx.com"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-center gap-1.5 font-medium text-cream/90 transition-colors hover:text-gold"
        >
          <span>Made with</span>
          <Heart
            className="h-3.5 w-3.5 fill-rose-500 text-rose-500 inline transition-transform duration-200 group-hover:scale-125"
            aria-hidden="true"
          />
          <span>By</span>
          <span className="font-bold text-gold group-hover:text-white group-hover:underline underline-offset-4">
            KYNYX SOLUTIONS.
          </span>
        </a>
      </div>
    </footer>
  );
}
