'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Briefcase,
  GraduationCap,
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Building2,
  FileText,
  Link2,
  Linkedin,
  HelpCircle,
  Users,
  Compass,
  Zap,
  PenTool,
  Video,
  Code2,
  Palette,
  Megaphone,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/common/Button';
import { Reveal, StaggerGrid, StaggerItem } from '@/components/common/Reveal';
import { useToast } from '@/components/common/Toast';

export type HiringType = 'Internship' | 'Job';

interface TrackOption {
  id: string;
  title: string;
  desc: string;
  icon: typeof PenTool;
  popularFor: HiringType[];
}

const TRACKS: TrackOption[] = [
  {
    id: 'Editorial & Content Writing',
    title: 'Editorial & Content Writing',
    desc: 'Research, draft, and publish high-impact articles, investigative pieces, and student stories across national education and youth domains.',
    icon: PenTool,
    popularFor: ['Internship', 'Job'],
  },
  {
    id: 'Campus Journalism & Field Reporting',
    title: 'Campus Journalism & Field News',
    desc: 'Connect directly with university chapters, clubs, student leaders, and festivals to report breaking campus news and ground events.',
    icon: Megaphone,
    popularFor: ['Internship', 'Job'],
  },
  {
    id: 'Video, Reels & Multimedia Production',
    title: 'Video, Reels & Podcast Production',
    desc: 'Create captivating short-form videos, documentaries, student interviews, and edit audio podcast episodes for TSC media channels.',
    icon: Video,
    popularFor: ['Internship', 'Job'],
  },
  {
    id: 'Software Engineering & Web Platform',
    title: 'Full-Stack & Web Engineering',
    desc: 'Build, maintain, and innovate on the Next.js, TypeScript, and MongoDB platforms powering TSC digital media, portals, and student tools.',
    icon: Code2,
    popularFor: ['Internship', 'Job'],
  },
  {
    id: 'UI/UX Design & Brand Visuals',
    title: 'UI/UX & Visual Brand Design',
    desc: 'Craft striking brand illustrations, social editorial layouts, interactive web components, and monthly current affairs edition covers.',
    icon: Palette,
    popularFor: ['Internship', 'Job'],
  },
  {
    id: 'Community, Outreach & Partnerships',
    title: 'Community, Outreach & Events',
    desc: 'Scale the TSC student movement across Indian colleges, coordinate youth summits, workshops, and manage strategic campus partnerships.',
    icon: Users,
    popularFor: ['Internship', 'Job'],
  },
];

const EXPERIENCE_OPTIONS_INTERNSHIP = [
  '1st Year Undergraduate',
  '2nd Year Undergraduate',
  '3rd Year Undergraduate',
  'Final Year Undergraduate',
  'Postgraduate / Masters Student',
  'Recent Graduate (Within 1 Year)',
];

const EXPERIENCE_OPTIONS_JOB = [
  'Recent Graduate (0-1 Year Experience)',
  '1 - 2 Years Experience',
  '2 - 4 Years Experience',
  '4+ Years Experience / Senior Lead',
];

const AVAILABILITY_OPTIONS = [
  'Immediate (Within 1-3 Days)',
  'Within 15 Days',
  'Next Month',
  'Part-Time (15-20 hrs/week)',
  'Full-Time (40 hrs/week)',
  'Flexible / Remote Project-Based',
];

function HiringContent() {
  const searchParams = useSearchParams();
  const { push } = useToast();

  const initialType = (searchParams.get('type') === 'Job' ? 'Job' : 'Internship') as HiringType;
  const [activeType, setActiveType] = useState<HiringType>(initialType);

  useEffect(() => {
    const qType = searchParams.get('type');
    if (qType === 'Job' || qType === 'Internship') {
      setActiveType(qType);
    }
  }, [searchParams]);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    department: 'Editorial & Content Writing',
    experienceLevel: '3rd Year Undergraduate',
    collegeOrCompany: '',
    konnectxId: '',
    linkedinUrl: '',
    portfolioUrl: '',
    resumeUrl: '',
    coverLetter: '',
    availability: 'Immediate (Within 1-3 Days)',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleTypeChange = (type: HiringType) => {
    setActiveType(type);
    setFormData((prev) => ({
      ...prev,
      experienceLevel:
        type === 'Internship' ? EXPERIENCE_OPTIONS_INTERNSHIP[2] : EXPERIENCE_OPTIONS_JOB[0],
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    if (errorMsg) setErrorMsg(null);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    const urlPattern = /^https?:\/\/.+/i;

    if (!formData.fullName.trim() || formData.fullName.trim().length < 3) {
      errs.fullName = 'Please enter your full name (at least 3 characters).';
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!formData.phone.trim() || !/^[\d+\-\s()]{8,18}$/.test(formData.phone.trim())) {
      errs.phone = 'Please enter a valid phone number (at least 8 digits).';
    }
    if (!formData.location.trim() || formData.location.trim().length < 2) {
      errs.location = 'Please enter your current city / location.';
    }
    if (!formData.collegeOrCompany.trim() || formData.collegeOrCompany.trim().length < 2) {
      errs.collegeOrCompany = activeType === 'Internship' ? 'Please specify your college or university.' : 'Please specify your current / past organization or college.';
    }
    if (!formData.resumeUrl.trim()) {
      errs.resumeUrl = 'Please provide a valid URL to your resume / CV (Google Drive, Dropbox, Notion, etc.).';
    } else if (!urlPattern.test(formData.resumeUrl.trim())) {
      errs.resumeUrl = 'Resume URL must start with http:// or https://.';
    }
    if (formData.portfolioUrl.trim() && !urlPattern.test(formData.portfolioUrl.trim())) {
      errs.portfolioUrl = 'Portfolio URL must start with http:// or https://.';
    }
    if (formData.linkedinUrl.trim() && !urlPattern.test(formData.linkedinUrl.trim())) {
      errs.linkedinUrl = 'LinkedIn URL must start with http:// or https://.';
    }
    if (!formData.coverLetter.trim() || formData.coverLetter.trim().length < 30) {
      errs.coverLetter = 'Please write a brief note (at least 30 characters) explaining why you wish to join.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      setErrorMsg('Please correct the highlighted fields below to submit your application.');
      push('Please fill in all required fields properly.', 'error');
      const formElem = document.getElementById('application-form');
      if (formElem) formElem.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);

    const payload = {
      type: activeType,
      ...formData,
    };

    try {
      const api = process.env.NEXT_PUBLIC_API_URL;
      let refId = 'TSC-APP-' + Math.floor(100000 + Math.random() * 900000);

      if (api) {
        const res = await fetch(`${api}/api/hiring`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Failed to submit application');
        }
        if (data?.data?.id) {
          refId = String(data.data.id).slice(-6).toUpperCase();
        }
      }

      // Also persist locally as backup / demo storage
      try {
        const existing = JSON.parse(
          window.localStorage.getItem('tsc.admin.hiringApplications') || '[]'
        );
        existing.unshift({
          _id: refId,
          ...payload,
          status: 'pending',
          createdAt: new Date().toISOString(),
        });
        window.localStorage.setItem(
          'tsc.admin.hiringApplications',
          JSON.stringify(existing.slice(0, 100))
        );
      } catch {
        /* noop */
      }

      setSubmittedId(refId);
      push(`Your ${activeType} application (Ref: #${refId}) has been successfully submitted!`, 'success');
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please check your inputs and try again.');
      push(err.message || 'Could not submit application. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedId(null);
    setErrors({});
    setErrorMsg(null);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      location: '',
      department: 'Editorial & Content Writing',
      experienceLevel:
        activeType === 'Internship' ? EXPERIENCE_OPTIONS_INTERNSHIP[2] : EXPERIENCE_OPTIONS_JOB[0],
      collegeOrCompany: '',
      konnectxId: '',
      linkedinUrl: '',
      portfolioUrl: '',
      resumeUrl: '',
      coverLetter: '',
      availability: 'Immediate (Within 1-3 Days)',
    });
  };

  return (
    <>
      <PageHeader
        eyebrow="Join Our Team"
        title="We're Hiring"
        description="Join our mission to inform, inspire, and empower the next generation. Whether you are looking for an internship or a full-time role across editorial, journalism, media production, engineering, design, or campus community operations — explore open tracks and apply below."
      >
        <div className="flex flex-wrap items-center gap-3 pt-3">
          <button
            type="button"
            onClick={() => handleTypeChange('Internship')}
            className={`inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 font-display text-xs font-bold uppercase tracking-[0.14em] transition-all duration-300 ${activeType === 'Internship'
              ? 'bg-gold text-white shadow-lift ring-2 ring-gold/40'
              : 'border border-ink bg-white/10 text-ink hover:bg-white/20'
              }`}
          >
            <GraduationCap className="h-4 w-4" /> Apply for Internship
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange('Job')}
            className={`inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 font-display text-xs font-bold uppercase tracking-[0.14em] transition-all duration-300 ${activeType === 'Job'
              ? 'bg-gold text-white shadow-lift ring-2 ring-gold/40'
              : 'border border-ink bg-white/10 text-ink hover:bg-white/20'
              }`}
          >
            <Briefcase className="h-4 w-4" /> Apply for Full-Time Job
          </button>
        </div>
      </PageHeader>

      {/* Mode Switcher Banner */}
      <section className="border-b border-hairline bg-white py-8">
        <div className="container-tsc flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div>
            <span className="eyebrow !text-brand">Active Selection</span>
            <h2 className="mt-1 font-display text-2xl font-bold text-ink">
              {activeType === 'Internship' ? 'Internships & Fellowships' : 'Full-Time Positions'}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {activeType === 'Internship'
                ? 'Hands-on roles across editorial, multimedia, design, technology, and campus reporting with stipends and mentorship.'
                : 'Full-time roles across journalism, software engineering, brand design, and community operations.'}
            </p>
          </div>

          <div className="inline-flex rounded-md border border-hairline bg-cream p-1">
            <button
              type="button"
              onClick={() => handleTypeChange('Internship')}
              className={`rounded px-4 py-2 font-display text-xs font-bold uppercase tracking-wider transition-all ${activeType === 'Internship'
                ? 'bg-brand text-white shadow-card'
                : 'text-ink/70 hover:text-brand'
                }`}
            >
              Internship
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('Job')}
              className={`rounded px-4 py-2 font-display text-xs font-bold uppercase tracking-wider transition-all ${activeType === 'Job'
                ? 'bg-brand text-white shadow-card'
                : 'text-ink/70 hover:text-brand'
                }`}
            >
              Full-Time Job
            </button>
          </div>
        </div>
      </section>

      {/* Available Departments & Tracks Grid */}
      <section className="section-pad bg-cream/40">
        <div className="container-tsc">
          <div className="max-w-2xl">
            <p className="eyebrow">Open Tracks</p>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Choose Your Domain
            </h2>
            <p className="mt-2 text-sm text-muted">
              Select the area where your skills and aspirations align best, then complete your application below.
            </p>
          </div>

          <StaggerGrid className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TRACKS.map((t) => {
              const Icon = t.icon;
              const isSelected = formData.department === t.id;
              return (
                <StaggerItem key={t.id}>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, department: t.id }))}
                    className={`card-base card-hover group flex h-full flex-col justify-between p-6 text-left transition-all ${isSelected ? 'border-brand bg-brand-50/50 ring-2 ring-brand' : 'bg-white'
                      }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span
                          className={`flex h-11 w-11 items-center justify-center rounded-[8px] transition-colors ${isSelected
                            ? 'bg-brand text-white'
                            : 'bg-brand-50 text-brand group-hover:bg-brand group-hover:text-white'
                            }`}
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                        {isSelected && (
                          <span className="flex items-center gap-1 rounded-full bg-brand px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                            <CheckCircle2 className="h-3 w-3" /> Selected
                          </span>
                        )}
                      </div>
                      <h3 className="mt-4 font-display text-base font-bold min-h-[1.5rem]">{t.title}</h3>
                      <p className="mt-2 text-xs leading-5 text-muted">{t.desc}</p>
                    </div>
                    <div className="mt-5 border-t border-hairline pt-3 text-[11px] font-semibold text-brand">
                      {isSelected ? '✓ Click to keep selected' : 'Click to select this track'}
                    </div>
                  </button>
                </StaggerItem>
              );
            })}
          </StaggerGrid>
        </div>
      </section>

      {/* Main Application Form Section */}
      <section className="section-pad bg-white" id="application-form">
        <div className="container-tsc max-w-4xl">
          {submittedId ? (
            <Reveal>
              <div className="rounded-xl border border-gold/40 bg-gold-50/50 p-8 text-center sm:p-12">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold text-ink shadow-lift">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <p className="eyebrow mt-6 justify-center !text-gold-deep">Application Received</p>
                <h2 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
                  Thank You, {formData.fullName}!
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-ink/80">
                  Your application for the <strong className="text-brand">{formData.department}</strong> (
                  <span className="font-semibold">{activeType}</span>) position has been securely logged with Reference ID:
                </p>
                <div className="my-5 inline-block rounded-md border border-hairline bg-white px-6 py-3 font-display text-lg font-bold tracking-widest text-brand shadow-card">
                  #{submittedId}
                </div>
                <p className="mx-auto max-w-lg text-xs leading-5 text-muted">
                  Our editorial review and hiring team will review your profile, links, and cover note. If shortlisted, we will reach out via email ({formData.email}) or phone.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <Button href="/career" variant="outline" size="md">
                    Explore Career Hub
                  </Button>
                  <Button href="/" variant="primary" size="md">
                    Return to Homepage
                  </Button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-xs font-semibold uppercase tracking-wider text-muted hover:text-brand underline"
                  >
                    Submit another application
                  </button>
                </div>
              </div>
            </Reveal>
          ) : (
            <div>
              <div className="border-b border-hairline pb-6">
                <div className="flex items-center gap-2 text-gold-deep font-display text-xs font-bold uppercase tracking-[0.16em]">
                  <Sparkles className="h-4 w-4" /> Detailed Application Form
                </div>
                <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">
                  {activeType === 'Internship' ? 'Apply for an Internship' : 'Apply for a Full-Time Position'}
                </h2>
                <p className="mt-2 text-sm text-muted">
                  Fill in your details below. Please provide direct links to your portfolio, work samples, or resume to help our team review your candidacy.
                </p>
              </div>

              {errorMsg && (
                <div className="mt-6 flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-xs text-red-800">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                  <div>
                    <p className="font-bold">Please check your input</p>
                    <p className="mt-0.5">{errorMsg}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-8 space-y-8" noValidate>
                {/* 1. Track & Role Confirmation */}
                <div className="rounded-lg border border-hairline bg-cream p-6">
                  <h3 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider text-ink">
                    <Compass className="h-4 w-4 text-brand" /> 1. Selected Domain &amp; Type
                  </h3>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="meta-text block !text-[11px] font-bold uppercase">Position Type</label>
                      <select
                        value={activeType}
                        onChange={(e) => handleTypeChange(e.target.value as HiringType)}
                        className="mt-1.5 w-full rounded-[4px] border border-hairline bg-white px-3.5 py-2.5 text-sm font-medium text-ink focus:border-brand focus:outline-none"
                      >
                        <option value="Internship">Internship (Student / Fellow)</option>
                        <option value="Job">Full-Time Job (Early Career / Professional)</option>
                      </select>
                    </div>

                    <div>
                      <label className="meta-text block !text-[11px] font-bold uppercase">Track / Domain</label>
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        required
                        className="mt-1.5 w-full rounded-[4px] border border-hairline bg-white px-3.5 py-2.5 text-sm font-medium text-ink focus:border-brand focus:outline-none"
                      >
                        {TRACKS.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. Personal & Contact Details */}
                <div className="space-y-4">
                  <h3 className="font-display text-sm font-bold uppercase tracking-wider text-brand">
                    2. Personal &amp; Contact Details
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="meta-text block !text-[11px] font-bold uppercase">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="e.g. Ayush Sharma"
                        className={`mt-1.5 w-full rounded-[4px] border px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:outline-none ${errors.fullName
                          ? 'border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-400'
                          : 'border-hairline bg-white focus:border-brand'
                          }`}
                      />
                      {errors.fullName && (
                        <p role="alert" className="mt-1 text-xs font-medium text-red-600">
                          {errors.fullName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="meta-text block !text-[11px] font-bold uppercase">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className={`mt-1.5 w-full rounded-[4px] border px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:outline-none ${errors.email
                          ? 'border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-400'
                          : 'border-hairline bg-white focus:border-brand'
                          }`}
                      />
                      {errors.email && (
                        <p role="alert" className="mt-1 text-xs font-medium text-red-600">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="meta-text block !text-[11px] font-bold uppercase">
                        Phone / WhatsApp Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        className={`mt-1.5 w-full rounded-[4px] border px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:outline-none ${errors.phone
                          ? 'border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-400'
                          : 'border-hairline bg-white focus:border-brand'
                          }`}
                      />
                      {errors.phone && (
                        <p role="alert" className="mt-1 text-xs font-medium text-red-600">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="meta-text block !text-[11px] font-bold uppercase">
                        Current Location (City, State) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g. Patna, Bihar or Delhi NCR"
                        className={`mt-1.5 w-full rounded-[4px] border px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:outline-none ${errors.location
                          ? 'border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-400'
                          : 'border-hairline bg-white focus:border-brand'
                          }`}
                      />
                      {errors.location && (
                        <p role="alert" className="mt-1 text-xs font-medium text-red-600">
                          {errors.location}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Academic & Experience Level */}
                <div className="space-y-4">
                  <h3 className="font-display text-sm font-bold uppercase tracking-wider text-brand">
                    3. Academic &amp; Background Details
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="meta-text block !text-[11px] font-bold uppercase">
                        {activeType === 'Internship' ? 'College / University' : 'Current / Last Organization or College'}{' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="collegeOrCompany"
                        value={formData.collegeOrCompany}
                        onChange={handleChange}
                        placeholder={activeType === 'Internship' ? 'e.g. Patna University' : 'e.g. Current Company or Alma Mater'}
                        className={`mt-1.5 w-full rounded-[4px] border px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:outline-none ${errors.collegeOrCompany
                          ? 'border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-400'
                          : 'border-hairline bg-white focus:border-brand'
                          }`}
                      />
                      {errors.collegeOrCompany && (
                        <p role="alert" className="mt-1 text-xs font-medium text-red-600">
                          {errors.collegeOrCompany}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="meta-text block !text-[11px] font-bold uppercase">
                        {activeType === 'Internship' ? 'Year of Study' : 'Experience Level'}{' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="experienceLevel"
                        value={formData.experienceLevel}
                        onChange={handleChange}
                        className="mt-1.5 w-full rounded-[4px] border border-hairline bg-white px-3.5 py-2.5 text-sm font-medium text-ink focus:border-brand focus:outline-none"
                      >
                        {(activeType === 'Internship'
                          ? EXPERIENCE_OPTIONS_INTERNSHIP
                          : EXPERIENCE_OPTIONS_JOB
                        ).map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="meta-text block !text-[11px] font-bold uppercase">
                        Availability / Joining Timeline <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="availability"
                        value={formData.availability}
                        onChange={handleChange}
                        className="mt-1.5 w-full rounded-[4px] border border-hairline bg-white px-3.5 py-2.5 text-sm font-medium text-ink focus:border-brand focus:outline-none"
                      >
                        {AVAILABILITY_OPTIONS.map((a) => (
                          <option key={a} value={a}>
                            {a}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 4. Portfolio, Links & Resume */}
                <div className="space-y-4">
                  <h3 className="font-display text-sm font-bold uppercase tracking-wider text-brand">
                    4. Portfolio, Links &amp; Resume
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className="meta-text block !text-[11px] font-bold uppercase">
                        Resume / CV Link <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="url"
                        name="resumeUrl"
                        value={formData.resumeUrl}
                        onChange={handleChange}
                        placeholder="https://drive.google.com/..."
                        className={`mt-1.5 w-full rounded-[4px] border px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:outline-none ${errors.resumeUrl
                          ? 'border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-400'
                          : 'border-hairline bg-white focus:border-brand'
                          }`}
                      />
                      {errors.resumeUrl && (
                        <p role="alert" className="mt-1 text-xs font-medium text-red-600">
                          {errors.resumeUrl}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4. Portfolio & Profiles */}
                <div className="space-y-4">
                  <h3 className="font-display text-sm font-bold uppercase tracking-wider text-brand">
                    4. Social Profiles &amp; Work Samples (Optional)
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className="meta-text block !text-[11px] font-bold uppercase">
                        KonnectX ID / Profile
                      </label>
                      <input
                        type="text"
                        name="konnectxId"
                        value={formData.konnectxId}
                        onChange={handleChange}
                        placeholder="@username or konnectx.app/..."
                        className="mt-1.5 w-full rounded-[4px] border border-hairline bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-brand focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="meta-text block !text-[11px] font-bold uppercase">
                        LinkedIn Profile
                      </label>
                      <input
                        type="url"
                        name="linkedinUrl"
                        value={formData.linkedinUrl}
                        onChange={handleChange}
                        placeholder="https://linkedin.com/in/username"
                        className={`mt-1.5 w-full rounded-[4px] border px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:outline-none ${errors.linkedinUrl
                          ? 'border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-400'
                          : 'border-hairline bg-white focus:border-brand'
                          }`}
                      />
                      {errors.linkedinUrl && (
                        <p role="alert" className="mt-1 text-xs font-medium text-red-600">
                          {errors.linkedinUrl}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="meta-text block !text-[11px] font-bold uppercase">
                        Portfolio / GitHub / Work Samples
                      </label>
                      <input
                        type="url"
                        name="portfolioUrl"
                        value={formData.portfolioUrl}
                        onChange={handleChange}
                        placeholder="https://yourportfolio.com"
                        className={`mt-1.5 w-full rounded-[4px] border px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:outline-none ${errors.portfolioUrl
                          ? 'border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-400'
                          : 'border-hairline bg-white focus:border-brand'
                          }`}
                      />
                      {errors.portfolioUrl && (
                        <p role="alert" className="mt-1 text-xs font-medium text-red-600">
                          {errors.portfolioUrl}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 5. Statement / Cover Note */}
                <div className="space-y-4">
                  <h3 className="font-display text-sm font-bold uppercase tracking-wider text-brand">
                    5. Why Join Our Team? (Cover Note) <span className="text-red-500">*</span>
                  </h3>
                  <div>
                    <textarea
                      name="coverLetter"
                      value={formData.coverLetter}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Tell us about yourself, why you want to join our team, and what you hope to achieve or contribute in this role..."
                      className={`w-full rounded-[4px] border p-3.5 text-sm text-ink placeholder:text-muted/60 focus:outline-none ${errors.coverLetter
                        ? 'border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-400'
                        : 'border-hairline bg-white focus:border-brand'
                        }`}
                    />
                    {errors.coverLetter ? (
                      <p role="alert" className="mt-1 text-xs font-medium text-red-600">
                        {errors.coverLetter}
                      </p>
                    ) : (
                      <p className="mt-1 text-[11px] text-muted">
                        Minimum 30 characters. Feel free to highlight relevant projects, writing samples, or community leadership.
                      </p>
                    )}
                  </div>
                </div>

                {/* Submit Action */}
                <div className="border-t border-hairline pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs text-muted">
                    By submitting, you agree to share your details with the TSC recruitment &amp; editorial team.
                  </p>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    arrow
                    disabled={submitting}
                    className="w-full sm:w-auto"
                  >
                    {submitting ? 'Submitting Application...' : `Submit ${activeType} Application`}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default function HiringPage() {
  return (
    <Suspense fallback={<div className="container-tsc py-16 text-center text-muted">Loading hiring portal...</div>}>
      <HiringContent />
    </Suspense>
  );
}
