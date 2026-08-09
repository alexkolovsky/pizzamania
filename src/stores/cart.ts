/**
 * Shared order state. Lives outside the Svelte island so the nav badge
 * (a plain <script> in Nav.astro) and the island read the same atoms —
 * Vite bundles this module once, so every consumer shares the instances.
 */
import { atom, computed } from 'nanostores';
import { pizzaById, pizzaPrice, type SizeId } from '../data/pizzas';
import { announce } from '../lib/announce';
import { t } from '../i18n/runtime';

export interface CartItem {
  id: string;
  name: string;
  size: SizeId;
  ingredientSlugs: string[];
  qty: number;
}

export const cartItems = atom<CartItem[]>([]);
export const isCartOpen = atom(false);

/** Set by "Customize" on a menu card; the builder island subscribes. */
export const builderPreset = atom<{ name: string; slugs: string[] } | null>(null);

export const cartCount = computed(cartItems, (items) =>
  items.reduce((n, item) => n + item.qty, 0),
);

export const cartTotal = computed(cartItems, (items) =>
  items.reduce((sum, item) => sum + pizzaPrice(item.ingredientSlugs, item.size) * item.qty, 0),
);

/* Delivery pricing, surfaced from the first cart view onward — no cost
   surprises at checkout. Values in cents. */
export const DELIVERY_FEE = 290;
export const FREE_DELIVERY_MIN = 2500;

export const deliveryFee = computed(cartTotal, (subtotal) =>
  subtotal === 0 || subtotal >= FREE_DELIVERY_MIN ? 0 : DELIVERY_FEE,
);

export const orderTotal = computed([cartTotal, deliveryFee], (subtotal, fee) => subtotal + fee);

let nextId = 1;

export function addToCart(name: string, ingredientSlugs: string[], size: SizeId = 'M'): void {
  const items = cartItems.get();
  // Slugs are stored sorted (layer order comes from config `z`, not array
  // order) so an identical recipe + size always dedupes into a qty bump.
  const slugs = [...ingredientSlugs].sort();
  const match = items.find(
    (item) =>
      item.size === size &&
      item.ingredientSlugs.length === slugs.length &&
      item.ingredientSlugs.every((slug, i) => slug === slugs[i]),
  );
  if (match) {
    cartItems.set(items.map((item) => (item === match ? { ...item, qty: item.qty + 1 } : item)));
  } else {
    cartItems.set([
      ...items,
      { id: `item-${nextId++}`, name, size, ingredientSlugs: slugs, qty: 1 },
    ]);
  }
  announce(t().cart.addedToOrder(name, t().euroSpoken(cartTotal.get())));
}

export function addPizzaToCart(pizzaId: string): void {
  const pizza = pizzaById.get(pizzaId);
  if (pizza) addToCart(pizza.name, pizza.ingredientSlugs);
}

export function setQty(id: string, qty: number): void {
  if (qty < 1) return removeFromCart(id);
  cartItems.set(cartItems.get().map((item) => (item.id === id ? { ...item, qty } : item)));
}

export function removeFromCart(id: string): void {
  const item = cartItems.get().find((i) => i.id === id);
  cartItems.set(cartItems.get().filter((i) => i.id !== id));
  if (item) announce(t().cart.removedFromOrder(item.name));
}

export function clearCart(): void {
  cartItems.set([]);
}

export function cartHasIngredient(slug: string): boolean {
  return cartItems.get().some((item) => item.ingredientSlugs.includes(slug));
}

/** Readable recipe line for a cart item, e.g. "Pepperoni, Chili flakes". */
export function recipeSummary(slugs: string[]): string {
  if (slugs.length === 0) return t().recipeEmpty;
  return slugs.map((slug) => t().ingredients[slug] ?? slug).join(', ');
}
