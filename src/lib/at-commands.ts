import {
  autocompletion,
  snippetCompletion,
  startCompletion,
  type CompletionContext,
  type CompletionResult,
  type Completion,
} from '@codemirror/autocomplete';
import { EditorView } from '@codemirror/view';
import type { Extension } from '@codemirror/state';

type CommandDef = {
  label: string;
  info: string;
  type: Completion['type'];
  snippet: string;
};

const COMMANDS: CommandDef[] = [
  { label: '@code', info: 'Kod bloğu (fenced)', type: 'function', snippet: '```${dil}\n${kod}\n```' },
  { label: '@inline', info: 'Satır içi kod', type: 'text', snippet: '`${kod}`' },
  { label: '@bold', info: 'Kalın', type: 'text', snippet: '**${metin}**' },
  { label: '@italic', info: 'Eğik', type: 'text', snippet: '*${metin}*' },
  { label: '@strike', info: 'Üstü çizili', type: 'text', snippet: '~~${metin}~~' },
  { label: '@h1', info: 'Başlık 1', type: 'keyword', snippet: '# ${baslik}' },
  { label: '@h2', info: 'Başlık 2', type: 'keyword', snippet: '## ${baslik}' },
  { label: '@h3', info: 'Başlık 3', type: 'keyword', snippet: '### ${baslik}' },
  { label: '@h4', info: 'Başlık 4', type: 'keyword', snippet: '#### ${baslik}' },
  { label: '@link', info: 'Bağlantı', type: 'text', snippet: '[${metin}](${url})' },
  { label: '@image', info: 'Görsel', type: 'text', snippet: '![${alt}](${url})' },
  { label: '@list', info: 'Madde listesi', type: 'text', snippet: '- ${madde1}\n- ${madde2}\n- ${madde3}' },
  { label: '@numbered', info: 'Numaralı liste', type: 'text', snippet: '1. ${madde1}\n2. ${madde2}\n3. ${madde3}' },
  { label: '@task', info: 'Görev listesi', type: 'text', snippet: '- [ ] ${gorev1}\n- [ ] ${gorev2}' },
  {
    label: '@table',
    info: 'Tablo',
    type: 'text',
    snippet: '| ${sutun1} | ${sutun2} |\n| --- | --- |\n| ${hucre1} | ${hucre2} |',
  },
  { label: '@quote', info: 'Alıntı', type: 'text', snippet: '> ${metin}' },
  { label: '@hr', info: 'Yatay çizgi', type: 'text', snippet: '---\n' },
  { label: '@math', info: 'Matematik bloğu', type: 'function', snippet: '$$\n${ifade}\n$$' },
  { label: '@inlinemath', info: 'Satır içi matematik', type: 'function', snippet: '$${ifade}$' },
];

function atCommandSource(ctx: CompletionContext): CompletionResult | null {
  const word = ctx.matchBefore(/@\w*/);
  if (!word) return null;
  if (word.from === word.to && !ctx.explicit) return null;

  const options = COMMANDS.map((cmd) =>
    snippetCompletion(cmd.snippet, {
      label: cmd.label,
      detail: cmd.info,
      type: cmd.type,
      boost: cmd.label === '@code' ? 5 : 0,
    }),
  );

  return {
    from: word.from,
    options,
    validFor: /^@\w*$/,
  };
}

const triggerOnAt = EditorView.inputHandler.of((view, from, to, text) => {
  if (text !== '@') return false;
  view.dispatch({
    changes: { from, to, insert: '@' },
    selection: { anchor: from + 1 },
    userEvent: 'input.type',
  });
  queueMicrotask(() => startCompletion(view));
  return true;
});

export const atCommands: Extension = [
  autocompletion({
    override: [atCommandSource],
    defaultKeymap: true,
    closeOnBlur: true,
    activateOnTyping: true,
  }),
  triggerOnAt,
];
