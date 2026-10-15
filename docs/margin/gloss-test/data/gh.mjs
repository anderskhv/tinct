import { ctx, sleep } from './lib.mjs'; import fs from 'fs';
process.env.PROFILE = '/tmp/claude-0/-home-user-tinct/1997e058-3432-5517-b2af-8c632de4a039/scratchpad/cmp/gprofile';
export const GURL = 'https://www.usegloss.io/read/attention-is-all-you-need-9y94h';
export async function gopen(viewport) {
  const c = await ctx(viewport, viewport && viewport.width < 600 ? { isMobile: true, hasTouch: true } : {}); const p = c.pages()[0] || await c.newPage();
  p.errors = []; p.on('pageerror', e => p.errors.push(e.message.slice(0, 200))); p.on('response', r => { if (r.status() >= 400) p.errors.push(r.status() + ' ' + r.url().slice(0, 120)); });
  await p.goto(GURL, { waitUntil: 'networkidle', timeout: 60000 }); await sleep(2500); return { c, p };
}
export async function gselect(p, phrase) {
  await p.evaluate(() => scrollTo(0, 0)); await sleep(300);
  const r = await p.evaluate(ph => {
    const norm = s => s.replace(/\s+/g, ' ');
    const root = document.querySelector('main') || document.body;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n, nodes = [], txt = '';
    while ((n = w.nextNode())) { if (n.parentElement.closest('aside,nav,[role=dialog],[role=toolbar],article.gloss,header')) continue; nodes.push([n, txt.length]); txt += n.textContent; }
    let flat = '', map = []; for (let k = 0; k < txt.length; k++) { const ch = /\s/.test(txt[k]) ? ' ' : txt[k]; if (ch === ' ' && flat.endsWith(' ')) continue; flat += ch; map.push(k); }
    const at = flat.indexOf(norm(ph)); if (at < 0) return null;
    const s = map[at], e = map[at + norm(ph).length - 1] + 1;
    const find = off => { for (let q = nodes.length - 1; q >= 0; q--) if (nodes[q][1] <= off) return [nodes[q][0], off - nodes[q][1]]; };
    const [sn, so] = find(s), [en, eo] = find(e - 1);
    sn.parentElement.scrollIntoView({ block: 'center' });
    const rg = document.createRange(); rg.setStart(sn, so); rg.setEnd(en, eo + 1);
    const rects = [...rg.getClientRects()].filter(x => x.width > 1); const a = rects[0], z = rects[rects.length - 1];
    return { x1: a.left + 1, y1: a.top + a.height / 2, x2: z.right - 1, y2: z.top + z.height / 2 };
  }, phrase);
  if (!r) throw new Error('not found ' + phrase);
  await p.mouse.move(r.x1, r.y1); await p.mouse.down(); await p.mouse.move(r.x2, r.y2, { steps: 12 }); await p.mouse.up(); await sleep(700); return r;
}
// the newest margin note text (Gloss renders answers in the margin column)
export async function gtime(p, t0, maxMs = 120000) {
  let first = 0, last = 0, prev = '', since = 0;
  while (Date.now() - t0 < maxMs) {
    const t = await p.evaluate(() => { const c = window.__glossCard ? document.querySelector(window.__glossCard) : null; return c ? c.innerText : ''; });
    const now = Date.now();
    if (t && t.length > 60 && !first) first = now - t0;
    if (t !== prev) { prev = t; since = now; last = now - t0; }
    if (first && now - since > 4000) break;
    await sleep(250);
  }
  return { first, last, text: prev };
}
export function glog(name, o) { fs.appendFileSync('gloss/results.jsonl', JSON.stringify({ name, ...o }) + '\n'); }
