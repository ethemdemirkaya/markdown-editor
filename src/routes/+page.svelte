<script lang="ts">
  import { onMount } from 'svelte';
  import { initCliFileOpening } from '$lib/cli';
  import { startAutosave, restorePreviousSession } from '$lib/autosave';
  import { installCloseGuard } from '$lib/close-confirm';
  import { recentFiles, removeRecent } from '$lib/recent';
  import { openFileByPath } from '$lib/file';
  import TabBar from '$lib/TabBar.svelte';
  import WysiwygEditor from '$lib/WysiwygEditor.svelte';
  import SourceView from '$lib/SourceView.svelte';
  import OutlinePanel from '$lib/OutlinePanel.svelte';
  import { viewMode, toggleViewMode } from '$lib/viewMode';
  import FindReplace from '$lib/FindReplace.svelte';
  import { theme, toggleTheme } from '$lib/theme';
  import { openFile, saveToPath, chooseSavePath, chooseHtmlExportPath } from '$lib/file';
  import { renderStandaloneHtml, printPdfFromSource } from '$lib/export';
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

WYSIWYG modunda yaz. \`@\` ile blok menüsünü aç (kod, başlık, liste, tablo, matematik vb.).

## Kısayollar

- \`Ctrl/Cmd+N\` veya \`Ctrl/Cmd+T\` — yeni sekme
- \`Ctrl/Cmd+W\` — aktif sekmeyi kapat
- \`Ctrl/Cmd+Tab\` — sıradaki sekme
- \`Ctrl/Cmd+O\` — dosya aç
- \`Ctrl/Cmd+S\` — kaydet
- \`Ctrl/Cmd+Shift+S\` — farklı kaydet

## Matematik

Satır içi: $E = mc^2$, $a^2 + b^2 = c^2$.

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} \\, dx = \\sqrt{\\pi}
$$
`;

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

  let recentOpen = $state(false);
  let findOpen = $state(false);
  let findShowReplace = $state(false);
  let editorRev = $state(0);

  function openFind(withReplace: boolean) {
    findShowReplace = withReplace;
    findOpen = true;
  }

  function setActiveContent(next: string) {
    const id = get(activeId);
    if (!id) return;
    updateContent(id, next);
    editorRev++;
  }
  let outlineOpen = $state(
    typeof localStorage !== 'undefined' ? localStorage.getItem('markdown-editor:outline') !== 'closed' : true,
  );

  function toggleOutline() {
    outlineOpen = !outlineOpen;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('markdown-editor:outline', outlineOpen ? 'open' : 'closed');
    }
  }

  async function openRecent(path: string) {
    recentOpen = false;
    try {
      const { content } = await openFileByPath(path);
      openInTab(path, content);
    } catch (err) {
      console.error('Open recent failed:', err);
      removeRecent(path);
    }
  }

  function recentLabel(path: string): string {
    const norm = path.replace(/\\/g, '/');
    return norm.split('/').pop() ?? path;
  }

  function handleCloseActive() {
    const id = get(activeId);
    if (id) closeDoc(id);
  }

  function handleExportPdf() {
    const doc = get(activeDoc);
    if (!doc) return;
    const baseName = docName(doc).replace(/\.(md|markdown|txt)$/i, '');
    printPdfFromSource(doc.content, baseName);
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

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Tab' && event.ctrlKey) {
      event.preventDefault();
      cycleActive(event.shiftKey ? -1 : 1);
      return;
    }
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
    } else if (key === 'n' || key === 't') {
      event.preventDefault();
      handleNew();
    } else if (key === 'w') {
      event.preventDefault();
      handleCloseActive();
    } else if (key === 'r') {
      event.preventDefault();
      recentOpen = !recentOpen;
    } else if (key === 'f') {
      event.preventDefault();
      openFind(false);
    } else if (key === 'h') {
      event.preventDefault();
      openFind(true);
    } else if (key === 'p') {
      event.preventDefault();
      handleExportPdf();
    } else if (key === 'e') {
      event.preventDefault();
      toggleViewMode();
    }
  }

  onMount(() => {
    const restored = restorePreviousSession();
    if (!restored && get(docs).length === 0) {
      createUntitled(WELCOME);
    }
    startAutosave();
    window.addEventListener('keydown', handleKeydown);
    let unlistenCli: (() => void) | undefined;
    let unlistenClose: (() => void) | undefined;
    void initCliFileOpening().then((u) => (unlistenCli = u));
    void installCloseGuard().then((u) => (unlistenClose = u));
    return () => {
      window.removeEventListener('keydown', handleKeydown);
      unlistenCli?.();
      unlistenClose?.();
    };
  });
</script>

<div class="app">
  <header class="topbar">
    <span class="brand">Markdown Editor</span>
    <div class="spacer"></div>
    <button class="btn" type="button" onclick={handleNew} title="Yeni (Ctrl/Cmd+N)">Yeni</button>
    <button class="btn" type="button" onclick={handleOpen} title="Aç (Ctrl/Cmd+O)">Aç</button>
    <div class="dropdown-wrap">
      <button
        class="btn"
        type="button"
        onclick={() => (recentOpen = !recentOpen)}
        title="Son dosyalar (Ctrl/Cmd+R)"
      >Son ▾</button>
      {#if recentOpen}
        <div class="dropdown" role="menu">
          {#if $recentFiles.length === 0}
            <div class="dropdown-empty">Henüz dosya yok</div>
          {:else}
            {#each $recentFiles as path (path)}
              <button class="dropdown-item" type="button" onclick={() => openRecent(path)} title={path}>
                <span class="recent-name">{recentLabel(path)}</span>
                <span class="recent-path">{path}</span>
              </button>
            {/each}
          {/if}
        </div>
      {/if}
    </div>
    <button class="btn" type="button" onclick={handleSave} title="Kaydet (Ctrl/Cmd+S)">Kaydet</button>
    <button class="btn" type="button" onclick={handleExportHtml} title="HTML olarak dışa aktar">HTML</button>
    <button class="btn" type="button" onclick={handleExportPdf} title="PDF olarak yazdır (Ctrl/Cmd+P)">PDF</button>
    <button class="btn" type="button" onclick={toggleViewMode} title="Görünüm modu (Ctrl/Cmd+E)">
      {$viewMode === 'source' ? 'WYSIWYG' : 'Kaynak'}
    </button>
    <button class="icon-btn" type="button" onclick={toggleOutline} title="İçindekiler paneli">≡</button>
    <button class="icon-btn" type="button" onclick={toggleTheme} title="Tema değiştir">
      {$theme === 'dark' ? '☀' : '☾'}
    </button>
  </header>

  <TabBar />

  <main class="main">
    {#if $activeDoc}
      {#key `${$activeDoc.id}:${editorRev}:${$viewMode}`}
        {#if $viewMode === 'source'}
          <SourceView value={$activeDoc.content} onChange={onEditorChange} />
        {:else}
          <WysiwygEditor value={$activeDoc.content} onChange={onEditorChange} />
        {/if}
      {/key}
      {#if outlineOpen}
        <OutlinePanel source={$activeDoc.content} />
      {/if}
      {#if findOpen}
        <FindReplace
          initialReplace={findShowReplace}
          onClose={() => (findOpen = false)}
          getSource={() => $activeDoc?.content ?? ''}
          setSource={setActiveContent}
        />
      {/if}
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
    overflow: hidden;
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

  .dropdown-wrap {
    position: relative;
  }

  .dropdown {
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    min-width: 260px;
    max-width: 420px;
    background: var(--bg-base);
    border: 1px solid var(--border-subtle);
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
    z-index: 100;
    padding: 4px;
    max-height: 60vh;
    overflow-y: auto;
  }

  .dropdown-empty {
    padding: 8px 10px;
    color: var(--text-muted);
    font-size: 12px;
  }

  .dropdown-item {
    width: 100%;
    text-align: left;
    background: transparent;
    border: none;
    padding: 6px 10px;
    border-radius: 5px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 2px;
    color: var(--text-primary);
    font-size: 12px;
  }

  .dropdown-item:hover {
    background: var(--code-inline-bg);
  }

  .recent-name {
    font-weight: 500;
  }

  .recent-path {
    font-size: 11px;
    color: var(--text-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .main {
    flex: 1;
    display: flex;
    min-height: 0;
    min-width: 0;
    overflow: hidden;
    position: relative;
  }

  .main > :global(*) {
    flex: 1;
    min-width: 0;
    min-height: 0;
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
