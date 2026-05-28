<script lang="ts">
  import { onMount } from 'svelte';
  import {
    workspaceRoot,
    pickWorkspace,
    closeWorkspace,
    listDir,
    basename,
    type FsEntry,
  } from './workspace';
  import FileTreeNode from './FileTreeNode.svelte';
  import { t } from './i18n';

  type Props = {
    activePath: string | null;
    onOpen: (path: string) => void;
  };

  let { activePath, onOpen }: Props = $props();

  let entries: FsEntry[] | null = $state(null);
  let loading = $state(false);
  let error: string | null = $state(null);

  async function refresh(path: string) {
    loading = true;
    error = null;
    try {
      entries = await listDir(path);
    } catch (err) {
      error = String(err);
      entries = null;
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    const root = $workspaceRoot;
    if (root) void refresh(root);
    else {
      entries = null;
      error = null;
    }
  });

  async function onPick() {
    try {
      await pickWorkspace();
    } catch (err) {
      console.error('pickWorkspace failed:', err);
    }
  }

  async function onRefresh() {
    const root = $workspaceRoot;
    if (root) await refresh(root);
  }
</script>

<aside class="workspace">
  <header class="head">
    <div class="title-wrap">
      <span class="title">{$t('workspace.title')}</span>
      {#if $workspaceRoot}
        <span class="root" title={$workspaceRoot}>{basename($workspaceRoot)}</span>
      {/if}
    </div>
    <div class="actions">
      <button class="icon-btn" type="button" onclick={onPick} title={$t('workspace.open')}>📂</button>
      {#if $workspaceRoot}
        <button class="icon-btn" type="button" onclick={onRefresh} title={$t('workspace.refresh')}>⟳</button>
        <button class="icon-btn" type="button" onclick={closeWorkspace} title={$t('workspace.close')}>×</button>
      {/if}
    </div>
  </header>

  <div class="body">
    {#if !$workspaceRoot}
      <div class="empty">
        <p>{$t('workspace.empty')}</p>
        <button class="btn" type="button" onclick={onPick}>{$t('workspace.open')}</button>
      </div>
    {:else if loading && entries === null}
      <div class="loading">…</div>
    {:else if error}
      <div class="error">{error}</div>
    {:else if entries}
      {#each entries as entry (entry.path)}
        <FileTreeNode {entry} depth={0} {activePath} {onOpen} />
      {/each}
    {/if}
  </div>
</aside>

<style>
  .workspace {
    flex: 0 0 260px;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--bg-elevated);
    border-right: 1px solid var(--border-subtle);
    user-select: none;
    overflow: hidden;
  }

  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 8px 10px;
    border-bottom: 1px solid var(--border-subtle);
  }

  .title-wrap {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1;
  }

  .title {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--text-muted);
  }

  .root {
    font-size: 12px;
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .actions {
    display: flex;
    gap: 2px;
  }

  .icon-btn {
    appearance: none;
    background: transparent;
    border: 0;
    color: var(--text-primary);
    width: 24px;
    height: 24px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .icon-btn:hover {
    background: var(--code-inline-bg);
  }

  .body {
    flex: 1;
    overflow-y: auto;
    padding: 4px 0;
  }

  .empty {
    padding: 24px 16px;
    text-align: center;
    color: var(--text-muted);
    font-size: 12px;
  }

  .empty p {
    margin: 0 0 10px;
  }

  .btn {
    appearance: none;
    background: transparent;
    border: 1px solid var(--border-subtle);
    color: var(--text-primary);
    padding: 4px 10px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
  }

  .btn:hover {
    background: var(--code-inline-bg);
  }

  .loading,
  .error {
    padding: 10px;
    font-size: 12px;
    color: var(--text-muted);
  }

  .error {
    color: var(--alert-caution);
  }
</style>
