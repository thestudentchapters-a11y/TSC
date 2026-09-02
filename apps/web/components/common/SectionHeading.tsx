import { Reveal } from '@/components/common/Reveal';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  number?: string;
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  align?: 'left' | 'center';
  dark?: boolean;
  className?: string;
}

/** Editorial section heading: gold number badge, eyebrow, display title, gold rule. */
export function SectionHeading({
  number,
  eyebrow,
  title,
  description,
  align = 'left',
  dark = false,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn('max-w-3xl', align === 'center' && 'mx-auto text-center', className)}>
      <Reveal>
        <p className={cn('eyebrow', align === 'center' && 'justify-center')}>
          {number && (
            <span
              aria-hidden
              className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-[4px] bg-gold px-1.5 font-display text-[11px] font-bold tracking-normal text-ink"
            >
              {number}
            </span>
          )}
          <span className={dark ? 'text-gold' : undefined}>{eyebrow}</span>
        </p>
      </Reveal>
      <Reveal delay={0.08}>
        <h2
          className={cn(
            'mt-4 text-[1.75rem] font-bold leading-[1.1] tracking-tight sm:text-4xl lg:text-[2.6rem]',
            dark && 'text-white'
          )}
        >
          {title}
        </h2>
      </Reveal>
      {description && (
        <Reveal delay={0.16}>
          <p className={cn('mt-5 text-[15px] leading-7 text-muted sm:text-base sm:leading-8', dark && 'text-white/70')}>
            {description}
          </p>
        </Reveal>
      )}
      <Reveal delay={0.22}>
        <div className={cn('relative mt-7 h-px w-24', dark ? 'bg-white/25' : 'bg-hairline', align === 'center' && 'mx-auto')}>
          <span
            aria-hidden
            className={cn('absolute left-0 top-1/2 h-[3px] w-10 -translate-y-1/2 bg-gold', align === 'center' && 'left-1/2 -translate-x-1/2')}
          />
        </div>
      </Reveal>
    </div>
  );
}
