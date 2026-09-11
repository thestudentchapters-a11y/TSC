'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { Mic, Sparkles } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { cn } from '@/lib/utils';

const EASE = [0.22, 1, 0.36, 1] as const;

export const DEFAULT_HERO_PANELS = [
  { src: '/images/hero/hero-campus-walk.jpg', alt: 'Students walking across a green university campus at golden hour', cls: 'col-start-1 row-start-1 row-span-3', speed: -28 },
  { src: '/images/hero/hero-classroom.jpg', alt: 'A lively classroom discussion with a professor at the whiteboard', cls: 'col-start-2 row-start-1 row-span-2', speed: 20 },
  { src: '/images/hero/hero-fest.jpg', alt: 'Students cheering at an illuminated college cultural festival stage', cls: 'col-start-3 row-start-1 row-span-3', speed: -20 },
  { src: '/images/hero/hero-founder.jpg', alt: 'A student founder pitching an idea in a campus incubator', cls: 'col-start-4 row-start-1 row-span-2', speed: 30 },
  { src: '/images/hero/hero-collab.jpg', alt: 'Three students collaborating on a project around a laptop', cls: 'col-start-2 row-start-3 row-span-2', speed: 24 },
  { src: '/images/hero/hero-volunteer.jpg', alt: 'Student volunteers teaching children in a community programme', cls: 'col-start-4 row-start-3 row-span-2', speed: -24 },
  { src: '/images/hero/hero-workshop.jpg', alt: 'An engaging career awareness workshop in a college seminar hall', cls: 'col-start-1 row-start-4 row-span-2', speed: 16 },
  { src: '/images/hero/hero-podcast.jpg', alt: 'Two microphones set up for a TSC podcast recording', cls: 'col-start-3 row-start-4 row-span-2', speed: -16 },
];

export type HeroPanelData = { src: string; alt: string; cls?: string; speed?: number };

function HeroPanel({
  panel,
  index,
  progress,
}: {
  panel: (typeof DEFAULT_HERO_PANELS)[number];
  index: number;
  progress: MotionValue<number>;
}) {
  const reduce = useReducedMotion();
  const y = useTransform(progress, [0, 1], [reduce ? 0 : panel.speed, reduce ? 0 : -panel.speed]);

  return (
    <motion.div
      className={cn('relative min-h-0 overflow-hidden rounded-md', panel.cls)}
      style={{ y }}
      initial={{ opacity: 0, clipPath: reduce ? undefined : 'inset(0 0 100% 0)' }}
      animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
      transition={{ duration: 0.85, delay: 0.35 + index * 0.1, ease: EASE }}
    >
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.14 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.4, delay: 0.35 + index * 0.1, ease: EASE }}
      >
        <Image
          src={panel.src}
          alt={panel.alt}
          fill
          priority={index < 4}
          sizes="(max-width: 1024px) 50vw, 25vw"
          className="object-cover"
        />
      </motion.div>
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-md ring-1 ring-inset ring-ink/10" />
    </motion.div>
  );
}

function HeadlineLine({ text, delay, accent = false }: { text: string; delay: number; accent?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <span className="block overflow-hidden pb-1">
      <motion.span
        className={cn('block', accent && 'font-serif italic tracking-tight text-brand')}
        initial={{ y: reduce ? '0%' : '112%' }}
        animate={{ y: '0%' }}
        transition={{ duration: 0.8, delay, ease: EASE }}
      >
        {text}
      </motion.span>
    </span>
  );
}

export function Hero({ initialPanels }: { initialPanels?: Array<{ src: string; alt: string }> }) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const [panels, setPanels] = useState(DEFAULT_HERO_PANELS);

  useEffect(() => {
    const safeSrc = (src?: string, fallback = '') => {
      if (!src) return fallback;
      if (src.endsWith('.jp')) return src + 'g';
      return src;
    };

    // 1. Check props first
    if (initialPanels && initialPanels.length > 0) {
      setPanels(
        DEFAULT_HERO_PANELS.map((defaultPanel, i) => ({
          ...defaultPanel,
          src: safeSrc(initialPanels[i]?.src, defaultPanel.src),
          alt: initialPanels[i]?.alt || defaultPanel.alt,
        }))
      );
      return;
    }

    // 2. Check local storage / API
    try {
      const stored = window.localStorage.getItem('tsc.admin.heroPanels');
      if (stored) {
        const parsed = JSON.parse(stored) as Array<{ src: string; alt: string }>;
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPanels(
            DEFAULT_HERO_PANELS.map((defaultPanel, i) => ({
              ...defaultPanel,
              src: safeSrc(parsed[i]?.src, defaultPanel.src),
              alt: parsed[i]?.alt || defaultPanel.alt,
            }))
          );
        }
      }
    } catch {
      /* noop */
    }

    const api = process.env.NEXT_PUBLIC_API_URL;
    if (api) {
      fetch(`${api}/api/settings`)
        .then((r) => r.json())
        .then((res) => {
          const apiPanels = res?.data?.homepage?.heroPanels;
          if (Array.isArray(apiPanels) && apiPanels.length > 0) {
            setPanels(
              DEFAULT_HERO_PANELS.map((defaultPanel, i) => ({
                ...defaultPanel,
                src: apiPanels[i]?.src || defaultPanel.src,
                alt: apiPanels[i]?.alt || defaultPanel.alt,
              }))
            );
          }
        })
        .catch(() => {
          /* keep default */
        });
    }
  }, [initialPanels]);

  return (
    <section ref={sectionRef} aria-label="Hero" className="relative overflow-hidden bg-cream">
      <div className="container-tsc grid gap-12 pb-16 pt-28 sm:pt-32 lg:grid-cols-12 lg:gap-10 lg:pb-24 lg:pt-40">
        {/* Copy */}
        <div className="flex flex-col justify-center lg:col-span-5">
          <motion.p
            className="eyebrow tracking-wider"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <span aria-hidden className="relative flex h-2 w-2">
              <span className="absolute h-full w-full animate-pulse-dot rounded-full bg-gold" />
              <span className="relative h-2 w-2 rounded-full bg-gold" />
            </span>
            The Student Chapters™ | India&apos;s Student &amp; Youth Platform
          </motion.p>

          <h1 className="mt-6 font-display text-[2.6rem] font-bold leading-[1.04] tracking-tight sm:text-6xl lg:text-[4.2rem]">
            <HeadlineLine text="Your Campus." delay={0.12} />
            <HeadlineLine text="Your Voice." delay={0.24} />
            <HeadlineLine text="Your Future." delay={0.36} accent />
          </h1>

          <motion.p
            className="mt-6 max-w-xl text-[15px] leading-7 text-muted sm:text-base sm:leading-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: EASE }}
          >
            The Student Chapters™ is a platform built for the next generation — bringing together student
            stories, campus news, career opportunities, current affairs, events, podcasts, legal awareness
            and communities from across India.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-col gap-3 sm:flex-row"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.62, ease: EASE }}
          >
            <Button href="/membership" variant="primary" size="lg" arrow>
              Join TSC
            </Button>
            <Button href="/stories" variant="outline" size="lg" arrow>
              Explore Stories
            </Button>
          </motion.div>

          <motion.div
            className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.78 }}
          >
            <span className="inline-flex items-center rounded-full border border-gold/40 bg-gold-50/80 px-3 py-1 font-display text-[11px] font-bold uppercase tracking-[0.14em] text-gold-deep shadow-sm">
              Students are Watching, Observing &amp; Learning
            </span>
            <p className="flex items-center gap-2.5 font-serif text-lg italic text-gold-deep">
              <Sparkles aria-hidden className="h-4 w-4 text-gold" />
              Discover. Learn. Connect. Create.
            </p>
            <span aria-hidden className="hidden text-gold-deep/40 sm:inline">•</span>
          </motion.div>
        </div>

        {/* Collage */}
        <div className="relative lg:col-span-7">
          <div className="grid h-[480px] grid-cols-2 grid-rows-6 gap-3 sm:h-[560px] sm:gap-4 lg:h-[600px] lg:grid-cols-4">
            {panels.map((p, i) => (
              <HeroPanel key={`${p.src}-${i}`} panel={p} index={i} progress={scrollYProgress} />
            ))}
          </div>

          {/* floating chips */}
          <motion.div
            aria-hidden
            className="absolute -left-2 top-6 hidden items-center gap-2 rounded-full border border-hairline bg-white px-4 py-2 shadow-lift lg:flex"
            initial={{ opacity: 0, x: -16 }}
            animate={reduce ? { opacity: 1, x: 0 } : { opacity: 1, x: [0, 6, 0], y: [0, -8, 0] }}
            transition={
              reduce
                ? { duration: 0.5, delay: 1.2 }
                : { opacity: { delay: 1.2, duration: 0.5 }, x: { repeat: Infinity, duration: 6, ease: 'easeInOut' }, y: { repeat: Infinity, duration: 6, ease: 'easeInOut' } }
            }
          >
            <Mic className="h-3.5 w-3.5 text-brand" />
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink">Student Voices</span>
          </motion.div>
          <motion.div
            aria-hidden
            className="absolute -right-2 bottom-8 hidden items-center gap-2 rounded-full bg-gold px-4 py-2 shadow-lift lg:flex"
            initial={{ opacity: 0, x: 16 }}
            animate={reduce ? { opacity: 1, x: 0 } : { opacity: 1, x: [0, -6, 0], y: [0, 8, 0] }}
            transition={
              reduce
                ? { duration: 0.5, delay: 1.35 }
                : { opacity: { delay: 1.35, duration: 0.5 }, x: { repeat: Infinity, duration: 7, ease: 'easeInOut' }, y: { repeat: Infinity, duration: 7, ease: 'easeInOut' } }
            }
          >
            <span className="h-1.5 w-1.5 rounded-[2px] bg-ink" />
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink">Opportunities</span>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="hidden justify-center pb-8 lg:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        aria-hidden
      >
        <Link href="#tsc-intro" className="flex flex-col items-center gap-1 text-muted transition-colors hover:text-brand">
          <span className="text-[10px] font-bold uppercase tracking-[0.24em]">Scroll</span>
          <motion.span animate={reduce ? undefined : { y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
            ↓
          </motion.span>
        </Link>
      </motion.div>
    </section>
  );
}
