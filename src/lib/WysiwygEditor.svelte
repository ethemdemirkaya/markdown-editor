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

  type Props = {
    value: string;
    onChange: (next: string) => void;
  };

  let { value, onChange }: Props = $props();

  let host: HTMLDivElement;
  let crepe: Crepe | null = null;
  let unsubTheme: (() => void) | null = null;
  let themeStyleEl: HTMLStyleElement | null = null;

  function onAtKeydown(e: KeyboardEvent) {
    if (e.key !== '@' || e.ctrlKey || e.metaKey || e.altKey) return;
    if (!crepe) return;
    e.preventDefault();
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
      ctx.update(prosePluginsCtx, (plugins) => [...plugins, autoDetectCodeLanguage]);
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
</style>
