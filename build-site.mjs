import fs from 'node:fs/promises';

/* ------------------------------------------------------------------ *
 *  Layered garden dividers.
 *  Five stacked "stage flats" of abstract landform. Back to front, each
 *  layer sits lower, carries broader crests and is a step darker, so the
 *  overlap reads as depth. A section boundary becomes planting rather than
 *  a hard cut.


 *  Geometry is generated from a seeded PRNG so it is varied but stable
 *  across builds.
 * ------------------------------------------------------------------ */

const W = 1440;
const H = 200;
const B = 200; // baseline

const rng = (seed) => {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;  s >>>= 0;
    return s / 4294967296;
  };
};
const n = (v) => Math.round(v * 10) / 10;

/* One layer of landform.
 *
 * The top edge is the sum of a handful of soft bumps. A bump with p = 2 is a
 * round mound; raising p flattens its top, which is how the clipped hedge
 * shapes are made. Summing overlapping bumps gives crests that run into each
 * other rather than a row of separate lumps.
 */
function landform(r, { baseY, bumps, amp, flatShare = 0.25 }) {
  const gs = [];
  for (let i = 0; i < bumps; i++) {
    const flat = r() < flatShare;
    gs.push({
      c: r() * W * 1.25 - W * 0.125,          // let crests run off both edges
      w: (flat ? 105 : 52) + r() * (flat ? 145 : 130),
      h: amp * (0.55 + r() * 0.95),
      p: flat ? 6 : 2,                        // 6 = flat topped, reads as hedge
    });
  }

  const N = 72;
  const pts = [];
  for (let i = 0; i <= N; i++) {
    const x = (i / N) * W;
    let y = baseY;
    for (const g of gs) y -= g.h * Math.exp(-Math.pow(Math.abs((x - g.c) / g.w), g.p));
    pts.push([x, y]);
  }

  // Keep every crest inside the viewBox with a little headroom. Without this
  // the tallest crests ran past the top edge and were cut flat by the section
  // above, which read as a mistake rather than a hill.
  const TOP = 14;
  const minY = Math.min(...pts.map(p => p[1]));
  if (minY < TOP) {
    const k = (baseY - TOP) / (baseY - minY);
    for (const p of pts) p[1] = baseY - (baseY - p[1]) * k;
  }

  let d = `M0 ${B}L0 ${n(pts[0][1])}`;
  for (let i = 0; i < N; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], mx = (x0 + x1) / 2;
    d += `C${n(mx)} ${n(y0)} ${n(mx)} ${n(y1)} ${n(x1)} ${n(y1)}`;
  }
  return d + `L${W} ${B}Z`;
}

/* Five flats, back to front. Each sits lower and carries fewer, broader
 * crests than the one behind it, so the layers overlap the way stage flats do.
 */
function layers(seed, opts) {
  const r = rng(seed);
  const { back, amp, flatShare } = opts;
  const out = [];
  // The flat nearest the viewer is the ground you are standing on: lowest and
  // almost level. Crest height falls away sharply toward the front so the
  // layers behind it stay visible instead of being swallowed.
  const gap = (B - back) / 5.0;
  for (let i = 0; i < 5; i++) {
    const t = i / 4;
    out.push(landform(r, {
      baseY: back + i * gap,
      bumps: 11 - i,
      amp: amp * (1 - t * 0.70),
      flatShare: i === 3 ? Math.min(1, flatShare + 0.3) : flatShare,
    }));
  }
  return out;
}
function divider(id, seed, opts, cls = '') {
  const L = layers(seed, opts);
  return `<div class="divider ${cls}" aria-hidden="true">
<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" focusable="false">
${L.map((d, i) => `<g class="dl dl-${i + 1}"><path d="${d}"/></g>`).join('')}
</svg></div>`;
}

const DIVIDERS = {
  // hero photograph hands down to the chalk below
  A: divider('a', 20240411, { back: 48, amp: 35, flatShare: 0.22 }, 'divider--onphoto'),
  // chalk hands down to the dark band
  B: divider('b', 771203,   { back: 44, amp: 38, flatShare: 0.30 }, 'divider--to-ink'),
  // dark band hands back up to chalk
  C: divider('c', 5540912,  { back: 54, amp: 32, flatShare: 0.18 }, 'divider--to-chalk'),
  // the gallery and the reviews are both dark: a ridge, not a handover
  D: divider('d', 31889,    { back: 40, amp: 41, flatShare: 0.34 }, 'divider--in-ink'),
};

/* ------------------------------------------------------------------ */

const manifest = JSON.parse(await fs.readFile('image-manifest.json', 'utf8'));

// <img> with srcset, sizes, intrinsic dimensions and an inline LQIP
// load: 'lazy' (default) | 'eager' (the hero) | 'low'.
// 'low' is eager but behind the hero, for the regrade panels: they live in a
// transformed strip that sits outside the viewport, where lazy loading either
// never fires or fires too late and leaves a blank panel mid-slide.
function img(name, alt, sizes, { load = 'lazy', cls = '' } = {}) {
  const m = manifest[name];
  if (!m) throw new Error(`no image "${name}"`);
  const srcset = m.sizes.map(w => `i/${name}-${w}.webp ${w}w`).join(', ');
  const fallback = m.sizes[m.sizes.length - 1];
  return `<img${cls ? ` class="${cls}"` : ''} src="i/${name}-${fallback}.webp" srcset="${srcset}" sizes="${sizes}"`
    + ` width="${m.w}" height="${m.h}" alt="${alt}"`
    + ` style="background-image:url(${m.lqip});background-size:cover"`
    + (load === 'eager' ? ` fetchpriority="high" decoding="async"`
     : load === 'low'   ? ` fetchpriority="low" decoding="async"`
     :                    ` loading="lazy" decoding="async"`)
    + `>`;
}

let page = await fs.readFile('page.html', 'utf8');

page = page.replace(/\{\{DIVIDER_([ABCD])\}\}/g, (_, k) => DIVIDERS[k]);
page = page.replace(/\{\{IMG:([a-z-]+)\|([^|]*)\|([^|}]*?)(\|eager|\|low)?\}\}/g,
  (_, name, alt, sizes, flag) => img(name, alt, sizes, { load: flag ? flag.slice(1) : 'lazy' }));
// The LCP preload and the social card, generated from the manifest so they can
// never advertise a tier the image pipeline has stopped producing. Both used to
// be hardcoded, and both went stale when the width ladder changed.
const widest = (name) => `i/${name}-${manifest[name].sizes[manifest[name].sizes.length - 1]}.webp`;

page = page.replace(/\{\{PRELOAD:([a-z-]+)\|([^}]*)\}\}/g, (_, name, sizes) => {
  const srcset = manifest[name].sizes.map(w => `i/${name}-${w}.webp ${w}w`).join(', ');
  return `<link rel="preload" as="image" href="${widest(name)}"`
    + ` imagesrcset="${srcset}" imagesizes="${sizes}" fetchpriority="high">`;
});
page = page.replace(/\{\{WIDEST:([a-z-]+)\}\}/g, (_, name) => widest(name));
page = page.replace(/\{\{LQIP:([a-z-]+)\}\}/g, (_, name) => manifest[name].lqip);

await fs.mkdir('site', { recursive: true });
await fs.writeFile('site/index.html', page);

const bytes = Buffer.byteLength(page);
const left = page.match(/\{\{[^}]+\}\}/g);
if (left) console.warn('UNRESOLVED PLACEHOLDERS:', [...new Set(left)].join(', '));
console.log(`site/index.html  ${(bytes / 1024).toFixed(1)} KB`);
