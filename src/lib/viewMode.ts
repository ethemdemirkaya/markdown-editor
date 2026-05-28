import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type ViewMode = 'wysiwyg' | 'source';

const KEY = 'markdown-editor:view-mode';

function initial(): ViewMode {
  if (!browser) return 'wysiwyg';
  const saved = localStorage.getItem(KEY);
  return saved === 'source' ? 'source' : 'wysiwyg';
}

export const viewMode = writable<ViewMode>(initial());

if (browser) {
  viewMode.subscribe((v) => localStorage.setItem(KEY, v));
}

export function toggleViewMode() {
  viewMode.update((v) => (v === 'wysiwyg' ? 'source' : 'wysiwyg'));
}
