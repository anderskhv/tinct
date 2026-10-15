import { ctx, sleep } from './lib.mjs';
const c = await ctx(); const p = c.pages()[0] || await c.newPage();
await p.goto('https://tinct.app/lab/addbook/?userBook=779637623228a5d17d129344&pages', { waitUntil: 'domcontentloaded', timeout: 60000 });
await sleep(10000); console.log(p.url());
console.log('spans', await p.evaluate(() => document.querySelectorAll('.text-layer span').length));
// try drag-select over abstract
await p.mouse.move(280, 520); await p.mouse.down(); await p.mouse.move(700, 560, { steps: 12 }); await p.mouse.up(); await sleep(1200);
console.log('sel', JSON.stringify(await p.evaluate(() => getSelection().toString().slice(0, 100))), 'bar', await p.locator('.mr-bar').isVisible().catch(() => false));
await p.screenshot({ path: 'p3/scan-pages-sel.png' });
// whole PDF question
await p.keyboard.press('Escape'); await p.mouse.click(1000, 500); await p.keyboard.press('/'); await sleep(2000);
await p.keyboard.type('What does Table 1 report, and which model scores best on MNIST?', { delay: 5 }); const t0 = Date.now(); await p.keyboard.press('Enter');
let prev = '', since = 0; while (Date.now() - t0 < 90000) { const t = await p.evaluate(() => [...document.querySelectorAll('.mr-answer')].map(e => e.innerText).pop() || ''); if (t !== prev) { prev = t; since = Date.now(); } if (prev.length > 20 && Date.now() - since > 4000) break; await sleep(300); }
console.log('WHOLE', ((since - t0) / 1000).toFixed(1) + 's', prev);
await c.close();
