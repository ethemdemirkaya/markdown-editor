import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';

export type AtBehavior = 'new-paragraph' | 'inline' | 'disabled';

export type Settings = {
  atBehavior: AtBehavior;
  outlineDefaultOpen: boolean;
  autosaveEnabled: boolean;
  confirmOnClose: boolean;
};

const KEY = 'markdown-editor:settings';

const DEFAULTS: Settings = {
  atBehavior: 'inline',
  outlineDefaultOpen: true,
  autosaveEnabled: true,
  confirmOnClose: true,
};

function load(): Settings {
  if (!browser) return DEFAULTS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...parsed };
  } catch {
    return DEFAULTS;
  }
}

export const settings = writable<Settings>(load());

if (browser) {
  settings.subscribe((value) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(value));
    } catch {
      // ignore quota
    }
  });
}

export function getSettings(): Settings {
  return get(settings);
}

export function setSetting<K extends keyof Settings>(key: K, value: Settings[K]): void {
  settings.update((s) => ({ ...s, [key]: value }));
}
