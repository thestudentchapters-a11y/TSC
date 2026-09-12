'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  CheckCircle2,
  Clock,
  Ban,
  ShieldCheck,
  Eye,
  GraduationCap,
  MapPin,
  Mail,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { useToast } from '@/components/common/Toast';
import { demoMembers } from '@/data/content';
import { formatDate } from '@/lib/utils';

interface CommunityMember {
  id: string;
  _id?: string;
  name: string;
  email: string;
  college?: string;
  city?: string;
  state?: string;
  role: 'member' | 'editor' | 'admin';
  status?: 'active' | 'pending' | 'suspended';
  joinedOn?: string;
  createdAt?: string;
  bio?: string;
  phone?: string;
}

export default function AdminMembersPage() {
  const { push } = useToast();
  const [allUsers, setAllUsers] = useState<CommunityMember[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'suspended'>('all');
  const [loading, setLoading] = useState(true);

  // View Member Details Modal
  const [viewingMember, setViewingMember] = useState<CommunityMember | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    const api = process.env.NEXT_PUBLIC_API_URL;
    if (api) {
      try {
        const token = window.localStorage.getItem('tsc_token');
        const res = await fetch(`${api}/api/users`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data?.data)) {
            const fetched: CommunityMember[] = data.data.map((u: any) => ({
              id: u._id || u.id,
              _id: u._id,
              name: u.name,
              email: u.email,
              college: u.college,
              city: u.city,
              state: u.state,
              role: u.role || 'member',
              status: u.status || (u.isActive ? 'active' : 'pending'),
              joinedOn: u.createdAt,
              createdAt: u.createdAt,
              bio: u.bio,
              phone: u.phone,
            }));
            setAllUsers(fetched);
            setLoading(false);
            return;
          }
        }
      } catch {
        /* fallback handled */
      }
    }

    // Demo dataset
    const mapped: CommunityMember[] = demoMembers.map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      college: m.college,
      city: m.city,
      state: (m as any).state || 'India',
      role: m.role as 'member' | 'editor' | 'admin',
      status: (m as any).status || 'active',
      joinedOn: m.joinedOn,
      bio: `Registered student member participating in campus initiatives and article contributions.`,
    }));

    setAllUsers(mapped);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Filter STRICTLY for Community Members (role === 'member')
  const communityMembers = useMemo(() => {
    return allUsers.filter((u) => u.role === 'member');
  }, [allUsers]);

  // Count of staff (admins/editors)
  const staffCount = useMemo(() => {
    return allUsers.filter((u) => u.role === 'admin' || u.role === 'editor').length;
  }, [allUsers]);

  const filteredMembers = useMemo(() => {
    return communityMembers.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.college && u.college.toLowerCase().includes(search.toLowerCase())) ||
        (u.city && u.city.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || (u.status || 'active') === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [communityMembers, search, statusFilter]);

  const handleStatusChange = async (memberId: string, newStatus: 'active' | 'pending' | 'suspended') => {
    const updated = allUsers.map((u) => (u.id === memberId ? { ...u, status: newStatus } : u));
    setAllUsers(updated);
    push(`Member status updated to ${newStatus.toUpperCase()}.`, 'success');
  };

  return (
    <div className="pb-16">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Community &amp; Student Roster</p>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Community Members
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Directory of registered students, youth contributors, and readers across campus chapters in India. Members have standard platform access for submitting articles for review and community participation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/team"
            className="inline-flex items-center gap-1.5 rounded-md border border-brand/30 bg-brand-50/70 px-3.5 py-2 text-xs font-semibold text-brand transition-colors hover:bg-brand hover:text-white"
          >
            <ShieldCheck className="h-3.5 w-3.5" /> View Editorial Staff &amp; Admins ({staffCount})
          </Link>
        </div>
      </div>

      {/* Navigation Callout Banner */}
      <div className="card-base mb-8 border-l-4 border-l-gold-deep bg-gold-50/40 p-4 text-xs">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <Users className="h-5 w-5 text-gold-deep shrink-0" />
            <p className="text-ink/80">
              Community members only receive standard member privileges. To view and manage editorial and administrator staff permissions, visit the{' '}
              <Link href="/admin/team" className="font-bold text-brand underline underline-offset-2">
                Team &amp; Staff Page →
              </Link>
            </p>
          </div>
          <span className="rounded-full bg-gold/20 px-3 py-1 font-display text-xs font-bold text-gold-deep self-start sm:self-auto">
            {communityMembers.length} Registered Members
          </span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="card-base mb-6 flex flex-wrap items-center justify-between gap-4 p-4">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-md border border-hairline bg-white px-3 py-2 text-xs">
            <Search className="h-4 w-4 text-muted" />
            <input
              type="text"
              placeholder="Search member by name, email, college, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-56 bg-transparent text-ink placeholder:text-muted focus:outline-none sm:w-80"
            />
          </div>

          <div className="flex items-center gap-1 rounded-md border border-hairline bg-cream p-1 text-xs font-semibold">
            {(['all', 'active', 'pending', 'suspended'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded px-2.5 py-1 capitalize transition-colors ${
                  statusFilter === s ? 'bg-ink text-cream shadow-sm' : 'text-muted hover:text-ink'
                }`}
              >
                {s === 'all' ? 'All Status' : s}
              </button>
            ))}
          </div>
        </div>

        <span className="text-xs font-bold text-muted">
          {filteredMembers.length} Members Listed
        </span>
      </div>

      {/* Members Table */}
      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-hairline bg-paper text-[11px] font-bold uppercase tracking-wider text-muted">
                <th className="px-5 py-3.5">Member</th>
                <th className="px-5 py-3.5">College &amp; University</th>
                <th className="px-5 py-3.5">Location</th>
                <th className="px-5 py-3.5">Joined Date</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-muted">
                    Loading community members…
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-muted">
                    No community members found matching your search.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => {
                  const status = m.status || 'active';

                  return (
                    <tr key={m.id} className="transition-colors hover:bg-cream/40">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cream border border-hairline font-bold text-xs text-brand">
                            {m.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-display text-sm font-bold text-ink">{m.name}</p>
                            <p className="text-[11.5px] text-muted">{m.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 font-medium text-ink/90">
                          <GraduationCap className="h-3.5 w-3.5 text-muted shrink-0" />
                          <span className="truncate max-w-[200px]" title={m.college || '—'}>
                            {m.college || '—'}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-muted">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span>{m.city ? `${m.city}, ${m.state || 'India'}` : '—'}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-muted">
                        {m.joinedOn ? formatDate(m.joinedOn) : '—'}
                      </td>

                      <td className="px-5 py-4">
                        <select
                          value={status}
                          onChange={(e) =>
                            handleStatusChange(m.id, e.target.value as 'active' | 'pending' | 'suspended')
                          }
                          className={`rounded border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider focus:outline-none ${
                            status === 'active'
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                              : status === 'pending'
                                ? 'border-amber-300 bg-amber-50 text-amber-700'
                                : 'border-red-300 bg-red-50 text-red-700'
                          }`}
                        >
                          <option value="active">Active</option>
                          <option value="pending">Pending</option>
                          <option value="suspended">Suspended</option>
                        </select>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewingMember(m)}
                          className="text-xs"
                          title="View member profile"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" /> View Details
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Details Modal */}
      {viewingMember && (
        <Modal
          open={!!viewingMember}
          onClose={() => setViewingMember(null)}
          title="Member Profile"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3.5 rounded-lg border border-hairline bg-cream/40 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-gold font-bold text-lg">
                {viewingMember.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-ink">{viewingMember.name}</h3>
                <p className="text-xs text-muted">{viewingMember.email}</p>
                <span className="mt-1 inline-flex items-center gap-1 rounded bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">
                  Community Member
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              <div className="rounded-md border border-hairline p-3">
                <p className="font-semibold text-muted uppercase tracking-wider text-[10px]">College / University / School</p>
                <p className="mt-1 font-bold text-ink">{viewingMember.college || 'Not specified'}</p>
              </div>
              <div className="rounded-md border border-hairline p-3">
                <p className="font-semibold text-muted uppercase tracking-wider text-[10px]">City &amp; Location</p>
                <p className="mt-1 font-bold text-ink">
                  {viewingMember.city ? `${viewingMember.city}, ${viewingMember.state || 'India'}` : 'Not specified'}
                </p>
              </div>
              <div className="rounded-md border border-hairline p-3">
                <p className="font-semibold text-muted uppercase tracking-wider text-[10px]">Member Since</p>
                <p className="mt-1 font-bold text-ink">
                  {viewingMember.joinedOn ? formatDate(viewingMember.joinedOn) : '—'}
                </p>
              </div>
              <div className="rounded-md border border-hairline p-3">
                <p className="font-semibold text-muted uppercase tracking-wider text-[10px]">Account Status</p>
                <p className="mt-1 font-bold capitalize text-emerald-700">{viewingMember.status || 'Active'}</p>
              </div>
            </div>

            {viewingMember.bio && (
              <div className="rounded-md border border-hairline p-3 text-xs">
                <p className="font-semibold text-muted uppercase tracking-wider text-[10px]">Member Bio</p>
                <p className="mt-1 text-ink/80 leading-relaxed">{viewingMember.bio}</p>
              </div>
            )}

            <div className="flex justify-end items-center border-t border-hairline pt-4">
              <Button size="sm" onClick={() => setViewingMember(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
