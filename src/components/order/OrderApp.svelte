<script lang="ts">
  /**
   * Root of the single Svelte island: builder + cart panel + toast stack.
   * Everything above (nav badge, menu buttons) talks to it through the
   * shared nanostores in src/stores/.
   */
  import Builder from './Builder.svelte';
  import CartPanel from './CartPanel.svelte';
  import Toasts from './Toasts.svelte';
</script>

<Builder />
<CartPanel />
<Toasts />
