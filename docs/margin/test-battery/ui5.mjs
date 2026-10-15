import { open, select } from './th.mjs'; import { sleep } from './lib.mjs'; import { checkLayout } from './layout-check.mjs';
const { c, p } = await open(); const out = {};
await p.screenshot({ path: 'p3/r5-open.png' });
out.scroll = await p.evaluate(() => { const els = [...document.querySelectorAll('*')].filter(e => e.scrollHeight > e.clientHeight + 200 && /auto|scroll/.test(getComputedStyle(e).overflowY)); els.sort((a, b) => b.scrollHeight - a.scrollHeight); const r = els[0]?.getBoundingClientRect(); return r ? { right: Math.round(r.right), vw: innerWidth } : null; });
out.footBar = await p.evaluate(() => /the whole PDF/i.test(document.body.innerText));
// primer opening frames
await p.mouse.click(60, 500); await p.keyboard.press('b'); const fr = [];
for (let i = 0; i < 10; i++) { fr.push(await p.evaluate(() => { const e = document.querySelector('.mr-primer'); if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.top), Math.round(r.height)]; })); await sleep(60); }
out.primerFrames = fr; await sleep(1200); await p.screenshot({ path: 'p3/r5-primer.png' }); await p.keyboard.press('Escape'); await sleep(600);
// bar icons
await select(p, 'dispensing with recurrence and convolutions entirely'); await sleep(600); await p.screenshot({ path: 'p3/r5-bar.png', clip: { x: 0, y: 0, width: 1440, height: 900 } });
out.bar = await p.evaluate(() => [...document.querySelectorAll('.mr-bar .mr-bar__item')].map(e => e.getAttribute('aria-label') || e.innerText.trim()).join(' | '));
await p.keyboard.press('Escape'); await sleep(500);
// delete a card + undo
const cards0 = await p.evaluate(() => document.querySelectorAll('.mr-card').length);
await p.locator('.mr-card').first().click(); await sleep(800);
const del = p.locator('.mr-card.is-open button[aria-label*="elete"], .mr-card.is-open button[aria-label*="Remove"]').first();
out.deleteBtn = await del.count();
if (out.deleteBtn) { await del.click(); await sleep(700); out.toast = await p.evaluate(() => document.body.innerText.match(/Deleted[^\n]*/)?.[0] || ''); out.afterDelete = await p.evaluate(() => document.querySelectorAll('.mr-card').length); await p.screenshot({ path: 'p3/r5-delete.png' }); const undo = p.getByText('Undo').first(); if (await undo.count()) { await undo.click(); await sleep(1000); out.afterUndo = await p.evaluate(() => document.querySelectorAll('.mr-card').length); } }
out.cards0 = cards0;
// Aa panel
const aa = p.locator('header button', { hasText: 'Aa' }).first(); if (await aa.count()) { await aa.click(); await sleep(800); out.aa = await p.evaluate(() => (document.querySelector('[role=dialog]')?.innerText || '').replace(/\n+/g, ' | ').slice(0, 400)); await p.screenshot({ path: 'p3/r5-aa.png' }); }
// Focus view
const fv = p.getByText('Focus view').first(); if (await fv.count()) { await fv.click(); await sleep(1500); await p.keyboard.press('Escape'); await sleep(500); await p.screenshot({ path: 'p3/r5-focus.png' }); await select(p, 'dispensing with recurrence and convolutions entirely'); await sleep(500); await p.locator('.mr-bar .mr-bar__item', { hasText: 'Explain' }).first().click().catch(() => {}); await sleep(7000); await p.screenshot({ path: 'p3/r5-focus-explain.png' }); out.focusLayout = (await checkLayout(p)).filter(x => x.kind !== 'clipped'); }
// back to margin view
if (await aa.count()) { await aa.click(); await sleep(600); await p.getByText('Margin view').first().click().catch(() => {}); await sleep(800); }
console.log(JSON.stringify(out, null, 1)); await c.close();
