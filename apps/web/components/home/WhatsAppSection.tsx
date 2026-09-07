import { Globe, MessageCircle } from 'lucide-react';
import { Reveal } from '@/components/common/Reveal';
import { Button } from '@/components/common/Button';
import { site } from '@/lib/site';

/** WhatsApp / KonnectX channels — URLs are admin-configurable via env/settings. */
export function WhatsAppSection() {
  const whatsappReady = !!site.whatsappUrl;
  const konnectxReady = !!site.konnectxUrl;

  return (
    <section aria-label="Stay connected" className="border-y border-hairline bg-white">
      <div className="container-tsc grid gap-8 py-14 lg:grid-cols-12 lg:items-center lg:py-16">
        <div className="lg:col-span-7">
          <Reveal>
            <p className="eyebrow">Channels</p>
            <h2 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Stay Connected. Stay Ahead.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-muted">
              Important opportunities shouldn&apos;t get lost in your feed. Get selected updates on student
              opportunities, events, career resources, stories and TSC initiatives directly through your
              preferred channel.
            </p>
            <p className="mt-3 font-serif text-base italic text-gold-deep">No noise. Just things worth knowing.</p>
          </Reveal>
        </div>

        <div className="flex flex-col gap-3 lg:col-span-5 lg:items-end">
          {whatsappReady ? (
            <Button href={site.whatsappUrl} size="md" arrow className="w-full sm:w-auto">
              <MessageCircle aria-hidden className="h-4 w-4" /> Join WhatsApp Community
            </Button>
          ) : (
            <span
              title="Link to be configured by the admin team"
              className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-[4px] border border-dashed border-hairline bg-cream px-6 py-3 font-display text-xs font-bold uppercase tracking-[0.08em] text-muted sm:w-auto"
            >
              <MessageCircle aria-hidden className="h-4 w-4" /> Join WhatsApp Community — link to be configured
            </span>
          )}
          <Button href="/konnectx" variant="outline" size="md" arrow className="w-full sm:w-auto">
            <Globe aria-hidden className="h-4 w-4" /> Explore KonnectX
          </Button>
        </div>
      </div>
    </section>
  );
}
