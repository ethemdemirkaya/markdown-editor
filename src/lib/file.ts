import { open, save } from '@tauri-apps/plugin-dialog';
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';

const FILTERS = [
  { name: 'Markdown', extensions: ['md', 'markdown'] },
  { name: 'Text', extensions: ['txt'] },
  { name: 'All Files', extensions: ['*'] },
];

export type OpenedFile = { path: string; content: string };

export async function openFile(): Promise<OpenedFile | null> {
  const selected = await open({
    multiple: false,
    filters: FILTERS,
  });
  if (typeof selected !== 'string') return null;
  const content = await readTextFile(selected);
  return { path: selected, content };
}

export async function saveToPath(path: string, content: string): Promise<void> {
  await writeTextFile(path, content);
}

export async function chooseSavePath(suggested?: string): Promise<string | null> {
  const path = await save({
    filters: FILTERS,
    defaultPath: suggested,
  });
  return path ?? null;
}

export function basename(path: string): string {
  const norm = path.replace(/\\/g, '/');
  const idx = norm.lastIndexOf('/');
  return idx >= 0 ? norm.slice(idx + 1) : norm;
}
