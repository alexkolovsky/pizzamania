/**
 * Single aria-live="polite" region for the whole page (rendered in the layout).
 * Routing every announcement through one region avoids double-speak when a
 * visual toast and a state change describe the same event.
 *
 * Messages announced within the same ~tick are joined instead of overwriting
 * each other (e.g. "topping added" + "ten-topping warning"). setTimeout
 * rather than requestAnimationFrame so announcements still land when the
 * tab is backgrounded.
 */

let pending: string[] = [];
let flushTimer: ReturnType<typeof setTimeout> | undefined;
let clearTimer: ReturnType<typeof setTimeout> | undefined;

export function announce(message: string): void {
  const region = document.getElementById('sr-status');
  if (!region) return;
  pending.push(message);
  // Clearing first guarantees repeated identical messages are re-announced.
  region.textContent = '';
  clearTimeout(flushTimer);
  flushTimer = setTimeout(() => {
    region.textContent = pending.join(' ');
    pending = [];
  }, 50);
  clearTimeout(clearTimer);
  clearTimer = setTimeout(() => {
    region.textContent = '';
  }, 7000);
}
