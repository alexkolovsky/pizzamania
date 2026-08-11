/**
 * Svelte action: dialog focus management.
 * - Focuses the first focusable element (or [data-autofocus]) on mount
 * - Tab/Shift+Tab wrap inside the node; if focus somehow lands outside
 *   (e.g. the focused button was removed from the DOM), Tab pulls it back in
 * - Escape calls onEscape — listener lives on document so it keeps working
 *   even when focus has fallen to <body>
 * - Everything outside the dialog is made inert and the page scroll is
 *   locked while the dialog is open
 * - On destroy, focus returns to the element focused before the dialog
 *   opened, or to options.fallbackFocus if that element is gone/was <body>
 */
interface TrapOptions {
  onEscape?: () => void;
  /** CSS selector to focus on close when the previously-focused element is unavailable */
  fallbackFocus?: string;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function focusTrap(node: HTMLElement, options: TrapOptions = {}) {
  const previouslyFocused = document.activeElement as HTMLElement | null;

  const initial =
    node.querySelector<HTMLElement>('[data-autofocus]') ?? node.querySelector<HTMLElement>(FOCUSABLE);
  initial?.focus();

  // Inert the rest of the page. The dialog may be nested anywhere, so walk
  // up from it and inert the siblings at each level rather than assuming a
  // particular mount point.
  const inerted: Element[] = [];
  for (let el: Element | null = node; el && el !== document.body; el = el.parentElement) {
    for (const sibling of el.parentElement?.children ?? []) {
      if (sibling === el || sibling.tagName === 'SCRIPT' || sibling.tagName === 'STYLE') continue;
      if ((sibling as HTMLElement).inert) continue; // don't take ownership of someone else's inert
      (sibling as HTMLElement).inert = true;
      inerted.push(sibling);
    }
  }

  const prevOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';

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

    if (!node.contains(active)) {
      // Focus escaped (stage change removed the focused element) — pull it back
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    } else if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  document.addEventListener('keydown', handleKeydown);

  return {
    destroy() {
      document.removeEventListener('keydown', handleKeydown);
      for (const el of inerted) (el as HTMLElement).inert = false;
      document.body.style.overflow = prevOverflow;

      const restore =
        previouslyFocused && previouslyFocused !== document.body && previouslyFocused.isConnected
          ? previouslyFocused
          : options.fallbackFocus
            ? document.querySelector<HTMLElement>(options.fallbackFocus)
            : null;
      restore?.focus();
    },
  };
}
