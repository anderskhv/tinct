const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import fs from 'fs';
const S = process.env.FILM_WORK || process.cwd();
const OUT = S + '/cap/reader';
const EXPLAIN = "The Stoics believed one divine reason, the *logos*, orders the whole universe, and that every human mind holds a share of it. That shared spark is why Marcus can call even the rude and ungrateful his kin.";
const CHAT = "He isn’t being cynical. He’s rehearsing. If you expect rudeness before breakfast, it can’t ambush you.\n\nThen comes the turn: the difficult people are his kin, made to work with him “like feet, like hands.” The rehearsal is what lets him stay kind.";
let answer = EXPLAIN, delay = 3000;
const browser = await chromium.launch({ args: ['--hide-scrollbars', '--mute-audio'] });
const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.route('**/api/lab-chat', async route => { await new Promise(r => setTimeout(r, delay)); await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ content: [{ type: 'text', text: answer }], stop_reason: 'end_turn' }) }); });
const meta = {};
const shot = async (name, clip) => { await page.screenshot({ path: `${OUT}/${name}.png`, ...(clip ? { clip } : {}) }); console.log('shot', name); };
await page.goto('http://127.0.0.1:3001/'); await page.waitForTimeout(5000);
await page.getByRole('button', { name: 'Feature Meditations' }).click(); await page.waitForTimeout(2500);
await page.getByRole('button', { name: 'Read' }).first().click(); await page.waitForTimeout(2500);
await page.getByText('Begin reading').first().click(); await page.waitForTimeout(6000);
await page.mouse.move(1590, 890);
await shot('r0-book1');
await page.locator("[aria-label^='Table of contents']").first().click(); await page.waitForTimeout(1500);
await page.locator("[aria-label^='Book 2,']").first().click(); await page.waitForTimeout(5000);
await page.mouse.move(1590, 890); await page.waitForTimeout(800);
await shot('r1-modern');
// rects of phrase "portion of the divine."
meta.phrase = await page.evaluate(() => {
  const words = [...document.querySelectorAll('.lab-hearing-word')].filter(w => w.getBoundingClientRect().x < 800 && w.getBoundingClientRect().width > 0);
  for (let i = 0; i < words.length - 3; i++) {
    if (words[i].textContent === 'portion' && words[i+1].textContent === 'of' && words[i+2].textContent === 'the' && words[i+3].textContent.startsWith('divine')) {
      const r = document.createRange(); r.setStartBefore(words[i]); r.setEndAfter(words[i+3]);
      const b = r.getBoundingClientRect(); return [{ x: b.x, y: b.y, w: b.width, h: b.height }];
    }
  }
  return null;
});
console.log('phrase', JSON.stringify(meta.phrase));
const p = meta.phrase[0];
await page.mouse.move(p.x + 1, p.y + p.h / 2); await page.mouse.down();
await page.mouse.move(p.x + p.w - 1, p.y + p.h / 2, { steps: 10 }); await page.mouse.up(); await page.waitForTimeout(1200);
await page.mouse.move(p.x + p.w - 1, p.y + p.h / 2);
await shot('r3-select');
meta.explainItem = await page.getByText('Explain', { exact: true }).first().boundingBox();
meta.menu = await page.evaluate(() => { const e = [...document.querySelectorAll('button')].find(b => b.textContent.trim().endsWith('Explain')); const m = e && e.closest('[role=menu],[class*=menu]'); const r = (m || e).getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
console.log('explainItem', JSON.stringify(meta.explainItem), 'menu', JSON.stringify(meta.menu));
await page.mouse.move(meta.explainItem.x + 20, meta.explainItem.y + meta.explainItem.height / 2); await page.waitForTimeout(400);
await shot('r3b-hover');
await page.mouse.click(meta.explainItem.x + 20, meta.explainItem.y + meta.explainItem.height / 2);
await page.waitForTimeout(700); await page.mouse.move(1590, 890);
await shot('r4-explain-loading');
await page.waitForTimeout(3500);
await shot('r5-explain');
meta.explainCard = await page.evaluate(() => { const b = document.querySelector("[aria-label='Close explanation']"); let c = b; for (let i = 0; i < 6 && c; i++) { c = c.parentElement; if (c && c.getBoundingClientRect().width > 250) break; } const r = c.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
meta.explainLines = await page.evaluate(() => {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n; const out = [];
  while ((n = walker.nextNode())) { if (n.data.includes('Stoics believed') || n.data.includes('logos') || n.data.includes('orders the whole') || n.data.includes('shared') ) { const r = document.createRange(); r.selectNodeContents(n.parentElement.closest('p') || n.parentElement); [...r.getClientRects()].forEach(x => out.push({ x: x.x, y: x.y, w: x.width, h: x.height })); break; } }
  return out;
});
console.log('explainCard', JSON.stringify(meta.explainCard), 'lines', meta.explainLines.length);
await page.locator("[aria-label='Close explanation']").click(); await page.waitForTimeout(1000);
await page.mouse.click(1200, 880); await page.waitForTimeout(500);
// compare on
await page.getByRole('button', { name: 'Menu' }).click(); await page.waitForTimeout(1000);
await page.getByText('Book editions').first().click(); await page.waitForTimeout(1200);
await page.locator("[data-testid='lab-v2-compare-edition']").click(); await page.waitForTimeout(1200);
await page.locator("button:has-text('Long Translation')").first().click(); await page.waitForTimeout(1200);
await page.locator("[data-testid='lab-v2-show-compare']").click().catch(e => console.log('no toggle', e.message.slice(0, 80)));
await page.waitForTimeout(1500); await page.keyboard.press('Escape'); await page.waitForTimeout(2500);
await page.mouse.move(1590, 890); await page.waitForTimeout(500);
await shot('r2-compare');
meta.compareParas = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll('p, [class*=paragraph]').forEach(el => { const t = el.textContent.trim(); if (/^1\. Begin (each|the) morning/.test(t)) { const r = el.getBoundingClientRect(); if (r.width > 100 && r.width < 900) out.push({ x: r.x, y: r.y, w: r.width, h: r.height, t: t.slice(0, 40) }); } });
  return out;
});
console.log('compareParas', JSON.stringify(meta.compareParas));
// compare off again for chat
await page.getByRole('button', { name: 'Menu' }).click(); await page.waitForTimeout(1000);
await page.getByText('Book editions').first().click(); await page.waitForTimeout(1200);
await page.locator("[data-testid='lab-v2-show-compare']").click().catch(() => {});
await page.waitForTimeout(1200); await page.keyboard.press('Escape'); await page.waitForTimeout(2000);
// chat
answer = CHAT; delay = 6000;
await page.getByRole('button', { name: 'Menu' }).click(); await page.waitForTimeout(1000);
await page.getByText('Chat', { exact: true }).first().click(); await page.waitForTimeout(2000);
await page.mouse.move(1590, 890);
await shot('r6-chat-empty');
meta.chatPanel = await page.evaluate(() => { const b = document.querySelector("[aria-label='Close chat']"); let c = b; for (let i = 0; i < 8 && c; i++) { c = c.parentElement; if (c && c.getBoundingClientRect().height > 500) break; } const r = c.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
console.log('chatPanel', JSON.stringify(meta.chatPanel));
const q = 'Why does he expect the worst of people?';
await page.locator('textarea').first().click();
const clip = { x: meta.chatPanel.x - 10, y: meta.chatPanel.y - 10, width: meta.chatPanel.w + 20, height: meta.chatPanel.h + 20 };
meta.clip = clip;
let k = 0;
for (let i = 1; i <= q.length; i++) { await page.keyboard.type(q[i - 1]); if (i % 3 === 0 || i === q.length) { await shot(`r7-type-${String(k++).padStart(2, '0')}`, clip); } }
meta.typeFrames = k;
await page.mouse.move(1590, 890);
await shot('r7-typed');
await page.keyboard.press('Enter'); await page.waitForTimeout(1500);
await shot('r8-thinking');
await page.waitForTimeout(6000);
await shot('r9-answer');
meta.chatLines = await page.evaluate(() => {
  const t = [...document.querySelectorAll('.lab-ask-turn.is-assistant')].pop(); if (!t) return [];
  const out = []; t.querySelectorAll('p').forEach(p => { const r = document.createRange(); r.selectNodeContents(p); [...r.getClientRects()].forEach(x => out.push({ x: x.x, y: x.y, w: x.width, h: x.height })); });
  return out;
});
console.log('chatLines', meta.chatLines.length);
fs.writeFileSync(OUT + '/meta.json', JSON.stringify(meta, null, 1));
await browser.close();
