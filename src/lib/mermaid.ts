import { get } from 'svelte/store';
import { theme } from './theme';

type MermaidApi = {
  initialize: (config: Record<string, unknown>) => void;
  render: (id: string, code: string) => Promise<{ svg: string }>;
};

let mermaidPromise: Promise<MermaidApi> | null = null;
let lastTheme: 'light' | 'dark' | null = null;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function load(): Promise<MermaidApi> {
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid').then((m) => m.default as MermaidApi);
  }
  const api = await mermaidPromise;
  const current = get(theme);
  if (lastTheme !== current) {
    api.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: current === 'dark' ? 'dark' : 'default',
      fontFamily: 'inherit',
    });
    lastTheme = current;
  }
  return api;
}

let counter = 0;
function nextId(): string {
  counter += 1;
  return `mmd-${Date.now()}-${counter}`;
}

export async function renderMermaid(code: string): Promise<string> {
  try {
    const api = await load();
    const { svg } = await api.render(nextId(), code);
    return svg;
  } catch (err) {
    const msg = err && (err as Error).message ? (err as Error).message : String(err);
    return `<pre class="mermaid-error">${escapeHtml(msg)}</pre>`;
  }
}

// WYSIWYG için Crepe code-block preview callback'i tarafından kullanılır.
export function renderMermaidInto(code: string, target: HTMLElement): void {
  target.classList.add('mermaid-preview');
  void renderMermaid(code).then((svg) => {
    target.innerHTML = svg;
  });
}

// Marked extension (export): ```mermaid kod bloklarını runtime'da SVG'ye çevirir.
// marked.use({ async: true, walkTokens }) + await marked.parse(...) gerekir.
export const markedMermaid = {
  async: true,
  async walkTokens(token: any) {
    if (token.type !== 'code') return;
    const lang = (token.lang ?? '').trim().toLowerCase();
    if (lang !== 'mermaid') return;
    const svg = await renderMermaid(token.text);
    token.type = 'html';
    token.text = `<div class="mermaid-block">${svg}</div>`;
    token.pre = false;
  },
};
