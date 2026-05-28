<script lang="ts">
  import { parseOutline, scrollToHeading } from './outline';
  import { t } from './i18n';

  type Props = { source: string };
  let { source }: Props = $props();

  let items = $derived(parseOutline(source));
</script>

<aside class="outline">
  <header class="outline-header">{$t('outline.title')}</header>
  {#if items.length === 0}
    <div class="outline-empty">{$t('outline.empty')}</div>
  {:else}
    <nav class="outline-list">
      {#each items as item (item.index)}
        <button
          type="button"
          class="outline-item"
          style="--level: {item.level}"
          title={item.text}
          onclick={() => scrollToHeading(item.index)}
        >
          {item.text}
        </button>
      {/each}
    </nav>
  {/if}
</aside>

<style>
  .outline {
    flex: 0 0 240px;
    height: 100%;
    overflow-y: auto;
    background: var(--bg-elevated);
    border-left: 1px solid var(--border-subtle);
    padding: 12px 8px;
    box-sizing: border-box;
    user-select: none;
  }

  .outline-header {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--text-muted);
    padding: 0 6px 8px;
  }

  .outline-empty {
    padding: 8px 6px;
    font-size: 12px;
    color: var(--text-muted);
  }

  .outline-list {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .outline-item {
    appearance: none;
    background: transparent;
    border: none;
    text-align: left;
    cursor: pointer;
    color: var(--text-primary);
    font-size: 12px;
    line-height: 1.4;
    padding: 4px 6px 4px calc(6px + (var(--level) - 1) * 10px);
    border-radius: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .outline-item:hover {
    background: var(--code-inline-bg);
  }
</style>
