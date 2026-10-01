const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import fs from 'fs';
const S = process.env.FILM_WORK || process.cwd();
const OUT = S + '/cap/v2-read'; fs.mkdirSync(OUT, { recursive: true });
const DT = 1000 / 24;
const EXPLAIN = "“Seat” here means home. Walton knows the pole should be a frozen wasteland, yet he can’t stop picturing it as a paradise of endless light.";
const CHAT = "Not literally. Shelley wrote it in 1818.\n\nBut she asks the question we’re asking now: what does a creator owe the mind it brings to life? Watch how Victor answers it.";
const browser = await chromium.launch({ args: ['--hide-scrollbars', '--mute-audio'] });
const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 2 });
await ctx.addInitScript({ path: S + '/vclock.js' });
await ctx.addInitScript({ path: S + '/stream.js' });
const page = await ctx.newPage();
page.on('console', m => { if (m.type() === 'error') console.log('CONSOLE', m.text().slice(0, 160)); });
await page.goto('http://127.0.0.1:3001/'); await page.waitForTimeout(5000);
await page.getByRole('button', { name: 'Read' }).first().click(); await page.waitForTimeout(2500);
await page.getByText('Begin reading').first().click(); await page.waitForTimeout(6000);
await page.mouse.move(1590, 890); await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/r1.png` });
await page.getByRole('button', { name: 'Menu' }).click(); await page.waitForTimeout(1000);
await page.getByText('Book editions').first().click(); await page.waitForTimeout(1200);
await page.locator("[data-testid='lab-v2-compare-edition']").click(); await page.waitForTimeout(1200);
await page.locator("button:has-text('Original')").first().click(); await page.waitForTimeout(1200);
await page.locator("[data-testid='lab-v2-show-compare']").click();
await page.waitForTimeout(1500); await page.keyboard.press('Escape'); await page.waitForTimeout(2500);
let mouse = { x: 1590, y: 890 };
await page.mouse.move(mouse.x, mouse.y); await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/r2.png` });
const phrase = await page.evaluate(() => {
  const words = [...document.querySelectorAll('.lab-hearing-word')].filter(w => w.getBoundingClientRect().x > 800 && w.getBoundingClientRect().width > 0);
  for (let i = 0; i < words.length - 5; i++) if (words[i].textContent === 'the' && words[i + 1].textContent === 'seat' && words[i + 2].textContent === 'of' && words[i + 5].textContent.startsWith('desolation')) {
    const r = document.createRange(); r.setStartBefore(words[i]); r.setEndAfter(words[i + 5]);
    const rects = [...r.getClientRects()].map(b => ({ x: b.x, y: b.y, w: b.width, h: b.height }));
    const a = words[i].getBoundingClientRect(), z = words[i + 5].getBoundingClientRect();
    return { start: { x: a.x + 1, y: a.y + a.height / 2 }, end: { x: z.x + z.width - 6, y: z.y + z.height / 2 }, rects };
  }
});
console.log('phrase', JSON.stringify(phrase));
await page.evaluate(() => window.__vc.freeze());
const meta = { phrase, frames: [] };
let f = 0;
const shoot = async (label) => {
  await page.evaluate(ms => window.__vc.step(ms), DT);
  await page.evaluate(() => new Promise(r => setTimeout(r, 40)));
  await page.screenshot({ path: `${OUT}/i${String(f).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 94 });
  meta.frames.push({ f, label, mouse: { ...mouse } }); f++;
};
const idle = async (n, label) => { for (let i = 0; i < n; i++) await shoot(label); };
const ease = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
const glide = async (to, n, label) => { const from = { ...mouse }; for (let i = 1; i <= n; i++) { const e = ease(i / n); mouse = { x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e }; await page.mouse.move(mouse.x, mouse.y); await shoot(label); } };
const evt = (name) => meta.frames.push({ event: name, at: f });
await idle(4, 'idle');
await glide(phrase.start, 12, 'approach');
await page.mouse.down(); evt('down');
await glide(phrase.end, 14, 'drag');
await page.mouse.up(); evt('up');
await idle(9, 'menu');
const ex = await page.getByText('Explain', { exact: true }).first().boundingBox().catch(() => null);
console.log('explain item', JSON.stringify(ex));
meta.explainItem = ex;
await glide({ x: ex.x + 18, y: ex.y + ex.height / 2 }, 9, 'toExplain');
await idle(3, 'hover');
await page.mouse.down(); await page.mouse.up(); evt('click-explain');
await page.evaluate(() => new Promise(r => setTimeout(r, 80)));
await idle(9, 'loading');
let words = EXPLAIN.split(/(?<=\s)/);
for (let i = 0; i < words.length; i += 3) { await page.evaluate(t => window.__stream.push(t), words.slice(i, i + 3).join('')); await page.evaluate(() => new Promise(r => setTimeout(r, 30))); await shoot('streamE'); }
await page.evaluate(() => window.__stream.end()); evt('endE');
await idle(3, 'answerE');
await glide({ x: 1180, y: 880 }, 10, 'settleE');
await idle(10, 'settleE');
meta.explainEnd = f;
await page.locator("[aria-label='Close explanation']").click();
for (let i = 0; i < 20; i++) { await page.evaluate(ms => window.__vc.step(ms), DT); await page.waitForTimeout(20); }
await page.mouse.click(1250, 880);
for (let i = 0; i < 10; i++) { await page.evaluate(ms => window.__vc.step(ms), DT); await page.waitForTimeout(20); }
await page.getByRole('button', { name: 'Menu' }).click();
for (let i = 0; i < 20; i++) { await page.evaluate(ms => window.__vc.step(ms), DT); await page.waitForTimeout(20); }
const chatItem = await page.getByText('Chat', { exact: true }).first().boundingBox();
mouse = { x: chatItem.x + 20, y: chatItem.y + chatItem.height / 2 };
await page.mouse.move(mouse.x, mouse.y);
await page.mouse.down(); await page.mouse.up(); evt('click-chat');
meta.chatStart = f;
await page.evaluate(() => new Promise(r => setTimeout(r, 80)));
await idle(14, 'chatOpening');
const ta = await page.locator('textarea').first().boundingBox();
meta.textarea = ta;
await glide({ x: ta.x + 70, y: ta.y + ta.height / 2 }, 9, 'toInput');
await page.mouse.down(); await page.mouse.up(); evt('click-input');
await idle(2, 'focus');
const q = 'Is this book really about AI?';
for (let i = 0; i < q.length; i += 2) { await page.keyboard.type(q.slice(i, i + 2)); await page.evaluate(() => new Promise(r => setTimeout(r, 20))); await shoot('type'); }
await idle(4, 'typed');
await page.keyboard.press('Enter'); evt('enter');
await page.evaluate(() => new Promise(r => setTimeout(r, 80)));
await idle(8, 'thinking');
words = CHAT.split(/(?<=\s)/);
for (let i = 0; i < words.length; i += 2) { await page.evaluate(t => window.__stream.push(t), words.slice(i, i + 2).join('')); await page.evaluate(() => new Promise(r => setTimeout(r, 30))); await shoot('streamC'); }
await page.evaluate(() => window.__stream.end()); evt('endC');
await idle(20, 'settleC');
meta.total = f;
fs.writeFileSync(OUT + '/meta.json', JSON.stringify(meta, null, 1));
console.log('frames', f);
await browser.close();
