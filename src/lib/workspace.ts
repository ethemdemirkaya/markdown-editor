import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import { readDir } from '@tauri-apps/plugin-fs';
import { open } from '@tauri-apps/plugin-dialog';

const ROOT_KEY = 'markdown-editor:workspace-root';
const EXPANDED_KEY = 'markdown-editor:workspace-expanded';

export type FsEntry = {
  name: string;
  path: string;
  isDirectory: boolean;
  isFile: boolean;
};

export const workspaceRoot = writable<string | null>(loadRoot());
export const expandedDirs = writable<Set<string>>(loadExpanded());

function loadRoot(): string | null {
  if (!browser) return null;
  try {
    return localStorage.getItem(ROOT_KEY);
  } catch {
    return null;
  }
}

function loadExpanded(): Set<string> {
  if (!browser) return new Set();
  try {
    const raw = localStorage.getItem(EXPANDED_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

if (browser) {
  workspaceRoot.subscribe((v) => {
    try {
      if (v) localStorage.setItem(ROOT_KEY, v);
      else localStorage.removeItem(ROOT_KEY);
    } catch {
      /* ignore */
    }
  });
  expandedDirs.subscribe((s) => {
    try {
      localStorage.setItem(EXPANDED_KEY, JSON.stringify([...s]));
    } catch {
      /* ignore */
    }
  });
}

function joinPath(parent: string, name: string): string {
  const sep = parent.includes('\\') && !parent.includes('/') ? '\\' : '/';
  return parent.endsWith(sep) ? `${parent}${name}` : `${parent}${sep}${name}`;
}

export function basename(path: string): string {
  const norm = path.replace(/\\/g, '/');
  const idx = norm.lastIndexOf('/');
  return idx >= 0 ? norm.slice(idx + 1) : path;
}

export async function listDir(dir: string): Promise<FsEntry[]> {
  const entries = await readDir(dir);
  return entries
    .map((e) => ({
      name: e.name,
      path: joinPath(dir, e.name),
      isDirectory: !!e.isDirectory,
      isFile: !!e.isFile,
    }))
    .sort((a, b) => {
      if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });
}

export async function pickWorkspace(): Promise<string | null> {
  const selected = await open({ directory: true, multiple: false });
  if (typeof selected !== 'string') return null;
  workspaceRoot.set(selected);
  // Kök expanded olarak işaretle
  expandedDirs.update((s) => new Set([...s, selected]));
  return selected;
}

export function closeWorkspace(): void {
  workspaceRoot.set(null);
}

export function toggleExpanded(path: string): void {
  expandedDirs.update((s) => {
    const next = new Set(s);
    if (next.has(path)) next.delete(path);
    else next.add(path);
    return next;
  });
}

export function isExpanded(path: string): boolean {
  return get(expandedDirs).has(path);
}

const MARKDOWN_EXTS = new Set(['md', 'markdown', 'mdown', 'mkd', 'txt']);

export function isMarkdownLike(name: string): boolean {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  return MARKDOWN_EXTS.has(ext);
}
