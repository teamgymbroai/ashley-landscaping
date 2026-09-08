import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const ENH = 'photos-enh';
const RAW = 'photos-raw';
const OUT = 'site/i';

// src: which folder. crop: fractions [left, top, right, bottom] to remove.
const PLAN = {
  // hero + regrade (enhanced)
  'hero':      { src: ENH, f: 'p16.jpg' },
  'a-lawn':    { src: ENH, f: 'p15.jpg' },
  'a-seat':    { src: ENH, f: 'p02.jpg' },
  'a-shed':    { src: ENH, f: 'p14.jpg' },
  // regrade befores (untouched originals, deliberately)
  'b-slope':   { src: RAW, f: 'p22.jpg' },
  'b-house':   { src: RAW, f: 'p09.jpg' },
  'b-glass':   { src: RAW, f: 'p06.jpg' },
  'b-clear':   { src: RAW, f: 'p23.jpg' },
  // services (enhanced)
  's-ground':  { src: ENH, f: 'p01.jpg', crop: [0.15, 0, 0, 0.08] },
  's-patio':   { src: ENH, f: 'p28.jpg' },
  's-path':    { src: RAW, f: 'p21.jpg', crop: [0.20, 0, 0, 0.04] },
  's-sleep':   { src: ENH, f: 'p24.jpg', crop: [0, 0, 0, 0.20] },
  's-fence':   { src: ENH, f: 'p31.jpg', crop: [0, 0, 0, 0.22] },
  's-struct':  { src: ENH, f: 'p10.jpg' },
  's-hedge':   { src: RAW, f: 'p12.jpg' },
  // closing strip
  'm-porc':    { src: ENH, f: 'p20.jpg', crop: [0, 0.14, 0.04, 0] },
  'm-circ':    { src: ENH, f: 'p11.jpg', crop: [0, 0.08, 0.08, 0.12] },
  'm-grav':    { src: RAW, f: 'p05.jpg', crop: [0.08, 0, 0.06, 0] },
  // the source has a heavy magenta cast from an old phone camera; corrected
  // here rather than with a generative model, which reproduced it faithfully
  'm-dry':     { src: RAW, f: 'p04.jpg', tone: { mul: [0.94, 1.07, 0.90], off: [6, 4, 2], sat: 0.92, bri: 1.08 } },
};

const WIDTHS = [400, 700, 1000, 1300];

await fs.mkdir(OUT, { recursive: true });
const manifest = {};

for (const [name, spec] of Object.entries(PLAN)) {
  const file = path.join(spec.src, spec.f);
  let img = sharp(file);
  const meta = await img.metadata();

  let W = meta.width, H = meta.height;
  if (spec.crop) {
    const [l, t, r, b] = spec.crop;
    const left = Math.round(W * l);
    const top = Math.round(H * t);
    const width = Math.round(W * (1 - l - r));
    const height = Math.round(H * (1 - t - b));
    img = img.extract({ left, top, width, height });
    W = width; H = height;
  }

  if (spec.tone) {
    const t = spec.tone;
    img = img.linear(t.mul, t.off).modulate({ saturation: t.sat, brightness: t.bri });
  }

  const buf = await img.toBuffer();
  const sizes = [];
  for (const w of WIDTHS) {
    if (w > W * 1.02) continue;
    const h = Math.round((H / W) * w);
    await sharp(buf).resize(w, h, { fit: 'cover' })
      .webp({ quality: w >= 1000 ? 70 : 76, effort: 6 })
      .toFile(path.join(OUT, `${name}-${w}.webp`));
    sizes.push(w);
  }
  sizes.sort((a, b) => a - b);

  // tiny blurred placeholder, inlined as a data URI
  const lqip = await sharp(buf).resize(20).blur(1.2).webp({ quality: 30 }).toBuffer();

  manifest[name] = {
    w: W, h: H, sizes,
    ratio: +(W / H).toFixed(4),
    lqip: `data:image/webp;base64,${lqip.toString('base64')}`,
  };
  console.log(`${name.padEnd(20)} ${W}x${H}  [${sizes.join(', ')}]  lqip ${lqip.length}b`);
}

await fs.writeFile('image-manifest.json', JSON.stringify(manifest, null, 1));

const total = (await fs.readdir(OUT)).length;
console.log(`\n${total} webp files written to ${OUT}`);
