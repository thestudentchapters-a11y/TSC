'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type Role = 'member' | 'editor' | 'admin';
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  college?: string;
  city?: string;
  phone?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (payload: RegisterPayload) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  getToken: () => string | null;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  college?: string;
  course?: string;
  graduationYear?: string;
  city?: string;
  state?: string;
  interests?: string;
  skills?: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = 'tsc.auth';

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

/**
 * Auth client — talks to the TSC API when NEXT_PUBLIC_API_URL is configured.
 * Without an API it runs in clearly-labelled demo mode so the experience
 * remains fully explorable.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw) as AuthUser);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const persist = useCallback((u: AuthUser | null) => {
    setUser(u);
    try {
      if (u) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
      const api = process.env.NEXT_PUBLIC_API_URL;
      if (api) {
        try {
          const res = await fetch(`${api}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          const json = await res.json();
          if (!res.ok) return { ok: false, error: json?.message ?? 'Login failed' };
          persist(json.data?.user ?? json.user);
          if (json.data?.token ?? json.token) {
            window.localStorage.setItem('tsc.token', String(json.data?.token ?? json.token));
          }
          return { ok: true };
        } catch {
          return { ok: false, error: 'Could not reach the API. Is the server running?' };
        }
      }
      // Demo mode
      if (!email.includes('@') || password.length < 6) {
        return { ok: false, error: 'Enter a valid email and a password of at least 6 characters.' };
      }
      const role: Role = email.startsWith('admin') ? 'admin' : email.startsWith('editor') ? 'editor' : 'member';
      persist({ id: `demo-${role}`, name: `TSC ${role === 'member' ? 'Member' : role === 'editor' ? 'Editor' : 'Admin'} (Demo)`, email, role });
      return { ok: true };
    },
    [persist]
  );

  const register = useCallback(
    async (payload: RegisterPayload): Promise<{ ok: boolean; error?: string }> => {
      const api = process.env.NEXT_PUBLIC_API_URL;
      if (api) {
        try {
          const res = await fetch(`${api}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          const json = await res.json();
          if (!res.ok) return { ok: false, error: json?.message ?? 'Registration failed' };
          return { ok: true };
        } catch {
          return { ok: false, error: 'Could not reach the API. Is the server running?' };
        }
      }
      // Demo mode — accepts and confirms
      persist({ id: 'demo-member', name: payload.name, email: payload.email, role: 'member', college: payload.college, city: payload.city });
      return { ok: true };
    },
    [persist]
  );

  const logout = useCallback(() => {
    persist(null);
    window.localStorage.removeItem('tsc.token');
  }, [persist]);

  const getToken = useCallback(() => {
    try {
      return window.localStorage.getItem('tsc.token');
    } catch {
      return null;
    }
  }, []);

  const value = useMemo(
    () => ({ user, ready, login, register, logout, getToken }),
    [user, ready, login, register, logout, getToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
