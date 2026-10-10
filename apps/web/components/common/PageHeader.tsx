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
  titleClassName,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  children?: React.ReactNode;
  dark?: boolean;
  className?: string;
  titleClassName?: string;
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
          <h1 className={cn('mt-4 font-display text-3xl font-bold leading-[1.08] tracking-tight sm:text-4xl lg:text-5xl', dark && 'text-white', titleClassName || 'max-w-3xl')}>
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
          className="prose-tsc max-w-none font-serif text-[18px] sm:text-[20px] leading-[1.85] text-ink/90 space-y-5
            [&_h2]:font-merriweather [&_h2]:font-bold [&_h2]:text-[26px] sm:[&_h2]:text-[32px] [&_h2]:text-brand-dark [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:leading-snug
            [&_h3]:font-merriweather [&_h3]:font-bold [&_h3]:text-[22px] sm:[&_h3]:text-[26px] [&_h3]:text-brand-dark [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:leading-snug
            [&_p]:my-5 [&_p]:text-[18px] sm:[&_p]:text-[20px] [&_p]:leading-[1.85]
            [&_a]:text-brand [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-brand-dark
            [&_blockquote]:border-l-4 [&_blockquote]:border-gold [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-ink/80 [&_blockquote]:my-6 [&_blockquote]:text-[19px] sm:[&_blockquote]:text-[21px] [&_blockquote]:leading-relaxed
            [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-5 [&_li]:my-2 [&_li]:text-[18px] sm:[&_li]:text-[20px] [&_li]:leading-[1.85]
            [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-5 [&_li]:my-2 [&_li]:text-[18px] sm:[&_li]:text-[20px] [&_li]:leading-[1.85]
            [&_img]:rounded-xl [&_img]:shadow-md [&_img]:my-6 [&_img]:max-h-[540px] [&_img]:object-cover
            [&_figure]:my-6 [&_figcaption]:mt-2 [&_figcaption]:text-center [&_figcaption]:text-sm [&_figcaption]:italic [&_figcaption]:text-muted
            [&_hr]:my-8 [&_hr]:border-hairline"
          dangerouslySetInnerHTML={{ __html: paragraphs }}
        />
      );
    }
    const lines = paragraphs.split(/\n\n+/).filter(Boolean);
    return (
      <div className="prose-tsc max-w-none space-y-5 font-serif text-[18px] sm:text-[20px] leading-[1.85] text-ink/90 [&_p]:text-[18px] sm:[&_p]:text-[20px] [&_p]:leading-[1.85]">
        {lines.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    );
  }

  if (Array.isArray(paragraphs)) {
    return (
      <div className="prose-tsc max-w-none space-y-5 font-serif text-[18px] sm:text-[20px] leading-[1.85] text-ink/90 [&_p]:text-[18px] sm:[&_p]:text-[20px] [&_p]:leading-[1.85]">
        {paragraphs.map((p, i) => {
          if (typeof p === 'string' && /<[a-z][\s\S]*>/i.test(p)) {
            return (
              <div
                key={i}
                className="[&_a]:text-brand [&_a]:underline [&_img]:rounded-xl [&_img]:my-5 [&_figure]:my-6 [&_p]:text-[18px] sm:[&_p]:text-[20px] [&_p]:leading-[1.85]"
                dangerouslySetInnerHTML={{ __html: p }}
              />
            );
          }
          return <p key={i} className="text-[18px] sm:text-[20px] leading-[1.85]">{p}</p>;
        })}
      </div>
    );
  }

  return null;
}
