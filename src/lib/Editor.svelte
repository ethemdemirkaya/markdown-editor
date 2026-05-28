<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view';
  import { EditorState, Compartment } from '@codemirror/state';
  import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
  import { markdown } from '@codemirror/lang-markdown';
  import { bracketMatching, indentOnInput } from '@codemirror/language';
  import { themeExtension } from './cm-theme';
  import { theme } from './theme';

  type Props = {
    value: string;
    onChange: (next: string) => void;
  };

  let { value, onChange }: Props = $props();

  let host: HTMLDivElement;
  let view: EditorView | null = null;
  const themeCompartment = new Compartment();
  let unsubTheme: (() => void) | null = null;

  onMount(() => {
    const initialMode = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';

    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        history(),
        bracketMatching(),
        indentOnInput(),
        markdown(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        EditorView.lineWrapping,
        themeCompartment.of(themeExtension(initialMode)),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString());
          }
        }),
      ],
    });

    view = new EditorView({ state, parent: host });

    unsubTheme = theme.subscribe((mode) => {
      view?.dispatch({
        effects: themeCompartment.reconfigure(themeExtension(mode)),
      });
    });
  });

  onDestroy(() => {
    unsubTheme?.();
    view?.destroy();
    view = null;
  });

  $effect(() => {
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      });
    }
  });
</script>

<div bind:this={host} class="editor"></div>

<style>
  .editor {
    height: 100%;
    width: 100%;
    overflow: auto;
  }

  .editor :global(.cm-editor) {
    height: 100%;
    font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace;
    font-size: 14px;
  }

  .editor :global(.cm-scroller) {
    line-height: 1.6;
  }

  .editor :global(.cm-content) {
    padding: 12px 0;
  }

  .editor :global(.cm-focused) {
    outline: none;
  }
</style>
