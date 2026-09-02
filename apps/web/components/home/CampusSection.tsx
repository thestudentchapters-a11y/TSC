import { Megaphone, Award, Sparkles, Users, CalendarDays, Lightbulb } from 'lucide-react';
import { SectionHeading } from '@/components/common/SectionHeading';
import { StaggerGrid, StaggerItem } from '@/components/common/Reveal';
import { CampusCard } from '@/components/cards/CampusCard';
import { Button } from '@/components/common/Button';
import type { Campus } from '@/types/content';

const CATEGORIES = [
  { icon: Megaphone, name: 'Campus News' },
  { icon: Award, name: 'Student Achievements' },
  { icon: Sparkles, name: 'Campus Life' },
  { icon: Users, name: 'Clubs & Communities' },
  { icon: CalendarDays, name: 'Campus Events' },
  { icon: Lightbulb, name: 'Student Initiatives' },
];

export function CampusSection({ campuses }: { campuses: Campus[] }) {
  return (
    <section aria-label="Campus" className="section-pad">
      <div className="container-tsc">
        <SectionHeading
          number="03"
          eyebrow="Campus"
          title="India's Campuses Have a Story to Tell."
          description="Every campus has its own culture, people, ideas and energy. TSC brings those stories together — from student achievements and campus events to clubs, communities, innovations and the everyday experiences that define student life."
        />

        {/* categories */}
        <StaggerGrid className="mt-9 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            return (
              <StaggerItem key={c.name}>
                <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white px-3.5 py-2 text-[11.5px] font-bold uppercase tracking-[0.1em] text-ink/70 transition-colors hover:border-brand hover:text-brand">
                  <Icon aria-hidden className="h-3.5 w-3.5 text-brand" />
                  {c.name}
                </span>
              </StaggerItem>
            );
          })}
        </StaggerGrid>

        <StaggerGrid className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {campuses.slice(0, 3).map((c) => (
            <StaggerItem key={c.id}>
              <CampusCard campus={c} />
            </StaggerItem>
          ))}
        </StaggerGrid>

        <div className="mt-10 flex flex-col gap-3 border-t border-hairline pt-8 sm:flex-row sm:items-center">
          <Button href="/campus" size="md" arrow>
            Explore Campuses
          </Button>
          <Button href="/share-campus-news" variant="outline" size="md" arrow>
            Submit Campus News
          </Button>
        </div>
      </div>
    </section>
  );
}
