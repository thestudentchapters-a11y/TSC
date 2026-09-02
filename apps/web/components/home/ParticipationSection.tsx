import Link from 'next/link';
import Image from 'next/image';
import { PenLine, School, ArrowRight } from 'lucide-react';
import { SectionHeading } from '@/components/common/SectionHeading';
import { StaggerGrid, StaggerItem } from '@/components/common/Reveal';

/** Student participation — Share Your Story + Share Campus News. */
export function ParticipationSection() {
  return (
    <section aria-label="Student participation" className="bg-white section-pad">
      <div className="container-tsc">
        <SectionHeading
          align="center"
          number="09"
          eyebrow="Your Voice Matters"
          title="Don't Just Read. Be Part of the Story."
          description="TSC isn't a platform where students simply consume content. Students are the content, the contributors and the community. If you have a story, an idea, an achievement, a campus update or an experience worth sharing — we want to hear from you."
        />

        <StaggerGrid className="mt-14 grid gap-6 lg:grid-cols-2">
          {/* Share Your Story */}
          <StaggerItem>
            <Link
              href="/share-your-story"
              className="card-base card-hover group grid h-full overflow-hidden sm:grid-cols-2"
            >
              <div className="relative aspect-[16/10] overflow-hidden sm:aspect-auto sm:min-h-[280px]">
                <Image
                  src="/images/participation/write-story.jpg"
                  alt="A student writing notes in a library — share your story with TSC"
                  fill
                  sizes="(max-width: 640px) 100vw, 40vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span aria-hidden className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gold transition-transform duration-500 group-hover:scale-x-100" />
              </div>
              <div className="flex flex-col justify-center gap-3.5 p-6 sm:p-8">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-[8px] bg-gold-50 text-gold-deep transition-all duration-300 group-hover:bg-gold group-hover:text-ink">
                  <PenLine aria-hidden className="h-5 w-5" />
                </span>
                <h3 className="font-display text-xl font-bold">Share Your Story</h3>
                <p className="font-serif text-[15px] italic text-brand">
                  Your journey could inspire someone else.
                </p>
                <p className="text-[13.5px] leading-6 text-muted">
                  Built something? Won something? Failed at something? Started again? Discovered something
                  new? Tell us your story.
                </p>
                <span className="mt-1 inline-flex items-center gap-2 font-display text-[12px] font-bold uppercase tracking-[0.14em] text-brand">
                  <span className="cta-underline">Share Your Story</span>
                  <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                </span>
              </div>
            </Link>
          </StaggerItem>

          {/* Share Campus News */}
          <StaggerItem>
            <Link
              href="/share-campus-news"
              className="card-base card-hover group grid h-full overflow-hidden sm:grid-cols-2"
            >
              <div className="relative aspect-[16/10] overflow-hidden sm:order-2 sm:aspect-auto sm:min-h-[280px]">
                <Image
                  src="/images/participation/campus-news.jpg"
                  alt="Students in a classroom — share what is happening on your campus"
                  fill
                  sizes="(max-width: 640px) 100vw, 40vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span aria-hidden className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-brand transition-transform duration-500 group-hover:scale-x-100" />
              </div>
              <div className="flex flex-col justify-center gap-3.5 p-6 sm:order-1 sm:p-8">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-[8px] bg-brand-50 text-brand transition-all duration-300 group-hover:bg-brand group-hover:text-white">
                  <School aria-hidden className="h-5 w-5" />
                </span>
                <h3 className="font-display text-xl font-bold">Share Campus News</h3>
                <p className="font-serif text-[15px] italic text-brand">
                  What&apos;s happening at your campus?
                </p>
                <p className="text-[13.5px] leading-6 text-muted">
                  Organising an event? Launching an initiative? Celebrating an achievement? Building a
                  student community?
                </p>
                <span className="mt-1 inline-flex items-center gap-2 font-display text-[12px] font-bold uppercase tracking-[0.14em] text-brand">
                  <span className="cta-underline">Submit Campus News</span>
                  <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                </span>
              </div>
            </Link>
          </StaggerItem>
        </StaggerGrid>
      </div>
    </section>
  );
}
