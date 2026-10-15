import { ctx, sleep } from './lib.mjs';
import fs from 'fs';
export const URL = 'https://tinct.app/lab/addbook/?userBook=bdfaa68d8984f0dc02beaca5';
export async function open(viewport) {
  const c = await ctx(viewport, viewport && viewport.width < 600 ? { isMobile: true, hasTouch: true } : {}); const p = c.pages()[0] || await c.newPage();
  p.errors = []; p.on('console', m => { if (m.type() === 'error') p.errors.push(m.text().slice(0, 300)); }); p.on('pageerror', e => p.errors.push('PAGEERROR ' + e.message.slice(0, 300)));
  p.on('response', r => { if (r.status() >= 400) p.errors.push(r.status() + ' ' + r.url().slice(0, 160)); });
  await p.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 }); await sleep(6000);
  return { c, p };
}
// scroll until a text layer contains the phrase; return client rects of the phrase range
export async function toTop(p) { await p.evaluate(() => { const els = [...document.querySelectorAll('*')].filter(e => e.scrollHeight > e.clientHeight + 200 && /auto|scroll/.test(getComputedStyle(e).overflowY)); els.sort((a, b) => b.scrollHeight - a.scrollHeight); if (els[0]) els[0].scrollTop = 0; scrollTo(0, 0); }); await sleep(1200); }
export async function locate(p, phrase) {
  await toTop(p);
  for (let i = 0; i < 80; i++) {
    const r = await p.evaluate(ph => {
      const norm = s => s.replace(/\s+/g, ' ');
      for (const layer of document.querySelectorAll('.text-layer')) {
        const nodes = []; const w = document.createTreeWalker(layer, NodeFilter.SHOW_TEXT); let n, txt = '';
        while ((n = w.nextNode())) { nodes.push([n, txt.length]); txt += n.textContent; }
        // build normalized index map
        let flat = '', map = [];
        for (let k = 0; k < txt.length; k++) { const ch = /\s/.test(txt[k]) ? ' ' : txt[k]; if (ch === ' ' && flat.endsWith(' ')) continue; flat += ch; map.push(k); }
        const at = flat.indexOf(norm(ph)); if (at < 0) continue;
        const s = map[at], e = map[at + norm(ph).length - 1] + 1;
        const find = off => { for (let q = nodes.length - 1; q >= 0; q--) if (nodes[q][1] <= off) return [nodes[q][0], off - nodes[q][1]]; };
        const [sn, so] = find(s), [en, eo] = find(e - 1);
        const rg = document.createRange(); rg.setStart(sn, so); rg.setEnd(en, eo + 1);
        const rects = [...rg.getClientRects()].filter(x => x.width > 1);
        if (!rects.length) return { found: true, rects: [] };
        const a = rects[0], z = rects[rects.length - 1];
        if (a.top < 70 || z.bottom > innerHeight - 70) { (sn.parentElement).scrollIntoView({ block: 'center' }); return { found: true, scrolled: true }; }
        return { found: true, x1: a.left + 1, y1: a.top + a.height / 2, x2: z.right - 1, y2: z.top + z.height / 2 };
      }
      return null;
    }, phrase);
    if (r && r.x1) return r;
    if (!r) await p.evaluate(() => { const els = [...document.querySelectorAll('*')].filter(e => e.scrollHeight > e.clientHeight + 200 && /auto|scroll/.test(getComputedStyle(e).overflowY)); els.sort((a, b) => b.scrollHeight - a.scrollHeight); if (els[0]) els[0].scrollTop += 450; else scrollBy(0, 450); });
    await sleep(600);
  }
  throw new Error('phrase not found: ' + phrase);
}
export async function select(p, phrase) {
  const r = await locate(p, phrase);
  await p.mouse.move(r.x1, r.y1); await p.mouse.down(); await p.mouse.move(r.x2, r.y2, { steps: 12 }); await p.mouse.up();
  await sleep(700);
  return r;
}
// wait for answer text in the newest open card; returns timings
export async function timeAnswer(p, t0, sel = '.mr-card.is-open .mr-answer, .mr-card.is-open .mr-card__body', maxMs = 90000) {
  let first = 0, last = 0, prev = '', stableSince = 0;
  while (Date.now() - t0 < maxMs) {
    const t = await p.evaluate(s => { const els = [...document.querySelectorAll(s)]; return els.map(e => e.innerText).join('\n').trim(); }, sel).catch(() => '');
    const status = await p.evaluate(() => [...document.querySelectorAll('.mr-card.is-open .mr-status')].map(e => e.innerText).join(' ')).catch(() => '');
    const now = Date.now();
    if (t && !first && t.length > 20) first = now - t0;
    if (t !== prev) { prev = t; stableSince = now; last = now - t0; }
    if (first && now - stableSince > 3500 && !/checking|thinking|…$/i.test(status)) break;
    await sleep(250);
  }
  return { first, last, text: prev };
}
export function log(name, obj) { fs.appendFileSync('tinct/results.jsonl', JSON.stringify({ name, ...obj, at: new Date().toISOString() }) + '\n'); }
