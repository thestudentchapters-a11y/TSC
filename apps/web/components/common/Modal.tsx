'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

/** 
 * Accessible modal with fade-scale entrance, locked background,
 * backdrop click protection (prevents accidental loss of work), and explicit close handling.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  wide = false,
  preventOutsideClose = true,
  preventEscapeClose = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
  preventOutsideClose?: boolean;
  preventEscapeClose?: boolean;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [shake, setShake] = useState(false);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !preventEscapeClose) {
        onCloseRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, preventEscapeClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (preventOutsideClose) {
      // Trigger subtle pulse/shake animation to alert editor that outside is disabled
      setShake(true);
      setTimeout(() => setShake(false), 400);
    } else {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div 
          className="fixed inset-0 z-[120] flex items-end justify-center p-4 sm:items-center select-none-modal"
          role="dialog" 
          aria-modal="true" 
          aria-label={title}
        >
          {/* Backdrop overlay disables and blocks all background interactions */}
          <motion.div
            aria-label="Backdrop"
            className={cn(
              "absolute inset-0 h-full w-full bg-ink/75 backdrop-blur-[4px] transition-all",
              preventOutsideClose ? "cursor-not-allowed" : "cursor-pointer"
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={
              shake
                ? {
                    opacity: 1,
                    y: 0,
                    scale: [1, 1.015, 0.99, 1.008, 1],
                    transition: { duration: 0.35 },
                  }
                : { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }
            }
            exit={{ opacity: 0, y: 20, scale: 0.98, transition: { duration: 0.2 } }}
            className={cn(
              'relative max-h-[90vh] w-full overflow-y-auto rounded-xl border border-hairline/80 bg-white shadow-2xl transition-shadow',
              shake ? 'ring-2 ring-brand/50 shadow-brand/20' : 'shadow-lift',
              wide ? 'max-w-4xl' : 'max-w-lg'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-hairline bg-white/95 px-6 py-4 backdrop-blur">
              <div className="flex items-center gap-2 min-w-0">
                <h2 className="font-display text-base font-bold text-ink truncate">{title}</h2>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                title="Close"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-hairline text-ink/70 transition-colors hover:border-brand hover:bg-brand/5 hover:text-brand"
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
