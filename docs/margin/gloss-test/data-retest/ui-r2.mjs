import { open, locate } from './th.mjs'; import { sleep } from './lib.mjs';
const { c, p } = await open(); const out = {};
// ResNet figures: chip on each caption region
for (const cap of ['Figure 1. Training error (left)', 'Figure 2. Residual learning: a building', 'Figure 3. Example network architectures', 'Figure 4. Training on', 'Figure 6. Training on', 'Figure 7. Standard deviations']) {
  const r = await locate(p, cap); let hit = null;
  for (let dy = 25; dy <= 520 && !hit; dy += 25) for (let x = r.x1 + 20; x <= r.x1 + 700 && !hit; x += 70) { await p.mouse.move(x, r.y1 - dy); await sleep(150); if (await p.locator('.byob-hot-chip').isVisible().catch(() => false)) hit = true; }
  let clip = null; if (hit) clip = await p.evaluate(() => { const q = document.querySelector('.byob-hot-chip').getBoundingClientRect(); const b = [...document.querySelectorAll('.byob-hot-chip button, .byob-hot-chip [data-a]')].map(e => e.getBoundingClientRect()); return { left: Math.round(q.left), right: Math.round(q.right), off: b.filter(x => x.left < 0 || x.right > innerWidth).length }; });
  // caption hover fallback
  await p.mouse.move(r.x1 + 5, r.y1); await sleep(400); const capChip = await p.locator('.byob-hot-chip').isVisible().catch(() => false);
  out[cap.slice(0, 8)] = { chip: !!hit, clip, captionHoverChip: capChip }; console.log(cap.slice(0, 8), JSON.stringify(out[cap.slice(0, 8)]));
}
await p.screenshot({ path: 'p3/r2-ui-resnet.png' });
console.log('whole bar present:', await p.evaluate(() => /the whole PDF/i.test(document.body.innerText)));
console.log('caret elements:', await p.evaluate(() => [...document.querySelectorAll('textarea, input, [contenteditable]')].filter(e => e.offsetParent && document.activeElement === e).map(e => e.className).join(',')));
await c.close();
