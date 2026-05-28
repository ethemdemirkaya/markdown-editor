<script lang="ts">
  export type PaletteCommand = {
    id: string;
    label: string;
    group?: string;
    shortcut?: string;
    keywords?: string;
    run: () => void | Promise<void>;
  };

  type Props = {
    commands: PaletteCommand[];
    onClose: () => void;
  };

  let { commands, onClose }: Props = $props();

  let query = $state('');
  let activeIndex = $state(0);
  let inputEl: HTMLInputElement | undefined = $state();

  function score(item: PaletteCommand, q: string): number {
    if (!q) return 1;
    const lower = q.toLowerCase();
    const hay = `${item.label} ${item.group ?? ''} ${item.keywords ?? ''}`.toLowerCase();
    if (hay.includes(lower)) return 100 - hay.indexOf(lower);
    // Initials match: "ko ka" → "kod kapısı"
    const parts = lower.split(/\s+/).filter(Boolean);
    if (parts.every((p) => hay.includes(p))) return 50;
    // Subsequence fuzzy
    let i = 0;
    for (const ch of hay) {
      if (ch === lower[i]) i++;
      if (i === lower.length) return 10;
    }
    return 0;
  }

  let filtered = $derived(
    commands
      .map((c) => ({ cmd: c, s: score(c, query) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .map((x) => x.cmd),
  );

  $effect(() => {
    if (activeIndex >= filtered.length) activeIndex = 0;
  });

  $effect(() => {
    inputEl?.focus();
  });

  async function run(idx: number) {
    const cmd = filtered[idx];
    if (!cmd) {
      onClose();
      return;
    }
    onClose();
    try {
      await cmd.run();
    } catch (err) {
      console.error(`Command "${cmd.id}" failed:`, err);
    }
  }

  function onKey(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      activeIndex = Math.min(activeIndex + 1, Math.max(filtered.length - 1, 0));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      void run(activeIndex);
    }
  }

  function onBackdrop(event: MouseEvent) {
    if (event.target === event.currentTarget) onClose();
  }
</script>

<div
  class="backdrop"
  role="dialog"
  aria-modal="true"
  aria-label="Komut paleti"
  onclick={onBackdrop}
>
  <div class="palette">
    <input
      bind:this={inputEl}
      class="search"
      placeholder="Komut ara veya çalıştır…"
      bind:value={query}
      onkeydown={onKey}
    />
    <div class="results">
      {#each filtered as cmd, idx (cmd.id)}
        <button
          type="button"
          class="result"
          class:active={idx === activeIndex}
          onmouseenter={() => (activeIndex = idx)}
          onclick={() => run(idx)}
        >
          <div class="result-main">
            {#if cmd.group}<span class="group">{cmd.group}</span>{/if}
            <span class="label">{cmd.label}</span>
          </div>
          {#if cmd.shortcut}<span class="shortcut">{cmd.shortcut}</span>{/if}
        </button>
      {:else}
        <div class="empty">Eşleşme yok</div>
      {/each}
    </div>
    <footer class="hint">
      <span><kbd>↑</kbd><kbd>↓</kbd> gez</span>
      <span><kbd>↵</kbd> çalıştır</span>
      <span><kbd>Esc</kbd> kapat</span>
    </footer>
  </div>
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    z-index: 250;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 12vh;
  }

  .palette {
    width: min(560px, 92vw);
    max-height: 70vh;
    display: flex;
    flex-direction: column;
    background: var(--bg-base);
    border: 1px solid var(--border-subtle);
    border-radius: 10px;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.32);
    overflow: hidden;
  }

  .search {
    border: 0;
    border-bottom: 1px solid var(--border-subtle);
    padding: 14px 18px;
    font-size: 14px;
    background: var(--bg-elevated);
    color: var(--text-primary);
    outline: none;
  }

  .results {
    flex: 1;
    overflow-y: auto;
    padding: 4px;
  }

  .result {
    width: 100%;
    text-align: left;
    background: transparent;
    border: 0;
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    color: var(--text-primary);
    font-size: 13px;
  }

  .result.active,
  .result:hover {
    background: var(--code-inline-bg);
  }

  .result-main {
    display: flex;
    align-items: baseline;
    gap: 10px;
    min-width: 0;
    flex: 1;
  }

  .group {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--text-muted);
    flex-shrink: 0;
  }

  .label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .shortcut {
    font-family: 'JetBrains Mono', Consolas, monospace;
    font-size: 11px;
    color: var(--text-muted);
    background: var(--code-inline-bg);
    padding: 2px 6px;
    border-radius: 4px;
    flex-shrink: 0;
  }

  .empty {
    padding: 16px;
    color: var(--text-muted);
    text-align: center;
    font-size: 13px;
  }

  .hint {
    display: flex;
    gap: 12px;
    padding: 8px 14px;
    border-top: 1px solid var(--border-subtle);
    background: var(--bg-elevated);
    color: var(--text-muted);
    font-size: 11px;
  }

  .hint kbd {
    background: var(--bg-base);
    border: 1px solid var(--border-subtle);
    border-radius: 3px;
    padding: 1px 5px;
    font-family: 'JetBrains Mono', Consolas, monospace;
    font-size: 10px;
    margin-right: 4px;
  }
</style>
