/**
 * storage.ts — MindStream
 *
 * All data is stored on the backend (Express + JSON file).
 * Auth token is kept in localStorage (session only — not the data itself).
 * All original exports are preserved for Navbar.tsx, Admin.tsx, Login.tsx, etc.
 */

import { BlogPost, StorageKeys, AdminSettings } from '../types';

const API_BASE = '/api';

// ─── Token helpers ────────────────────────────────────────────────────────────

function getToken(): string | null {
  return localStorage.getItem(StorageKeys.AUTH);
}

function setToken(token: string): void {
  localStorage.setItem(StorageKeys.AUTH, token);
}

function removeToken(): void {
  localStorage.removeItem(StorageKeys.AUTH);
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
}

// ─── Public Post API ──────────────────────────────────────────────────────────

/**
 * Fetch all published posts (public).
 */
export const getPosts = async (): Promise<BlogPost[]> => {
  const res = await fetch(`${API_BASE}/posts`);
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json();
};

/**
 * Fetch a single post by ID (public).
 */
export const getPostById = async (id: string): Promise<BlogPost | undefined> => {
  const res = await fetch(`${API_BASE}/posts/${id}`);
  if (res.status === 404) return undefined;
  if (!res.ok) throw new Error('Failed to fetch post');
  return res.json();
};

/**
 * Create or update a post (admin only).
 */
export const savePost = async (post: BlogPost): Promise<void> => {
  const existing = await fetch(`${API_BASE}/posts/${post.id}`);

  let res: Response;
  if (existing.ok) {
    res = await fetch(`${API_BASE}/posts/${post.id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(post),
    });
  } else {
    res = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(post),
    });
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).error || 'Failed to save post');
  }

  const settings = getSettings();
  if (settings.webhookUrl) {
    try {
      await fetch(settings.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: existing.ok ? 'update' : 'create', post }),
      });
    } catch (e) {
      console.error('Failed to sync to webhook', e);
    }
  }
};

/**
 * Delete a post by ID (admin only).
 */
export const deletePost = async (id: string): Promise<void> => {
  const res = await fetch(`${API_BASE}/posts/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).error || 'Failed to delete post');
  }
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

export const login = async (password: string): Promise<boolean> => {
  try {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    setToken(data.token);
    return true;
  } catch {
    return false;
  }
};

export const logout = (): void => {
  removeToken();
};

// ─── Settings (localStorage — device-specific config) ────────────────────────

export const getSettings = (): AdminSettings => {
  const data = localStorage.getItem(StorageKeys.SETTINGS);
  return data ? JSON.parse(data) : {};
};

export const saveSettings = (settings: AdminSettings): void => {
  localStorage.setItem(StorageKeys.SETTINGS, JSON.stringify(settings));
};
