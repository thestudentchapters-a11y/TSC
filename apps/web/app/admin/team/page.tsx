'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  ShieldCheck,
  KeyRound,
  Search,
  Users,
  CheckCircle2,
  UserPlus,
  Plus,
  Mail,
  Lock,
  User as UserIcon,
  Building2,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { useToast } from '@/components/common/Toast';
import { demoMembers } from '@/data/content';
import { formatDate } from '@/lib/utils';

interface AdminUser {
  id: string;
  _id?: string;
  name: string;
  email: string;
  college?: string;
  city?: string;
  state?: string;
  role: 'editor' | 'admin';
  customPermissions?: string[];
  joinedOn?: string;
  createdAt?: string;
}

const AVAILABLE_PERMISSIONS = [
  {
    id: 'publish_articles',
    label: 'Direct Article Publishing',
    description: 'Bypass review queue and publish articles directly to the live feed.',
  },
  {
    id: 'manage_events',
    label: 'Event Management',
    description: 'Create, edit, schedule, and cancel campus events.',
  },
  {
    id: 'manage_opportunities',
    label: 'Opportunities & Jobs',
    description: 'Post and manage internships, job openings, and fellowships.',
  },
  {
    id: 'manage_campuses',
    label: 'Campus Chapter Management',
    description: 'Add and update campus partner pages and college communities.',
  },
  {
    id: 'manage_podcasts',
    label: 'Podcast Management',
    description: 'Publish and organize audio podcast episodes.',
  },
  {
    id: 'moderate_submissions',
    label: 'Submission Review & Moderation',
    description: 'Review and approve/reject community stories and campus news.',
  },
  {
    id: 'manage_media',
    label: 'Media Library Access',
    description: 'Upload, replace, and manage media library assets.',
  },
];

export default function AdminTeamPage() {
  const { push } = useToast();
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'editor' | 'admin'>('all');
  const [loading, setLoading] = useState(true);

  // Add Staff Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<'editor' | 'admin'>('editor');
  const [newStaffCollege, setNewStaffCollege] = useState('');
  const [newStaffCity, setNewStaffCity] = useState('');
  const [newStaffState, setNewStaffState] = useState('');
  const [newStaffPermissions, setNewStaffPermissions] = useState<string[]>([
    'publish_articles',
    'manage_events',
    'moderate_submissions',
  ]);
  const [savingNewStaff, setSavingNewStaff] = useState(false);

  // Permission modal
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [activePermissions, setActivePermissions] = useState<string[]>([]);
  const [savingPermissions, setSavingPermissions] = useState(false);

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
            const fetched = data.data
              .filter((u: any) => u.role === 'admin' || u.role === 'editor')
              .map((u: any) => ({
                id: u._id || u.id,
                _id: u._id,
                name: u.name,
                email: u.email,
                college: u.college,
                city: u.city,
                state: u.state,
                role: (u.role || 'editor') as 'editor' | 'admin',
                customPermissions: u.customPermissions || [],
                joinedOn: u.createdAt,
                createdAt: u.createdAt,
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

    // Demo dataset (only staff: admin and editor)
    const mapped: AdminUser[] = demoMembers
      .filter((m) => m.role === 'admin' || m.role === 'editor')
      .map((m) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        college: m.college,
        city: m.city,
        state: (m as any).state || 'India',
        role: m.role as 'editor' | 'admin',
        customPermissions:
          m.role === 'admin'
            ? AVAILABLE_PERMISSIONS.map((p) => p.id)
            : ['publish_articles', 'manage_events', 'moderate_submissions'],
        joinedOn: m.joinedOn,
      }));

    // Load newly added staff stored in local storage
    try {
      const addedStaff = JSON.parse(window.localStorage.getItem('tsc.admin.staff_added') || '[]');
      if (Array.isArray(addedStaff)) {
        for (const s of addedStaff) {
          if (!mapped.some((u) => u.id === s.id || u.email === s.email)) {
            mapped.push(s);
          }
        }
      }
    } catch {
      /* noop */
    }

    // Load stored local overrides
    try {
      const stored = JSON.parse(window.localStorage.getItem('tsc.admin.custom_permissions') || '{}');
      for (const u of mapped) {
        if (stored[u.id]) {
          u.customPermissions = stored[u.id].customPermissions ?? u.customPermissions;
          if (stored[u.id].role === 'admin' || stored[u.id].role === 'editor') {
            u.role = stored[u.id].role;
          }
        }
      }
    } catch {
      /* noop */
    }

    setAllUsers(mapped);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredTeam = useMemo(() => {
    return allUsers.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.college && u.college.toLowerCase().includes(search.toLowerCase()));
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [allUsers, search, roleFilter]);

  const handleOpenPermissions = (u: AdminUser) => {
    setSelectedUser(u);
    setActivePermissions(u.customPermissions || []);
  };

  const handleTogglePerm = (permId: string) => {
    setActivePermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const handleToggleNewStaffPerm = (permId: string) => {
    setNewStaffPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffEmail.trim() || !newStaffPassword.trim()) {
      push('Name, email and password are required.', 'error');
      return;
    }

    setSavingNewStaff(true);
    const api = process.env.NEXT_PUBLIC_API_URL;
    const token = window.localStorage.getItem('tsc_token');
    let createdUser: AdminUser = {
      id: `staff_${Date.now()}`,
      name: newStaffName.trim(),
      email: newStaffEmail.trim().toLowerCase(),
      college: newStaffCollege.trim() || 'The Student Chapters™',
      city: newStaffCity.trim() || 'National Newsroom',
      state: newStaffState.trim() || 'India',
      role: newStaffRole,
      customPermissions:
        newStaffRole === 'admin' ? AVAILABLE_PERMISSIONS.map((p) => p.id) : newStaffPermissions,
      joinedOn: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    if (api) {
      try {
        const res = await fetch(`${api}/api/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            name: newStaffName.trim(),
            email: newStaffEmail.trim().toLowerCase(),
            password: newStaffPassword.trim(),
            role: newStaffRole,
            college: newStaffCollege.trim(),
            city: newStaffCity.trim(),
            state: newStaffState.trim(),
            customPermissions:
              newStaffRole === 'admin' ? AVAILABLE_PERMISSIONS.map((p) => p.id) : newStaffPermissions,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.data) {
            createdUser = {
              id: data.data._id || data.data.id || createdUser.id,
              _id: data.data._id,
              name: data.data.name,
              email: data.data.email,
              college: data.data.college,
              city: data.data.city,
              state: data.data.state,
              role: data.data.role,
              customPermissions: data.data.customPermissions,
              joinedOn: data.data.createdAt,
              createdAt: data.data.createdAt,
            };
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          push(errData.message || errData.error || 'Failed to create staff member on server.', 'error');
          setSavingNewStaff(false);
          return;
        }
      } catch {
        /* fallback handled in local storage */
      }
    }

    // Persist to local storage
    try {
      const addedStaff = JSON.parse(window.localStorage.getItem('tsc.admin.staff_added') || '[]');
      addedStaff.push(createdUser);
      window.localStorage.setItem('tsc.admin.staff_added', JSON.stringify(addedStaff));

      const storedPerms = JSON.parse(window.localStorage.getItem('tsc.admin.custom_permissions') || '{}');
      storedPerms[createdUser.id] = {
        role: createdUser.role,
        customPermissions: createdUser.customPermissions,
      };
      window.localStorage.setItem('tsc.admin.custom_permissions', JSON.stringify(storedPerms));
    } catch {
      /* noop */
    }

    setAllUsers((prev) => [createdUser, ...prev]);
    setIsAddModalOpen(false);
    setNewStaffName('');
    setNewStaffEmail('');
    setNewStaffPassword('');
    setNewStaffCollege('');
    setNewStaffCity('');
    setNewStaffState('');
    setNewStaffRole('editor');
    setNewStaffPermissions(['publish_articles', 'manage_events', 'moderate_submissions']);
    setSavingNewStaff(false);
    push(`Staff member ${createdUser.name} added successfully as ${createdUser.role.toUpperCase()}.`, 'success');
  };

  const handleSavePermissions = async () => {
    if (!selectedUser) return;
    setSavingPermissions(true);

    const updated = allUsers.map((u) =>
      u.id === selectedUser.id ? { ...u, customPermissions: activePermissions } : u
    );
    setAllUsers(updated);

    try {
      const stored = JSON.parse(window.localStorage.getItem('tsc.admin.custom_permissions') || '{}');
      stored[selectedUser.id] = {
        ...(stored[selectedUser.id] || {}),
        customPermissions: activePermissions,
      };
      window.localStorage.setItem('tsc.admin.custom_permissions', JSON.stringify(stored));
    } catch {
      /* noop */
    }

    const api = process.env.NEXT_PUBLIC_API_URL;
    if (api && (selectedUser._id || selectedUser.id)) {
      try {
        const token = window.localStorage.getItem('tsc_token');
        await fetch(`${api}/api/users/${selectedUser._id || selectedUser.id}/permissions`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ permissions: activePermissions }),
        });
      } catch {
        /* fallback handled */
      }
    }

    setSavingPermissions(false);
    setSelectedUser(null);
    push(`Updated permissions for ${selectedUser.name}.`, 'success');
  };

  const handleRoleChange = async (userId: string, newRole: 'editor' | 'admin') => {
    const updated = allUsers.map((u) => (u.id === userId ? { ...u, role: newRole } : u));
    setAllUsers(updated);

    try {
      const stored = JSON.parse(window.localStorage.getItem('tsc.admin.custom_permissions') || '{}');
      stored[userId] = {
        ...(stored[userId] || {}),
        role: newRole,
      };
      window.localStorage.setItem('tsc.admin.custom_permissions', JSON.stringify(stored));
    } catch {
      /* noop */
    }

    const api = process.env.NEXT_PUBLIC_API_URL;
    if (api) {
      try {
        const token = window.localStorage.getItem('tsc_token');
        await fetch(`${api}/api/users/${userId}/role`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ role: newRole }),
        });
      } catch {
        /* fallback handled */
      }
    }

    push(`Staff role updated to ${newRole.toUpperCase()}.`, 'success');
  };

  return (
    <div className="pb-16">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Editorial &amp; System Administration</p>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Team &amp; Staff
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Strictly for Administrators and Editors. Manage editorial suite access and configure granular publishing permissions for authorized staff.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="shadow-sm"
          >
            <UserPlus className="h-4 w-4 mr-1.5" /> Add Staff Member
          </Button>
          {/* <Link
            href="/admin/members"
            className="inline-flex items-center gap-1.5 rounded-md border border-hairline bg-white px-3.5 py-2 text-xs font-semibold text-ink transition-colors hover:bg-cream hover:text-brand"
          >
            <Users className="h-3.5 w-3.5 text-muted" /> View Community Members
          </Link> */}
        </div>
      </div>

      {/* Role Summary Banner */}
      <div className="grid gap-4 sm:grid-cols-2 mb-8">
        <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-4">
          <div className="flex items-center gap-2.5">
            <span className="rounded-md bg-purple-100 p-2 text-purple-700">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-display text-sm font-bold text-purple-950">Administrators</h3>
              <p className="text-xs text-purple-800/80">Full administrative control, user governance, broadcast emails &amp; site settings.</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-brand/20 bg-brand-50/50 p-4">
          <div className="flex items-center gap-2.5">
            <span className="rounded-md bg-brand/10 p-2 text-brand">
              <KeyRound className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-display text-sm font-bold text-brand-950">Editors</h3>
              <p className="text-xs text-brand-800/80">Manage news, articles, current affairs, podcasts, events &amp; review queues.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="card-base mb-6 flex flex-wrap items-center justify-between gap-4 p-4">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-md border border-hairline bg-white px-3 py-2 text-xs">
            <Search className="h-4 w-4 text-muted" />
            <input
              type="text"
              placeholder="Search staff by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48 bg-transparent text-ink placeholder:text-muted focus:outline-none sm:w-64"
            />
          </div>

          <div className="flex items-center gap-1 rounded-md border border-hairline bg-cream p-1 text-xs font-semibold">
            {(['all', 'admin', 'editor'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`rounded px-2.5 py-1 capitalize transition-colors ${
                  roleFilter === r ? 'bg-ink text-cream shadow-sm' : 'text-muted hover:text-ink'
                }`}
              >
                {r === 'all' ? 'All Staff' : `${r}s`}
              </button>
            ))}
          </div>
        </div>

        <span className="text-xs font-bold text-muted">
          {filteredTeam.length} Staff Members
        </span>
      </div>

      {/* Staff Table */}
      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-hairline bg-paper text-[11px] font-bold uppercase tracking-wider text-muted">
                <th className="px-5 py-3.5">Staff Member</th>
                <th className="px-5 py-3.5">Staff Role</th>
                <th className="px-5 py-3.5">Assigned Permissions</th>
                <th className="px-5 py-3.5">Joined Date</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline bg-white">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-muted">
                    Loading staff…
                  </td>
                </tr>
              ) : filteredTeam.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-muted">
                    No staff members found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredTeam.map((u) => {
                  const perms = u.customPermissions || [];
                  const isAdmin = u.role === 'admin';

                  return (
                    <tr key={u.id} className="transition-colors hover:bg-cream/40">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-full font-bold text-xs ${
                            isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-brand/10 text-brand'
                          }`}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-display text-sm font-bold text-ink">{u.name}</p>
                            <p className="text-[11.5px] text-muted">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <select
                          value={u.role}
                          onChange={(e) =>
                            handleRoleChange(u.id, e.target.value as 'editor' | 'admin')
                          }
                          className={`rounded border px-2.5 py-1 text-xs font-bold uppercase tracking-wider focus:outline-none ${
                            isAdmin
                              ? 'border-purple-300 bg-purple-50 text-purple-700'
                              : 'border-brand/40 bg-brand-50 text-brand'
                          }`}
                        >
                          <option value="admin">Admin</option>
                          <option value="editor">Editor</option>
                        </select>
                      </td>

                      <td className="px-5 py-4">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-purple-300 bg-purple-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-700">
                            <ShieldCheck className="h-3 w-3" /> Full System Rights
                          </span>
                        ) : perms.length === 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-brand/30 bg-brand-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">
                            <KeyRound className="h-3 w-3" /> Standard Editorial Suite
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {perms.map((pId) => {
                              const pDef = AVAILABLE_PERMISSIONS.find((p) => p.id === pId);
                              return (
                                <span
                                  key={pId}
                                  className="rounded bg-gold-50 border border-gold/40 px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-wider text-gold-deep"
                                >
                                  {pDef?.label.split(' ')[0] || pId}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4 text-muted">
                        {u.joinedOn ? formatDate(u.joinedOn) : '—'}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenPermissions(u)}
                          className="text-xs"
                        >
                          <KeyRound className="h-3.5 w-3.5 mr-1" /> Permissions
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

      {/* Add Staff Member Modal */}
      {isAddModalOpen && (
        <Modal
          open={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add Staff Member"
        >
          <form onSubmit={handleCreateStaff} className="space-y-4">
            <p className="text-xs text-muted">
              Create an administrative or editorial staff member. Once created, they can log in to the newsroom console.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    className="w-full rounded-md border border-hairline bg-white pl-9 pr-3 py-2 text-xs text-ink placeholder:text-muted focus:border-brand focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  Official Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. editor@tsc.org"
                    value={newStaffEmail}
                    onChange={(e) => setNewStaffEmail(e.target.value)}
                    className="w-full rounded-md border border-hairline bg-white pl-9 pr-3 py-2 text-xs text-ink placeholder:text-muted focus:border-brand focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted" />
                  <input
                    type="password"
                    required
                    placeholder="Set temporary password"
                    value={newStaffPassword}
                    onChange={(e) => setNewStaffPassword(e.target.value)}
                    className="w-full rounded-md border border-hairline bg-white pl-9 pr-3 py-2 text-xs text-ink placeholder:text-muted focus:border-brand focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value as 'editor' | 'admin')}
                  className="w-full rounded-md border border-hairline bg-white px-3 py-2 text-xs text-ink focus:border-brand focus:outline-none"
                >
                  <option value="editor">Editor (Newsroom &amp; Editorial)</option>
                  <option value="admin">Administrator (Full Rights)</option>
                </select>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  College / Affiliation
                </label>
                <input
                  type="text"
                  placeholder="Optional college"
                  value={newStaffCollege}
                  onChange={(e) => setNewStaffCollege(e.target.value)}
                  className="w-full rounded-md border border-hairline bg-white px-3 py-2 text-xs text-ink placeholder:text-muted focus:border-brand focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  City
                </label>
                <input
                  type="text"
                  placeholder="e.g. New Delhi"
                  value={newStaffCity}
                  onChange={(e) => setNewStaffCity(e.target.value)}
                  className="w-full rounded-md border border-hairline bg-white px-3 py-2 text-xs text-ink placeholder:text-muted focus:border-brand focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  State
                </label>
                <input
                  type="text"
                  placeholder="e.g. Delhi"
                  value={newStaffState}
                  onChange={(e) => setNewStaffState(e.target.value)}
                  className="w-full rounded-md border border-hairline bg-white px-3 py-2 text-xs text-ink placeholder:text-muted focus:border-brand focus:outline-none"
                />
              </div>
            </div>

            {newStaffRole === 'editor' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-ink">
                    Assign Editorial Permissions
                  </label>
                  <span className="text-[11px] text-muted">
                    {newStaffPermissions.length} selected
                  </span>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2 rounded-md border border-hairline bg-cream p-3">
                  {AVAILABLE_PERMISSIONS.map((perm) => {
                    const checked = newStaffPermissions.includes(perm.id);
                    return (
                      <label
                        key={perm.id}
                        className="flex cursor-pointer items-start gap-2.5"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleToggleNewStaffPerm(perm.id)}
                          className="mt-0.5 h-3.5 w-3.5 rounded border-hairline text-brand focus:ring-brand"
                        />
                        <div className="text-xs">
                          <p className="font-bold text-ink text-[11.5px]">{perm.label}</p>
                          <p className="text-muted text-[10.5px]">{perm.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2.5 border-t border-hairline pt-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={savingNewStaff}>
                {savingNewStaff ? 'Adding Staff…' : 'Add Staff Member'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Granular Permissions Modal for Staff */}
      {selectedUser && (
        <Modal
          open={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          title={`Staff Permissions: ${selectedUser.name}`}
        >
          <div className="space-y-4">
            <div className="rounded-md border border-hairline bg-cream p-3 text-xs">
              <p className="font-semibold text-ink">
                Staff Member: {selectedUser.name} ({selectedUser.email})
              </p>
              <p className="mt-0.5 text-muted">
                Role: <span className="font-bold uppercase text-brand">{selectedUser.role}</span>
              </p>
            </div>

            <p className="text-xs text-muted">
              Configure granular administrative and publishing rights for this staff member.
            </p>

            <div className="space-y-2.5 divide-y divide-hairline">
              {AVAILABLE_PERMISSIONS.map((perm) => {
                const checked = activePermissions.includes(perm.id);
                return (
                  <label
                    key={perm.id}
                    className="flex cursor-pointer items-start gap-3 pt-2.5 first:pt-0"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleTogglePerm(perm.id)}
                      className="mt-0.5 h-4 w-4 rounded border-hairline text-brand focus:ring-brand"
                    />
                    <div className="text-xs">
                      <p className="font-bold text-ink">{perm.label}</p>
                      <p className="text-muted leading-relaxed">{perm.description}</p>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="flex justify-end gap-2.5 border-t border-hairline pt-4">
              <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSavePermissions} disabled={savingPermissions}>
                {savingPermissions ? 'Saving…' : 'Save Permissions'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
