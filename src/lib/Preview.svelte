<script lang="ts">
  import { Marked } from 'marked';
  import { markedHighlight } from 'marked-highlight';
  import markedKatex from 'marked-katex-extension';
  import hljs from 'highlight.js';
  import DOMPurify from 'dompurify';

  type Props = { source: string };
  let { source }: Props = $props();

  const marked = new Marked(
    markedHighlight({
      emptyLangClass: 'hljs',
      langPrefix: 'hljs language-',
      highlight(code, lang) {
        const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language, ignoreIllegals: true }).value;
      },
    }),
  );
  marked.use(markedKatex({ throwOnError: false, nonStandard: true }));
  marked.setOptions({ gfm: true, breaks: false });

  let html = $derived.by(() => {
    const raw = marked.parse(source, { async: false }) as string;
    return DOMPurify.sanitize(raw);
  });
</script>

<div class="preview markdown-body">
  {@html html}
</div>

<style>
  .preview {
    height: 100%;
    overflow: auto;
    padding: 24px 32px;
    line-height: 1.65;
  }

  .preview :global(h1),
  .preview :global(h2),
  .preview :global(h3),
  .preview :global(h4) {
    margin-top: 1.4em;
    margin-bottom: 0.5em;
    line-height: 1.25;
  }

  .preview :global(h1) {
    font-size: 2em;
    border-bottom: 1px solid var(--border-subtle);
    padding-bottom: 0.3em;
  }

  .preview :global(h2) {
    font-size: 1.5em;
    border-bottom: 1px solid var(--border-subtle);
    padding-bottom: 0.2em;
  }

  .preview :global(p) {
    margin: 0.6em 0;
  }

  .preview :global(a) {
    color: var(--link-color);
    text-decoration: none;
  }

  .preview :global(a:hover) {
    text-decoration: underline;
  }

  .preview :global(blockquote) {
    border-left: 4px solid var(--border-subtle);
    padding: 0.2em 1em;
    color: var(--text-muted);
    margin: 0.8em 0;
  }

  .preview :global(code) {
    font-family: 'JetBrains Mono', Consolas, monospace;
    background: var(--code-inline-bg);
    padding: 0.15em 0.35em;
    border-radius: 4px;
    font-size: 0.9em;
  }

  .preview :global(pre) {
    background: var(--code-block-bg);
    padding: 14px 16px;
    border-radius: 6px;
    overflow-x: auto;
    margin: 0.8em 0;
  }

  .preview :global(pre code) {
    background: transparent;
    padding: 0;
    font-size: 0.88em;
  }

  .preview :global(table) {
    border-collapse: collapse;
    margin: 0.8em 0;
    display: block;
    overflow-x: auto;
  }

  .preview :global(th),
  .preview :global(td) {
    border: 1px solid var(--border-subtle);
    padding: 6px 12px;
  }

  .preview :global(th) {
    background: var(--code-inline-bg);
    font-weight: 600;
  }

  .preview :global(ul),
  .preview :global(ol) {
    padding-left: 1.6em;
  }

  .preview :global(li) {
    margin: 0.25em 0;
  }

  .preview :global(hr) {
    border: 0;
    border-top: 1px solid var(--border-subtle);
    margin: 1.4em 0;
  }

  .preview :global(img) {
    max-width: 100%;
  }
</style>
