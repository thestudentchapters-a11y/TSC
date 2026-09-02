import { Reveal } from '@/components/common/Reveal';
import { Button } from '@/components/common/Button';

/** Reusable full-width CTA band (final CTA, membership prompts, etc.). */
export function CTASection({
  eyebrow,
  title,
  copy,
  primary,
  secondary,
  variant = 'dark',
}: {
  eyebrow?: string;
  title: React.ReactNode;
  copy?: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
  variant?: 'dark' | 'brand';
}) {
  const dark = variant === 'dark';
  return (
    <section className={dark ? 'bg-ink text-cream' : 'bg-brand-dark text-white'}>
      <div className="container-tsc section-pad relative">
        <span
          aria-hidden
          className="absolute right-8 top-10 hidden h-3 w-3 rounded-[2px] bg-gold lg:block"
        />
        <span
          aria-hidden
          className="absolute bottom-12 left-10 hidden h-2 w-2 rounded-[2px] bg-gold/60 lg:block"
        />
        <div className="mx-auto max-w-3xl text-center">
          {eyebrow && (
            <Reveal>
              <p className="eyebrow justify-center !text-gold">{eyebrow}</p>
            </Reveal>
          )}
          <Reveal delay={0.08}>
            <h2 className="mt-4 text-3xl font-bold leading-[1.12] tracking-tight text-white sm:text-4xl lg:text-5xl">
              {title}
            </h2>
          </Reveal>
          {copy && (
            <Reveal delay={0.16}>
              <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-7 text-white/70 sm:text-base sm:leading-8">
                {copy}
              </p>
            </Reveal>
          )}
          <Reveal delay={0.24}>
            <div className="mt-9 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
              <Button href={primary.href} variant="accent" size="lg" arrow>
                {primary.label}
              </Button>
              {secondary && (
                <Button href={secondary.href} variant="light" size="lg" arrow>
                  {secondary.label}
                </Button>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
