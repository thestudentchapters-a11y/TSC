import { SectionHeading } from '@/components/common/SectionHeading';
import { StaggerGrid, StaggerItem } from '@/components/common/Reveal';
import { EventCard } from '@/components/cards/EventCard';
import { TextCTA } from '@/components/common/Button';
import type { TscEvent } from '@/types/content';

const CATEGORIES = ['Career', 'Entrepreneurship', 'Education', 'Technology', 'Culture', 'Leadership', 'Competitions', 'Networking'];

export function EventsSection({ events }: { events: TscEvent[] }) {
  const upcoming = events.filter((e) => e.status === 'upcoming' || e.status === 'ongoing').slice(0, 4);

  return (
    <section aria-label="Events" className="bg-white section-pad">
      <div className="container-tsc">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <SectionHeading
            number="07"
            eyebrow="Experience. Participate. Connect."
            title="Don't Just Watch From the Sidelines."
            description="The best opportunities often begin with showing up. Discover workshops, competitions, conferences, career sessions, campus programmes, networking events and youth initiatives happening around you."
          />
        </div>

        <StaggerGrid className="mt-9 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <StaggerItem key={c}>
              <span className="inline-block rounded-full border border-hairline bg-cream px-3.5 py-2 text-[11.5px] font-bold uppercase tracking-[0.1em] text-ink/70 transition-colors hover:border-brand hover:text-brand">
                {c}
              </span>
            </StaggerItem>
          ))}
        </StaggerGrid>

        <StaggerGrid className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {upcoming.map((e) => (
            <StaggerItem key={e.id}>
              <EventCard event={e} />
            </StaggerItem>
          ))}
        </StaggerGrid>

        <div className="mt-10 border-t border-hairline pt-8">
          <TextCTA href="/events">Explore All Events</TextCTA>
        </div>
      </div>
    </section>
  );
}
