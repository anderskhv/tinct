// Records a scripted walk through the real Tinct app on a phone-sized viewport.
// Output: out/recording/{f00001.jpg..., manifest.json} — frames with timestamps
// (CDP screencast at 3x) plus named markers that edit.json cuts on.
//
//   node record.mjs                       # against https://tinct.app
//   TINCT_ORIGIN=http://localhost:8787 node record.mjs
//   node record.mjs --headed              # watch it (needs a display)
import fs from 'node:fs';
import path from 'node:path';
import { launch, OUT } from './lib.mjs';

const ORIGIN = process.env.TINCT_ORIGIN || 'https://tinct.app';
const REC = path.join(OUT, 'recording');
const DEBUG = process.argv.includes('--debug');
// Slow-motion factor: the page runs K times slower than real time (see timewarp.js),
// so a headless capture that manages ~6 fps yields ~30 fps of story time.
const K = Number(process.env.PROMO_SLOW || 5);
fs.rmSync(REC, { recursive: true, force: true });
fs.mkdirSync(REC, { recursive: true });

// 390x790 CSS px = an iPhone 15 screen (844) minus the status bar the stage draws.
const VIEW = { width: 390, height: 790 };
const DPR = 3;

const browser = await launch({ headless: !process.argv.includes('--headed') });
const ctx = await browser.newContext({
  viewport: VIEW, deviceScaleFactor: DPR, isMobile: true, hasTouch: true,
  serviceWorkers: 'block', colorScheme: 'light',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
});

await ctx.addInitScript({ content: `window.__PROMO_K=${K};\n` + fs.readFileSync(new URL('./timewarp.js', import.meta.url), 'utf8') });

// Fresh guest with a voice already chosen; visible touch ripples for the viewer.
await ctx.addInitScript(() => {
  try {
    localStorage.removeItem('tinct:lab-ai-actions');
    localStorage.setItem('tinct-lab-prefs', JSON.stringify({ theme: 'light', primaryEdition: 'original-en', voicePersona: 'female', voicePersonaChosen: true }));
  } catch {}
  const style = document.createElement('style');
  style.textContent = `.promo-touch{position:fixed;z-index:2147483647;pointer-events:none;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;
    background:rgba(255,255,255,.55);box-shadow:0 0 0 1.5px rgba(31,74,92,.55),0 2px 10px rgba(0,0,0,.18);transform:scale(.6);opacity:0;
    transition:transform .18s ease-out,opacity .18s ease-out}
    .promo-touch.on{transform:scale(1);opacity:1}.promo-touch.off{transform:scale(1.5);opacity:0;transition:transform .35s ease-out,opacity .35s ease-out}`;
  const add = () => document.documentElement.appendChild(style);
  document.documentElement ? add() : addEventListener('DOMContentLoaded', add);
  window.__promoTouch = (x, y, phase) => {
    let el = window.__promoTouchEl;
    if (phase === 'down') {
      el?.remove();
      el = window.__promoTouchEl = document.createElement('div');
      el.className = 'promo-touch'; el.style.left = x + 'px'; el.style.top = y + 'px';
      document.documentElement.appendChild(el);
      requestAnimationFrame(() => el.classList.add('on'));
    } else if (phase === 'move' && el) { el.style.left = x + 'px'; el.style.top = y + 'px'; }
    else if (el) { el.classList.add('off'); const e = el; setTimeout(() => e.remove(), 400); window.__promoTouchEl = null; }
  };
});

// The librarian reply is canned by default: a real one is an Anthropic API call on
// Tinct's production key, and CLAUDE.md bans API spend in development.
// PROMO_REAL_CHAT=1 opts in to the live librarian (costs one guest message).
if (!process.env.PROMO_REAL_CHAT) {
  await ctx.route('**/api/lab-chat', (r) => r.fulfill({ contentType: 'application/json', body: JSON.stringify({ content: [{ type: 'text',
    text: 'For ambition and what we owe the things we make, start with **Frankenstein**: a young scientist creates life, then abandons it.\n\n[[book:frankenstein]]' }] }) }));
}
const STOP_AFTER = process.env.PROMO_STOP_AFTER;
const page = await ctx.newPage();
page.on('console', (m) => { if (DEBUG && ['error', 'warning'].includes(m.type())) console.log('  [console]', m.text().slice(0, 200)); });
page.on('pageerror', (e) => console.error('[page]', e.message));
page.setDefaultTimeout(30000 * K);
const cdp = await ctx.newCDPSession(page);

// ---- screencast ----
const frames = [];
const markers = [];
let t0 = null;
const now = () => (Date.now() / 1000 - t0) / K;
cdp.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
  cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
  if (t0 == null) return;
  const file = `f${String(frames.length + 1).padStart(5, '0')}.jpg`;
  fs.writeFileSync(path.join(REC, file), Buffer.from(data, 'base64'));
  frames.push({ file, t: Math.max(0, (metadata.timestamp - t0) / K) });
});
class Stop extends Error {}
const mark = (name) => {
  markers.push({ name, t: now() }); console.log(`  ▸ ${name} @ ${now().toFixed(1)}s`);
  if (STOP_AFTER && markers.at(-2)?.name === STOP_AFTER) throw new Stop();
};
const wait = (ms) => page.waitForTimeout(ms * K); // story-time milliseconds
const T = (ms) => ms * K; // story-time timeout -> real
const shot = async (name) => { if (DEBUG) await page.screenshot({ path: path.join(OUT, `debug-${name}.png`) }); };

// ---- human-ish input ----
async function center(locator) {
  const b = await locator.boundingBox();
  if (!b) throw new Error('no bounding box for ' + locator);
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
}
async function touchAt(x, y, holdMs = 90) {
  await page.evaluate(([x, y]) => window.__promoTouch(x, y, 'down'), [x, y]);
  await wait(140);
  await page.evaluate(([x, y]) => {
    const el = document.elementFromPoint(x, y);
    const o = { pointerType: 'touch', pointerId: 1, isPrimary: true, clientX: x, clientY: y, bubbles: true, cancelable: true, composed: true };
    el.dispatchEvent(new PointerEvent('pointerdown', o));
    window.__promoHeld = { el, o };
  }, [x, y]);
  await wait(holdMs);
  const needsClick = await page.evaluate(() => {
    const { el, o } = window.__promoHeld;
    el.dispatchEvent(new PointerEvent('pointerup', o));
    return true;
  });
  return needsClick;
}
// Tap = visible ripple + a real Playwright tap (fires touch, pointer and click).
async function tap(locator) {
  await locator.waitFor({ state: 'visible' });
  const inView = await locator.evaluate((el) => { const r = el.getBoundingClientRect(); return r.top >= 70 && r.bottom <= innerHeight - 150; }); // clear of headers and docked inputs
  if (!inView) { await locator.evaluate((el) => el.scrollIntoView({ behavior: 'smooth', block: 'center' })); await wait(1300); }
  const box = await locator.boundingBox();
  const { x, y } = await center(locator);
  await page.evaluate(([x, y]) => window.__promoTouch(x, y, 'down'), [x, y]);
  await wait(160);
  await locator.tap({ position: { x: x - box.x, y: y - box.y } });
  await page.evaluate(() => window.__promoTouch(0, 0, 'up')).catch(() => {}); // tap may have navigated
}
// Long press via pointer events (what the reader listens to for words).
async function press(locator, holdMs = 450) {
  await locator.scrollIntoViewIfNeeded();
  const { x, y } = await center(locator);
  await touchAt(x, y, holdMs);
  await page.evaluate(() => window.__promoTouch(0, 0, 'up'));
}
async function typeSlowly(locator, text) {
  await locator.click();
  for (const ch of text) { await page.keyboard.type(ch); await wait(38 + Math.random() * 45); }
}
// Smooth finger swipe in a scroll container (or the page).
async function swipe(selector, dy, ms = 900) {
  const steps = Math.round(ms / 16);
  const x = VIEW.width * 0.62, y0 = VIEW.height * 0.72;
  await page.evaluate(([x, y]) => window.__promoTouch(x, y, 'down'), [x, y0]);
  for (let i = 1; i <= steps; i++) {
    const k = 0.5 - Math.cos(Math.PI * i / steps) / 2, prev = 0.5 - Math.cos(Math.PI * (i - 1) / steps) / 2;
    await page.evaluate(([sel, d, x, y]) => {
      const el = sel ? document.querySelector(sel) : document.scrollingElement;
      el.scrollBy(0, d); window.__promoTouch(x, y, 'move');
    }, [selector, dy * (k - prev), x, y0 - dy * k * 0.35]);
    await wait(16);
  }
  await page.evaluate(() => window.__promoTouch(0, 0, 'up'));
}

// ================= the walk-through =================
async function walk() {
await page.goto(`${ORIGIN}/library`, { waitUntil: 'networkidle' });
await page.locator('#hero-title').waitFor();
await wait(2500); // cover art + hero image settle
await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: VIEW.width * DPR, maxHeight: VIEW.height * DPR, everyNthFrame: 1 });
t0 = Date.now() / 1000;
await wait(300);

// 1. Library
mark('library');
await wait(2200);
await shot('library');
mark('library-scroll');
await swipe(null, 520, 1600);
await wait(900);
await swipe(null, -520, 1200);
await wait(700);

// 2. Librarian chat
mark('librarian');
await tap(page.locator('#librarian'));
await page.locator('#chat:not([disabled])').waitFor({ timeout: T(20000) });
await wait(900);
await shot('librarian-panel');
await tap(page.locator('#chat'));
const box = page.getByRole('textbox', { name: 'Message the librarian' });
await box.waitFor();
await wait(500);
mark('librarian-ask');
await typeSlowly(box, 'Something gothic about ambition and what we owe the things we create');
await wait(400);
await tap(page.getByRole('button', { name: 'Send' }));
mark('librarian-thinking');
const bookCard = page.locator('.library-assistant-books button').filter({ hasText: /Frankenstein/ }).first();
await bookCard.waitFor({ timeout: T(60000) });
mark('librarian-answer');
await wait(4500);
await shot('librarian-answer');

// 3. Open Frankenstein from the recommendation
mark('open-book');
await tap(bookCard);
await page.locator('#book-overlay').waitFor({ state: 'visible', timeout: T(15000) }).catch(() => {});
await wait(1200);
await shot('book-overlay');
mark('book-intro');
// Phone layout shows the book's slip first; step through to the introduction.
const begin = page.locator('#begin-reading');
const onScreen = (loc) => loc.evaluate((el) => { const r = el.getBoundingClientRect(); return el.checkVisibility() && r.width > 0 && r.left >= 0 && r.right <= innerWidth; }).catch(() => false);
for (let i = 0; i < 6 && !(await onScreen(begin)); i++) {
  const next = page.locator('#slip-next');
  if (await onScreen(next)) { await wait(1800); await tap(next); await wait(1200); await shot('slip-' + i); }
  else await wait(700);
}
const charactersTab = page.locator('[data-tab=characters]');
if (await onScreen(charactersTab)) { await wait(1500); await tap(charactersTab); await wait(2600); }
await shot('book-characters');
// Pick the original 1831 text (its opening narration is cached for guests).
mark('edition');
await tap(page.locator('[data-tab=edition]'));
await wait(1300);
await tap(page.locator('summary[aria-label="Reading edition"]'));
await wait(1100);
await tap(page.locator('.edition-option').filter({ hasText: 'Original (1831)' }).first());
await wait(1400);
await shot('edition');
mark('begin-reading');
await tap(page.locator('#begin-reading'));
await page.waitForURL(/\/reader/, { timeout: T(20000) });
await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady === 'true', null, { timeout: T(30000) });
mark('reader');
await wait(2500);
await shot('reader');

// 4. Listen with word-by-word highlighting
mark('listen');
await tap(page.locator('[data-testid="lab-v2-play"]:visible, [data-testid="lab-listen"]:visible').first());
await page.waitForFunction(() => document.querySelector('.lab-hearing-word.is-current, [data-testid="lab-word"].is-current'), null, { timeout: T(30000) })
  .catch(() => console.warn('  ! no word highlight seen'));
mark('listening');
await wait(9000);
await shot('listening');
await tap(page.locator('[data-testid="lab-v2-play"]:visible, [data-testid="lab-listen"]:visible, [data-testid="lab-v2-pause"]:visible').first()).catch(() => {});
mark('paused');
await wait(900);

// 5. Character card — long-press a name
const word = (re) => page.locator('[data-testid="lab-word"]:visible').filter({ hasText: re }).first();
const nameWord = word(/^Saville/);
mark('character');
if (await nameWord.count()) {
  await press(nameWord, 480);
  await page.locator('.selection-popup[data-popup-mode="character"]').waitFor({ timeout: T(8000) }).catch(() => console.warn('  ! no character popup'));
  await wait(3800);
  await shot('character');
  await page.keyboard.press('Escape');
  await wait(800);
} else console.warn('  ! no character name on screen');

// 6. Look up a word you don't know
mark('define');
const hard = word(/^forebodings/);
if (await hard.count()) {
  await press(hard, 450);
  await page.locator('.popup-define').waitFor({ timeout: T(8000) }).catch(() => console.warn('  ! no define popup'));
  await wait(3800);
  await shot('define');
  await page.keyboard.press('Escape');
  await wait(800);
} else console.warn('  ! lookup word not on screen');
mark('end');
await wait(600);
}
try { await walk(); } catch (e) { if (!(e instanceof Stop)) throw e; console.log('  (stopped early)'); }

await cdp.send('Page.stopScreencast');
await wait(300);
fs.writeFileSync(path.join(REC, 'manifest.json'), JSON.stringify({ origin: ORIGIN, view: VIEW, dpr: DPR, frames, markers }, null, 1));
console.log(`Recorded ${frames.length} frames over ${now().toFixed(1)}s -> ${REC}`);
await browser.close();
