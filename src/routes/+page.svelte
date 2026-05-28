<script lang="ts">
  import { onMount } from 'svelte';
  import Editor from '$lib/Editor.svelte';
  import Preview from '$lib/Preview.svelte';
  import TabBar from '$lib/TabBar.svelte';
  import WysiwygEditor from '$lib/WysiwygEditor.svelte';
  import { theme, toggleTheme } from '$lib/theme';
  import { viewMode, toggleViewMode } from '$lib/viewMode';
  import { openFile, saveToPath, chooseSavePath, chooseHtmlExportPath, basename } from '$lib/file';
  import { renderStandaloneHtml } from '$lib/export';
  import {
    docs,
    activeDoc,
    activeId,
    createUntitled,
    openInTab,
    updateContent,
    markSaved,
    closeDoc,
    cycleActive,
    docName,
    isDirty,
  } from '$lib/documents';
  import { get } from 'svelte/store';

  const WELCOME = `# Welcome to Markdown Editor

Solda yaz, sağda **canlı önizleme**.

## Kısayollar

- \`Ctrl/Cmd+N\` — yeni sekme
- \`Ctrl/Cmd+T\` — yeni sekme (alternatif)
- \`Ctrl/Cmd+W\` — aktif sekmeyi kapat
- \`Ctrl/Cmd+Tab\` — sıradaki sekme
- \`Ctrl/Cmd+O\` — dosya aç
- \`Ctrl/Cmd+S\` — kaydet
- \`Ctrl/Cmd+Shift+S\` — farklı kaydet

## Matematik

Satır içi: $E = mc^2$, $a^2 + b^2 = c^2$.

Blok:

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} \\, dx = \\sqrt{\\pi}
$$

$$
\\frac{\\partial f}{\\partial x} = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}
$$
`;

  let previewSource = $state('');
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;

  let docTitle = $derived.by(() => {
    const doc = $activeDoc;
    if (!doc) return 'Markdown Editor';
    const dirty = isDirty(doc) ? '● ' : '';
    return `${dirty}${docName(doc)} — Markdown Editor`;
  });

  $effect(() => {
    if (typeof document !== 'undefined') {
      document.title = docTitle;
    }
  });

  $effect(() => {
    const doc = $activeDoc;
    if (!doc) {
      previewSource = '';
      return;
    }
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      previewSource = doc.content;
    }, 100);
  });

  function onEditorChange(next: string) {
    const id = get(activeId);
    if (!id) return;
    updateContent(id, next);
  }

  async function handleOpen() {
    try {
      const opened = await openFile();
      if (!opened) return;
      openInTab(opened.path, opened.content);
    } catch (err) {
      console.error('Open failed:', err);
    }
  }

  async function handleSave() {
    const doc = get(activeDoc);
    if (!doc) return;
    try {
      let path = doc.path;
      if (!path) {
        path = await chooseSavePath(docName(doc));
        if (!path) return;
      }
      await saveToPath(path, doc.content);
      markSaved(doc.id, path);
    } catch (err) {
      console.error('Save failed:', err);
    }
  }

  async function handleSaveAs() {
    const doc = get(activeDoc);
    if (!doc) return;
    try {
      const path = await chooseSavePath(doc.path ?? docName(doc));
      if (!path) return;
      await saveToPath(path, doc.content);
      markSaved(doc.id, path);
    } catch (err) {
      console.error('Save As failed:', err);
    }
  }

  function handleNew() {
    createUntitled('');
  }

  async function handleExportHtml() {
    const doc = get(activeDoc);
    if (!doc) return;
    try {
      const baseName = docName(doc).replace(/\.(md|markdown|txt)$/i, '');
      const suggested = doc.path
        ? doc.path.replace(/\.(md|markdown|txt)$/i, '.html')
        : `${baseName}.html`;
      const path = await chooseHtmlExportPath(suggested);
      if (!path) return;
      const html = renderStandaloneHtml(doc.content, baseName, get(theme));
      await saveToPath(path, html);
    } catch (err) {
      console.error('Export failed:', err);
    }
  }

  function handleCloseActive() {
    const id = get(activeId);
    if (id) closeDoc(id);
  }

  function handleKeydown(event: KeyboardEvent) {
    const mod = event.ctrlKey || event.metaKey;
    if (event.key === 'Tab' && event.ctrlKey) {
      event.preventDefault();
      cycleActive(event.shiftKey ? -1 : 1);
      return;
    }
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
    } else if (key === 'n' || key === 't') {
      event.preventDefault();
      handleNew();
    } else if (key === 'w') {
      event.preventDefault();
      handleCloseActive();
    } else if (key === 'e') {
      event.preventDefault();
      toggleViewMode();
    }
  }

  onMount(() => {
    if (get(docs).length === 0) {
      createUntitled(WELCOME);
    }
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });
</script>

<div class="app">
  <header class="topbar">
    <span class="brand">Markdown Editor</span>
    <div class="spacer"></div>
    <button class="btn" type="button" onclick={handleNew} title="Yeni (Ctrl/Cmd+N)">Yeni</button>
    <button class="btn" type="button" onclick={handleOpen} title="Aç (Ctrl/Cmd+O)">Aç</button>
    <button class="btn" type="button" onclick={handleSave} title="Kaydet (Ctrl/Cmd+S)">Kaydet</button>
    <button class="btn" type="button" onclick={handleExportHtml} title="HTML olarak dışa aktar">Dışa Aktar</button>
    <button class="btn" type="button" onclick={toggleViewMode} title="Görünüm modu (Ctrl/Cmd+E)">
      {$viewMode === 'wysiwyg' ? 'Kaynak' : 'WYSIWYG'}
    </button>
    <button class="icon-btn" type="button" onclick={toggleTheme} title="Tema değiştir">
      {$theme === 'dark' ? '☀' : '☾'}
    </button>
  </header>

  <TabBar />

  <main class="main">
    {#if $activeDoc}
      {#key `${$activeDoc.id}:${$viewMode}`}
        {#if $viewMode === 'wysiwyg'}
          <section class="pane wysiwyg-pane">
            <WysiwygEditor value={$activeDoc.content} onChange={onEditorChange} />
          </section>
        {:else}
          <div class="split">
            <section class="pane editor-pane">
              <Editor value={$activeDoc.content} onChange={onEditorChange} />
            </section>
            <section class="pane preview-pane">
              <Preview source={previewSource} />
            </section>
          </div>
        {/if}
      {/key}
    {:else}
      <div class="empty">Hiç sekme açık değil. <button class="btn" onclick={handleNew}>Yeni Sekme</button></div>
    {/if}
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
    gap: 8px;
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

  .main {
    flex: 1;
    display: flex;
    min-height: 0;
  }

  .split {
    flex: 1;
    display: flex;
    min-height: 0;
  }

  .wysiwyg-pane {
    flex: 1;
    overflow: hidden;
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

  .empty {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: var(--text-muted);
  }
</style>
