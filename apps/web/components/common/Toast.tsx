'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastVariant = 'success' | 'error' | 'info';
interface ToastItem { id: number; message: string; variant: ToastVariant }

const ToastContext = createContext<{ push: (message: string, variant?: ToastVariant) => void }>({
  push: () => undefined,
});

export function useToast() {
  return useContext(ToastContext);
}

/** Slide-in toasts for form feedback and actions. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, variant }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed bottom-5 right-4 z-[130] flex w-[calc(100vw-32px)] max-w-sm flex-col gap-2.5 sm:right-6">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 70 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              role="status"
              className={cn(
                'pointer-events-auto flex items-start gap-3 rounded-md border bg-white p-4 shadow-lift',
                t.variant === 'error' ? 'border-red-200' : t.variant === 'success' ? 'border-gold/50' : 'border-brand/25'
              )}
            >
              <span aria-hidden className="mt-0.5 shrink-0">
                {t.variant === 'success' ? (
                  <CheckCircle2 className="h-5 w-5 text-gold-deep" />
                ) : t.variant === 'error' ? (
                  <XCircle className="h-5 w-5 text-red-600" />
                ) : (
                  <Info className="h-5 w-5 text-brand" />
                )}
              </span>
              <p className="text-sm font-medium leading-6 text-ink">{t.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
