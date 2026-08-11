/**
 * English dictionary — the canonical shape every other locale must match.
 * Strings with runtime values are functions so each language controls its
 * own word order and plural rules.
 */

export const en = {
  langName: 'English',

  meta: {
    title: 'Pizza Mania — wood-fired Neapolitan pizza, built your way',
    description:
      'Neapolitan pizzeria with a build-your-own pizza workshop, five house classics, and a chef with very strong opinions about pineapple.',
  },

  skipLink: 'Skip to content',

  nav: {
    menu: 'Menu',
    builder: 'Builder',
    story: 'Story',
    order: 'Order',
    menuToggle: 'Menu',
    language: 'Language',
    cartCountSr: (n: number) => `, ${n} pizza${n === 1 ? '' : 's'} in order`,
  },

  hero: {
    eyebrow: 'Pizzeria napoletana · Vico della Mozzarella 17',
    beat1: 'Fire.',
    beat2: 'Flour.',
    beat3: 'Amore.',
    sub: "Ninety seconds in a wood-fired oven, a 48-hour dough, and a chef named Giovanni with very strong opinions. Build your own — he'll only interfere a little.",
    cta: 'Build your pizza',
    menuLink: 'or trust the menu ↓',
    ratedSr: 'Rated 4.9 out of 5.',
    proof: '— from 812 Neapolitans with opinions',
    pizzaLabel: 'A margherita pizza with cherry tomatoes and fresh basil, gently steaming',
  },

  menu: {
    kicker: 'Le nostre pizze',
    heading: 'The house five',
    intro: "Five pizzas we will defend with our lives. Add one straight to your order, or hit “Customize” and make it yours — Giovanni is watching, but he can't stop you.",
    pick: "Giovanni's pick ♥",
    pickSr: " — Giovanni's pick",
    ingredientsLine: (names: string) => `Tomato, mozzarella, ${names}`,
    vegetarian: 'Vegetariana',
    spicy: 'Piccante',
    add: 'Add to order',
    addSr: (name: string) => `: ${name}`,
    customize: 'Customize',
    customizeSr: (name: string) => ` ${name} in the builder`,
    descriptions: {
      margherita: 'The queen. San Marzano, fior di latte, basil — nothing to hide behind.',
      diavola: 'Pepperoni and chili flakes. The devil made us do it.',
      'quattro-formaggi': 'Four cheeses in a trench coat, pretending to be one pizza.',
      'prosciutto-e-funghi': 'Ham and mushrooms — the reliable friend who always shows up.',
      capricciosa: 'Ham, artichokes, mushrooms, olives. Capricious? No — decisive.',
    } as Record<string, string>,
  },

  stats: {
    ariaLabel: 'Pizzeria facts',
    items: [
      { value: '450°', label: 'in the wood-fired oven' },
      { value: '90 sec', label: 'from raw to blistered' },
      { value: '48 h', label: 'of dough patience' },
      { value: '15', label: 'toppings, one opinion each' },
    ],
  },

  reviews: {
    kicker: 'Parola di cliente',
    heading: 'Word on the vicolo',
    ratedSr: 'Rated 4.9 out of 5.',
    aggregate: 'from 812 orders that arrived warm.',
    fiveStarsSr: 'Five stars.',
    quotes: [
      {
        quote: 'The margherita made me call my nonna to apologize. For what? Everything.',
        name: 'Lucia R.',
        place: 'Napoli',
      },
      {
        quote:
          'I ordered pineapple. Giovanni allowed it. I felt judged, fed and forgiven — in that order.',
        name: 'Marek D.',
        place: 'Wien',
      },
      {
        quote: '48-hour dough, 90-second bake, gone in 40 seconds. The math checks out.',
        name: 'Sofia T.',
        place: 'Milano',
      },
    ],
  },

  story: {
    kicker: 'La nostra storia',
    heading: 'A love letter to Neapolitan pizza',
    p1: "It starts, like most good things in Naples, with an argument. Flour, water, salt, yeast — four ingredients, and somehow forty opinions about them. Our dough rests for 48 hours because patience is the fifth ingredient nobody writes down. Then it meets a wood-fired oven at 450 degrees for ninety seconds — just long enough for the crust to puff, char and blister into something you'll tear into before it reaches the table. We've seen it happen. We no longer judge.",
    quoteBefore:
      'The recipe survived three generations, two emigrations, and one very heated debate about pineapple the family still calls ',
    quoteEm: 'the incident',
    quoteAfter: '.',
    p2: 'Giovanni, our chef, learned the craft from his grandmother, who learned it from hers, who — according to family legend — once refused to serve a mayor because he asked for ketchup. Every pizza that leaves our oven carries all of that history, plus exactly the toppings you asked for. Even the pineapple. Giovanni just needs a moment first.',
  },

  footer: {
    tag: 'Wood-fired since forever. Pineapple-tolerant since 2024.',
    hoursHeading: 'Hours',
    hoursLines: [
      'Tue–Sun: 12:00–15:00, 18:00–23:30',
      'Monday: closed (dough is resting, so is Giovanni)',
    ],
    findHeading: 'Find us',
    followHeading: 'Follow',
    fine: '© 2026 Pizza Mania. A fictional pizzeria for the dev.to Perfect Landing challenge. No pizzas were harmed.',
  },

  ingredients: {
    pepperoni: 'Pepperoni',
    prosciutto: 'Prosciutto cotto',
    salsiccia: 'Salsiccia',
    funghi: 'Mushrooms',
    cipolla: 'Red onion',
    olive: 'Black olives',
    carciofi: 'Artichokes',
    pomodorini: 'Cherry tomatoes',
    peperoni: 'Bell peppers',
    basilico: 'Fresh basil',
    mozzarella: 'Extra mozzarella',
    gorgonzola: 'Gorgonzola',
    parmigiano: 'Parmigiano',
    peperoncino: 'Chili flakes',
    ananas: 'Pineapple',
  } as Record<string, string>,

  groups: {
    meat: 'Meats',
    veg: 'Vegetables',
    cheese: 'Cheeses',
    extra: 'Extras',
  } as Record<string, string>,

  sizes: {
    S: 'Small',
    M: 'Medium',
    L: 'Large',
  } as Record<string, string>,

  recipeEmpty: 'Just crust, sauce and cheese',
  customPizza: 'Pizza su misura',

  euroSpoken: (cents: number) => {
    const whole = Math.floor(cents / 100);
    const rest = cents % 100;
    return rest === 0 ? `${whole} euro` : `${whole} euro ${rest}`;
  },

  builder: {
    kicker: 'Fai da te',
    heading: 'Build your own',
    intro: "Tap an ingredient to add it, tap again to take it off — or drag it onto the pizza if you're feeling theatrical. Giovanni reserves the right to comment.",
    sizeLegend: 'Size',
    trayLabel: 'Ingredients',
    pickedLabel: 'Toppings on your pizza — activate to remove',
    removeSr: ' — remove',
    addToOrder: 'Add to order',
    surprise: "Giovanni's choice",
    startOver: 'Start over',
    scrollBack: 'Scroll back to your pizza',
    orderBarMeta: (size: string, n: number) => `${size} · ${n} topping${n === 1 ? '' : 's'}`,
    add: 'Add',
    addSr: (name: string) => ` ${name} to order`,
    vegan: 'vegan',
    spicy: 'spicy',
    canvasLabel: (summary: string, price: string) =>
      `Your pizza so far: ${summary}. Current price ${price}.`,
    presetLoaded: (name: string, summary: string) =>
      `${name} loaded into the builder. ${summary}.`,
    pineappleToast: '“Mamma mia! No ananas on pizza!” …Va bene. Giovanni allows it. Reluctantly.',
    pineappleAnnounce: 'Chef Giovanni protests the pineapple, sighs dramatically, and allows it.',
    pineappleToastAgain: '“Ancora?! The pineapple again?!” …Giovanni saw nothing.',
    pineappleAnnounceAgain: 'Chef Giovanni protests again, then pretends he saw nothing.',
    pineappleToastResigned: 'Giovanni stares into the wood-fired oven, saying nothing.',
    pineappleAnnounceResigned: 'Giovanni has run out of protests. The pineapple goes on.',
    pineappleRemovedToast: '“Grazie.” — Giovanni, visibly relieved',
    pineappleRemovedAnnounce: (price: string) =>
      `Pineapple removed. Giovanni exhales. Pizza price ${price}.`,
    ingredientAdded: (name: string, price: string) => `${name} added. Pizza price ${price}.`,
    ingredientRemoved: (name: string, price: string) => `${name} removed. Pizza price ${price}.`,
    lasagnaToast: '“This is not pizza anymore, this is lasagna!” — Giovanni, resigned',
    lasagnaAnnounce: 'Giovanni says: this is not pizza anymore, this is lasagna. Still allowed.',
    justBreadToast: 'Just bread? …I respect it.',
    justBreadAnnounce: 'Ordering a plain pizza. Giovanni says: just bread? I respect it.',
    cleared: 'Builder cleared. Back to a plain base.',
    choosing: 'Giovanni is choosing toppings…',
    chosen: (summary: string, price: string) =>
      `Giovanni's choice: ${summary}. Pizza price ${price}.`,
    fidatiToast: '“Fidati.” (Trust me.) — Giovanni, choosing for you',
  },

  giovanni: {
    strong: 'Mamma mia!',
    line1: ' No ananas on pizza!',
    line2: '…va bene, va bene. This one time.',
    againStrong: 'Ancora?!',
    againLine1: ' The pineapple AGAIN?!',
    againLine2: '…va bene. VA BENE. Giovanni saw nothing.',
  },

  cart: {
    title: 'Your order',
    checkoutTitle: 'Checkout',
    successTitle: 'Grazie mille!',
    close: 'Close order panel',
    emptyLead: 'Your order is empty.',
    emptyBody: "The oven is hot, the chef is pacing. Don't leave them hanging.",
    browse: 'Browse the menu',
    qty: 'Quantity',
    decrease: (name: string) => `Decrease quantity of ${name}`,
    increase: (name: string) => `Increase quantity of ${name}`,
    inOrder: (n: number) => `${n} in order`,
    remove: 'Remove',
    removeSr: (name: string) => ` ${name} from order`,
    subtotal: 'Subtotal',
    delivery: 'Delivery',
    free: 'Free',
    total: 'Total',
    nudge: (amount: string) => `Add ${amount} more and delivery is on the house.`,
    goCheckout: 'Go to checkout',
    pizzasCount: (n: number) => `${n} pizza${n === 1 ? '' : 's'}`,
    note: 'Cash on delivery, smiles included. Vespa ETA: 30–45 minutes.',
    nameLabel: 'Your name',
    phoneLabel: 'Phone',
    countryLabel: 'Country',
    streetLabel: 'Street and number',
    cityLabel: 'City',
    placeOrder: 'Place order',
    back: 'Back to order',
    surrender: 'Va bene, va bene…',
    successLead: (name: string) => `Grazie, ${name}!`,
    successBody: (place: string) =>
      `Your pizza is in the (entirely fictional) wood-fired oven. A courier on a Vespa is already arguing with traffic on the way to ${place}. We'll call before ringing. Estimated delivery: one daydream.`,
    successTotal: (total: string) => `Have ${total} ready — cash on delivery.`,
    perfetto: 'Perfetto',
    formError: (msg: string) => `Form error: ${msg}`,
    orderPlaced: (name: string, total: string) =>
      `Order placed for ${name}. Total ${total}. Grazie! Your pizza is in the fictional oven.`,
    errors: {
      name: 'Please tell us your name (at least 2 letters).',
      phone: 'Please add a phone number — the courier calls when the Vespa arrives.',
      street: 'Please give us a street and number — Vespas need directions.',
      city: 'Which city are we riding to?',
    },
    countries: {
      IT: 'Italy',
      AT: 'Austria',
      BE: 'Belgium',
      FR: 'France',
      DE: 'Germany',
      NL: 'Netherlands',
      PT: 'Portugal',
      SI: 'Slovenia',
      ES: 'Spain',
      CH: 'Switzerland',
      UA: 'Ukraine',
    } as Record<string, string>,
    addedToOrder: (name: string, total: string) =>
      `${name} added to order. Order total ${total}.`,
    removedFromOrder: (name: string) => `${name} removed from order.`,
  },
};

export type Dict = typeof en;
