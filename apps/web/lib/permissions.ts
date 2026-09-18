import type { LucideIcon } from 'lucide-react';
import type { AuthUser } from '@/components/providers/AuthProvider';

export interface PermissionDefinition {
  id: string;
  label: string;
  description: string;
  routes: string[];
}

export const AVAILABLE_PERMISSIONS: PermissionDefinition[] = [
  {
    id: 'publish_articles',
    label: 'Direct Article & Story Publishing',
    description: 'Create, edit, and publish articles, stories, current affairs editions, and legal awareness guides.',
    routes: ['/admin/news', '/admin/stories', '/admin/current-affairs', '/admin/legal-awareness'],
  },
  {
    id: 'manage_events',
    label: 'Event Management',
    description: 'Create, edit, schedule, and cancel campus events and registrations.',
    routes: ['/admin/events'],
  },
  {
    id: 'manage_opportunities',
    label: 'Opportunities & Jobs',
    description: 'Post and manage internships, job openings, and fellowships.',
    routes: ['/admin/jobs', '/admin/internships', '/admin/fellowships', '/admin/opportunities'],
  },
  {
    id: 'manage_campuses',
    label: 'Campus Chapter Management',
    description: 'Add and update campus partner pages and college communities.',
    routes: ['/admin/campuses'],
  },
  {
    id: 'manage_podcasts',
    label: 'Podcast Management',
    description: 'Publish and organize audio podcast episodes.',
    routes: ['/admin/podcasts'],
  },
  {
    id: 'manage_campaigns',
    label: 'Campaign Management',
    description: 'Create and update thematic awareness campaigns and episode series.',
    routes: ['/admin/campaigns'],
  },
  {
    id: 'moderate_submissions',
    label: 'Submission Review & Moderation',
    description: 'Review and approve/reject community stories, campus updates, hiring applications, and contact messages.',
    routes: ['/admin/story-submissions', '/admin/campus-submissions', '/admin/hiring', '/admin/contact-messages'],
  },
  {
    id: 'manage_media',
    label: 'Media Library Access',
    description: 'Upload, replace, and manage media library assets.',
    routes: ['/admin/media'],
  },
];

/** Strictly Admin-only routes. Editors cannot access these under any circumstances. */
export const ADMIN_ONLY_ROUTES: string[] = [
  '/admin/team',
  '/admin/broadcast',
  '/admin/subscribers',
  '/admin/homepage',
  '/admin/social-links',
  '/admin/settings',
  '/admin/members',
];

/**
 * Get effective permissions for a user, including local overrides if in client demo mode.
 */
export function getUserPermissions(user: AuthUser | null): string[] {
  if (!user) return [];
  if (user.role === 'admin') {
    return AVAILABLE_PERMISSIONS.map((p) => p.id);
  }

  // Check user.customPermissions
  let permissions = Array.isArray(user.customPermissions) ? [...user.customPermissions] : [];

  // If in client/browser environment, check local overrides from Team Management
  if (typeof window !== 'undefined') {
    try {
      const stored = JSON.parse(window.localStorage.getItem('tsc.admin.custom_permissions') || '{}');
      if (stored[user.id]?.customPermissions) {
        permissions = stored[user.id].customPermissions;
      }
    } catch {
      /* ignore */
    }
  }

  return permissions;
}

/**
 * Checks if a user has a specific permission ID.
 */
export function hasPermission(user: AuthUser | null, permissionId: string): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.role !== 'editor') return false;
  const userPerms = getUserPermissions(user);
  return userPerms.includes(permissionId);
}

/**
 * Checks if a user is permitted to access a given admin URL pathname.
 */
export function canAccessRoute(user: AuthUser | null, pathname: string): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.role !== 'editor') return false;

  // Normalized path without trailing slash or query params
  const cleanPath = pathname.split('?')[0].replace(/\/$/, '') || '/admin';

  // Overview dashboard is always accessible to all staff
  if (cleanPath === '/admin') return true;

  // Admin-only routes are blocked for non-admin
  if (ADMIN_ONLY_ROUTES.some((route) => cleanPath === route || cleanPath.startsWith(route + '/'))) {
    return false;
  }

  // Check matching permission for the route
  const requiredDef = AVAILABLE_PERMISSIONS.find((perm) =>
    perm.routes.some((r) => cleanPath === r || cleanPath.startsWith(r + '/'))
  );

  if (!requiredDef) {
    // If route doesn't match any known permission or admin route, allow basic access or fallback
    return true;
  }

  const userPerms = getUserPermissions(user);
  return userPerms.includes(requiredDef.id);
}

/**
 * Filter admin navigation groups based on the user's role and granular permissions.
 */
export function filterNavGroups<
  T extends { label: string; items: { href: string; label: string; icon: LucideIcon }[] }
>(groups: T[], user: AuthUser | null): T[] {
  if (!user) return [];

  return groups
    .map((group) => {
      const filteredItems = group.items.filter((item) => canAccessRoute(user, item.href));
      return {
        ...group,
        items: filteredItems,
      };
    })
    .filter((group) => group.items.length > 0);
}
