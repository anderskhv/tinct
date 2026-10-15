import { open, select } from './th.mjs'; import { sleep } from './lib.mjs';
const { c, p } = await open(); const out = {};
await p.screenshot({ path: 'p3/r3-ui-open.png' });
out.focused = await p.evaluate(() => { const a = document.activeElement; return a ? a.tagName + '.' + a.className : ''; });
out.wholeBar = await p.evaluate(() => /the whole PDF/i.test(document.body.innerText));
// primer open animation: sample positions while opening
await p.mouse.click(60, 500); await p.keyboard.press('b');
const frames = []; for (let i = 0; i < 12; i++) { frames.push(await p.evaluate(() => { const e = document.querySelector('.mr-primer, .mr-card.is-primer'); if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.top), Math.round(r.height), getComputedStyle(e).backgroundColor]; })); await sleep(80); }
out.primerFrames = frames; await sleep(1500); await p.screenshot({ path: 'p3/r3-ui-primer.png' });
await p.keyboard.press('Escape'); await sleep(500);
await select(p, 'dispensing with recurrence and convolutions entirely'); await sleep(500); await p.screenshot({ path: 'p3/r3-ui-bar.png' });
out.barItems = await p.evaluate(() => [...document.querySelectorAll('.mr-bar .mr-bar__item')].map(e => e.getAttribute('aria-label') || e.innerText).join(' | '));
await p.keyboard.press('Escape'); await sleep(500);
out.cardDelete = await p.evaluate(() => [...document.querySelectorAll('.mr-card')].slice(0, 5).map(card => [...card.querySelectorAll('button')].map(b => b.getAttribute('aria-label') || b.innerText.trim()).filter(Boolean).join('/')));
out.aa = await p.evaluate(() => [...document.querySelectorAll('header button')].map(b => b.getAttribute('aria-label') || b.innerText.trim()).join(' | '));
console.log(JSON.stringify(out, null, 1)); await c.close();
