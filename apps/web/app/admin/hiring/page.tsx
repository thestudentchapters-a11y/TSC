'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  GraduationCap,
  Search,
  Filter,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  FileText,
  Linkedin,
  Globe,
  Trash2,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { useToast } from '@/components/common/Toast';
import { Button } from '@/components/common/Button';

export type HiringType = 'Internship' | 'Job';
export type HiringStatus = 'pending' | 'reviewed' | 'shortlisted' | 'interviewing' | 'rejected' | 'hired';

export interface HiringAppItem {
  _id: string;
  type: HiringType;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  department: string;
  experienceLevel: string;
  collegeOrCompany: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  resumeUrl: string;
  coverLetter: string;
  availability: string;
  status: HiringStatus;
  adminNotes?: string;
  createdAt: string;
}

const DEMO_APPLICATIONS: HiringAppItem[] = [
  {
    _id: 'app-001',
    type: 'Internship',
    fullName: 'Ananya Roy',
    email: 'ananya.roy@example.com',
    phone: '+91 98765 12340',
    location: 'Patna, Bihar',
    department: 'Editorial & Content Writing',
    experienceLevel: '3rd Year Undergraduate',
    collegeOrCompany: 'Patna Women’s College',
    linkedinUrl: 'https://linkedin.com/in/ananya-roy',
    portfolioUrl: 'https://medium.com/@ananyaroy',
    resumeUrl: 'https://drive.google.com/sample-resume-ananya.pdf',
    coverLetter:
      'I have been reading TSC articles since last year and would love to contribute stories on student initiatives and startup culture in Bihar.',
    availability: 'Immediate (Within 1-3 Days)',
    status: 'shortlisted',
    adminNotes: 'Strong writing samples. Scheduled for editorial round.',
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  },
  {
    _id: 'app-002',
    type: 'Job',
    fullName: 'Rohan Verma',
    email: 'rohan.v@example.com',
    phone: '+91 98123 45678',
    location: 'Bengaluru, Karnataka',
    department: 'Software Engineering & Web Platform',
    experienceLevel: '1 - 2 Years Experience',
    collegeOrCompany: 'Tech Startup / PES University',
    linkedinUrl: 'https://linkedin.com/in/rohanverma-dev',
    portfolioUrl: 'https://github.com/rohanv-dev',
    resumeUrl: 'https://drive.google.com/sample-resume-rohan.pdf',
    coverLetter:
      'Full-stack Next.js and TypeScript developer. Excited to help scale the TSC web application and student interactive tools.',
    availability: 'Within 15 Days',
    status: 'pending',
    createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
  },
  {
    _id: 'app-003',
    type: 'Internship',
    fullName: 'Siddharth Sen',
    email: 'siddharth.sen@example.com',
    phone: '+91 97654 32109',
    location: 'Kolkata, West Bengal',
    department: 'Video, Reels & Multimedia Production',
    experienceLevel: '2nd Year Undergraduate',
    collegeOrCompany: 'St. Xavier’s College',
    portfolioUrl: 'https://youtube.com/@siddharthreels',
    resumeUrl: 'https://drive.google.com/sample-resume-siddharth.pdf',
    coverLetter:
      'Video editor with Premiere Pro and After Effects experience. Can produce high-retention reels for TSC Instagram and YouTube.',
    availability: 'Part-Time (15-20 hrs/week)',
    status: 'interviewing',
    adminNotes: 'Reel portfolio looks very promising.',
    createdAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
  },
  {
    _id: 'app-004',
    type: 'Job',
    fullName: 'Pooja Kashyap',
    email: 'pooja.k@example.com',
    phone: '+91 99001 23456',
    location: 'New Delhi, Delhi NCR',
    department: 'Community, Outreach & Partnerships',
    experienceLevel: '2 - 4 Years Experience',
    collegeOrCompany: 'Youth Foundation / DU',
    linkedinUrl: 'https://linkedin.com/in/pooja-kashyap',
    resumeUrl: 'https://drive.google.com/sample-resume-pooja.pdf',
    coverLetter:
      'Experience in managing 50+ college student chapters and campus ambassadorship programs across North India.',
    availability: 'Immediate (Within 1-3 Days)',
    status: 'reviewed',
    createdAt: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
  },
];

export default function AdminHiringPage() {
  const { push } = useToast();
  const [applications, setApplications] = useState<HiringAppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<'all' | 'Internship' | 'Job'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState<HiringAppItem | null>(null);
  const [notesInput, setNotesInput] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    const api = process.env.NEXT_PUBLIC_API_URL;
    let loaded = false;

    if (api) {
      try {
        const res = await fetch(`${api}/api/hiring`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data?.data)) {
            setApplications(data.data);
            loaded = true;
          }
        }
      } catch {
        /* fallback below */
      }
    }

    if (!loaded) {
      try {
        const local = JSON.parse(
          window.localStorage.getItem('tsc.admin.hiringApplications') || '[]'
        );
        const combined = [...local, ...DEMO_APPLICATIONS];
        const unique = Array.from(new Map(combined.map((item) => [item._id, item])).values());
        setApplications(unique);
      } catch {
        setApplications(DEMO_APPLICATIONS);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleSelectApp = (app: HiringAppItem) => {
    setSelectedApp(app);
    setNotesInput(app.adminNotes || '');
  };

  const handleUpdateStatus = async (newStatus: HiringStatus) => {
    if (!selectedApp) return;
    setUpdatingStatus(true);
    const api = process.env.NEXT_PUBLIC_API_URL;
    let updated = false;

    if (api) {
      try {
        const res = await fetch(`${api}/api/hiring/${selectedApp._id}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ status: newStatus, adminNotes: notesInput }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.data) {
            setSelectedApp(data.data);
            setApplications((prev) =>
              prev.map((a) => (a._id === selectedApp._id ? data.data : a))
            );
            updated = true;
          }
        }
      } catch {
        /* fallback below */
      }
    }

    if (!updated) {
      const updatedApp = { ...selectedApp, status: newStatus, adminNotes: notesInput };
      setSelectedApp(updatedApp);
      setApplications((prev) =>
        prev.map((a) => (a._id === selectedApp._id ? updatedApp : a))
      );
      try {
        const local = JSON.parse(
          window.localStorage.getItem('tsc.admin.hiringApplications') || '[]'
        );
        const nextLocal = local.map((a: HiringAppItem) =>
          a._id === selectedApp._id ? updatedApp : a
        );
        window.localStorage.setItem('tsc.admin.hiringApplications', JSON.stringify(nextLocal));
      } catch {
        /* noop */
      }
    }

    push(`Applicant status updated to "${newStatus}".`, 'success');
    setUpdatingStatus(false);
  };

  const filtered = applications.filter((app) => {
    if (typeFilter !== 'all' && app.type !== typeFilter) return false;
    if (statusFilter !== 'all' && app.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        app.fullName.toLowerCase().includes(q) ||
        app.email.toLowerCase().includes(q) ||
        app.collegeOrCompany.toLowerCase().includes(q) ||
        app.location.toLowerCase().includes(q) ||
        app.department.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const totalCount = applications.length;
  const internshipCount = applications.filter((a) => a.type === 'Internship').length;
  const jobCount = applications.filter((a) => a.type === 'Job').length;
  const pendingCount = applications.filter((a) => a.status === 'pending').length;
  const shortlistedCount = applications.filter((a) => a.status === 'shortlisted' || a.status === 'interviewing').length;

  return (
    <div>
      {/* Top Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Recruitment &amp; Talent</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Hiring Applications
          </h1>
          <p className="mt-1 text-sm text-muted">
            Review, evaluate, and manage candidate applications for TSC Internships and Full-Time Jobs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button href="/hiring" variant="outline" size="sm">
            <Globe className="h-4 w-4" /> View Public Hiring Page
          </Button>
          <button
            type="button"
            onClick={fetchApplications}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-hairline bg-white text-muted hover:text-brand"
            title="Refresh list"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-md border border-hairline bg-white p-5">
          <p className="font-display text-[11px] font-bold uppercase tracking-wider text-muted">Total Applicants</p>
          <p className="mt-1 font-display text-2xl font-bold text-ink">{totalCount}</p>
        </div>
        <div className="rounded-md border border-hairline bg-white p-5">
          <p className="font-display text-[11px] font-bold uppercase tracking-wider text-brand">Internship Tracks</p>
          <p className="mt-1 font-display text-2xl font-bold text-brand">{internshipCount}</p>
        </div>
        <div className="rounded-md border border-hairline bg-white p-5">
          <p className="font-display text-[11px] font-bold uppercase tracking-wider text-gold-deep">Full-Time Jobs</p>
          <p className="mt-1 font-display text-2xl font-bold text-gold-deep">{jobCount}</p>
        </div>
        <div className="rounded-md border border-hairline bg-white p-5">
          <p className="font-display text-[11px] font-bold uppercase tracking-wider text-amber-600">Pending Review</p>
          <p className="mt-1 font-display text-2xl font-bold text-amber-600">{pendingCount}</p>
        </div>
        <div className="rounded-md border border-hairline bg-white p-5">
          <p className="font-display text-[11px] font-bold uppercase tracking-wider text-emerald-600">Shortlisted / Active</p>
          <p className="mt-1 font-display text-2xl font-bold text-emerald-600">{shortlistedCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-8 flex flex-col gap-4 rounded-md border border-hairline bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate by name, email, college, domain..."
            className="w-full rounded-[4px] border border-hairline bg-cream/40 py-2 pl-9 pr-4 text-xs focus:border-brand focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-muted">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="rounded-[4px] border border-hairline bg-cream px-3 py-1.5 text-xs font-medium text-ink focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="Internship">Internship</option>
              <option value="Job">Job</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-muted">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-[4px] border border-hairline bg-cream px-3 py-1.5 text-xs font-medium text-ink focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="interviewing">Interviewing</option>
              <option value="hired">Hired</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Table & Detail Drawer */}
      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        {/* Applications List */}
        <div className={selectedApp ? 'lg:col-span-7' : 'lg:col-span-12'}>
          <div className="overflow-hidden rounded-md border border-hairline bg-white shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-hairline bg-cream/60 font-display text-[10.5px] font-bold uppercase tracking-wider text-muted">
                  <tr>
                    <th className="px-4 py-3.5">Candidate</th>
                    <th className="px-4 py-3.5">Type &amp; Domain</th>
                    <th className="px-4 py-3.5">College / Background</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-muted">
                        Loading applications...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-muted">
                        No applications found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((app) => {
                      const isSelected = selectedApp?._id === app._id;
                      return (
                        <tr
                          key={app._id}
                          onClick={() => handleSelectApp(app)}
                          className={`cursor-pointer transition-colors hover:bg-cream/40 ${
                            isSelected ? 'bg-brand-50/60 font-medium' : ''
                          }`}
                        >
                          <td className="px-4 py-3.5">
                            <p className="font-display font-bold text-ink">{app.fullName}</p>
                            <p className="text-[11px] text-muted">{app.email}</p>
                            <p className="text-[10px] text-muted/80">{app.location}</p>
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                app.type === 'Internship'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-900'
                              }`}
                            >
                              {app.type}
                            </span>
                            <p className="mt-1 text-[11px] font-medium text-ink/80">{app.department}</p>
                          </td>
                          <td className="px-4 py-3.5">
                            <p className="text-[11.5px] text-ink">{app.collegeOrCompany}</p>
                            <p className="text-[10.5px] text-muted">{app.experienceLevel}</p>
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                app.status === 'shortlisted' || app.status === 'hired'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : app.status === 'interviewing'
                                  ? 'bg-purple-100 text-purple-800'
                                  : app.status === 'reviewed'
                                  ? 'bg-sky-100 text-sky-800'
                                  : app.status === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {app.status}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectApp(app);
                              }}
                              className="rounded border border-hairline bg-white px-2.5 py-1 text-[11px] font-semibold text-brand hover:border-brand"
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Candidate Detail Inspector Drawer */}
        {selectedApp && (
          <div className="lg:col-span-5">
            <div className="rounded-md border border-hairline bg-white p-6 shadow-card space-y-6">
              <div className="flex items-start justify-between border-b border-hairline pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        selectedApp.type === 'Internship'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {selectedApp.type}
                    </span>
                    <span className="text-[11px] text-muted">
                      Applied {new Date(selectedApp.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <h2 className="mt-2 font-display text-xl font-bold text-ink">{selectedApp.fullName}</h2>
                  <p className="text-xs font-medium text-brand">{selectedApp.department}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="text-muted hover:text-ink text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-3 rounded bg-cream/60 p-3.5 text-xs">
                <div>
                  <p className="meta-text !text-[10px]">Email</p>
                  <a href={`mailto:${selectedApp.email}`} className="font-semibold text-brand hover:underline">
                    {selectedApp.email}
                  </a>
                </div>
                <div>
                  <p className="meta-text !text-[10px]">Phone</p>
                  <a href={`tel:${selectedApp.phone}`} className="font-semibold text-ink hover:underline">
                    {selectedApp.phone}
                  </a>
                </div>
                <div>
                  <p className="meta-text !text-[10px]">Location</p>
                  <p className="font-semibold text-ink">{selectedApp.location}</p>
                </div>
                <div>
                  <p className="meta-text !text-[10px]">Availability</p>
                  <p className="font-semibold text-ink">{selectedApp.availability}</p>
                </div>
              </div>

              {/* Background & Links */}
              <div className="space-y-2 text-xs">
                <p className="meta-text !text-[10px]">Education / Company</p>
                <p className="font-medium text-ink">
                  {selectedApp.collegeOrCompany} • <span className="text-muted">{selectedApp.experienceLevel}</span>
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  <a
                    href={selectedApp.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 font-display text-[11px] font-bold text-white hover:bg-brand-dark"
                  >
                    <FileText className="h-3 w-3" /> View Resume <ExternalLink className="h-3 w-3" />
                  </a>

                  {selectedApp.portfolioUrl && (
                    <a
                      href={selectedApp.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-cream px-3 py-1 font-display text-[11px] font-bold text-ink hover:border-brand"
                    >
                      <Globe className="h-3 w-3 text-brand" /> Portfolio / GitHub <ExternalLink className="h-3 w-3" />
                    </a>
                  )}

                  {selectedApp.linkedinUrl && (
                    <a
                      href={selectedApp.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-cream px-3 py-1 font-display text-[11px] font-bold text-ink hover:border-brand"
                    >
                      <Linkedin className="h-3 w-3 text-blue-600" /> LinkedIn <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Cover Note */}
              <div className="space-y-1.5 text-xs">
                <p className="meta-text !text-[10px]">Why The Student Chapters? (Cover Note)</p>
                <div className="max-h-40 overflow-y-auto rounded border border-hairline bg-white p-3 text-xs leading-5 text-ink/80">
                  {selectedApp.coverLetter}
                </div>
              </div>

              {/* Status Update & Action Buttons */}
              <div className="border-t border-hairline pt-4 space-y-3">
                <p className="meta-text !text-[10px]">Evaluation &amp; Decision</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={updatingStatus}
                    onClick={() => handleUpdateStatus('shortlisted')}
                    className="rounded bg-emerald-600 px-3 py-1.5 font-display text-xs font-bold text-white hover:bg-emerald-700"
                  >
                    ✓ Shortlist Candidate
                  </button>
                  <button
                    type="button"
                    disabled={updatingStatus}
                    onClick={() => handleUpdateStatus('interviewing')}
                    className="rounded bg-purple-600 px-3 py-1.5 font-display text-xs font-bold text-white hover:bg-purple-700"
                  >
                    Schedule Interview
                  </button>
                  <button
                    type="button"
                    disabled={updatingStatus}
                    onClick={() => handleUpdateStatus('hired')}
                    className="rounded bg-gold-deep px-3 py-1.5 font-display text-xs font-bold text-ink hover:bg-gold"
                  >
                    ★ Mark as Hired
                  </button>
                  <button
                    type="button"
                    disabled={updatingStatus}
                    onClick={() => handleUpdateStatus('rejected')}
                    className="rounded border border-red-200 bg-red-50 px-3 py-1.5 font-display text-xs font-bold text-red-700 hover:bg-red-100"
                  >
                    ✕ Reject
                  </button>
                </div>

                <div className="pt-2">
                  <label className="meta-text block !text-[10px]">Internal Admin Review Notes</label>
                  <textarea
                    rows={2}
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    placeholder="Add interview notes, portfolio impressions, or follow-up feedback..."
                    className="mt-1 w-full rounded border border-hairline p-2 text-xs focus:border-brand focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={updatingStatus}
                    onClick={() => handleUpdateStatus(selectedApp.status)}
                    className="mt-1 text-[11px] font-bold text-brand hover:underline"
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
