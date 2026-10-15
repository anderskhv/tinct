import { open, select, timeAnswer, toTop } from './th.mjs'; import { sleep } from './lib.mjs'; import fs from 'fs';
const { c, p } = await open(); const out = {};
const card = () => p.evaluate(() => document.querySelector('.mr-card.is-open')?.innerText || '');
try { await select(p, 'This framework corresponds to a minimax two-player game.'); out.bar = await p.locator('.mr-bar').isVisible(); const t0 = Date.now(); await p.locator('.mr-bar .mr-bar__item', { hasText: 'Explain' }).first().click(); out.explain = { ...(await timeAnswer(p, t0, '.mr-card.is-open .mr-answer')), card: await card() }; } catch (e) { out.explainErr = e.message.split('\n')[0]; }
for (let i = 0; i < 3; i++) await p.keyboard.press('Escape'); await p.mouse.click(60, 500); await sleep(500);
// whole-document question via t-menu chat or "/" bar
const answers = () => p.evaluate(() => [...document.querySelectorAll('.mr-answer')].map(e => e.innerText));
await p.keyboard.press('/'); await sleep(7000); const before = (await answers()).length;
await p.keyboard.type('What does Table 1 report, and which model scores best on MNIST?', { delay: 4 }); let t0 = Date.now(); await p.keyboard.press('Enter');
let prev = '', since = Date.now(); while (Date.now() - t0 < 90000) { const a = await answers(); const t = a.length > before ? a[a.length - 1] : ''; if (t !== prev) { prev = t; since = Date.now(); } if (prev.length > 20 && Date.now() - since > 4000) break; await sleep(300); }
out.whole = { ms: since - t0, text: prev };
for (let i = 0; i < 3; i++) await p.keyboard.press('Escape'); await toTop(p); await p.mouse.click(60, 500);
t0 = Date.now(); await p.keyboard.press('b'); let txt = ''; for (let k = 0; k < 200; k++) { await sleep(500); txt = await p.evaluate(() => document.querySelector('.mr-primer')?.innerText || ''); if (txt.length > 150 && !/Thinking|loading|Reading/i.test(txt.slice(0, 200))) break; }
out.primer = { ms: Date.now() - t0, text: txt }; await p.screenshot({ path: 'p3/r2-scan-primer.png' });
fs.writeFileSync('p3/r2-scan-b.json', JSON.stringify(out, null, 1)); console.log(JSON.stringify(out, null, 1).slice(0, 4000)); await c.close();
