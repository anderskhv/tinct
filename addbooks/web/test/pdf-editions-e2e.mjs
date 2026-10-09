// A text PDF's two editions in headless Chromium, against a local Tinct (the app's dev
// server: `npx vite --port 3101` in app/) with the Worker mocked by routing: Tinct text in
// the Tinct reader and Original pages in Add a book's viewer, the default for a book of
// prose and for a paper, switching at a page and back, a reload, a second device of the
// same account, the phone, and Listen, Explain and highlight in the Tinct text.
//   BASE=http://localhost:3101 OUT=<dir> node addbooks/web/test/pdf-editions-e2e.mjs
// Playwright comes from app/node_modules; Chromium from CHROMIUM_PATH or /opt/pw-browsers.
import { createRequire } from 'node:module';
import { createHash, randomBytes } from 'node:crypto';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pdfFixtures } from './make-pdf.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const REPO = join(HERE, '../../..');
const require = createRequire(join(REPO, 'app/package.json'));
const { chromium } = require('@playwright/test');
const BASE = process.env.BASE || 'http://localhost:3101';
const OUT = process.env.OUT || join(HERE, 'output'); mkdirSync(OUT, { recursive: true });
const EXEC = process.env.CHROMIUM_PATH || (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
const SESSION_KEY = 'sb-yazjyiqsxjystvpkyouk-auth-token';
const USER = 'u-pdf';

// The viewer's own converter, here in Node, to say where a place should land.
const VENDOR = join(REPO, 'app/public/lab/addbook/vendor/pdfjs/');
const quiet = console.log; console.log = () => {};
require(VENDOR + 'pdf.worker.min.js'); require(VENDOR + 'pdf.min.js');
console.log = quiet;
require(join(REPO, 'addbooks/web/src/js/pdf-scan.js'));
require(join(REPO, 'addbooks/web/src/js/pdf-text.js'));
const { TinctPdfText } = globalThis;

const results = [];
const check = (name, ok, detail) => { results.push({ name, ok: !!ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail !== undefined ? '  ' + JSON.stringify(detail).slice(0, 400) : ''}`) };

const fixtures = pdfFixtures();
const book = name => { const bytes = fixtures[name]; const sha256 = createHash('sha256').update(bytes).digest('hex'); return { name, bytes, sha256, hex: sha256.slice(0, 24) } };
const PROSE = book('prose_book.pdf'), PAPER = book('two_column_paper.pdf');

/* ---------- The account, in memory (worker/routes/userBooks.ts, as addbooks/web/test/serve.mjs) ---------- */
const account = { books: [], places: {}, chats: [], ensures: [] };
for (const b of [PROSE, PAPER]) account.books.push({ id: randomBytes(16).toString('hex'), name: b.name, title: b.name.replace(/\.pdf$/, ''), author: '', type: 'pdf', size: b.bytes.length, sha256: b.sha256, createdAt: new Date(Date.now() - 86400000).toISOString(), bytes: b.bytes });
const json = (route, status, body) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
const listed = () => account.books.map(({ bytes, ...b }) => b);

async function mockWorker(ctx) {
  // Add a book's page at its directory address, as the Worker serves it (the dev server serves the app there).
  await ctx.route(url => new URL(url).pathname === '/lab/addbook/', async route => route.fulfill({ response: await route.fetch({ url: BASE + '/lab/addbook/index.html' }) }));
  await ctx.route(/^https:\/\/[a-z0-9]+\.supabase\.co\//, route => route.request().url().includes('grant_type=refresh_token')
    ? json(route, 200, { access_token: 'test-token', refresh_token: 'refresh', token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, user: { id: USER, aud: 'authenticated', email: 'reader@example.com' } })
    : route.abort());
  await ctx.route(url => new URL(url).pathname.startsWith('/api/'), async route => {
    const req = route.request(), url = new URL(req.url()), path = url.pathname;
    const authed = req.headers().authorization === 'Bearer test-token';
    if (path === '/api/user-books' || path === '/api/user-books/') {
      if (!authed) return json(route, 401, { error: 'Unauthorized' });
      if (req.method() === 'POST') return json(route, 200, { book: listed()[0] });
      return json(route, 200, { books: listed(), limits: { maxFileBytes: 52428800, maxAccountBytes: 2147483648, maxAccountFiles: 200 } });
    }
    if (path === '/api/user-books/places') return authed ? json(route, 200, { places: account.places }) : json(route, 401, {});
    if (path.startsWith('/api/user-books/places/')) {
      const hex = path.split('/').pop(), body = JSON.parse(req.postData() || '{}'), current = account.places[hex];
      if ((current?.rev ?? 0) !== body.rev) return json(route, 409, { error: 'conflict', place: current ?? null });
      account.places[hex] = { ...body.place, rev: (current?.rev ?? 0) + 1 };
      return json(route, 200, { place: account.places[hex] });
    }
    if (path.startsWith('/api/user-books/')) {
      const found = account.books.find(b => b.id === path.split('/').pop());
      return found && authed ? route.fulfill({ status: 200, contentType: 'application/pdf', body: found.bytes }) : json(route, 404, { error: 'Not found' });
    }
    if (path === '/api/narration/voices') return json(route, 200, { enabled: true, provider: 'grok', model: 'grok-tts-v1', voices: [{ key: 'f', label: 'Ara', persona: 'female', cacheIdentity: 'a'.repeat(64) }], ownBooks: true });
    if (path === '/api/narration/own/ensure') { account.ensures.push(JSON.parse(req.postData() || '{}')); return json(route, 503, { error: 'not_configured' }) }
    if (path === '/api/chat' || path === '/api/lab-chat') {
      account.chats.push({ path, body: JSON.parse(req.postData() || '{}') });
      const events = [{ type: 'content_block_delta', delta: { type: 'text_delta', text: 'MOCK ANSWER about this passage.' } }, { type: 'message_stop' }];
      return route.fulfill({ status: 200, contentType: 'text/event-stream', body: events.map(e => `event: ${e.type}\ndata: ${JSON.stringify(e)}\n\n`).join('') });
    }
    return json(route, 404, { error: 'Not found' });
  });
}

/** A device: a browser context signed in to the account, with nothing of the books on it yet. */
async function device(browser, viewport) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  await mockWorker(ctx);
  await ctx.addInitScript(([key, user]) => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({ access_token: 'test-token', refresh_token: 'refresh', token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, user: { id: user, email: 'reader@example.com' } }));
  }, [SESSION_KEY, USER]);
  const p = await ctx.newPage();
  p.on('pageerror', e => console.log('  [pageerror]', e.message.slice(0, 200)));
  if (process.env.DEBUG) p.on('console', m => console.log('  [console]', m.type(), m.text().slice(0, 300)));
  return { ctx, p };
}
/** Keep a PDF on this device as Add a book keeps a file it has added (IndexedDB tinct-addbook, record pdf:<hex>). */
async function keepOnDevice(p, b) {
  await p.goto(BASE + '/library');
  const cloudId = account.books.find(x => x.sha256 === b.sha256).id;
  await p.evaluate(async ([hex, name, bytes, user, cloudId]) => {
    const db = await new Promise((resolve, reject) => { const r = indexedDB.open('tinct-addbook', 1); r.onupgradeneeded = () => r.result.createObjectStore('books', { keyPath: 'key' }); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error) });
    await new Promise((resolve, reject) => { const tx = db.transaction('books', 'readwrite'); tx.objectStore('books').put({ key: 'pdf:' + hex, kind: 'pdf', name, title: name.replace(/\.pdf$/, ''), author: '', owner: user, size: bytes.length, addedAt: Date.now() - 600000, openedAt: Date.now() - 600000, cloudId, bytes: new Uint8Array(bytes).buffer }); tx.oncomplete = resolve; tx.onerror = () => reject(tx.error) });
    db.close();
  }, [b.hex, b.name, [...b.bytes], USER, cloudId]);
}
const recordOf = (p, hex) => p.evaluate(async key => {
  const db = await new Promise(resolve => { const r = indexedDB.open('tinct-addbook', 1); r.onsuccess = () => resolve(r.result) });
  const rec = await new Promise(resolve => { const r = db.transaction('books').objectStore('books').get(key); r.onsuccess = () => resolve(r.result) });
  db.close();
  return rec ? { edition: rec.edition, layout: rec.layout, scan: rec.scan ? { v: rec.scan.v, layout: rec.scan.layout } : null } : null;
}, 'pdf:' + hex);
const readerUrl = hex => new RegExp(`/reader\\?userBook=${hex}`);
const viewerUrl = hex => new RegExp(`/lab/addbook/\\?userBook=${hex}`);
/** The Tinct reader, with its text on the page. */
async function inReader(p, hex) {
  await p.waitForURL(readerUrl(hex), { timeout: 60000 }).catch(async e => { await shot(p, 'debug-timeout'); console.log('  at', p.url(), await p.evaluate(() => document.body.innerText.slice(0, 300))); throw e });
  await p.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true' && document.querySelectorAll('.lab-page-wrap [data-testid="lab-word"]').length > 3, null, { timeout: 60000 });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(700);
}
/** Add a book's viewer, its pages drawn. */
async function inViewer(p, hex) {
  await p.waitForURL(viewerUrl(hex), { timeout: 60000 });
  await p.waitForFunction(() => document.body.dataset.view === 'reader' && document.querySelectorAll('.pg canvas, .pdf-sheet canvas, canvas').length > 0, null, { timeout: 60000 });
  await p.waitForTimeout(900);
}
const sharedPlace = (p, hex) => p.evaluate(h => JSON.parse(localStorage.getItem('tinct-addbook:pos:pdf:' + h) || 'null'), hex);
const textPlace = (p, hex) => p.evaluate(h => JSON.parse(localStorage.getItem('tinct-addbook:place:' + h) || 'null'), hex);
const shot = (p, name) => p.screenshot({ path: join(OUT, name + '.jpg'), type: 'jpeg', quality: 70 });
/** The reader's first word on its page, as the reader shows it. */
const firstWord = p => p.evaluate(() => { const w = document.querySelector('.lab-page-wrap [data-testid="lab-word"]'); return w ? `${w.textContent.trim()}@${w.getAttribute('data-paragraph-index')}.${w.getAttribute('data-word-index')}` : '' });
async function pickOriginalPages(p) {
  await p.click('[data-testid="lab-super"]');
  await p.click('[data-testid="lab-super-row-editions"]');
  await p.click('[data-testid="lab-v2-main-edition"]');
  await p.locator('.lab-v2-edition-option', { hasText: 'Original pages' }).click();
}
/** Scroll the viewer to `frac` down page n, and let it keep the place. */
async function viewerTo(p, n, frac) {
  await p.evaluate(([n, frac]) => {
    const s = document.getElementById('scroll'), sheet = document.querySelector('.pdf-sheet[data-page="' + n + '"]');
    s.scrollTop += sheet.getBoundingClientRect().top - s.getBoundingClientRect().top + frac * sheet.getBoundingClientRect().height;
  }, [n, frac]);
  await p.waitForTimeout(900);
}

const browser = await chromium.launch({ executablePath: EXEC, args: ['--mute-audio'] });
try {
  /* ---- Device A, a desktop: the defaults ---- */
  const A = await device(browser, { width: 1280, height: 860 });
  await keepOnDevice(A.p, PROSE);
  await keepOnDevice(A.p, PAPER);
  // A book of prose, opened from My shelf's link (the viewer, as nothing is known yet): classified, then its Tinct text.
  await A.p.goto(`${BASE}/lab/addbook/?userBook=${PROSE.hex}`);
  await inReader(A.p, PROSE.hex);
  const proseRec = await recordOf(A.p, PROSE.hex);
  check('the book of prose opens in the reader as Tinct text (classified: text)', proseRec?.layout?.default === 'text' && proseRec?.edition?.source === 'pdf', { layout: proseRec?.layout, source: proseRec?.edition?.source });
  check('its title and first chapter as the reader shows them', /A Treatise of Small Things/.test(await A.p.textContent('[data-testid="lab-header-book"]')) && /Of Ideas/.test(await A.p.textContent('[data-testid="lab-header-chapter"]')));
  await shot(A.p, '1-desktop-prose-tinct-text');

  // The paper: its pages.
  await A.p.goto(`${BASE}/lab/addbook/?userBook=${PAPER.hex}`);
  await inViewer(A.p, PAPER.hex);
  await A.p.waitForFunction(() => !document.getElementById('textBtn').hidden, null, { timeout: 30000 });
  const paperRec = await recordOf(A.p, PAPER.hex);
  check('the paper opens in the viewer (classified: pages), with "Tinct text" offered', A.p.url().includes('/lab/addbook/') && paperRec?.scan?.layout?.default === 'pages' && await A.p.getAttribute('#textBtn', 'aria-label') === 'Read as Tinct text', paperRec?.scan?.layout);
  const buttonFont = await A.p.evaluate(() => getComputedStyle(document.getElementById('textBtn')).fontFamily);
  check('"Tinct text" is set in EB Garamond, not a monospace', /EB Garamond/.test(buttonFont) && !/mono/i.test(buttonFont), buttonFont);
  await shot(A.p, '2-desktop-paper-original-pages');

  /* ---- Switching at page 7 and back ---- */
  const edition = proseRec.edition;
  await A.p.goto(`${BASE}/reader?userBook=${PROSE.hex}`);
  await inReader(A.p, PROSE.hex);
  await pickOriginalPages(A.p);
  await inViewer(A.p, PROSE.hex);
  check('Original pages from the reader opens the viewer at the same page', /p\. 2\b/.test(await A.p.textContent('#progress')) && (await sharedPlace(A.p, PROSE.hex))?.edition === 'p', await A.p.textContent('#progress'));
  await viewerTo(A.p, 7, 0.35);
  const at7 = await sharedPlace(A.p, PROSE.hex);
  const want = TinctPdfText.placeOf(edition, at7.page, at7.frac);
  check('read on to page 7 in Original pages: the shared place is page 7 with its spot in the text', at7.page === 7 && at7.edition === 'p' && at7.chapterNumber === want.chapterNumber && at7.paragraphIndex === want.paragraphIndex && at7.wordIndex === want.wordIndex, { at7, want });
  await shot(A.p, '3-desktop-prose-pages-at-7');
  await A.p.click('#textBtn');
  await inReader(A.p, PROSE.hex);
  const backText = await textPlace(A.p, PROSE.hex);
  const backPage = TinctPdfText.pageOf(edition, backText);
  check('"Tinct text" at page 7 opens the text at the same word', backText.chapterNumber === want.chapterNumber && backText.paragraphIndex === want.paragraphIndex && backText.wordIndex === want.wordIndex && backPage.page === 7, { backText, backPage });
  const shownWords = await A.p.$$eval('.lab-page-wrap [data-testid="lab-word"]', ws => ws.map(w => w.textContent.trim()).join(' '));
  const targetWord = edition.chapters.find(c => c.number === want.chapterNumber).paragraphs[want.paragraphIndex].split(/\s+/)[want.wordIndex];
  check('the page the reader shows holds that word', shownWords.includes(targetWord), { targetWord });
  await shot(A.p, '4-desktop-prose-text-from-page-7');
  // And back to the pages, without reading on: page 7 again.
  await pickOriginalPages(A.p);
  await inViewer(A.p, PROSE.hex);
  check('and back to Original pages: page 7 again', /p\. 7\b/.test(await A.p.textContent('#progress')), await A.p.textContent('#progress'));

  /* ---- A reload keeps the choice ---- */
  await A.p.reload();
  await inViewer(A.p, PROSE.hex);
  check('a reload of Original pages stays in Original pages, at page 7', A.p.url().includes('/lab/addbook/') && /p\. 7\b/.test(await A.p.textContent('#progress')));
  await A.p.click('#textBtn');
  await inReader(A.p, PROSE.hex);
  const beforeReload = { place: await textPlace(A.p, PROSE.hex), chapter: await A.p.getAttribute('[data-testid="lab-root"]', 'data-chapter'), word: await firstWord(A.p) };
  await A.p.reload();
  await inReader(A.p, PROSE.hex);
  const afterReload = { place: await textPlace(A.p, PROSE.hex), chapter: await A.p.getAttribute('[data-testid="lab-root"]', 'data-chapter'), word: await firstWord(A.p) };
  check('a reload of the Tinct text stays in the Tinct text at the same place', afterReload.chapter === beforeReload.chapter && afterReload.word === beforeReload.word && afterReload.place.paragraphIndex === beforeReload.place.paragraphIndex, { beforeReload, afterReload });
  // Let the place reach the account.
  await A.p.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await A.p.waitForTimeout(3500);
  check('the account keeps the PDF’s one place, with both coordinates and the edition', account.places[PROSE.hex]?.edition === 't' && account.places[PROSE.hex]?.page === 7 && account.places[PROSE.hex]?.paragraphIndex === want.paragraphIndex, account.places[PROSE.hex]);

  /* ---- Listen, Explain and highlight in the Tinct text ---- */
  const play = await A.p.$('[data-testid="lab-v2-play"]');
  check('Listen is offered in the Tinct text', !!play);
  if (play) {
    await play.click();
    await A.p.waitForTimeout(1500);
    const asked = account.ensures[0];
    check('Listen asks the own-book route with the book hex and the Tinct text’s paragraphs', asked?.book === PROSE.hex && asked.paragraphs?.length > 0 && typeof asked.paragraphs[0].text === 'string', asked && { book: asked.book, n: asked.paragraphs?.length });
    await A.p.keyboard.press('Escape');
    if ((await A.p.getAttribute('[data-testid="lab-v2-play"]', 'aria-label'))?.match(/pause/i)) await A.p.click('[data-testid="lab-v2-play"]');
  }
  const drag = async (from, to) => {
    const words = A.p.locator('.lab-page-wrap [data-testid="lab-word"]');
    const a = await words.nth(from).boundingBox(), z = await words.nth(to).boundingBox();
    await A.p.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await A.p.mouse.down();
    await A.p.mouse.move(z.x + z.width / 2, z.y + z.height / 2, { steps: 12 }); await A.p.mouse.up();
    await A.p.waitForSelector('.selection-popup', { timeout: 5000 });
  };
  await drag(3, 12);
  await A.p.locator('.selection-popup .popup-menu-action', { hasText: 'Explain' }).click();
  await A.p.waitForFunction(() => /MOCK ANSWER/.test(document.querySelector('.selection-popup')?.textContent || ''), null, { timeout: 15000 }).catch(() => {});
  const explained = account.chats.at(-1);
  check('Explain answers in the Tinct text, with the passage and never the book id', /MOCK ANSWER/.test(await A.p.textContent('.selection-popup').catch(() => '')) && explained && !JSON.stringify(explained.body).includes('userbook-'), explained && { path: explained.path, intent: explained.body?.companion?.intent });
  await shot(A.p, '5-desktop-text-explain');
  await A.p.keyboard.press('Escape');
  await A.p.waitForTimeout(300);
  await drag(16, 26);
  await A.p.locator('.selection-popup .popup-menu-action', { hasText: /^Highlight$/ }).first().click();
  await A.p.waitForTimeout(500);
  await A.p.keyboard.press('Escape');
  const hl = await A.p.evaluate(() => JSON.parse(localStorage.getItem('tinct-lab-highlights') || '[]').map(h => h.bookId));
  const drawn = await A.p.evaluate(() => document.querySelectorAll('.lab-page-wrap [class*="highlight"]').length);
  check('a highlight is kept under the own book and drawn', hl.includes('userbook-' + PROSE.hex) && drawn > 0, { hl, drawn });

  /* ---- Device B, the same account: the same edition and place ---- */
  const B = await device(browser, { width: 1280, height: 860 });
  await B.p.goto(`${BASE}/library#my-shelf`);
  const href = await B.p.waitForFunction(h => document.querySelector(`a[href*="${h}"]`)?.getAttribute('href'), PROSE.hex, { timeout: 30000 }).then(h => h.jsonValue()).catch(() => null);
  check('another device of the account lists the book to open as Tinct text', href === `/reader?userBook=${PROSE.hex}`, href);
  await B.p.goto(`${BASE}${href || '/reader?userBook=' + PROSE.hex}`);
  // Not on this device: the viewer downloads it, then the Tinct text opens at the account's place.
  await inReader(B.p, PROSE.hex);
  const onB = { place: await textPlace(B.p, PROSE.hex), chapter: await B.p.getAttribute('[data-testid="lab-root"]', 'data-chapter'), word: await firstWord(B.p) };
  check('the second device opens the Tinct text at the same page of text (chapter, first paragraph and word shown)', onB.chapter === afterReload.chapter && onB.word === afterReload.word, { onB, onA: afterReload, posB: await sharedPlace(B.p, PROSE.hex) });
  check('its place is on the same page of the PDF', TinctPdfText.pageOf(edition, onB.place)?.page === 7, TinctPdfText.pageOf(edition, onB.place));
  const recB = await recordOf(B.p, PROSE.hex);
  check('it converted the same text there (the same file converts the same way)', JSON.stringify(recB?.edition) === JSON.stringify(edition));
  await shot(B.p, '6-second-device-same-place');
  await B.ctx.close();

  /* ---- The phone ---- */
  const C = await device(browser, { width: 390, height: 844 });
  await keepOnDevice(C.p, PROSE);
  await keepOnDevice(C.p, PAPER);
  await C.p.goto(`${BASE}/reader?userBook=${PROSE.hex}`);
  await inReader(C.p, PROSE.hex);
  const phoneOverflow = await C.p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  check('phone: the Tinct text reads, at the account’s place, without sideways scroll', onB.chapter === await C.p.getAttribute('[data-testid="lab-root"]', 'data-chapter') && phoneOverflow <= 0, { overflow: phoneOverflow });
  await shot(C.p, '7-phone-prose-tinct-text');
  await C.p.click('[data-testid="lab-super"]');
  check('phone: the menu offers Book editions', await C.p.isVisible('[data-testid="lab-super-row-editions"]'));
  await C.p.keyboard.press('Escape');
  await C.p.goto(`${BASE}/lab/addbook/?userBook=${PAPER.hex}`);
  await inViewer(C.p, PAPER.hex);
  await C.p.waitForFunction(() => !document.getElementById('textBtn').hidden, null, { timeout: 30000 });
  const header = await C.p.evaluate(() => { const r = document.getElementById('textBtn').getBoundingClientRect(); return { right: r.right, width: innerWidth } });
  check('phone: the paper opens in its pages, "Tinct text" in the top bar', C.p.url().includes('/lab/addbook/') && header.right <= header.width, header);
  await shot(C.p, '8-phone-paper-original-pages');
  await C.p.click('#superBtn');
  check('phone: the viewer’s menu offers Book editions', await C.p.isVisible('.lab-super-row[data-row="editions"]'));
  await C.p.click('.lab-super-row[data-row="editions"]');
  const options = await C.p.$$eval('.lab-v2-edition-option', os => os.map(o => [o.textContent.replace('✓', '').trim(), o.getAttribute('aria-pressed')]));
  check('phone: Book editions there: Tinct text and Original pages (checked)', JSON.stringify(options) === JSON.stringify([['Tinct text', 'false'], ['Original pages', 'true']]), options);
  await C.ctx.close();
  await A.ctx.close();
} finally {
  await browser.close();
}
const failed = results.filter(r => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
