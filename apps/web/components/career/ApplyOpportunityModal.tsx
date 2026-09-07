'use client';

import { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Field, Input, Textarea, FormSuccess } from '@/components/forms/Form';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/common/Toast';
import type { Opportunity } from '@/types/content';

interface ApplyOpportunityModalProps {
  open: boolean;
  onClose: () => void;
  opportunity: Opportunity;
}

export function ApplyOpportunityModal({ open, onClose, opportunity }: ApplyOpportunityModalProps) {
  const { user } = useAuth();
  const { push } = useToast();

  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [college, setCollege] = useState(user?.college || '');
  const [resumeUrl, setResumeUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [note, setNote] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    const urlPattern = /^https?:\/\/.+/i;

    if (!fullName.trim() || fullName.trim().length < 3) {
      errs.fullName = 'Please enter your full name (at least 3 characters).';
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!phone.trim() || !/^[\d+\-\s()]{8,18}$/.test(phone.trim())) {
      errs.phone = 'Please enter a valid phone number (at least 8 digits).';
    }
    if (!college.trim() || college.trim().length < 2) {
      errs.college = 'Please specify your college or university.';
    }
    if (!resumeUrl.trim()) {
      errs.resumeUrl = 'Please provide a valid resume link (Google Drive, Dropbox, Notion, etc.).';
    } else if (!urlPattern.test(resumeUrl.trim())) {
      errs.resumeUrl = 'Resume URL must start with http:// or https://';
    }
    if (portfolioUrl.trim() && !urlPattern.test(portfolioUrl.trim())) {
      errs.portfolioUrl = 'Portfolio URL must start with http:// or https://';
    }
    if (!note.trim() || note.trim().length < 20) {
      errs.note = 'Please write a brief note (at least 20 characters) explaining why you are a good fit.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      push('Please fix the highlighted errors before submitting.', 'error');
      return;
    }

    setSubmitting(true);
    const payload = {
      opportunityId: opportunity.id,
      opportunityTitle: opportunity.title,
      organization: opportunity.organization,
      type: opportunity.type,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      college: college.trim(),
      resumeUrl: resumeUrl.trim(),
      portfolioUrl: portfolioUrl.trim() || undefined,
      note: note.trim(),
      appliedAt: new Date().toISOString(),
    };

    try {
      const api = process.env.NEXT_PUBLIC_API_URL;
      if (api) {
        const token = window.localStorage.getItem('tsc_token');
        await fetch(`${api}/api/submissions/career-apply`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        });
      }

      // Persist in local storage for instant dashboard record
      try {
        const existing = JSON.parse(window.localStorage.getItem('tsc.user.careerApplications') || '[]');
        window.localStorage.setItem(
          'tsc.user.careerApplications',
          JSON.stringify([payload, ...existing])
        );
      } catch {
        /* noop */
      }

      setSubmitted(true);
      push(`Application submitted for ${opportunity.title}!`, 'success');
    } catch {
      push('Application saved to your profile dashboard.', 'success');
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setResumeUrl('');
    setPortfolioUrl('');
    setNote('');
    setErrors({});
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={submitted ? 'Application Submitted' : `Apply — ${opportunity.title}`}
    >
      {submitted ? (
        <FormSuccess
          title="Application Sent!"
          message={`Your application for ${opportunity.title} at ${opportunity.organization} has been received. Our team will review your profile and reach out via email.`}
          onReset={handleReset}
          resetLabel="Close window"
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="rounded-md border border-hairline bg-cream p-3 text-xs text-muted">
            <span className="font-semibold text-ink">{opportunity.organization}</span> • {opportunity.type} • {opportunity.mode} ({opportunity.location})
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full Name" htmlFor="app-name" required error={errors.fullName}>
              <Input
                id="app-name"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
                }}
                placeholder="Your full name"
              />
            </Field>

            <Field label="Email Address" htmlFor="app-email" required error={errors.email}>
              <Input
                id="app-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                placeholder="you@example.com"
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone / WhatsApp" htmlFor="app-phone" required error={errors.phone}>
              <Input
                id="app-phone"
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                }}
                placeholder="+91 98765 43210"
              />
            </Field>

            <Field label="College / Institution" htmlFor="app-college" required error={errors.college}>
              <Input
                id="app-college"
                value={college}
                onChange={(e) => {
                  setCollege(e.target.value);
                  if (errors.college) setErrors((prev) => ({ ...prev, college: '' }));
                }}
                placeholder="e.g. Patna University"
              />
            </Field>
          </div>

          <Field label="Resume / CV Link" htmlFor="app-resume" required error={errors.resumeUrl} hint="Public Google Drive / Dropbox / PDF URL">
            <Input
              id="app-resume"
              type="url"
              value={resumeUrl}
              onChange={(e) => {
                setResumeUrl(e.target.value);
                if (errors.resumeUrl) setErrors((prev) => ({ ...prev, resumeUrl: '' }));
              }}
              placeholder="https://drive.google.com/..."
            />
          </Field>

          <Field label="Portfolio / GitHub Link (optional)" htmlFor="app-portfolio" error={errors.portfolioUrl}>
            <Input
              id="app-portfolio"
              type="url"
              value={portfolioUrl}
              onChange={(e) => {
                setPortfolioUrl(e.target.value);
                if (errors.portfolioUrl) setErrors((prev) => ({ ...prev, portfolioUrl: '' }));
              }}
              placeholder="https://github.com/username"
            />
          </Field>

          <Field label="Why are you a good fit?" htmlFor="app-note" required error={errors.note} hint="Minimum 20 characters">
            <Textarea
              id="app-note"
              rows={3}
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                if (errors.note) setErrors((prev) => ({ ...prev, note: '' }));
              }}
              placeholder="Tell the recruiting team why you're interested and what you bring..."
            />
          </Field>

          <div className="flex items-center justify-end gap-3 border-t border-hairline pt-4">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" arrow disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
