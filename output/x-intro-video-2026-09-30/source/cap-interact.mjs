const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import fs from 'fs';
const S = process.env.FILM_WORK || process.cwd();
const OUT = S + '/cap/interact'; fs.mkdirSync(OUT, { recursive: true });
const DT = 1000 / 24;
const EXPLAIN = "The Stoics believed one divine reason, the *logos*, orders the whole universe, and that every human mind holds a share of it. That shared spark is why Marcus can call even the rude and ungrateful his kin.";
const CHAT = "He isn’t being cynical. He’s rehearsing. If you expect rudeness before breakfast, it can’t ambush you.\n\nThen comes the turn: the difficult people are his kin, made to work with him “like feet, like hands.” The rehearsal is what lets him stay kind.";
const browser = await chromium.launch({ args: ['--hide-scrollbars', '--mute-audio'] });
const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 2 });
await ctx.addInitScript({ path: S + '/vclock.js' });
await ctx.addInitScript({ path: S + '/stream.js' });
const page = await ctx.newPage();
page.on('console', m => { if (m.type() === 'error') console.log('CONSOLE', m.text().slice(0, 160)); });
await page.goto('http://127.0.0.1:3001/'); await page.waitForTimeout(5000);
await page.getByRole('button', { name: 'Feature Meditations' }).click(); await page.waitForTimeout(2500);
await page.getByRole('button', { name: 'Read' }).first().click(); await page.waitForTimeout(2500);
await page.getByText('Begin reading').first().click(); await page.waitForTimeout(6000);
await page.locator("[aria-label^='Table of contents']").first().click(); await page.waitForTimeout(1500);
await page.locator("[aria-label^='Book 2,']").first().click(); await page.waitForTimeout(5000);
let mouse = { x: 700, y: 820 };
await page.mouse.move(mouse.x, mouse.y); await page.waitForTimeout(1000);
const phrase = await page.evaluate(() => {
  const words = [...document.querySelectorAll('.lab-hearing-word')].filter(w => w.getBoundingClientRect().x < 800 && w.getBoundingClientRect().width > 0);
  for (let i = 0; i < words.length - 3; i++) if (words[i].textContent === 'portion' && words[i + 1].textContent === 'of' && words[i + 2].textContent === 'the' && words[i + 3].textContent.startsWith('divine')) { const r = document.createRange(); r.setStartBefore(words[i]); r.setEndAfter(words[i + 3]); const b = r.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; }
});
console.log('phrase', phrase);
await page.evaluate(() => window.__vc.freeze());
const meta = { phrase, frames: [] };
let f = 0;
const shoot = async (label, extra = {}) => {
  await page.evaluate(ms => window.__vc.step(ms), DT);
  await page.evaluate(() => new Promise(r => setTimeout(r, 40)));
  await page.screenshot({ path: `${OUT}/i${String(f).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 94 });
  meta.frames.push({ f, label, mouse: { ...mouse }, ...extra }); f++;
};
const idle = async (n, label) => { for (let i = 0; i < n; i++) await shoot(label); };
const ease = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
const glide = async (to, n, label) => { const from = { ...mouse }; for (let i = 1; i <= n; i++) { const e = ease(i / n); mouse = { x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e }; await page.mouse.move(mouse.x, mouse.y); await shoot(label); } };
// ---- Explain ----
const y = phrase.y + phrase.h / 2;
await glide({ x: phrase.x + 1, y }, 10, 'approach');
await page.mouse.down(); meta.frames.push({ event: 'down', at: f });
await glide({ x: phrase.x + phrase.w - 1, y }, 12, 'drag');
await page.mouse.up(); meta.frames.push({ event: 'up', at: f });
await idle(10, 'menu');
const ex = await page.getByText('Explain', { exact: true }).first().boundingBox();
meta.explainItem = ex;
await glide({ x: ex.x + 18, y: ex.y + ex.height / 2 }, 9, 'toExplain');
await idle(3, 'hover');
await page.mouse.down(); await page.mouse.up(); meta.frames.push({ event: 'click-explain', at: f });
await page.evaluate(() => new Promise(r => setTimeout(r, 80)));
await idle(10, 'loading');
console.log('stream opened', await page.evaluate(() => window.__streamOpened));
let words = EXPLAIN.split(/(?<=\s)/);
for (let i = 0; i < words.length; i += 2) { await page.evaluate(t => window.__stream && window.__stream.push(t), words.slice(i, i + 2).join('')); await page.evaluate(() => new Promise(r => setTimeout(r, 30))); await shoot('streamE'); }
await page.evaluate(() => window.__stream.end());
await glide({ x: 700, y: 860 }, 8, 'settleE');
await idle(12, 'settleE');
meta.explainEnd = f;
// close explanation & open chat (not recorded, but clock stepped)
await page.locator("[aria-label='Close explanation']").click();
for (let i = 0; i < 20; i++) { await page.evaluate(ms => window.__vc.step(ms), DT); await page.waitForTimeout(20); }
await page.mouse.click(1250, 870);
for (let i = 0; i < 10; i++) { await page.evaluate(ms => window.__vc.step(ms), DT); await page.waitForTimeout(20); }
await page.getByRole('button', { name: 'Menu' }).click();
for (let i = 0; i < 20; i++) { await page.evaluate(ms => window.__vc.step(ms), DT); await page.waitForTimeout(20); }
meta.chatOpenAt = f;
mouse = { x: 1000, y: 700 };
await page.mouse.move(mouse.x, mouse.y);
await idle(2, 'menuOpen');
const chatItem = await page.getByText('Chat', { exact: true }).first().boundingBox();
meta.chatItem = chatItem;
await glide({ x: chatItem.x + 20, y: chatItem.y + chatItem.height / 2 }, 8, 'toChat');
await page.mouse.down(); await page.mouse.up(); meta.frames.push({ event: 'click-chat', at: f });
await page.evaluate(() => new Promise(r => setTimeout(r, 80)));
await idle(14, 'chatOpening');
const ta = await page.locator('textarea').first().boundingBox();
meta.textarea = ta;
await glide({ x: ta.x + 60, y: ta.y + ta.height / 2 }, 8, 'toInput');
await page.mouse.down(); await page.mouse.up();
await idle(2, 'focus');
const q = 'Why does he expect the worst of people?';
for (let i = 0; i < q.length; i += 2) { await page.keyboard.type(q.slice(i, i + 2)); await page.evaluate(() => new Promise(r => setTimeout(r, 20))); await shoot('type'); }
await idle(4, 'typed');
await page.keyboard.press('Enter'); meta.frames.push({ event: 'enter', at: f });
await page.evaluate(() => new Promise(r => setTimeout(r, 80)));
await idle(10, 'thinking');
words = CHAT.split(/(?<=\s)/);
for (let i = 0; i < words.length; i += 3) { await page.evaluate(t => window.__stream && window.__stream.push(t), words.slice(i, i + 3).join('')); await page.evaluate(() => new Promise(r => setTimeout(r, 30))); await shoot('streamC'); }
await page.evaluate(() => window.__stream.end());
await idle(16, 'settleC');
meta.total = f;
fs.writeFileSync(OUT + '/meta.json', JSON.stringify(meta, null, 1));
console.log('frames', f);
await browser.close();
