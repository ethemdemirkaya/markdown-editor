<script lang="ts">
  import Editor from '$lib/Editor.svelte';
  import Preview from '$lib/Preview.svelte';
  import { content } from '$lib/stores';

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
