<script lang="ts">
  import {
    ingredients,
    ingredientBySlug,
    groupLabels,
    groupOrder,
    BASE_LAYER_SRC,
    type Ingredient,
  } from '../../data/ingredients';
  import { pizzas, sizes, pizzaPrice, type SizeId } from '../../data/pizzas';
  import { addToCart, builderPreset, recipeSummary } from '../../stores/cart';
  import { showToast } from '../../stores/toasts';
  import { announce } from '../../lib/announce';
  import { euro, euroSpoken } from '../../lib/format';
  import { prefersReducedMotion } from '../../lib/motion';
  import Giovanni from './Giovanni.svelte';
  import ToppingLayer from './ToppingLayer.svelte';

  import { scale } from 'svelte/transition';
  import { tick } from 'svelte';

  const GIOVANNI_SEEN_KEY = 'pizzamania-giovanni-seen';

  let selected = $state<string[]>([]);
  let placematEl: HTMLDivElement | undefined = $state();
  let size = $state<SizeId>('M');
  let giovanniActive = $state(false);
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
    return match ? match.name : 'Pizza su misura';
  });
  const canvasLabel = $derived(
    `Your pizza so far: ${recipeSummary(selected).toLowerCase()}. Current price ${euroSpoken(price)}.`,
  );

  // "Customize" on a menu card pushes a recipe into this atom
  $effect(() =>
    builderPreset.subscribe((preset) => {
      if (!preset) return;
      selected = [...preset.slugs];
      lasagnaWarned = false;
      announce(`${preset.name} loaded into the builder. ${recipeSummary(selected)}.`);
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

    // Giovanni's pineapple protest — once per session, never blocking:
    // the topping goes on immediately, he just has feelings about it.
    if (slug === 'ananas' && !sessionStorage.getItem(GIOVANNI_SEEN_KEY)) {
      sessionStorage.setItem(GIOVANNI_SEEN_KEY, '1');
      if (prefersReducedMotion()) {
        showToast('“Mamma mia! No ananas on pizza!” …Va bene. Giovanni allows it. Reluctantly.');
      } else {
        giovanniActive = true;
      }
      announce('Chef Giovanni protests the pineapple, sighs dramatically, and allows it.');
    }

    selected = [...selected, slug];
    pulseCanvas();
    announce(`${ingredient.name} added. Pizza price ${euroSpoken(priceAfter(selected))}.`);

    if (selected.length >= 10 && !lasagnaWarned) {
      lasagnaWarned = true;
      showToast('“This is not pizza anymore, this is lasagna!” — Giovanni, resigned');
      announce('Giovanni says: this is not pizza anymore, this is lasagna. Still allowed.');
    }
  }

  function removeIngredient(slug: string) {
    const ingredient = ingredientBySlug.get(slug);
    selected = selected.filter((s) => s !== slug);
    if (selected.length < 10) lasagnaWarned = false;
    if (ingredient) {
      announce(`${ingredient.name} removed. Pizza price ${euroSpoken(priceAfter(selected))}.`);
    }
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
      showToast('Just bread? …I respect it.');
      announce('Ordering a plain pizza. Giovanni says: just bread? I respect it.');
    }
    addToCart(pizzaName, selected, size);
  }

  function startOver() {
    selected = [];
    lasagnaWarned = false;
    announce('Builder cleared. Back to a plain base.');
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
    announce('Giovanni is choosing toppings…');
    picks.forEach((slug, i) => {
      setTimeout(() => {
        selected = [...selected, slug];
        pulseCanvas();
        if (i === picks.length - 1) {
          surpriseBusy = false;
          announce(
            `Giovanni's choice: ${recipeSummary(selected)}. Pizza price ${euroSpoken(priceAfter(selected))}.`,
          );
          showToast('“Fidati.” (Trust me.) — Giovanni, choosing for you');
        }
      }, 150 + i * step);
    });
  }

  function tagNote(ingredient: Ingredient): string {
    const notes: string[] = [];
    if (ingredient.tags.includes('vegan')) notes.push('vegan');
    if (ingredient.tags.includes('spicy')) notes.push('spicy');
    return notes.length ? ` (${notes.join(', ')})` : '';
  }
</script>

<section id="builder" class="section builder" aria-labelledby="builder-heading" tabindex="-1">
  <div class="container">
    <span class="section-kicker">Fai da te</span>
    <h2 id="builder-heading">Build your own</h2>
    <p class="builder-intro">
      Tap an ingredient to add it, tap again to take it off — or drag it onto the pizza if
      you're feeling theatrical. Giovanni reserves the right to comment.
    </p>

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
          <legend>Size</legend>
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

        <div class="builder-summary">
          <p class="builder-name">
            <span>{pizzaName}</span>
            <span class="builder-dots" aria-hidden="true"></span>
            <span class="builder-price">{euro(price)}</span>
          </p>

          {#if layers.length > 0}
            <ul class="picked" role="list" aria-label="Toppings on your pizza — activate to remove">
              {#each layers as ingredient (ingredient.slug)}
                <li>
                  <button
                    type="button"
                    class="picked-chip"
                    onclick={() => removeFromChip(ingredient.slug)}
                    transition:scale={{ duration: prefersReducedMotion() ? 0 : 180, start: 0.7 }}
                  >
                    <img src={ingredient.iconSrc} alt="" width="20" height="20" />
                    {ingredient.name}
                    <span class="picked-x" aria-hidden="true">×</span>
                    <span class="sr-only"> — remove</span>
                  </button>
                </li>
              {/each}
            </ul>
          {/if}

          <div class="builder-actions">
            <button type="button" class="btn btn-primary" onclick={handleAddToOrder}>
              Add to order
            </button>
            <button
              type="button"
              class="btn btn-secondary"
              onclick={surprise}
              disabled={surpriseBusy}
            >
              Giovanni's choice
            </button>
            <button
              type="button"
              class="btn btn-secondary"
              onclick={startOver}
              disabled={selected.length === 0}
            >
              Start over
            </button>
          </div>
        </div>
      </div>

      <div class="tray" aria-label="Ingredients">
        {#each groupOrder as group (group)}
          <div class="tray-group">
            <h3 class="tray-heading">{groupLabels[group]}</h3>
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
                    </span>
                    <span class="tray-name">
                      {ingredient.name}
                      {#if ingredient.tags.includes('spicy')}
                        <svg class="tag-glyph" viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><path d="M11 2 Q13 2 13 4 Q13 5 12 5.5 Q13 10 8 13 Q3 15 2 11 Q6 12 8 9 Q10 6.5 10 5.5 Q9 5 9 4 Q9 2 11 2 Z" fill="#a82f16"/></svg>
                      {/if}
                      {#if ingredient.tags.includes('vegan')}
                        <svg class="tag-glyph" viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><path d="M13 3 Q13 11 6 13 Q3 13 3 10 Q3 5 13 3 Z M6 13 Q8 8 12 5" fill="#3a5a2e" stroke="#f6eedf" stroke-width="0.8"/></svg>
                      {/if}
                      <span class="sr-only">{tagNote(ingredient)}</span>
                    </span>
                    <span class="tray-price">+{euro(ingredient.price)}</span>
                    <span class="tray-check" aria-hidden="true">
                      {#if active}✓{/if}
                    </span>
                  </button>
                </li>
              {/each}
            </ul>
          </div>
        {/each}
      </div>
    </div>
  </div>
</section>

{#if giovanniActive}
  <Giovanni ondone={() => (giovanniActive = false)} />
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
    grid-template-columns: repeat(auto-fill, minmax(min(13.5rem, 100%), 1fr));
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

  .tray-name {
    display: inline-flex;
    align-items: center;
    gap: 0.3em;
    line-height: 1.15;
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

  .tray-check {
    width: 1em;
    font-weight: 800;
  }

  @media (max-width: 56rem) {
    .builder-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
