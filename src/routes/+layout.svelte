<script lang="ts">
  import '../app.css';
  import 'katex/dist/katex.min.css';
  import { onMount } from 'svelte';
  import { theme } from '$lib/theme';
  import hljsLight from 'highlight.js/styles/github.css?raw';
  import hljsDark from 'highlight.js/styles/github-dark.css?raw';

  let { children } = $props();

  onMount(() => {
    const styleEl = document.createElement('style');
    styleEl.id = 'hljs-theme';
    document.head.appendChild(styleEl);

    const unsubscribe = theme.subscribe((current) => {
      styleEl.textContent = current === 'dark' ? hljsDark : hljsLight;
    });

    return () => {
      unsubscribe();
      styleEl.remove();
    };
  });
</script>

{@render children()}
