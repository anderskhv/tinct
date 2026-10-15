import { open } from './th.mjs'; import { sleep } from './lib.mjs'; import fs from 'fs';
const { c, p } = await open(); const Q = JSON.parse(fs.readFileSync(process.env.TS, 'utf8')).whole; const out = [];
const answers = () => p.evaluate(() => [...document.querySelectorAll('.mr-answer')].map(e => e.innerText));
for (const q of Q) {
  await p.mouse.click(60, 500); await p.keyboard.press('/'); await sleep(1500);
  await p.keyboard.type('ok', { delay: 4 }); await p.keyboard.press('Enter');
  let n = -1, same = 0; for (let i = 0; i < 90 && same < 8; i++) { const m = (await answers()).length; if (m === n) same++; else { same = 0; n = m; } await sleep(500); }
  await p.mouse.click(60, 500); await p.keyboard.press('/'); await sleep(1500);
  await p.keyboard.type(q, { delay: 4 }); const t0 = Date.now(); await p.keyboard.press('Enter');
  let txt = '', at = 0, first = 0; while (Date.now() - t0 < 90000) { const a = await answers(); const t = a.length > n ? a[a.length - 1] : ''; if (t && !first && t.length > 20) first = Date.now() - t0; if (t !== txt) { txt = t; at = Date.now() - t0; } else if (txt.length > 50 && Date.now() - t0 - at > 5000) break; await sleep(400); }
  out.push({ q, first, last: at, text: txt }); console.log(q.slice(0, 40), first, at);
}
fs.writeFileSync(process.env.OUT, JSON.stringify(out, null, 1)); await c.close();
