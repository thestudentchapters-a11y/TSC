'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';
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

const INSIGHT_WORDS = ['Watching', 'Observing', 'Learning'];

function InsightBadge() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setActive((a) => (a + 1) % INSIGHT_WORDS.length), 2000);
    return () => clearInterval(id);
  }, [reduce]);

  return (
    <span className="relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-gold/50 bg-white px-4 py-1.5 shadow-sm ring-1 ring-gold/20">
      {/* Light shimmer sweep */}
      {!reduce && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-amber-200/40 to-transparent"
          animate={{ x: ['-140%', '340%'] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
        />
      )}

      {/* Live radar pulse */}
      <span className="relative flex h-2 w-2 shrink-0 items-center justify-center">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gold-deep" />
      </span>

      <span className="relative font-display text-[12px] sm:text-[12.5px] font-bold text-ink tracking-wide">
        Students are{' '}
        {INSIGHT_WORDS.map((word, i) => {
          const isActive = active === i;
          return (
            <span key={word} className="relative inline-block">
              <span className="relative inline-block px-2 py-0.5 font-extrabold uppercase tracking-wider">
                {/* Continuous sliding pill background */}
                {isActive && (
                  <motion.span
                    layoutId="hero-insight-slider"
                    className="absolute inset-0 rounded-md bg-brand shadow-sm ring-1 ring-brand/30"
                    transition={{
                      type: 'spring',
                      stiffness: 320,
                      damping: 26,
                      mass: 0.8,
                    }}
                  />
                )}
                {/* Text on top with crisp color transition */}
                <span
                  className={cn(
                    'relative z-10 transition-colors duration-300',
                    isActive ? 'text-white font-black' : 'text-ink/80 hover:text-ink'
                  )}
                >
                  {word}
                </span>
              </span>
              {i < INSIGHT_WORDS.length - 1 && (
                <span className="text-ink/40 font-semibold px-0.5">
                  {i === INSIGHT_WORDS.length - 2 ? ' & ' : ', '}
                </span>
              )}
            </span>
          );
        })}
      </span>
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
            <Button href="/konnectx" variant="primary" size="lg" arrow>
              Join Us
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
            <InsightBadge />
            {/* <p className="flex items-center gap-2.5 font-serif text-lg italic text-gold-deep">
              <Sparkles aria-hidden className="h-4 w-4 text-gold" />
              Discover. Learn. Connect. Create.
            </p>
            <span aria-hidden className="hidden text-gold-deep/40 sm:inline">•</span> */}
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
            className="absolute -left-2 top-6 z-10 hidden lg:flex"
            initial={{ opacity: 0, x: -16 }}
            animate={reduce ? { opacity: 1, x: 0 } : { opacity: 1, x: [0, 6, 0], y: [0, -8, 0] }}
            transition={
              reduce
                ? { duration: 0.5, delay: 1.2 }
                : { opacity: { delay: 1.2, duration: 0.5 }, x: { repeat: Infinity, duration: 6, ease: 'easeInOut' }, y: { repeat: Infinity, duration: 6, ease: 'easeInOut' } }
            }
          >
            <Link
              href="/stories/student"
              className="group flex items-center gap-2 rounded-full border border-hairline bg-white px-4 py-2 shadow-lift transition-all duration-200 hover:scale-105 hover:border-brand/40 hover:shadow-md active:scale-95"
            >
              <Mic className="h-3.5 w-3.5 text-brand transition-transform duration-200 group-hover:scale-110" />
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink transition-colors duration-200 group-hover:text-brand">
                Student Voices
              </span>
            </Link>
          </motion.div>
          <motion.div
            className="absolute -right-2 bottom-8 z-10 hidden lg:flex"
            initial={{ opacity: 0, x: 16 }}
            animate={reduce ? { opacity: 1, x: 0 } : { opacity: 1, x: [0, -6, 0], y: [0, 8, 0] }}
            transition={
              reduce
                ? { duration: 0.5, delay: 1.35 }
                : { opacity: { delay: 1.35, duration: 0.5 }, x: { repeat: Infinity, duration: 7, ease: 'easeInOut' }, y: { repeat: Infinity, duration: 7, ease: 'easeInOut' } }
            }
          >
            <Link
              href="/career"
              className="group flex items-center gap-2 rounded-full bg-gold px-4 py-2 shadow-lift transition-all duration-200 hover:scale-105 hover:bg-gold-deep hover:shadow-md active:scale-95"
            >
              <span className="h-1.5 w-1.5 rounded-[2px] bg-ink transition-transform duration-200 group-hover:scale-110" />
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink">
                Opportunities
              </span>
            </Link>
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
