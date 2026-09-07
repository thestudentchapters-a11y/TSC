'use client';

import { useState } from 'react';
import { Globe, Instagram, MessageCircle, Youtube, Linkedin, Facebook } from 'lucide-react';
import { Field, Input } from '@/components/forms/Form';
import { Button } from '@/components/common/Button';
import { useToast } from '@/components/common/Toast';
import { site } from '@/lib/site';

export default function AdminSocialLinksPage() {
  const { push } = useToast();
  const [links, setLinks] = useState({
    instagram: site.social.instagram,
    youtube: site.social.youtube,
    linkedin: site.social.linkedin,
    facebook: site.social.facebook,
    whatsapp: site.whatsappUrl,
    konnectx: site.konnectxUrl,
  });
  const set = (k: keyof typeof links, v: string) => setLinks((l) => ({ ...l, [k]: v }));

  const rows: { key: keyof typeof links; label: string; icon: typeof Instagram; hint: string }[] = [
    { key: 'instagram', label: 'Instagram', icon: Instagram, hint: 'Official handle: instagram.com/studentchapters' },
    { key: 'youtube', label: 'YouTube', icon: Youtube, hint: 'Official channel: youtube.com/channel/UC8IGnEOSxDVqd1AviLa-5qA' },
    { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, hint: 'Company page: in.linkedin.com/company/the-student-chapters' },
    { key: 'facebook', label: 'Facebook', icon: Facebook, hint: 'Official page: facebook.com/people/The-Student-Chapters/61562542822959/' },
    { key: 'whatsapp', label: 'WhatsApp Community', icon: MessageCircle, hint: 'Invite link for the TSC community channel' },
    { key: 'konnectx', label: 'KonnectX', icon: Globe, hint: 'Official platform: konnectx.app' },
  ];

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow">Configuration</p>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight">Social Links</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Channel URLs shown across the site (footer, community section, contact page). Empty values render
          as “to be configured” placeholders — never broken links. All external links open in a new tab.
        </p>
      </div>

      <section className="card-base max-w-2xl space-y-5 p-6">
        {rows.map((r) => {
          const Icon = r.icon;
          return (
            <Field key={r.key} label={r.label} htmlFor={`sl-${r.key}`} hint={r.hint}>
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] border border-hairline bg-cream text-brand">
                  <Icon aria-hidden className="h-4 w-4" />
                </span>
                <Input id={`sl-${r.key}`} value={links[r.key]} onChange={(e) => set(r.key, e.target.value)} placeholder="https://…" />
              </div>
            </Field>
          );
        })}
        <div className="flex justify-end border-t border-hairline pt-5">
          <Button size="sm" onClick={() => push('Social links saved — SiteSettings update (demo).', 'success')} arrow>
            Save Links
          </Button>
        </div>
      </section>
    </div>
  );
}
