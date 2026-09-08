import puppeteer from 'puppeteer';
import sharp from 'sharp';
import fs from 'node:fs/promises';

const URL = 'http://127.0.0.1:7788/';
const OUT = 'shots';
const [, , WIDTH = '1440', HEIGHT = '900', TAG = 'd'] = process.argv;

await fs.mkdir(OUT, { recursive: true });

const browser = await puppeteer.launch({ headless: 'new', protocolTimeout: 240000 });
const page = await browser.newPage();
await page.setViewport({ width: +WIDTH, height: +HEIGHT, deviceScaleFactor: 1 });
await page.goto(URL, { waitUntil: 'networkidle0', timeout: 60000 });
await page.evaluate(() => document.fonts.ready);

const docH = await page.evaluate(() => document.documentElement.scrollHeight);
const vh = +HEIGHT;
const frames = Math.ceil(docH / vh);
console.log(`document ${docH}px  ->  ${frames} frames of ${WIDTH}x${vh}`);

// walk once so every lazy image is fetched, then come back and shoot
await page.evaluate(async (vh) => {
  for (let y = 0; y < document.documentElement.scrollHeight; y += vh * 0.8) {
    window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60));
  }
}, vh);
// only wait on images that are actually rendered; the sticky service shots are
// display:none under 900px and would never fire load
await page.evaluate(() => {
  const pending = [...document.images].filter(i => !i.complete && i.getClientRects().length);
  return Promise.race([
    Promise.all(pending.map(i => new Promise(r => { i.onload = i.onerror = r; }))),
    new Promise(r => setTimeout(r, 8000)),
  ]);
});

for (let i = 0; i < frames; i++) {
  await page.evaluate(y => window.scrollTo(0, y), i * vh);
  await new Promise(r => setTimeout(r, 550));
  const png = await page.screenshot({ type: 'png' });
  await sharp(png).resize({ width: Math.min(+WIDTH, 900) }).jpeg({ quality: 82 })
    .toFile(`${OUT}/${TAG}${i + 1}.jpg`);
}

await page.evaluate(() => window.scrollTo(0, 0));
await new Promise(r => setTimeout(r, 400));

const report = await page.evaluate(() => {
  const res = performance.getEntriesByType('resource');
  const kb = b => Math.round(b / 1024);
  // anything still invisible while sitting in the viewport is a bug
  const stuck = [...document.querySelectorAll('.rv, .divider .dl')].filter(e => {
    const r = e.getBoundingClientRect();
    const inView = r.top < innerHeight && r.bottom > 0;
    return inView && +getComputedStyle(e).opacity < 0.9;
  }).length;
  return {
    docHeight: document.documentElement.scrollHeight,
    horizontalOverflow: document.documentElement.scrollWidth > innerWidth
      ? document.documentElement.scrollWidth : false,
    invisibleInViewport: stuck,
    imagesBroken: [...document.images].filter(i => !i.naturalWidth).length,
    wholePageKB: kb(res.reduce((s, r) => s + (r.transferSize || 0), 0)),
    requests: res.length,
  };
});
console.log(JSON.stringify(report, null, 1));
await browser.close();
