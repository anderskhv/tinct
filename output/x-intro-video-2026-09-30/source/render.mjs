const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import fs from 'fs';
// node render.mjs <outdir> <frames comma list | a-b> [fmt=png|jpg]
const [, , outdir, spec, fmt = 'png'] = process.argv;
fs.mkdirSync(outdir, { recursive: true });
let frames = [];
for (const part of spec.split(',')) { if (part.includes('-')) { const [a, b] = part.split('-').map(Number); for (let i = a; i <= b; i++) frames.push(i); } else frames.push(+part); }
const browser = await chromium.launch({ args: ['--hide-scrollbars', '--force-color-profile=srgb', '--disable-lcd-text', '--font-render-hinting=none'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
page.on('console', m => { if (m.type() === 'error') console.log('CONSOLE', m.text().slice(0, 200)); });
page.on('pageerror', e => console.log('PAGEERR', e.message));
await page.goto('http://127.0.0.1:3003/comp/' + (process.env.COMP || 'comp.html'));
await page.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
const t0 = Date.now();
for (const f of frames) {
  await page.evaluate(f => window.seek(f), f);
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  const path = `${outdir}/${String(f).padStart(4, '0')}.${fmt}`;
  await page.screenshot(fmt === 'png' ? { path } : { path, type: 'jpeg', quality: 92 });
}
console.log('rendered', frames.length, 'in', ((Date.now() - t0) / 1000).toFixed(1), 's');
await browser.close();
