# 🍕 Pizza Mania

A single-page landing site for a fictional Neapolitan pizzeria — built for the dev.to
**"Perfect Landing: Comfort Food"** challenge. The centerpiece is a build-your-own pizza
workshop with layered topping compositing, a live cart, and a chef named Giovanni who has
*opinions* about pineapple.

## Setup

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
npm run check    # astro check (TypeScript strict)
```

No environment variables, no backend — fully static output.

## Stack

- **Astro 7** (static output), TypeScript strict
- **One Svelte 5 island** (`src/components/order/OrderApp.svelte`) for the builder,
  cart panel and toast stack — everything else is zero-JS static HTML
- **nanostores** for state that crosses the island boundary (cart badge in the nav and
  the menu-card buttons are plain `<script>`s talking to the same atoms)
- **GSAP** for the character gags — loaded via dynamic `import()` only when a gag
  actually plays, so it never touches the initial bundle
- Hand-written CSS with custom properties and fluid `clamp()` type. No Tailwind.
- Self-hosted fonts, latin subsets, preloaded in the head:
  **Anton** (condensed poster display) + **Instrument Serif** (italic accents) +
  **Archivo** (body).

## Design language

A "Neapolitan poster / editorial trattoria" system, borrowed from the indie
pizzeria sites that don't look like templates:

- A three-beat kinetic headline (*"FIRE. FLOUR. amore."*) — each word rises in
  sequence on load (CSS-only, static under reduced motion), condensed uppercase
  display type mixed with an italic serif accent word
- Paper cream + tomato + ink palette with a faint CSS-only grain
- **Hard offset shadows** (`4px 4px 0 ink`) and 2px rules instead of soft blurs
- Red gingham tablecloth texture (pure CSS gradients) under the menu-card pizzas
  and the builder placemat
- Dotted leader lines between dish name and price, like a printed menu
- A starburst sticker on the hero pizza, numbered menu cards (N°1–N°5), slight
  alternating rotations, and a red marquee ticker (`aria-hidden`, static under
  reduced motion)
- Floating ingredient garnish around the hero pizza (the builder's tray icons,
  reused) with a gentle bob plus **cursor-proximity parallax** — one
  rAF-throttled listener writing two CSS variables, active only on fine
  pointers with motion allowed
- A big-number stats band (450° · 90 sec · 48 h · 15 toppings), an oversized
  outline "Le Pizze" ghost word behind the menu, and a "Giovanni's pick" badge

The builder adds three interactions on top of the tray:

- **Picked-topping chips** under the price row — each is a remove button;
  removing one re-anchors keyboard focus on that ingredient's tray toggle
- **"Giovanni's choice"** — deals 3–5 random toppings one at a time so the
  layers rain in sequence (never pineapple; he'd never), then announces the
  result once
- A subtle placemat "thud" pulse each time a topping lands (motion-safe)

## Architecture

```
src/
  data/
    ingredients.ts    ← single source of truth: name, slug, price (cents),
                        group, layer z-index, layer image path, dietary tags
    pizzas.ts         ← the five house pizzas + sizes; prices are COMPUTED
                        from ingredients.ts so menu and builder can't drift
  stores/
    cart.ts           ← cart atoms + actions (shared across island boundary)
    toasts.ts         ← visual toast queue
  lib/
    announce.ts       ← the single aria-live region helper
    focusTrap.ts      ← dialog focus management (Svelte action)
    transitions.ts    ← topping drop-in / fade-out (motion-aware)
    format.ts         ← euro formatting, incl. screen-reader-friendly variant
    motion.ts         ← central prefers-reduced-motion check
  components/
    Nav/Hero/Menu/Story/Footer.astro   ← static sections
    order/                             ← the Svelte island
      Builder.svelte / CartPanel.svelte / Giovanni.svelte / Toasts.svelte
scripts/
  gen-pizza-assets.mjs ← regenerates the placeholder SVG layers (deterministic)
```

### The pizza visual system

The pizza is **composited from transparent layers**, not one image per combination:
`/public/pizza/base.svg` (crust + sauce + cheese) plus one pre-scattered layer per
ingredient in `/public/pizza/toppings/{slug}.svg`. Stacking order comes from the `z`
field in `ingredients.ts`. Each ingredient also has a single-piece thumbnail
(`/public/pizza/icons/{slug}.svg`) shown in the builder tray.

**Per-piece drop animation:** `ToppingLayer.svelte` fetches SVG layers and inlines
them, wrapping each scattered piece in a `<g class="piece">` so pieces rain onto the
pizza with a staggered settle bounce (`animation-delay: var(--i) * 55ms`). The
wrapper `<g>` is required — animating the pieces directly would override their
`translate/rotate` attributes. Non-SVG layers fall back to an `<img>` that drops in
as one unit, so replacing the art with PNGs degrades gracefully. Removal fades the
whole layer; reduced motion collapses everything to instant.

**Replacing the placeholder art:** drop your PNGs on the same 512×512 canvas and update
`layerSrc` / `BASE_LAYER_SRC` in `src/data/ingredients.ts`. Nothing else changes. The
current SVGs are generated by `node scripts/gen-pizza-assets.mjs` (deterministic seeds,
so layouts are stable across runs). The hero and menu cards reuse the exact same layers.

### The gag state machines

- **Giovanni's pineapple protest** — first pineapple per session (`sessionStorage`
  flag). The topping is added *immediately*; the scene is pure theatre and can never
  block or delay the action. With motion allowed, a GSAP timeline (~3 s) slides him in,
  wags his finger, and slides him out; under `prefers-reduced-motion` it's a static
  toast with the same line. Screen readers get a one-line version through the live
  region either way.
- **The dodging order button** — only when the cart contains pineapple, only for
  `pointerType === 'mouse'` hover, only with motion allowed. Dodges twice (small GSAP
  translate), then gives up with a muttered *"Va bene, va bene…"* tooltip and behaves
  normally forever. Keyboard focus and Enter/Space are never intercepted — the handler
  is on `pointerenter` only.
- **Lasagna warning** — 10+ toppings triggers one toast per crossing of the line
  (flag resets when you drop back under 10). Still allowed.
- **Empty pizza** — ordering a bare base gets *"Just bread? …I respect it."* and goes
  through fine.

## Accessibility notes

- **One live region.** Every event — topping toggled (with new price), cart changes,
  form errors, gag one-liners — routes through a single `aria-live="polite"` region
  (`src/lib/announce.ts`). Visual toasts are `aria-hidden` so nothing is spoken twice.
  Prices are announced as "12 euro 50", which reads better than a currency symbol.
- **Keyboard.** The ingredient tray is plain `<button aria-pressed>` toggles — no
  roving-tabindex cleverness to break. The cart panel is `role="dialog"
  aria-modal="true"` with a focus trap: Tab wraps, Escape closes, and focus returns to
  the nav cart button on close. "Customize" moves focus into the builder section.
- **The gags never punish assistive tech.** Drag-and-drop is a pointer-only enhancement
  over click-to-toggle. The dodge gag can't fire on keyboard focus by construction.
  Giovanni's scene is `aria-hidden` decoration over an already-completed action.
- **Reduced motion.** One central check (`src/lib/motion.ts`) plus CSS media queries:
  hero float/steam off, card hover lift off, layer transitions collapse to instant,
  Giovanni becomes a toast, the dodge gag is disabled entirely. Functionality is
  identical.
- **Semantics & visuals.** Landmarks (`header/nav/main/section/footer`), one `h1`,
  ordered heading levels, labels + inline `aria-describedby` errors on the checkout
  form (validated in JS with `novalidate`, errors focused and announced), visible
  `:focus-visible` outlines, all interactive targets ≥ 44px, text contrast ≥ 4.5:1 on
  the warm palette.
- **Performance choices that help a11y too:** static HTML everywhere except one island,
  GSAP lazy-loaded, below-fold images `loading="lazy"`, fonts subset + preloaded.

## Decisions made without asking (as instructed)

- **Pineapple goes on immediately**, with the protest playing over it, rather than
  "after the scene" — this guarantees the gag can never eat a click, which felt truer
  to the "never blocks the action" requirement than a 3-second delay would be.
- Menu prices are **computed** from the ingredient config (base €7.00 + toppings,
  × size multiplier) instead of hand-set, trading pretty round numbers for a guarantee
  that the menu, builder and cart always agree.
- The builder recognizes when your custom pizza *is* one of the house five and names
  it accordingly; identical recipe + size dedupes into a quantity bump in the cart.
- Placeholder art is generated, seeded SVG — so "replace assets later" is a pure
  file-swap, and the layouts don't reshuffle on every regeneration
  (`node scripts/gen-pizza-assets.mjs` regenerates layers, tray icons and all).
- No emoji anywhere in the UI — the logo, dietary marks (chili/leaf), and
  Giovanni's toast avatar are all inline SVG, which keeps the illustration style
  consistent across platforms.
