// Generates placeholder pizza layer SVGs (flat illustrated style) into public/pizza/.
// Deterministic: same output every run. These are stand-ins for final PNG art —
// same canvas (512x512), same alignment, transparent background.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT = process.argv[2] ?? 'public/pizza';
mkdirSync(join(OUT, 'toppings'), { recursive: true });

// mulberry32 — tiny seeded PRNG so layouts are stable across runs
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CX = 256, CY = 256;
const r2 = (n) => Math.round(n * 100) / 100;

// Even scatter: golden-angle spiral + jitter, kept inside maxR
function scatter(n, maxR, rand, minR = 0) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const angle = i * 2.399963 + rand() * 0.9;
    const radius = minR + (maxR - minR) * Math.sqrt((i + 0.6) / n) + (rand() - 0.5) * 20;
    pts.push({
      x: r2(CX + Math.cos(angle) * radius),
      y: r2(CY + Math.sin(angle) * radius),
      rot: r2(rand() * 360),
    });
  }
  return pts;
}

// Wobbly circle path (organic edges for crust, sauce, cheese, blobs)
function blob(cx, cy, baseR, wobble, points, rand) {
  const pts = [];
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2;
    const r = baseR + (rand() - 0.5) * 2 * wobble;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  let d = `M ${r2(pts[0][0])} ${r2(pts[0][1])}`;
  for (let i = 0; i < points; i++) {
    const p1 = pts[i], p2 = pts[(i + 1) % points];
    const mx = (p1[0] + p2[0]) / 2, my = (p1[1] + p2[1]) / 2;
    d += ` Q ${r2(p1[0])} ${r2(p1[1])} ${r2(mx)} ${r2(my)}`;
  }
  return d + ' Z';
}

function svg(title, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="${title}">\n${body}\n</svg>\n`;
}

function write(rel, content) {
  writeFileSync(join(OUT, rel), content);
  console.log('wrote', rel);
}

/* ---------- base: crust + sauce + cheese ---------- */
{
  const rand = rng(7);
  const crustOuter = blob(CX, CY, 246, 6, 26, rand);
  const crustInner = blob(CX, CY, 238, 5, 24, rand);
  const sauce = blob(CX, CY, 205, 5, 22, rand);
  const sauceRim = blob(CX, CY, 199, 5, 20, rand);
  const cheese = blob(CX, CY, 186, 10, 24, rand);

  // Char blisters + flour dust on the crust edge
  let crustDetail = '';
  for (let i = 0; i < 14; i++) {
    const a = rand() * Math.PI * 2;
    const rr = 218 + rand() * 20;
    const dark = rand() < 0.4;
    crustDetail += `<circle cx="${r2(CX + Math.cos(a) * rr)}" cy="${r2(CY + Math.sin(a) * rr)}" r="${r2(3.5 + rand() * 5)}" fill="${dark ? '#a86a2e' : '#c9873f'}" opacity="${dark ? 0.75 : 0.6}"/>\n  `;
  }
  for (let i = 0; i < 6; i++) {
    const a = rand() * Math.PI * 2;
    const rr = 224 + rand() * 12;
    crustDetail += `<circle cx="${r2(CX + Math.cos(a) * rr)}" cy="${r2(CY + Math.sin(a) * rr)}" r="${r2(2 + rand() * 2.5)}" fill="#f2cf95" opacity="0.8"/>\n  `;
  }

  // Melty cheese patches + browned bubble spots
  let cheeseDetail = '';
  const patches = [
    [-46, -38, 62, 11, 11], [66, 44, 48, 9, 9], [-30, 82, 38, 8, 8],
    [58, -62, 34, 7, 8], [-88, 22, 30, 6, 7],
  ];
  for (const [dx, dy, r, w, p] of patches) {
    cheeseDetail += `<path d="${blob(CX + dx, CY + dy, r, w, p, rand)}" fill="#f8e3a4" opacity="0.85"/>\n  `;
  }
  for (let i = 0; i < 10; i++) {
    const a = rand() * Math.PI * 2;
    const rr = rand() * 165;
    cheeseDetail += `<circle cx="${r2(CX + Math.cos(a) * rr)}" cy="${r2(CY + Math.sin(a) * rr)}" r="${r2(2.5 + rand() * 3)}" fill="#e3bd62" opacity="0.7"/>\n  `;
  }

  const body = `
  <path d="${crustOuter}" fill="#d3963f"/>
  <path d="${crustInner}" fill="#e8ad5c"/>
  ${crustDetail}
  <path d="${sauce}" fill="#c6503a"/>
  <path d="${sauceRim}" fill="#d4604a" opacity="0.55"/>
  <path d="${cheese}" fill="#f4d889"/>
  ${cheeseDetail}`;
  write('base.svg', svg('Pizza base with tomato sauce and cheese', body));
}

/* ---------- toppings ---------- */
// Each entry: [slug, seed, count, maxR, pieceFn(x, y, rot, rand) -> svg]
const toppings = [
  ['pepperoni', 11, 12, 148, (x, y, rot, rand) => `
    <g transform="translate(${x} ${y}) rotate(${rot})">
      <circle r="23" fill="#8e2b1d"/>
      <circle r="19.5" fill="#c2452f"/>
      <circle r="14" fill="#d05a40"/>
      ${Array.from({ length: 6 }, () => `<circle cx="${r2((rand() - 0.5) * 26)}" cy="${r2((rand() - 0.5) * 26)}" r="${r2(1.8 + rand() * 1.2)}" fill="#8e2b1d"/>`).join('')}
      <circle cx="${r2((rand() - 0.5) * 16)}" cy="${r2((rand() - 0.5) * 16)}" r="2.4" fill="#e8a08c"/>
      <path d="M -13 -9 A 16 16 0 0 1 9 -13" fill="none" stroke="#e07a5f" stroke-width="3.5" stroke-linecap="round" opacity="0.8"/>
    </g>`],

  ['prosciutto', 23, 9, 142, (x, y, rot) => `
    <g transform="translate(${x} ${y}) rotate(${rot})">
      <path d="M -32 -10 Q -12 -27 10 -17 Q 34 -8 28 10 Q 10 27 -14 18 Q -36 8 -32 -10 Z" fill="#de8f92"/>
      <path d="M -24 -6 Q -6 -18 12 -10 Q 25 -4 20 8 Q 5 18 -11 11 Q -26 4 -24 -6 Z" fill="#f0b3ae"/>
      <path d="M -18 2 Q -2 -8 14 -1 M -14 8 Q 0 1 12 6" fill="none" stroke="#f9dcd4" stroke-width="3" stroke-linecap="round"/>
      <path d="M -32 -10 Q -12 -27 10 -17 Q 34 -8 28 10" fill="none" stroke="#c97377" stroke-width="2.5" stroke-linecap="round" opacity="0.8"/>
    </g>`],

  ['salsiccia', 37, 13, 144, (x, y, rot, rand) => `
    <g transform="translate(${x} ${y}) rotate(${rot})">
      <path d="${blob(0, 0, 13, 3.5, 8, rand)}" fill="#96603a"/>
      <path d="${blob(1.5, -2, 8, 2.2, 7, rand)}" fill="#b07a50"/>
      <circle cx="${r2((rand() - 0.5) * 12)}" cy="${r2((rand() - 0.5) * 12)}" r="2" fill="#7c4e30"/>
      <circle cx="${r2((rand() - 0.5) * 12)}" cy="${r2((rand() - 0.5) * 12)}" r="1.6" fill="#d5a97e"/>
    </g>`],

  ['funghi', 41, 12, 144, (x, y, rot) => `
    <g transform="translate(${x} ${y}) rotate(${rot})">
      <path d="M -20 3 Q -20 -17 0 -17 Q 20 -17 20 3 L 12 3 L 12 -2 Q 12 -8 0 -8 Q -12 -8 -12 -2 L -12 3 Z" fill="#c8a06f" stroke="#7d5f3c" stroke-width="3" stroke-linejoin="round"/>
      <path d="M -16 -3 Q -16 -12 0 -12 Q 16 -12 16 -3" fill="none" stroke="#a9885b" stroke-width="2.5" stroke-linecap="round"/>
      <rect x="-5.5" y="-3" width="11" height="15" rx="4.5" fill="#e6d3ac" stroke="#7d5f3c" stroke-width="3"/>
    </g>`],

  ['cipolla', 43, 11, 140, (x, y, rot, rand) => {
    const broken = rand() < 0.4;
    return `
    <g transform="translate(${x} ${y}) rotate(${rot})">
      <circle r="20" fill="none" stroke="#a4548e" stroke-width="5"${broken ? ' stroke-dasharray="82 44" stroke-linecap="round"' : ''}/>
      <circle r="13" fill="none" stroke="#c77bb2" stroke-width="3.5" opacity="0.9"${broken ? ' stroke-dasharray="52 30" stroke-linecap="round"' : ''}/>
    </g>`;
  }],

  ['olive', 47, 16, 148, (x, y, rot, rand) => `
    <g transform="translate(${x} ${y}) rotate(${rot})">
      <circle r="11" fill="#35332a"/>
      <circle r="4.5" fill="#6b675a"/>
      <circle cx="-3.5" cy="-4" r="2.4" fill="#57544a"/>
      ${rand() < 0.5 ? '<circle cx="4" cy="3" r="1.5" fill="#4a4738"/>' : ''}
    </g>`],

  ['carciofi', 53, 9, 138, (x, y, rot) => `
    <g transform="translate(${x} ${y}) rotate(${rot})">
      <path d="M 0 -24 Q 15 -12 13 6 Q 11 20 0 24 Q -11 20 -13 6 Q -15 -12 0 -24 Z" fill="#7e9e5a"/>
      <path d="M 0 -17 Q 10 -8 9 6 Q 7 15 0 18 Q -7 15 -9 6 Q -10 -8 0 -17 Z" fill="#9bb877"/>
      <path d="M 0 -9 Q 5 -3 4 7 Q 3 12 0 14 Q -3 12 -4 7 Q -5 -3 0 -9 Z" fill="#c9d9a8"/>
      <path d="M 0 -13 L 0 15 M -6 -4 Q -3 4 0 8 M 6 -4 Q 3 4 0 8" fill="none" stroke="#617e42" stroke-width="2.2" stroke-linecap="round"/>
    </g>`],

  ['pomodorini', 59, 12, 144, (x, y, rot) => `
    <g transform="translate(${x} ${y}) rotate(${rot})">
      <circle r="16" fill="#c8402c"/>
      <circle r="12.5" fill="#e2604a"/>
      ${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="${r2(Math.cos((a * Math.PI) / 180) * 7.5)}" cy="${r2(Math.sin((a * Math.PI) / 180) * 7.5)}" rx="2.6" ry="1.6" transform="rotate(${a + 90} ${r2(Math.cos((a * Math.PI) / 180) * 7.5)} ${r2(Math.sin((a * Math.PI) / 180) * 7.5)})" fill="#f4c98e"/>`).join('')}
      <circle r="3.5" fill="#f0907f"/>
    </g>`],

  ['peperoni', 61, 12, 144, (x, y, rot) => `
    <g transform="translate(${x} ${y}) rotate(${rot})">
      <path d="M -26 6 Q -8 -14 26 -6 Q 29 0 25 5 Q -5 -3 -21 13 Q -28 12 -26 6 Z" fill="#e0a63c"/>
      <path d="M -24 8 Q -6 -8 25 0" fill="none" stroke="#c08a28" stroke-width="3" stroke-linecap="round"/>
      <path d="M -18 3 Q -4 -7 16 -3" fill="none" stroke="#f2c76e" stroke-width="2.5" stroke-linecap="round" opacity="0.9"/>
    </g>`],

  ['basilico', 67, 11, 146, (x, y, rot) => `
    <g transform="translate(${x} ${y}) rotate(${rot})">
      <path d="M 0 -21 Q 15 -10 13 6 Q 11 17 0 21 Q -11 17 -13 6 Q -15 -10 0 -21 Z" fill="#3f6b33" stroke="#2c4e22" stroke-width="1.5"/>
      <path d="M 0 -21 Q 15 -10 13 6 Q 11 17 0 21 L 0 -21 Z" fill="#4d7d3e"/>
      <path d="M 0 -14 L 0 16 M 0 -5 Q 7 -7 9.5 -2 M 0 3 Q -7 1 -8.5 6 M 0 -10 Q 4.5 -11 6.5 -8" fill="none" stroke="#6f965c" stroke-width="2" stroke-linecap="round"/>
    </g>`],

  ['mozzarella', 71, 10, 138, (x, y, rot, rand) => `
    <g transform="translate(${x} ${y}) rotate(${rot})">
      <path d="${blob(0, 0, 19, 5, 9, rand)}" fill="#fdf7ea"/>
      <path d="${blob(-3, -3, 9, 2.5, 7, rand)}" fill="#f1e7d2"/>
      <circle cx="5" cy="5" r="2" fill="#e6d9bd" opacity="0.8"/>
    </g>`],

  ['gorgonzola', 73, 12, 142, (x, y, rot, rand) => `
    <g transform="translate(${x} ${y}) rotate(${rot})">
      <path d="${blob(0, 0, 15, 4.5, 8, rand)}" fill="#efe7ce"/>
      <path d="M -6 -4 Q -2 -1 -5 3 M 4 -6 Q 6 -2 3 1 M -1 5 Q 2 7 5 5" fill="none" stroke="#67819b" stroke-width="2.2" stroke-linecap="round"/>
      <circle cx="-4" cy="6" r="1.4" fill="#7b93ab"/>
      <circle cx="7" cy="-1" r="1.2" fill="#67819b"/>
    </g>`],

  ['parmigiano', 79, 13, 144, (x, y, rot) => `
    <g transform="translate(${x} ${y}) rotate(${rot})">
      <path d="M -19 -3 Q 0 -11 19 -4 L 17 4 Q 0 -2 -17 5 Z" fill="#f0d68c" stroke="#d3b566" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M -14 -3 Q 0 -8 15 -3" fill="none" stroke="#f9ecc0" stroke-width="2.5" stroke-linecap="round"/>
    </g>`],

  ['peperoncino', 83, 22, 150, (x, y, rot, rand) => `
    <g transform="translate(${x} ${y}) rotate(${rot})">
      <path d="M ${r2(-4 - rand() * 2)} -4 L ${r2(5 + rand() * 2)} -1 L -3 ${r2(5 + rand())} Z" fill="${rand() < 0.35 ? '#d04a2c' : '#b03222'}"/>
      ${rand() < 0.6 ? `<circle cx="${r2(5 + rand() * 3)}" cy="${r2(3 + rand() * 2)}" r="1.8" fill="#c74836"/>` : ''}
    </g>`],

  ['ananas', 89, 11, 140, (x, y, rot) => `
    <g transform="translate(${x} ${y}) rotate(${rot})">
      <path d="M -15 -13 L 15 -13 Q 17 -13 16 -10 L 11 12 Q 10 14 8 14 L -8 14 Q -10 14 -11 12 L -16 -10 Q -17 -13 -15 -13 Z" fill="#f4c44f" stroke="#c8951f" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M -7 -13 L -4 14 M 7 -13 L 4 14 M -13 -3 L 13 -3" stroke="#dca62c" stroke-width="2.2" opacity="0.9"/>
      <path d="M -10 -9 L -8 -6 M 9 -9 L 7 -6" stroke="#f9df94" stroke-width="2" stroke-linecap="round"/>
    </g>`],
];

for (const [slug, seed, count, maxR, piece] of toppings) {
  const rand = rng(seed);
  const pts = scatter(count, maxR, rand);
  const body = pts.map((p) => piece(p.x, p.y, p.rot, rand)).join('\n');
  write(`toppings/${slug}.svg`, svg(`${slug} layer`, body));
}

/* ---------- chip icons: one piece per ingredient, centered ---------- */
// Used as thumbnails in the builder tray. Same flat style as the layers.
mkdirSync(join(OUT, 'icons'), { recursive: true });
for (const [slug, seed, , , piece] of toppings) {
  const rand = rng(seed + 500);
  let body;
  if (slug === 'peperoncino') {
    // Single flake is too small to read — cluster three
    body = [piece(28, 30, 20, rand), piece(44, 28, 140, rand), piece(36, 46, 260, rand)].join('\n');
  } else {
    body = piece(36, 36, slug === 'peperoni' || slug === 'parmigiano' ? -18 : 0, rand);
  }
  write(
    `icons/${slug}.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72" role="img" aria-label="${slug}">\n${body}\n</svg>\n`,
  );
}
console.log('done');
