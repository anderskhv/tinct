import { open } from './th.mjs'; import { sleep } from './lib.mjs';
const { c, p } = await open();
const answers = () => p.evaluate(() => [...document.querySelectorAll('.mr-answer')].map(e => e.innerText));
await p.mouse.click(60, 500); await p.keyboard.press('/'); await sleep(2000);
await p.keyboard.type('Give me a one-line overview of the book first.', { delay: 4 }); await p.keyboard.press('Enter');
let n = -1, same = 0; for (let i = 0; i < 90 && same < 8; i++) { const m = (await answers()).length; if (m === n) same++; else { same = 0; n = m; } await sleep(500); }
console.log('settled count', n); await p.mouse.click(60, 500); await p.keyboard.press('/'); await sleep(1500);
await p.keyboard.type('In Chapter 17, what are general value functions, and what example does the book give?', { delay: 4 }); const t0 = Date.now(); await p.keyboard.press('Enter');
let txt = '', at = 0; while (Date.now() - t0 < 60000) { const a = await answers(); const t = a.length > n ? a[a.length - 1] : ''; if (t !== txt) { txt = t; at = Date.now() - t0; } else if (txt.length > 50 && Date.now() - t0 - at > 5000) break; await sleep(400); }
console.log(at, '\n', txt.slice(0, 1500)); await c.close();
