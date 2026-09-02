import { Reveal } from '@/components/common/Reveal';
import { DemoChip } from '@/components/common/CategoryPill';
import { cn } from '@/lib/utils';

/** Consistent editorial header for inner pages. */
export function PageHeader({
  eyebrow,
  title,
  description,
  children,
  dark = false,
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  children?: React.ReactNode;
  dark?: boolean;
  className?: string;
}) {
  return (
    <section className={cn(dark ? 'bg-brand-dark text-white' : 'border-b border-hairline bg-white')}>
      <div className={cn('container-tsc pb-10 pt-28 sm:pt-32 lg:pt-36', className)}>
        <Reveal>
          <p className={cn('eyebrow', dark && '!text-gold')}>
            <span aria-hidden className="gold-dot" />
            {eyebrow}
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className={cn('mt-4 max-w-3xl font-display text-3xl font-bold leading-[1.08] tracking-tight sm:text-4xl lg:text-5xl', dark && 'text-white')}>
            {title}
          </h1>
        </Reveal>
        {description && (
          <Reveal delay={0.16}>
            <p className={cn('mt-5 max-w-2xl text-[15px] leading-7 text-muted sm:text-base sm:leading-8', dark && 'text-white/70')}>
              {description}
            </p>
          </Reveal>
        )}
        {children && (
          <Reveal delay={0.24}>
            <div className="mt-8">{children}</div>
          </Reveal>
        )}
      </div>
    </section>
  );
}

/** Demo-content notice used on detail pages. */
export function DemoNotice({ className }: { className?: string }) {
  return (
    <p className={cn('flex flex-wrap items-center gap-2 rounded-md border border-gold/40 bg-gold-50/60 px-4 py-3 text-xs leading-5 text-ink/70', className)}>
      <DemoChip />
      This is sample demo content for preview — not real TSC reporting. The editorial team publishes and
      replaces content via the admin panel.
    </p>
  );
}

/** Renders long-form paragraphs with editorial styling. */
export function ContentBody({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className="prose-tsc max-w-none">
      {paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}
