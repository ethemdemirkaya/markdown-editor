<script lang="ts">
  import { t } from './i18n';

  type Item = {
    key: string;
    labelKey: string;
    desc?: string;
    snippet: string;
    cursorOffset?: number;
    asNewBlock?: boolean;
  };

  type Props = {
    x: number;
    y: number;
    onPick: (item: Item) => void;
    onClose: () => void;
  };

  let { x, y, onPick, onClose }: Props = $props();

  const ITEMS: Item[] = [
    { key: 'code', labelKey: 'block.code', desc: '```lang … ```', snippet: '\n```\n\n```\n', cursorOffset: 5, asNewBlock: true },
    { key: 'inline-code', labelKey: 'block.inline-code', desc: '`text`', snippet: '``', cursorOffset: 1 },
    { key: 'bold', labelKey: 'block.bold', desc: '**text**', snippet: '****', cursorOffset: 2 },
    { key: 'italic', labelKey: 'block.italic', desc: '*text*', snippet: '**', cursorOffset: 1 },
    { key: 'h1', labelKey: 'block.h1', snippet: '\n# ', asNewBlock: true },
    { key: 'h2', labelKey: 'block.h2', snippet: '\n## ', asNewBlock: true },
    { key: 'h3', labelKey: 'block.h3', snippet: '\n### ', asNewBlock: true },
    { key: 'list', labelKey: 'block.list', snippet: '\n- ', asNewBlock: true },
    { key: 'numbered', labelKey: 'block.numbered', snippet: '\n1. ', asNewBlock: true },
    { key: 'task', labelKey: 'block.task', snippet: '\n- [ ] ', asNewBlock: true },
    { key: 'quote', labelKey: 'block.quote', snippet: '\n> ', asNewBlock: true },
    { key: 'hr', labelKey: 'block.hr', snippet: '\n---\n', asNewBlock: true },
    { key: 'math', labelKey: 'block.math', snippet: '\n$$\n\n$$\n', cursorOffset: 4, asNewBlock: true },
    { key: 'inline-math', labelKey: 'block.inline-math', snippet: '$$', cursorOffset: 1 },
    { key: 'table', labelKey: 'block.table', snippet: '\n| A | B |\n| --- | --- |\n| 1 | 2 |\n', asNewBlock: true },
    { key: 'link', labelKey: 'block.link', snippet: '[](url)', cursorOffset: 1 },
    { key: 'image', labelKey: 'block.image', snippet: '![](url)', cursorOffset: 2 },
  ];

  let filter = $state('');
  let activeIndex = $state(0);

  let visible = $derived(
    ITEMS.filter((it) => {
      if (!filter) return true;
      const f = filter.toLowerCase();
      const localized = $t(it.labelKey).toLowerCase();
      return localized.includes(f) || it.key.toLowerCase().includes(f);
    }),
  );

  $effect(() => {
    if (activeIndex >= visible.length) activeIndex = 0;
  });

  function pick(idx: number) {
    const item = visible[idx];
    if (!item) {
      onClose();
      return;
    }
    onPick(item);
  }

  function onKey(event: KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      activeIndex = (activeIndex + 1) % Math.max(visible.length, 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      activeIndex = (activeIndex - 1 + Math.max(visible.length, 1)) % Math.max(visible.length, 1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      pick(activeIndex);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    } else if (event.key === 'Backspace' && filter === '') {
      event.preventDefault();
      onClose();
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      filter += event.key;
    } else if (event.key === 'Backspace') {
      event.preventDefault();
      filter = filter.slice(0, -1);
    }
  }
</script>

<svelte:window onkeydown={onKey} />

<div class="menu" style="left: {x}px; top: {y}px;" role="listbox" aria-label="Blok ekle">
  <div class="hint">
    @<span class="filter">{filter}</span><span class="cursor">|</span>
  </div>
  <div class="items">
    {#each visible as item, idx (item.key)}
      <button
        type="button"
        class="item"
        class:active={idx === activeIndex}
        onmouseenter={() => (activeIndex = idx)}
        onclick={() => pick(idx)}
      >
        <span class="label">{$t(item.labelKey)}</span>
        {#if item.desc}<span class="desc">{item.desc}</span>{/if}
      </button>
    {:else}
      <div class="empty">{$t('palette.empty')}</div>
    {/each}
  </div>
</div>

<style>
  .menu {
    position: fixed;
    z-index: 300;
    background: var(--bg-base);
    border: 1px solid var(--border-subtle);
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.24);
    min-width: 240px;
    max-width: 320px;
    max-height: 320px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: 4px;
  }

  .hint {
    padding: 6px 8px;
    font-family: 'JetBrains Mono', Consolas, monospace;
    font-size: 12px;
    color: var(--text-muted);
    border-bottom: 1px solid var(--border-subtle);
    margin-bottom: 4px;
    display: flex;
    align-items: center;
  }

  .filter {
    color: var(--text-primary);
  }

  .cursor {
    animation: blink 1s steps(1) infinite;
    color: var(--text-primary);
    margin-left: 1px;
  }

  @keyframes blink {
    0%, 50% { opacity: 1; }
    50.01%, 100% { opacity: 0; }
  }

  .items {
    overflow-y: auto;
    flex: 1;
  }

  .item {
    width: 100%;
    text-align: left;
    background: transparent;
    border: none;
    padding: 6px 10px;
    border-radius: 5px;
    cursor: pointer;
    color: var(--text-primary);
    font-size: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }

  .item.active,
  .item:hover {
    background: var(--code-inline-bg);
  }

  .item .desc {
    color: var(--text-muted);
    font-size: 11px;
    font-family: 'JetBrains Mono', Consolas, monospace;
  }

  .empty {
    padding: 8px 10px;
    color: var(--text-muted);
    font-size: 12px;
  }
</style>
