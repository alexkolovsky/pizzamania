<script lang="ts">
  import {
    ingredients,
    ingredientBySlug,
    groupOrder,
    BASE_LAYER_SRC,
    type Ingredient,
  } from '../../data/ingredients';
  import { pizzas, sizes, pizzaPrice, type SizeId } from '../../data/pizzas';
  import { addToCart, builderPreset, recipeSummary } from '../../stores/cart';
  import { showToast } from '../../stores/toasts';
  import { announce } from '../../lib/announce';
  import { euro } from '../../lib/format';
  import { prefersReducedMotion } from '../../lib/motion';
  import { t } from '../../i18n/runtime';
  import Giovanni from './Giovanni.svelte';
  import ToppingLayer from './ToppingLayer.svelte';

  import { scale } from 'svelte/transition';
  import { tick } from 'svelte';

  // Locale is fixed per page (switching languages navigates), so one
  // snapshot at component init is safe on both server and client.
  const T = t();

  /* Giovanni's pineapple protest escalates within a session: full scene,
     angrier encore, then wordless resignation. The count survives reloads
     (sessionStorage) so he doesn't reset to outrage on every visit. */
  const GIOVANNI_COUNT_KEY = 'pizzamania-giovanni-count';

  function pineappleProtests(): number {
    const n = Number(sessionStorage.getItem(GIOVANNI_COUNT_KEY));
    return Number.isFinite(n) && n > 0 ? n : 0;
  }

  let selected = $state<string[]>([]);
  let placematEl: HTMLDivElement | undefined = $state();
  let summaryEl: HTMLDivElement | undefined = $state();
  let orderBarEl: HTMLDivElement | undefined = $state();
  // Drives the mobile order bar: it hides only while the in-flow price
  // block is on screen, so price and controls are always reachable but
  // never doubled up
  let summaryVisible = $state(true);
  let size = $state<SizeId>('M');
  let giovanniActive = $state(false);
  let giovanniVariant = $state<'first' | 'again'>('first');
  // One lasagna joke per crossing of the 10-topping line, not per topping after it
  let lasagnaWarned = false;

  const price = $derived(pizzaPrice(selected, size));
  const layers = $derived(
    selected
      .map((slug) => ingredientBySlug.get(slug)!)
      .sort((a, b) => a.z - b.z),
  );
  const pizzaName = $derived.by(() => {
    const match = pizzas.find(
      (p) =>
        p.ingredientSlugs.length === selected.length &&
        p.ingredientSlugs.every((slug) => selected.includes(slug)),
    );
    return match ? match.name : T.customPizza;
  });
  const canvasLabel = $derived(
    T.builder.canvasLabel(recipeSummary(selected).toLowerCase(), T.euroSpoken(price)),
  );

  $effect(() => {
    if (!summaryEl) return;
    // Bottom margin excludes the bar's own strip, so the summary only counts
    // as "visible" once it's actually readable above the bar
    const observer = new IntersectionObserver(
      ([entry]) => (summaryVisible = entry?.isIntersecting ?? false),
      { rootMargin: '0px 0px -76px 0px' },
    );
    observer.observe(summaryEl);
    return () => observer.disconnect();
  });

  // "Customize" on a menu card pushes a recipe into this atom
  $effect(() =>
    builderPreset.subscribe((preset) => {
      if (!preset) return;
      selected = [...preset.slugs];
      lasagnaWarned = false;
      announce(T.builder.presetLoaded(preset.name, recipeSummary(selected)));
      builderPreset.set(null);
    }),
  );

  function priceAfter(slugs: string[]): number {
    return pizzaPrice(slugs, size);
  }

  function addIngredient(slug: string) {
    if (selected.includes(slug)) return;
    const ingredient = ingredientBySlug.get(slug);
    if (!ingredient) return;

    selected = [...selected, slug];
    pulseCanvas();
    pulseBar();
    const added = T.builder.ingredientAdded(T.ingredients[slug], T.euroSpoken(priceAfter(selected)));

    // Giovanni's pineapple protest — never blocking, the topping goes on
    // immediately. He escalates: full scene, angrier encore, resignation.
    // His line and the price ride one announcement so neither overwrites
    // the other in the shared live region.
    if (slug === 'ananas') {
      const protests = pineappleProtests();
      sessionStorage.setItem(GIOVANNI_COUNT_KEY, String(protests + 1));
      if (protests === 0) {
        if (prefersReducedMotion()) {
          showToast(T.builder.pineappleToast);
        } else {
          giovanniVariant = 'first';
          giovanniActive = true;
        }
        announce(`${T.builder.pineappleAnnounce} ${added}`);
      } else if (protests === 1) {
        if (prefersReducedMotion()) {
          showToast(T.builder.pineappleToastAgain);
        } else {
          giovanniVariant = 'again';
          giovanniActive = true;
        }
        announce(`${T.builder.pineappleAnnounceAgain} ${added}`);
      } else {
        showToast(T.builder.pineappleToastResigned);
        announce(`${T.builder.pineappleAnnounceResigned} ${added}`);
      }
    } else {
      announce(added);
    }

    if (selected.length >= 10 && !lasagnaWarned) {
      lasagnaWarned = true;
      showToast(T.builder.lasagnaToast);
      announce(T.builder.lasagnaAnnounce);
    }
  }

  function removeIngredient(slug: string) {
    const ingredient = ingredientBySlug.get(slug);
    selected = selected.filter((s) => s !== slug);
    pulseBar();
    if (selected.length < 10) lasagnaWarned = false;
    if (!ingredient) return;

    // Taking the pineapple off earns visible relief — while he still cares.
    // Once he's resigned (3+ protests), he no longer reacts to anything.
    if (slug === 'ananas' && pineappleProtests() <= 2) {
      showToast(T.builder.pineappleRemovedToast);
      announce(T.builder.pineappleRemovedAnnounce(T.euroSpoken(priceAfter(selected))));
      return;
    }
    announce(
      T.builder.ingredientRemoved(T.ingredients[slug], T.euroSpoken(priceAfter(selected))),
    );
  }

  function toggle(slug: string) {
    if (selected.includes(slug)) {
      removeIngredient(slug);
    } else {
      addIngredient(slug);
    }
  }

  /* Drag-and-drop is a pointer-only enhancement; tap/click and keyboard
     toggling on the tray buttons remain the primary interaction. */
  let dropHover = $state(false);

  function handleDragStart(event: DragEvent, slug: string) {
    event.dataTransfer?.setData('text/plain', slug);
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'copy';
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    dropHover = false;
    const slug = event.dataTransfer?.getData('text/plain');
    if (slug && ingredientBySlug.has(slug)) addIngredient(slug);
  }

  function handleAddToOrder() {
    if (selected.length === 0) {
      showToast(T.builder.justBreadToast);
      announce(T.builder.justBreadAnnounce);
    }
    addToCart(pizzaName, selected, size);
  }

  function startOver() {
    selected = [];
    lasagnaWarned = false;
    announce(T.builder.cleared);
  }

  /* Removing via a picked-chip destroys the focused element — re-anchor
     keyboard focus on that ingredient's tray toggle instead of <body>. */
  function removeFromChip(slug: string) {
    removeIngredient(slug);
    tick().then(() =>
      document.querySelector<HTMLButtonElement>(`.tray-button[data-slug="${slug}"]`)?.focus(),
    );
  }

  /* Tiny "thud" on the placemat when a topping lands (motion-safe) */
  function pulseCanvas() {
    if (!placematEl || prefersReducedMotion()) return;
    placematEl.classList.remove('thud');
    void placematEl.offsetWidth; // restart the animation
    placematEl.classList.add('thud');
  }

  /* Same trick on the order bar: with the pizza scrolled far off-screen,
     the bar's preview + price bump is the only visible "it landed" cue */
  function pulseBar() {
    if (!orderBarEl || prefersReducedMotion()) return;
    orderBarEl.classList.remove('bump');
    void orderBarEl.offsetWidth;
    orderBarEl.classList.add('bump');
  }

  /* Tapping the bar's mini pizza jumps back to the real one; the global
     scroll-behavior and scroll-padding-top handle smoothness + nav offset */
  function scrollToPizza() {
    placematEl?.scrollIntoView();
  }

  /* "Giovanni's choice": clears the pizza and deals 3–5 random toppings one
     by one so the layers rain in sequence. Never pineapple — he'd never. */
  let surpriseBusy = $state(false);

  function surprise() {
    if (surpriseBusy) return;
    surpriseBusy = true;
    const pool = ingredients.filter((i) => i.slug !== 'ananas').map((i) => i.slug);
    const count = 3 + Math.floor(Math.random() * 3);
    const picks = [...pool].sort(() => Math.random() - 0.5).slice(0, count);
    const step = prefersReducedMotion() ? 0 : 280;

    selected = [];
    lasagnaWarned = false;
    announce(T.builder.choosing);
    picks.forEach((slug, i) => {
      setTimeout(() => {
        selected = [...selected, slug];
        pulseCanvas();
        if (i === picks.length - 1) {
          surpriseBusy = false;
          announce(
            T.builder.chosen(recipeSummary(selected), T.euroSpoken(priceAfter(selected))),
          );
          showToast(T.builder.fidatiToast);
        }
      }, 150 + i * step);
    });
  }

  function tagNote(ingredient: Ingredient): string {
    const notes: string[] = [];
    if (ingredient.tags.includes('vegan')) notes.push(T.builder.vegan);
    if (ingredient.tags.includes('spicy')) notes.push(T.builder.spicy);
    return notes.length ? ` (${notes.join(', ')})` : '';
  }
</script>

<section id="builder" class="section builder" aria-labelledby="builder-heading" tabindex="-1">
  <div class="container">
    <span class="section-kicker">{T.builder.kicker}</span>
    <h2 id="builder-heading">{T.builder.heading}</h2>
    <p class="builder-intro">{T.builder.intro}</p>

    <div class="builder-grid">
      <div class="canvas-column">
        <div class="placemat" bind:this={placematEl}>
          <div
            class="canvas"
            class:drop-hover={dropHover}
            role="img"
            aria-label={canvasLabel}
            ondragover={(e) => {
              e.preventDefault();
              dropHover = true;
            }}
            ondragleave={() => (dropHover = false)}
            ondrop={handleDrop}
          >
            <img class="layer" src={BASE_LAYER_SRC} alt="" width="512" height="512" loading="lazy" />
            {#each layers as layer (layer.slug)}
              <ToppingLayer ingredient={layer} />
            {/each}
          </div>
        </div>

        <fieldset class="size-picker">
          <legend>{T.builder.sizeLegend}</legend>
          <div class="size-options">
            {#each sizes as option (option.id)}
              <label class="size-option">
                <input type="radio" name="pizza-size" value={option.id} bind:group={size} />
                <span class="size-chip">
                  <strong>{option.id}</strong>
                  <span class="size-detail">{option.cm} cm</span>
                </span>
              </label>
            {/each}
          </div>
        </fieldset>

        <div class="builder-summary" bind:this={summaryEl}>
          <p class="builder-name">
            <span>{pizzaName}</span>
            <span class="builder-dots" aria-hidden="true"></span>
            <span class="builder-price">{euro(price)}</span>
          </p>

          {#if layers.length > 0}
            <ul class="picked" role="list" aria-label={T.builder.pickedLabel}>
              {#each layers as ingredient (ingredient.slug)}
                <li>
                  <button
                    type="button"
                    class="picked-chip"
                    onclick={() => removeFromChip(ingredient.slug)}
                    transition:scale={{ duration: prefersReducedMotion() ? 0 : 180, start: 0.7 }}
                  >
                    <img src={ingredient.iconSrc} alt="" width="20" height="20" />
                    {T.ingredients[ingredient.slug]}
                    <span class="picked-x" aria-hidden="true">×</span>
                    <span class="sr-only">{T.builder.removeSr}</span>
                  </button>
                </li>
              {/each}
            </ul>
          {/if}

          <div class="builder-actions">
            <button type="button" class="btn btn-primary" onclick={handleAddToOrder}>
              {T.builder.addToOrder}
            </button>
            <button
              type="button"
              class="btn btn-secondary"
              onclick={surprise}
              disabled={surpriseBusy}
            >
              {T.builder.surprise}
            </button>
            <button
              type="button"
              class="btn btn-secondary"
              onclick={startOver}
              disabled={selected.length === 0}
            >
              {T.builder.startOver}
            </button>
          </div>
        </div>
      </div>

      <div class="tray" aria-label={T.builder.trayLabel}>
        {#each groupOrder as group (group)}
          <div class="tray-group">
            <h3 class="tray-heading">{T.groups[group]}</h3>
            <ul class="tray-list" role="list">
              {#each ingredients.filter((i) => i.group === group) as ingredient (ingredient.slug)}
                {@const active = selected.includes(ingredient.slug)}
                <li>
                  <button
                    type="button"
                    class="tray-button"
                    data-slug={ingredient.slug}
                    aria-pressed={active}
                    draggable="true"
                    ondragstart={(e) => handleDragStart(e, ingredient.slug)}
                    onclick={() => toggle(ingredient.slug)}
                  >
                    <span class="tray-icon" aria-hidden="true">
                      <img src={ingredient.iconSrc} alt="" width="34" height="34" loading="lazy" />
                      {#if active}
                        <span class="tray-icon-check">✓</span>
                      {/if}
                    </span>
                    <span class="tray-name">
                      {T.ingredients[ingredient.slug]}
                      {#if ingredient.tags.includes('spicy')}
                        <svg class="tag-glyph" viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><path d="M11 2 Q13 2 13 4 Q13 5 12 5.5 Q13 10 8 13 Q3 15 2 11 Q6 12 8 9 Q10 6.5 10 5.5 Q9 5 9 4 Q9 2 11 2 Z" fill="#a82f16"/></svg>
                      {/if}
                      {#if ingredient.tags.includes('vegan')}
                        <svg class="tag-glyph" viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><path d="M13 3 Q13 11 6 13 Q3 13 3 10 Q3 5 13 3 Z M6 13 Q8 8 12 5" fill="#3a5a2e" stroke="#f6eedf" stroke-width="0.8"/></svg>
                      {/if}
                      <span class="sr-only">{tagNote(ingredient)}</span>
                    </span>
                    <span class="tray-price">+{euro(ingredient.price)}</span>
                  </button>
                </li>
              {/each}
            </ul>
          </div>
        {/each}
      </div>
    </div>

    <!-- Mobile order bar: fixed to the viewport bottom anywhere on the page
         once the pizza has toppings; hides only while the in-flow price
         block is on screen -->
    <div
      class="order-bar"
      class:order-bar-hidden={summaryVisible || selected.length === 0}
      bind:this={orderBarEl}
    >
      <button type="button" class="order-bar-pizza" onclick={scrollToPizza}>
        <span class="sr-only">{T.builder.scrollBack}</span>
        <img src={BASE_LAYER_SRC} alt="" width="46" height="46" loading="lazy" />
        {#each layers as layer (layer.slug)}
          <img src={layer.layerSrc} alt="" width="46" height="46" loading="lazy" />
        {/each}
      </button>
      <div class="order-bar-info">
        <span class="order-bar-name">{pizzaName}</span>
        <span class="order-bar-meta">{T.builder.orderBarMeta(size, selected.length)}</span>
      </div>
      <span class="order-bar-price">{euro(price)}</span>
      <button type="button" class="btn btn-primary order-bar-add" onclick={handleAddToOrder}>
        {T.builder.add}<span class="sr-only">{T.builder.addSr(pizzaName)}</span>
      </button>
    </div>
  </div>
</section>

{#if giovanniActive}
  <Giovanni variant={giovanniVariant} ondone={() => (giovanniActive = false)} />
{/if}

<style>
  .builder {
    background: var(--paper-deep);
    border-block: var(--border);
  }
  .builder:focus {
    outline: none;
  }

  .builder-intro {
    max-width: 52ch;
    color: var(--ink-soft);
    margin-bottom: var(--space-5);
  }

  .builder-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
    gap: var(--space-5);
    align-items: start;
  }

  /* Red gingham placemat under the work-in-progress pizza */
  .placemat {
    background: var(--gingham);
    border: var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow-hard);
    padding: clamp(1rem, 4vw, 2rem);
  }

  .placemat:global(.thud) {
    animation: placemat-thud 0.3s ease;
  }
  @keyframes placemat-thud {
    40% {
      transform: scale(1.013);
    }
  }

  .canvas {
    position: relative;
    aspect-ratio: 1;
    max-width: 26rem;
    margin-inline: auto;
    border-radius: 50%;
    filter: drop-shadow(6px 8px 0 rgba(33, 26, 18, 0.22));
    transition: transform 0.2s ease;
  }
  .canvas.drop-hover {
    transform: scale(1.03) rotate(1deg);
  }
  @media (prefers-reduced-motion: reduce) {
    .canvas,
    .canvas.drop-hover {
      transition: none;
      transform: none;
    }
  }
  .layer {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .size-picker {
    border: none;
    margin: var(--space-4) 0 0;
    padding: 0;
  }
  .size-picker legend {
    font-family: var(--font-display);
    text-transform: uppercase;
    font-size: var(--text-base);
    letter-spacing: 0.06em;
    color: var(--ink);
    margin-bottom: var(--space-2);
  }
  .size-options {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }
  .size-option input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }
  .size-chip {
    display: inline-flex;
    align-items: baseline;
    gap: 0.5em;
    min-height: 44px;
    padding: 0.45rem 1rem;
    border: var(--border);
    border-radius: var(--radius);
    background: var(--cream);
    box-shadow: var(--shadow-hard-sm);
    cursor: pointer;
  }
  .size-chip strong {
    font-family: var(--font-display);
    font-weight: 400;
    font-size: var(--text-lg);
  }
  .size-detail {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--ink-soft);
  }
  .size-option input:checked + .size-chip {
    background: var(--basil);
    color: var(--cream);
    box-shadow: none;
    transform: translate(2px, 2px);
  }
  .size-option input:checked + .size-chip .size-detail {
    color: var(--paper-deep);
  }
  .size-option input:focus-visible + .size-chip {
    outline: 3px solid var(--tomato);
    outline-offset: 3px;
  }

  .builder-summary {
    margin-top: var(--space-4);
  }
  .builder-name {
    display: flex;
    align-items: baseline;
    gap: 0.6em;
    font-family: var(--font-display);
    text-transform: uppercase;
    font-size: var(--text-xl);
    margin-bottom: var(--space-3);
  }
  .builder-dots {
    flex: 1;
    border-bottom: 3px dotted var(--ink-soft);
    transform: translateY(-0.35em);
    min-width: 1.5rem;
  }
  .builder-price {
    color: var(--tomato-ink);
  }

  .picked {
    list-style: none;
    margin: 0 0 var(--space-3);
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }
  .picked-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.4em;
    min-height: 44px;
    padding: 0.3rem 0.75rem;
    border: var(--border);
    border-radius: 999px;
    background: var(--cream);
    font-family: var(--font-body);
    font-size: var(--text-sm);
    font-weight: 700;
    color: var(--ink);
    cursor: pointer;
  }
  .picked-chip:hover {
    background: var(--paper);
    border-color: var(--tomato);
    color: var(--tomato-ink);
  }
  .picked-x {
    font-size: 1.1em;
    line-height: 1;
    color: var(--tomato-ink);
  }

  .builder-actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .tray-group + .tray-group {
    margin-top: var(--space-4);
  }
  .tray-heading {
    font-size: var(--text-base);
    letter-spacing: 0.06em;
    margin-bottom: var(--space-2);
  }
  .tray-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    /* 16rem floor keeps pressed-state content (icon + name + price) from
       ever clipping — phones get one comfortable column instead of two
       cramped ones */
    grid-template-columns: repeat(auto-fill, minmax(min(16rem, 100%), 1fr));
    gap: var(--space-2);
  }
  .tray-button {
    width: 100%;
    min-height: 52px;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.4rem 0.7rem;
    border: var(--border);
    border-radius: var(--radius);
    background: var(--cream);
    box-shadow: var(--shadow-hard-sm);
    font-family: var(--font-body);
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--ink);
    cursor: grab;
    text-align: left;
    transition: transform 0.12s ease, box-shadow 0.12s ease, background-color 0.12s ease;
  }
  .tray-button:hover {
    background: var(--paper);
  }
  .tray-button[aria-pressed='true'] {
    background: var(--basil);
    color: var(--cream);
    box-shadow: none;
    transform: translate(2px, 2px);
  }
  @media (prefers-reduced-motion: reduce) {
    .tray-button {
      transition: none;
    }
  }

  .tray-icon {
    position: relative;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: var(--paper);
    border: 1.5px solid var(--ink);
  }
  .tray-button[aria-pressed='true'] .tray-icon {
    background: var(--cream);
  }

  /* Selection check rides the icon as a badge — costs no row width, so the
     pressed state can never push the price out of the button */
  .tray-icon-check {
    position: absolute;
    right: -7px;
    bottom: -5px;
    display: grid;
    place-items: center;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--ink);
    color: var(--cream);
    font-size: 0.7rem;
    font-weight: 800;
    line-height: 1;
  }

  .tray-name {
    display: inline-flex;
    align-items: center;
    gap: 0.3em;
    line-height: 1.15;
    flex: 1;
    min-width: 0;
  }

  .tray-price {
    margin-left: auto;
    font-size: var(--text-sm);
    font-weight: 700;
    color: var(--tomato-ink);
    white-space: nowrap;
  }
  .tray-button[aria-pressed='true'] .tray-price {
    color: var(--paper-deep);
  }

  /* ---- Sticky order bar (stacked layout only) ---- */
  .order-bar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 90;
    display: none;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-2) max(var(--space-3), env(safe-area-inset-left)) calc(var(--space-2) + env(safe-area-inset-bottom)) max(var(--space-3), env(safe-area-inset-right));
    background: var(--cream);
    border-top: var(--border);
    box-shadow: 0 -8px 24px rgba(33, 26, 18, 0.16);
    transition: transform 0.25s ease, opacity 0.25s ease, visibility 0.25s;
  }
  .order-bar-hidden {
    visibility: hidden; /* also removes the duplicate button from tab order */
    opacity: 0;
    transform: translateY(110%);
  }
  @media (prefers-reduced-motion: reduce) {
    .order-bar {
      transition: none;
    }
  }

  /* Live mini replica of the canvas: the topping layers are full-canvas
     scatter images, so simply stacking them at 46px reproduces the pizza */
  .order-bar-pizza {
    position: relative;
    flex-shrink: 0;
    width: 46px;
    height: 46px;
    padding: 0;
    border: none;
    background: none;
    border-radius: 50%;
    cursor: pointer;
    filter: drop-shadow(1px 2px 0 rgba(33, 26, 18, 0.25));
  }
  .order-bar-pizza img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
  .order-bar-pizza:focus-visible {
    outline: 3px solid var(--tomato);
    outline-offset: 3px;
  }

  .order-bar:global(.bump) .order-bar-pizza,
  .order-bar:global(.bump) .order-bar-price {
    animation: bar-bump 0.35s ease;
  }
  @keyframes bar-bump {
    40% {
      transform: scale(1.15);
    }
  }

  .order-bar-info {
    display: grid;
    min-width: 0;
    flex: 1;
  }
  .order-bar-name {
    font-family: var(--font-display);
    text-transform: uppercase;
    font-size: var(--text-base);
    line-height: 1.15;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .order-bar-meta {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--ink-soft);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .order-bar-price {
    font-family: var(--font-display);
    font-size: var(--text-lg);
    color: var(--tomato-ink);
    white-space: nowrap;
  }
  .order-bar-add {
    flex-shrink: 0;
  }

  @media (max-width: 56rem) {
    .builder-grid {
      grid-template-columns: 1fr;
    }
    .order-bar {
      display: flex;
    }
  }

  /* Tiny phones: the mini pizza already shows what's on the order, so the
     text summary yields its space to the price and the Add button */
  @media (max-width: 22.5rem) {
    .order-bar {
      gap: var(--space-2);
    }
    .order-bar-info {
      display: none;
    }
    .order-bar-price {
      margin-left: auto;
    }
  }

  /* Two-column layout: pin the pizza + summary beside the scrolling tray */
  @media (min-width: 56.01rem) {
    .canvas-column {
      position: sticky;
      top: calc(var(--nav-height) + var(--space-3));
    }
  }
</style>
