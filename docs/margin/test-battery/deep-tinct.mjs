import { open, select as select0, locate, toTop, timeAnswer } from './th.mjs'; import { sleep } from './lib.mjs'; import fs from 'fs';
const T = JSON.parse(fs.readFileSync(process.env.TS || 'testset.json', 'utf8')); const OD = process.env.OUTD || 'deep'; const OUT = OD + '/tinct.jsonl'; fs.mkdirSync(OD, { recursive: true });
const done = new Set(fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l).id) : []);
const save = o => fs.appendFileSync(OUT, JSON.stringify(o) + '\n');
let { c, p } = await open();
async function select(page, ph) { for (let k = 0; k < 4; k++) { await select0(page, ph); await sleep(500); if (await page.locator('.mr-bar').isVisible().catch(() => false)) return; await page.keyboard.press('Escape'); await sleep(800); } throw new Error('bar did not appear after 4 tries'); }
const ANS = '.mr-card.is-open .mr-answer';
const cardText = () => p.evaluate(() => document.querySelector('.mr-card.is-open')?.innerText || '');
async function closeAll() { for (let i = 0; i < 3; i++) { await p.keyboard.press('Escape'); await sleep(200); } await p.mouse.click(60, 500); await sleep(300); }
async function more(row) { await p.locator('.mr-bar .mr-bar__item:has-text("More"), .mr-bar .mr-bar__item[aria-label="More"]').first().click(); await sleep(450); await p.locator('.mr-more__row', { hasText: row }).first().click(); }
async function run(id, fn) {
  if (done.has(id)) return; let rec;
  try { rec = await fn(); } catch (e) { rec = { error: e.message.split('\n')[0] }; await p.screenshot({ path: `${OD}/t-${id}-fail.png` }).catch(() => {}); }
  save({ id, ...rec }); console.log(id, rec.error || `${rec.first}/${rec.last}ms`); await closeAll();
}
for (const [i, ph] of T.explain.entries()) await run(`explain-${i}`, async () => { await select(p, ph); const t0 = Date.now(); await p.locator('.mr-bar .mr-bar__item', { hasText: 'Explain' }).first().click(); const r = await timeAnswer(p, t0, ANS); return { passage: ph, ...r, card: await cardText() }; });
for (const [i, ph] of T.simplify.entries()) await run(`simplify-${i}`, async () => { await select(p, ph); const t0 = Date.now(); await p.locator('.mr-bar .mr-bar__item', { hasText: 'Simplify' }).first().click(); const r = await timeAnswer(p, t0, ANS); return { passage: ph, ...r, card: await cardText() }; });
for (const [i, w] of T.define.entries()) await run(`define-${i}`, async () => { const r = await locate(p, w); const t0 = Date.now(); await p.mouse.dblclick(r.x1 + (r.x2 - r.x1) / 2, r.y1); let txt = '', first = 0; for (let k = 0; k < 20; k++) { await sleep(250); txt = await p.evaluate(() => document.querySelector('.mr-define')?.innerText || ''); if (txt && !first) first = Date.now() - t0; } return { passage: w, first, last: Date.now() - t0, text: txt }; });
for (const [i, ph] of T.factcheck.entries()) await run(`factcheck-${i}`, async () => { await select(p, ph); const t0 = Date.now(); await more('Fact-check'); const r = await timeAnswer(p, t0, ANS + ', .mr-card.is-open .mr-sources', 150000); return { passage: ph, ...r, card: await cardText() }; });
for (const [i, ph] of T.counterpoint.entries()) await run(`counterpoint-${i}`, async () => { await select(p, ph); const t0 = Date.now(); await more('Counterpoint'); const r = await timeAnswer(p, t0, ANS); return { passage: ph, ...r, card: await cardText() }; });
for (const [i, [ph, q]] of T.ask.entries()) await run(`ask-${i}`, async () => { await select(p, ph); await p.keyboard.type(q, { delay: 5 }); const t0 = Date.now(); await p.keyboard.press('Enter'); const r = await timeAnswer(p, t0, ANS); return { passage: ph, question: q, ...r, card: await cardText() }; });
for (const [i, ph] of T.quiz.entries()) await run(`quiz-${i}`, async () => {
  await select(p, ph); const t0 = Date.now(); await more('Quiz'); for (let k = 0; k < 80; k++) { await sleep(400); if (await p.locator('.mr-card.is-open .mr-question').count()) break; }
  const first = Date.now() - t0; const steps = [];
  for (let q = 0; q < 3; q++) {
    await sleep(600); const qtext = await p.evaluate(() => document.querySelector('.mr-card.is-open .mr-question')?.innerText || '');
    if (q === 1) { await p.locator('.mr-card.is-open .mr-follow__link', { hasText: 'Show answer' }).first().click(); await sleep(900); steps.push({ q: qtext, mode: 'show', card: await cardText() }); }
    else { const ans = q === 0 ? 'I don\'t know' : 'It makes the model more accurate'; await p.locator('.mr-card.is-open .mr-follow__input, .mr-card.is-open textarea').first().click(); await p.keyboard.type(ans, { delay: 5 }); const tm = Date.now(); await p.keyboard.press('Enter'); for (let k = 0; k < 40; k++) { await sleep(350); if (/Right\.|Nearly\.|Not yet\./.test(await cardText())) break; } steps.push({ q: qtext, mode: 'answer', answer: ans, markMs: Date.now() - tm, card: await cardText() }); }
    const next = p.locator('.mr-card.is-open .mr-follow__link', { hasText: /Next|score/ }).first(); if (await next.count()) await next.click();
  }
  await sleep(1200); return { passage: ph, first, last: Date.now() - t0, steps, end: await cardText(), text: steps.map(s => s.q).join(' | ') };
});
const answers = () => p.evaluate(() => [...document.querySelectorAll('.mr-card.is-open .mr-answer')].map(e => e.innerText));
for (const [i, q] of T.whole.entries()) await run(`whole-${i}`, async () => {
  await closeAll(); await p.keyboard.press('/'); await sleep(7000);
  const before = (await answers()).length; await p.keyboard.type(q, { delay: 5 }); const t0 = Date.now(); await p.keyboard.press('Enter');
  let first = 0, last = 0, prev = '', since = 0;
  while (Date.now() - t0 < 120000) { const a = await answers(); const t = a.length > before ? a[a.length - 1] : ''; const now = Date.now(); if (t.length > 20 && !first) first = now - t0; if (t !== prev) { prev = t; since = now; last = now - t0; } if (first && now - since > 3500) break; await sleep(250); }
  return { question: q, first, last, text: prev };
});
await run('primer', async () => { await toTop(p); await p.mouse.click(60, 500); const t0 = Date.now(); await p.keyboard.press('b');
  let txt = ''; for (let k = 0; k < 360; k++) { await sleep(500); txt = await p.evaluate(() => document.querySelector('.mr-primer')?.innerText || ''); if (txt && !/Thinking|loading/i.test(txt) && txt.length > 150) break; }
  return { first: 0, last: Date.now() - t0, text: txt }; });
console.log('errors', p.errors.slice(0, 10)); await c.close();
