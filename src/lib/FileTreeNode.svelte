<script lang="ts">
  import { expandedDirs, isMarkdownLike, listDir, toggleExpanded, type FsEntry } from './workspace';
  import Self from './FileTreeNode.svelte';

  type Props = {
    entry: FsEntry;
    depth: number;
    activePath: string | null;
    onOpen: (path: string) => void;
  };

  let { entry, depth, activePath, onOpen }: Props = $props();

  let children: FsEntry[] | null = $state(null);
  let loading = $state(false);
  let error = $state<string | null>(null);

  let open = $derived($expandedDirs.has(entry.path));

  $effect(() => {
    if (entry.isDirectory && open && children === null && !loading) {
      loading = true;
      void listDir(entry.path)
        .then((list) => {
          children = list;
          error = null;
        })
        .catch((err) => {
          error = String(err);
        })
        .finally(() => {
          loading = false;
        });
    }
  });

  function onClick() {
    if (entry.isDirectory) {
      toggleExpanded(entry.path);
    } else if (isMarkdownLike(entry.name)) {
      onOpen(entry.path);
    } else {
      // Yine de açmaya çalış — kullanıcı text dosyalarına da ulaşabilsin
      onOpen(entry.path);
    }
  }

  let isActive = $derived(activePath !== null && activePath === entry.path);
</script>

<button
  type="button"
  class="row"
  class:active={isActive}
  style="padding-left: {8 + depth * 14}px"
  onclick={onClick}
  title={entry.path}
>
  {#if entry.isDirectory}
    <span class="chev" class:open>▸</span>
    <span class="icon">📁</span>
  {:else}
    <span class="chev-space"></span>
    <span class="icon" class:md={isMarkdownLike(entry.name)}>{isMarkdownLike(entry.name) ? '📄' : '📃'}</span>
  {/if}
  <span class="name">{entry.name}</span>
</button>

{#if entry.isDirectory && open}
  {#if loading && children === null}
    <div class="info" style="padding-left: {8 + (depth + 1) * 14}px">…</div>
  {:else if error}
    <div class="info err" style="padding-left: {8 + (depth + 1) * 14}px">!</div>
  {:else if children}
    {#each children as child (child.path)}
      <Self entry={child} depth={depth + 1} {activePath} {onOpen} />
    {/each}
  {/if}
{/if}

<style>
  .row {
    width: 100%;
    text-align: left;
    background: transparent;
    border: 0;
    cursor: pointer;
    color: var(--text-primary);
    font-size: 12px;
    line-height: 1.4;
    padding: 3px 8px;
    display: flex;
    align-items: center;
    gap: 4px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .row:hover {
    background: var(--code-inline-bg);
  }

  .row.active {
    background: var(--code-inline-bg);
    color: var(--accent);
    font-weight: 500;
  }

  .chev {
    display: inline-block;
    width: 12px;
    color: var(--text-muted);
    transition: transform 0.12s;
  }

  .chev.open {
    transform: rotate(90deg);
  }

  .chev-space {
    display: inline-block;
    width: 12px;
  }

  .icon {
    width: 16px;
    text-align: center;
    font-size: 11px;
    flex-shrink: 0;
  }

  .name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
    flex: 1;
  }

  .info {
    font-size: 11px;
    color: var(--text-muted);
    padding-top: 2px;
    padding-bottom: 2px;
  }

  .info.err {
    color: var(--alert-caution);
  }
</style>
