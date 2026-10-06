// End-to-end checks in headless Chromium under production's CSP, with the chat API mocked.
//   node addbooks/web/test/e2e.mjs            (needs a build: node addbooks/web/scripts/build.mjs,
//                                              and the app's, for the Tinct reader: npm run build in app/)
// Playwright comes from app/node_modules (no new dependency). Screenshots go to
// addbooks/web/test/output/.
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { start } from './serve.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const REPO = join(HERE, '../../..');
const require = createRequire(join(REPO, 'app/package.json'));
const { chromium } = require('@playwright/test');
const OUT = join(HERE, 'output'); mkdirSync(OUT, { recursive: true });
const FIX = join(HERE, 'fixtures');
const PORT = 4721, BASE = `http://127.0.0.1:${PORT}/lab/addbook/`;
// CHROMIUM_PATH picks a browser binary; otherwise the shared cloud install, else Playwright's own.
const EXEC = process.env.CHROMIUM_PATH || (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
const RIGHTS = "I confirm I have the right to read this file in Tinct, and I'm responsible for it (Terms §4).";
const SESSION_KEY = 'sb-yazjyiqsxjystvpkyouk-auth-token';
// An EPUB opens in the Tinct reader: /reader?userBook=<the first 24 hex digits of its SHA-256>.
const READER_URL = /\/reader\?userBook=[0-9a-f]{24}$/;
// The Tinct reader, ready with its text on the page.
async function tinctReader(p) {
  await p.waitForURL(READER_URL, { timeout: 30000 });
  await p.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true' && document.querySelectorAll('.lab-page-wrap [data-testid="lab-word"]').length > 20, null, { timeout: 30000 });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(300);
}
// Drag across words on the page, as a reader does with a mouse: it highlights them and opens the popup.
async function dragWords(p, from, to) {
  const words = p.locator('.lab-page-wrap [data-testid="lab-word"]');
  const a = await words.nth(from).boundingBox(), z = await words.nth(to).boundingBox();
  await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await p.mouse.down();
  await p.mouse.move(z.x + z.width / 2, z.y + z.height / 2, { steps: 12 }); await p.mouse.up();
  await p.waitForSelector('.selection-popup', { timeout: 5000 });
}

async function ensureFixture(name, url) {
  const file = join(FIX, name);
  if (!existsSync(file)) { mkdirSync(FIX, { recursive: true }); const r = await fetch(url); if (!r.ok) throw new Error('fixture download failed: ' + url); writeFileSync(file, Buffer.from(await r.arrayBuffer())) }
  return file;
}

// A small text PDF with a figure, printed by the test browser itself (Gutenberg no longer
// serves a PDF of The Time Machine). PDF_FIXTURE or /tmp/claude-0/pdf/sample.pdf override it.
async function samplePdf(browser) {
  const file = join(FIX, 'sample.pdf');
  if (existsSync(file)) return file;
  mkdirSync(FIX, { recursive: true });
  const para = i => `<p>Paragraph ${i + 1}. The Time Traveller (for so it will be convenient to speak of him) was expounding a recondite matter to us. His grey eyes shone and twinkled, and his usually pale face was flushed and animated. The fire burned brightly, and the soft radiance of the incandescent lights caught the bubbles that flashed and passed in our glasses.</p>`;
  const figure = `<figure><svg width="420" height="220" viewBox="0 0 420 220"><rect x="10" y="10" width="400" height="200" fill="none" stroke="#000" stroke-width="2"/><path d="M30 190 L120 60 L210 140 L300 40 L390 120" fill="none" stroke="#000" stroke-width="3"/><text x="40" y="35" font-size="16">Time</text><text x="330" y="200" font-size="16">Space</text></svg><figcaption>Figure 1. The four dimensions, drawn as a line through time.</figcaption></figure>`;
  const html = `<!doctype html><meta charset="utf-8"><title>The Time Machine (sample)</title><style>body{font:16px/1.5 Georgia,serif;margin:0}h1{font-size:28px}figure{margin:24px 0}</style><h1>The Time Machine (sample)</h1>${Array.from({ length: 40 }, (_, i) => para(i) + (i === 3 ? figure : '')).join('')}`;
  const ctx = await browser.newContext(); const page = await ctx.newPage();
  await page.setContent(html);
  writeFileSync(file, await page.pdf({ format: 'A4', margin: { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' } }));
  await ctx.close();
  return file;
}

// A short paper with no outline and no printed contents, as a word processor exports it:
// its metadata Title is just the file name, the title is printed large on page 1, the
// section headings are bold at body size, and every page has a running head.
async function paperPdf(browser) {
  const file = join(FIX, 'Constructor_theory_of_time_SUB_Version.pdf');
  if (existsSync(file)) return file;
  mkdirSync(FIX, { recursive: true });
  const para = i => `<p>Paragraph ${i + 1}. In the traditional conception of laws of physics, time is the parameter on which physical quantities depend, and this dependence is typically expressed through differential equations in which time is an independent variable that nothing can change.</p>`;
  const section = (title, n) => `<h2>${title}</h2>${Array.from({ length: n }, (_, i) => para(i)).join('')}`;
  const html = `<!doctype html><meta charset="utf-8"><title>Constructor_theory_of_time_SUB_Version</title><style>body{font:16px/1.5 Georgia,serif;margin:0}h1{font-size:30px;font-weight:bold;margin:0 0 10px}.by{font-size:21px;margin:0 0 24px}h2{font-size:16px;font-weight:bold;margin:22px 0 10px}</style>
    <h1>Constructor theory of time</h1><p class="by">David Deutsch &amp; Chiara Marletto</p>
    <p>Constructor theory is a research programme in fundamental physics proposing the principle that the laws of physics are expressible exclusively as specifications of which transformations of physical systems can be brought about.</p>
    ${section('1. Introduction: why time is problematic', 12)}${section('2. Inaccuracy, unreliability and limits', 12)}${section('3. Possible and impossible tasks', 12)}`;
  const ctx = await browser.newContext(); const page = await ctx.newPage();
  await page.setContent(html);
  writeFileSync(file, await page.pdf({ format: 'A4', displayHeaderFooter: true, headerTemplate: '<div style="font:bold 16px Georgia,serif;width:100%;text-align:center">Deutsch &amp; Marletto · Constructor theory of time · <span class="pageNumber"></span></div>', footerTemplate: '<div></div>', margin: { top: '22mm', bottom: '20mm', left: '20mm', right: '20mm' } }));
  await ctx.close();
  return file;
}
// A PDF whose metadata carries its real title, under an unhelpful file name.
async function titledPdf(browser) {
  const file = join(FIX, 'scan_0042.pdf');
  if (existsSync(file)) return file;
  mkdirSync(FIX, { recursive: true });
  const ctx = await browser.newContext(); const page = await ctx.newPage();
  await page.setContent(`<!doctype html><meta charset="utf-8"><title>Notes on Natural Philosophy</title><style>body{font:16px/1.5 Georgia,serif}h1{font-size:30px}</style><h1>Draft 3</h1>${'<p>The motion of bodies is governed by forces, and the forces by the bodies that bear them, so that each part of nature acts upon every other part.</p>'.repeat(6)}`);
  writeFileSync(file, await page.pdf({ format: 'A4' }));
  await ctx.close();
  return file;
}

const results = [];
const check = (name, ok, detail) => { results.push({ name, ok: !!ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  ' + JSON.stringify(detail).slice(0, 300) : ''}`) };

async function page(browser, viewport, opts = {}) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, ...opts });
  // The Tinct reader's auth client never reaches the real Supabase from a test. A lapsed
  // sign-in renews there as it does on tinct.app (same account and token); nothing else answers.
  await ctx.route(/^https:\/\/[a-z0-9]+\.supabase\.co\//, route => {
    const req = route.request();
    if (!/\/auth\/v1\/token\?grant_type=refresh_token/.test(req.url())) return route.abort();
    const token = String(JSON.parse(req.postData() || '{}').refresh_token || '').replace(/^refresh-/, '');
    const user = { 'test-token': 'u-test', 'cloud-token': 'u-cloud', 'other-token': 'u-other' }[token] || 'u-test';
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ access_token: token, refresh_token: 'refresh-' + token, token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, user: { id: user, aud: 'authenticated', email: 'reader@example.com' } }) });
  });
  const p = await ctx.newPage();
  const problems = [];
  p.on('pageerror', e => problems.push('pageerror: ' + e.message));
  // Resource failures are judged by URL: the favicon is the app's, and the 401 is the expired-token test.
  p.on('response', r => { if (r.status() >= 400 && !/favicon/.test(r.url()) && !(r.status() === 401 && r.url().endsWith('/api/chat'))) problems.push(`http ${r.status()}: ${r.url()}`) });
  p.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) problems.push('console: ' + m.text()) });
  await p.addInitScript(() => document.addEventListener('securitypolicyviolation', e => console.error('CSP violation: ' + e.violatedDirective + ' ' + e.blockedURI)));
  return { ctx, p, problems };
}
// Opening a file needs an account; the rights confirmation comes once per account.
// Returns what the confirmation showed, or null when it was not asked.
async function openFile(p, file) {
  const chooser = p.waitForEvent('filechooser');
  await p.click('#abDrop');
  await (await chooser).setFiles(file);
  await Promise.race([p.waitForSelector('#attestBox, .epub-sheet, .pdf-sheet, .pdf-status[role="alert"]', { timeout: 30000 }), p.waitForURL(READER_URL, { timeout: 30000 })]);
  const box = !READER_URL.test(p.url()) && await p.$('#attestBox');
  if (!box) return null;
  const shown = await p.evaluate(() => ({ text: document.querySelector('#attestBox').closest('label').textContent.trim(), disabled: document.getElementById('attestOk').disabled, button: document.getElementById('attestOk').textContent.trim(),
    overStart: !document.getElementById('start').hidden && document.getElementById('root').hidden && !document.getElementById('root').contains(document.getElementById('attestBox')) }));
  await box.check(); await p.click('#attestOk');
  return shown;
}
// A Tinct session as tinct.app stores it. `expired`: the account is known but its token
// has lapsed, so the companion uses the guest route.
async function signIn(p, { expired = false, token = 'test-token', user = 'u-test' } = {}) {
  await p.evaluate(([key, expired, token, user]) => localStorage.setItem(key, JSON.stringify({ access_token: token, refresh_token: 'refresh-' + token, token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + (expired ? -60 : 3600), user: { id: user, email: 'reader@example.com' } })), [SESSION_KEY, expired, token, user]);
  await p.reload();
  await p.waitForSelector('#doorOwn');
}
const bookState = async () => (await fetch(`http://127.0.0.1:${PORT}/__books`)).json();
const lastRequest = async () => (await (await fetch(`http://127.0.0.1:${PORT}/__requests`)).json()).at(-1);
// Drag a snip box over the middle of a PDF page in view, then Explain it.
async function snipAndExplain(p) {
  await p.click('#superBtn'); await p.click('.lab-super-row[data-row="snip"]');
  await p.waitForSelector('.byob-snip');
  const r = await p.evaluate(() => {
    const ov = document.querySelector('.byob-snip').getBoundingClientRect();
    const sheet = [...document.querySelectorAll('.pdf-sheet')].map(s => s.getBoundingClientRect()).find(b => b.bottom > ov.top + 160 && b.top < innerHeight - 160 && b.right > ov.left + 160);
    const top = Math.max(sheet.top, ov.top) + 40, left = Math.max(sheet.left, ov.left) + 30, right = Math.min(sheet.right, ov.right) - 30;
    return { x1: left, y1: top, x2: left + Math.min(260, right - left), y2: Math.min(top + 180, innerHeight - 40) };
  });
  await p.mouse.move(r.x1, r.y1); await p.mouse.down(); await p.mouse.move(r.x2, r.y2, { steps: 10 }); await p.mouse.up();
  await p.waitForSelector('.byob-snip-pop [data-a="explain"]', { timeout: 10000 });
  const turns = await p.locator('.lab-ask-turn.is-assistant').count();
  await p.click('.byob-snip-pop [data-a="explain"]');
  await p.waitForFunction(n => document.querySelectorAll('.lab-ask-turn.is-assistant:not(:has(.byob-live))').length > n && /MOCK ANSWER/.test([...document.querySelectorAll('.lab-ask-turn.is-assistant')].at(-1)?.textContent || ''), turns, { timeout: 20000 });
  return { request: await lastRequest(), answer: await p.locator('.lab-ask-turn.is-assistant').last().textContent() };
}

const server = await start(PORT);
const browser = await chromium.launch({ executablePath: EXEC, args: ['--mute-audio'] });
try {
  const epub = await ensureFixture('pg35.epub', 'https://www.gutenberg.org/ebooks/35.epub3.images');
  const pdf = process.env.PDF_FIXTURE || (existsSync('/tmp/claude-0/pdf/sample.pdf') ? '/tmp/claude-0/pdf/sample.pdf' : await samplePdf(browser));

  // ---- Desktop: start page, search, EPUB, PDF ----
  const { ctx, p, problems } = await page(browser, { width: 1440, height: 900 });
  await p.goto(BASE);
  await p.waitForSelector('#doorOwn');
  check('start page shows both doors', await p.isVisible('#doorOwn') && await p.isVisible('#doorFree'));
  // Signed out: your own book needs a free account; searching stays open.
  const gate = await p.evaluate(() => ({ drop: !document.getElementById('abDrop').hidden, gate: !document.getElementById('abGate').hidden, text: document.querySelector('#abGate .ab-gate-copy').textContent.trim(), links: [...document.querySelectorAll('#abGate a')].map(a => [a.textContent.trim(), a.getAttribute('href')]) }));
  check('signed out: own book asks for a free account', gate.gate && !gate.drop && gate.text === 'Add books to your shelf with a free account.'
    && gate.links.length === 2 && gate.links[0][0] === 'Create account' && gate.links[0][1] === '/sign-in?mode=create&returnTo=%2Flab%2Faddbook%2F'
    && gate.links[1][0] === 'Sign in' && gate.links[1][1] === '/sign-in?returnTo=%2Flab%2Faddbook%2F', gate);
  {
    const chooser = p.waitForEvent('filechooser', { timeout: 1500 }).catch(() => null);
    await p.evaluate(() => window.TinctReader.pickFile());
    check('signed out: no file can be opened', !(await chooser) && await p.isVisible('#abGate') && !(await p.isVisible('#root')));
  }
  await p.waitForFunction(() => /free books/.test(document.getElementById('abCatalogStatus').textContent), null, { timeout: 60000 });
  check('catalogue loads', true, await p.textContent('#abCatalogStatus'));
  await p.screenshot({ path: join(OUT, 'desktop-start.png') });

  await p.fill('#abQuery', 'time machine wells');
  await p.waitForSelector('.ab-result', { timeout: 15000 });
  const first = await p.locator('.ab-result h3').first().textContent();
  check('search finds The Time Machine', /time machine/i.test(first), first);
  const getHref = await p.locator('.ab-result [data-get]').first().getAttribute('href');
  check('result links to its source library', /^https:\/\//.test(getHref || ''), getHref);
  await p.locator('.ab-result [data-get]').first().evaluate(a => a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })));
  check('"Downloaded? Open it here" appears after Get', await p.locator('.ab-result [data-then]').first().isVisible());
  await p.screenshot({ path: join(OUT, 'desktop-search.png') });

  // A known account whose token has lapsed: files open, the companion uses the guest route.
  await signIn(p, { expired: true });
  check('signed in: own book opens files', await p.isVisible('#abDrop') && !(await p.isVisible('#abGate')));
  // The rights confirmation is a pop-up over the start page; Cancel stays there.
  {
    const chooser = p.waitForEvent('filechooser');
    await p.click('#abDrop');
    await (await chooser).setFiles(epub);
    await p.waitForSelector('#attestBox', { timeout: 30000 });
    const over = await p.evaluate(() => ({ view: document.body.dataset.view, start: !document.getElementById('start').hidden, root: !document.getElementById('root').hidden, title: document.title,
      sheet: document.querySelector('#attestBox').closest('.lab-v2-sheet')?.getAttribute('aria-label'), text: document.querySelector('.byob-attest p').textContent.trim() }));
    check('the rights confirmation opens over the start page, not an empty reader', over.view === 'start' && over.start && !over.root && over.title === 'Add a book · Tinct' && over.sheet === 'Your own book'
      && /^Tinct opens pg35\.epub here and keeps a private copy in your account/.test(over.text), over);
    await p.screenshot({ path: join(OUT, 'desktop-rights-over-start.png') });
    await p.click('#attestCancel');
    await p.waitForTimeout(300);
    const after = await p.evaluate(() => ({ view: document.body.dataset.view, start: !document.getElementById('start').hidden, root: !document.getElementById('root').hidden, sheet: !!document.querySelector('#attestBox, .byob-sheet-host'), hash: location.hash, rights: localStorage.getItem('tinct-addbook:rights:u-test') }));
    check('Cancel stays on the start page and opens nothing', after.view === 'start' && after.start && !after.root && !after.sheet && after.hash === '' && !after.rights && await p.isVisible('#doorOwn'), after);
  }
  const rights = await openFile(p, epub);
  check('first file asks for the rights confirmation, with the approved copy', rights?.text === RIGHTS && rights.button === 'Continue' && rights.overStart, rights);
  check('Continue stays disabled until the box is ticked', rights?.disabled === true);
  check('the confirmation is kept per account under tinct-addbook:', await p.evaluate(() => !!localStorage.getItem('tinct-addbook:rights:u-test')));
  // The EPUB opens in the Tinct reader, not in Add a book's own view.
  await tinctReader(p);
  const hex = p.url().match(/userBook=([0-9a-f]{24})/)[1];
  const epubInfo = await p.evaluate(() => ({ title: document.querySelector('[data-testid="lab-header-book"]').textContent, chapter: document.querySelector('[data-testid="lab-header-chapter"]').textContent.trim(), words: document.querySelectorAll('.lab-page-wrap [data-testid="lab-word"]').length, oldView: document.querySelectorAll('.epub-sheet, .epub-pg').length, play: !!document.querySelector('[data-testid="lab-v2-play"]'), docTitle: document.title }));
  check('EPUB opens in the Tinct reader at /reader?userBook=', /time machine/i.test(epubInfo.title) && epubInfo.words > 20 && epubInfo.oldView === 0 && /Time Machine · Tinct$/i.test(epubInfo.docTitle), epubInfo);
  check('Tinct reader: narration is not offered for a user book', !epubInfo.play);
  await p.screenshot({ path: join(OUT, 'desktop-tinct-epub.png') });
  // Chapters from the book's contents, in the reader's own Contents.
  await p.click('[data-testid="lab-header-chapter"]');
  await p.waitForSelector('[data-testid^="lab-tree-chapter-"]');
  const tocCount = await p.locator('[data-testid^="lab-tree-chapter-"]').count();
  check('EPUB chapters in the Tinct contents', tocCount > 5, tocCount);
  await p.screenshot({ path: join(OUT, 'desktop-tinct-epub-contents.png') });
  await p.locator('[data-testid^="lab-tree-chapter-"]').nth(3).click();
  await p.waitForFunction(() => document.querySelector('[data-testid="lab-root"]').dataset.chapter === '4', null, { timeout: 10000 });
  await tinctReader(p);
  const chapter4 = await p.textContent('[data-testid="lab-header-chapter"]');
  check('a chapter opens from the contents', await p.evaluate(() => document.querySelector('[data-testid="lab-root"]').dataset.chapter) === '4', chapter4.trim());

  // Explain → companion (the reader renewed the lapsed sign-in) with the passage and the chapter's text, never the book's id.
  await dragWords(p, 4, 14);
  await p.locator('.selection-popup .popup-menu-action', { hasText: 'Explain' }).click();
  await p.waitForFunction(() => /MOCK ANSWER/.test(document.querySelector('.selection-popup')?.textContent || ''), null, { timeout: 15000 });
  const last = await lastRequest();
  const ctxSent = last.body.companion.context;
  check('Explain goes to the companion with the passage and the chapter text, not the book id', last.path === '/api/chat' && last.auth === 'Bearer test-token' && last.body.companion.intent === 'explain' && last.body.companion.selection.split(/\s+/).length >= 10
    && /time machine/i.test(ctxSent.bookTitle) && ctxSent.paragraphs.length > 3 && ctxSent.bookId === undefined && ctxSent.editionKey === undefined && !JSON.stringify(last.body).includes('userbook-'),
    { path: last.path, intent: last.body.companion.intent, title: ctxSent.bookTitle, chapter: ctxSent.chapterLabel, bookId: ctxSent.bookId });
  await p.screenshot({ path: join(OUT, 'desktop-tinct-epub-explain.png') });
  await p.keyboard.press('Escape');
  await p.waitForTimeout(300);

  // Highlight: saved in this browser under the user book, drawn on the page.
  await dragWords(p, 20, 34);
  await p.locator('.selection-popup .popup-menu-action', { hasText: /^Highlight$/ }).first().click();
  await p.waitForFunction(() => JSON.parse(localStorage.getItem('tinct-lab-highlights') || '[]').length > 0, null, { timeout: 5000 }).catch(() => {});
  const hl = await p.evaluate(() => JSON.parse(localStorage.getItem('tinct-lab-highlights') || '[]').map(h => ({ bookId: h.bookId, chapter: h.chapterNumber, color: h.color, words: h.toWord - h.fromWord })));
  await p.keyboard.press('Escape');
  await p.waitForTimeout(300);
  const drawn = await p.evaluate(() => document.querySelectorAll('.lab-page-wrap [class*="highlight"]').length);
  check('Tinct reader: highlight saved on this device under the user book and drawn', hl.length === 1 && hl[0].bookId === 'userbook-' + hex && hl[0].chapter === 4 && drawn > 0, { hl, drawn });
  await p.screenshot({ path: join(OUT, 'desktop-tinct-epub-highlight.png') });
  const place = await p.evaluate(h => JSON.parse(localStorage.getItem('tinct-addbook:place:' + h) || 'null'), hex);
  check('Tinct reader: the place is kept on this device', place?.chapterNumber === 4, place);

  // The back arrow returns to Add a book, with the book on "Your books".
  await p.click('[data-testid="lab-library-back"]');
  await p.waitForURL(/\/lab\/addbook\/$/, { timeout: 10000 });
  await p.waitForSelector('#abShelf:not([hidden]) .ab-book');
  check('back arrow returns to Your books', /time machine/i.test(await p.textContent('#abBooks')) && await p.isVisible('#abShelf'), p.url());
  await p.screenshot({ path: join(OUT, 'desktop-shelf.png') });
  await p.click('.ab-book-open');
  await tinctReader(p);
  check('reopens from Your books at the saved chapter', await p.evaluate(() => document.querySelector('[data-testid="lab-root"]').dataset.chapter) === '4');
  await p.goBack();
  await p.waitForSelector('#doorOwn:visible');
  check('browser Back returns to the start page', await p.isVisible('#doorOwn'));

  // PDF
  const again = await openFile(p, pdf);
  check('the rights confirmation is asked once per account', again === null);
  await p.waitForSelector('.pdf-sheet canvas', { timeout: 30000 });
  await p.waitForSelector('.text-layer span', { timeout: 15000 });
  check('PDF renders with a text layer', true);
  await p.screenshot({ path: join(OUT, 'desktop-pdf.png') });
  const sp = await p.evaluate(() => { const s = [...document.querySelectorAll('.text-layer span')].find(x => x.textContent.trim().length > 25 && x.getBoundingClientRect().top > 100); s.scrollIntoView({ block: 'center' }); return null });
  await p.waitForTimeout(400);
  const box = await p.evaluate(() => { const s = [...document.querySelectorAll('.text-layer span')].find(x => x.textContent.trim().length > 25 && x.getBoundingClientRect().top > 100 && x.getBoundingClientRect().bottom < innerHeight); const r = s.getBoundingClientRect(); return { x1: r.left + 2, y: r.top + r.height / 2, x2: r.right - 2 } });
  await p.mouse.move(box.x1, box.y); await p.mouse.down(); await p.mouse.move(box.x2, box.y, { steps: 8 }); await p.mouse.up();
  await p.waitForSelector('.selection-popup [data-a="ask"]', { timeout: 5000 });
  await p.click('.selection-popup [data-a="ask"]');
  await p.fill('#lab-ask-input', 'What does this mean?'); await p.press('#lab-ask-input', 'Enter');
  await p.waitForFunction(() => /What does this mean/.test(document.querySelector('.lab-ask-thread')?.textContent || '') && /MOCK ANSWER/.test([...document.querySelectorAll('.lab-ask-turn.is-assistant')].at(-1)?.textContent || ''), null, { timeout: 15000 });
  check('Ask works in a PDF', true);
  await p.screenshot({ path: join(OUT, 'desktop-pdf-ask.png') });

  // Signed in: the request carries the account token to /api/chat.
  await p.evaluate(() => localStorage.setItem('sb-yazjyiqsxjystvpkyouk-auth-token', JSON.stringify({ access_token: 'test-token', expires_at: Math.floor(Date.now() / 1000) + 3600, user: { id: 'u-test', email: 'reader@example.com' } })));
  await p.fill('#lab-ask-input', 'And signed in?'); await p.press('#lab-ask-input', 'Enter');
  await p.waitForFunction(() => /api\/chat\)/.test([...document.querySelectorAll('.lab-ask-turn.is-assistant')].at(-1)?.textContent || ''), null, { timeout: 15000 });
  const signed = (await (await fetch(`http://127.0.0.1:${PORT}/__requests`)).json()).at(-1);
  check('signed-in calls use /api/chat with the account token', signed.path === '/api/chat' && signed.auth === 'Bearer test-token', { path: signed.path, auth: signed.auth });

  // Signed in, a snipped figure goes to /api/chat as an image block before the question.
  {
    const { request, answer } = await snipAndExplain(p);
    const content = request.body.messages.at(-1).content;
    const img = Array.isArray(content) ? content.find(b => b.type === 'image') : null;
    const text = Array.isArray(content) ? content.at(-1) : null;
    check('signed in: a figure snip reaches /api/chat as an image block', request.path === '/api/chat' && request.auth === 'Bearer test-token' && !!img
      && ['image/png', 'image/jpeg'].includes(img.source.media_type) && img.source.type === 'base64' && img.source.data.length > 200
      && text?.type === 'text' && /Explain this figure/.test(text.text) && request.body.messages.slice(0, -1).every(m => typeof m.content === 'string') && /\[1 image\]/.test(answer),
    { path: request.path, blocks: Array.isArray(content) ? content.map(b => b.type === 'image' ? `${b.type}:${b.source.media_type}:${b.source.data.length}` : b.type) : typeof content });
    await p.screenshot({ path: join(OUT, 'desktop-pdf-snip.png') });
  }
  // A lapsed sign-in: the snip falls back to text on the guest companion.
  await p.evaluate(key => { const s = JSON.parse(localStorage.getItem(key)); s.expires_at = Math.floor(Date.now() / 1000) - 60; localStorage.setItem(key, JSON.stringify(s)) }, SESSION_KEY);
  {
    const { request, answer } = await snipAndExplain(p);
    check('guest: a snip falls back to text on /api/lab-chat', request.path === '/api/lab-chat' && !request.auth && request.body.messages.every(m => typeof m.content === 'string') && /can’t receive pictures/.test(answer), { path: request.path, answer: answer.slice(-160) });
  }

  // Expired token: falls back to the guest route, and says so.
  await p.evaluate(() => localStorage.setItem('sb-yazjyiqsxjystvpkyouk-auth-token', JSON.stringify({ access_token: 'expired-token', expires_at: Math.floor(Date.now() / 1000) + 3600, user: { id: 'u-test' } })));
  await p.fill('#lab-ask-input', 'After expiry?'); await p.press('#lab-ask-input', 'Enter');
  await p.waitForFunction(() => /api\/lab-chat\)/.test([...document.querySelectorAll('.lab-ask-turn.is-assistant')].at(-1)?.textContent || ''), null, { timeout: 15000 });
  check('an expired sign-in falls back to the guest companion', true);
  await p.evaluate(() => localStorage.removeItem('sb-yazjyiqsxjystvpkyouk-auth-token'));

  // Export notes downloads a Markdown file.
  const dl = p.waitForEvent('download', { timeout: 8000 }).catch(() => null);
  await p.click('#superBtn'); await p.click('.lab-super-row[data-row="export"]');
  const file = await dl;
  check('Export notes saves a Markdown file', !!file && /\.md$/.test(file.suggestedFilename()), file?.suggestedFilename());
  check('desktop: no page errors or CSP violations', !problems.length, problems.slice(0, 6));
  await ctx.close();

  // ---- Titles, headings, the top bar and Back to library ----
  {
    const { ctx, p, problems } = await page(browser, { width: 1440, height: 900 });
    await p.goto(BASE);
    await signIn(p, { token: 'test-token', user: 'u-titles' });
    const paper = await paperPdf(browser);
    await openFile(p, paper);
    await p.waitForSelector('.pdf-sheet canvas', { timeout: 30000 });
    // Its metadata Title is just the file name, so the title printed large on page 1 is used.
    const shown = await p.evaluate(() => ({ title: document.getElementById('bookTitle').textContent, doc: document.title, contents: document.getElementById('bookBtn').getAttribute('aria-label') }));
    check('title: from page 1 when the metadata title is just the file name', shown.title === 'Constructor theory of time' && shown.doc === 'Constructor theory of time · Tinct' && shown.contents === 'Contents of Constructor theory of time', shown);
    // Top bar: Back to library at the left; Play and the t menu at the right; no snip button.
    const bar = await p.evaluate(() => {
      const back = document.getElementById('backBtn'), hdr = document.getElementById('hdr');
      return { back: back && { label: back.getAttribute('aria-label'), text: back.textContent.trim(), left: back.getBoundingClientRect().left, visible: back.getBoundingClientRect().width > 0 }, title: document.getElementById('bookBtn').getBoundingClientRect().left,
        controls: [...hdr.querySelectorAll('.lab-header-controls button')].map(b => b.id), snip: !!document.querySelector('#snipBtn, .byob-snip-btn') };
    });
    check('top bar: icon-only Back to library at the left', bar.back?.label === 'Back to library' && bar.back.text === '' && bar.back.visible && bar.back.left < bar.title && bar.back.left < 40, bar.back);
    check('top bar: no snip button, Play and the menu remain', !bar.snip && bar.controls.join(',') === 'playBtn,superBtn', bar.controls);
    await p.waitForFunction(() => /Saved to your account\./.test(document.querySelector('.byob-toast:not([hidden])')?.textContent || ''), null, { timeout: 15000 });
    // test-token is the server's account u-test.
    const acct = ((await bookState()).users['u-test'] || []).filter(b => b.name === 'Constructor_theory_of_time_SUB_Version.pdf');
    check('title: the account copy is stored under the document title', acct.length === 1 && acct[0].title === 'Constructor theory of time' && acct[0].name === 'Constructor_theory_of_time_SUB_Version.pdf', acct.map(b => ({ name: b.name, title: b.title })));
    await p.screenshot({ path: join(OUT, 'desktop-pdf-title-topbar.png') });
    await p.screenshot({ path: join(OUT, 'desktop-topbar.png'), clip: { x: 0, y: 0, width: 1440, height: 60 } });
    // No outline and no printed contents: the contents popover lists the headings, with Go to page.
    await p.click('#pageBtn');
    await p.waitForSelector('.lab-contents-v2 .tree [data-go]', { timeout: 15000 });
    const toc = await p.evaluate(() => ({ title: document.querySelector('.lab-contents-v2 .title').textContent, rows: [...document.querySelectorAll('.lab-contents-v2 [data-go]')].map(b => [b.querySelector('.text').textContent, b.getAttribute('aria-label')]), jump: !!document.querySelector('.lab-contents-v2 .byob-toc-jump:not([hidden]) #jumpInput'), none: /no table of contents/.test(document.querySelector('.lab-contents-v2').textContent) }));
    const labels = toc.rows.map(r => r[0]);
    check('headings: an outline-less PDF gets its sections from its headings', labels.join(' | ') === '1. Introduction: why time is problematic | 2. Inaccuracy, unreliability and limits | 3. Possible and impossible tasks' && !toc.none, labels);
    check('headings: the title block and running heads are left out; Go to page stays', toc.jump && toc.title === 'Constructor theory of time' && !labels.some(l => /Marletto|^Constructor theory of time$/.test(l)), toc);
    await p.screenshot({ path: join(OUT, 'desktop-pdf-headings.png') });
    const target = await p.evaluate(() => Number(document.querySelectorAll('.lab-contents-v2 [data-go]')[2].getAttribute('aria-label').match(/page (\d+)$/)[1]));
    await p.locator('.lab-contents-v2 [data-go]').nth(2).click();
    await p.waitForFunction(t => /^3\. Possible and impossible tasks/.test(document.getElementById('pageLabel').textContent) && new RegExp(`^p\\. ${t} ·`).test(document.getElementById('progress').textContent), target, { timeout: 5000 }).catch(() => {});
    const at = await p.evaluate(() => ({ label: document.getElementById('pageLabel').textContent, progress: document.getElementById('progress').textContent }));
    check('headings: choosing one goes to its page and names the section', target > 1 && at.label === '3. Possible and impossible tasks' && at.progress.startsWith(`p. ${target} ·`), { target, ...at });
    // Back to library: the start page, with "Your books" in view, under the document title.
    await p.click('#backBtn');
    await p.waitForSelector('#abShelf:not([hidden]) .ab-book', { timeout: 10000 });
    await p.waitForTimeout(300);
    const back = await p.evaluate(() => { const r = document.getElementById('abShelf').getBoundingClientRect(); return { view: document.body.dataset.view, start: !document.getElementById('start').hidden, root: !document.getElementById('root').hidden, inView: r.top >= 0 && r.top < innerHeight && r.bottom <= innerHeight + 1, hash: location.hash, books: document.getElementById('abBooks').textContent.replace(/\s+/g, ' ').trim() } });
    check('Back to library returns to the start page with Your books in view', back.view === 'start' && back.start && !back.root && back.inView && back.hash === '', back);
    check('title: Your books lists the document title', /Constructor theory of time/.test(back.books) && !/SUB|_/.test(back.books), back.books);
    await p.screenshot({ path: join(OUT, 'desktop-back-to-shelf.png') });
    // The start page scrolls by hand too (the app's stylesheet pins body to the viewport for the reader).
    await p.evaluate(() => scrollTo(0, 0)); await p.mouse.move(700, 400); await p.mouse.wheel(0, 500); await p.waitForTimeout(400);
    check('the start page scrolls with the wheel', await p.evaluate(() => document.documentElement.scrollHeight > innerHeight && scrollY > 0));
    // A real metadata Title wins over the page and the file name.
    await openFile(p, await titledPdf(browser));
    await p.waitForSelector('.pdf-sheet canvas', { timeout: 30000 });
    check('title: from the PDF metadata when it is a real title', await p.textContent('#bookTitle') === 'Notes on Natural Philosophy', await p.textContent('#bookTitle'));
    // A PDF whose outline-less pages carry no headings keeps the message.
    await p.click('#pageBtn');
    await p.waitForSelector('.lab-contents-v2 .status:not([role])', { timeout: 15000 });
    check('headings: none found keeps the no-contents message', /This PDF has no table of contents\. Use the page number above\./.test(await p.textContent('.lab-contents-v2')));
    await p.keyboard.press('Escape');
    check('titles and headings: no page errors', !problems.length, problems.slice(0, 6));
    await ctx.close();
  }

  // ---- Phone top bar ----
  {
    const { ctx, p, problems } = await page(browser, { width: 390, height: 844 }, { isMobile: true, hasTouch: true });
    await p.goto(BASE);
    await signIn(p, { token: 'test-token', user: 'u-phone' });
    await openFile(p, await paperPdf(browser));
    await p.waitForSelector('.pdf-sheet canvas', { timeout: 30000 });
    // As in Tinct's reader, the phone keeps the way back in the t menu ("Your books") and draws no arrow.
    const bar = await p.evaluate(() => { const box = id => document.getElementById(id).getBoundingClientRect(); return { back: box('backBtn').width > 0, snip: !!document.querySelector('#snipBtn, .byob-snip-btn'), oneRow: Math.abs(box('playBtn').top - box('bookBtn').top) < 20 && Math.abs(box('superBtn').top - box('bookBtn').top) < 20, overflow: document.getElementById('hdr').scrollWidth > innerWidth + 1, title: document.getElementById('bookTitle').textContent } });
    check('phone: top bar has no snip button and fits on one row', !bar.back && !bar.snip && bar.oneRow && !bar.overflow && bar.title === 'Constructor theory of time', bar);
    await p.screenshot({ path: join(OUT, 'phone-pdf-topbar.png') });
    check('phone top bar: no page errors', !problems.length, problems.slice(0, 6));
    await ctx.close();
  }

  // ---- DRM-protected EPUB is refused ----
  {
    const { ctx, p, problems } = await page(browser, { width: 1280, height: 800 });
    await p.goto(BASE);
    await signIn(p);
    const drm = join(FIX, 'drm.epub');
    if (!existsSync(drm)) {
      const { makeEpub } = await import('./make-epub.mjs');
      writeFileSync(drm, makeEpub({ title: 'Locked', drm: true }));
    }
    await openFile(p, drm);
    await p.waitForSelector('.pdf-status[role="alert"]', { timeout: 10000 });
    check('DRM EPUB is refused with an explanation', /DRM/.test(await p.textContent('.pdf-status')));
    check('DRM test: no page errors', !problems.length, problems);
    await ctx.close();
  }

  // ---- Phone ----
  {
    const { ctx, p, problems } = await page(browser, { width: 390, height: 844 }, { isMobile: true, hasTouch: true });
    await p.goto(BASE);
    await p.waitForSelector('#doorOwn');
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    check('phone: start page has no sideways scroll', !overflow);
    await p.screenshot({ path: join(OUT, 'phone-start.png'), fullPage: true });
    await signIn(p);
    await openFile(p, epub);
    await tinctReader(p);
    const overflow2 = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    check('phone: EPUB opens in the Tinct reader with no sideways scroll', !overflow2 && await p.evaluate(() => document.querySelector('[data-testid="lab-root"]').dataset.labLayout === 'phone' || document.querySelector('.lab').classList.contains('is-phone')));
    // Signed in: the account copy was sent before the page left for the reader.
    const sent = (await bookState()).users['u-test'] || [];
    check('signed in: the EPUB is saved privately to the account before it opens', sent.some(b => b.type === 'epub' && /time machine/i.test(b.title)), sent.map(b => ({ type: b.type, title: b.title })));
    await p.screenshot({ path: join(OUT, 'phone-tinct-epub.png') });
    check('phone: no page errors or CSP violations', !problems.length, problems.slice(0, 6));
    await ctx.close();
  }

  // ---- Your books in your account: saved after opening, listed and opened on another device, removed from both ----
  {
    const one = await page(browser, { width: 1280, height: 800 });
    await one.p.goto(BASE);
    await signIn(one.p, { token: 'cloud-token', user: 'u-cloud' });
    await openFile(one.p, pdf);
    await one.p.waitForSelector('.pdf-sheet canvas', { timeout: 30000 });
    await one.p.waitForFunction(() => /Saved to your account\./.test(document.querySelector('.byob-toast:not([hidden])')?.textContent || ''), null, { timeout: 15000 });
    const saved = await bookState();
    const mine = saved.users['u-cloud'] || [];
    const posts = saved.log.filter(l => l.method === 'POST' && l.user === 'u-cloud');
    check('signed in: an opened file is saved privately to the account, once', mine.length === 1 && mine[0].type === 'pdf' && mine[0].size === statSync(pdf).size && mine[0].name === 'sample.pdf'
      && posts.length === 1 && posts[0].user === 'u-cloud', { mine: mine.map(b => ({ name: b.name, title: b.title, size: b.size })), posts });
    const linked = await one.p.evaluate(async () => (await window.TinctReader.library.list()).map(r => r.cloudId));
    check('this device’s copy is linked to the account copy', linked.length === 1 && linked[0] === mine[0]?.id, linked);
    // Reopening from the shelf does not upload again.
    await one.p.click('#superBtn'); await one.p.click('.lab-super-row[data-row="close"]');
    await one.p.waitForSelector('#abShelf:not([hidden]) .ab-book');
    await one.p.click('.ab-book-open'); await one.p.waitForSelector('.pdf-sheet canvas', { timeout: 30000 });
    await one.p.waitForTimeout(500);
    check('reopening does not upload again', (await bookState()).log.filter(l => l.method === 'POST' && l.user === 'u-cloud').length === 1);
    check('account copy, first device: no page errors', !one.problems.length, one.problems.slice(0, 6));
    await one.ctx.close();

    // A different account never sees it: its shelf stays empty.
    const three = await page(browser, { width: 1280, height: 800 });
    await three.p.goto(BASE);
    const before = (await bookState()).log.length;
    await signIn(three.p, { token: 'other-token', user: 'u-other' });
    for (let i = 0; i < 40 && !(await bookState()).log.slice(before).some(l => l.user === 'u-other' && l.method === 'GET'); i++) await three.p.waitForTimeout(100);
    await three.p.waitForTimeout(300);
    check('another account’s shelf does not list it', await three.p.evaluate(() => document.getElementById('abShelf').hidden && !document.querySelector('.ab-book')));
    await three.ctx.close();

    // A second device: empty browser storage, same account.
    const two = await page(browser, { width: 1280, height: 800 });
    await two.p.goto(BASE);
    await signIn(two.p, { token: 'cloud-token', user: 'u-cloud' });
    await two.p.waitForSelector('#abShelf:not([hidden]) .ab-book[data-cloud-only]', { timeout: 10000 });
    const listed = await two.p.textContent('#abBooks');
    check('another device lists the account’s book on “Your books”', listed.includes(mine[0]?.title || '?') && /PDF · added today/.test(listed), listed.replace(/\s+/g, ' ').trim());
    await two.p.screenshot({ path: join(OUT, 'desktop-shelf-account.png') });
    await two.p.click('.ab-book[data-cloud-only] .ab-book-open');
    await two.p.waitForSelector('.pdf-sheet canvas', { timeout: 30000 });
    await two.p.waitForSelector('.text-layer span', { timeout: 15000 });
    const kept = await two.p.evaluate(async () => (await window.TinctReader.library.list()).map(r => ({ cloudId: r.cloudId, size: r.size })));
    check('a book only in the account downloads, opens and is kept on this device', kept.length === 1 && kept[0].cloudId === mine[0]?.id && kept[0].size === mine[0]?.size
      && (await bookState()).log.some(l => l.method === 'GET' && l.id === mine[0]?.id), kept);
    await two.p.click('#superBtn'); await two.p.click('.lab-super-row[data-row="close"]');
    await two.p.waitForSelector('#abShelf:not([hidden]) .ab-book:not([data-cloud-only])');
    // Remove (× then Remove): gone from this device and from the account.
    await two.p.click('.ab-book-x'); await two.p.click('.ab-book-x');
    await two.p.waitForFunction(() => document.getElementById('abShelf').hidden, null, { timeout: 10000 });
    const after = await bookState();
    const local = await two.p.evaluate(async () => (await window.TinctReader.library.list()).length);
    check('removing a book deletes it from this device and the account', local === 0 && (after.users['u-cloud'] || []).length === 0 && after.log.some(l => l.method === 'DELETE' && l.id === mine[0]?.id), { local, left: after.users['u-cloud'] });
    await two.p.reload(); await two.p.waitForSelector('#doorOwn');
    await two.p.waitForTimeout(800);
    check('and it stays removed after a reload', await two.p.evaluate(() => document.getElementById('abShelf').hidden));
    check('account copy, second device: no page errors', !two.problems.length, two.problems.slice(0, 6));
    await two.ctx.close();

  }
} catch (e) {
  check('run completed', false, String(e?.stack || e).slice(0, 600));
} finally {
  await browser.close(); server.close();
  writeFileSync(join(OUT, 'e2e-report.json'), JSON.stringify(results, null, 2));
  const failed = results.filter(r => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} checks passed`);
  process.exit(failed ? 1 : 0);
}
