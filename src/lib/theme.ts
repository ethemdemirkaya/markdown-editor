import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'markdown-editor:theme';

function initial(): Theme {
  if (!browser) return 'light';
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const theme = writable<Theme>(initial());

if (browser) {
  theme.subscribe((value) => {
    document.documentElement.dataset.theme = value;
    localStorage.setItem(STORAGE_KEY, value);
  });
}

export function toggleTheme() {
  theme.update((t) => (t === 'light' ? 'dark' : 'light'));
}
