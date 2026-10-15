import { open, select as select0, locate } from './th.mjs'; import { sleep } from './lib.mjs'; import fs from 'fs';
const { c, p } = await open();
const answers = () => p.evaluate(() => [...document.querySelectorAll('.mr-answer')].map(e => e.innerText));
async function waitNew(before, t0, max = 90000) { let first = 0, last = 0, prev = '', since = 0; while (Date.now() - t0 < max) { const a = await answers(); const t = a.length > before ? a[a.length - 1] : ''; const now = Date.now(); if (t.length > 20 && !first) first = now - t0; if (t !== prev) { prev = t; since = now; last = now - t0; } if (first && now - since > 4000) break; await sleep(250); } return { first, last, text: prev }; }
const out = {};
// 1) margin Ask on the caption
await select0(p, process.env.CAP); await sleep(600);
let before = (await answers()).length; await p.keyboard.type(process.env.Q1, { delay: 4 }); let t0 = Date.now(); await p.keyboard.press('Enter');
out.captionAsk = await waitNew(before, t0); console.log('captionAsk', out.captionAsk);
for (let i = 0; i < 3; i++) await p.keyboard.press('Escape'); await p.mouse.click(60, 500); await sleep(500);
// 2) whole-PDF question
await p.keyboard.press('/'); await sleep(2500); before = (await answers()).length;
await p.keyboard.type(process.env.Q2, { delay: 4 }); t0 = Date.now(); await p.keyboard.press('Enter');
out.whole = await waitNew(before, t0); console.log('whole', out.whole);
fs.writeFileSync(process.env.OUT, JSON.stringify(out, null, 1)); await c.close();
