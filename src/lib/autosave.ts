import { writeTextFile } from '@tauri-apps/plugin-fs';
import { get } from 'svelte/store';
import { docs, activeId, markSaved, restoreSession, type Doc } from './documents';
import { getSettings } from './settings';

const STORAGE_KEY = 'markdown-editor:session';
const AUTOSAVE_DELAY = 1500;

let diskTimer: ReturnType<typeof setTimeout> | undefined;
let started = false;

function persistSnapshot(): void {
  try {
    const payload = {
      docs: get(docs),
      activeId: get(activeId),
      savedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.error('Session snapshot failed:', err);
  }
}

async function flushToDisk(): Promise<void> {
  if (!getSettings().autosaveEnabled) return;
  const list = get(docs);
  for (const doc of list) {
    if (!doc.path) continue;
    if (doc.content === doc.savedContent) continue;
    try {
      await writeTextFile(doc.path, doc.content);
      markSaved(doc.id, doc.path);
    } catch (err) {
      console.error(`Autosave failed for ${doc.path}:`, err);
    }
  }
}

export function startAutosave(): void {
  if (started) return;
  started = true;

  docs.subscribe(() => {
    persistSnapshot();
    if (diskTimer) clearTimeout(diskTimer);
    diskTimer = setTimeout(() => {
      void flushToDisk();
    }, AUTOSAVE_DELAY);
  });

  activeId.subscribe(() => persistSnapshot());
}

export function restorePreviousSession(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw) as { docs: Doc[]; activeId: string | null };
    if (!data || !Array.isArray(data.docs) || data.docs.length === 0) return false;
    restoreSession(data.docs, data.activeId);
    return true;
  } catch (err) {
    console.error('Session restore failed:', err);
    return false;
  }
}

export async function flushNow(): Promise<void> {
  if (diskTimer) clearTimeout(diskTimer);
  persistSnapshot();
  await flushToDisk();
}
