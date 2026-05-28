import { writable, derived, get } from 'svelte/store';
import { basename } from './file';

export type Doc = {
  id: string;
  path: string | null;
  untitledIndex: number | null;
  content: string;
  savedContent: string;
};

function newId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export const docs = writable<Doc[]>([]);
export const activeId = writable<string | null>(null);

export const activeDoc = derived([docs, activeId], ([$docs, $activeId]) => {
  return $docs.find((d) => d.id === $activeId) ?? null;
});

let untitledCounter = 0;

function nextUntitledIndex(): number {
  return ++untitledCounter;
}

export function docName(doc: Doc): string {
  if (doc.path) return basename(doc.path);
  return `Untitled-${doc.untitledIndex ?? 1}.md`;
}

export function isDirty(doc: Doc): boolean {
  return doc.content !== doc.savedContent;
}

export function createUntitled(initialContent = ''): string {
  const doc: Doc = {
    id: newId(),
    path: null,
    untitledIndex: nextUntitledIndex(),
    content: initialContent,
    savedContent: initialContent,
  };
  docs.update((list) => [...list, doc]);
  activeId.set(doc.id);
  return doc.id;
}

export function openInTab(path: string, content: string): string {
  const existing = get(docs).find((d) => d.path === path);
  if (existing) {
    activeId.set(existing.id);
    docs.update((list) =>
      list.map((d) => (d.id === existing.id ? { ...d, content, savedContent: content } : d)),
    );
    return existing.id;
  }
  const doc: Doc = {
    id: newId(),
    path,
    untitledIndex: null,
    content,
    savedContent: content,
  };
  docs.update((list) => [...list, doc]);
  activeId.set(doc.id);
  return doc.id;
}

export function updateContent(id: string, content: string): void {
  docs.update((list) => list.map((d) => (d.id === id ? { ...d, content } : d)));
}

export function markSaved(id: string, path: string): void {
  docs.update((list) =>
    list.map((d) => (d.id === id ? { ...d, path, savedContent: d.content } : d)),
  );
}

export function closeDoc(id: string): void {
  const list = get(docs);
  const idx = list.findIndex((d) => d.id === id);
  if (idx < 0) return;
  const next = list.filter((d) => d.id !== id);
  docs.set(next);
  if (get(activeId) === id) {
    const fallback = next[idx] ?? next[idx - 1] ?? next[0] ?? null;
    activeId.set(fallback?.id ?? null);
    if (!fallback) createUntitled('');
  }
}

export function setActive(id: string): void {
  activeId.set(id);
}

export function cycleActive(direction: 1 | -1): void {
  const list = get(docs);
  if (list.length === 0) return;
  const current = get(activeId);
  const idx = list.findIndex((d) => d.id === current);
  const nextIdx = (idx + direction + list.length) % list.length;
  activeId.set(list[nextIdx].id);
}
