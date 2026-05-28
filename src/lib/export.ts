import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import markedKatex from 'marked-katex-extension';
import hljs from 'highlight.js';
import DOMPurify from 'dompurify';
import hljsLight from 'highlight.js/styles/github.css?raw';
import hljsDark from 'highlight.js/styles/github-dark.css?raw';
import katexCss from 'katex/dist/katex.min.css?raw';

const exporter = new Marked(
  markedHighlight({
    emptyLangClass: 'hljs',
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language, ignoreIllegals: true }).value;
    },
  }),
);
exporter.use(markedKatex({ throwOnError: false, nonStandard: true }));
exporter.setOptions({ gfm: true, breaks: false });

const baseCss = `
  :root {
    --bg-base: #ffffff;
    --bg-elevated: #f7f8fa;
    --text-primary: #1f2328;
    --text-muted: #6b7280;
    --border-subtle: #e2e4e8;
    --link-color: #0969da;
    --code-inline-bg: #eef0f3;
    --code-block-bg: #f3f4f6;
  }
  [data-theme="dark"] {
    --bg-base: #0d1117;
    --bg-elevated: #161b22;
    --text-primary: #e6edf3;
    --text-muted: #8b949e;
    --border-subtle: #30363d;
    --link-color: #58a6ff;
    --code-inline-bg: #1c2128;
    --code-block-bg: #161b22;
  }
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    background: var(--bg-base);
    color: var(--text-primary);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, sans-serif;
    font-size: 16px;
    line-height: 1.65;
    -webkit-font-smoothing: antialiased;
  }
  .markdown-body {
    max-width: 820px;
    margin: 0 auto;
    padding: 48px 32px;
  }
  .markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4 {
    margin-top: 1.4em;
    margin-bottom: 0.5em;
    line-height: 1.25;
  }
  .markdown-body h1 {
    font-size: 2em;
    border-bottom: 1px solid var(--border-subtle);
    padding-bottom: 0.3em;
  }
  .markdown-body h2 {
    font-size: 1.5em;
    border-bottom: 1px solid var(--border-subtle);
    padding-bottom: 0.2em;
  }
  .markdown-body p { margin: 0.6em 0; }
  .markdown-body a { color: var(--link-color); text-decoration: none; }
  .markdown-body a:hover { text-decoration: underline; }
  .markdown-body blockquote {
    border-left: 4px solid var(--border-subtle);
    padding: 0.2em 1em;
    color: var(--text-muted);
    margin: 0.8em 0;
  }
  .markdown-body code {
    font-family: 'JetBrains Mono', Consolas, monospace;
    background: var(--code-inline-bg);
    padding: 0.15em 0.35em;
    border-radius: 4px;
    font-size: 0.9em;
  }
  .markdown-body pre {
    background: var(--code-block-bg);
    padding: 14px 16px;
    border-radius: 6px;
    overflow-x: auto;
    margin: 0.8em 0;
  }
  .markdown-body pre code {
    background: transparent;
    padding: 0;
    font-size: 0.88em;
  }
  .markdown-body table {
    border-collapse: collapse;
    margin: 0.8em 0;
    display: block;
    overflow-x: auto;
  }
  .markdown-body th, .markdown-body td {
    border: 1px solid var(--border-subtle);
    padding: 6px 12px;
  }
  .markdown-body th { background: var(--code-inline-bg); font-weight: 600; }
  .markdown-body ul, .markdown-body ol { padding-left: 1.6em; }
  .markdown-body li { margin: 0.25em 0; }
  .markdown-body hr {
    border: 0;
    border-top: 1px solid var(--border-subtle);
    margin: 1.4em 0;
  }
  .markdown-body img { max-width: 100%; }
`;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderStandaloneHtml(
  source: string,
  title: string,
  mode: 'light' | 'dark',
): string {
  const raw = exporter.parse(source, { async: false }) as string;
  const safe = DOMPurify.sanitize(raw);
  const hljsCss = mode === 'dark' ? hljsDark : hljsLight;
  return `<!doctype html>
<html lang="en" data-theme="${mode}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<style>${baseCss}</style>
<style>${hljsCss}</style>
<style>${katexCss}</style>
</head>
<body>
<article class="markdown-body">
${safe}
</article>
</body>
</html>
`;
}
