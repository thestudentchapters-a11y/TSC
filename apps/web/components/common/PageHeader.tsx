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

/** Demo-content notice — disabled for production. */
export function DemoNotice({ className }: { className?: string }) {
  return null;
}

/** Renders long-form editorial content and rich HTML styling. */
export function ContentBody({ paragraphs }: { paragraphs?: string[] | string }) {
  if (!paragraphs) return null;

  if (typeof paragraphs === 'string') {
    if (/<[a-z][\s\S]*>/i.test(paragraphs)) {
      return (
        <div
          className="prose-tsc max-w-none font-serif text-[17px] sm:text-[18px] leading-8 text-ink/90 space-y-4
            [&_h2]:font-display [&_h2]:font-bold [&_h2]:text-2xl sm:[&_h2]:text-3xl [&_h2]:text-brand-dark [&_h2]:mt-8 [&_h2]:mb-4
            [&_h3]:font-display [&_h3]:font-bold [&_h3]:text-xl sm:[&_h3]:text-2xl [&_h3]:text-brand-dark [&_h3]:mt-6 [&_h3]:mb-3
            [&_p]:my-4 [&_p]:leading-8
            [&_a]:text-brand [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-brand-dark
            [&_blockquote]:border-l-4 [&_blockquote]:border-gold [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-ink/80 [&_blockquote]:my-6
            [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4 [&_li]:my-1.5
            [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-4 [&_li]:my-1.5
            [&_img]:rounded-xl [&_img]:shadow-md [&_img]:my-4 [&_img]:max-h-[540px] [&_img]:object-cover
            [&_figure]:my-6 [&_figcaption]:mt-2 [&_figcaption]:text-center [&_figcaption]:text-xs [&_figcaption]:italic [&_figcaption]:text-muted
            [&_hr]:my-8 [&_hr]:border-hairline"
          dangerouslySetInnerHTML={{ __html: paragraphs }}
        />
      );
    }
    const lines = paragraphs.split(/\n\n+/).filter(Boolean);
    return (
      <div className="prose-tsc max-w-none space-y-4 font-serif text-[17px] sm:text-[18px] leading-8 text-ink/90">
        {lines.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    );
  }

  if (Array.isArray(paragraphs)) {
    return (
      <div className="prose-tsc max-w-none space-y-4 font-serif text-[17px] sm:text-[18px] leading-8 text-ink/90">
        {paragraphs.map((p, i) => {
          if (typeof p === 'string' && /<[a-z][\s\S]*>/i.test(p)) {
            return (
              <div
                key={i}
                className="[&_a]:text-brand [&_a]:underline [&_img]:rounded-xl [&_img]:my-4 [&_figure]:my-6"
                dangerouslySetInnerHTML={{ __html: p }}
              />
            );
          }
          return <p key={i}>{p}</p>;
        })}
      </div>
    );
  }

  return null;
}
