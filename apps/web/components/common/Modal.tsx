'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Accessible modal with fade-scale entrance, backdrop and Esc handling. */
export function Modal({
  open,
  onClose,
  title,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCloseRef.current();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[120] flex items-end justify-center p-4 sm:items-center" role="dialog" aria-modal="true" aria-label={title}>
          <motion.button
            type="button"
            aria-label="Close dialog"
            className="absolute inset-0 h-full w-full bg-ink/60 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'relative max-h-[88vh] w-full overflow-y-auto rounded-md border border-hairline bg-white shadow-lift',
              wide ? 'max-w-2xl' : 'max-w-lg'
            )}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-hairline bg-white/95 px-6 py-4 backdrop-blur">
              <h2 className="font-display text-base font-bold">{title}</h2>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-hairline text-ink/70 transition-colors hover:border-brand hover:text-brand"
              >
                <X aria-hidden className="h-4 w-4" />
              </button>
            </div>
            <div className="px-6 py-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
