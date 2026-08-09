/**
 * Locale registry. Astro's built-in i18n routing owns the URLs
 * (`/` = en, `/it/`, `/uk/`); this module owns the dictionaries.
 */
import { en, type Dict } from './en';
import { it } from './it';
import { uk } from './uk';

export type { Dict };

export const locales = ['en', 'it', 'uk'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const dictionaries: Record<Locale, Dict> = { en, it, uk };

/** Short labels for the language switcher ("UK" would read as United Kingdom). */
export const localeShortLabels: Record<Locale, string> = { en: 'EN', it: 'IT', uk: 'UA' };

export function resolveLocale(input: string | undefined | null): Locale {
  return (locales as readonly string[]).includes(input ?? '') ? (input as Locale) : defaultLocale;
}

export function getDict(locale: string | undefined | null): Dict {
  return dictionaries[resolveLocale(locale)];
}

/** Root path for a locale — the default language lives at `/`. */
export function localePath(locale: Locale): string {
  return locale === defaultLocale ? '/' : `/${locale}/`;
}
