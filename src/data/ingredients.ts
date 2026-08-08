/**
 * Single source of truth for every ingredient the builder knows about.
 *
 * `layerSrc` points at a transparent image with the pieces already scattered
 * in position — swap the placeholder SVGs for final PNGs here and nothing
 * else needs to change. `z` controls stacking order on the pizza canvas.
 */

export type IngredientGroup = 'meat' | 'veg' | 'cheese' | 'extra';
export type DietaryTag = 'vegetarian' | 'vegan' | 'spicy' | 'pork';

export interface Ingredient {
  slug: string;
  name: string;
  /** Price in euro cents at size M. */
  price: number;
  group: IngredientGroup;
  /** Stacking order on the canvas; higher sits on top. */
  z: number;
  layerSrc: string;
  /** Small single-piece thumbnail shown in the builder tray. */
  iconSrc: string;
  tags: DietaryTag[];
}

const layer = (slug: string) => `/pizza/toppings/${slug}.svg`;
const icon = (slug: string) => `/pizza/icons/${slug}.svg`;

export const ingredients: Ingredient[] = [
  // Meats
  { slug: 'pepperoni',   name: 'Pepperoni',        price: 180, group: 'meat',   z: 30, layerSrc: layer('pepperoni'), iconSrc: icon('pepperoni'),   tags: ['pork', 'spicy'] },
  { slug: 'prosciutto',  name: 'Prosciutto cotto', price: 200, group: 'meat',   z: 31, layerSrc: layer('prosciutto'), iconSrc: icon('prosciutto'),  tags: ['pork'] },
  { slug: 'salsiccia',   name: 'Salsiccia',        price: 200, group: 'meat',   z: 32, layerSrc: layer('salsiccia'), iconSrc: icon('salsiccia'),   tags: ['pork'] },

  // Vegetables
  { slug: 'funghi',      name: 'Mushrooms',        price: 120, group: 'veg',    z: 40, layerSrc: layer('funghi'), iconSrc: icon('funghi'),      tags: ['vegetarian', 'vegan'] },
  { slug: 'cipolla',     name: 'Red onion',        price: 80,  group: 'veg',    z: 41, layerSrc: layer('cipolla'), iconSrc: icon('cipolla'),     tags: ['vegetarian', 'vegan'] },
  { slug: 'olive',       name: 'Black olives',     price: 100, group: 'veg',    z: 42, layerSrc: layer('olive'), iconSrc: icon('olive'),       tags: ['vegetarian', 'vegan'] },
  { slug: 'carciofi',    name: 'Artichokes',       price: 150, group: 'veg',    z: 43, layerSrc: layer('carciofi'), iconSrc: icon('carciofi'),    tags: ['vegetarian', 'vegan'] },
  { slug: 'pomodorini',  name: 'Cherry tomatoes',  price: 100, group: 'veg',    z: 44, layerSrc: layer('pomodorini'), iconSrc: icon('pomodorini'),  tags: ['vegetarian', 'vegan'] },
  { slug: 'peperoni',    name: 'Bell peppers',     price: 100, group: 'veg',    z: 45, layerSrc: layer('peperoni'), iconSrc: icon('peperoni'),    tags: ['vegetarian', 'vegan'] },
  { slug: 'basilico',    name: 'Fresh basil',      price: 50,  group: 'veg',    z: 60, layerSrc: layer('basilico'), iconSrc: icon('basilico'),    tags: ['vegetarian', 'vegan'] },

  // Cheeses (sit low, just above the base cheese)
  { slug: 'mozzarella',  name: 'Extra mozzarella', price: 120, group: 'cheese', z: 20, layerSrc: layer('mozzarella'), iconSrc: icon('mozzarella'),  tags: ['vegetarian'] },
  { slug: 'gorgonzola',  name: 'Gorgonzola',       price: 150, group: 'cheese', z: 21, layerSrc: layer('gorgonzola'), iconSrc: icon('gorgonzola'),  tags: ['vegetarian'] },
  { slug: 'parmigiano',  name: 'Parmigiano',       price: 130, group: 'cheese', z: 22, layerSrc: layer('parmigiano'), iconSrc: icon('parmigiano'),  tags: ['vegetarian'] },

  // Extras
  { slug: 'peperoncino', name: 'Chili flakes',     price: 40,  group: 'extra',  z: 61, layerSrc: layer('peperoncino'), iconSrc: icon('peperoncino'), tags: ['vegetarian', 'vegan', 'spicy'] },
  { slug: 'ananas',      name: 'Pineapple',        price: 150, group: 'extra',  z: 50, layerSrc: layer('ananas'), iconSrc: icon('ananas'),      tags: ['vegetarian', 'vegan'] },
];

export const ingredientBySlug: ReadonlyMap<string, Ingredient> = new Map(
  ingredients.map((i) => [i.slug, i]),
);

export const groupLabels: Record<IngredientGroup, string> = {
  meat: 'Meats',
  veg: 'Vegetables',
  cheese: 'Cheeses',
  extra: 'Extras',
};

export const groupOrder: IngredientGroup[] = ['meat', 'veg', 'cheese', 'extra'];

/** Base pizza (crust, San Marzano sauce, fior di latte) — price in cents at size M. */
export const BASE_PRICE = 700;
export const BASE_LAYER_SRC = '/pizza/base.svg';
