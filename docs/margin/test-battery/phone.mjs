// Phone battery: one book, a small test set, every action through the phone UI, with layout checks.
import { open } from './th.mjs'; import { sleep } from './lib.mjs'; import { checkLayout } from './layout-check.mjs'; import fs from 'fs';
const T = JSON.parse(fs.readFileSync(process.env.TS, 'utf8')); const OD = process.env.OUTD; fs.mkdirSync(OD, { recursive: true });
const OUT = OD + '/phone.jsonl'; const save = o => { fs.appendFileSync(OUT, JSON.stringify(o) + '\n'); console.log(o.id, o.error || `${o.first}/${o.last}ms layout:${(o.layout || []).length}`); };
const { c, p } = await open({ width: 390, height: 844 });
let shot = 0; const snap = async id => { await p.screenshot({ path: `${OD}/${String(++shot).padStart(2, '0')}-${id}.png` }); };
const scroller = () => p.evaluate(() => { const els = [...document.querySelectorAll('*')].filter(e => e.scrollHeight > e.clientHeight + 200 && /auto|scroll/.test(getComputedStyle(e).overflowY)); els.sort((a, b) => b.scrollHeight - a.scrollHeight); return !!els[0]; });
async function pselect(ph) {
  for (let i = 0; i < 120; i++) {
    const r = await p.evaluate(ph => {
      const norm = s => s.replace(/\s+/g, ' ');
      for (const layer of document.querySelectorAll('.text-layer')) {
        const nodes = []; const w = document.createTreeWalker(layer, NodeFilter.SHOW_TEXT); let n, txt = '';
        while ((n = w.nextNode())) { nodes.push([n, txt.length]); txt += n.textContent; }
        let flat = '', map = []; for (let k = 0; k < txt.length; k++) { const ch = /\s/.test(txt[k]) ? ' ' : txt[k]; if (ch === ' ' && flat.endsWith(' ')) continue; flat += ch; map.push(k); }
        const at = flat.indexOf(norm(ph)); if (at < 0) continue;
        const s = map[at], e = map[at + norm(ph).length - 1] + 1;
        const find = off => { for (let q = nodes.length - 1; q >= 0; q--) if (nodes[q][1] <= off) return [nodes[q][0], off - nodes[q][1]]; };
        const [sn, so] = find(s), [en, eo] = find(e - 1);
        const rg = document.createRange(); rg.setStart(sn, so); rg.setEnd(en, eo + 1);
        const q = rg.getBoundingClientRect();
        if (q.top < 90 || q.bottom > innerHeight - 260) { sn.parentElement.scrollIntoView({ block: 'center' }); return 'scrolled'; }
        const sel = getSelection(); sel.removeAllRanges(); sel.addRange(rg); return 'ok';
      }
      return null;
    }, ph);
    if (r === 'ok') { await sleep(1300); return; }
    if (!r) await p.evaluate(() => { const els = [...document.querySelectorAll('*')].filter(e => e.scrollHeight > e.clientHeight + 200 && /auto|scroll/.test(getComputedStyle(e).overflowY)); els.sort((a, b) => b.scrollHeight - a.scrollHeight); (els[0] || document.scrollingElement).scrollTop += 500; });
    await sleep(500);
  }
  throw new Error('not found ' + ph);
}
async function toTop() { await p.evaluate(() => { const els = [...document.querySelectorAll('*')].filter(e => e.scrollHeight > e.clientHeight + 200 && /auto|scroll/.test(getComputedStyle(e).overflowY)); els.sort((a, b) => b.scrollHeight - a.scrollHeight); if (els[0]) els[0].scrollTop = 0; scrollTo(0, 0); }); await sleep(800); }
const answerSel = '.mr-card.is-open .mr-answer, .mr-sheet .mr-answer, .mr-answer';
async function waitAnswer(before, t0, max = 120000) { let first = 0, last = 0, prev = '', since = 0; while (Date.now() - t0 < max) { const a = await p.evaluate(s => [...document.querySelectorAll(s)].map(e => e.innerText), answerSel); const t = a.length > before ? a[a.length - 1] : (a.length && before === -1 ? a[a.length - 1] : ''); const now = Date.now(); if (t.length > 20 && !first) first = now - t0; if (t !== prev) { prev = t; since = now; last = now - t0; } if (first && now - since > 4000) break; await sleep(300); } return { first, last, text: prev }; }
const count = () => p.evaluate(s => document.querySelectorAll(s).length, answerSel);
async function closeAll() { for (let i = 0; i < 3; i++) { await p.keyboard.press('Escape'); await sleep(200); } await p.evaluate(() => getSelection().removeAllRanges()); await sleep(400); }
async function tapBar(label) { const b = p.locator('.mr-pbar .mr-bar__item, .mr-bar .mr-bar__item', { hasText: label }).first(); await b.tap(); }
async function tapMore(row) { await p.locator('.mr-pbar .mr-bar__item[aria-label="More"], .mr-pbar .mr-bar__item:has-text("More"), .mr-pbar .mr-bar__item:has-text("…"), .mr-pbar .mr-bar__item:has-text("•••")').first().tap(); await sleep(500); await snap('more'); await p.locator('.mr-pmore button, .mr-pmore [role=menuitem], .mr-more__row', { hasText: row }).first().tap(); }
async function run(id, fn) { let rec; try { rec = await fn(); } catch (e) { rec = { error: e.message.split('\n')[0] }; } try { rec.layout = await checkLayout(p); } catch {} await snap(id); save({ id, ...rec }); await closeAll(); }
await snap('open'); save({ id: 'open', layout: await checkLayout(p), title: await p.evaluate(() => document.querySelector('header')?.innerText.replace(/\n/g, ' | ')) });
// bar on a selection
await run('bar', async () => { await toTop(); await pselect(T.explain[0]); const vis = await p.locator('.mr-pbar, .mr-bar').first().isVisible().catch(() => false); const box = await p.evaluate(() => { const b = document.querySelector('.mr-pbar, .mr-bar')?.getBoundingClientRect(); const s = getSelection().rangeCount ? getSelection().getRangeAt(0).getBoundingClientRect() : null; return b && s ? { barTop: Math.round(b.top), barBottom: Math.round(b.bottom), selTop: Math.round(s.top), selBottom: Math.round(s.bottom), barW: Math.round(b.width) } : null; }); const items = await p.evaluate(() => [...document.querySelectorAll('.mr-pbar .mr-bar__item, .mr-bar .mr-bar__item')].map(e => { const r = e.getBoundingClientRect(); return (e.getAttribute('aria-label') || e.innerText.trim()) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height); })); return { visible: vis, box, items }; });
for (const [i, ph] of T.explain.slice(0, 2).entries()) await run('explain-' + i, async () => { await toTop(); await pselect(ph); const n = await count(); const t0 = Date.now(); await tapBar('Explain'); return { passage: ph, ...(await waitAnswer(n, t0)) }; });
for (const [i, ph] of T.simplify.slice(0, 2).entries()) await run('simplify-' + i, async () => { await toTop(); await pselect(ph); const n = await count(); const t0 = Date.now(); await tapBar('Simplify'); return { passage: ph, ...(await waitAnswer(n, t0)) }; });
for (const [i, w] of T.define.slice(0, 2).entries()) await run('define-' + i, async () => { await toTop(); await pselect(w); let txt = '', first = 0; const t0 = Date.now(); for (let k = 0; k < 30; k++) { await sleep(250); txt = await p.evaluate(() => document.querySelector('.mr-define')?.innerText || ''); if (txt && !first) first = Date.now() - t0; } return { passage: w, first, last: Date.now() - t0, text: txt }; });
await run('factcheck-0', async () => { await toTop(); await pselect(T.factcheck[0]); const n = await count(); const t0 = Date.now(); await tapMore('Fact-check'); return { passage: T.factcheck[0], ...(await waitAnswer(n, t0, 150000)) }; });
await run('counterpoint-0', async () => { await toTop(); await pselect(T.counterpoint[0]); const n = await count(); const t0 = Date.now(); await tapMore('Counterpoint'); return { passage: T.counterpoint[0], ...(await waitAnswer(n, t0)) }; });
await run('ask-0', async () => { const [ph, q] = T.ask[0]; await toTop(); await pselect(ph); await tapBar('Ask'); await sleep(600); await p.keyboard.type(q, { delay: 5 }); const n = await count(); const t0 = Date.now(); await p.keyboard.press('Enter'); return { passage: ph, question: q, ...(await waitAnswer(n, t0)) }; });
await run('quiz-0', async () => { await toTop(); await pselect(T.quiz[0]); const t0 = Date.now(); await tapMore('Quiz'); for (let k = 0; k < 80; k++) { await sleep(400); if (await p.locator('.mr-question').count()) break; } const q = await p.evaluate(() => document.querySelector('.mr-question')?.innerText || ''); return { first: Date.now() - t0, last: Date.now() - t0, text: q }; });
await run('primer', async () => { await toTop(); const trig = p.locator('.mr-trigger, button:has-text("Before you start")').first(); const t0 = Date.now(); if (await trig.count()) await trig.tap(); else await p.keyboard.press('b'); let txt = ''; for (let k = 0; k < 200; k++) { await sleep(500); txt = await p.evaluate(() => document.querySelector('.mr-primer')?.innerText || ''); if (txt.length > 150 && !/Thinking|loading|Reading/i.test(txt.slice(0, 200))) break; } return { first: 0, last: Date.now() - t0, text: txt, found: await trig.count() }; });
await run('whole', async () => { await p.locator('header button[aria-label="Menu"], button[aria-label="Menu"]').first().tap(); await sleep(900); await snap('menu'); const ch = p.getByText('Chat', { exact: true }).first(); const found = await ch.count(); if (found) await ch.tap(); await sleep(2500); await snap('chat'); const n = await count(); await p.keyboard.type(T.whole[0], { delay: 5 }); const t0 = Date.now(); await p.keyboard.press('Enter'); const r = await waitAnswer(n, t0); const any = await p.evaluate(() => [...document.querySelectorAll('.mr-answer, .byob-chat-msg, [class*=chat] [class*=answer]')].map(e => e.innerText).pop() || ''); return { found, question: T.whole[0], ...r, any: any.slice(0, 1500) }; });
console.log('errors', p.errors.slice(0, 8)); await c.close();
