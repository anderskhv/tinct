import { open, locate, toTop } from './th.mjs'; import { sleep } from './lib.mjs'; import fs from 'fs';
const F = JSON.parse(fs.readFileSync('p3/figset.json', 'utf8')); const OUT = 'p3/fig-tinct.jsonl';
const { c, p } = await open();
const answers = () => p.evaluate(() => [...document.querySelectorAll('.mr-answer')].map(e => e.innerText));
async function waitNew(before, t0, max = 90000) { let first = 0, last = 0, prev = '', since = 0; while (Date.now() - t0 < max) { const a = await answers(); const t = a.length > before ? a[a.length - 1] : ''; const now = Date.now(); if (t.length > 20 && !first) first = now - t0; if (t !== prev) { prev = t; since = now; last = now - t0; } if (first && now - since > 4000) break; await sleep(250); } return { first, last, text: prev }; }
async function chip(cap) {
  const r = await locate(p, cap);
  for (let dy = 25; dy <= 520; dy += 25) for (let x = r.x1 + 20; x <= r.x1 + 700; x += 70) {
    await p.mouse.move(x, r.y1 - dy); await sleep(180);
    if (await p.locator('.byob-hot-chip').isVisible().catch(() => false)) return { x, y: r.y1 - dy };
  }
  return null;
}
for (const f of F) {
  const rec = { id: f.id };
  try {
    const at = await chip(f.cap); rec.chip = !!at;
    if (at) {
      let before = (await answers()).length; let t0 = Date.now();
      await p.locator('.byob-hot-chip [data-a="explain"]').click(); rec.explain = await waitNew(before, t0);
      await p.screenshot({ path: `p3/t-${f.id}-explain.png` });
      await p.keyboard.press('Escape'); await sleep(500);
      const at2 = await chip(f.cap);
      if (at2) { await p.locator('.byob-hot-chip [data-a="ask"]').click(); await sleep(1500);
        before = (await answers()).length; await p.keyboard.type(f.q, { delay: 4 }); t0 = Date.now(); await p.keyboard.press('Enter'); rec.ask = await waitNew(before, t0); }
    }
  } catch (e) { rec.error = e.message.split('\n')[0]; }
  fs.appendFileSync(OUT, JSON.stringify(rec) + '\n'); console.log(f.id, rec.chip, rec.explain?.last, rec.ask?.last, rec.error || '');
  for (let i = 0; i < 3; i++) await p.keyboard.press('Escape'); await sleep(500);
}
console.log('errors', p.errors.slice(0, 8)); await c.close();
