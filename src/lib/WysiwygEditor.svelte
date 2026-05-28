<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Crepe } from '@milkdown/crepe';
  import '@milkdown/crepe/theme/common/style.css';
  import crepeLight from '@milkdown/crepe/theme/classic.css?raw';
  import crepeDark from '@milkdown/crepe/theme/classic-dark.css?raw';
  import { theme } from './theme';

  type Props = {
    value: string;
    onChange: (next: string) => void;
  };

  let { value, onChange }: Props = $props();

  let host: HTMLDivElement;
  let crepe: Crepe | null = null;
  let unsubTheme: (() => void) | null = null;
  let themeStyleEl: HTMLStyleElement | null = null;
  let lastEmittedValue = value;
  let suppressChange = false;

  onMount(() => {
    themeStyleEl = document.createElement('style');
    themeStyleEl.id = 'crepe-theme';
    document.head.appendChild(themeStyleEl);

    unsubTheme = theme.subscribe((mode) => {
      if (themeStyleEl) {
        themeStyleEl.textContent = mode === 'dark' ? crepeDark : crepeLight;
      }
    });

    void init();
  });

  async function init() {
    crepe = new Crepe({
      root: host,
      defaultValue: value,
      features: {
        [Crepe.Feature.Latex]: true,
      },
    });
    await crepe.create();
    crepe.on((listener) => {
      listener.markdownUpdated((_ctx, markdown) => {
        if (suppressChange) return;
        lastEmittedValue = markdown;
        onChange(markdown);
      });
    });
  }

  onDestroy(() => {
    unsubTheme?.();
    themeStyleEl?.remove();
    themeStyleEl = null;
    crepe?.destroy();
    crepe = null;
  });
</script>

<div bind:this={host} class="wysiwyg"></div>

<style>
  .wysiwyg {
    height: 100%;
    width: 100%;
    overflow: auto;
    background: var(--bg-base);
  }

  .wysiwyg :global(.milkdown) {
    height: 100%;
  }

  .wysiwyg :global(.ProseMirror) {
    max-width: 820px;
    margin: 0 auto;
    padding: 32px;
    min-height: 100%;
    outline: none;
  }
</style>
