'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { Button } from '@/components/common/Button';
import { mainNav } from '@/lib/site';

/**
 * Mobile drawer — slides in from the right with a faded backdrop and
 * staggered link entrance. Includes Join TSC + Submit Your Story CTAs.
 */
export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] xl:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <motion.button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 h-full w-full bg-ink/50 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />
          <motion.aside
            className="absolute right-0 top-0 flex h-full w-[86vw] max-w-sm flex-col bg-cream shadow-lift"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 260 }}
          >
            <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
              <Logo compact={false} />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="flex h-10 w-10 items-center justify-center rounded-[4px] border border-hairline bg-white text-ink transition-colors hover:border-brand hover:text-brand"
              >
                <X aria-hidden className="h-5 w-5" />
              </button>
            </div>

            <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-5 py-6">
              <ul className="space-y-1">
                {mainNav.map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, x: 28 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06 + i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="flex items-center gap-2.5 rounded-sm px-2 py-2.5 font-display text-[15px] font-bold text-ink transition-colors hover:bg-brand-50 hover:text-brand"
                    >
                      <span aria-hidden className="h-1.5 w-1.5 rounded-[2px] bg-gold" />
                      {item.label}
                    </Link>
                    {item.children && (
                      <ul className="ml-[18px] border-l border-hairline pl-3">
                        {item.children.map((child) => (
                          <li key={child.href + child.label}>
                            <Link
                              href={child.href}
                              onClick={onClose}
                              className="block rounded-sm px-2 py-2 text-[13px] font-medium text-muted transition-colors hover:text-brand"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.li>
                ))}
              </ul>
            </nav>

            <div className="space-y-3 border-t border-hairline p-5">
              <Button href="/membership" variant="accent" size="md" className="w-full" arrow>
                Join TSC
              </Button>
              <Button href="/share-your-story" variant="outline" size="md" className="w-full" arrow>
                Submit Your Story
              </Button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
