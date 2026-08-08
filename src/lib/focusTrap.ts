/**
 * Svelte action: dialog focus management.
 * - Focuses the first focusable element (or [data-autofocus]) on mount
 * - Tab/Shift+Tab wrap inside the node
 * - Escape calls onEscape
 * - On destroy, focus returns to the element focused before the dialog opened
 */
interface TrapOptions {
  onEscape?: () => void;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function focusTrap(node: HTMLElement, options: TrapOptions = {}) {
  const previouslyFocused = document.activeElement as HTMLElement | null;

  const initial = node.querySelector<HTMLElement>('[data-autofocus]') ??
    node.querySelector<HTMLElement>(FOCUSABLE);
  initial?.focus();

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      options.onEscape?.();
      return;
    }
    if (event.key !== 'Tab') return;

    const focusables = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => el.offsetParent !== null,
    );
    if (focusables.length === 0) return;

    const first = focusables[0]!;
    const last = focusables[focusables.length - 1]!;
    const active = document.activeElement;

    if (event.shiftKey && (active === first || !node.contains(active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  node.addEventListener('keydown', handleKeydown);

  return {
    destroy() {
      node.removeEventListener('keydown', handleKeydown);
      previouslyFocused?.focus();
    },
  };
}
