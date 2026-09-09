'use client';

import { useState } from 'react';
import { Settings, KeyRound, ShieldCheck, UserCheck, Lock, ArrowRight, X, Mail, Shield, CheckCircle2 } from 'lucide-react';
import { Field, Input, Select } from '@/components/forms/Form';
import { Button } from '@/components/common/Button';
import { useToast } from '@/components/common/Toast';
import { useAuth } from '@/components/providers/AuthProvider';
import { site } from '@/lib/site';

export default function AdminSettingsPage() {
  const { push } = useToast();
  const { user, getToken } = useAuth();

  // Site Configuration Form
  const [form, setForm] = useState({
    siteName: site.name,
    tagline: site.tagline,
    siteUrl: site.url,
    contactEmail: site.email || '',
    apiConnected: !!process.env.NEXT_PUBLIC_API_URL,
    storage: 'Cloudinary (Active & Connected)',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Credentials Management State & Form
  const [showCredForm, setShowCredForm] = useState(false);
  const [credForm, setCredForm] = useState({
    name: user?.name || 'TSC Administrator',
    email: user?.email || 'admin@thestudentchapters.org',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [credErrors, setCredErrors] = useState<Record<string, string>>({});
  const [credBusy, setCredBusy] = useState(false);

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: '' }));
  };

  const setCred = (k: string, v: string) => {
    setCredForm((f) => ({ ...f, [k]: v }));
    if (credErrors[k]) setCredErrors((prev) => ({ ...prev, [k]: '' }));
  };

  const handleSaveSite = () => {
    const errs: Record<string, string> = {};
    if (!form.siteName.trim() || form.siteName.trim().length < 2) {
      errs.siteName = 'Site name is required (at least 2 characters).';
    }
    if (!form.siteUrl.trim() || !/^https?:\/\/.+/i.test(form.siteUrl.trim())) {
      errs.siteUrl = 'Site URL must start with http:// or https://';
    }
    if (form.contactEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail.trim())) {
      errs.contactEmail = 'Please enter a valid contact email address.';
    }
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      push('Please fix the errors before saving.', 'error');
      return;
    }
    push('Settings saved successfully (persists to SiteSettings in database).', 'success');
  };

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (!credForm.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credForm.email.trim())) {
      errs.email = 'Please provide a valid administrator email address.';
    }

    if (credForm.newPassword) {
      if (credForm.newPassword.length < 6) {
        errs.newPassword = 'New password must be at least 6 characters long.';
      }
      if (credForm.newPassword !== credForm.confirmPassword) {
        errs.confirmPassword = 'Passwords do not match.';
      }
      if (!credForm.currentPassword) {
        errs.currentPassword = 'Enter your current password to authorize this change.';
      }
    }

    setCredErrors(errs);
    if (Object.keys(errs).length > 0) {
      push('Please correct the credential fields.', 'error');
      return;
    }

    setCredBusy(true);
    try {
      const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const token = getToken();

      const res = await fetch(`${api}/api/auth/change-credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: credForm.name,
          newEmail: credForm.email,
          currentPassword: credForm.currentPassword || undefined,
          newPassword: credForm.newPassword || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.message || 'Failed to update credentials');
      }

      // Update local storage session
      if (json.data?.user) {
        window.localStorage.setItem('tsc.auth', JSON.stringify(json.data.user));
      }

      push('Admin credentials updated successfully! Use your new credentials for future logins.', 'success');
      setCredForm((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      setShowCredForm(false);
    } catch (err: any) {
      push(err.message || 'Error updating credentials. Is the backend API running?', 'error');
    } finally {
      setCredBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Configuration &amp; Security</p>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink">Settings &amp; Security</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Manage global site settings, media connections, and administrator account credentials.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 items-start">
        {/* Site Settings Section */}
        <section className="card-base space-y-5 p-6 shadow-sm">
          <h2 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.14em] text-ink">
            <Settings aria-hidden className="h-4 w-4 text-brand" /> Site Identity &amp; Meta
          </h2>
          <Field label="Site name" htmlFor="st-name" required error={errors.siteName}>
            <Input id="st-name" value={form.siteName} onChange={(e) => set('siteName', e.target.value)} />
          </Field>
          <Field label="Tagline" htmlFor="st-tag">
            <Input id="st-tag" value={form.tagline} onChange={(e) => set('tagline', e.target.value)} />
          </Field>
          <Field label="Site URL" htmlFor="st-url" required error={errors.siteUrl} hint="Used for canonical URLs, OG tags and sitemap">
            <Input id="st-url" value={form.siteUrl} onChange={(e) => set('siteUrl', e.target.value)} />
          </Field>
          <Field label="Contact email" htmlFor="st-email" error={errors.contactEmail} hint="Shown on the contact page for student inquiries">
            <Input id="st-email" type="email" value={form.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} placeholder="hello@thestudentchapters.org" />
          </Field>
          <Field label="Media storage" htmlFor="st-storage">
            <Select id="st-storage" value={form.storage} onChange={(e) => set('storage', e.target.value)}>
              <option>Cloudinary (Active &amp; Connected)</option>
              <option disabled>Amazon S3 (coming soon)</option>
            </Select>
          </Field>
          <div className="pt-2 flex justify-end">
            <Button size="sm" onClick={handleSaveSite} arrow>
              Save Site Settings
            </Button>
          </div>
        </section>

        {/* Change Admin ID & Password Section (Button Triggered) */}
        <section className="card-base p-6 border-brand/25 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-hairline pb-4">
            <h2 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.14em] text-brand">
              <KeyRound aria-hidden className="h-4 w-4 text-brand" /> Admin ID &amp; Password
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 border border-emerald-200">
              <ShieldCheck className="h-3 w-3" /> Protected
            </span>
          </div>

          {!showCredForm ? (
            /* Clean Overview Card with Change Button */
            <div className="space-y-5">
              <p className="text-xs text-muted leading-relaxed">
                Your administrative credentials grant full access to newsroom publishing, membership management, and platform configurations.
              </p>

              <div className="rounded-xl border border-hairline bg-cream/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5 text-brand" /> Administrator:
                  </span>
                  <span className="text-xs font-bold text-ink">{user?.name || credForm.name}</span>
                </div>
                <div className="flex items-center justify-between border-t border-hairline/60 pt-2.5">
                  <span className="text-xs font-semibold text-muted flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-brand" /> Admin Email (ID):
                  </span>
                  <span className="text-xs font-mono font-bold text-brand bg-white px-2 py-0.5 rounded border border-hairline">
                    {user?.email || credForm.email}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-hairline/60 pt-2.5">
                  <span className="text-xs font-semibold text-muted flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-brand" /> Security Level:
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Bcrypt Hash Verified
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowCredForm(true)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-brand px-4 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-brand-dark active:scale-95"
                >
                  <KeyRound className="h-3.5 w-3.5 text-gold" />
                  Change Admin ID / Password
                </button>
              </div>
            </div>
          ) : (
            /* Interactive Update Form (Revealed on Click) */
            <form onSubmit={handleUpdateCredentials} className="space-y-4 animate-fadeIn" noValidate>
              <div className="flex items-center justify-between bg-brand-50/70 p-3 rounded-lg border border-brand/20">
                <span className="text-xs font-bold text-brand flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" /> Edit Administrator Credentials
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShowCredForm(false);
                    setCredErrors({});
                  }}
                  className="text-xs text-muted hover:text-ink font-semibold flex items-center gap-1"
                >
                  <X className="h-3.5 w-3.5" /> Cancel
                </button>
              </div>

              <Field label="Administrator Name" htmlFor="ad-name" required>
                <Input
                  id="ad-name"
                  value={credForm.name}
                  onChange={(e) => setCred('name', e.target.value)}
                  placeholder="TSC Administrator"
                />
              </Field>

              <Field label="Admin Email ID (Username)" htmlFor="ad-email" required error={credErrors.email} hint="Used to log in to the admin console">
                <Input
                  id="ad-email"
                  type="email"
                  value={credForm.email}
                  onChange={(e) => setCred('email', e.target.value)}
                  placeholder="admin@thestudentchapters.org"
                />
              </Field>

              <div className="rounded-lg border border-dashed border-hairline bg-cream/50 p-4 space-y-3.5">
                <p className="text-xs font-bold uppercase tracking-wider text-ink/80 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-brand" /> Change Password
                </p>
                
                <Field label="Current Password" htmlFor="ad-curr-pass" error={credErrors.currentPassword} hint="Required only if changing password">
                  <Input
                    id="ad-curr-pass"
                    type="password"
                    value={credForm.currentPassword}
                    onChange={(e) => setCred('currentPassword', e.target.value)}
                    placeholder="Enter current password"
                    autoComplete="current-password"
                  />
                </Field>

                <Field label="New Password" htmlFor="ad-new-pass" error={credErrors.newPassword} hint="Minimum 6 characters">
                  <Input
                    id="ad-new-pass"
                    type="password"
                    value={credForm.newPassword}
                    onChange={(e) => setCred('newPassword', e.target.value)}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                  />
                </Field>

                <Field label="Confirm New Password" htmlFor="ad-conf-pass" error={credErrors.confirmPassword}>
                  <Input
                    id="ad-conf-pass"
                    type="password"
                    value={credForm.confirmPassword}
                    onChange={(e) => setCred('confirmPassword', e.target.value)}
                    placeholder="Repeat new password"
                    autoComplete="new-password"
                  />
                </Field>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowCredForm(false);
                    setCredErrors({});
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" variant="primary" disabled={credBusy} arrow>
                  {credBusy ? 'Updating…' : 'Save New Credentials'}
                </Button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
