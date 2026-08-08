/**
 * Single aria-live="polite" region for the whole page (rendered in the layout).
 * Routing every announcement through one region avoids double-speak when a
 * visual toast and a state change describe the same event.
 */

let clearTimer: ReturnType<typeof setTimeout> | undefined;

export function announce(message: string): void {
  const region = document.getElementById('sr-status');
  if (!region) return;
  // Clearing first guarantees repeated identical messages are re-announced.
  region.textContent = '';
  requestAnimationFrame(() => {
    region.textContent = message;
  });
  clearTimeout(clearTimer);
  clearTimer = setTimeout(() => {
    region.textContent = '';
  }, 7000);
}
