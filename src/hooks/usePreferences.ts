import { useEffect, useState } from "react";

/**
 * Client-side user preferences persisted in localStorage. These cover toggles
 * that are genuinely user-local (no backend persistence): sound, haptics,
 * live order polling, and data-saver mode. Account-level preferences (e.g.
 * push notifications) would need a backend endpoint and aren't surfaced here.
 *
 * The module keeps a single source of truth and notifies subscribers on
 * change, so any component using `usePreference` re-renders when a setting
 * is toggled elsewhere in the app.
 */
export type PreferenceKey =
  | "sound_effects"
  | "haptic_feedback"
  | "order_tracking"
  | "data_saver";

const STORAGE_KEY = "storefront_preferences";

const DEFAULTS: Record<PreferenceKey, boolean> = {
  sound_effects: true,
  haptic_feedback: true,
  order_tracking: true,
  data_saver: false,
};

function readAll(): Record<PreferenceKey, boolean> {
  if (typeof window === "undefined") return { ...DEFAULTS };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<Record<PreferenceKey, boolean>>;
    return { ...DEFAULTS, ...parsed };
  } catch {
    return { ...DEFAULTS };
  }
}

let cache = readAll();
const listeners = new Set<() => void>();

function persist() {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
    }
  } catch {
    // Quota / disabled storage — keep in-memory only.
  }
  listeners.forEach((cb) => cb());
}

export function getPreference<K extends PreferenceKey>(key: K): boolean {
  return cache[key];
}

export function setPreference<K extends PreferenceKey>(key: K, value: boolean) {
  cache = { ...cache, [key]: value };
  persist();
}

export function usePreference<K extends PreferenceKey>(
  key: K,
): [boolean, (next: boolean) => void] {
  const [value, setValue] = useState(cache[key]);
  useEffect(() => {
    const cb = () => setValue(cache[key]);
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  }, [key]);
  return [value, (next: boolean) => setPreference(key, next)];
}
