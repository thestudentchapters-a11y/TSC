import Link from 'next/link';
import { cn } from '@/lib/utils';

type PillVariant = 'brand' | 'gold' | 'ink' | 'outline' | 'light';

const variants: Record<PillVariant, string> = {
  brand: 'border-brand/25 bg-brand-50 text-brand',
  gold: 'border-gold/40 bg-gold-50 text-gold-deep',
  ink: 'border-ink/20 bg-ink text-cream',
  outline: 'border-hairline bg-white text-muted',
  light: 'border-white/30 bg-white/10 text-white',
};

/** Small uppercase category pill used across cards and listings. */
export function CategoryPill({
  children,
  variant = 'brand',
  href,
  className,
}: {
  children: React.ReactNode;
  variant?: PillVariant;
  href?: string;
  className?: string;
}) {
  const cls = cn(
    'inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors',
    variants[variant],
    href && 'hover:border-gold hover:text-gold-deep',
    className
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return <span className={cls}>{children}</span>;
}

/** Small DEMO chip marking seeded sample content. */
export function DemoChip({ className }: { className?: string }) {
  return (
    <span
      title="Demo content — replace via the admin panel"
      className={cn(
        'inline-flex items-center rounded-full border border-gold/50 bg-gold-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-gold-deep',
        className
      )}
    >
      Demo
    </span>
  );
}
