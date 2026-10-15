import { gopen, gselect } from './gh.mjs'; import { sleep } from './lib.mjs'; import fs from 'fs';
const T = JSON.parse(fs.readFileSync('testset.json', 'utf8')); const OUT = 'deep/gloss.jsonl'; fs.mkdirSync('deep', { recursive: true });
const done = new Set(fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l).id) : []);
const save = o => fs.appendFileSync(OUT, JSON.stringify(o) + '\n');
const { c, p } = await gopen();
let KEY = '';
const pick = () => p.evaluate(k => { const arts = [...document.querySelectorAll('article.gloss')].filter(x => !k || x.innerText.replace(/\s+/g, ' ').includes(k)); arts.sort((a, b) => (b.classList.contains('is-active') - a.classList.contains('is-active')) || ((b.querySelector('.gloss-body')?.innerText.length || 0) - (a.querySelector('.gloss-body')?.innerText.length || 0))); const a = arts[0]; return a ? [a.querySelector('.gloss-body')?.innerText || '', a.innerText] : ['', '']; }, KEY);
async function body(t0, maxMs = 150000) { let first = 0, last = 0, prev = '', since = 0;
  while (Date.now() - t0 < maxMs) { const [t, foot] = await pick().catch(() => ['', '']); const now = Date.now();
    if (t.length > 20 && !first) first = now - t0; if (t !== prev) { prev = t; since = now; last = now - t0; } if (first && now - since > 3000 && /in,|out|\$/.test(foot)) break; if (first && now - since > 8000) break; await sleep(200); }
  return { first, last, text: (await pick())[1] }; }
const TB = () => p.locator('[role=toolbar]');
async function more(row) { await TB().getByRole('button', { name: 'More actions' }).first().click(); await sleep(450); await p.locator('[role=toolbar] [role=menuitem]', { hasText: row }).first().click(); }
async function run(id, fn, key = '') { if (done.has(id)) return; KEY = key.replace(/\s+/g, ' ').slice(0, 28); let rec; try { rec = await fn(); } catch (e) { rec = { error: e.message.split('\n')[0] }; await p.screenshot({ path: `deep/g-${id}-fail.png` }).catch(() => {}); } save({ id, ...rec }); console.log(id, rec.error || `${rec.first}/${rec.last}ms`); await p.keyboard.press('Escape'); await sleep(250); await p.keyboard.press('Escape'); await sleep(250); }
for (const [i, ph] of T.explain.entries()) await run(`explain-${i}`, async () => { await gselect(p, ph); const t0 = Date.now(); await TB().getByRole('button', { name: 'Explain', exact: true }).first().click(); return { passage: ph, ...(await body(t0)) }; }, ph);
for (const [i, ph] of T.simplify.entries()) await run(`simplify-${i}`, async () => { await gselect(p, ph); const t0 = Date.now(); await TB().getByRole('button', { name: 'Simplify', exact: true }).first().click(); return { passage: ph, ...(await body(t0)) }; }, ph);
for (const [i, w] of T.define.entries()) await run(`define-${i}`, async () => { await gselect(p, w); const t0 = Date.now(); await more('Define'); return { passage: w, ...(await body(t0)) }; }, w);
for (const [i, ph] of T.factcheck.entries()) await run(`factcheck-${i}`, async () => { await gselect(p, ph); const t0 = Date.now(); await more('Fact-check'); return { passage: ph, ...(await body(t0, 200000)) }; }, ph);
for (const [i, ph] of T.counterpoint.entries()) await run(`counterpoint-${i}`, async () => { await gselect(p, ph); const t0 = Date.now(); await more('Counterpoint'); return { passage: ph, ...(await body(t0)) }; }, ph);
for (const [i, [ph, q]] of T.ask.entries()) await run(`ask-${i}`, async () => { await gselect(p, ph); await p.keyboard.type(q, { delay: 5 }); const t0 = Date.now(); await p.keyboard.press('Enter'); return { passage: ph, question: q, ...(await body(t0)) }; }, q);
for (const [i, q] of T.whole.entries()) await run(`whole-${i}`, async () => { await p.keyboard.press('Escape'); await p.keyboard.press('/'); await sleep(400); await p.keyboard.type(q, { delay: 5 }); const t0 = Date.now(); await p.keyboard.press('Enter'); return { question: q, ...(await body(t0)) }; }, q);
await run('primer', async () => ({ first: 0, last: 0, text: JSON.parse(fs.readFileSync('gloss/results.jsonl', 'utf8').trim().split('\n').map(l => JSON.parse(l)).find(x => x.name === 'primer') ? JSON.stringify(fs.readFileSync('gloss/results.jsonl', 'utf8').trim().split('\n').map(l => JSON.parse(l)).find(x => x.name === 'primer').text) : '""') }));
console.log('errors', p.errors.slice(0, 10)); await c.close();
