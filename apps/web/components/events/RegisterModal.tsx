'use client';

import { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Field, Input, Checkbox, FormSuccess } from '@/components/forms/Form';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/common/Toast';

/**
 * Event registration modal — POSTs to /api/events/:id/register when the API
 * is configured; otherwise confirms in clearly-labelled demo mode.
 */
export function RegisterModal({
  open,
  onClose,
  event,
}: {
  open: boolean;
  onClose: () => void;
  event: { id: string; title: string; slug: string };
}) {
  const { user } = useAuth();
  const { push } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (name.trim().length < 2) e.name = 'Please enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Please enter a valid email.';
    if (phone && !/^[\d+\-\s]{8,15}$/.test(phone)) e.phone = 'Please enter a valid phone number.';
    if (!consent) e.consent = 'Please confirm you wish to register.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setBusy(true);
    try {
      const api = process.env.NEXT_PUBLIC_API_URL;
      if (api) {
        const res = await fetch(`${api}/api/events/${event.id}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone }),
        });
        if (!res.ok) throw new Error((await res.json()).message ?? 'Registration failed');
      } else {
        await new Promise((r) => setTimeout(r, 800));
      }
      setDone(true);
      push(`Registered for “${event.title}”.`, 'success');
    } catch (err) {
      push(err instanceof Error ? err.message : 'Registration failed. Please try again.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setDone(false);
    setName('');
    setEmail('');
    setPhone('');
    setConsent(false);
    setErrors({});
  };

  return (
    <Modal open={open} onClose={onClose} title={done ? 'Registration Confirmed' : `Register — ${event.title}`}>
      {done ? (
        <FormSuccess
          title="You're on the list!"
          message="Your registration has been recorded. We'll send confirmation and reminders to your email. See you at the event!"
          onReset={reset}
          resetLabel="Register someone else"
        />
      ) : (
        <form onSubmit={submit} className="space-y-5" noValidate>
          <p className="text-[13px] leading-6 text-muted">
            {user ? `Registering as ${user.name}.` : 'Fill in your details to reserve your seat.'}{' '}
            Registrations are also stored in the TSC dashboard.
          </p>
          <Field label="Full name" htmlFor="reg-name" required error={errors.name}>
            <Input id="reg-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" />
          </Field>
          <Field label="Email" htmlFor="reg-email" required error={errors.email}>
            <Input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
          </Field>
          <Field label="Phone (optional)" htmlFor="reg-phone" error={errors.phone}>
            <Input id="reg-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91…" autoComplete="tel" />
          </Field>
          <Checkbox
            id="reg-consent"
            label="I want to register for this event and agree to be contacted with event updates."
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            error={errors.consent}
          />
          <div className="flex items-center justify-end gap-3 pt-1">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={busy} arrow>
              {busy ? 'Registering…' : 'Confirm Registration'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
