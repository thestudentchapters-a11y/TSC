'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Play } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Reveal } from '@/components/common/Reveal';
import type { Campaign } from '@/types/content';

/**
 * Flagship campaign — full-bleed dark-blue section with parallax imagery and
 * a pulsing play CTA. Deliberately breaks the page rhythm.
 */
export function CampaignSection({ campaign }: { campaign: Campaign }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['-12%', '12%']);

  return (
    <section ref={ref} aria-label="Flagship campaign" className="relative overflow-hidden bg-brand-dark">
      {/* parallax background */}
      <motion.div aria-hidden className="absolute inset-[-14%] opacity-[0.16]" style={{ y: bgY }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={campaign.stills[1]?.image ?? '/images/campaign/campaign-2.jpg'} alt="" className="h-full w-full object-cover" />
      </motion.div>
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-brand-dark via-brand-dark/80 to-brand-dark" />

      <div className="container-tsc section-pad relative">
        <div className="mx-auto max-w-4xl text-center">
          <Reveal>
            <p className="eyebrow justify-center !text-gold">
              <span aria-hidden className="h-1.5 w-1.5 rounded-[2px] bg-gold" />
              {campaign.eyebrow}
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-5 font-display text-[1.7rem] font-bold uppercase leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-[2.9rem]">
              All India Career Awareness
              <span className="mt-1 block text-gold">Youth Documentary Series</span>
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-5 font-serif text-xl italic text-cream sm:text-2xl">{campaign.headline}</p>
          </Reveal>
          <Reveal delay={0.22}>
            <p className="mx-auto mt-6 max-w-3xl text-[14.5px] leading-7 text-white/75 sm:text-[15px] sm:leading-8">
              {campaign.description}
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button href="/campaigns/all-india-career-awareness" variant="light" size="lg" arrow>
                Explore the Series
              </Button>
              <span className="relative inline-flex">
                <span aria-hidden className="absolute inset-0 animate-play-pulse rounded-full bg-gold/70" />
                <Link
                  href="/campaigns/all-india-career-awareness#episodes"
                  className="relative inline-flex items-center gap-2.5 rounded-full bg-gold px-7 py-3.5 font-display text-[13px] font-bold uppercase tracking-[0.08em] text-ink shadow-lift transition-colors hover:bg-gold-deep"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-gold">
                    <Play aria-hidden className="ml-0.5 h-3 w-3 fill-current" />
                  </span>
                  Watch Documentaries
                </Link>
              </span>
            </div>
          </Reveal>
        </div>

        {/* documentary stills */}
        <div className="mt-16 grid gap-5 sm:grid-cols-3">
          {campaign.stills.map((s, i) => (
            <motion.figure
              key={s.image}
              className="group relative overflow-hidden rounded-md border border-white/10"
              initial={{ opacity: 0, y: reduce ? 0 : 40 * (i + 1) * 0.5 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.image} alt={s.alt} className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-4 text-[11px] font-bold uppercase tracking-[0.16em] text-cream">
                Documentary still {String(i + 1).padStart(2, '0')}
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
