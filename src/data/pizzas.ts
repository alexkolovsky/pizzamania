/**
 * The five house pizzas. Prices are computed from the ingredient config
 * (base + toppings) so the menu can never drift out of sync with the builder.
 */
import { BASE_PRICE, ingredientBySlug } from './ingredients';

export interface Pizza {
  id: string;
  name: string;
  ingredientSlugs: string[];
}

export const pizzas: Pizza[] = [
  {
    id: 'margherita',
    name: 'Margherita',
    ingredientSlugs: ['basilico', 'pomodorini'],
  },
  {
    id: 'diavola',
    name: 'Diavola',
    ingredientSlugs: ['pepperoni', 'peperoncino'],
  },
  {
    id: 'quattro-formaggi',
    name: 'Quattro Formaggi',
    ingredientSlugs: ['mozzarella', 'gorgonzola', 'parmigiano'],
  },
  {
    id: 'prosciutto-e-funghi',
    name: 'Prosciutto e Funghi',
    ingredientSlugs: ['prosciutto', 'funghi'],
  },
  {
    id: 'capricciosa',
    name: 'Capricciosa',
    ingredientSlugs: ['prosciutto', 'carciofi', 'funghi', 'olive'],
  },
];

export const pizzaById: ReadonlyMap<string, Pizza> = new Map(pizzas.map((p) => [p.id, p]));

export type SizeId = 'S' | 'M' | 'L';

export interface Size {
  id: SizeId;
  /** Diameter, for the size selector copy. */
  cm: number;
  /** Price multiplier applied to base + toppings. */
  multiplier: number;
}

export const sizes: Size[] = [
  { id: 'S', cm: 26, multiplier: 0.8 },
  { id: 'M', cm: 32, multiplier: 1 },
  { id: 'L', cm: 38, multiplier: 1.3 },
];

export const sizeById: ReadonlyMap<SizeId, Size> = new Map(sizes.map((s) => [s.id, s]));

/** Price in cents for a set of toppings at a given size. Rounded to a whole cent. */
export function pizzaPrice(ingredientSlugs: string[], sizeId: SizeId = 'M'): number {
  const toppings = ingredientSlugs.reduce(
    (sum, slug) => sum + (ingredientBySlug.get(slug)?.price ?? 0),
    0,
  );
  const multiplier = sizeById.get(sizeId)?.multiplier ?? 1;
  return Math.round((BASE_PRICE + toppings) * multiplier);
}
