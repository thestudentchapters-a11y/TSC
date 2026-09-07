import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface LogoProps {
  dark?: boolean;
  compact?: boolean;
  className?: string;
  imageClassName?: string;
}

/** TSC Logo — renders the official logo image from the public folder. */
export function Logo({ dark = false, compact = false, className = '', imageClassName = '' }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="THE STUDENT CHAPTERS™ — Home"
      className={cn('group inline-flex shrink-0 items-center transition-opacity hover:opacity-95', className)}
    >
      <div
        className={cn(
          'relative flex items-center justify-center transition-all duration-300',
          dark ? 'rounded-lg bg-white/95 p-1.5 shadow-sm ring-1 ring-white/20' : ''
        )}
      >
        <Image
          src="/TSC%20Logo.png"
          alt="The Student Chapters™"
          width={160}
          height={108}
          priority
          className={cn(
            'h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105 sm:h-12',
            dark && 'h-9 sm:h-10',
            compact && 'h-8 sm:h-9',
            imageClassName
          )}
        />
      </div>
    </Link>
  );
}

