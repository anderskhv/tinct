import { open, locate } from './th.mjs'; import { sleep } from './lib.mjs';
process.env.NOTOP = '1';
const { c, p } = await open();
await p.locator('button', { hasText: /\d+%/ }).first().click(); await sleep(700); await p.fill('#jumpInput', '445'); await p.keyboard.press('Enter'); await sleep(4000);
console.log('header after jump to 445:', await p.evaluate(() => document.querySelector('header')?.innerText.replace(/\n/g, ' ').slice(0, 120)));
console.log('page with "198 input" visible:', await p.evaluate(() => [...document.querySelectorAll('.text-layer')].some(l => l.textContent.includes('a total of 198'))));
console.log('wrap order:', await p.evaluate(() => { for (const l of document.querySelectorAll('.text-layer')) { const t = l.textContent; const i = t.indexOf('a total of 198'); if (i >= 0) return JSON.stringify(t.slice(i - 90, i + 40)); } return 'none'; }));
const r = await locate(p, 'Figure 16.1'); await p.mouse.move(r.x1 + 5, r.y1); await sleep(500);
let chip = await p.locator('.byob-hot-chip').isVisible().catch(() => false);
if (!chip) for (let dy = 30; dy <= 300 && !chip; dy += 30) for (let dx = -100; dx <= 300 && !chip; dx += 50) { await p.mouse.move(r.x1 + dx, r.y1 - dy); await sleep(120); chip = await p.locator('.byob-hot-chip').isVisible().catch(() => false); }
console.log('TD-Gammon figure chip:', chip); await p.screenshot({ path: 'p3/r2-ui-rl.png' });
await c.close();
