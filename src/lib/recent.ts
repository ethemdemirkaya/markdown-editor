import { writable } from 'svelte/store';

const STORAGE_KEY = 'markdown-editor:recent-files';
const MAX_ENTRIES = 10;

function load(): string[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((p) => typeof p === 'string') : [];
  } catch {
    return [];
  }
}

function persist(list: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Recent files persist failed:', err);
  }
}

export const recentFiles = writable<string[]>(load());

export function pushRecent(path: string): void {
  recentFiles.update((list) => {
    const next = [path, ...list.filter((p) => p !== path)].slice(0, MAX_ENTRIES);
    persist(next);
    return next;
  });
}

export function removeRecent(path: string): void {
  recentFiles.update((list) => {
    const next = list.filter((p) => p !== path);
    persist(next);
    return next;
  });
}

export function clearRecent(): void {
  recentFiles.set([]);
  persist([]);
}
