import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import markedKatex from 'marked-katex-extension';
import hljs from 'highlight.js';
import DOMPurify from 'dompurify';
import hljsLight from 'highlight.js/styles/github.css?raw';
import hljsDark from 'highlight.js/styles/github-dark.css?raw';
import katexCss from 'katex/dist/katex.min.css?raw';
import { markedGithubAlerts } from './github-alerts';
import { markedMermaid } from './mermaid';

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
exporter.use(markedGithubAlerts);
exporter.use(markedMermaid);
exporter.setOptions({ gfm: true, breaks: false, async: true });

const baseCss = `
  :root {
    --alert-note: #0969da;
    --alert-note-bg: #ddf4ff;
    --alert-tip: #1a7f37;
    --alert-tip-bg: #dafbe1;
    --alert-important: #8250df;
    --alert-important-bg: #f3e7ff;
    --alert-warning: #9a6700;
    --alert-warning-bg: #fff8c5;
    --alert-caution: #cf222e;
    --alert-caution-bg: #ffebe9;

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
  .markdown-body .md-alert {
    border-left: 4px solid var(--alert-note);
    background: var(--alert-note-bg);
    padding: 10px 14px;
    border-radius: 4px;
    margin: 0.8em 0;
  }
  .markdown-body .md-alert .md-alert-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
    color: var(--alert-note);
    font-size: 0.92em;
    margin-bottom: 4px;
  }
  .markdown-body .md-alert .md-alert-title svg {
    width: 16px;
    height: 16px;
  }
  .markdown-body .md-alert .md-alert-body > :first-child { margin-top: 0; }
  .markdown-body .md-alert .md-alert-body > :last-child { margin-bottom: 0; }
  .markdown-body .md-alert-note { border-color: var(--alert-note); background: var(--alert-note-bg); }
  .markdown-body .md-alert-note .md-alert-title { color: var(--alert-note); }
  .markdown-body .md-alert-tip { border-color: var(--alert-tip); background: var(--alert-tip-bg); }
  .markdown-body .md-alert-tip .md-alert-title { color: var(--alert-tip); }
  .markdown-body .md-alert-important { border-color: var(--alert-important); background: var(--alert-important-bg); }
  .markdown-body .md-alert-important .md-alert-title { color: var(--alert-important); }
  .markdown-body .md-alert-warning { border-color: var(--alert-warning); background: var(--alert-warning-bg); }
  .markdown-body .md-alert-warning .md-alert-title { color: var(--alert-warning); }
  .markdown-body .md-alert-caution { border-color: var(--alert-caution); background: var(--alert-caution-bg); }
  .markdown-body .md-alert-caution .md-alert-title { color: var(--alert-caution); }
  .markdown-body .mermaid-block {
    margin: 0.8em 0;
    text-align: center;
  }
  .markdown-body .mermaid-block svg {
    max-width: 100%;
    height: auto;
  }
  .markdown-body .mermaid-error {
    background: var(--alert-caution-bg);
    color: var(--alert-caution);
    border-left: 4px solid var(--alert-caution);
    padding: 8px 12px;
    border-radius: 4px;
    font-family: 'JetBrains Mono', Consolas, monospace;
    font-size: 0.85em;
  }
`;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function renderPrintableHtml(source: string, title: string): Promise<string> {
  const html = await renderStandaloneHtml(source, title, 'light');
  return html.replace(
    '</body>',
    `<script>window.addEventListener('load',()=>setTimeout(()=>window.print(),120));</script></body>`,
  );
}

export async function printPdfFromSource(source: string, title: string): Promise<void> {
  const html = await renderPrintableHtml(source, title);
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.position = 'fixed';
  iframe.style.right = '-9999px';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.srcdoc = html;

  const cleanup = () => {
    setTimeout(() => iframe.remove(), 500);
  };

  iframe.addEventListener('load', () => {
    try {
      iframe.contentWindow?.focus();
    } catch (err) {
      console.error('Print focus failed:', err);
    }
  });
  window.addEventListener('focus', cleanup, { once: true });

  document.body.appendChild(iframe);
}

export async function renderStandaloneHtml(
  source: string,
  title: string,
  mode: 'light' | 'dark',
): Promise<string> {
  const raw = (await exporter.parse(source)) as string;
  const safe = DOMPurify.sanitize(raw, {
    ADD_TAGS: [
      'svg', 'g', 'defs', 'path', 'rect', 'circle', 'ellipse', 'line', 'polyline',
      'polygon', 'text', 'tspan', 'use', 'marker', 'clipPath', 'pattern', 'mask',
      'linearGradient', 'radialGradient', 'stop', 'filter', 'foreignObject', 'desc', 'title',
    ],
    ADD_ATTR: [
      'viewBox', 'd', 'fill', 'stroke', 'stroke-width', 'stroke-linecap',
      'stroke-linejoin', 'stroke-dasharray', 'transform', 'cx', 'cy', 'r',
      'rx', 'ry', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'points', 'width',
      'height', 'preserveAspectRatio', 'marker-end', 'marker-start', 'marker-mid',
      'text-anchor', 'dominant-baseline', 'font-family', 'font-size',
      'xmlns', 'xmlns:xlink', 'xlink:href', 'aria-roledescription',
      'pointer-events', 'style', 'class',
    ],
  });
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
