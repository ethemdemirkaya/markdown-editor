import { writable } from 'svelte/store';

export type ViewMode = 'wysiwyg' | 'source';

// Persistence kaldırıldı: uygulama her zaman WYSIWYG ile başlar.
// Ctrl+E ile session içinde toggle edilir.
export const viewMode = writable<ViewMode>('wysiwyg');

export function toggleViewMode(): void {
  viewMode.update((v) => (v === 'wysiwyg' ? 'source' : 'wysiwyg'));
}
