import { create } from 'zustand';
import { db, ensureSettings } from '@/db/local/db';
import type { AppSettings } from '@/types';

type ThemeMode = AppSettings['theme'];

interface SettingsState {
  ready: boolean;
  settings: AppSettings | null;
  init: () => Promise<void>;
  update: (patch: Partial<Omit<AppSettings, 'id' | 'updatedAt'>>) => Promise<void>;
  resolvedTheme: () => 'light' | 'dark';
}

function systemPrefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function applyTheme(settings: AppSettings | null): void {
  if (typeof document === 'undefined') return;
  const mode: ThemeMode = settings?.theme ?? 'system';
  const dark = mode === 'dark' || (mode === 'system' && systemPrefersDark());
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  if (settings?.reducedMotion) {
    document.documentElement.dataset.reducedMotion = 'true';
  } else {
    delete document.documentElement.dataset.reducedMotion;
  }
}

export function applyLocale(settings: AppSettings | null): void {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = settings?.locale ?? 'bn-BD';
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ready: false,
  settings: null,

  init: async () => {
    const settings = await ensureSettings();
    applyTheme(settings);
    applyLocale(settings);
    set({ settings, ready: true });
  },

  update: async (patch) => {
    const current = get().settings;
    if (!current) return;
    const next: AppSettings = { ...current, ...patch, updatedAt: new Date().toISOString() };
    await db.settings.put(next);
    applyTheme(next);
    applyLocale(next);
    set({ settings: next });
  },

  resolvedTheme: () => {
    const mode = get().settings?.theme ?? 'system';
    if (mode === 'system') return systemPrefersDark() ? 'dark' : 'light';
    return mode;
  },
}));

if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const settings = useSettingsStore.getState().settings;
    if (settings?.theme === 'system') applyTheme(settings);
  });
}
