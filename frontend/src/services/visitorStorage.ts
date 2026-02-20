/**
 * visitorStorage.ts — MindStream
 *
 * Visitors are now stored globally on the backend (visitors.json).
 * All original exports preserved: getVisitors, addVisitor, hasUserJoined, setUserJoined.
 * VisitorTicker.tsx requires NO changes.
 */

import { Visitor, StorageKeys } from '../types';

const API_BASE = '/api';

/**
 * Fetch all visitors from the last 24h (global, server-side).
 * VisitorTicker calls this — return type matches original: Visitor[]
 */
export const getVisitors = async (): Promise<Visitor[]> => {
  try {
    const res = await fetch(`${API_BASE}/visitors`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
};

/**
 * Register a visitor by name (global, server-side).
 * Returns the updated visitor list so the ticker refreshes immediately.
 */
export const addVisitor = async (name: string): Promise<Visitor[]> => {
  try {
    await fetch(`${API_BASE}/visitors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    // Return the fresh global list
    return getVisitors();
  } catch {
    return getVisitors();
  }
};

/**
 * Check if this browser has already submitted a visitor name.
 * Stays in localStorage — it's a per-device "don't ask again" flag, not data.
 */
export const hasUserJoined = (): boolean => {
  return localStorage.getItem('mindstream_has_joined') === 'true';
};

/**
 * Mark this browser as having joined.
 */
export const setUserJoined = (): void => {
  localStorage.setItem('mindstream_has_joined', 'true');
};
