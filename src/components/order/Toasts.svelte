<script lang="ts">
  /**
   * Visual-only toast stack (aria-hidden): the same text always goes through
   * the shared live region via announce(), so screen readers hear each event
   * exactly once.
   */
  import { fly } from 'svelte/transition';
  import { toasts } from '../../stores/toasts';
  import { prefersReducedMotion } from '../../lib/motion';
</script>

<div class="toast-stack" aria-hidden="true">
  {#each $toasts as toast (toast.id)}
    <div
      class="toast"
      transition:fly={{ y: 24, duration: prefersReducedMotion() ? 0 : 240 }}
    >
      {#if toast.kind === 'chef'}
        <svg class="toast-avatar" viewBox="60 40 80 104" width="34" height="44">
          <path d="M 64 88 Q 58 48 92 50 Q 100 34 116 44 Q 146 40 138 78 Q 137 88 134 92 L 66 92 Z" fill="#fff9ec" />
          <rect x="66" y="86" width="68" height="12" rx="6" fill="#ecdfc8" />
          <ellipse cx="100" cy="112" rx="34" ry="36" fill="#eab88f" />
          <path d="M 76 100 L 92 106 M 124 100 L 108 106" stroke="#4a3526" stroke-width="4" stroke-linecap="round" />
          <circle cx="86" cy="114" r="4" fill="#211a12" />
          <circle cx="114" cy="114" r="4" fill="#211a12" />
          <path d="M 78 130 Q 90 122 100 130 Q 110 122 122 130 Q 118 142 100 136 Q 82 142 78 130 Z" fill="#4a3526" />
        </svg>
      {/if}
      <p>{toast.text}</p>
    </div>
  {/each}
</div>

<style>
  .toast-stack {
    position: fixed;
    bottom: var(--space-3);
    left: 50%;
    transform: translateX(-50%);
    z-index: 140;
    display: grid;
    gap: var(--space-2);
    width: min(27rem, calc(100vw - 2rem));
    pointer-events: none;
  }

  .toast {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    background: var(--ink);
    color: var(--paper);
    border: 2px solid var(--paper);
    border-radius: var(--radius);
    padding: var(--space-2) var(--space-3);
    box-shadow: var(--shadow-hard-sm);
  }
  .toast p {
    margin: 0;
    font-family: var(--font-serif);
    font-style: italic;
    font-size: var(--text-lg);
    line-height: 1.3;
  }
  .toast-avatar {
    flex-shrink: 0;
  }
</style>
