<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import {
    cartItems,
    cartTotal,
    isCartOpen,
    setQty,
    removeFromCart,
    clearCart,
    cartHasIngredient,
    recipeSummary,
  } from '../../stores/cart';
  import { pizzaPrice, sizeById } from '../../data/pizzas';
  import { euro, euroSpoken } from '../../lib/format';
  import { announce } from '../../lib/announce';
  import { focusTrap } from '../../lib/focusTrap';
  import { prefersReducedMotion } from '../../lib/motion';

  type Stage = 'cart' | 'checkout' | 'success';

  let stage = $state<Stage>('cart');
  let customerName = $state('');
  let customerAddress = $state('');
  let nameError = $state('');
  let addressError = $state('');
  let orderedName = $state('');

  let nameInput: HTMLInputElement | undefined = $state();
  let addressInput: HTMLInputElement | undefined = $state();
  let orderButton: HTMLButtonElement | undefined = $state();

  const motionDuration = () => (prefersReducedMotion() ? 0 : 260);

  function close() {
    isCartOpen.set(false);
    // A finished order starts fresh next time; an abandoned checkout keeps its state.
    if (stage === 'success') stage = 'cart';
    dodgeCount = 0;
    showSurrender = false;
  }

  function itemPrice(slugs: string[], size: Parameters<typeof pizzaPrice>[1]): number {
    return pizzaPrice(slugs, size);
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
    nameError = customerName.trim().length >= 2 ? '' : 'Please tell us your name (at least 2 letters).';
    addressError =
      customerAddress.trim().length >= 8
        ? ''
        : 'Please give us a full address — Vespas need directions.';
    if (nameError) {
      nameInput?.focus();
      announce(`Form error: ${nameError}`);
      return false;
    }
    if (addressError) {
      addressInput?.focus();
      announce(`Form error: ${addressError}`);
      return false;
    }
    return true;
  }

  function submitOrder(event: SubmitEvent) {
    event.preventDefault();
    if (!validate()) return;
    orderedName = customerName.trim();
    stage = 'success';
    announce(
      `Order placed for ${orderedName}. Total ${euroSpoken($cartTotal)}. Grazie! Your pizza is in the fictional oven.`,
    );
    clearCart();
    customerName = '';
    customerAddress = '';
  }
</script>

{#if $isCartOpen}
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
    use:focusTrap={{ onEscape: close }}
    transition:fly={{ x: 440, duration: motionDuration() }}
  >
    <header class="panel-header">
      <h2 id="cart-title">
        {#if stage === 'cart'}Your order{:else if stage === 'checkout'}Checkout{:else}Grazie mille!{/if}
      </h2>
      <button type="button" class="close-button" onclick={close} aria-label="Close order panel">
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
          <path d="M5 5 L19 19 M19 5 L5 19" />
        </svg>
      </button>
    </header>

    {#if stage === 'cart'}
      {#if $cartItems.length === 0}
        <div class="empty">
          <p class="empty-lead">Your order is empty.</p>
          <p>The oven is hot, the chef is pacing. Don't leave them hanging.</p>
          <button type="button" class="btn btn-primary" onclick={close}>Browse the menu</button>
        </div>
      {:else}
        <ul class="items" role="list">
          {#each $cartItems as item (item.id)}
            <li class="item">
              <div class="item-info">
                <p class="item-name">
                  {item.name}
                  <span class="item-size">{sizeById.get(item.size)?.label} · {sizeById.get(item.size)?.cm} cm</span>
                </p>
                <p class="item-recipe">{recipeSummary(item.ingredientSlugs)}</p>
              </div>
              <div class="item-controls">
                <div class="qty" aria-label="Quantity">
                  <button
                    type="button"
                    class="qty-button"
                    onclick={() => setQty(item.id, item.qty - 1)}
                    aria-label="Decrease quantity of {item.name}"
                  >−</button>
                  <span class="qty-count" aria-hidden="true">{item.qty}</span>
                  <span class="sr-only">{item.qty} in order</span>
                  <button
                    type="button"
                    class="qty-button"
                    onclick={() => setQty(item.id, item.qty + 1)}
                    aria-label="Increase quantity of {item.name}"
                  >+</button>
                </div>
                <p class="item-price">{euro(itemPrice(item.ingredientSlugs, item.size) * item.qty)}</p>
                <button
                  type="button"
                  class="remove-button"
                  onclick={() => removeFromCart(item.id)}
                >
                  Remove<span class="sr-only"> {item.name} from order</span>
                </button>
              </div>
            </li>
          {/each}
        </ul>
        <footer class="panel-footer">
          <p class="total">
            <span>Total</span>
            <strong>{euro($cartTotal)}</strong>
          </p>
          <button type="button" class="btn btn-primary checkout-button" onclick={() => (stage = 'checkout')}>
            Go to checkout
          </button>
        </footer>
      {/if}
    {:else if stage === 'checkout'}
      <form class="checkout" onsubmit={submitOrder} novalidate>
        <p class="checkout-note">
          {$cartItems.reduce((n, i) => n + i.qty, 0)} pizza{$cartItems.reduce((n, i) => n + i.qty, 0) === 1 ? '' : 's'},
          {euro($cartTotal)} — cash on delivery, smiles included.
        </p>

        <div class="field">
          <label for="order-name">Your name</label>
          <input
            id="order-name"
            type="text"
            autocomplete="name"
            bind:value={customerName}
            bind:this={nameInput}
            aria-invalid={nameError ? 'true' : undefined}
            aria-describedby={nameError ? 'order-name-error' : undefined}
            data-autofocus
          />
          {#if nameError}
            <p class="field-error" id="order-name-error">{nameError}</p>
          {/if}
        </div>

        <div class="field">
          <label for="order-address">Delivery address</label>
          <input
            id="order-address"
            type="text"
            autocomplete="street-address"
            bind:value={customerAddress}
            bind:this={addressInput}
            aria-invalid={addressError ? 'true' : undefined}
            aria-describedby={addressError ? 'order-address-error' : undefined}
          />
          {#if addressError}
            <p class="field-error" id="order-address-error">{addressError}</p>
          {/if}
        </div>

        <div class="checkout-actions">
          <div class="dodge-zone">
            {#if showSurrender}
              <span class="surrender" aria-hidden="true">Va bene, va bene…</span>
            {/if}
            <button
              type="submit"
              class="btn btn-primary"
              bind:this={orderButton}
              onpointerenter={handleOrderPointerEnter}
            >
              Place order
            </button>
          </div>
          <button type="button" class="btn btn-secondary" onclick={() => (stage = 'cart')}>
            Back to order
          </button>
        </div>
      </form>
    {:else}
      <div class="success">
        <div class="success-pizza" aria-hidden="true">
          <img src="/pizza/base.svg" alt="" width="160" height="160" />
          <div class="success-steam"><span></span><span></span><span></span></div>
        </div>
        <p class="success-lead">Grazie, {orderedName}!</p>
        <p>
          Your pizza is in the (entirely fictional) wood-fired oven. A courier on a Vespa is
          already arguing with traffic on your behalf. Estimated delivery: one daydream.
        </p>
        <button type="button" class="btn btn-primary" onclick={close}>Perfetto</button>
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
  .total {
    display: flex;
    align-items: baseline;
    gap: 0.6em;
    font-family: var(--font-display);
    text-transform: uppercase;
    font-size: var(--text-lg);
    margin-bottom: var(--space-3);
  }
  .total::after {
    content: '';
    flex: 1;
    order: 1;
    border-bottom: 3px dotted var(--ink-soft);
    transform: translateY(-0.35em);
  }
  .total strong {
    order: 2;
    font-weight: 400;
    font-size: var(--text-xl);
    color: var(--tomato-ink);
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
  .field input {
    min-height: 48px;
    padding: 0 var(--space-3);
    border: var(--border);
    border-radius: var(--radius);
    background: var(--cream);
    font-family: var(--font-body);
    font-size: var(--text-base);
    color: var(--ink);
  }
  .field input:focus-visible {
    outline: 3px solid var(--tomato);
    outline-offset: 2px;
  }
  .field input[aria-invalid='true'] {
    border-color: var(--tomato);
    background: #fdeee9;
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
