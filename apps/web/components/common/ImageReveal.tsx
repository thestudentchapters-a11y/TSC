'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * ImageReveal — a brand-colored curtain wipes away to reveal the photo
 * as it scrolls into view.
 */
export function ImageReveal({
  src,
  alt,
  className,
  imgClassName,
  curtain = 'brand',
  sizes = '(max-width: 768px) 100vw, 33vw',
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  curtain?: 'brand' | 'gold' | 'ink';
  sizes?: string;
  priority?: boolean;
}) {
  const reduce = useReducedMotion();
  const curtainColor =
    curtain === 'gold' ? 'bg-gold' : curtain === 'ink' ? 'bg-ink' : 'bg-brand';

  return (
    <div className={cn('relative overflow-hidden bg-hairline/40', className)}>
      <motion.div
        className="absolute inset-0"
        initial={reduce ? { opacity: 1 } : { scale: 1.08, opacity: 0.4 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 1.1, ease: EASE }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={cn('object-cover', imgClassName)}
        />
      </motion.div>
      <motion.div
        aria-hidden
        className={cn('absolute inset-0 z-10', curtainColor)}
        initial={{ scaleX: 1 }}
        whileInView={{ scaleX: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: reduce ? 0 : 0.85, ease: EASE, delay: 0.15 }}
        style={{ transformOrigin: 'right center' }}
      />
    </div>
  );
}
