import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { readTextFile } from '@tauri-apps/plugin-fs';
import { openInTab } from './documents';

async function openPaths(paths: string[]): Promise<void> {
  for (const path of paths) {
    try {
      const content = await readTextFile(path);
      openInTab(path, content);
    } catch (err) {
      console.error(`Failed to open ${path}:`, err);
    }
  }
}

export async function initCliFileOpening(): Promise<() => void> {
  try {
    const startupFiles = await invoke<string[]>('get_startup_files');
    if (startupFiles.length > 0) {
      await openPaths(startupFiles);
    }
  } catch (err) {
    console.error('get_startup_files failed:', err);
  }

  const unlisten = await listen<string[]>('cli://open-files', (event) => {
    if (Array.isArray(event.payload) && event.payload.length > 0) {
      void openPaths(event.payload);
    }
  });

  return unlisten;
}
