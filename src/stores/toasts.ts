/**
 * Visual toast queue. Toasts are aria-hidden on purpose: every toast-worthy
 * event also goes through announce(), so screen readers hear it exactly once
 * via the single live region instead of racing two announcements.
 */
import { atom } from 'nanostores';

export interface Toast {
  id: number;
  text: string;
  /** 'chef' toasts get Giovanni's avatar styling. */
  kind: 'chef' | 'info';
}

export const toasts = atom<Toast[]>([]);

let nextToastId = 1;

export function showToast(text: string, kind: Toast['kind'] = 'chef', duration = 5000): void {
  const toast: Toast = { id: nextToastId++, text, kind };
  toasts.set([...toasts.get(), toast]);
  setTimeout(() => {
    toasts.set(toasts.get().filter((t) => t.id !== toast.id));
  }, duration);
}
