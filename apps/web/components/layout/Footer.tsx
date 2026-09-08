import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Youtube, Linkedin, Facebook, MessageCircle, MapPin } from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { NewsletterForm } from '@/components/layout/NewsletterForm';
import { footerNav, site } from '@/lib/site';

const socials = [
  { label: 'KonnectX', href: site.konnectxUrl || 'https://konnectx.app/', imageSrc: '/konnectXfooter.png', configured: true },
  { label: 'Instagram', href: site.social.instagram, icon: Instagram, configured: !!site.social.instagram },
  { label: 'YouTube', href: site.social.youtube, icon: Youtube, configured: !!site.social.youtube },
  { label: 'LinkedIn', href: site.social.linkedin, icon: Linkedin, configured: !!site.social.linkedin },
  { label: 'Facebook', href: site.social.facebook, icon: Facebook, configured: !!site.social.facebook },
  { label: 'WhatsApp', href: site.whatsappUrl, icon: MessageCircle, configured: !!site.whatsappUrl },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-brand-dark text-cream">
      {/* Newsletter band */}
      <div className="border-b border-white/10">
        <div className="container-tsc grid gap-6 py-10 sm:grid-cols-2 sm:items-center">
          <div>
            <p className="eyebrow !text-gold font-semibold tracking-wider">Stay in the loop</p>
            <h2 className="mt-2 font-display text-xl font-bold text-white sm:text-2xl">
              Stories, opportunities &amp; events — straight to you.
            </h2>
          </div>
          <NewsletterForm />
        </div>
      </div>

      {/* Link columns */}
      <div className="container-tsc grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-5 lg:col-span-2">
          <Logo dark />
          <p className="font-serif text-lg italic text-gold">{site.tagline}</p>
          <p className="max-w-sm text-sm leading-relaxed text-cream/90">
            {site.name} — India&apos;s student &amp; youth platform. Discover. Learn. Connect. Create.
          </p>
          <div className="flex flex-wrap gap-2.5">
            {socials.map((s) => {
              const Icon = s.icon;
              if (!s.configured) {
                return (
                  <span
                    key={s.label}
                    title="Link to be configured by admin"
                    className="flex h-9 w-9 cursor-default items-center justify-center rounded-full border border-white/20 text-cream/40"
                  >
                    {s.imageSrc ? (
                      <Image
                        src={s.imageSrc}
                        alt={s.label}
                        width={20}
                        height={20}
                        className="h-5 w-5 object-contain opacity-40"
                      />
                    ) : (
                      Icon && <Icon aria-hidden className="h-4 w-4" />
                    )}
                  </span>
                );
              }
              return (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${s.label} (opens in a new tab)`}
                  className="group flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-cream/90 transition-all hover:border-gold hover:bg-gold/10 hover:text-gold"
                >
                  {s.imageSrc ? (
                    <Image
                      src={s.imageSrc}
                      alt={s.label}
                      width={24}
                      height={24}
                      className="h-5 w-5 object-contain transition-transform duration-200 group-hover:scale-110"
                    />
                  ) : (
                    Icon && <Icon aria-hidden className="h-4 w-4" />
                  )}
                </a>
              );
            })}
          </div>
          <p className="flex items-start gap-2 text-xs font-medium text-cream/75">
            <MapPin aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
            <span>Office: {site.address}</span>
          </p>
        </div>

        <FooterColumn title="Explore" links={footerNav.explore} />
        <FooterColumn title="Community" links={footerNav.community} />
        <FooterColumn title="About" links={footerNav.about} />
      </div>

      <div className="border-t border-white/10">
        <div className="container-tsc flex flex-col items-center justify-between gap-3 py-6 text-xs text-cream/75 sm:flex-row">
          <p className="font-medium text-cream/90">
            © {year} THE STUDENT CHAPTERS™. All rights reserved.
          </p>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="rounded-full border border-gold/50 bg-gold/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold">
              Demo build
            </span>
            <Link href="/about" className="transition-colors hover:text-gold">About</Link>
            <Link href="/contact" className="transition-colors hover:text-gold">Contact</Link>
            <span aria-hidden className="text-cream/40">•</span>
            <span className="text-cream/70">Sample content is marked “Demo”</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <nav aria-label={title}>
      <h3 className="font-display text-xs font-bold uppercase tracking-[0.2em] text-gold">{title}</h3>
      <ul className="mt-5 space-y-2.5">
        {links.map((l) => {
          const isExternal = l.href.startsWith('http');
          return (
            <li key={l.href + l.label}>
              <Link
                href={l.href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="group inline-flex items-center gap-2 text-sm font-medium text-cream/85 transition-colors hover:text-white"
              >
                <span aria-hidden className="h-1.5 w-1.5 rounded-[2px] bg-gold/70 transition-all group-hover:scale-125 group-hover:bg-gold" />
                <span className="transition-transform group-hover:translate-x-0.5">{l.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
