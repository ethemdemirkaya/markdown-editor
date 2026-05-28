<script lang="ts">
  import { onMount } from 'svelte';
  import Editor from '$lib/Editor.svelte';
  import Preview from '$lib/Preview.svelte';
  import { content } from '$lib/stores';
  import { theme, toggleTheme } from '$lib/theme';
  import { openFile, saveToPath, chooseSavePath, basename } from '$lib/file';

  let editorValue = $state($content);
  let previewSource = $state($content);
  let currentPath = $state<string | null>(null);
  let savedContent = $state(editorValue);

  let isDirty = $derived(editorValue !== savedContent);

  let docTitle = $derived.by(() => {
    const name = currentPath ? basename(currentPath) : 'Untitled.md';
    return `${isDirty ? '● ' : ''}${name} — Markdown Editor`;
  });

  $effect(() => {
    if (typeof document !== 'undefined') {
      document.title = docTitle;
    }
  });

  let debounceTimer: ReturnType<typeof setTimeout> | undefined;

  function onEditorChange(next: string) {
    editorValue = next;
    content.set(next);
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      previewSource = next;
    }, 100);
  }

  async function handleOpen() {
    try {
      const opened = await openFile();
      if (!opened) return;
      currentPath = opened.path;
      editorValue = opened.content;
      savedContent = opened.content;
      previewSource = opened.content;
      content.set(opened.content);
    } catch (err) {
      console.error('Open failed:', err);
    }
  }

  async function handleSave() {
    try {
      let path = currentPath;
      if (!path) {
        path = await chooseSavePath('Untitled.md');
        if (!path) return;
      }
      await saveToPath(path, editorValue);
      currentPath = path;
      savedContent = editorValue;
    } catch (err) {
      console.error('Save failed:', err);
    }
  }

  async function handleSaveAs() {
    try {
      const path = await chooseSavePath(currentPath ?? 'Untitled.md');
      if (!path) return;
      await saveToPath(path, editorValue);
      currentPath = path;
      savedContent = editorValue;
    } catch (err) {
      console.error('Save As failed:', err);
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    const mod = event.ctrlKey || event.metaKey;
    if (!mod) return;
    const key = event.key.toLowerCase();
    if (key === 's' && event.shiftKey) {
      event.preventDefault();
      handleSaveAs();
    } else if (key === 's') {
      event.preventDefault();
      handleSave();
    } else if (key === 'o') {
      event.preventDefault();
      handleOpen();
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });
</script>

<div class="app">
  <header class="topbar">
    <span class="brand">Markdown Editor</span>
    <span class="file-name">
      {currentPath ? basename(currentPath) : 'Untitled.md'}
      {#if isDirty}<span class="dirty" title="Kaydedilmemiş değişiklik">●</span>{/if}
    </span>
    <div class="spacer"></div>
    <button class="btn" type="button" onclick={handleOpen} title="Aç (Ctrl/Cmd+O)">Aç</button>
    <button class="btn" type="button" onclick={handleSave} title="Kaydet (Ctrl/Cmd+S)">Kaydet</button>
    <button class="icon-btn" type="button" onclick={toggleTheme} title="Tema değiştir">
      {$theme === 'dark' ? '☀' : '☾'}
    </button>
  </header>

  <main class="split">
    <section class="pane editor-pane">
      <Editor value={editorValue} onChange={onEditorChange} />
    </section>
    <section class="pane preview-pane">
      <Preview source={previewSource} />
    </section>
  </main>
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
  }

  .topbar {
    height: 40px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 12px;
    background: var(--bg-elevated);
    border-bottom: 1px solid var(--border-subtle);
    user-select: none;
  }

  .brand {
    font-weight: 600;
    font-size: 13px;
    letter-spacing: 0.02em;
  }

  .file-name {
    font-size: 12px;
    color: var(--text-muted);
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .dirty {
    color: var(--accent);
    font-size: 14px;
    line-height: 1;
  }

  .spacer {
    flex: 1;
  }

  .btn {
    background: transparent;
    border: 1px solid var(--border-subtle);
    color: var(--text-primary);
    height: 28px;
    padding: 0 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    transition: background 0.15s;
  }

  .btn:hover {
    background: var(--code-inline-bg);
  }

  .icon-btn {
    background: transparent;
    border: 1px solid var(--border-subtle);
    color: var(--text-primary);
    width: 28px;
    height: 28px;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    padding: 0;
    transition: background 0.15s;
  }

  .icon-btn:hover {
    background: var(--code-inline-bg);
  }

  .split {
    flex: 1;
    display: flex;
    min-height: 0;
  }

  .pane {
    flex: 1 1 0;
    min-width: 0;
    overflow: hidden;
  }

  .editor-pane {
    background: var(--bg-base);
  }

  .preview-pane {
    background: var(--bg-elevated);
    border-left: 1px solid var(--border-subtle);
  }
</style>
