'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, FileText, Info, Send, Sparkles } from 'lucide-react';
import { Field, Input, Select, Textarea } from '@/components/forms/Form';
import { Button } from '@/components/common/Button';
import { useToast } from '@/components/common/Toast';
import { useAuth } from '@/components/providers/AuthProvider';

const CATEGORIES = [
  { value: 'student', label: 'Student Journey & Achievements' },
  { value: 'startup', label: 'Student Entrepreneurship & Innovation' },
  { value: 'campus', label: 'Campus Culture & Activities' },
];

export default function SubmitArticlePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { push } = useToast();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('student');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [college, setCollege] = useState(user?.college ?? '');
  const [city, setCity] = useState(user?.city ?? '');
  const [state, setState] = useState('Bihar');
  const [videoUrl, setVideoUrl] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim() || title.trim().length < 6) {
      errs.title = 'Please provide an engaging title of at least 6 characters.';
    }
    if (!content.trim() || content.trim().length < 80) {
      errs.content = 'Please write at least 80 characters for your story content.';
    }
    if (image.trim() && !/^(https?:\/\/|\/images\/|\/)/i.test(image.trim())) {
      errs.image = 'Image must be a valid URL (https://...) or image path (/images/...).';
    }
    if (videoUrl.trim() && !/^https?:\/\/.+/i.test(videoUrl.trim())) {
      errs.videoUrl = 'Video URL must start with http:// or https://.';
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
      name: user?.name || 'TSC Member',
      email: user?.email || 'member@tsc.demo',
      college: college || 'University / College',
      city: city || 'Patna',
      state: state || 'Bihar',
      title: title.trim(),
      category,
      content: content.trim(),
      summary: summary.trim(),
      images: image.trim() ? [image.trim()] : [],
      videoUrl: videoUrl.trim() || undefined,
    };

    const api = process.env.NEXT_PUBLIC_API_URL;
    let savedToApi = false;

    if (api) {
      try {
        const token = window.localStorage.getItem('tsc_token');
        const res = await fetch(`${api}/api/submissions/story`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          savedToApi = true;
        }
      } catch {
        /* fallback to local storage */
      }
    }

    // Also store in local submissions list for instant dashboard preview
    try {
      const existing = JSON.parse(window.localStorage.getItem('tsc.member.submissions') || '[]');
      const newSubmission = {
        id: 'sub-' + Date.now(),
        title: payload.title,
        category: payload.category,
        content: payload.content,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        image: image.trim() || '/images/hero/hero-collab.jpg',
      };
      window.localStorage.setItem('tsc.member.submissions', JSON.stringify([newSubmission, ...existing]));
    } catch {
      /* noop */
    }

    setSubmitting(false);
    setSubmitted(true);
    push(
      savedToApi
        ? 'Article submitted! Our editorial team will review it shortly.'
        : 'Article submitted for editorial review (saved locally).',
      'success'
    );
  };

  if (submitted) {
    return (
      <div className="container-tsc pb-24 pt-32">
        <div className="card-base mx-auto max-w-lg p-8 text-center sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <p className="eyebrow mt-5 text-center">Submission Received</p>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Article Sent for Review
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            Thank you for contributing to THE STUDENT CHAPTERS™! As a registered member, your submission
            has entered the editorial review queue. Once approved by an Admin/Editor, your article will go live
            across the TSC network.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href="/dashboard" size="md" arrow>
              Return to Dashboard
            </Button>
            <Button variant="outline" size="md" onClick={() => { setSubmitted(false); setTitle(''); setContent(''); setSummary(''); setImage(''); }}>
              Submit Another Article
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-tsc pb-24 pt-28 sm:pt-32">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted transition-colors hover:text-brand"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </Link>

        <div className="mt-4 border-b border-hairline pb-6">
          <p className="eyebrow">Member Portal</p>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Write &amp; Submit an Article
          </h1>
          <p className="mt-1 text-sm text-muted">
            Share student experiences, campus initiatives, startup journeys, or academic insights.
          </p>
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-lg border border-gold/40 bg-gold-50 p-4 text-xs leading-5 text-ink/80">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" />
          <div>
            <p className="font-bold text-ink">Member Publishing Policy</p>
            <p className="mt-0.5">
              Member articles are submitted to our editorial review team before going live. Admins verify authenticity, formatting, and adherence to community guidelines before publishing.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card-base mt-8 space-y-6 p-6 sm:p-8" noValidate>
          <Field label="Article Title" htmlFor="art-title" required error={errors.title} hint="Make it engaging and specific">
            <Input
              id="art-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. How Our Campus Solar Club Built an EV Prototype"
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Category" htmlFor="art-cat" required>
              <Select id="art-cat" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Cover Image URL" htmlFor="art-img" error={errors.image} hint="Optional public URL or /images/hero/ path">
              <Input
                id="art-img"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="/images/hero/hero-founder.jpg"
              />
            </Field>
          </div>

          <Field label="Short Excerpt / Summary" htmlFor="art-summary" hint="1-2 sentences summarizing the story">
            <Textarea
              id="art-summary"
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="A brief teaser for the story feed..."
            />
          </Field>

          <Field label="Article Content" htmlFor="art-content" required error={errors.content} hint="Share your full story, lessons, and takeaways (minimum 80 characters)">
            <Textarea
              id="art-content"
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your article here..."
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="College / University / School" htmlFor="art-college">
              <Input
                id="art-college"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="e.g. IIT Patna"
              />
            </Field>
            <Field label="City" htmlFor="art-city">
              <Input
                id="art-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Patna"
              />
            </Field>
            <Field label="State" htmlFor="art-state">
              <Input
                id="art-state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Bihar"
              />
            </Field>
          </div>

          <Field label="Optional Video / Project Link" htmlFor="art-video" error={errors.videoUrl} hint="YouTube video, LinkedIn post or project repo">
            <Input
              id="art-video"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
            />
          </Field>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-6">
            <p className="text-xs text-muted">
              By submitting, you agree to THE STUDENT CHAPTERS™ community guidelines.
            </p>
            <Button size="md" disabled={submitting} arrow>
              <Send className="h-4 w-4" /> {submitting ? 'Submitting…' : 'Submit Article for Review'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
