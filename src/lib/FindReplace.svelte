<script lang="ts">
  import { t } from './i18n';

  type Props = {
    initialReplace: boolean;
    onClose: () => void;
    getSource: () => string;
    setSource: (next: string) => void;
  };

  let { initialReplace, onClose, getSource, setSource }: Props = $props();

  let findText = $state('');
  let replaceText = $state('');
  let caseSensitive = $state(false);
  let useRegex = $state(false);
  let showReplace = $state(initialReplace);
  let currentIndex = $state(0);

  function escapeRegex(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function buildPattern(): RegExp | null {
    if (!findText) return null;
    try {
      const flags = caseSensitive ? 'g' : 'gi';
      const body = useRegex ? findText : escapeRegex(findText);
      return new RegExp(body, flags);
    } catch {
      return null;
    }
  }

  let matchCount = $derived.by(() => {
    const re = buildPattern();
    if (!re) return 0;
    const matches = getSource().match(re);
    return matches?.length ?? 0;
  });

  function scrollToOccurrence(occurrence: number) {
    if (!findText) return;
    const root = document.querySelector('.wysiwyg .ProseMirror');
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const needle = caseSensitive ? findText : findText.toLowerCase();
    let count = 0;
    let node: Node | null;
    while ((node = walker.nextNode())) {
      const text = node.textContent ?? '';
      const haystack = caseSensitive ? text : text.toLowerCase();
      let from = 0;
      let idx = haystack.indexOf(needle, from);
      while (idx >= 0) {
        if (count === occurrence) {
          const range = document.createRange();
          range.setStart(node, idx);
          range.setEnd(node, idx + findText.length);
          const sel = window.getSelection();
          sel?.removeAllRanges();
          sel?.addRange(range);
          (node.parentElement as HTMLElement | null)?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
          return;
        }
        count++;
        from = idx + Math.max(1, needle.length);
        idx = haystack.indexOf(needle, from);
      }
    }
  }

  function next() {
    if (matchCount === 0) return;
    currentIndex = (currentIndex + 1) % matchCount;
    scrollToOccurrence(currentIndex);
  }

  function previous() {
    if (matchCount === 0) return;
    currentIndex = (currentIndex - 1 + matchCount) % matchCount;
    scrollToOccurrence(currentIndex);
  }

  function replaceOne() {
    const re = buildPattern();
    if (!re) return;
    const src = getSource();
    let i = -1;
    const next = src.replace(re, (m) => {
      i++;
      return i === currentIndex ? replaceText : m;
    });
    if (next !== src) {
      setSource(next);
    }
  }

  function replaceAll() {
    const re = buildPattern();
    if (!re) return;
    const src = getSource();
    const next = src.replace(re, replaceText);
    if (next !== src) {
      setSource(next);
      currentIndex = 0;
    }
  }

  function onKey(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (event.shiftKey) previous();
      else next();
    }
  }
</script>

<div class="find-panel" role="dialog" aria-label="Bul ve değiştir">
  <div class="row">
    <input
      class="text-input"
      placeholder={$t('find.placeholder')}
      bind:value={findText}
      onkeydown={onKey}
      autofocus
    />
    <button class="seg" type="button" class:active={caseSensitive} onclick={() => (caseSensitive = !caseSensitive)} title={$t('find.case')}>Aa</button>
    <button class="seg" type="button" class:active={useRegex} onclick={() => (useRegex = !useRegex)} title={$t('find.regex')}>.*</button>
    <span class="count">
      {#if findText}{matchCount === 0 ? 0 : currentIndex + 1} / {matchCount}{/if}
    </span>
    <button class="icon" type="button" onclick={previous} title={$t('find.prev')}>↑</button>
    <button class="icon" type="button" onclick={next} title={$t('find.next')}>↓</button>
    <button class="icon" type="button" onclick={() => (showReplace = !showReplace)} title={$t('find.toggle-replace')}>↹</button>
    <button class="icon" type="button" onclick={onClose} title={$t('find.close')}>×</button>
  </div>
  {#if showReplace}
    <div class="row">
      <input
        class="text-input"
        placeholder={$t('find.replace.placeholder')}
        bind:value={replaceText}
        onkeydown={onKey}
      />
      <button class="btn" type="button" onclick={replaceOne}>{$t('find.replace-one')}</button>
      <button class="btn" type="button" onclick={replaceAll}>{$t('find.replace-all')}</button>
    </div>
  {/if}
</div>

<style>
  .find-panel {
    position: absolute;
    top: 8px;
    right: 16px;
    z-index: 50;
    background: var(--bg-base);
    border: 1px solid var(--border-subtle);
    border-radius: 8px;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.18);
    padding: 8px;
    min-width: 380px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .row {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .text-input {
    flex: 1;
    height: 26px;
    padding: 0 8px;
    border-radius: 4px;
    border: 1px solid var(--border-subtle);
    background: var(--bg-elevated);
    color: var(--text-primary);
    font-size: 12px;
    outline: none;
  }

  .text-input:focus {
    border-color: var(--accent);
  }

  .seg,
  .icon {
    appearance: none;
    height: 26px;
    min-width: 26px;
    padding: 0 6px;
    border: 1px solid var(--border-subtle);
    background: transparent;
    border-radius: 4px;
    color: var(--text-primary);
    font-size: 12px;
    cursor: pointer;
  }

  .seg.active {
    background: var(--accent);
    color: white;
    border-color: var(--accent);
  }

  .seg:hover,
  .icon:hover {
    background: var(--code-inline-bg);
  }

  .count {
    font-size: 11px;
    color: var(--text-muted);
    min-width: 56px;
    text-align: center;
  }

  .btn {
    appearance: none;
    height: 26px;
    padding: 0 10px;
    border: 1px solid var(--border-subtle);
    background: transparent;
    border-radius: 4px;
    color: var(--text-primary);
    font-size: 12px;
    cursor: pointer;
  }

  .btn:hover {
    background: var(--code-inline-bg);
  }
</style>
