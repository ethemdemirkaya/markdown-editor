<script lang="ts">
  import { settings, setSetting, type AtBehavior } from './settings';
  import { locale, LOCALE_LABELS, SUPPORTED_LOCALES, t, type Locale } from './i18n';

  type Props = { onClose: () => void };
  let { onClose }: Props = $props();

  function onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) onClose();
  }

  function onKey(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }
  }
</script>

<svelte:window onkeydown={onKey} />

<div
  class="backdrop"
  role="dialog"
  aria-modal="true"
  aria-label={$t('settings.title')}
  onclick={onBackdropClick}
>
  <div class="panel">
    <header class="panel-header">
      <h2>{$t('settings.title')}</h2>
      <button class="close" type="button" onclick={onClose} aria-label={$t('settings.close')}>×</button>
    </header>

    <section class="group">
      <div class="row">
        <div class="label">
          <div class="title">{$t('settings.language.title')}</div>
          <div class="desc">{$t('settings.language.desc')}</div>
        </div>
        <div class="control">
          <select
            value={$locale}
            onchange={(e) => locale.set((e.currentTarget as HTMLSelectElement).value as Locale)}
          >
            {#each SUPPORTED_LOCALES as loc}
              <option value={loc}>{LOCALE_LABELS[loc]}</option>
            {/each}
          </select>
        </div>
      </div>

      <div class="row">
        <div class="label">
          <div class="title">{$t('settings.at.title')}</div>
          <div class="desc">{$t('settings.at.desc')}</div>
        </div>
        <div class="control">
          <select
            value={$settings.atBehavior}
            onchange={(e) => setSetting('atBehavior', (e.currentTarget as HTMLSelectElement).value as AtBehavior)}
          >
            <option value="inline">{$t('settings.at.inline')}</option>
            <option value="new-paragraph">{$t('settings.at.new-paragraph')}</option>
            <option value="disabled">{$t('settings.at.disabled')}</option>
          </select>
        </div>
      </div>

      <div class="row">
        <div class="label">
          <div class="title">{$t('settings.outline.title')}</div>
          <div class="desc">{$t('settings.outline.desc')}</div>
        </div>
        <div class="control">
          <label class="switch">
            <input
              type="checkbox"
              checked={$settings.outlineDefaultOpen}
              onchange={(e) => setSetting('outlineDefaultOpen', (e.currentTarget as HTMLInputElement).checked)}
            />
            <span></span>
          </label>
        </div>
      </div>

      <div class="row">
        <div class="label">
          <div class="title">{$t('settings.autosave.title')}</div>
          <div class="desc">{$t('settings.autosave.desc')}</div>
        </div>
        <div class="control">
          <label class="switch">
            <input
              type="checkbox"
              checked={$settings.autosaveEnabled}
              onchange={(e) => setSetting('autosaveEnabled', (e.currentTarget as HTMLInputElement).checked)}
            />
            <span></span>
          </label>
        </div>
      </div>

      <div class="row">
        <div class="label">
          <div class="title">{$t('settings.confirm.title')}</div>
          <div class="desc">{$t('settings.confirm.desc')}</div>
        </div>
        <div class="control">
          <label class="switch">
            <input
              type="checkbox"
              checked={$settings.confirmOnClose}
              onchange={(e) => setSetting('confirmOnClose', (e.currentTarget as HTMLInputElement).checked)}
            />
            <span></span>
          </label>
        </div>
      </div>
    </section>
  </div>
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .panel {
    width: min(560px, 92vw);
    max-height: 80vh;
    background: var(--bg-base);
    border: 1px solid var(--border-subtle);
    border-radius: 10px;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px;
    border-bottom: 1px solid var(--border-subtle);
    background: var(--bg-elevated);
  }

  .panel-header h2 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
  }

  .close {
    appearance: none;
    background: transparent;
    border: 1px solid transparent;
    color: var(--text-primary);
    width: 26px;
    height: 26px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
    line-height: 1;
  }

  .close:hover {
    background: var(--code-inline-bg);
  }

  .group {
    padding: 8px 6px;
    overflow-y: auto;
  }

  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 12px 14px;
    border-radius: 6px;
  }

  .row + .row {
    border-top: 1px solid var(--border-subtle);
  }

  .label .title {
    font-size: 13px;
    font-weight: 500;
  }

  .label .desc {
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 2px;
  }

  .control select {
    appearance: none;
    background: var(--bg-elevated);
    color: var(--text-primary);
    border: 1px solid var(--border-subtle);
    border-radius: 5px;
    padding: 5px 10px;
    font-size: 12px;
    cursor: pointer;
  }

  .switch {
    position: relative;
    display: inline-block;
    width: 36px;
    height: 20px;
  }

  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .switch span {
    position: absolute;
    cursor: pointer;
    inset: 0;
    background: var(--border-subtle);
    border-radius: 999px;
    transition: 0.2s;
  }

  .switch span::before {
    position: absolute;
    content: '';
    height: 14px;
    width: 14px;
    left: 3px;
    top: 3px;
    background: var(--bg-base);
    border-radius: 50%;
    transition: 0.2s;
  }

  .switch input:checked + span {
    background: var(--accent);
  }

  .switch input:checked + span::before {
    transform: translateX(16px);
  }
</style>
