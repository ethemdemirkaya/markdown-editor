import { getCurrentWindow } from '@tauri-apps/api/window';
import { invoke } from '@tauri-apps/api/core';
import { confirm } from '@tauri-apps/plugin-dialog';
import { get } from 'svelte/store';
import { docs, isDirty } from './documents';
import { flushNow } from './autosave';
import { getSettings } from './settings';

async function forceQuit(): Promise<void> {
  try {
    await invoke('force_exit');
  } catch (err) {
    console.error('force_exit failed, falling back to window.close():', err);
    try {
      await getCurrentWindow().close();
    } catch (err2) {
      console.error('window.close() also failed:', err2);
    }
  }
}

export async function installCloseGuard(): Promise<() => void> {
  const win = getCurrentWindow();
  let exiting = false;

  const unlisten = await win.onCloseRequested(async (event) => {
    if (exiting) return;
    if (!getSettings().confirmOnClose) return;
    const dirtyDocs = get(docs).filter(isDirty);
    if (dirtyDocs.length === 0) return;

    event.preventDefault();
    const names = dirtyDocs
      .map((d) => (d.path ? d.path.split(/[\\/]/).pop() : `Untitled-${d.untitledIndex}.md`))
      .join(', ');
    const ok = await confirm(
      `Kaydedilmemiş değişiklikler var: ${names}\n\nYine de çıkmak istiyor musun?`,
      { title: 'Çıkışı onayla', kind: 'warning', okLabel: 'Çık', cancelLabel: 'İptal' },
    );
    if (!ok) return;

    exiting = true;

    // flushNow disk writes — yine de çıkışı engellemesin. 1.5sn timeout.
    void Promise.race([
      flushNow(),
      new Promise<void>((resolve) => setTimeout(resolve, 1500)),
    ]).finally(() => {
      void forceQuit();
    });
  });

  return unlisten;
}
