<script lang="ts">
  import { tick } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import {
    cartItems,
    cartTotal,
    deliveryFee,
    orderTotal,
    FREE_DELIVERY_MIN,
    isCartOpen,
    setQty,
    removeFromCart,
    clearCart,
    cartHasIngredient,
    recipeSummary,
  } from '../../stores/cart';
  import { pizzaPrice, sizeById } from '../../data/pizzas';
  import { euro } from '../../lib/format';
  import { announce } from '../../lib/announce';
  import { focusTrap } from '../../lib/focusTrap';
  import { prefersReducedMotion } from '../../lib/motion';
  import { t } from '../../i18n/runtime';

  // Locale is fixed per page (switching languages navigates), so one
  // snapshot at component init is safe on both server and client.
  const T = t();

  type Stage = 'cart' | 'checkout' | 'success';

  let stage = $state<Stage>('cart');

  /* Countries the fictional Vespa fleet is willing to reach. Italy first
     (home turf), the rest alphabetical. `dial` only feeds the phone
     placeholder — numbers are validated permissively either way.
     Names come from the dictionary so they follow the page language. */
  const countries = [
    { code: 'IT', dial: '+39' },
    { code: 'AT', dial: '+43' },
    { code: 'BE', dial: '+32' },
    { code: 'FR', dial: '+33' },
    { code: 'DE', dial: '+49' },
    { code: 'NL', dial: '+31' },
    { code: 'PT', dial: '+351' },
    { code: 'SI', dial: '+386' },
    { code: 'ES', dial: '+34' },
    { code: 'CH', dial: '+41' },
    { code: 'UA', dial: '+380' },
  ] as const;

  type FieldId = 'name' | 'phone' | 'street' | 'city';

  const blankForm = { name: '', phone: '', country: 'IT', street: '', city: '' };
  let form = $state({ ...blankForm });
  let errors = $state<Partial<Record<FieldId, string>>>({});
  let orderedName = $state('');
  let orderedPlace = $state('');
  let orderedTotal = $state(0);

  let orderButton: HTMLButtonElement | undefined = $state();
  let panelTitle: HTMLHeadingElement | undefined = $state();

  /* Swapping stages replaces the button that was just clicked, which would
     drop keyboard focus to <body>. Re-anchor on the panel heading so the
     new stage is announced and Tab continues from the top of the panel. */
  async function setStage(next: Stage) {
    stage = next;
    await tick();
    panelTitle?.focus();
  }

  const dialHint = $derived(countries.find((c) => c.code === form.country)?.dial ?? '+39');

  /* Delivery details survive reloads so a repeat order is prefilled.
     Guarded: this component also renders during the server build. */
  const DELIVERY_KEY = 'pizzamania-delivery';
  if (typeof localStorage !== 'undefined') {
    try {
      const saved = JSON.parse(localStorage.getItem(DELIVERY_KEY) ?? 'null');
      if (saved && typeof saved === 'object') {
        for (const key of Object.keys(blankForm) as (keyof typeof blankForm)[]) {
          if (typeof saved[key] === 'string') form[key] = saved[key];
        }
        if (!countries.some((c) => c.code === form.country)) form.country = 'IT';
      }
    } catch {
      /* private mode or corrupt JSON — start blank */
    }
  }

  const motionDuration = () => (prefersReducedMotion() ? 0 : 260);

  function close() {
    isCartOpen.set(false);
    // A finished order starts fresh next time; an abandoned checkout keeps its state.
    if (stage === 'success') stage = 'cart';
    dodgeCount = 0;
    showSurrender = false;
  }

  /* ---- The dodging order button ----------------------------------------
     Plays ONLY when: the cart contains pineapple, the pointer is a mouse,
     and motion is allowed. Keyboard focus and Enter/Space are never
     affected — the button only sidesteps hover, and gives up after two
     dodges with a muttered "va bene". */
  let dodgeCount = 0;
  let showSurrender = $state(false);

  function handleOrderPointerEnter(event: PointerEvent) {
    if (event.pointerType !== 'mouse') return;
    if (prefersReducedMotion()) return;
    if (!cartHasIngredient('ananas')) return;
    if (dodgeCount >= 2 || !orderButton) return;

    dodgeCount++;
    // Dodge into the empty space below the action row so the button never
    // overlaps its neighbors while evading.
    const dodge = dodgeCount === 1 ? { x: 26, y: 60 } : { x: 150, y: 72 };
    const target = orderButton;
    import('gsap').then(({ gsap }) => {
      gsap.to(target, { ...dodge, duration: 0.22, ease: 'power2.out' });
      if (dodgeCount >= 2) {
        // Second dodge: slink back and surrender
        gsap.to(target, { x: 0, y: 0, duration: 0.35, ease: 'power2.inOut', delay: 0.5 });
        setTimeout(() => (showSurrender = true), 550);
        setTimeout(() => (showSurrender = false), 3600);
      }
    });
  }

  function validate(): boolean {
    const next: typeof errors = {};
    if (form.name.trim().length < 2) {
      next.name = T.cart.errors.name;
    }
    // Permissive on purpose: spaces, dashes, dots and parens are fine,
    // we only insist on something dialable underneath
    const dialable = form.phone.replace(/[\s\-().]/g, '');
    if (!/^\+?\d{6,15}$/.test(dialable)) {
      next.phone = T.cart.errors.phone;
    }
    if (form.street.trim().length < 4) {
      next.street = T.cart.errors.street;
    }
    if (form.city.trim().length < 2) {
      next.city = T.cart.errors.city;
    }
    errors = next;
    // Focus follows DOM order so the fix-up flow reads top to bottom
    const first = (['name', 'phone', 'street', 'city'] as FieldId[]).find(
      (field) => next[field],
    );
    const errorCount = Object.keys(next).length;
    if (first) {
      document.getElementById(`order-${first}`)?.focus();
      // Focus lands on the first bad field (its error reads via describedby);
      // the live region carries the overall count so the rest aren't a surprise
      announce(
        errorCount > 1 ? T.cart.formErrorCount(errorCount) : T.cart.formError(next[first]!),
      );
      return false;
    }
    return true;
  }

  function submitOrder(event: SubmitEvent) {
    event.preventDefault();
    if (!validate()) return;
    orderedName = form.name.trim();
    orderedPlace = `${form.street.trim()}, ${form.city.trim()}`;
    orderedTotal = $orderTotal;
    void setStage('success');
    announce(T.cart.orderPlaced(orderedName, T.euroSpoken(orderedTotal)));
    clearCart();
    // Details stay in the form (and in storage) so the next order is prefilled
    try {
      localStorage.setItem(DELIVERY_KEY, JSON.stringify({ ...form }));
    } catch {
      /* storage full or blocked — the order still goes through */
    }
  }
</script>

{#if $isCartOpen}
  <!-- Pointer-only dismiss target; keyboard users close via Escape or the
       labelled close button, so the div needs no key handler or role -->
  <div
    class="overlay"
    onclick={close}
    aria-hidden="true"
    transition:fade={{ duration: motionDuration() }}
  ></div>

  <div
    class="panel"
    role="dialog"
    aria-modal="true"
    aria-labelledby="cart-title"
    use:focusTrap={{ onEscape: close, fallbackFocus: '.cart-button' }}
    transition:fly={{ x: 440, duration: motionDuration() }}
  >
    <header class="panel-header">
      <h2 id="cart-title" tabindex="-1" bind:this={panelTitle}>
        {#if stage === 'cart'}{T.cart.title}{:else if stage === 'checkout'}{T.cart.checkoutTitle}{:else}{T.cart.successTitle}{/if}
      </h2>
      <button type="button" class="close-button" onclick={close} aria-label={T.cart.close}>
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
          <path d="M5 5 L19 19 M19 5 L5 19" />
        </svg>
      </button>
    </header>

    {#if stage === 'cart'}
      {#if $cartItems.length === 0}
        <div class="empty">
          <p class="empty-lead">{T.cart.emptyLead}</p>
          <p>{T.cart.emptyBody}</p>
          <button type="button" class="btn btn-primary" onclick={close}>{T.cart.browse}</button>
        </div>
      {:else}
        <ul class="items" role="list">
          {#each $cartItems as item (item.id)}
            <li class="item">
              <div class="item-info">
                <p class="item-name">
                  {item.name}
                  <span class="item-size">{T.sizes[item.size]} · {sizeById.get(item.size)?.cm} cm</span>
                </p>
                <p class="item-recipe">{recipeSummary(item.ingredientSlugs)}</p>
              </div>
              <div class="item-controls">
                <div class="qty" role="group" aria-label={T.cart.qty}>
                  <button
                    type="button"
                    class="qty-button"
                    onclick={() => setQty(item.id, item.qty - 1)}
                    aria-label={T.cart.decrease(item.name)}
                  >−</button>
                  <span class="qty-count" aria-hidden="true">{item.qty}</span>
                  <span class="sr-only">{T.cart.inOrder(item.qty)}</span>
                  <button
                    type="button"
                    class="qty-button"
                    onclick={() => setQty(item.id, item.qty + 1)}
                    aria-label={T.cart.increase(item.name)}
                  >+</button>
                </div>
                <p class="item-price">{euro(pizzaPrice(item.ingredientSlugs, item.size) * item.qty)}</p>
                <button
                  type="button"
                  class="remove-button"
                  onclick={() => removeFromCart(item.id)}
                >
                  {T.cart.remove}<span class="sr-only">{T.cart.removeSr(item.name)}</span>
                </button>
              </div>
            </li>
          {/each}
        </ul>
        <footer class="panel-footer">
          <dl class="summary">
            <div class="summary-row">
              <dt>{T.cart.subtotal}</dt>
              <dd>{euro($cartTotal)}</dd>
            </div>
            <div class="summary-row">
              <dt>{T.cart.delivery}</dt>
              <dd>
                {#if $deliveryFee === 0}<span class="summary-free">{T.cart.free}</span>{:else}{euro($deliveryFee)}{/if}
              </dd>
            </div>
            <div class="summary-row summary-total">
              <dt>{T.cart.total}</dt>
              <dd>{euro($orderTotal)}</dd>
            </div>
          </dl>
          {#if $deliveryFee > 0}
            <p class="free-nudge">{T.cart.nudge(euro(FREE_DELIVERY_MIN - $cartTotal))}</p>
          {/if}
          <button type="button" class="btn btn-primary checkout-button" onclick={() => setStage('checkout')}>
            {T.cart.goCheckout}
          </button>
        </footer>
      {/if}
    {:else if stage === 'checkout'}
      <form class="checkout" onsubmit={submitOrder} novalidate>
        <dl class="summary checkout-summary">
          <div class="summary-row">
            <dt>{T.cart.pizzasCount($cartItems.reduce((n, i) => n + i.qty, 0))}</dt>
            <dd>{euro($cartTotal)}</dd>
          </div>
          <div class="summary-row">
            <dt>{T.cart.delivery}</dt>
            <dd>
              {#if $deliveryFee === 0}<span class="summary-free">{T.cart.free}</span>{:else}{euro($deliveryFee)}{/if}
            </dd>
          </div>
          <div class="summary-row summary-total">
            <dt>{T.cart.total}</dt>
            <dd>{euro($orderTotal)}</dd>
          </div>
        </dl>
        <p class="checkout-note">{T.cart.note}</p>

        <div class="field">
          <label for="order-name">{T.cart.nameLabel}</label>
          <input
            id="order-name"
            type="text"
            autocomplete="name"
            required
            aria-required="true"
            bind:value={form.name}
            aria-invalid={errors.name ? 'true' : undefined}
            aria-describedby={errors.name ? 'order-name-error' : undefined}
            data-autofocus
          />
          {#if errors.name}
            <p class="field-error" id="order-name-error">{errors.name}</p>
          {/if}
        </div>

        <div class="field">
          <label for="order-phone">{T.cart.phoneLabel}</label>
          <input
            id="order-phone"
            type="tel"
            inputmode="tel"
            autocomplete="tel"
            required
            aria-required="true"
            placeholder="{dialHint} 333 123 4567"
            bind:value={form.phone}
            aria-invalid={errors.phone ? 'true' : undefined}
            aria-describedby={errors.phone ? 'order-phone-error' : undefined}
          />
          {#if errors.phone}
            <p class="field-error" id="order-phone-error">{errors.phone}</p>
          {/if}
        </div>

        <div class="field">
          <label for="order-country">{T.cart.countryLabel}</label>
          <select id="order-country" autocomplete="country" bind:value={form.country}>
            {#each countries as country (country.code)}
              <option value={country.code}>{T.cart.countries[country.code]}</option>
            {/each}
          </select>
        </div>

        <div class="field">
          <label for="order-street">{T.cart.streetLabel}</label>
          <input
            id="order-street"
            type="text"
            autocomplete="address-line1"
            required
            aria-required="true"
            bind:value={form.street}
            aria-invalid={errors.street ? 'true' : undefined}
            aria-describedby={errors.street ? 'order-street-error' : undefined}
          />
          {#if errors.street}
            <p class="field-error" id="order-street-error">{errors.street}</p>
          {/if}
        </div>

        <div class="field">
          <label for="order-city">{T.cart.cityLabel}</label>
          <input
            id="order-city"
            type="text"
            autocomplete="address-level2"
            required
            aria-required="true"
            bind:value={form.city}
            aria-invalid={errors.city ? 'true' : undefined}
            aria-describedby={errors.city ? 'order-city-error' : undefined}
          />
          {#if errors.city}
            <p class="field-error" id="order-city-error">{errors.city}</p>
          {/if}
        </div>

        <div class="checkout-actions">
          <div class="dodge-zone">
            {#if showSurrender}
              <span class="surrender" aria-hidden="true">{T.cart.surrender}</span>
            {/if}
            <button
              type="submit"
              class="btn btn-primary"
              bind:this={orderButton}
              onpointerenter={handleOrderPointerEnter}
            >
              {T.cart.placeOrder}
            </button>
          </div>
          <button type="button" class="btn btn-secondary" onclick={() => setStage('cart')}>
            {T.cart.back}
          </button>
        </div>
      </form>
    {:else}
      <div class="success">
        <div class="success-pizza" aria-hidden="true">
          <img src="/pizza/base.svg" alt="" width="160" height="160" />
          <div class="success-steam"><span></span><span></span><span></span></div>
        </div>
        <p class="success-lead">{T.cart.successLead(orderedName)}</p>
        <p>{T.cart.successBody(orderedPlace)}</p>
        <p class="success-total">{T.cart.successTotal(euro(orderedTotal))}</p>
        <button type="button" class="btn btn-primary" onclick={close}>{T.cart.perfetto}</button>
      </div>
    {/if}
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    inset: 0;
    z-index: 120;
    background: rgba(33, 26, 18, 0.55);
  }

  .panel {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 130;
    width: min(28rem, 100%);
    display: flex;
    flex-direction: column;
    background: var(--paper);
    border-left: var(--border);
    padding: var(--space-4);
    padding-bottom: calc(var(--space-4) + env(safe-area-inset-bottom));
    padding-right: calc(var(--space-4) + env(safe-area-inset-right));
    overflow-y: auto;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
    margin-bottom: var(--space-4);
  }
  .panel-header h2 {
    font-size: var(--text-xl);
    margin: 0;
  }

  .close-button {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    border: var(--border);
    border-radius: 50%;
    background: var(--cream);
    color: var(--ink);
    cursor: pointer;
    box-shadow: var(--shadow-hard-sm);
    flex-shrink: 0;
  }
  .close-button:hover {
    background: var(--paper-deep);
  }
  .close-button:active {
    transform: translate(2px, 2px);
    box-shadow: none;
  }

  .empty {
    margin-block: auto;
    text-align: center;
    display: grid;
    gap: var(--space-2);
    justify-items: center;
  }
  .empty-lead {
    font-family: var(--font-display);
    text-transform: uppercase;
    font-size: var(--text-lg);
    margin: 0;
  }

  .items {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: var(--space-3);
  }
  .item {
    background: var(--cream);
    border: var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow-hard-sm);
    padding: var(--space-3);
  }
  .item-name {
    font-family: var(--font-display);
    text-transform: uppercase;
    font-size: var(--text-lg);
    margin-bottom: var(--space-1);
    display: flex;
    flex-wrap: wrap;
    gap: 0.6em;
    align-items: baseline;
  }
  .item-size {
    font-family: var(--font-body);
    font-weight: 600;
    font-size: var(--text-sm);
    text-transform: none;
    color: var(--ink-soft);
  }
  .item-recipe {
    font-family: var(--font-serif);
    font-style: italic;
    font-size: var(--text-base);
    color: var(--ink-soft);
    margin-bottom: var(--space-2);
  }
  .item-controls {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    flex-wrap: wrap;
  }
  .qty {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
  }
  .qty-button {
    width: 44px;
    height: 44px;
    border: var(--border);
    border-radius: var(--radius);
    background: var(--paper);
    font-size: 1.3rem;
    font-weight: 800;
    color: var(--ink);
    cursor: pointer;
  }
  .qty-button:hover {
    background: var(--paper-deep);
  }
  .qty-count {
    min-width: 1.5ch;
    text-align: center;
    font-weight: 800;
  }
  .item-price {
    font-family: var(--font-display);
    font-size: var(--text-lg);
    color: var(--tomato-ink);
    margin: 0 0 0 auto;
  }
  .remove-button {
    border: none;
    background: none;
    color: var(--ink-soft);
    font-family: var(--font-body);
    font-size: var(--text-sm);
    font-weight: 700;
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
    min-height: 44px;
    padding: 0 var(--space-2);
  }
  .remove-button:hover {
    color: var(--tomato-ink);
  }

  .panel-footer {
    margin-top: var(--space-4);
    border-top: var(--border);
    padding-top: var(--space-3);
  }
  /* Order summary: trattoria-menu rows with dotted leaders. Used on both
     the cart footer and the checkout, so no cost is a surprise later. */
  .summary {
    display: grid;
    gap: 0.4rem;
    margin: 0 0 var(--space-3);
  }
  .summary-row {
    display: flex;
    align-items: baseline;
    gap: 0.6em;
    font-weight: 600;
  }
  .summary-row::after {
    content: '';
    flex: 1;
    order: 1;
    border-bottom: 3px dotted var(--ink-soft);
    transform: translateY(-0.25em);
  }
  .summary-row dt {
    font-size: var(--text-base);
  }
  .summary-row dd {
    order: 2;
    margin: 0;
    white-space: nowrap;
  }
  .summary-total {
    font-family: var(--font-display);
    text-transform: uppercase;
    font-weight: 400;
    font-size: var(--text-lg);
  }
  .summary-total dd {
    font-size: var(--text-xl);
    color: var(--tomato-ink);
  }
  .summary-free {
    color: var(--basil);
    text-transform: uppercase;
    font-weight: 800;
    font-size: var(--text-sm);
    letter-spacing: 0.05em;
  }
  .free-nudge {
    margin: calc(-1 * var(--space-2)) 0 var(--space-3);
    font-family: var(--font-serif);
    font-style: italic;
    font-size: var(--text-base);
    color: var(--basil);
  }
  .checkout-summary {
    /* The checkout grid's own gap provides the spacing */
    margin-bottom: 0;
    padding-bottom: var(--space-2);
    border-bottom: var(--border);
  }
  .success-total {
    font-weight: 700;
    color: var(--tomato-ink);
    margin: 0;
  }
  .checkout-button {
    width: 100%;
  }

  .checkout {
    display: grid;
    gap: var(--space-3);
  }
  .checkout-note {
    font-family: var(--font-serif);
    font-style: italic;
    font-size: var(--text-lg);
    color: var(--ink-soft);
    margin: 0;
  }
  .field {
    display: grid;
    gap: var(--space-1);
  }
  .field label {
    font-weight: 700;
    text-transform: uppercase;
    font-size: var(--text-sm);
    letter-spacing: 0.05em;
  }
  .field input,
  .field select {
    /* Kill the ~26ch intrinsic width — on narrow panels the auto grid
       track would otherwise size to it and overflow the panel */
    width: 100%;
    min-width: 0;
    min-height: 48px;
    padding: 0 var(--space-3);
    border: var(--border);
    border-radius: var(--radius);
    background: var(--cream);
    font-family: var(--font-body);
    font-size: var(--text-base);
    color: var(--ink);
  }
  .field input::placeholder {
    /* opacity would composite below 4.5:1 on cream — keep the full token */
    color: var(--ink-soft);
    opacity: 1;
  }
  .field select {
    appearance: none;
    cursor: pointer;
    /* Hand-drawn-ish chevron, inked to match the border color */
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 14 9'%3E%3Cpath d='M1.5 1.5 L7 7 L12.5 1.5' fill='none' stroke='%23211a12' stroke-width='2.5' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right var(--space-3) center;
    background-size: 14px 9px;
    padding-right: calc(var(--space-3) * 2 + 14px);
  }
  .field input:focus-visible,
  .field select:focus-visible {
    outline: 3px solid var(--tomato);
    outline-offset: 2px;
  }
  .field input[aria-invalid='true'] {
    border-color: var(--tomato);
    background: var(--paper-error);
  }
  .field-error {
    margin: 0;
    font-size: var(--text-sm);
    font-weight: 700;
    color: var(--tomato-ink);
  }

  .checkout-actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    align-items: center;
  }
  .dodge-zone {
    position: relative;
  }
  .surrender {
    position: absolute;
    bottom: calc(100% + 6px);
    left: 50%;
    transform: translateX(-50%);
    white-space: nowrap;
    background: var(--ink);
    color: var(--cream);
    font-family: var(--font-serif);
    font-style: italic;
    font-size: var(--text-base);
    padding: 0.3rem 0.8rem;
    border-radius: 999px;
  }

  .success {
    margin-block: auto;
    text-align: center;
    display: grid;
    gap: var(--space-2);
    justify-items: center;
  }
  .success-pizza {
    position: relative;
  }
  .success-lead {
    font-family: var(--font-display);
    text-transform: uppercase;
    font-size: var(--text-xl);
    margin: 0;
    color: var(--basil);
  }

  @media (prefers-reduced-motion: no-preference) {
    .success-pizza {
      animation: success-settle 0.5s ease;
    }
    @keyframes success-settle {
      from {
        transform: scale(0.85);
        opacity: 0;
      }
    }
    .success-steam span {
      position: absolute;
      left: 50%;
      top: 6px;
      width: 10px;
      height: 30px;
      border-radius: 999px;
      background: linear-gradient(to top, transparent, rgba(87, 73, 58, 0.35));
      animation: success-steam 3s ease-in-out infinite;
      opacity: 0;
    }
    .success-steam span:nth-child(2) {
      left: 38%;
      animation-delay: 1s;
    }
    .success-steam span:nth-child(3) {
      left: 62%;
      animation-delay: 2s;
    }
    @keyframes success-steam {
      0% {
        opacity: 0;
        transform: translateY(6px);
      }
      35% {
        opacity: 1;
      }
      100% {
        opacity: 0;
        transform: translateY(-34px);
      }
    }
  }
</style>
