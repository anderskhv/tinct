// Browser checks for a scanned (image-only) PDF, from Anders's report of 9 Oct 2026 (iPhone
// Safari and desktop Chrome, Leo Strauss, On Plato's Symposium):
//   1. On the phone the reader always has a visible, tappable way back to My shelf, and a pinch
//      zooms the pages (not the browser page), so the top bar never leaves the screen.
//   2. The scan notice wraps and stays inside the page area: never under the docked chat.
//   3. A scan added on the phone is listed and opens on the desktop (same account), also when the
//      reader leaves at once; the account message is not wiped by the scan notice.
//   node addbooks/web/test/scan-pdf.mjs [screenshot dir]
// Needs the page built (node addbooks/web/scripts/build.mjs) and the app's build (app/dist).
// WebKit (iPhone 14) runs when Playwright's WebKit is installed (/opt/pw-browsers), else is skipped.
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { start, uploadDelay } from './serve.mjs';
import { makePdf } from './make-pdf.mjs';
import { shelfSignIn, addFile, openShelf, uploads } from './shelf.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const REPO = join(HERE, '../../..');
const require = createRequire(join(REPO, 'app/package.json'));
const { chromium, webkit, devices } = require('@playwright/test');
const OUT = process.argv[2] || join(HERE, 'output/scan-pdf'); mkdirSync(OUT, { recursive: true });
const PORT = 4741, ORIGIN = `http://127.0.0.1:${PORT}`;
const EXEC = process.env.CHROMIUM_PATH || (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
const NO_TEXT = 'This PDF is a scan without text, so it can’t be read aloud or summarized.';
const TOO_BIG = 'Kept on this device only: files over 50 MB are not saved to your account.';
// SECTIONS=1,3 runs only those parts (1: way back, 2: the notice, 3: two devices).
const runs = n => !process.env.SECTIONS || process.env.SECTIONS.split(',').includes(String(n));
const results = [];
const check = (name, ok, detail) => { results.push({ name, ok: !!ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail !== undefined ? '  ' + JSON.stringify(detail).slice(0, 400) : ''}`) };

// A book scan: 6 × 9 in pages, each one page-sized picture and no text at all. `tag` makes each
// file its own book (its own SHA-256), so every case starts with a book new to the account.
function scanPdf(tag, pages = 60) {
  const file = join(OUT, `On Platos Symposium scan ${tag}.pdf`);
  writeFileSync(file, makePdf({ info: { Title: `On Plato's Symposium (${tag})`, Author: 'Leo Strauss' }, pages: Array.from({ length: pages }, () => ({ size: [432, 648], images: [{ x: 0, y: 0, w: 432, h: 648, pw: 90, ph: 135 }] })) }));
  return file;
}

async function context(browser, options) {
  const ctx = await browser.newContext(options);
  await ctx.route(/^https:\/\/[a-z0-9]+\.supabase\.co\//, route => route.abort());
  const p = await ctx.newPage();
  const problems = [];
  p.on('pageerror', e => problems.push('pageerror: ' + e.message));
  return { ctx, p, problems };
}
async function ready(p) {
  await p.waitForSelector('.pdf-sheet canvas', { timeout: 30000 });
  await p.waitForFunction(() => /of \d/.test(document.getElementById('pageLabel')?.textContent || ''), null, { timeout: 30000 });
  await p.evaluate(() => document.fonts.ready);
}
// The scan notice, shown once the scan has found no text.
const scanNotice = p => p.waitForFunction(t => document.querySelector('.byob-toast:not([hidden])')?.textContent === t, NO_TEXT, { timeout: 20000 }).then(() => true, () => false);
const accountBooks = async () => (await (await fetch(`${ORIGIN}/__books`)).json()).users['u-test'] || [];

// Where a control is, and whether a tap at its centre reaches it, inside the visible viewport.
const reachable = (p, selector) => p.evaluate(sel => {
  const el = document.querySelector(sel);
  if (!el) return { found: false };
  const r = el.getBoundingClientRect(), vv = window.visualViewport;
  const cs = getComputedStyle(el);
  const x = r.left + r.width / 2, y = r.top + r.height / 2;
  const hit = document.elementFromPoint(x, y);
  // The visual viewport (what is on screen when the browser page is pinch-zoomed), in layout pixels.
  const view = vv ? { left: vv.offsetLeft, top: vv.offsetTop, right: vv.offsetLeft + vv.width, bottom: vv.offsetTop + vv.height, scale: vv.scale } : { left: 0, top: 0, right: innerWidth, bottom: innerHeight, scale: 1 };
  const onScreen = r.width >= 24 && r.height >= 24 && r.left >= view.left && r.top >= view.top && r.right <= view.right && r.bottom <= view.bottom;
  return { found: true, shown: cs.display !== 'none' && cs.visibility !== 'hidden' && Number(cs.opacity) > 0.5, onScreen, hit: !!hit && el.contains(hit), label: el.getAttribute('aria-label'), rect: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], view };
}, selector);
const wayBack = r => r.found && r.shown && r.onScreen && r.hit && r.label === 'Back to library';

const server = await start(PORT);
const browser = await chromium.launch({ executablePath: EXEC, args: ['--mute-audio'] });
let webkitBrowser = null;
try { webkitBrowser = await webkit.launch() } catch (e) { console.log('SKIP  WebKit is not installed here: ' + String(e.message).split('\n')[0]) }
try {
  // ---- 1. Phone: a way back, always ----
  const phones = [['chromium-phone', browser, { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }]];
  if (webkitBrowser) phones.push(['webkit-iphone14', webkitBrowser, devices['iPhone 14']]);
  for (const [name, b, options] of runs(1) ? phones : []) {
    const { ctx, p, problems } = await context(b, options);
    await shelfSignIn(p, ORIGIN);
    await addFile(p, ORIGIN, scanPdf(name));
    await ready(p);
    await scanNotice(p);
    await p.waitForTimeout(300);
    await p.screenshot({ path: join(OUT, `1-${name}-open.png`) });
    const back = await reachable(p, '#backBtn');
    check(`${name}: a visible, tappable way back to My shelf in the top bar`, wayBack(back), back);
    const menu = await reachable(p, '#superBtn');
    check(`${name}: the reader’s menu stays in the top bar too`, menu.shown && menu.onScreen && menu.hit, menu);
    const fits = await p.evaluate(() => { const s = document.querySelector('.pdf-sheet').getBoundingClientRect(); return { left: Math.round(s.left), right: Math.round(s.right), width: innerWidth } });
    check(`${name}: the page fits the screen’s width, with a margin on both sides`, fits.left >= 8 && fits.right <= fits.width - 8, fits);

    if (b === browser) {
      // A pinch on the page, as a reader zooms into a scanned page to read it (two touches;
      // headless Chromium sends the touches but never zooms the browser page itself, so the
      // check is that the pages zoom and the top bar's way back stays put).
      const cdp = await ctx.newCDPSession(p);
      const before = await p.evaluate(() => document.querySelector('.pdf-sheet').getBoundingClientRect().width);
      await cdp.send('Input.synthesizePinchGesture', { x: 195, y: 420, scaleFactor: 2.2, relativeSpeed: 400, gestureSourceType: 'touch' });
      await p.waitForTimeout(700);
      const after = await p.evaluate(() => ({ sheet: document.querySelector('.pdf-sheet').getBoundingClientRect().width, scale: window.visualViewport?.scale ?? 1 }));
      await p.screenshot({ path: join(OUT, `1-${name}-pinched.png`) });
      const backAfter = await reachable(p, '#backBtn');
      check(`${name}: a pinch zooms the pages, not the browser page`, Math.abs(after.scale - 1) < 0.01 && after.sheet > before * 1.3, { before, ...after });
      check(`${name}: after a pinch the way back is still on screen and tappable`, wayBack(backAfter), backAfter);
    }

    // The way back leads to My shelf.
    const went = [];
    p.on('request', r => { if (r.isNavigationRequest()) went.push(new URL(r.url()).pathname) });
    await p.tap('#backBtn', { timeout: 5000 }).catch(() => p.click('#backBtn', { timeout: 5000 })).catch(() => {});
    await p.waitForURL(url => url.pathname === '/library' && url.hash === '#my-shelf', { timeout: 15000 }).catch(() => {});
    check(`${name}: the way back opens My shelf`, new URL(p.url()).pathname === '/library' && new URL(p.url()).hash === '#my-shelf', [p.url(), went]);
    check(`${name}: no page errors`, problems.length === 0, problems);
    await ctx.close();
  }

  // ---- 2. The scan notice stays inside the page area ----
  for (const [name, b, options, dockW] of !runs(2) ? [] : [
    ['desktop-1440', browser, { viewport: { width: 1440, height: 900 } }, 520],
    ['desktop-1280', browser, { viewport: { width: 1280, height: 800 } }, null],
    ['phone-390', browser, { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, null],
  ]) {
    const { ctx, p, problems } = await context(b, options);
    await shelfSignIn(p, ORIGIN);
    // A reader who widened the docked chat (its grip): the notice still stays left of it.
    if (dockW) await p.evaluate(w => localStorage.setItem('tinct-addbook:prefs', JSON.stringify({ dockW: w })), dockW);
    await addFile(p, ORIGIN, scanPdf(name, 4));
    await ready(p);
    const shown = await scanNotice(p);
    await p.waitForTimeout(400);
    await p.screenshot({ path: join(OUT, `2-${name}-notice.png`) });
    const box = await p.evaluate(() => {
      const r = el => { if (!el) return null; const b = el.getBoundingClientRect(); return { left: Math.round(b.left), right: Math.round(b.right), top: Math.round(b.top), bottom: Math.round(b.bottom), width: Math.round(b.width), height: Math.round(b.height) } };
      const dock = document.querySelector('.lab-ask.byob-dock');
      const t = document.querySelector('.byob-toast');
      const range = document.createRange(); range.selectNodeContents(t);
      return { toast: r(t), text: r(range), page: r(document.getElementById('scroll')), dock: dock && getComputedStyle(dock).display !== 'none' ? r(dock) : null, vw: innerWidth, scrollW: t.scrollWidth, clientW: t.clientWidth };
    });
    const inside = box.toast && box.toast.left >= box.page.left + 8 && box.toast.right <= box.page.right - 8 && box.toast.right <= box.vw - 8;
    const clearOfDock = !box.dock || box.toast.right <= box.dock.left - 8;
    // Its words are all inside its box (wrapped, not cut).
    const whole = box.text.left >= box.toast.left && box.text.right <= box.toast.right && box.scrollW <= box.clientW;
    check(`${name}: the scan notice is shown`, shown);
    check(`${name}: the scan notice stays inside the page area${dockW ? ' (docked chat widened)' : ''}`, inside && clearOfDock, box);
    check(`${name}: the scan notice wraps, every word inside it`, whole, box);
    check(`${name}: no page errors`, problems.length === 0, problems);
    await ctx.close();
  }

  // ---- 3. A scan added on the phone opens on the desktop ----
  const phoneOptions = webkitBrowser ? [webkitBrowser, devices['iPhone 14']] : [browser, { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }];
  if (runs(3)) {
    const phone = await context(...phoneOptions);
    await shelfSignIn(phone.p, ORIGIN);
    const file = scanPdf('synced');
    await addFile(phone.p, ORIGIN, file);
    await ready(phone.p);
    const hex = new URL(phone.p.url()).searchParams.get('userBook');
    await phone.p.waitForFunction(() => /Saved to your account/.test(document.querySelector('.byob-toast:not([hidden])')?.textContent || ''), null, { timeout: 30000 }).catch(() => {});
    const stored = (await accountBooks()).find(b => b.sha256.startsWith(hex));
    check('phone: the scan’s private copy is in the account, named by its title', stored?.type === 'pdf' && /Symposium/.test(stored.title) && stored.author === 'Leo Strauss', stored);

    const desk = await context(browser, { viewport: { width: 1440, height: 900 } });
    await shelfSignIn(desk.p, ORIGIN);
    await openShelf(desk.p, ORIGIN);
    const listed = (await uploads(desk.p)).find(u => u.key === 'pdf:' + hex);
    check('desktop: My shelf lists the scan added on the phone', !!listed && /Symposium/.test(listed.title), await uploads(desk.p));
    if (listed) {
      await desk.p.goto(new URL(listed.href, ORIGIN).href);
      await ready(desk.p);
      const opened = await desk.p.evaluate(() => ({ title: document.getElementById('bookTitle').textContent, pages: document.querySelectorAll('.pdf-sheet').length, drawn: document.querySelectorAll('.pdf-sheet canvas').length }));
      check('desktop: the scan opens from the account, its pages drawn', /Symposium/.test(opened.title) && opened.pages === 60 && opened.drawn > 0, opened);
      await desk.p.screenshot({ path: join(OUT, '3-desktop-opened.png') });
    }
    check('phone and desktop: no page errors', phone.problems.length === 0 && desk.problems.length === 0, [...phone.problems, ...desk.problems]);
    await phone.ctx.close(); await desk.ctx.close();
  }

  // The reader leaves at once (the way back), while the account copy is still being sent.
  if (runs(3)) {
    const phone = await context(...phoneOptions);
    await shelfSignIn(phone.p, ORIGIN);
    // A slow connection: the account takes 3 s to receive the upload (a copy cut off by leaving the page never lands).
    uploadDelay.ms = 3000;
    await addFile(phone.p, ORIGIN, scanPdf('left-at-once'));
    await phone.p.waitForSelector('.pdf-sheet', { timeout: 30000 });
    const hex = new URL(phone.p.url()).searchParams.get('userBook');
    await phone.p.waitForTimeout(600);
    // The way back, at once (whether it is visible on the phone is checked above).
    await phone.p.evaluate(() => document.getElementById('backBtn').click());
    await phone.p.waitForURL(url => url.pathname === '/library', { timeout: 20000 }).catch(() => {});
    await phone.p.waitForTimeout(500);
    const stored = (await accountBooks()).find(b => b.sha256.startsWith(hex));
    uploadDelay.ms = 0;
    check('phone: leaving at once still saves the scan to the account (the way back waits for it, briefly)', !!stored && new URL(phone.p.url()).pathname === '/library', { stored: !!stored, url: phone.p.url() });
    const desk = await context(browser, { viewport: { width: 1280, height: 800 } });
    await shelfSignIn(desk.p, ORIGIN);
    await openShelf(desk.p, ORIGIN);
    check('desktop: My shelf lists that scan too', (await uploads(desk.p)).some(u => u.key === 'pdf:' + hex), await uploads(desk.p));
    await phone.ctx.close(); await desk.ctx.close();
  }

  // Why a scan was kept on the phone only is said, not wiped by the scan notice that follows it.
  if (runs(3)) {
    const phone = await context(...phoneOptions);
    await shelfSignIn(phone.p, ORIGIN);
    await phone.ctx.route('**/api/user-books', route => route.request().method() === 'POST' ? route.fulfill({ status: 413, contentType: 'application/json', body: JSON.stringify({ error: 'file_too_large' }) }) : route.continue());
    await phone.p.addInitScript(() => {
      window.__toasts = [];
      // Which message the toast shows, sampled every 50 ms, with how long each one stayed.
      setInterval(() => {
        const t = document.querySelector('.byob-toast');
        const text = t && !t.hidden ? t.textContent : '';
        const last = window.__toasts.at(-1);
        if (last && !last.until && last.text === text) return;
        if (last && !last.until) last.until = performance.now();
        if (text) window.__toasts.push({ text, at: performance.now() });
      }, 50);
    });
    await addFile(phone.p, ORIGIN, scanPdf('too-big', 120));
    await ready(phone.p);
    await phone.p.waitForTimeout(13000);
    const toasts = await phone.p.evaluate(() => window.__toasts.map(t => ({ text: t.text, ms: Math.round((t.until ?? performance.now()) - t.at) })));
    const shownFor = text => toasts.filter(t => t.text === text).reduce((sum, t) => sum + t.ms, 0);
    check('phone: why the scan is kept on this device only stays readable (not replaced by the scan notice)', shownFor(TOO_BIG) >= 3000, toasts);
    check('phone: the scan notice is shown as well', shownFor(NO_TEXT) >= 3000, toasts);
    await phone.ctx.close();
  }
} finally {
  await browser.close();
  await webkitBrowser?.close();
  server.close();
}
const failed = results.filter(r => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed. Screenshots: ${OUT}`);
process.exit(failed.length ? 1 : 0);
