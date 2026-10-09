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
import { SHELF_PATH, openShelf, shelfReady, shelfSignIn, openPopUp, addFile, uploads } from './shelf.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const REPO = join(HERE, '../../..');
const require = createRequire(join(REPO, 'app/package.json'));
const { chromium } = require('@playwright/test');
const OUT = join(HERE, 'output'); mkdirSync(OUT, { recursive: true });
const FIX = join(HERE, 'fixtures');
const PORT = 4721, ORIGIN = `http://127.0.0.1:${PORT}`, BASE = `${ORIGIN}/lab/addbook/`;
// My shelf, where the back arrow of every own book lands: /library#my-shelf (the fragment is not part of the request).
const MY_SHELF = url => url.pathname === '/library' && url.hash === '#my-shelf';
// CHROMIUM_PATH picks a browser binary; otherwise the shared cloud install, else Playwright's own.
const EXEC = process.env.CHROMIUM_PATH || (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
const RIGHTS = "I have the right to add this file and to read and listen to it in Tinct, including with its AI features. I'm responsible for what I upload and share (Terms §4).";
const SESSION_KEY = 'sb-yazjyiqsxjystvpkyouk-auth-token';
// An EPUB opens in the Tinct reader: /reader?userBook=<the first 24 hex digits of its SHA-256>.
const READER_URL = /\/reader\?userBook=[0-9a-f]{24}$/;
// The Tinct reader, ready with its text on the page.
async function tinctReader(p) {
  await p.waitForURL(READER_URL, { timeout: 30000 });
  await p.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true' && document.querySelectorAll('.lab-page-wrap [data-testid="lab-word"]').length > 3, null, { timeout: 30000 });
  await p.evaluate(() => document.fonts.ready);
  // The t mark spins once per reader load (as on every book); screenshots wait for it to rest.
  await p.waitForSelector('[data-testid="lab-super"].is-spinning', { timeout: 2500 }).catch(() => {});
  await p.waitForSelector('[data-testid="lab-super"]:not(.is-spinning)', { timeout: 5000 });
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
// Opening a file needs an account; the rights confirmation comes once per account. Add a book's
// start page is retired (2026-10-08): a file is added with My shelf's + pop-up (shelf.mjs, the
// library's own code for it), which opens the book at its address. Returns what the confirmation
// showed, or null when it was not asked.
const openFile = (p, file) => addFile(p, ORIGIN, file);
// A Tinct session as tinct.app stores it, on My shelf. `expired`: the account is known but its
// token has lapsed, so the companion uses the guest route.
const signIn = (p, options) => shelfSignIn(p, ORIGIN, options);
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

  // ---- My shelf's + (the library's file step): "Your own book" only, no free-book search ----
  for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
    const f = await page(browser, viewport);
    await f.ctx.route(/\/sign-in(\?|$)/, route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Sign in</title>' }));
    const worker = [];
    f.p.on('request', r => { if (/search-worker\.js|catalog\.json/.test(r.url())) worker.push(r.url()) });
    const size = viewport.width < 700 ? 'phone' : 'desktop';
    // Signed out: My shelf offers no +; on a device with the internal flag the + is there and asks to sign in (adding needs an account).
    await openShelf(f.p, ORIGIN);
    const plainPlus = await f.p.isVisible('#shelf-head .shelf-add');
    await f.p.evaluate(() => localStorage.setItem('tinct:internal', '1'));
    await f.p.reload(); await shelfReady(f.p);
    const toSignIn = f.p.waitForRequest(r => r.isNavigationRequest() && /\/sign-in\?/.test(r.url()), { timeout: 10000 }).then(r => r.url(), () => null);
    await f.p.click('#shelf-head .shelf-add');
    const signInUrl = await toSignIn;
    check(`${size} My shelf signed out: no file step; the + asks to sign in (the account page) and returns to the library`, !plainPlus && signInUrl === `${ORIGIN}/sign-in?mode=account&returnTo=%2Flibrary`, { plainPlus, signInUrl });
    await f.p.goto(ORIGIN + SHELF_PATH); await shelfReady(f.p);
    await f.p.evaluate(() => localStorage.removeItem('tinct:internal'));
    await signIn(f.p);
    await openPopUp(f.p, ORIGIN);
    await f.p.waitForTimeout(600);
    const shown = await f.p.evaluate(() => { const box = document.querySelector('[data-testid="own-file-dialog"] .tui-dialog'); return { title: box.querySelector('h2').textContent, choose: box.querySelector('.own-file-choose')?.textContent, search: !!box.querySelector('input[type="search"], input[type="text"], input:not([type])'), accept: document.querySelector('.own-file-input')?.accept, focus: document.activeElement?.classList.contains('own-file-choose'), wide: document.documentElement.scrollWidth <= innerWidth } });
    check(`${size} My shelf's +: only "Your own book" (a PDF or EPUB), no free-book search, no catalogue loaded`, shown.title === 'Your own book' && shown.choose === 'Choose a PDF or EPUB' && !shown.search && /\.pdf/.test(shown.accept) && /\.epub/.test(shown.accept) && worker.length === 0 && shown.wide, { shown, worker });
    await f.p.screenshot({ path: join(OUT, `${size}-file-step.png`) });
    const chooser = f.p.waitForEvent('filechooser', { timeout: 3000 }).catch(() => null);
    await f.p.click('[data-testid="own-file-dialog"] .own-file-choose');
    check(`${size} My shelf's + signed in: the PDF/EPUB picker is the step`, shown.focus && !!(await chooser), shown.focus);
    check(`${size} My shelf's +: no page errors`, !f.problems.length, f.problems.slice(0, 6));
    await f.ctx.close();
  }

  // ---- Desktop: My shelf, EPUB, PDF ----
  const { ctx, p, problems } = await page(browser, { width: 1440, height: 900 });
  await ctx.route(/\/sign-in(\?|$)/, route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Sign in</title>' }));
  // Signed out: Add a book's reader opens nothing for a book's address; it asks to sign in and returns to that address.
  {
    const hexOut = 'ab'.repeat(12);
    const toSignIn = p.waitForRequest(r => r.isNavigationRequest() && /\/sign-in\?/.test(r.url()), { timeout: 10000 }).then(r => r.url(), () => null);
    await p.goto(BASE + '?userBook=' + hexOut);
    const signInUrl = await toSignIn;
    check('signed out: no file can be opened; a book\u2019s address asks to sign in and returns to it', signInUrl === `${ORIGIN}/sign-in?returnTo=${encodeURIComponent('/lab/addbook/?userBook=' + hexOut)}`, signInUrl);
  }
  await openShelf(p, ORIGIN);

  // A known account whose token has lapsed: files open, the companion uses the guest route.
  await signIn(p, { expired: true });
  await openPopUp(p, ORIGIN);
  check('signed in: My shelf\u2019s + opens files', await p.isVisible('[data-testid="own-file-dialog"] .own-file-choose'));
  await p.keyboard.press('Escape');
  // The rights confirmation is a step in the pop-up over My shelf; Cancel stays there.
  {
    const over = await addFile(p, ORIGIN, epub, { confirm: false });
    check('the rights confirmation opens in the pop-up over My shelf, not an empty reader', over?.step === 'rights' && over.overShelf && over.title === 'Your own book'
      && /^Tinct opens pg35\.epub here and keeps a private copy in your account/.test(over.intro || ''), over);
    await p.screenshot({ path: join(OUT, 'desktop-rights-over-shelf.png') });
    await p.click('[data-testid="own-file-dialog"] .own-file-cancel');
    await p.waitForSelector('[data-testid="own-file-dialog"]', { state: 'detached', timeout: 5000 }).catch(() => {});
    const after = await p.evaluate(async () => ({ path: location.pathname, hash: location.hash, dialog: !!document.querySelector('[data-testid="own-file-dialog"]'), rights: localStorage.getItem('tinct-addbook:rights:u-test'), kept: (await window.TinctAddEngine.library.list()).length }));
    check('Cancel stays on My shelf and opens nothing', after.path === SHELF_PATH && after.hash === '' && !after.dialog && !after.rights && after.kept === 0 && await p.isVisible('#shelf-head .shelf-add'), after);
  }
  const rights = await openFile(p, epub);
  check('first file asks for the rights confirmation, with the approved copy', rights?.text === RIGHTS && rights.button === 'Continue' && rights.overShelf, rights);
  check('Continue stays disabled until the box is ticked', rights?.disabled === true);
  // The EPUB opens in the Tinct reader, not in Add a book's own view.
  await tinctReader(p);
  check('the confirmation is kept per account under tinct-addbook:', await p.evaluate(() => !!localStorage.getItem('tinct-addbook:rights:u-test')));
  const hex = p.url().match(/userBook=([0-9a-f]{24})/)[1];
  const epubInfo = await p.evaluate(() => ({ title: document.querySelector('[data-testid="lab-header-book"]').textContent, chapter: document.querySelector('[data-testid="lab-header-chapter"]').textContent.trim(), words: document.querySelectorAll('.lab-page-wrap [data-testid="lab-word"]').length, oldView: document.querySelectorAll('.epub-sheet, .epub-pg').length, play: !!document.querySelector('[data-testid="lab-v2-play"]'), docTitle: document.title }));
  const opening = (await p.textContent('.lab-page-wrap')).replace(/\s+/g, ' ');
  // The book's title page is set as Tinct's own title opening (title and author above the first chapter heading).
  const titleOpening = await p.evaluate(() => document.querySelector('.lab-page-wrap [data-testid="lab-book-opening"]')?.textContent.replace(/\s+/g, ' ').trim() ?? null);
  check('the book opens under its own title and author, without Project Gutenberg\u2019s header', /The Time Machine/.test(titleOpening || '') && /H\. G\. Wells/.test(titleOpening || '') && !/Project Gutenberg|START OF THE|eBook/i.test(opening), { titleOpening, opening: opening.slice(0, 160) });
  check('EPUB opens in the Tinct reader at /reader?userBook=', /time machine/i.test(epubInfo.title) && epubInfo.words > 3 && epubInfo.oldView === 0 && /Time Machine · Tinct$/i.test(epubInfo.docTitle), epubInfo);
  check('Tinct reader: narration is not offered for a user book', !epubInfo.play);
  await p.screenshot({ path: join(OUT, 'desktop-tinct-epub.png') });
  // Chapters from the book's contents, in the reader's own Contents.
  await p.click('[data-testid="lab-header-chapter"]');
  await p.waitForSelector('[data-testid^="lab-tree-chapter-"]');
  const tocCount = await p.locator('[data-testid^="lab-tree-chapter-"]').count();
  check('EPUB chapters in the Tinct contents', tocCount > 5, tocCount);
  const tocLabels = await p.locator('[data-testid^="lab-tree-chapter-"]').allTextContents();
  check('contents: no Project Gutenberg licence chapter', !tocLabels.some(label => /gutenberg|license/i.test(label)), tocLabels.slice(0, 3).concat(tocLabels.slice(-2)));
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
    && /time machine/i.test(ctxSent.bookTitle) && ctxSent.paragraphs.length > 3 && ctxSent.paragraphs.join('').length <= 9000 && ctxSent.bookId === undefined && ctxSent.editionKey === undefined && !JSON.stringify(last.body).includes('userbook-'),
    { path: last.path, intent: last.body.companion.intent, title: ctxSent.bookTitle, chapter: ctxSent.chapterLabel, chars: ctxSent.paragraphs.join('').length, bookId: ctxSent.bookId });
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

  // The back arrow goes to My shelf in the library, where own books are listed.
  await p.click('[data-testid="lab-library-back"]');
  const toShelf = await p.waitForURL(MY_SHELF, { timeout: 10000 }).then(() => true, () => false);
  check('back arrow goes to My shelf in the library', toShelf, p.url());
  await openShelf(p, ORIGIN);
  const listedEpub = await uploads(p);
  check('My shelf lists it under My private uploads', listedEpub.some(b => /time machine/i.test(b.title) && b.href === '/reader?userBook=' + hex) && await p.isVisible('text=My private uploads'), listedEpub);
  await p.screenshot({ path: join(OUT, 'desktop-shelf.png') });
  await p.click(`[data-shelf-group="own"][data-own-key="epub:${hex}"] a`);
  await tinctReader(p);
  check('reopens from My shelf at the saved chapter', await p.evaluate(() => document.querySelector('[data-testid="lab-root"]').dataset.chapter) === '4');
  await p.goBack();
  await shelfReady(p);
  check('browser Back returns to My shelf', new URL(p.url()).pathname === SHELF_PATH && await p.isVisible('#shelf-head .shelf-add'));

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
    await signIn(p, { token: 'test-token', user: 'u-titles' });
    const paper = await paperPdf(browser);
    await openFile(p, paper);
    await p.waitForSelector('.pdf-sheet canvas', { timeout: 30000 });
    // Its metadata Title is just the file name, so the title printed large on page 1 is used.
    const shown = await p.evaluate(() => ({ title: document.getElementById('bookTitle').textContent, doc: document.title, contents: document.getElementById('bookBtn').getAttribute('aria-label') }));
    check('title: from page 1 when the metadata title is just the file name', shown.title === 'Constructor theory of time' && shown.doc === 'Constructor theory of time · Tinct' && shown.contents === 'Constructor theory of time. Switch books', shown);
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
    // Back to library: My shelf in the library, which lists the document title.
    await p.click('#backBtn');
    check('Back to library goes to My shelf', await p.waitForURL(MY_SHELF, { timeout: 10000 }).then(() => true, () => false), p.url());
    await openShelf(p, ORIGIN);
    const back = (await uploads(p)).map(b => b.title).join(' | ');
    check('title: My shelf lists the document title', /Constructor theory of time/.test(back) && !/SUB|_/.test(back), back);
    await p.screenshot({ path: join(OUT, 'desktop-back-to-shelf.png') });
    // A real metadata Title wins over the page and the file name.
    await openFile(p, await titledPdf(browser));
    await p.waitForSelector('.pdf-sheet canvas', { timeout: 30000 });
    check('title: from the PDF metadata when it is a real title', await p.textContent('#bookTitle') === 'Notes on Natural Philosophy', await p.textContent('#bookTitle'));
    // A PDF whose outline-less pages carry no headings is read by page: no made-up chapter.
    await p.click('#pageBtn');
    await p.waitForSelector('.lab-contents-v2 .byob-pages', { timeout: 15000 });
    check('headings: none found lists the pages instead', /^p\. 1/.test(await p.textContent('.lab-contents-v2 .byob-pages .text')) && !(await p.$('.lab-contents-v2 [data-go]')));
    await p.keyboard.press('Escape');
    check('titles and headings: no page errors', !problems.length, problems.slice(0, 6));
    await ctx.close();
  }

  // ---- Phone top bar ----
  {
    const { ctx, p, problems } = await page(browser, { width: 390, height: 844 }, { isMobile: true, hasTouch: true });
    await signIn(p, { token: 'test-token', user: 'u-phone' });
    await openFile(p, await paperPdf(browser));
    await p.waitForSelector('.pdf-sheet canvas', { timeout: 30000 });
    // The phone draws the back arrow too (Anders, 9 Oct 2026: a scanned page filled the screen and
    // there was no visible way back); Library stays in the t menu as well.
    const bar = await p.evaluate(() => { const box = id => document.getElementById(id).getBoundingClientRect(); return { back: box('backBtn').width > 0, snip: !!document.querySelector('#snipBtn, .byob-snip-btn'), oneRow: Math.abs(box('playBtn').top - box('bookBtn').top) < 20 && Math.abs(box('superBtn').top - box('bookBtn').top) < 20, overflow: document.getElementById('hdr').scrollWidth > innerWidth + 1, title: document.getElementById('bookTitle').textContent } });
    check('phone: top bar has the back arrow, no snip button, and fits on one row', bar.back && !bar.snip && bar.oneRow && !bar.overflow && bar.title === 'Constructor theory of time', bar);
    await p.screenshot({ path: join(OUT, 'phone-pdf-topbar.png') });
    check('phone top bar: no page errors', !problems.length, problems.slice(0, 6));
    await ctx.close();
  }

  // ---- DRM-protected EPUB is refused ----
  {
    const { ctx, p, problems } = await page(browser, { width: 1280, height: 800 });
    await signIn(p);
    const drm = join(FIX, 'drm.epub');
    if (!existsSync(drm)) {
      const { makeEpub } = await import('./make-epub.mjs');
      writeFileSync(drm, makeEpub({ title: 'Locked', drm: true }));
    }
    await openFile(p, drm);
    await p.waitForSelector('[data-testid="own-file-dialog"] .own-file-message[role="alert"]', { timeout: 10000 });
    check('DRM EPUB is refused with an explanation', /DRM/.test(await p.textContent('[data-testid="own-file-dialog"] .own-file-message')) && new URL(p.url()).pathname === SHELF_PATH);
    check('DRM test: no page errors', !problems.length, problems);
    await ctx.close();
  }

  // ---- An EPUB with pictures: figures at their place, the card, Explain with the picture, the cover on Your books ----
  {
    const { ctx, p, problems } = await page(browser, { width: 1280, height: 800 });
    await signIn(p);
    const figuresEpub = join(FIX, 'figures.epub');
    const { makeFigureEpub } = await import('./make-epub.mjs');
    writeFileSync(figuresEpub, makeFigureEpub());
    await openFile(p, figuresEpub);
    await tinctReader(p);
    await p.waitForFunction(() => [...document.querySelectorAll('.lab-page-wrap [data-testid="lab-figure"] img')].some(img => img.complete && img.naturalWidth > 0), null, { timeout: 10000 }).catch(() => {});
    const shown = await p.evaluate(() => {
      const figure = document.querySelector('.lab-page-wrap [data-testid="lab-figure"]');
      const img = figure?.querySelector('img');
      return { chapter: document.querySelector('[data-testid="lab-header-chapter"]').textContent.trim(), inline: figure?.classList.contains('is-inline'), caption: figure?.querySelector('.lab-figure-caption')?.textContent, drawn: !!img && img.complete && img.naturalWidth > 0, blob: /^blob:/.test(img?.src || ''), word: figure?.closest('[data-testid="lab-word"]')?.dataset.wordIndex };
    });
    check('figures: a picture stands at its place, drawn from this device, caption beneath; no Cover chapter', /^The Workshop/.test(shown.chapter) && shown.inline && /workbench/.test(shown.caption || '') && shown.drawn && shown.blob && shown.word === '0', shown);
    await p.screenshot({ path: join(OUT, 'desktop-figures.png') });
    await p.click('.lab-page-wrap [data-testid="lab-figure"]');
    await p.waitForSelector('[data-testid="lab-figure-card"] img', { timeout: 5000 });
    check('figures: a tap opens the figure card', await p.evaluate(() => /Figure 1/.test(document.querySelector('[data-testid="lab-figure-card"]').textContent)));
    await p.screenshot({ path: join(OUT, 'desktop-figure-card.png') });
    await p.click('[data-testid="lab-figure-explain"]');
    await p.waitForFunction(() => /MOCK ANSWER/.test(document.body.textContent || ''), null, { timeout: 15000 }).catch(() => {});
    const asked = await lastRequest();
    const lastTurn = asked?.body?.messages?.at(-1)?.content;
    check('figures: Explain sends the picture with the question, signed in, as an image block', asked?.path === '/api/chat' && Array.isArray(lastTurn) && lastTurn[0]?.type === 'image' && /^image\/(png|jpeg)$/.test(lastTurn[0]?.source?.media_type) && /Explain this figure/.test(lastTurn.at(-1)?.text || ''), { path: asked?.path, blocks: Array.isArray(lastTurn) ? lastTurn.map(b => b.type) : typeof lastTurn });
    await p.keyboard.press('Escape');
    await p.click('[data-testid="lab-header-chapter"]');
    await p.waitForSelector('[data-testid="lab-contents-tab-figures"]', { timeout: 5000 });
    await p.click('[data-testid="lab-contents-tab-figures"]');
    const listed = await p.locator('[data-testid="lab-contents-figure"]').count();
    check('figures: the Figures tab lists every figure', listed === 5, listed);
    await p.screenshot({ path: join(OUT, 'desktop-figures-tab.png') });
    await p.keyboard.press('Escape');
    await p.click('[data-testid="lab-library-back"]');
    await p.waitForURL(MY_SHELF, { timeout: 10000 });
    await openShelf(p, ORIGIN);
    await p.waitForFunction(() => [...document.querySelectorAll('[data-shelf-group="own"] img.own-cover-image')].every(img => img.complete), null, { timeout: 5000 }).catch(() => {});
    const cover = (await uploads(p)).find(b => /Lanterns Illustrated/.test(b.title))?.cover || 0;
    check('figures: My shelf shows the EPUB’s own cover', cover > 0, cover);
    await p.screenshot({ path: join(OUT, 'desktop-shelf-cover.png') });
    check('figures: no page errors or CSP violations', !problems.length, problems.slice(0, 6));
    await ctx.close();
  }

  // ---- Phone ----
  {
    const { ctx, p, problems } = await page(browser, { width: 390, height: 844 }, { isMobile: true, hasTouch: true });
    await signIn(p);
    await openPopUp(p, ORIGIN);
    const overflow = await p.evaluate(() => { const box = document.querySelector('[data-testid="own-file-dialog"] .tui-dialog').getBoundingClientRect(); return document.documentElement.scrollWidth > innerWidth + 1 || box.left < 0 || box.right > innerWidth });
    check('phone: My shelf\u2019s "Your own book" pop-up has no sideways scroll', !overflow);
    await p.screenshot({ path: join(OUT, 'phone-file-step.png'), fullPage: true });
    await p.keyboard.press('Escape');
    await openFile(p, epub);
    await tinctReader(p);
    const overflow2 = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    check('phone: EPUB opens in the Tinct reader with no sideways scroll', !overflow2 && await p.evaluate(() => document.querySelector('[data-testid="lab-root"]').dataset.labLayout === 'phone' || document.querySelector('.lab').classList.contains('is-phone')));
    // Signed in: the account copy was sent before the page left for the reader.
    const sent = (await bookState()).users['u-test'] || [];
    check('signed in: the EPUB is saved privately to the account before it opens', sent.some(b => b.type === 'epub' && /time machine/i.test(b.title)), sent.map(b => ({ type: b.type, title: b.title })));
    const mark = await p.evaluate(() => { const b = document.querySelector('[data-testid="lab-super"]'); const r = b.getBoundingClientRect(); return { spinning: b.classList.contains('is-spinning'), inside: r.right <= innerWidth && r.top >= 0, visible: r.width > 30 } });
    check('phone: the t menu button is drawn at rest, as in the reader', !mark.spinning && mark.inside && mark.visible, mark);
    await p.screenshot({ path: join(OUT, 'phone-tinct-epub.png') });
    check('phone: no page errors or CSP violations', !problems.length, problems.slice(0, 6));
    await ctx.close();
  }

  // ---- Your books in your account: saved after opening, listed and opened on another device, removed from both ----
  {
    const one = await page(browser, { width: 1280, height: 800 });
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
    // Reopening from My shelf does not upload again.
    await openShelf(one.p, ORIGIN);
    await one.p.click('[data-shelf-group="own"] a'); await one.p.waitForSelector('.pdf-sheet canvas', { timeout: 30000 });
    await one.p.waitForTimeout(500);
    check('reopening does not upload again', (await bookState()).log.filter(l => l.method === 'POST' && l.user === 'u-cloud').length === 1);
    check('account copy, first device: no page errors', !one.problems.length, one.problems.slice(0, 6));
    await one.ctx.close();

    // A different account never sees it: its shelf stays empty.
    const three = await page(browser, { width: 1280, height: 800 });
    await openShelf(three.p, ORIGIN);
    const before = (await bookState()).log.length;
    await signIn(three.p, { token: 'other-token', user: 'u-other' });
    for (let i = 0; i < 40 && !(await bookState()).log.slice(before).some(l => l.user === 'u-other' && l.method === 'GET'); i++) await three.p.waitForTimeout(100);
    await three.p.waitForTimeout(300);
    await shelfReady(three.p);
    check('another account’s My shelf does not list it', (await uploads(three.p)).length === 0 && !(await three.p.isVisible('text=My private uploads')));
    await three.ctx.close();

    // A second device: empty browser storage, same account.
    const two = await page(browser, { width: 1280, height: 800 });
    await signIn(two.p, { token: 'cloud-token', user: 'u-cloud' });
    await two.p.waitForSelector('[data-shelf-group="own"]', { timeout: 10000 });
    const listed = await uploads(two.p);
    const cloudKey = 'pdf:' + String(mine[0]?.sha256 || '').slice(0, 24);
    check('another device lists the account’s book on My shelf, not yet on this device', listed.length === 1 && listed[0].title === mine[0]?.title && listed[0].by === 'PDF' && listed[0].key === cloudKey && listed[0].href === '/lab/addbook/?userBook=' + cloudKey.slice(4)
      && (await two.p.evaluate(() => new Promise(resolve => { const r = indexedDB.open('tinct-addbook', 1); r.onupgradeneeded = () => r.result.createObjectStore('books', { keyPath: 'key' }); r.onsuccess = () => { const t = r.result.transaction('books', 'readonly').objectStore('books').count(); t.onsuccess = () => resolve(t.result); t.onerror = () => resolve(-1) }; r.onerror = () => resolve(-1) }))) === 0, listed);
    await two.p.screenshot({ path: join(OUT, 'desktop-shelf-account.png') });
    await two.p.click('[data-shelf-group="own"] a');
    await two.p.waitForSelector('.pdf-sheet canvas', { timeout: 30000 });
    await two.p.waitForSelector('.text-layer span', { timeout: 15000 });
    const kept = await two.p.evaluate(async () => (await window.TinctReader.library.list()).map(r => ({ cloudId: r.cloudId, size: r.size })));
    check('a book only in the account downloads, opens and is kept on this device', kept.length === 1 && kept[0].cloudId === mine[0]?.id && kept[0].size === mine[0]?.size
      && (await bookState()).log.some(l => l.method === 'GET' && l.id === mine[0]?.id), kept);
    await openShelf(two.p, ORIGIN);
    // Remove (× then Remove in the confirmation): gone from this device and from the account.
    await two.p.click('[data-shelf-group="own"] [data-shelf-remove]');
    await two.p.click('[data-testid="own-delete-dialog"] .own-delete-confirm');
    await two.p.waitForFunction(() => document.getElementById('status').textContent === 'ready' && !document.querySelector('[data-shelf-group="own"]'), null, { timeout: 10000 });
    const after = await bookState();
    const local = await two.p.evaluate(async () => (await window.TinctAddEngine.library.list()).length);
    check('removing a book deletes it from this device and the account', local === 0 && (after.users['u-cloud'] || []).length === 0 && after.log.some(l => l.method === 'DELETE' && l.id === mine[0]?.id), { local, left: after.users['u-cloud'] });
    await two.p.reload(); await shelfReady(two.p);
    check('and it stays removed after a reload', (await uploads(two.p)).length === 0);
    check('account copy, second device: no page errors', !two.problems.length, two.problems.slice(0, 6));
    await two.ctx.close();

  }

  // ---- A commercially made EPUB's figures, in Chromium and WebKit: added, reloaded, reopened, on a second device ----
  const { ownFigureChecks } = await import('./own-figures.mjs');
  await ownFigureChecks({ base: BASE, check });
} catch (e) {
  check('run completed', false, String(e?.stack || e).slice(0, 600));
} finally {
  await browser.close(); server.close();
  writeFileSync(join(OUT, 'e2e-report.json'), JSON.stringify(results, null, 2));
  const failed = results.filter(r => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} checks passed`);
  process.exit(failed ? 1 : 0);
}
