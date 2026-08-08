<script lang="ts" module>
  // Fetched layer markup, cached per slug for instant re-adds
  const svgCache = new Map<string, string>();
</script>

<script lang="ts">
  /**
   * One topping layer on the pizza canvas.
   *
   * SVG layers are fetched and inlined so every scattered piece (top-level
   * group in the file) can drop in individually with a staggered settle
   * bounce. Non-SVG art (the final PNGs, eventually) falls back to an <img>
   * that animates as one layer — so swapping assets later degrades cleanly.
   *
   * The stagger works by wrapping each piece in a plain <g class="piece">:
   * CSS-animating the original groups directly would override their
   * translate/rotate transform attributes and pile every piece in the corner.
   */
  import { onMount, tick } from 'svelte';
  import type { Ingredient } from '../../data/ingredients';
  import { dropIn, fadeAway } from '../../lib/transitions';

  let { ingredient }: { ingredient: Ingredient } = $props();

  let host: HTMLDivElement | undefined = $state();
  let mode = $state<'loading' | 'inline' | 'img'>('loading');
  let inner = $state('');

  onMount(async () => {
    if (!ingredient.layerSrc.endsWith('.svg')) {
      mode = 'img';
      return;
    }
    try {
      let text = svgCache.get(ingredient.slug);
      if (!text) {
        const res = await fetch(ingredient.layerSrc);
        if (!res.ok) throw new Error(String(res.status));
        text = await res.text();
        svgCache.set(ingredient.slug, text);
      }
      const match = text.match(/<svg[^>]*>([\s\S]*)<\/svg>/i);
      if (!match) throw new Error('no svg root');
      inner = match[1]!;
      mode = 'inline';
      await tick();
      const svg = host?.querySelector('svg');
      if (!svg) return;
      [...svg.children].forEach((child, i) => {
        const wrapper = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        wrapper.setAttribute('class', 'piece');
        wrapper.style.setProperty('--i', String(i));
        svg.insertBefore(wrapper, child);
        wrapper.appendChild(child);
      });
    } catch {
      mode = 'img';
    }
  });
</script>

<div class="topping-layer" bind:this={host} style:z-index={ingredient.z} out:fadeAway>
  {#if mode === 'inline'}
    <svg viewBox="0 0 512 512" aria-hidden="true">
      <!-- eslint-disable-next-line svelte/no-at-html-tags — same-origin generated assets -->
      {@html inner}
    </svg>
  {:else if mode === 'img'}
    <img src={ingredient.layerSrc} alt="" width="512" height="512" in:dropIn />
  {/if}
</div>

<style>
  .topping-layer,
  .topping-layer svg,
  .topping-layer img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  @media (prefers-reduced-motion: no-preference) {
    .topping-layer :global(.piece) {
      transform-box: fill-box;
      transform-origin: center;
      animation: piece-drop 0.4s cubic-bezier(0.2, 0.7, 0.35, 1.2) both;
      /* Denser layers (up to 22 pieces): cap the stagger so the rain never
         takes longer than ~700ms regardless of piece count */
      animation-delay: calc(min(var(--i), 15) * 45ms);
    }
  }

  @keyframes piece-drop {
    0% {
      opacity: 0;
      transform: translateY(-30px) scale(1.35);
    }
    70% {
      opacity: 1;
      transform: translateY(3px) scale(0.97);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
</style>
