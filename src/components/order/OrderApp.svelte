<script lang="ts">
  /**
   * Root of the single Svelte island: builder + cart panel + toast stack.
   * Everything above (nav badge, menu buttons) talks to it through the
   * shared nanostores in src/stores/.
   *
   * setLocale runs here, before any child renders, so the island's
   * server-rendered HTML comes out in the page language. On the client the
   * runtime module already initialised itself from <html lang>.
   */
  import { setLocale } from '../../i18n/runtime';
  import Builder from './Builder.svelte';
  import CartPanel from './CartPanel.svelte';
  import Toasts from './Toasts.svelte';

  let { locale = 'en' }: { locale?: string } = $props();
  setLocale(locale);
</script>

<Builder />
<CartPanel />
<Toasts />
