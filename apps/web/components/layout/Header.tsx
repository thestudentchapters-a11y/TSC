'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Menu, PenLine, Search } from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { Button } from '@/components/common/Button';
import { mainNav } from '@/lib/site';
import { cn } from '@/lib/utils';

/**
 * Sticky header — transparent over the hero, transitions to a solid blurred
 * surface with a hairline border on scroll. Animated nav underlines,
 * accessible desktop dropdowns, mobile drawer.
 */
export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const lastRef = useRef(pathname);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (pathname !== lastRef.current) {
      lastRef.current = pathname;
      setMenuOpen(false);
    }
  }, [pathname]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  // Hide the global website navbar on standalone PDF dossier views
  if (pathname?.endsWith('/pdf') || pathname?.includes('/pdf/')) {
    return null;
  }

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-[90] transition-all duration-500',
          scrolled
            ? 'border-b border-hairline bg-cream/90 shadow-[0_1px_0_rgba(12,12,12,0.02)] backdrop-blur-md'
            : 'border-b border-transparent bg-transparent'
        )}
      >
        <div className="container-tsc flex h-16 items-center justify-between gap-4 lg:h-[72px]">
          <Logo />

          {/* Desktop nav */}
          <nav aria-label="Primary" className="hidden items-center xl:flex">
            {mainNav.map((item) => {
              const active = isActive(item.href);
              return (
                <div key={item.href} className="group relative">
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'nav-link flex items-center gap-1 px-2.5 py-2 font-display text-[11px] font-bold uppercase tracking-[0.12em] transition-colors',
                      active ? 'nav-link-active text-brand' : 'text-ink/75 hover:text-brand'
                    )}
                  >
                    {item.label}
                    {item.children && (
                      <ChevronDown
                        aria-hidden
                        className="h-3 w-3 transition-transform duration-300 group-hover:rotate-180"
                      />
                    )}
                  </Link>

                  {item.children && (
                    <div
                      className="invisible absolute left-1/2 top-full z-20 -translate-x-1/2 translate-y-2 pt-3 opacity-0 transition-all duration-300 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100"
                    >
                      <div className="w-72 overflow-hidden rounded-md border border-hairline bg-white p-2 shadow-lift">
                        {item.children.map((child) => (
                          <Link
                            key={child.href + child.label}
                            href={child.href}
                            className="group/item rounded-sm px-3 py-2.5 transition-colors hover:bg-brand-50"
                          >
                            <span className="flex items-center gap-2 font-display text-[12.5px] font-bold text-ink group-hover/item:text-brand">
                              <span aria-hidden className="h-1.5 w-1.5 rounded-[2px] bg-gold opacity-0 transition-opacity group-hover/item:opacity-100" />
                              {child.label}
                            </span>
                            {child.description && (
                              <span className="mt-0.5 block pl-3.5 text-[11.5px] leading-4 text-muted">
                                {child.description}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right utilities */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link
              href="/search"
              aria-label="Search the platform"
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink/70 transition-colors hover:bg-brand-50 hover:text-brand"
            >
              <Search aria-hidden className="h-[18px] w-[18px]" />
            </Link>
            <Link
              href="/share-your-story"
              className="hidden items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-ink/70 transition-colors hover:text-brand lg:flex"
            >
              <PenLine aria-hidden className="h-3.5 w-3.5" />
              Submit Your Story
            </Link>
            <Button href="/konnectx" variant="accent" size="sm" className="hidden sm:inline-flex">
              KonnectX
            </Button>
            <button
              type="button"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-[4px] border border-hairline bg-white/70 text-ink transition-colors hover:border-brand hover:text-brand xl:hidden"
            >
              <Menu aria-hidden className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
