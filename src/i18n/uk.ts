import type { Dict } from './en';

/**
 * Ukrainian. Ukrainian nouns have three plural forms (1 піца, 2 піци,
 * 5 піц) — `plural` picks the right one the way Slavic grammar expects.
 * Giovanni keeps his Italian exclamations: he is, after all, Giovanni.
 */
function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

export const uk: Dict = {
  langName: 'Українська',

  meta: {
    title: 'Pizza Mania — неаполітанська піца з дровʼяної печі, зібрана по-твоєму',
    description:
      'Неаполітанська піцерія з конструктором власної піци, пʼятьма фірмовими класиками та шефом, який має дуже тверду думку про ананаси.',
    ogImageAlt:
      'Постер Pizza Mania: піца маргарита поряд зі словами "Fire. Flour. Amore." та оцінкою 4,9 зірки.',
  },

  skipLink: 'Перейти до вмісту',

  nav: {
    mainLabel: 'Головна',
    menu: 'Меню',
    builder: 'Конструктор',
    story: 'Історія',
    order: 'Замовити',
    menuToggle: 'Меню',
    language: 'Мова',
    cartCountSr: (n: number) => `, у замовленні ${n} ${plural(n, 'піца', 'піци', 'піц')}`,
  },

  hero: {
    eyebrow: 'Pizzeria napoletana · Vico della Mozzarella 17',
    beat1: 'Вогонь.',
    beat2: 'Борошно.',
    beat3: 'Amore.',
    sub: 'Девʼяносто секунд у дровʼяній печі, тісто, що визрівало 48 годин, і шеф на імʼя Джованні з дуже твердими поглядами. Збери свою піцу — він втрутиться лише трохи.',
    cta: 'Зібрати свою піцу',
    menuLink: 'або довіритись меню ↓',
    ratedSr: 'Оцінка 4,9 з 5.',
    proof: '— від 812 неаполітанців із власною думкою',
    pizzaLabel: 'Піца маргарита з помідорами чері та свіжим базиліком, що злегка парує',
  },

  menu: {
    kicker: 'Le nostre pizze',
    heading: 'Пʼятірка від закладу',
    intro: 'Пʼять піц, які ми боронитимемо до останнього. Додай одну просто в замовлення або натисни «Налаштувати» і зроби її своєю — Джованні спостерігає, але зупинити тебе не може.',
    pick: 'Вибір Джованні ♥',
    pickSr: ' — вибір Джованні',
    ingredientsLine: (names: string) => `Томати, моцарела, ${names}`,
    vegetarian: 'Вегетаріанська',
    spicy: 'Гостра',
    add: 'Додати в замовлення',
    addSr: (name: string) => `: ${name}`,
    customize: 'Налаштувати',
    customizeSr: (name: string) => ` ${name} у конструкторі`,
    descriptions: {
      margherita: 'Королева. Сан-Марцано, фіор ді латте, базилік — нічого зайвого, ніде сховатися.',
      diavola: 'Пепероні та пластівці чилі. Це диявол нас змусив.',
      'quattro-formaggi': 'Чотири сири в одному плащі, що вдають із себе одну піцу.',
      'prosciutto-e-funghi': 'Шинка та гриби — надійний друг, який завжди поруч.',
      capricciosa: 'Шинка, артишоки, гриби, оливки. Примхлива? Ні — рішуча.',
    },
  },

  stats: {
    ariaLabel: 'Факти про піцерію',
    items: [
      { value: '450°', label: 'у дровʼяній печі' },
      { value: '90 сек', label: 'від сирого тіста до скоринки з димком' },
      { value: '48 год', label: 'терпіння тіста' },
      { value: '15', label: 'інгредієнтів, і в кожного своя думка' },
    ],
  },

  reviews: {
    kicker: 'Parola di cliente',
    heading: 'Що кажуть у провулку',
    ratedSr: 'Оцінка 4,9 з 5.',
    aggregate: 'від 812 замовлень, що доїхали гарячими.',
    starsSr: (stars: number) => `Оцінка ${stars} з 5 зірок.`,
    quotes: [
      {
        quote: 'Я з Неаполя. Ми не хвалимо чужу піцу. Пишу це лише тому, що це правда.',
        name: 'Лючія Р.',
        place: 'Неаполь',
        stars: 5,
      },
      {
        quote:
          'Я замовив ананас. Джованні дозволив. Я відчув осуд, ситість і прощення — саме в такому порядку.',
        name: 'Марек Д.',
        place: 'Відень',
        stars: 5,
      },
      {
        quote: 'Тісто — 48 годин, випікання — 90 секунд, зникла за 40. Математика сходиться.',
        name: 'Софія Т.',
        place: 'Мілан',
        stars: 5,
      },
      {
        quote:
          '«Діавола» доїхала до Києва гарячою і злою — як і обіцяли. Пʼята зірка буде, коли відкриють філію на моїй вулиці.',
        name: 'Оксана К.',
        place: 'Київ',
        stars: 4,
      },
    ],
  },

  story: {
    kicker: 'La nostra storia',
    heading: 'Лист любові неаполітанській піці',
    p1: 'Усе починається, як більшість хороших речей у Неаполі, зі суперечки. Борошно, вода, сіль, дріжджі — чотири інгредієнти і чомусь сорок думок про них. Наше тісто відпочиває 48 годин, бо терпіння — пʼятий інгредієнт, який ніхто не записує. Потім воно зустрічається з дровʼяною піччю на 450 градусів на девʼяносто секунд — рівно стільки, щоб бортик здувся, підпікся і взявся пухирцями, у які ти вчепишся ще до того, як піца доїде до столу. Ми таке бачили. Ми більше не засуджуємо.',
    quoteBefore:
      'Рецепт пережив три покоління, дві еміграції та одну дуже гарячу суперечку про ананас, яку родина досі називає ',
    quoteEm: 'інцидентом',
    quoteAfter: '.',
    p2: 'Джованні, наш шеф, навчився ремесла у своєї бабусі, а та — у своєї, яка, за родинною легендою, одного разу відмовилася обслуговувати мера, бо той попросив кетчуп. Кожна піца з нашої печі несе в собі всю цю історію — плюс рівно ті інгредієнти, які ти обрав. Навіть ананас. Джованні лише потрібна хвилинка.',
  },

  footer: {
    tag: 'На дровах — споконвіку. Терпимі до ананасів — з 2024-го.',
    hoursHeading: 'Години роботи',
    hoursLines: [
      'Вт–Нд: 12:00–15:00, 18:00–23:30',
      'Понеділок: вихідний (тісто відпочиває, Джованні теж)',
    ],
    findHeading: 'Як нас знайти',
    followHeading: 'Стежте за нами',
    fine: '© 2026 Pizza Mania. Вигадана піцерія для челенджу Perfect Landing на dev.to. Жодна піца не постраждала.',
    hire: 'Хочете такий самий сайт? Пишіть на',
  },

  ingredients: {
    pepperoni: 'Пепероні',
    prosciutto: 'Прошуто котто',
    salsiccia: 'Сальсича',
    funghi: 'Гриби',
    cipolla: 'Червона цибуля',
    olive: 'Чорні оливки',
    carciofi: 'Артишоки',
    pomodorini: 'Помідори чері',
    peperoni: 'Солодкий перець',
    basilico: 'Свіжий базилік',
    mozzarella: 'Додаткова моцарела',
    gorgonzola: 'Горгонзола',
    parmigiano: 'Пармезан',
    peperoncino: 'Пластівці чилі',
    ananas: 'Ананас',
  },

  groups: {
    meat: 'Мʼясо',
    veg: 'Овочі',
    cheese: 'Сири',
    extra: 'Додатки',
  },

  sizes: {
    S: 'Мала',
    M: 'Середня',
    L: 'Велика',
  },

  recipeEmpty: 'Лише корж, соус і сир',
  customPizza: 'Піца на свій смак',

  euroSpoken: (cents: number) => {
    const whole = Math.floor(cents / 100);
    const rest = cents % 100;
    return rest === 0 ? `${whole} євро` : `${whole} євро ${rest}`;
  },

  builder: {
    kicker: 'Fai da te',
    heading: 'Збери свою',
    intro: 'Торкнись інгредієнта, щоб додати його, торкнись ще раз, щоб зняти — або перетягни його на піцу, якщо хочеться театральності. Джованні залишає за собою право коментувати.',
    sizeLegend: 'Розмір',
    trayLabel: 'Інгредієнти',
    pickedLabel: 'Інгредієнти на твоїй піці — натисни, щоб прибрати',
    removeSr: ' — прибрати',
    addToOrder: 'Додати в замовлення',
    surprise: 'Вибір Джованні',
    startOver: 'Почати заново',
    scrollBack: 'Повернутися до піци',
    orderBarMeta: (size: string, n: number) =>
      `${size} · ${n} ${plural(n, 'інгредієнт', 'інгредієнти', 'інгредієнтів')}`,
    add: 'Додати',
    addSr: (name: string) => ` ${name} в замовлення`,
    vegan: 'веганський',
    spicy: 'гострий',
    canvasLabel: (summary: string, price: string) =>
      `Твоя піца наразі: ${summary}. Поточна ціна ${price}.`,
    presetLoaded: (name: string, summary: string) =>
      `${name} — завантажено в конструктор. ${summary}.`,
    pineappleToast: '«Mamma mia! Жодних ананасів на піці!» …Va bene. Джованні дозволяє. Неохоче.',
    pineappleAnnounce: 'Шеф Джованні протестує проти ананаса, драматично зітхає і дозволяє.',
    pineappleToastAgain: '«Ancora?! Знову ананас?!» …Джованні нічого не бачив.',
    pineappleAnnounceAgain: 'Шеф Джованні протестує знову, а потім вдає, що нічого не бачив.',
    pineappleToastResigned: 'Джованні мовчки дивиться в дровʼяну піч.',
    pineappleAnnounceResigned: 'У Джованні закінчилися протести. Ананас лягає на піцу.',
    pineappleRemovedToast: '«Grazie.» — Джованні, з помітним полегшенням',
    pineappleRemovedAnnounce: (price: string) =>
      `Ананас прибрано. Джованні полегшено видихає. Ціна піци ${price}.`,
    ingredientAdded: (name: string, price: string) =>
      `Додано: ${name}. Ціна піци ${price}.`,
    ingredientRemoved: (name: string, price: string) =>
      `Прибрано: ${name}. Ціна піци ${price}.`,
    lasagnaToast: '«Це вже не піца, це лазанья!» — Джованні, змирившись',
    lasagnaAnnounce: 'Джованні каже: це вже не піца, це лазанья. Але можна.',
    justBreadToast: 'Просто хліб? …Поважаю.',
    justBreadAnnounce: 'Замовляється піца без нічого. Джованні каже: просто хліб? Поважаю.',
    cleared: 'Конструктор очищено. Знову чиста основа.',
    choosing: 'Джованні обирає інгредієнти…',
    chosen: (summary: string, price: string) =>
      `Вибір Джованні: ${summary}. Ціна піци ${price}.`,
    fidatiToast: '«Fidati.» (Довірся.) — Джованні, обираючи за тебе',
  },

  giovanni: {
    strong: 'Mamma mia!',
    line1: ' Жодних ананасів на піці!',
    line2: '…va bene, va bene. Лише цього разу.',
    againStrong: 'Ancora?!',
    againLine1: ' Знову ананас?!',
    againLine2: '…va bene. VA BENE. Джованні нічого не бачив.',
  },

  cart: {
    title: 'Твоє замовлення',
    checkoutTitle: 'Оформлення',
    successTitle: 'Grazie mille!',
    close: 'Закрити панель замовлення',
    emptyLead: 'Твоє замовлення порожнє.',
    emptyBody: 'Піч гаряча, шеф міряє кроками кухню. Не змушуй їх чекати.',
    browse: 'Переглянути меню',
    qty: 'Кількість',
    decrease: (name: string) => `Зменшити кількість: ${name}`,
    increase: (name: string) => `Збільшити кількість: ${name}`,
    inOrder: (n: number) => `${n} у замовленні`,
    remove: 'Прибрати',
    removeSr: (name: string) => ` ${name} із замовлення`,
    subtotal: 'Разом',
    delivery: 'Доставка',
    free: 'Безкоштовно',
    total: 'Усього',
    nudge: (amount: string) => `Додай ще на ${amount} — і доставка за наш рахунок.`,
    goCheckout: 'Оформити замовлення',
    pizzasCount: (n: number) => `${n} ${plural(n, 'піца', 'піци', 'піц')}`,
    note: 'Оплата готівкою при отриманні, усмішки включені. Vespa приїде за 30–45 хвилин.',
    nameLabel: 'Твоє імʼя',
    phoneLabel: 'Телефон',
    countryLabel: 'Країна',
    streetLabel: 'Вулиця та номер будинку',
    cityLabel: 'Місто',
    placeOrder: 'Замовити',
    back: 'Назад до замовлення',
    surrender: 'Va bene, va bene…',
    successLead: (name: string) => `Grazie, ${name}!`,
    successBody: (place: string) =>
      `Твоя піца вже в (цілком вигаданій) дровʼяній печі. Курʼєр на Vespa вже свариться з заторами дорогою до ${place}. Ми подзвонимо, перш ніж дзвонити у двері. Орієнтовний час доставки: одна мрія.`,
    successTotal: (total: string) => `Приготуй ${total} — оплата готівкою при отриманні.`,
    perfetto: 'Perfetto',
    formError: (msg: string) => `Помилка у формі: ${msg}`,
    formErrorCount: (n: number) => `Полів із помилками: ${n}. Починаємо з першого.`,
    orderPlaced: (name: string, total: string) =>
      `Замовлення для ${name} прийнято. Разом ${total}. Grazie! Твоя піца у вигаданій печі.`,
    errors: {
      name: 'Скажи нам своє імʼя (щонайменше 2 літери).',
      phone: 'Додай номер телефону — курʼєр подзвонить, коли Vespa приїде.',
      street: 'Вкажи вулицю та номер будинку — Vespa потрібні орієнтири.',
      city: 'До якого міста їдемо?',
    },
    countries: {
      IT: 'Італія',
      AT: 'Австрія',
      BE: 'Бельгія',
      FR: 'Франція',
      DE: 'Німеччина',
      NL: 'Нідерланди',
      PT: 'Португалія',
      SI: 'Словенія',
      ES: 'Іспанія',
      CH: 'Швейцарія',
      UA: 'Україна',
    },
    addedToOrder: (name: string, total: string) =>
      `${name} — додано в замовлення. Разом ${total}.`,
    removedFromOrder: (name: string) => `${name} — прибрано із замовлення.`,
  },
};
