/**
 * Current dictionary for client scripts and the Svelte island.
 *
 * On the client it self-initialises from <html lang>. During the static
 * build the island is server-rendered once per page, so OrderApp calls
 * setLocale() with its locale prop before any child renders.
 */
import { dictionaries, getDict, type Dict } from './index';

let current: Dict = dictionaries.en;

export function setLocale(locale: string | undefined | null): void {
  current = getDict(locale);
}

export function t(): Dict {
  return current;
}

if (typeof document !== 'undefined') {
  setLocale(document.documentElement.lang);
}
