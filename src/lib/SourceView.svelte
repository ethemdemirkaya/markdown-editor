<script lang="ts">
  type Props = {
    value: string;
    onChange: (next: string) => void;
  };

  let { value, onChange }: Props = $props();

  function onInput(event: Event) {
    const el = event.currentTarget as HTMLTextAreaElement;
    onChange(el.value);
  }
</script>

<div class="source-wrap">
  <textarea
    class="source"
    spellcheck="false"
    autocapitalize="off"
    autocorrect="off"
    value={value}
    oninput={onInput}
  ></textarea>
</div>

<style>
  .source-wrap {
    flex: 1;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    background: var(--bg-base);
    display: flex;
  }

  .source {
    flex: 1;
    width: 100%;
    height: 100%;
    border: 0;
    outline: none;
    resize: none;
    padding: 24px 32px;
    background: transparent;
    color: var(--text-primary);
    font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace;
    font-size: 13px;
    line-height: 1.6;
    tab-size: 2;
    white-space: pre-wrap;
    word-break: break-word;
  }
</style>
