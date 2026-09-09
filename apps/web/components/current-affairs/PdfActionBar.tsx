'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Printer, FileDown } from 'lucide-react';

interface PdfActionBarProps {
  title: string;
  editionSlug: string;
  autoPrint?: boolean;
}

export function PdfActionBar({ title, editionSlug, autoPrint }: PdfActionBarProps) {
  useEffect(() => {
    if (autoPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [autoPrint]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 px-3 sm:px-8 py-3 backdrop-blur-md shadow-sm print:hidden">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <Link
          href={`/current-affairs/${editionSlug}`}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-brand shrink-0"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Back to Edition</span>
          <span className="sm:hidden">Back</span>
        </Link>
        <span className="hidden md:inline font-display text-sm font-bold text-slate-800 truncate">
          {title} — Printable Dossier
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 sm:px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-brand hover:text-brand"
        >
          <Printer className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Print Dossier</span>
          <span className="sm:hidden">Print</span>
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 sm:px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand-dark"
        >
          <FileDown className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Save / Download PDF</span>
          <span className="sm:hidden">Save PDF</span>
        </button>
      </div>
    </header>
  );
}
