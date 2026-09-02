import { Compass, Users, TrendingUp } from 'lucide-react';
import { Reveal, StaggerGrid, StaggerItem } from '@/components/common/Reveal';

const PILLARS = [
  {
    icon: Compass,
    title: 'DISCOVER',
    copy: 'Discover stories, opportunities, ideas and experiences from students and young people across India.',
  },
  {
    icon: Users,
    title: 'CONNECT',
    copy: 'Connect with campuses, communities, events, professionals, entrepreneurs and fellow students.',
  },
  {
    icon: TrendingUp,
    title: 'GROW',
    copy: 'Learn, participate, build your skills and discover opportunities for your future.',
  },
];

/** TSC introduction — "More than news." */
export function IntroSection() {
  return (
    <section id="tsc-intro" aria-label="About TSC" className="bg-white section-pad">
      <div className="container-tsc grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Reveal>
            <p className="eyebrow">More Than News. A Platform for the Next Generation.</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-4 font-display text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl">
              Where Students Discover, Share &amp; Connect.
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <div className="relative mt-7 h-px w-24 bg-hairline">
              <span aria-hidden className="absolute left-0 top-1/2 h-[3px] w-10 -translate-y-1/2 bg-gold" />
            </div>
          </Reveal>
        </div>

        <div className="lg:col-span-8">
          <Reveal delay={0.1}>
            <p className="text-[15px] leading-8 text-muted sm:text-base">
              Students today are not just learners. They are creators, entrepreneurs, researchers, artists,
              leaders, changemakers and future professionals. But great ideas and great stories often remain
              inside classrooms and campuses. The Student Chapters exists to bring those voices out. We
              connect students and young people with the stories, opportunities, information, people and
              experiences that can help them move forward.
            </p>
          </Reveal>

          <StaggerGrid className="mt-10 grid gap-5 sm:grid-cols-3">
            {PILLARS.map((p) => {
              const Icon = p.icon;
              return (
                <StaggerItem key={p.title}>
                  <div className="card-base card-hover group h-full p-6">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-[8px] bg-brand-50 text-brand transition-all duration-300 group-hover:rotate-[-6deg] group-hover:bg-brand group-hover:text-white">
                      <Icon aria-hidden className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
                    </span>
                    <h3 className="mt-5 font-display text-sm font-bold uppercase tracking-[0.18em]">
                      {p.title}
                    </h3>
                    <span aria-hidden className="mt-3 block h-0.5 w-6 bg-gold" />
                    <p className="mt-3 text-[13.5px] leading-6 text-muted">{p.copy}</p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerGrid>
        </div>
      </div>
    </section>
  );
}
