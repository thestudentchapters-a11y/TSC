'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  CheckCircle2,
  KeyRound,
  Lock,
  Plus,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserCog,
  Users,
  X,
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
  role: 'member' | 'editor' | 'admin';
  customPermissions?: string[];
  joinedOn?: string;
  createdAt?: string;
}

const AVAILABLE_PERMISSIONS = [
  {
    id: 'publish_articles',
    label: 'Direct Article Publishing',
    description: 'Bypass editorial review and publish articles directly to the live feed.',
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

export default function AdminMembersPage() {
  const { push } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'member' | 'editor' | 'admin'>('all');
  const [loading, setLoading] = useState(true);

  // Permission modal
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [activePermissions, setActivePermissions] = useState<string[]>([]);
  const [savingPermissions, setSavingPermissions] = useState(false);

  useEffect(() => {
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
              setUsers(
                data.data.map((u: any) => ({
                  id: u._id || u.id,
                  _id: u._id,
                  name: u.name,
                  email: u.email,
                  college: u.college,
                  city: u.city,
                  state: u.state,
                  role: u.role || 'member',
                  customPermissions: u.customPermissions || [],
                  joinedOn: u.createdAt,
                  createdAt: u.createdAt,
                }))
              );
              setLoading(false);
              return;
            }
          }
        } catch {
          /* fallback */
        }
      }

      // Demo dataset
      const mapped = demoMembers.map((m) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        college: m.college,
        city: m.city,
        state: (m as any).state || 'India',
        role: m.role as 'member' | 'editor' | 'admin',
        customPermissions:
          m.role === 'admin'
            ? AVAILABLE_PERMISSIONS.map((p) => p.id)
            : m.role === 'editor'
              ? ['publish_articles', 'manage_events', 'moderate_submissions']
              : [],
        joinedOn: m.joinedOn,
      }));

      // Load any stored local permissions override
      try {
        const stored = JSON.parse(window.localStorage.getItem('tsc.admin.custom_permissions') || '{}');
        for (const u of mapped) {
          if (stored[u.id]) {
            u.customPermissions = stored[u.id].customPermissions ?? u.customPermissions;
            u.role = stored[u.id].role ?? u.role;
          }
        }
      } catch {
        /* noop */
      }

      setUsers(mapped);
      setLoading(false);
    };

    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.college && u.college.toLowerCase().includes(search.toLowerCase()));
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const handleOpenPermissions = (u: AdminUser) => {
    setSelectedUser(u);
    setActivePermissions(u.customPermissions || []);
  };

  const handleTogglePerm = (permId: string) => {
    setActivePermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const handleSavePermissions = async () => {
    if (!selectedUser) return;
    setSavingPermissions(true);

    const updated = users.map((u) =>
      u.id === selectedUser.id ? { ...u, customPermissions: activePermissions } : u
    );
    setUsers(updated);

    // Save to localStorage for instant UI persistence
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

    // Call API if connected
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
    push(`Updated operational permissions for ${selectedUser.name}.`, 'success');
  };

  const handleRoleChange = async (userId: string, newRole: 'member' | 'editor' | 'admin') => {
    const updated = users.map((u) => (u.id === userId ? { ...u, role: newRole } : u));
    setUsers(updated);

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

    push(`Role updated to ${newRole.toUpperCase()}.`, 'success');
  };

  return (
    <div className="pb-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">User Management &amp; Access Control</p>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Members &amp; Permissions
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Admins have complete control over user roles. By default, members can only submit articles for review.
            Admins can grant specific operational permissions to trusted members as needed.
          </p>
        </div>
        <div className="rounded-full border border-gold/40 bg-gold-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-gold-deep">
          {users.length} Total Users
        </div>
      </div>

      {/* Permissions Guide Alert */}
      <div className="card-base mb-8 border-l-4 border-l-brand p-5 text-xs leading-relaxed text-ink/80">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
          <div className="space-y-1">
            <p className="font-display text-sm font-bold uppercase tracking-wider text-ink">
              Default vs Delegated Permissions
            </p>
            <p>
              • <strong>Default Member:</strong> Can post articles &amp; stories for editorial review only; cannot publish directly to the live platform.
            </p>
            <p>
              • <strong>Admin Delegation:</strong> Admins can grant individual members granular access (e.g., direct publishing, event creation, opportunity management) without elevating them to full admins.
            </p>
            <p>
              • <strong>Admin Role:</strong> Full system access, site settings, hero image configuration, user roles, and publishing control.
            </p>
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
              placeholder="Search by name, email, college..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48 bg-transparent text-ink placeholder:text-muted focus:outline-none sm:w-64"
            />
          </div>

          <div className="flex items-center gap-1 rounded-md border border-hairline bg-cream p-1 text-xs font-semibold">
            {(['all', 'member', 'editor', 'admin'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`rounded px-2.5 py-1 capitalize transition-colors ${
                  roleFilter === r ? 'bg-ink text-cream shadow-sm' : 'text-muted hover:text-ink'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-hairline bg-paper text-[11px] font-bold uppercase tracking-wider text-muted">
                <th className="px-5 py-3.5">User</th>
                <th className="px-5 py-3.5">College &amp; Location</th>
                <th className="px-5 py-3.5">System Role</th>
                <th className="px-5 py-3.5">Operational Permissions</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline bg-white">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-muted">
                    Loading users…
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-muted">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const perms = u.customPermissions || [];
                  const isAdmin = u.role === 'admin';
                  const isEditor = u.role === 'editor';

                  return (
                    <tr key={u.id} className="transition-colors hover:bg-cream/40">
                      <td className="px-5 py-4">
                        <p className="font-display text-sm font-bold text-ink">{u.name}</p>
                        <p className="text-[11.5px] text-muted">{u.email}</p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold text-ink/90">{u.college || '—'}</p>
                        <p className="text-[11px] text-muted">
                          {u.city ? `${u.city}, ${u.state || 'India'}` : '—'}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <select
                          value={u.role}
                          onChange={(e) =>
                            handleRoleChange(u.id, e.target.value as 'member' | 'editor' | 'admin')
                          }
                          className={`rounded border px-2.5 py-1 text-xs font-bold uppercase tracking-wider focus:outline-none ${
                            u.role === 'admin'
                              ? 'border-purple-300 bg-purple-50 text-purple-700'
                              : u.role === 'editor'
                                ? 'border-brand/40 bg-brand-50 text-brand'
                                : 'border-hairline bg-cream text-ink'
                          }`}
                        >
                          <option value="member">Member</option>
                          <option value="editor">Editor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>

                      <td className="px-5 py-4">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-purple-300 bg-purple-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-700">
                            <ShieldCheck className="h-3 w-3" /> Full System Rights
                          </span>
                        ) : isEditor ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-brand/30 bg-brand-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">
                            <KeyRound className="h-3 w-3" /> Editorial Suite
                          </span>
                        ) : perms.length === 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-hairline bg-cream px-2.5 py-0.5 text-[10px] font-medium text-muted">
                            <Lock className="h-2.5 w-2.5" /> Default (Submit-only)
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

                      <td className="px-5 py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenPermissions(u)}
                          className="text-xs"
                        >
                          <KeyRound className="h-3.5 w-3.5" /> Permissions
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

      {/* Granular Permissions Modal */}
      {selectedUser && (
        <Modal
          open={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          title={`Permissions: ${selectedUser.name}`}
        >
          <div className="space-y-4">
            <div className="rounded-md border border-hairline bg-cream p-3 text-xs">
              <p className="font-semibold text-ink">
                User: {selectedUser.name} ({selectedUser.email})
              </p>
              <p className="mt-0.5 text-muted">
                Role: <span className="font-bold uppercase text-brand">{selectedUser.role}</span>
              </p>
            </div>

            <p className="text-xs text-muted">
              Select extra operational permissions to grant to this member. Unchecked operations follow default member limits.
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
              <Button size="sm" onClick={handleSavePermissions} disabled={savingPermissions} arrow>
                {savingPermissions ? 'Saving…' : 'Save Permissions'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
