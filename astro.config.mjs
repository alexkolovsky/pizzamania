// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';

export default defineConfig({
  site: 'https://pizzamania.kolovsky.dev',
  output: 'static',
  integrations: [svelte()],
  i18n: {
    locales: ['en', 'it', 'uk'],
    defaultLocale: 'en',
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
