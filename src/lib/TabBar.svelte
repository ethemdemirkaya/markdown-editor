<script lang="ts">
  import { docs, activeId, docName, isDirty, setActive, closeDoc, createUntitled } from './documents';

  function onCloseClick(event: MouseEvent, id: string) {
    event.stopPropagation();
    closeDoc(id);
  }
</script>

<div class="tabbar" role="tablist">
  {#each $docs as doc (doc.id)}
    {@const active = doc.id === $activeId}
    <button
      type="button"
      role="tab"
      aria-selected={active}
      class="tab"
      class:active
      onclick={() => setActive(doc.id)}
      title={doc.path ?? docName(doc)}
    >
      <span class="name">{docName(doc)}</span>
      {#if isDirty(doc)}<span class="dirty">●</span>{/if}
      <span
        class="close"
        role="button"
        tabindex="-1"
        aria-label="Sekmeyi kapat"
        onclick={(e) => onCloseClick(e, doc.id)}
      >×</span>
    </button>
  {/each}
  <button type="button" class="new-tab" title="Yeni sekme (Ctrl/Cmd+T)" onclick={() => createUntitled('')}>+</button>
</div>

<style>
  .tabbar {
    height: 34px;
    flex-shrink: 0;
    display: flex;
    align-items: stretch;
    background: var(--bg-elevated);
    border-bottom: 1px solid var(--border-subtle);
    overflow-x: auto;
    overflow-y: hidden;
    user-select: none;
  }

  .tab {
    appearance: none;
    background: transparent;
    border: none;
    border-right: 1px solid var(--border-subtle);
    color: var(--text-muted);
    padding: 0 10px 0 14px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    cursor: pointer;
    max-width: 200px;
    min-width: 100px;
    height: 100%;
    transition: background 0.12s, color 0.12s;
  }

  .tab:hover {
    background: var(--code-inline-bg);
    color: var(--text-primary);
  }

  .tab.active {
    background: var(--bg-base);
    color: var(--text-primary);
    box-shadow: inset 0 -2px 0 var(--accent);
  }

  .name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }

  .dirty {
    color: var(--accent);
    font-size: 12px;
    line-height: 1;
  }

  .close {
    width: 16px;
    height: 16px;
    border-radius: 3px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    font-size: 14px;
    line-height: 1;
    cursor: pointer;
  }

  .close:hover {
    background: var(--border-subtle);
    color: var(--text-primary);
  }

  .new-tab {
    appearance: none;
    background: transparent;
    border: none;
    color: var(--text-muted);
    width: 32px;
    cursor: pointer;
    font-size: 16px;
    line-height: 1;
  }

  .new-tab:hover {
    background: var(--code-inline-bg);
    color: var(--text-primary);
  }
</style>
