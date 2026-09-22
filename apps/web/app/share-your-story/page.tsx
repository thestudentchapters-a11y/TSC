'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { UploadCloud, Link as LinkIcon, Image as ImageIcon, Loader2, X, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Field, Input, Select, Textarea, Checkbox, FormSuccess } from '@/components/forms/Form';
import { Button } from '@/components/common/Button';
import { useToast } from '@/components/common/Toast';

const CATEGORIES = ['Achievement', 'Startup / Entrepreneurship', 'Project or Research', 'Social Initiative', 'Art / Creative Work', 'Failure & Learning', 'Campus Life', 'Other'];
const STATES = ['Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Other'];

export default function ShareYourStoryPage() {
  const { push } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [honey, setHoney] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageMode, setImageMode] = useState<'file' | 'url'>('file');

  const [form, setForm] = useState({
    name: '', email: '', phone: '', college: '', city: '', state: '',
    title: '', category: '', content: '', videoUrl: '', social: '', consent: false,
  });
  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingImage(true);

    const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const token = typeof window !== 'undefined' ? localStorage.getItem('tsc_token') : null;

    try {
      const file = files[0];
      if (!file.type.startsWith('image/')) {
        push('Please select a valid image file (JPG, PNG, WebP).', 'error');
        setUploadingImage(false);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        push('Image size exceeds 10MB limit.', 'error');
        setUploadingImage(false);
        return;
      }

      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        // Upload to server media endpoint if available
        let finalUrl = base64;
        try {
          const res = await fetch(`${api}/api/media/upload`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              file: base64,
              altText: file.name.replace(/\.[^/.]+$/, ''),
            }),
          });
          const json = await res.json().catch(() => ({}));
          if (res.ok && json.url) {
            finalUrl = json.url;
          }
        } catch {
          // Keep base64 data url as fallback
        }

        setImages((prev) => [...prev, finalUrl]);
        push('Image attached successfully!', 'success');
        setUploadingImage(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.readAsDataURL(file);
    } catch {
      push('Failed to process image file.', 'error');
      setUploadingImage(false);
    }
  };

  const handleAddImageUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;
    if (!/^https?:\/\/.+/i.test(trimmed)) {
      push('Please enter a valid image URL starting with http:// or https://', 'error');
      return;
    }
    setImages((prev) => [...prev, trimmed]);
    setImageUrlInput('');
    push('Image URL added.', 'success');
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 3) e.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email.';
    if (form.phone.trim() && !/^[\d+\-\s()]{8,18}$/.test(form.phone.trim())) {
      e.phone = 'Please enter a valid phone number (at least 8 digits).';
    }
    if (!form.college.trim()) e.college = 'Please enter your college, university, or school.';
    if (!form.city.trim()) e.city = 'Please enter your city.';
    if (!form.state) e.state = 'Please select your state.';
    if (form.title.trim().length < 6) e.title = 'Give your story a title (at least 6 characters).';
    if (!form.category) e.category = 'Choose a story category.';
    if (form.content.trim().length < 100) e.content = 'Tell us a bit more — at least 100 characters.';
    if (form.videoUrl.trim() && !/^(https?:\/\/|\/|www\.).+/i.test(form.videoUrl.trim())) {
      e.videoUrl = 'Please enter a valid video link starting with http:// or https://.';
    }
    if (!form.consent) e.consent = 'Please confirm consent so we can review your story.';
    setErrors(e);
    if (Object.keys(e).length > 0) {
      const fieldIdMap: Record<string, string> = {
        name: 's-name',
        email: 's-email',
        phone: 's-phone',
        college: 's-college',
        city: 's-city',
        state: 's-state',
        title: 's-title',
        category: 's-cat',
        content: 's-content',
        videoUrl: 's-video',
        consent: 's-consent',
      };
      const firstKey = Object.keys(e)[0];
      const targetId = fieldIdMap[firstKey] || `s-${firstKey}`;
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus();
      }
      return false;
    }
    return true;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (honey) return;
    if (!validate()) {
      push('Please fix the highlighted required fields before submitting.', 'error');
      return;
    }
    setBusy(true);
    try {
      const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const payload = {
        ...form,
        image: images[0] || undefined,
        images,
      };

      const res = await fetch(`${api}/api/submissions/story`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || json.error || 'Submission failed');

      setDone(true);
      push('Story submitted — our editors will review it soon.', 'success');
    } catch (err) {
      push(err instanceof Error ? err.message : 'Submission failed. Please try again.', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="09 — Your Voice Matters"
        title="✍️ Share Your Story"
        description="Built something? Won something? Failed at something? Started again? Discovered something new? Tell us your story — your journey could inspire someone else."
      />

      <section className="section-pad">
        <div className="container-tsc max-w-3xl">
          {done ? (
            <FormSuccess
              title="Thank you for sharing."
              message="Your story and images have entered the TSC editorial review queue. Our editors read every submission — once approved, your story will be published to THE STUDENT CHAPTERS™!"
              onReset={() => {
                setDone(false);
                setImages([]);
              }}
              resetLabel="Submit another story"
            />
          ) : (
            <form onSubmit={submit} className="card-base space-y-5 p-6 sm:p-8" noValidate>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Your name" htmlFor="s-name" required error={errors.name}>
                  <Input id="s-name" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Full name" autoComplete="name" />
                </Field>
                <Field label="Email" htmlFor="s-email" required error={errors.email}>
                  <Input id="s-email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" autoComplete="email" />
                </Field>
                <Field label="Phone (optional)" htmlFor="s-phone" error={errors.phone}>
                  <Input id="s-phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+91…" autoComplete="tel" />
                </Field>
                <Field label="College / University / School" htmlFor="s-college" required error={errors.college}>
                  <Input id="s-college" value={form.college} onChange={(e) => set('college', e.target.value)} placeholder="Your institution" />
                </Field>
                <Field label="City" htmlFor="s-city" required error={errors.city}>
                  <Input id="s-city" value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Your city" />
                </Field>
                <Field label="State" htmlFor="s-state" required error={errors.state}>
                  <Select id="s-state" value={form.state} onChange={(e) => set('state', e.target.value)}>
                    <option value="">Select state</option>
                    {STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </Select>
                </Field>
              </div>

              <Field label="Story title" htmlFor="s-title" required error={errors.title}>
                <Input id="s-title" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. How our team built a flood-alert prototype" />
              </Field>

              <Field label="Story category" htmlFor="s-cat" required error={errors.category}>
                <Select id="s-cat" value={form.category} onChange={(e) => set('category', e.target.value)}>
                  <option value="">Choose category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>
              </Field>

              <Field label="Your story" htmlFor="s-content" required error={errors.content} hint="Where did it start? What happened along the way? What did you learn? (min 100 characters)">
                <Textarea id="s-content" value={form.content} onChange={(e) => set('content', e.target.value)} placeholder="Tell us the journey — the beginning, the struggles, the turning points…" className="min-h-[180px]" />
              </Field>

              {/* Enhanced Interactive Image Upload Component */}
              <div className="space-y-2 rounded-lg border border-hairline bg-cream/40 p-4">
                <div className="flex items-center justify-between">
                  <label className="font-display text-xs font-bold uppercase tracking-wider text-ink">
                    Story Images / Photo Proof
                  </label>
                  <div className="flex items-center gap-1 rounded bg-cream p-0.5 text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setImageMode('file')}
                      className={`rounded px-2.5 py-1 transition-all ${
                        imageMode === 'file' ? 'bg-brand text-white shadow-xs' : 'text-muted hover:text-ink'
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode('url')}
                      className={`rounded px-2.5 py-1 transition-all ${
                        imageMode === 'url' ? 'bg-brand text-white shadow-xs' : 'text-muted hover:text-ink'
                      }`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {imageMode === 'file' ? (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="hidden"
                      id="story-image-upload"
                    />
                    <label
                      htmlFor="story-image-upload"
                      className={`flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-hairline bg-white px-6 py-6 text-center transition-colors hover:border-brand hover:bg-brand-50/20 ${
                        uploadingImage ? 'pointer-events-none opacity-60' : ''
                      }`}
                    >
                      {uploadingImage ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="h-6 w-6 animate-spin text-brand" />
                          <span className="text-xs font-semibold text-muted">Processing and attaching image…</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <UploadCloud className="h-7 w-7 text-brand" />
                          <div>
                            <span className="text-xs font-bold text-brand hover:underline">Click to browse</span>{' '}
                            <span className="text-xs text-muted">or drag and drop your photo</span>
                          </div>
                          <span className="text-[10.5px] text-muted">Supports PNG, JPG, WebP up to 10MB</span>
                        </div>
                      )}
                    </label>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      id="story-img-url"
                      type="url"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      placeholder="https://example.com/photo.jpg"
                      className="flex-1 text-xs"
                    />
                    <Button type="button" size="sm" variant="outline" onClick={handleAddImageUrl}>
                      Add URL
                    </Button>
                  </div>
                )}

                {/* Attached Images Previews */}
                {images.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-3">
                    {images.map((imgUrl, idx) => (
                      <div key={idx} className="group relative aspect-video overflow-hidden rounded-md border border-hairline bg-white shadow-xs">
                        {imgUrl.startsWith('data:') || imgUrl.startsWith('http') || imgUrl.startsWith('/') ? (
                          <img src={imgUrl} alt={`Story visual ${idx + 1}`} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-cream text-xs text-muted">Attached</div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink/80 text-white opacity-90 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                          title="Remove image"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Video URL (optional)" htmlFor="s-video" error={errors.videoUrl}>
                  <Input id="s-video" value={form.videoUrl} onChange={(e) => set('videoUrl', e.target.value)} placeholder="https://..." />
                </Field>
                <Field label="KonnectX ID / Social links (optional)" htmlFor="s-social" hint="KonnectX ID preferred">
                  <Input id="s-social" value={form.social} onChange={(e) => set('social', e.target.value)} placeholder="KonnectX ID (@handle) / LinkedIn / X" />
                </Field>
              </div>

              <input type="text" name="website" tabIndex={-1} autoComplete="off" value={honey} onChange={(e) => setHoney(e.target.value)} className="hidden" aria-hidden />

              <Checkbox
                id="s-consent"
                label="I confirm this story is my own, and I consent to TSC reviewing, editing and publishing it with credit to me."
                checked={form.consent}
                onChange={(e) => set('consent', e.target.checked)}
                error={errors.consent}
              />

              <div className="flex items-center justify-end gap-3 border-t border-hairline pt-5">
                <Button type="submit" size="lg" disabled={busy} arrow>
                  {busy ? 'Submitting…' : 'Share Your Story'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
