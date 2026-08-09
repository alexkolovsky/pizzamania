import type { Dict } from './en';

/** Italian — casa nostra. */
export const it: Dict = {
  langName: 'Italiano',

  meta: {
    title: 'Pizza Mania — pizza napoletana cotta a legna, fatta a modo tuo',
    description:
      "Pizzeria napoletana con un laboratorio per comporre la tua pizza, cinque classici della casa e uno chef con opinioni molto decise sull'ananas.",
  },

  skipLink: 'Salta al contenuto',

  nav: {
    menu: 'Menù',
    builder: 'Laboratorio',
    story: 'Storia',
    order: 'Ordina',
    menuToggle: 'Menu',
    language: 'Lingua',
    cartCountSr: (n: number) => `, ${n} ${n === 1 ? 'pizza' : 'pizze'} nell'ordine`,
  },

  hero: {
    eyebrow: 'Pizzeria napoletana · Vico della Mozzarella 17',
    beat1: 'Fuoco.',
    beat2: 'Farina.',
    beat3: 'Amore.',
    sub: "Novanta secondi nel forno a legna, un impasto di 48 ore e uno chef di nome Giovanni con opinioni molto decise. Componi la tua — lui interferirà solo un po'.",
    cta: 'Componi la tua pizza',
    menuLink: 'oppure fidati del menù ↓',
    ratedSr: 'Valutazione 4,9 su 5.',
    proof: '— da 812 napoletani con opinioni',
    pizzaLabel: 'Una pizza margherita con pomodorini e basilico fresco, che fuma dolcemente',
  },

  menu: {
    kicker: 'Le nostre pizze',
    heading: 'Le cinque della casa',
    intro: 'Cinque pizze che difenderemo con la vita. Aggiungine una direttamente all\'ordine, oppure premi «Personalizza» e falla tua — Giovanni osserva, ma non può fermarti.',
    pick: 'La preferita di Giovanni ♥',
    pickSr: ' — la preferita di Giovanni',
    ingredientsLine: (names: string) => `Pomodoro, mozzarella, ${names}`,
    vegetarian: 'Vegetariana',
    spicy: 'Piccante',
    add: "Aggiungi all'ordine",
    addSr: (name: string) => `: ${name}`,
    customize: 'Personalizza',
    customizeSr: (name: string) => ` ${name} nel laboratorio`,
    descriptions: {
      margherita: 'La regina. San Marzano, fior di latte, basilico — niente dietro cui nascondersi.',
      diavola: 'Salame piccante e peperoncino. È stato il diavolo a farcelo fare.',
      'quattro-formaggi': 'Quattro formaggi in trench, che fingono di essere una sola pizza.',
      'prosciutto-e-funghi': "Prosciutto e funghi — l'amico affidabile che c'è sempre.",
      capricciosa: 'Prosciutto, carciofi, funghi, olive. Capricciosa? No — decisa.',
    },
  },

  stats: {
    ariaLabel: 'I numeri della pizzeria',
    items: [
      { value: '450°', label: 'nel forno a legna' },
      { value: '90 sec', label: 'da cruda a maculata' },
      { value: '48 ore', label: "di pazienza dell'impasto" },
      { value: '15', label: "ingredienti, un'opinione ciascuno" },
    ],
  },

  reviews: {
    kicker: 'Parola di cliente',
    heading: 'Voce di vicolo',
    ratedSr: 'Valutazione 4,9 su 5.',
    aggregate: 'da 812 ordini arrivati caldi.',
    fiveStarsSr: 'Cinque stelle.',
    quotes: [
      {
        quote: 'La margherita mi ha fatto chiamare mia nonna per chiederle scusa. Di cosa? Di tutto.',
        name: 'Lucia R.',
        place: 'Napoli',
      },
      {
        quote:
          "Ho ordinato l'ananas. Giovanni l'ha permesso. Mi sono sentito giudicato, sfamato e perdonato — in quest'ordine.",
        name: 'Marek D.',
        place: 'Vienna',
      },
      {
        quote: 'Impasto di 48 ore, cottura di 90 secondi, sparita in 40. I conti tornano.',
        name: 'Sofia T.',
        place: 'Milano',
      },
    ],
  },

  story: {
    kicker: 'La nostra storia',
    heading: "Una lettera d'amore alla pizza napoletana",
    p1: "Comincia, come quasi tutte le cose buone a Napoli, con una discussione. Farina, acqua, sale, lievito — quattro ingredienti e, chissà come, quaranta opinioni al riguardo. Il nostro impasto riposa 48 ore, perché la pazienza è il quinto ingrediente che nessuno scrive. Poi incontra un forno a legna a 450 gradi per novanta secondi — giusto il tempo perché il cornicione si gonfi, si bruciacchi e si copra di bolle in qualcosa che addenterai prima ancora che arrivi al tavolo. L'abbiamo visto succedere. Non giudichiamo più.",
    quoteBefore:
      "La ricetta è sopravvissuta a tre generazioni, due emigrazioni e a un acceso dibattito sull'ananas che la famiglia chiama ancora ",
    quoteEm: "l'incidente",
    quoteAfter: '.',
    p2: 'Giovanni, il nostro chef, ha imparato il mestiere da sua nonna, che lo imparò dalla sua, la quale — secondo la leggenda di famiglia — una volta si rifiutò di servire un sindaco perché aveva chiesto il ketchup. Ogni pizza che esce dal nostro forno porta con sé tutta questa storia, più esattamente gli ingredienti che hai scelto tu. Anche l\'ananas. A Giovanni serve solo un momento.',
  },

  footer: {
    tag: "Cotta a legna da sempre. Tollerante all'ananas dal 2024.",
    hoursHeading: 'Orari',
    hoursLines: [
      'Mar–Dom: 12:00–15:00, 18:00–23:30',
      "Lunedì: chiuso (l'impasto riposa, e anche Giovanni)",
    ],
    findHeading: 'Dove siamo',
    followHeading: 'Seguici',
    fine: '© 2026 Pizza Mania. Una pizzeria immaginaria per la challenge Perfect Landing di dev.to. Nessuna pizza è stata maltrattata.',
  },

  ingredients: {
    pepperoni: 'Salame piccante',
    prosciutto: 'Prosciutto cotto',
    salsiccia: 'Salsiccia',
    funghi: 'Funghi',
    cipolla: 'Cipolla rossa',
    olive: 'Olive nere',
    carciofi: 'Carciofi',
    pomodorini: 'Pomodorini',
    peperoni: 'Peperoni',
    basilico: 'Basilico fresco',
    mozzarella: 'Mozzarella extra',
    gorgonzola: 'Gorgonzola',
    parmigiano: 'Parmigiano',
    peperoncino: 'Peperoncino',
    ananas: 'Ananas',
  },

  groups: {
    meat: 'Carni',
    veg: 'Verdure',
    cheese: 'Formaggi',
    extra: 'Extra',
  },

  sizes: {
    S: 'Piccola',
    M: 'Media',
    L: 'Grande',
  },

  recipeEmpty: 'Solo impasto, salsa e formaggio',
  customPizza: 'Pizza su misura',

  euroSpoken: (cents: number) => {
    const whole = Math.floor(cents / 100);
    const rest = cents % 100;
    return rest === 0 ? `${whole} euro` : `${whole} euro e ${rest}`;
  },

  builder: {
    kicker: 'Fai da te',
    heading: 'Componi la tua',
    intro: 'Tocca un ingrediente per aggiungerlo, tocca di nuovo per toglierlo — o trascinalo sulla pizza, se ti senti teatrale. Giovanni si riserva il diritto di commentare.',
    sizeLegend: 'Formato',
    trayLabel: 'Ingredienti',
    pickedLabel: 'Ingredienti sulla tua pizza — attiva per rimuovere',
    removeSr: ' — rimuovi',
    addToOrder: "Aggiungi all'ordine",
    surprise: 'Scelta di Giovanni',
    startOver: 'Ricomincia',
    scrollBack: 'Torna alla tua pizza',
    orderBarMeta: (size: string, n: number) =>
      `${size} · ${n} ingredient${n === 1 ? 'e' : 'i'}`,
    add: 'Aggiungi',
    addSr: (name: string) => ` ${name} all'ordine`,
    vegan: 'vegano',
    spicy: 'piccante',
    canvasLabel: (summary: string, price: string) =>
      `La tua pizza finora: ${summary}. Prezzo attuale ${price}.`,
    presetLoaded: (name: string, summary: string) =>
      `${name} caricata nel laboratorio. ${summary}.`,
    pineappleToast: '«Mamma mia! Niente ananas sulla pizza!» …Va bene. Giovanni lo permette. Controvoglia.',
    pineappleAnnounce:
      "Lo chef Giovanni protesta contro l'ananas, sospira teatralmente e lo permette.",
    pineappleToastAgain: "«Ancora?! Di nuovo l'ananas?!» …Giovanni non ha visto niente.",
    pineappleAnnounceAgain:
      'Lo chef Giovanni protesta di nuovo, poi finge di non aver visto niente.',
    pineappleToastResigned: 'Giovanni fissa il forno a legna, in silenzio.',
    pineappleAnnounceResigned: "Giovanni ha finito le proteste. L'ananas va sulla pizza.",
    pineappleRemovedToast: '«Grazie.» — Giovanni, visibilmente sollevato',
    pineappleRemovedAnnounce: (price: string) =>
      `Ananas tolto. Giovanni tira un sospiro di sollievo. Prezzo della pizza ${price}.`,
    ingredientAdded: (name: string, price: string) =>
      `Aggiunto: ${name}. Prezzo della pizza ${price}.`,
    ingredientRemoved: (name: string, price: string) =>
      `Tolto: ${name}. Prezzo della pizza ${price}.`,
    lasagnaToast: '«Questa non è più una pizza, è una lasagna!» — Giovanni, rassegnato',
    lasagnaAnnounce:
      'Giovanni dice: questa non è più una pizza, è una lasagna. Comunque permessa.',
    justBreadToast: 'Solo pane? …Lo rispetto.',
    justBreadAnnounce:
      'Stai ordinando una pizza semplice. Giovanni dice: solo pane? Lo rispetto.',
    cleared: 'Laboratorio svuotato. Si riparte dalla base.',
    choosing: 'Giovanni sta scegliendo gli ingredienti…',
    chosen: (summary: string, price: string) =>
      `La scelta di Giovanni: ${summary}. Prezzo della pizza ${price}.`,
    fidatiToast: '«Fidati.» — Giovanni, che sceglie per te',
  },

  giovanni: {
    strong: 'Mamma mia!',
    line1: ' Niente ananas sulla pizza!',
    line2: '…va bene, va bene. Solo per stavolta.',
    againStrong: 'Ancora?!',
    againLine1: " Di nuovo l'ananas?!",
    againLine2: '…va bene. VA BENE. Giovanni non ha visto niente.',
  },

  cart: {
    title: 'Il tuo ordine',
    checkoutTitle: 'Cassa',
    successTitle: 'Grazie mille!',
    close: 'Chiudi il pannello ordine',
    emptyLead: 'Il tuo ordine è vuoto.',
    emptyBody: 'Il forno è caldo, lo chef cammina avanti e indietro. Non lasciarli in sospeso.',
    browse: 'Sfoglia il menù',
    qty: 'Quantità',
    decrease: (name: string) => `Riduci la quantità di ${name}`,
    increase: (name: string) => `Aumenta la quantità di ${name}`,
    inOrder: (n: number) => `${n} nell'ordine`,
    remove: 'Rimuovi',
    removeSr: (name: string) => ` ${name} dall'ordine`,
    subtotal: 'Subtotale',
    delivery: 'Consegna',
    free: 'Gratis',
    total: 'Totale',
    nudge: (amount: string) => `Aggiungi altri ${amount} e la consegna la offriamo noi.`,
    goCheckout: 'Vai alla cassa',
    pizzasCount: (n: number) => `${n} ${n === 1 ? 'pizza' : 'pizze'}`,
    note: 'Pagamento alla consegna, sorrisi inclusi. Vespa in arrivo: 30–45 minuti.',
    nameLabel: 'Il tuo nome',
    phoneLabel: 'Telefono',
    countryLabel: 'Paese',
    streetLabel: 'Via e numero civico',
    cityLabel: 'Città',
    placeOrder: "Invia l'ordine",
    back: "Torna all'ordine",
    surrender: 'Va bene, va bene…',
    successLead: (name: string) => `Grazie, ${name}!`,
    successBody: (place: string) =>
      `La tua pizza è nel forno a legna (del tutto immaginario). Un fattorino in Vespa sta già litigando col traffico verso ${place}. Chiamiamo prima di suonare. Consegna stimata: un sogno a occhi aperti.`,
    successTotal: (total: string) => `Tieni pronti ${total} — pagamento alla consegna.`,
    perfetto: 'Perfetto',
    formError: (msg: string) => `Errore nel modulo: ${msg}`,
    orderPlaced: (name: string, total: string) =>
      `Ordine effettuato per ${name}. Totale ${total}. Grazie! La tua pizza è nel forno immaginario.`,
    errors: {
      name: 'Dicci il tuo nome (almeno 2 lettere).',
      phone: 'Aggiungi un numero di telefono — il fattorino chiama quando la Vespa arriva.',
      street: 'Indicaci via e numero civico — le Vespe hanno bisogno di indicazioni.',
      city: 'In quale città stiamo andando?',
    },
    countries: {
      IT: 'Italia',
      AT: 'Austria',
      BE: 'Belgio',
      FR: 'Francia',
      DE: 'Germania',
      NL: 'Paesi Bassi',
      PT: 'Portogallo',
      SI: 'Slovenia',
      ES: 'Spagna',
      CH: 'Svizzera',
    },
    addedToOrder: (name: string, total: string) =>
      `${name} aggiunta all'ordine. Totale ordine ${total}.`,
    removedFromOrder: (name: string) => `${name} rimossa dall'ordine.`,
  },
};
