import { ctx, sleep } from './lib.mjs';
const c = await ctx(); const p = c.pages()[0] || await c.newPage();
const log = []; p.on('response', r => { if (/\/ocr\//.test(r.url())) log.push(r.request().method() + ' ' + r.status() + ' ' + r.url().split('/ocr/')[1]); });
const t0 = Date.now();
await p.goto('https://tinct.app/lab/addbook/?userBook=779637623228a5d17d129344', { waitUntil: 'domcontentloaded', timeout: 60000 });
await sleep(9000); await p.screenshot({ path: 'p3/scan-reopen.png' });
console.log('ocr el:', await p.evaluate(() => document.querySelector('.byob-ocr')?.innerText || 'none'));
console.log('toasts:', await p.evaluate(() => [...document.querySelectorAll('[class*=toast]')].map(e => e.innerText).join(' / ')));
const btn = p.locator('[data-ocr="start"]');
if (await btn.count()) {
  await btn.click(); const ts = Date.now();
  let last = '';
  for (let i = 0; i < 360; i++) { await sleep(2000); const t = await p.evaluate(() => document.querySelector('.byob-ocr')?.innerText || ''); if (t !== last) { console.log(((Date.now() - ts) / 1000).toFixed(0) + 's', t); last = t; } if (/ready|Tinct text/i.test(t) || await p.evaluate(() => /Tinct text/.test(document.body.innerText))) { console.log('done after', (Date.now() - ts) / 1000, 's'); break; } }
  await sleep(4000); await p.screenshot({ path: 'p3/scan-after.png' });
}
console.log(log.join('\n')); await c.close();
