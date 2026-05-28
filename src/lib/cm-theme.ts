import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';
import type { Extension } from '@codemirror/state';

const lightChrome = EditorView.theme(
  {
    '&': {
      color: '#1f2328',
      backgroundColor: '#ffffff',
    },
    '.cm-content': { caretColor: '#1f2328' },
    '.cm-cursor, .cm-dropCursor': { borderLeftColor: '#1f2328' },
    '&.cm-focused .cm-selectionBackground, ::selection': {
      backgroundColor: '#cfe5ff',
    },
    '.cm-gutters': {
      backgroundColor: '#f7f8fa',
      color: '#8b949e',
      border: 'none',
    },
    '.cm-activeLine': { backgroundColor: '#f3f4f6' },
    '.cm-activeLineGutter': { backgroundColor: '#eef0f3' },
  },
  { dark: false },
);

const darkChrome = EditorView.theme(
  {
    '&': {
      color: '#e6edf3',
      backgroundColor: '#0d1117',
    },
    '.cm-content': { caretColor: '#e6edf3' },
    '.cm-cursor, .cm-dropCursor': { borderLeftColor: '#e6edf3' },
    '&.cm-focused .cm-selectionBackground, ::selection': {
      backgroundColor: '#264f78',
    },
    '.cm-gutters': {
      backgroundColor: '#161b22',
      color: '#6e7681',
      border: 'none',
    },
    '.cm-activeLine': { backgroundColor: '#161b22' },
    '.cm-activeLineGutter': { backgroundColor: '#21262d' },
  },
  { dark: true },
);

const lightHighlight = HighlightStyle.define([
  { tag: t.heading, color: '#0969da', fontWeight: '700' },
  { tag: t.strong, fontWeight: '700' },
  { tag: t.emphasis, fontStyle: 'italic' },
  { tag: t.link, color: '#0969da', textDecoration: 'underline' },
  { tag: t.url, color: '#0969da' },
  { tag: t.monospace, color: '#cf222e', backgroundColor: '#eef0f3' },
  { tag: t.quote, color: '#6b7280', fontStyle: 'italic' },
  { tag: t.list, color: '#1f2328' },
  { tag: t.keyword, color: '#cf222e' },
  { tag: t.comment, color: '#6b7280', fontStyle: 'italic' },
  { tag: t.string, color: '#0a3069' },
  { tag: t.atom, color: '#0550ae' },
]);

const darkHighlight = HighlightStyle.define([
  { tag: t.heading, color: '#79c0ff', fontWeight: '700' },
  { tag: t.strong, fontWeight: '700' },
  { tag: t.emphasis, fontStyle: 'italic' },
  { tag: t.link, color: '#58a6ff', textDecoration: 'underline' },
  { tag: t.url, color: '#58a6ff' },
  { tag: t.monospace, color: '#ff7b72', backgroundColor: '#1c2128' },
  { tag: t.quote, color: '#8b949e', fontStyle: 'italic' },
  { tag: t.list, color: '#e6edf3' },
  { tag: t.keyword, color: '#ff7b72' },
  { tag: t.comment, color: '#8b949e', fontStyle: 'italic' },
  { tag: t.string, color: '#a5d6ff' },
  { tag: t.atom, color: '#79c0ff' },
]);

export function themeExtension(mode: 'light' | 'dark'): Extension {
  return mode === 'dark'
    ? [darkChrome, syntaxHighlighting(darkHighlight)]
    : [lightChrome, syntaxHighlighting(lightHighlight)];
}
