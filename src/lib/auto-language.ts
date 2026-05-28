import { Plugin, PluginKey } from '@milkdown/prose/state';
import hljs from 'highlight.js';

const KEY = new PluginKey('auto-detect-code-language');

const MIN_LENGTH = 24;
const MIN_RELEVANCE = 5;
const SUPPORTED = new Set(hljs.listLanguages());

function shouldUpdate(current: string | null | undefined): boolean {
  if (!current) return true;
  const lower = current.toLowerCase();
  return lower === '' || lower === 'text' || lower === 'plain' || lower === 'plaintext';
}

export const autoDetectCodeLanguage = new Plugin({
  key: KEY,
  appendTransaction(transactions, oldState, newState) {
    if (!transactions.some((t) => t.docChanged)) return null;

    const tr = newState.tr;
    let changed = false;

    newState.doc.descendants((node, pos) => {
      if (node.type.name !== 'code_block') return;
      const text = node.textContent;
      if (text.length < MIN_LENGTH) return;

      const currentLang: string | undefined = node.attrs.language;
      if (!shouldUpdate(currentLang)) return;

      const oldNode = oldState.doc.nodeAt(pos);
      if (oldNode && oldNode.type.name === 'code_block' && oldNode.textContent === text) return;

      const result = hljs.highlightAuto(text);
      if (
        result.language &&
        SUPPORTED.has(result.language) &&
        (result.relevance ?? 0) >= MIN_RELEVANCE
      ) {
        tr.setNodeAttribute(pos, 'language', result.language);
        changed = true;
      }
    });

    return changed ? tr : null;
  },
});
