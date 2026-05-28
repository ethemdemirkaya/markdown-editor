import { getCurrentWindow } from '@tauri-apps/api/window';
import { confirm } from '@tauri-apps/plugin-dialog';
import { get } from 'svelte/store';
import { docs, isDirty } from './documents';
import { flushNow } from './autosave';

export async function installCloseGuard(): Promise<() => void> {
  const win = getCurrentWindow();
  const unlisten = await win.onCloseRequested(async (event) => {
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
    if (ok) {
      await flushNow();
      await win.destroy();
    }
  });

  return unlisten;
}
