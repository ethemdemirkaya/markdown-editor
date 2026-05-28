<script lang="ts">
  import Editor from '$lib/Editor.svelte';
  import Preview from '$lib/Preview.svelte';
  import { content } from '$lib/stores';
  import { theme, toggleTheme } from '$lib/theme';

  let editorValue = $state($content);
  let previewSource = $state($content);

  let debounceTimer: ReturnType<typeof setTimeout> | undefined;

  function onEditorChange(next: string) {
    editorValue = next;
    content.set(next);
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      previewSource = next;
    }, 100);
  }
</script>

<div class="app">
  <header class="topbar">
    <span class="brand">Markdown Editor</span>
    <div class="spacer"></div>
    <button class="icon-btn" type="button" onclick={toggleTheme} title="Tema değiştir">
      {$theme === 'dark' ? '☀' : '☾'}
    </button>
  </header>

  <main class="split">
    <section class="pane editor-pane">
      <Editor value={editorValue} onChange={onEditorChange} />
    </section>
    <div class="divider"></div>
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
    padding: 0 16px;
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

  .divider {
    width: 0;
  }
</style>
