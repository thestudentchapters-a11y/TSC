'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Home, Image as ImageIcon, Layers, RefreshCw, Save, Sparkles } from 'lucide-react';
import { Field, Input, Checkbox } from '@/components/forms/Form';
import { Button } from '@/components/common/Button';
import { useToast } from '@/components/common/Toast';
import { DEFAULT_HERO_PANELS } from '@/components/home/Hero';

const SECTIONS = [
  'Header', 'Hero', "What's Happening Now (Ticker)", 'TSC Introduction', 'Latest News', 'Student Stories',
  'Campus', 'Career & Opportunities', 'Current Affairs', 'Podcast', 'Events', 'Legal Awareness',
  'Flagship Campaign', 'Student Participation', 'Community / Membership', 'WhatsApp / KonnectX', 'Final CTA', 'Footer',
];

const PANEL_LABELS = [
  'Panel 1 — Campus Walk (Col 1, Top)',
  'Panel 2 — Classroom Discussion (Col 2, Top)',
  'Panel 3 — Fest Stage (Col 3, Top)',
  'Panel 4 — Student Founder (Col 4, Top)',
  'Panel 5 — Group Collaboration (Col 2, Bottom)',
  'Panel 6 — Volunteer Teaching (Col 4, Bottom)',
  'Panel 7 — Career Workshop (Col 1, Bottom)',
  'Panel 8 — Podcast Studio (Col 3, Bottom)',
];

const DEFAULT_PROMO = {
  writeStory: '/images/participation/write-story.jpg',
  campusNews: '/images/participation/campus-news.jpg',
  communityBg: '/images/community/community-1.jpg',
};

export default function AdminHomepagePage() {
  const { push } = useToast();
  const [enabled, setEnabled] = useState<Record<string, boolean>>(Object.fromEntries(SECTIONS.map((s) => [s, true])));
  const [heroKicker, setHeroKicker] = useState("The Student Chapters™ | India's Student & Youth Platform");
  const [campaignHref, setCampaignHref] = useState('/campaigns/all-india-career-awareness');
  const [panels, setPanels] = useState<Array<{ src: string; alt: string }>>(
    DEFAULT_HERO_PANELS.map((p) => ({ src: p.src, alt: p.alt }))
  );
  const [promoImages, setPromoImages] = useState(DEFAULT_PROMO);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // 1. Load from localStorage
    try {
      const storedPanels = window.localStorage.getItem('tsc.admin.heroPanels');
      if (storedPanels) {
        const parsed = JSON.parse(storedPanels);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPanels(
            DEFAULT_HERO_PANELS.map((dp, i) => ({
              src: parsed[i]?.src || dp.src,
              alt: parsed[i]?.alt || dp.alt,
            }))
          );
        }
      }

      const storedPromo = window.localStorage.getItem('tsc.admin.promoImages');
      if (storedPromo) {
        const parsed = JSON.parse(storedPromo);
        setPromoImages((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      /* noop */
    }

    // 2. Load from API
    const api = process.env.NEXT_PUBLIC_API_URL;
    if (api) {
      fetch(`${api}/api/settings`)
        .then((r) => r.json())
        .then((res) => {
          if (res?.data?.homepage) {
            const hp = res.data.homepage;
            if (hp.heroEyebrow) setHeroKicker(hp.heroEyebrow);
            if (hp.campaignSlug) setCampaignHref(`/campaigns/${hp.campaignSlug}`);
            if (hp.sectionsEnabled) setEnabled((prev) => ({ ...prev, ...hp.sectionsEnabled }));
            if (Array.isArray(hp.heroPanels) && hp.heroPanels.length > 0) {
              setPanels(
                DEFAULT_HERO_PANELS.map((dp, i) => ({
                  src: hp.heroPanels[i]?.src || dp.src,
                  alt: hp.heroPanels[i]?.alt || dp.alt,
                }))
              );
            }
            if (hp.promoImages) {
              setPromoImages((prev) => ({ ...prev, ...hp.promoImages }));
            }
          }
        })
        .catch(() => {
          /* keep default */
        });
    }
  }, []);

  const handlePanelChange = (index: number, field: 'src' | 'alt', value: string) => {
    setPanels((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleResetPanels = () => {
    setPanels(DEFAULT_HERO_PANELS.map((p) => ({ src: p.src, alt: p.alt })));
    push('Reset hero collage images to default assets.', 'info');
  };

  const handleResetPromo = () => {
    setPromoImages(DEFAULT_PROMO);
    push('Reset promotional card images to defaults.', 'info');
  };

  const handleSave = async () => {
    setSaving(true);
    // 1. Save to local storage for immediate preview
    try {
      window.localStorage.setItem('tsc.admin.heroPanels', JSON.stringify(panels));
      window.localStorage.setItem('tsc.admin.promoImages', JSON.stringify(promoImages));
      window.localStorage.setItem('tsc.admin.heroKicker', heroKicker);
      window.localStorage.setItem('tsc.admin.campaignHref', campaignHref);
    } catch {
      /* noop */
    }

    // 2. Persist to MongoDB API if connected
    const api = process.env.NEXT_PUBLIC_API_URL;
    if (api) {
      try {
        const token = window.localStorage.getItem('tsc_token');
        const campaignSlug = campaignHref.replace('/campaigns/', '');
        const res = await fetch(`${api}/api/settings`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            homepage: {
              heroEyebrow: heroKicker,
              campaignSlug,
              sectionsEnabled: enabled,
              heroPanels: panels,
              promoImages,
            },
          }),
        });
        if (res.ok) {
          push('Homepage, Hero Collage, & Promotional images saved to database!', 'success');
        } else {
          push('Saved locally. (Sign in as Admin to sync to database)', 'info');
        }
      } catch {
        push('Saved to local storage for live browser preview.', 'success');
      }
    } else {
      push('Homepage settings and images saved locally.', 'success');
    }
    setSaving(false);
  };

  return (
    <div className="pb-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Admin Center</p>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">Homepage Customizer</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Manage section visibility, hero narrative eyebrow, and customize all dynamic images across the homepage with live previews.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={handleResetPanels}>
            <RefreshCw className="h-3.5 w-3.5" /> Reset Hero Images
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving} arrow>
            <Save className="h-3.5 w-3.5" /> {saving ? 'Saving…' : 'Save Homepage'}
          </Button>
        </div>
      </div>

      {/* Hero Images Collage Editor */}
      <section className="card-base mb-8 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-4">
          <div>
            <h2 className="flex items-center gap-2 font-display text-base font-bold uppercase tracking-[0.14em] text-ink">
              <ImageIcon aria-hidden className="h-5 w-5 text-brand" /> Hero Collage Images (8 Panels)
            </h2>
            <p className="mt-1 text-xs text-muted">
              Admins can change every image shown in the homepage hero collage. Provide local paths (e.g.{' '}
              <code className="rounded bg-cream px-1 py-0.5 text-ink">/images/hero/...</code>) or public URLs.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold-50 px-3 py-1 font-display text-[10px] font-bold uppercase tracking-wider text-gold-deep">
            <Sparkles className="h-3 w-3" /> Live Collage Sync
          </span>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {panels.map((panel, idx) => (
            <div
              key={idx}
              className="flex flex-col rounded-lg border border-hairline bg-cream p-4 shadow-sm transition-all hover:border-brand/40 hover:bg-white"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex h-5 items-center justify-center rounded bg-ink px-1.5 font-display text-[10px] font-bold text-cream">
                  Panel #{idx + 1}
                </span>
                <span className="truncate text-[11px] font-medium text-muted">
                  {PANEL_LABELS[idx]?.split('—')[1]?.trim() || ''}
                </span>
              </div>

              {/* Preview Thumbnail */}
              <div className="relative mt-3 h-28 w-full overflow-hidden rounded-md border border-hairline bg-paper">
                <Image
                  src={panel.src || DEFAULT_HERO_PANELS[idx].src}
                  alt={panel.alt || `Hero panel ${idx + 1}`}
                  fill
                  sizes="200px"
                  className="object-cover"
                />
              </div>

              <div className="mt-3 space-y-2.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-ink/70">
                    Image URL / Path
                  </label>
                  <input
                    type="text"
                    value={panel.src}
                    onChange={(e) => handlePanelChange(idx, 'src', e.target.value)}
                    placeholder="/images/hero/hero-campus-walk.jpg"
                    className="mt-1 w-full rounded border border-hairline bg-white px-2.5 py-1.5 text-xs text-ink placeholder:text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-ink/70">
                    Alt Text (Accessibility)
                  </label>
                  <input
                    type="text"
                    value={panel.alt}
                    onChange={(e) => handlePanelChange(idx, 'alt', e.target.value)}
                    placeholder="Describe the image..."
                    className="mt-1 w-full rounded border border-hairline bg-white px-2.5 py-1.5 text-xs text-ink placeholder:text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Promotional & Community Section Images */}
      <section className="card-base mb-8 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-4">
          <div>
            <h2 className="flex items-center gap-2 font-display text-base font-bold uppercase tracking-[0.14em] text-ink">
              <Layers aria-hidden className="h-5 w-5 text-brand" /> Promotional &amp; Community Section Images
            </h2>
            <p className="mt-1 text-xs text-muted">
              Customize promotional card images and background visuals on the public homepage.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleResetPromo}>
            <RefreshCw className="h-3.5 w-3.5" /> Reset Promo Images
          </Button>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {/* Write a Story Image */}
          <div className="flex flex-col rounded-lg border border-hairline bg-cream p-4">
            <span className="font-display text-xs font-bold uppercase tracking-wider text-ink">
              1. Share Your Story Card
            </span>
            <p className="mt-0.5 text-[11px] text-muted">Shown on the Student Participation section</p>
            <div className="relative mt-3 h-32 w-full overflow-hidden rounded-md border border-hairline bg-paper">
              <Image
                src={promoImages.writeStory || DEFAULT_PROMO.writeStory}
                alt="Share Story preview"
                fill
                sizes="300px"
                className="object-cover"
              />
            </div>
            <div className="mt-3">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink/70">
                Image URL / Path
              </label>
              <input
                type="text"
                value={promoImages.writeStory}
                onChange={(e) => setPromoImages((v) => ({ ...v, writeStory: e.target.value }))}
                placeholder="/images/participation/write-story.jpg"
                className="mt-1 w-full rounded border border-hairline bg-white px-2.5 py-1.5 text-xs text-ink placeholder:text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
          </div>

          {/* Campus News Image */}
          <div className="flex flex-col rounded-lg border border-hairline bg-cream p-4">
            <span className="font-display text-xs font-bold uppercase tracking-wider text-ink">
              2. Share Campus News Card
            </span>
            <p className="mt-0.5 text-[11px] text-muted">Shown on the Student Participation section</p>
            <div className="relative mt-3 h-32 w-full overflow-hidden rounded-md border border-hairline bg-paper">
              <Image
                src={promoImages.campusNews || DEFAULT_PROMO.campusNews}
                alt="Campus News preview"
                fill
                sizes="300px"
                className="object-cover"
              />
            </div>
            <div className="mt-3">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink/70">
                Image URL / Path
              </label>
              <input
                type="text"
                value={promoImages.campusNews}
                onChange={(e) => setPromoImages((v) => ({ ...v, campusNews: e.target.value }))}
                placeholder="/images/participation/campus-news.jpg"
                className="mt-1 w-full rounded border border-hairline bg-white px-2.5 py-1.5 text-xs text-ink placeholder:text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
          </div>

          {/* Community Section Background */}
          <div className="flex flex-col rounded-lg border border-hairline bg-cream p-4">
            <span className="font-display text-xs font-bold uppercase tracking-wider text-ink">
              3. Community Background Photo
            </span>
            <p className="mt-0.5 text-[11px] text-muted">Subtle backdrop on the &apos;Join the Movement&apos; section</p>
            <div className="relative mt-3 h-32 w-full overflow-hidden rounded-md border border-hairline bg-paper">
              <Image
                src={promoImages.communityBg || DEFAULT_PROMO.communityBg}
                alt="Community background preview"
                fill
                sizes="300px"
                className="object-cover"
              />
            </div>
            <div className="mt-3">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink/70">
                Image URL / Path
              </label>
              <input
                type="text"
                value={promoImages.communityBg}
                onChange={(e) => setPromoImages((v) => ({ ...v, communityBg: e.target.value }))}
                placeholder="/images/community/community-1.jpg"
                className="mt-1 w-full rounded border border-hairline bg-white px-2.5 py-1.5 text-xs text-ink placeholder:text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Section Order & Visibility */}
        <section className="card-base p-6">
          <h2 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.14em]">
            <Home aria-hidden className="h-4 w-4 text-brand" /> Section order &amp; visibility
          </h2>
          <p className="mt-1 text-xs text-muted">Toggle any section on or off on the public landing page.</p>
          <ol className="mt-4 space-y-2">
            {SECTIONS.map((s, i) => (
              <li key={s} className="flex items-center justify-between gap-3 rounded-md border border-hairline bg-cream px-3.5 py-2.5">
                <span className="flex items-center gap-3 text-[13px] font-semibold">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-[4px] bg-gold font-display text-[11px] font-bold text-ink">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {s}
                </span>
                <Checkbox
                  id={`sec-${s}`}
                  label={<span className="sr-only">Enable {s}</span>}
                  checked={enabled[s]}
                  onChange={(e) => setEnabled((v) => ({ ...v, [s]: e.target.checked }))}
                />
              </li>
            ))}
          </ol>
        </section>

        <div className="space-y-6">
          {/* Hero Copy Settings */}
          <section className="card-base p-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-[0.14em]">Hero Copy &amp; Branding</h2>
            <div className="mt-4 space-y-5">
              <Field label="Hero Eyebrow / Kicker" htmlFor="hp-kicker" hint="Top tag shown above headline">
                <Input id="hp-kicker" value={heroKicker} onChange={(e) => setHeroKicker(e.target.value)} />
              </Field>
              <div className="rounded-md border border-hairline bg-cream p-3 text-xs text-muted">
                <p className="font-semibold text-ink">Brand Motto:</p>
                <p className="mt-0.5">“Students are Watching, Observing &amp; Learning”</p>
                <p className="mt-2 font-semibold text-ink">Locked Brand Headline:</p>
                <p className="mt-0.5">“Your Campus. Your Voice. Your Future.”</p>
              </div>
            </div>
          </section>

          {/* Campaign Highlight */}
          <section className="card-base p-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-[0.14em]">Campaign highlight</h2>
            <div className="mt-4">
              <Field label="Flagship campaign URL" htmlFor="hp-camp" hint="Shown in the flagship campaign section CTAs">
                <Input id="hp-camp" value={campaignHref} onChange={(e) => setCampaignHref(e.target.value)} />
              </Field>
            </div>
          </section>

          <div className="flex justify-end">
            <Button size="md" onClick={handleSave} disabled={saving} arrow>
              <Save className="h-4 w-4" /> Save All Homepage Settings &amp; Images
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
