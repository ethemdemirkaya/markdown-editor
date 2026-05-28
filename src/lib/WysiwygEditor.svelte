<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Crepe } from '@milkdown/crepe';
  import '@milkdown/crepe/theme/common/style.css';
  import crepeLight from '@milkdown/crepe/theme/classic.css?raw';
  import crepeDark from '@milkdown/crepe/theme/classic-dark.css?raw';
  import { EditorView } from '@codemirror/view';
  import { editorViewCtx, editorViewOptionsCtx, prosePluginsCtx } from '@milkdown/kit/core';
  import { TextSelection } from '@milkdown/prose/state';
  import { theme } from './theme';
  import { autoDetectCodeLanguage } from './auto-language';
  import { githubAlertDecoration } from './github-alerts';
  import { getSettings } from './settings';
  import InlineBlockMenu from './InlineBlockMenu.svelte';

  type Props = {
    value: string;
    onChange: (next: string) => void;
  };

  let { value, onChange }: Props = $props();

  let host: HTMLDivElement;
  let crepe: Crepe | null = null;
  let unsubTheme: (() => void) | null = null;
  let themeStyleEl: HTMLStyleElement | null = null;

  let inlineMenuOpen = $state(false);
  let inlineMenuX = $state(0);
  let inlineMenuY = $state(0);
  let inlineMenuAnchor: { from: number; to: number } | null = null;

  function openInlineMenu() {
    if (!crepe) return;
    crepe.editor.action((ctx) => {
      const view = ctx.get(editorViewCtx);
      const coords = view.coordsAtPos(view.state.selection.from);
      inlineMenuX = coords.left;
      inlineMenuY = coords.bottom + 4;
      inlineMenuAnchor = { from: view.state.selection.from, to: view.state.selection.to };
      inlineMenuOpen = true;
    });
  }

  function closeInlineMenu() {
    inlineMenuOpen = false;
    inlineMenuAnchor = null;
  }

  type InlineItem = {
    snippet: string;
    cursorOffset?: number;
    asNewBlock?: boolean;
  };

  function applyInlineItem(item: InlineItem) {
    if (!crepe) {
      closeInlineMenu();
      return;
    }
    crepe.editor.action((ctx) => {
      const view = ctx.get(editorViewCtx);
      const pos = inlineMenuAnchor?.from ?? view.state.selection.from;

      let snippet = item.snippet;

      // asNewBlock = bloğun başında olması gereken yapı (heading, list, code, ...)
      // Eğer cursor satır içindeyse satır sonrası ya da node sonrası ekleniyor (snippet baştaki \n ile)
      // Eğer satır başındaysak ve boşsa, baştaki \n'yi kaldır
      const head = view.state.doc.resolve(pos);
      const atLineStart = head.parentOffset === 0;
      const lineEmpty = head.parent.content.size === 0;
      if (item.asNewBlock && atLineStart && lineEmpty && snippet.startsWith('\n')) {
        snippet = snippet.slice(1);
      }

      let tr = view.state.tr.insertText(snippet, pos);

      // Cursor offset uygulaması
      if (typeof item.cursorOffset === 'number') {
        const cursorPos = pos + item.cursorOffset;
        tr = tr.setSelection(TextSelection.create(tr.doc, cursorPos));
      }

      view.dispatch(tr);
      view.focus();
    });
    closeInlineMenu();
  }

  function onAtKeydown(e: KeyboardEvent) {
    if (e.key !== '@' || e.ctrlKey || e.metaKey || e.altKey) return;
    if (!crepe) return;

    const behavior = getSettings().atBehavior;
    if (behavior === 'disabled') return; // sadece @ karakteri yazılır

    e.preventDefault();

    if (behavior === 'inline') {
      openInlineMenu();
      return;
    }

    // new-paragraph davranışı: Crepe slash menüsünü tetikle
    crepe.editor.action((ctx) => {
      const view = ctx.get(editorViewCtx);
      const { state } = view;
      const { selection, schema } = state;
      const head = selection.$from;
      const parent = head.parent;

      if (parent.type.name === 'code_block') return;

      const isEmptyAtStart = parent.content.size === 0 && head.parentOffset === 0;

      if (isEmptyAtStart) {
        view.dispatch(state.tr.insertText('/'));
        view.focus();
        return;
      }

      const paragraphType = schema.nodes.paragraph;
      if (!paragraphType) {
        view.dispatch(state.tr.insertText('/'));
        view.focus();
        return;
      }

      const insertPos = head.after(head.depth);
      const newPara = paragraphType.create(null, schema.text('/'));
      let tr = state.tr.insert(insertPos, newPara);
      const cursorPos = insertPos + 2;
      tr = tr.setSelection(TextSelection.create(tr.doc, cursorPos));
      view.dispatch(tr);
      view.focus();
    });
  }

  onMount(() => {
    themeStyleEl = document.createElement('style');
    themeStyleEl.id = 'crepe-theme';
    document.head.prepend(themeStyleEl);

    unsubTheme = theme.subscribe((mode) => {
      if (themeStyleEl) {
        themeStyleEl.textContent = mode === 'dark' ? crepeDark : crepeLight;
      }
    });

    host.addEventListener('keydown', onAtKeydown, true);

    void init();
  });

  async function init() {
    crepe = new Crepe({
      root: host,
      defaultValue: value,
      features: {
        [Crepe.Feature.Latex]: true,
      },
      featureConfigs: {
        [Crepe.Feature.CodeMirror]: {
          extensions: [EditorView.lineWrapping],
        },
      },
    });

    crepe.editor.config((ctx) => {
      ctx.update(prosePluginsCtx, (plugins) => [...plugins, autoDetectCodeLanguage, githubAlertDecoration]);
      ctx.update(editorViewOptionsCtx, (prev) => ({
        ...prev,
        attributes: { ...(prev.attributes ?? {}), spellcheck: 'false', autocorrect: 'off' },
      }));
    });

    await crepe.create();
    crepe.on((listener) => {
      listener.markdownUpdated((_ctx, markdown) => {
        onChange(markdown);
      });
    });
  }

  onDestroy(() => {
    host?.removeEventListener('keydown', onAtKeydown, true);
    unsubTheme?.();
    themeStyleEl?.remove();
    themeStyleEl = null;
    crepe?.destroy();
    crepe = null;
  });
</script>

<div bind:this={host} class="wysiwyg"></div>

{#if inlineMenuOpen}
  <InlineBlockMenu
    x={inlineMenuX}
    y={inlineMenuY}
    onPick={applyInlineItem}
    onClose={closeInlineMenu}
  />
{/if}

<style>
  .wysiwyg {
    height: 100%;
    width: 100%;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    background: var(--bg-base);
  }

  .wysiwyg :global(.milkdown) {
    width: 100%;
    background: transparent;
  }

  .wysiwyg :global(.ProseMirror) {
    max-width: 820px;
    margin: 0 auto;
    padding: 32px 32px 60vh;
    outline: none;
    background: transparent;
  }

  .wysiwyg :global(milkdown-code-block) {
    display: block;
    width: 100%;
  }

  .wysiwyg :global(milkdown-code-block .cm-editor) {
    width: 100%;
    max-width: 100%;
  }

  .wysiwyg :global(milkdown-code-block .cm-scroller) {
    overflow-x: hidden;
  }

  .wysiwyg :global(milkdown-code-block .cm-content),
  .wysiwyg :global(milkdown-code-block .cm-line) {
    white-space: pre-wrap !important;
    word-break: break-word;
    overflow-wrap: anywhere;
  }

  /* Crepe inline LaTeX edit popup düzeltmesi:
     - Tema'nın default genişliği/yüksekliği LaTeX içerik için çok büyük.
     - Auto-size + min/max sınırlar ile düzgün dikdörtgen kutu. */
  :global(.milkdown-latex-inline-edit) {
    width: auto !important;
    min-width: 240px !important;
    max-width: 520px !important;
    height: auto !important;
    min-height: 0 !important;
    padding: 6px 8px !important;
    border-radius: 8px !important;
    background: var(--bg-base) !important;
    border: 1px solid var(--border-subtle) !important;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.22) !important;
  }

  :global(.milkdown-latex-inline-edit .container) {
    display: flex !important;
    align-items: center !important;
    gap: 6px !important;
    width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
  }

  :global(.milkdown-latex-inline-edit .container > div) {
    flex: 1 !important;
    min-width: 0 !important;
    min-height: 0 !important;
  }

  :global(.milkdown-latex-inline-edit .cm-editor) {
    height: auto !important;
    min-height: 0 !important;
    font-family: 'JetBrains Mono', Consolas, monospace !important;
    font-size: 13px !important;
  }

  :global(.milkdown-latex-inline-edit .cm-scroller) {
    overflow-x: auto !important;
    overflow-y: hidden !important;
  }

  :global(.milkdown-latex-inline-edit .cm-content) {
    padding: 4px 6px !important;
    white-space: pre !important;
  }

  :global(.milkdown-latex-inline-edit button) {
    flex-shrink: 0 !important;
    width: 24px !important;
    height: 24px !important;
    padding: 0 !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    border-radius: 5px !important;
    background: transparent !important;
    border: 0 !important;
    color: var(--accent) !important;
    cursor: pointer !important;
  }

  :global(.milkdown-latex-inline-edit button:hover) {
    background: var(--code-inline-bg) !important;
  }

  :global(.milkdown-latex-inline-edit button svg) {
    width: 16px !important;
    height: 16px !important;
  }
</style>
