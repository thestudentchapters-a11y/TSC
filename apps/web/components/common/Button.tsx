import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'accent' | 'outline' | 'light' | 'ghost' | 'dark';
type Size = 'sm' | 'md' | 'lg';

const base =
  'group relative inline-flex items-center justify-center overflow-hidden rounded-[4px] font-display font-semibold uppercase tracking-[0.08em] transition-all duration-300 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50';

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-[11px]',
  md: 'px-6 py-3 text-xs sm:text-[13px]',
  lg: 'px-7 py-3.5 text-[13px] sm:text-sm',
};

const variants: Record<Variant, string> = {
  primary: 'bg-brand text-white shadow-card hover:bg-brand-dark hover:shadow-lift',
  accent: 'bg-gold text-ink shadow-card hover:bg-gold-deep hover:shadow-lift',
  outline: 'border border-ink/25 bg-transparent text-ink hover:border-brand hover:text-brand',
  light: 'border border-white/50 bg-transparent text-white hover:bg-white hover:text-brand-dark',
  ghost: 'text-brand hover:text-brand-dark',
  dark: 'bg-ink text-cream hover:bg-brand-dark',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  href?: string;
  variant?: Variant;
  size?: Size;
  arrow?: boolean;
  ariaLabel?: string;
}

/** Button with gold underline-grow + arrow slide micro-interactions. */
export function Button({
  children,
  href,
  variant = 'primary',
  size = 'md',
  arrow = false,
  ariaLabel,
  className,
  ...props
}: ButtonProps) {
  const cls = cn(base, sizes[size], variants[variant], className);
  const inner = (
    <>
      {/* gold underline sweep */}
      <span
        aria-hidden
        className={cn(
          'absolute bottom-0 left-0 h-[3px] w-full origin-left scale-x-0 bg-gold transition-transform duration-300 ease-out group-hover:scale-x-100',
          (variant === 'ghost' || variant === 'accent') && 'bg-ink/70'
        )}
      />
      <span className="relative z-10 inline-flex items-center gap-2">
        {children}
        {arrow && (
          <ArrowRight
            aria-hidden
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
          />
        )}
      </span>
    </>
  );

  if (href) {
    const external = href.startsWith('http');
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" aria-label={ariaLabel} className={cls} {...props}>
          {inner}
        </a>
      );
    }
    return (
      <Link href={href} aria-label={ariaLabel} className={cls} {...props}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" aria-label={ariaLabel} className={cls} {...props}>
      {inner}
    </button>
  );
}

/** Editorial text CTA with animated gold underline + arrow. */
export function TextCTA({
  children,
  href,
  className,
  dark = false,
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
  dark?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'group inline-flex items-center gap-2 font-display text-[13px] font-bold uppercase tracking-[0.14em]',
        dark ? 'text-gold hover:text-gold' : 'text-brand hover:text-brand-dark',
        className
      )}
    >
      <span className="cta-underline">{children}</span>
      <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
    </Link>
  );
}
