/**
 * Shared order state. Lives outside the Svelte island so the nav badge
 * (a plain <script> in Nav.astro) and the island read the same atoms —
 * Vite bundles this module once, so every consumer shares the instances.
 */
import { atom, computed } from 'nanostores';
import { pizzaById, pizzaPrice, type SizeId } from '../data/pizzas';
import { ingredientBySlug } from '../data/ingredients';
import { announce } from '../lib/announce';
import { euroSpoken } from '../lib/format';

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
  announce(`${name} added to order. Order total ${euroSpoken(cartTotal.get())}.`);
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
  if (item) announce(`${item.name} removed from order.`);
}

export function clearCart(): void {
  cartItems.set([]);
}

export function cartHasIngredient(slug: string): boolean {
  return cartItems.get().some((item) => item.ingredientSlugs.includes(slug));
}

/** Readable recipe line for a cart item, e.g. "Pepperoni, Chili flakes". */
export function recipeSummary(slugs: string[]): string {
  if (slugs.length === 0) return 'Just crust, sauce and cheese';
  return slugs
    .map((slug) => ingredientBySlug.get(slug)?.name ?? slug)
    .join(', ');
}
