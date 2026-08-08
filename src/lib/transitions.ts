/**
 * Custom Svelte transitions for pizza layers. Both collapse to instant
 * (duration 0) under prefers-reduced-motion — state changes stay identical.
 */
import { backOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';
import { prefersReducedMotion } from './motion';

/** Topping drops onto the pizza: slight scale down + settle bounce. */
export function dropIn(_node: Element, { duration = 450 } = {}): TransitionConfig {
  if (prefersReducedMotion()) return { duration: 0 };
  return {
    duration,
    easing: backOut,
    css: (t, u) => `
      opacity: ${Math.min(1, t * 2)};
      transform: scale(${1 + 0.16 * u}) translateY(${-22 * u}px);
    `,
  };
}

/** Topping removed: quick fade + shrink. */
export function fadeAway(_node: Element, { duration = 220 } = {}): TransitionConfig {
  if (prefersReducedMotion()) return { duration: 0 };
  return {
    duration,
    css: (t) => `opacity: ${t}; transform: scale(${0.92 + 0.08 * t});`,
  };
}
