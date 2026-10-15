// Recognising the text of a scanned PDF (OCR, R3) in headless Chromium, against a local Tinct
// (the app's dev server: `npx vite --port 3101` in app/) with the Worker's routes mocked by
// routing, recognition switched on in the mock. Nothing reaches xAI or production.
//   Premium: the offer, start, close mid-upload, reopen and resume, finish, read in Tinct text,
//   switch to a page and back; My shelf while it runs; deleting the book removes the job.
//   A free account sees the one line; the monthly limit; failed pages tried again; switched off.
//   BASE=http://localhost:3101 OUT=<dir> node addbooks/web/test/pdf-ocr-e2e.mjs
// Playwright comes from app/node_modules; Chromium from CHROMIUM_PATH or /opt/pw-browsers.
import { createRequire } from 'node:module';
import { createHash, randomBytes } from 'node:crypto';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { makePdf } from './make-pdf.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const REPO = join(HERE, '../../..');
const require = createRequire(join(REPO, 'app/package.json'));
const { chromium } = require('@playwright/test');
const BASE = process.env.BASE || 'http://localhost:3101';
const OUT = process.env.OUT || join(HERE, 'output'); mkdirSync(OUT, { recursive: true });
const EXEC = process.env.CHROMIUM_PATH || (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
const SESSION_KEY = 'sb-yazjyiqsxjystvpkyouk-auth-token';
const USER = 'u-ocr';
const PAGES = 12;
const BLANK = 5;

const results = [];
const check = (name, ok, detail) => { results.push({ name, ok: !!ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail !== undefined ? '  ' + JSON.stringify(detail).slice(0, 400) : ''}`) };

// A scan: a page-sized picture on every page but one, which is blank; no text at all.
const scanPdf = salt => makePdf({ info: { Title: 'Letters from the Archive ' + salt }, pages: Array.from({ length: PAGES }, (_, i) => ({ images: i + 1 === BLANK ? [] : [{ x: 0, y: 0, w: 612, h: 792, pw: 64, ph: 82 }] })) });
const book = salt => { const bytes = scanPdf(salt); const sha256 = createHash('sha256').update(bytes).digest('hex'); return { name: `Archive scan ${salt}.pdf`, bytes, sha256, hex: sha256.slice(0, 24) } };

/* ---------- The account, in memory (worker/routes/userBooks.ts and the OCR job) ---------- */
const NOV = Date.UTC(2026, 10, 1);
function makeAccount(tier) {
  return { tier, on: true, books: [], places: {}, jobs: new Map(), putDelayMs: 0, log: [] };
}
const listed = account => account.books.map(({ bytes, ...b }) => b);
const json = (route, status, body) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
function statusOf(account, hex) {
  const job = account.jobs.get(hex);
  const month = { used: 40, limit: account.tier === 'trial' ? 300 : 1500 };
  if (!job) return { state: 'none', pages: 0, uploaded: 0, done: 0, failed: 0, blank: 0, month, tier: account.tier };
  const missing = [...job.missing].sort((a, b) => a - b);
  const base = { pages: job.pages, uploaded: job.ready.size + job.done.size + job.failed.size, done: job.done.size, failed: job.failed.size, blank: job.blank.size, ...(missing.length ? { missing } : {}), month, tier: account.tier };
  if (job.paused) return { state: 'paused', ...base, reason: job.paused, resumesAt: NOV };
  if (!missing.length && !job.ready.size) return { state: 'done', ...base };
  // As the coordinator says: running while any page waits to be recognised, though some are still missing.
  return { state: job.ready.size ? 'running' : 'uploading', ...base };
}
// The account recognises two pages each time it is asked (the alarm, in the real Worker).
function recognise(job) {
  for (const n of [...job.ready].sort((a, b) => a - b).slice(0, 2)) {
    job.ready.delete(n);
    if (job.failOnce.has(n)) { job.failOnce.delete(n); job.failed.add(n) } else job.done.add(n);
  }
}
const editionOf = (job, title) => ({
  format: 'tinct-user-edition-v1', converter: 1, source: 'ocr', title, author: '', language: 'en', droppedImages: 0,
  ocrLayout: { pages: job.done.size, columns: 0, equations: 0 },
  chapters: [{ number: 1, title: 'Pages 1–12', paragraphs: [...job.done].sort((a, b) => a - b).map(n => `The recognised letter on page ${n} begins here and goes on for a while, as letters do.`), pages: [...job.done].sort((a, b) => a - b) }],
});

async function mockWorker(ctx, account) {
  await ctx.route(url => new URL(url).pathname === '/lab/addbook/', async route => route.fulfill({ response: await route.fetch({ url: BASE + '/lab/addbook/index.html' }) }));
  await ctx.route(/^https:\/\/[a-z0-9]+\.supabase\.co\//, route => route.request().url().includes('grant_type=refresh_token')
    ? json(route, 200, { access_token: 'test-token', refresh_token: 'refresh', token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, user: { id: USER, aud: 'authenticated', email: 'reader@example.com' } })
    : route.abort());
  // Nothing leaves this machine.
  await ctx.route(url => { const u = new URL(url); return !['localhost', '127.0.0.1'].includes(u.hostname) && !/supabase\.co$/.test(u.hostname) }, route => route.abort());
  await ctx.route(url => new URL(url).pathname.startsWith('/api/'), async route => {
    const req = route.request(), url = new URL(req.url()), path = url.pathname;
    const authed = req.headers().authorization === 'Bearer test-token';
    const ocr = path.match(/^\/api\/user-books\/ocr\/([0-9a-f]{24})(\/edition|\/pages\/(\d+)|\/pages)?$/);
    if (ocr) {
      if (!account.on) return json(route, 404, { error: 'Not found' });
      if (!authed) return json(route, 401, { error: 'Unauthorized' });
      const hex = ocr[1], bookOf = account.books.find(b => b.sha256.startsWith(hex));
      if (!bookOf) return json(route, 404, { error: 'Not found' });
      let job = account.jobs.get(hex);
      if (ocr[2] === '/edition') return job && statusOf(account, hex).state === 'done' ? json(route, 200, editionOf(job, bookOf.title)) : json(route, 404, { error: 'Not found' });
      // The recognised pages (blocks without boxes, as pages recognised before 15 Oct 2026), for the viewer's text layer.
      if (ocr[2] === '/pages') return job ? json(route, 200, { pages: [...job.done].sort((a, b) => a - b).map(n => ({ page: n, blocks: [{ t: 'p', x: `The recognised letter on page ${n} begins here and goes on for a while, as letters do.` }] })) }) : json(route, 404, { error: 'Not found' });
      if (ocr[3]) {
        const n = Number(ocr[3]);
        account.log.push(['put', hex, n]);
        if (!job || !(job.missing.has(n) || job.ready.has(n) || job.failed.has(n))) return json(route, 409, { error: 'not_expected' });
        const body = req.postDataBuffer();
        const jpeg = body && body[0] === 0xff && body[1] === 0xd8 && body[body.length - 2] === 0xff && body[body.length - 1] === 0xd9;
        account.log.push(['jpeg', n, jpeg, body?.length || 0]);
        job.missing.delete(n); job.failed.delete(n); job.ready.add(n);
        account.inflight = (account.inflight || 0) + 1; account.most = Math.max(account.most || 0, account.inflight);
        if (account.putDelayMs) await new Promise(r => setTimeout(r, account.putDelayMs));
        account.inflight -= 1;
        return json(route, 200, { ok: true }).catch(() => {});
      }
      if (req.method() === 'GET') { if (job) recognise(job); return json(route, 200, statusOf(account, hex)) }
      if (req.method() === 'POST') {
        const body = JSON.parse(req.postData() || '{}');
        account.log.push(['start', hex, body]);
        if (account.tier === 'none') return json(route, 402, { error: 'premium_required' });
        if (!job) {
          job = { pages: body.pages, missing: new Set(), ready: new Set(), done: new Set(), failed: new Set(), blank: new Set(), failOnce: new Set(account.failOnce || []), paused: null };
          for (let n = 1; n <= body.pages; n++) job.missing.add(n);
          account.jobs.set(hex, job);
        }
        for (const n of body.blank || []) if (job.missing.delete(n)) job.blank.add(n);
        if (body.rerun === 'failed') for (const n of job.failed) { job.failed.delete(n); job.missing.add(n) }
        return json(route, 202, statusOf(account, hex));
      }
      return json(route, 405, {});
    }
    if (path === '/api/user-books' || path === '/api/user-books/') {
      if (!authed) return json(route, 401, { error: 'Unauthorized' });
      return json(route, 200, { books: listed(account), limits: { maxFileBytes: 52428800, maxAccountBytes: 2147483648, maxAccountFiles: 200 } });
    }
    if (path === '/api/user-books/places') return authed ? json(route, 200, { places: account.places }) : json(route, 401, {});
    if (path.startsWith('/api/user-books/places/')) {
      const hex = path.split('/').pop(), body = JSON.parse(req.postData() || '{}'), current = account.places[hex];
      if ((current?.rev ?? 0) !== body.rev) return json(route, 409, { error: 'conflict', place: current ?? null });
      account.places[hex] = { ...body.place, rev: (current?.rev ?? 0) + 1 };
      return json(route, 200, { place: account.places[hex] });
    }
    if (path.startsWith('/api/user-books/')) {
      const id = path.split('/').pop(), found = account.books.find(b => b.id === id);
      if (req.method() === 'DELETE') {
        // As the Worker does: the book goes, and so does its OCR job.
        if (found) { account.books = account.books.filter(b => b !== found); account.jobs.delete(found.sha256.slice(0, 24)); account.log.push(['delete', found.sha256.slice(0, 24)]) }
        return json(route, 200, { ok: true });
      }
      return found && authed ? route.fulfill({ status: 200, contentType: 'application/pdf', body: found.bytes }) : json(route, 404, { error: 'Not found' });
    }
    if (path === '/api/narration/voices') return json(route, 200, { enabled: false, voices: [] });
    return json(route, 404, { error: 'Not found' });
  });
}

async function device(browser, account, viewport = { width: 1280, height: 860 }) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  await mockWorker(ctx, account);
  await ctx.addInitScript(([key, user]) => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({ access_token: 'test-token', refresh_token: 'refresh', token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, user: { id: user, email: 'reader@example.com' } }));
  }, [SESSION_KEY, USER]);
  const p = await page(ctx);
  return { ctx, p };
}
async function page(ctx) {
  const p = await ctx.newPage();
  p.on('pageerror', e => console.log('  [pageerror]', e.message.slice(0, 200)));
  if (process.env.DEBUG) p.on('console', m => console.log('  [console]', m.type(), m.text().slice(0, 300)));
  return p;
}
/** The book in the account and kept on this device, as Add a book keeps a file it has added. */
async function addBook(p, account, b) {
  const id = randomBytes(16).toString('hex');
  account.books.push({ id, name: b.name, title: b.name.replace(/\.pdf$/, ''), author: '', type: 'pdf', size: b.bytes.length, sha256: b.sha256, createdAt: new Date(Date.now() - 86400000).toISOString(), bytes: b.bytes });
  await p.goto(BASE + '/library');
  await p.evaluate(async ([hex, name, bytes, user, cloudId]) => {
    const db = await new Promise((resolve, reject) => { const r = indexedDB.open('tinct-addbook', 1); r.onupgradeneeded = () => r.result.createObjectStore('books', { keyPath: 'key' }); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error) });
    await new Promise((resolve, reject) => { const tx = db.transaction('books', 'readwrite'); tx.objectStore('books').put({ key: 'pdf:' + hex, kind: 'pdf', name, title: name.replace(/\.pdf$/, ''), author: '', owner: user, size: bytes.length, addedAt: Date.now() - 600000, openedAt: Date.now() - 600000, cloudId, bytes: new Uint8Array(bytes).buffer }); tx.oncomplete = resolve; tx.onerror = () => reject(tx.error) });
    db.close();
  }, [b.hex, b.name, [...b.bytes], USER, id]);
}
const recordOf = (p, hex) => p.evaluate(async key => {
  const db = await new Promise(resolve => { const r = indexedDB.open('tinct-addbook', 1); r.onsuccess = () => resolve(r.result) });
  const rec = await new Promise(resolve => { const r = db.transaction('books').objectStore('books').get(key); r.onsuccess = () => resolve(r.result) });
  db.close();
  return rec ? { edition: rec.edition ? { source: rec.edition.source, chapters: rec.edition.chapters.length } : null, scan: rec.scan ? { textPages: rec.scan.textPages } : null } : null;
}, 'pdf:' + hex);
const viewer = hex => `${BASE}/lab/addbook/?userBook=${hex}`;
async function inViewer(p, hex) {
  await p.waitForURL(new RegExp(`/lab/addbook/\\?userBook=${hex}`), { timeout: 60000 });
  await p.waitForFunction(() => document.body.dataset.view === 'reader' && document.querySelectorAll('canvas').length > 0, null, { timeout: 60000 });
}
async function inReader(p, hex) {
  await p.waitForURL(new RegExp(`/reader\\?userBook=${hex}`), { timeout: 60000 });
  await p.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true' && document.querySelectorAll('.lab-page-wrap [data-testid="lab-word"]').length > 3, null, { timeout: 60000 });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(600);
}
const banner = (p, kind, timeout = 30000) => p.waitForSelector(`.byob-ocr[data-kind="${kind}"]`, { timeout }).then(() => p.textContent('.byob-ocr'));
const bannerText = (p, re, timeout = 60000) => p.waitForFunction(source => new RegExp(source).test(document.querySelector('.byob-ocr')?.textContent || ''), re.source, { timeout }).then(() => p.textContent('.byob-ocr'));
const shot = (p, name) => p.screenshot({ path: join(OUT, name + '.jpg'), type: 'jpeg', quality: 70 });
const puts = (account, hex) => account.log.filter(([kind, h]) => kind === 'put' && h === hex).map(([, , n]) => n);

const browser = await chromium.launch({ executablePath: EXEC, args: ['--mute-audio'] });
try {
  /* ---- Premium: start, close mid-upload, reopen and resume, finish ---- */
  const premium = makeAccount('premium');
  const SCAN = book('A');
  const A = await device(browser, premium);
  await addBook(A.p, premium, SCAN);
  premium.putDelayMs = 900;
  await A.p.goto(viewer(SCAN.hex));
  await inViewer(A.p, SCAN.hex);
  const offer = await banner(A.p, 'offer');
  check('Premium, a scan: one banner offers to recognise its text, with its pages and the month’s pages it would use', /It has 12 pages and would use 12 of the 1,460 pages left in your month/.test(offer), offer);
  const font = await A.p.evaluate(() => getComputedStyle(document.querySelector('.byob-ocr')).fontFamily);
  check('the banner is set in EB Garamond, not a monospace', /EB Garamond/.test(font) && !/mono/i.test(font), font);
  check('nothing is sent before the reader says yes', !premium.log.some(([k]) => k === 'start' || k === 'put'));
  await shot(A.p, '01-premium-offer');
  await A.p.click('.byob-ocr [data-ocr="start"]');
  const preparing = await bannerText(A.p, /Preparing pages [1-9]\d* of 12/);
  check('"Preparing pages … of 12" while pages are made and sent', /Preparing pages \d+ of 12/.test(preparing), preparing);
  await A.p.waitForFunction(() => /Preparing pages ([4-9]|1[01]) of 12/.test(document.querySelector('.byob-ocr')?.textContent || ''), null, { timeout: 30000 });
  await shot(A.p, '02-premium-preparing');
  const firstPuts = puts(premium, SCAN.hex);
  const started = premium.log.find(([k]) => k === 'start');
  check('started with the page count', started?.[2]?.pages === 12, started?.[2]);
  // Closed mid-upload.
  await A.p.close();
  const sentBeforeClose = puts(premium, SCAN.hex);
  check('closed mid-upload: some pages sent, not all', sentBeforeClose.length > 0 && sentBeforeClose.length < PAGES - 1, { sent: sentBeforeClose });
  const jpegs = premium.log.filter(([k]) => k === 'jpeg');
  check('each page went as a JPEG', jpegs.length > 0 && jpegs.every(([, , ok]) => ok), jpegs.slice(0, 3));
  check('four pages in flight at a time, never more', premium.most === 4, { most: premium.most, firstPuts });
  // Reopened: it resumes from what the account says is missing.
  premium.putDelayMs = 150;
  const A2 = await page(A.ctx);
  await A2.goto(viewer(SCAN.hex));
  await inViewer(A2, SCAN.hex);
  const recognising = await bannerText(A2, /Recognising text: \d+ of 12 pages/, 90000);
  const allPuts = puts(premium, SCAN.hex);
  const unique = new Set(allPuts);
  check('reopened, it resumed: every non-blank page sent exactly once, the blank page never', unique.size === PAGES - 1 && allPuts.length === unique.size && !unique.has(BLANK), { allPuts });
  const local = await A2.evaluate(h => JSON.parse(localStorage.getItem('tinct-addbook:ocr:' + h) || 'null'), SCAN.hex);
  check('the blank page was found here and told to the account', local?.blank?.includes(BLANK) && premium.jobs.get(SCAN.hex)?.blank.has(BLANK), local);
  check('"Recognising text: … of 12 pages" once the pages are in', /Recognising text: \d+ of 12 pages/.test(recognising), recognising);
  await shot(A2, '03-premium-recognising');

  // My shelf meanwhile (another tab).
  const shelf = await page(A.ctx);
  await shelf.goto(`${BASE}/library#my-shelf`);
  const shelfLine = await shelf.waitForFunction(h => document.querySelector(`[data-own-key="pdf:${h}"] .own-ocr`)?.textContent, SCAN.hex, { timeout: 30000 }).then(h => h.jsonValue()).catch(() => null);
  check('My shelf says "Recognising text…" under the scan', shelfLine === 'Recognising text…', shelfLine);
  await shelf.locator(`[data-own-key="pdf:${SCAN.hex}"]`).scrollIntoViewIfNeeded().catch(() => {});
  await shot(shelf, '04-my-shelf-recognising');
  await shelf.close();

  const ready = await bannerText(A2, /Tinct text is ready/, 90000);
  await A2.waitForFunction(() => !document.getElementById('textBtn').hidden, null, { timeout: 10000 });
  check('then "Tinct text is ready", and the "Tinct text" control appears', /Tinct text is ready/.test(ready) && await A2.isVisible('#textBtn'), ready);
  const rec = await recordOf(A2, SCAN.hex);
  check('the recognised text is kept with the book on this device', rec?.edition?.source === 'ocr', rec);
  // PR D (15 Oct 2026): a recognised scan stays in the PDF reader with the margin, its words laid over its pages.
  check('after OCR the scan stays here, in its pages, with its recognised words over them', await A2.evaluate(h => JSON.parse(localStorage.getItem('tinct-addbook:edition:' + h)), SCAN.hex) === 'pages' && /\/lab\/addbook\//.test(A2.url()) && await A2.waitForFunction(() => /The recognised letter on page 1/.test(document.querySelector('.pdf-sheet[data-page="1"] .text-layer')?.textContent || ''), null, { timeout: 15000 }).then(() => true).catch(() => false));
  await shot(A2, '05-premium-ready');

  /* ---- Read in Tinct text, switch to a page and back ---- */
  await A2.click('#textBtn');
  await inReader(A2, SCAN.hex);
  const words = await A2.$$eval('.lab-page-wrap [data-testid="lab-word"]', ws => ws.map(w => w.textContent.trim()).join(' '));
  check('reads in the Tinct reader as the recognised text', /The recognised letter on page \d+ begins here/.test(words), words.slice(0, 120));
  await shot(A2, '06-tinct-text');
  await A2.click('[data-testid="lab-super"]');
  await A2.click('[data-testid="lab-super-row-editions"]');
  await A2.click('[data-testid="lab-v2-main-edition"]');
  await A2.locator('.lab-v2-edition-option', { hasText: 'Original pages' }).click();
  await inViewer(A2, SCAN.hex);
  await A2.waitForTimeout(800);
  check('"Original pages" opens the scan’s pages, with "Tinct text" to go back and no offer again', await A2.isVisible('#textBtn') && !(await A2.$('.byob-ocr[data-kind="offer"]')), await A2.textContent('#progress'));
  await A2.click('#textBtn');
  await inReader(A2, SCAN.hex);
  check('and back to Tinct text', /The recognised letter/.test(await A2.$$eval('.lab-page-wrap [data-testid="lab-word"]', ws => ws.map(w => w.textContent).join(' '))));

  /* ---- Deleting the book removes the job ---- */
  await A2.goto(viewer(SCAN.hex) + '&pages=1');
  await inViewer(A2, SCAN.hex);
  await A2.evaluate(async h => { await window.TinctReader.removeBook('pdf:' + h) }, SCAN.hex);
  const afterDelete = await A2.evaluate(h => localStorage.getItem('tinct-addbook:ocr:' + h), SCAN.hex);
  check('deleting the book deletes it in the account, which removes its OCR job, and this device forgets the job', premium.log.some(([k, h]) => k === 'delete' && h === SCAN.hex) && !premium.jobs.has(SCAN.hex) && afterDelete === null, { jobs: [...premium.jobs.keys()], afterDelete });
  await A.ctx.close();

  /* ---- A free account: one calm line, to the account sheet ---- */
  const free = makeAccount('none');
  // On the phone.
  const F = await device(browser, free, { width: 390, height: 844 });
  const FREE = book('F');
  await addBook(F.p, free, FREE);
  await F.p.goto(viewer(FREE.hex));
  await inViewer(F.p, FREE.hex);
  const line = await banner(F.p, 'free');
  const href = await F.p.getAttribute('.byob-ocr a', 'href');
  check('a free account sees only the approved line', line === 'This PDF is a scan. With Premium, Tinct can recognise its text so you can read it reflowed, listen and ask about it.' && !(await F.p.$('.byob-ocr button')), line);
  check('the line opens the account sheet', href?.startsWith('/sign-in?mode=account&returnTo=%2Flab%2Faddbook%2F'), href);
  check('a free account starts nothing', !free.log.some(([k]) => k === 'start' || k === 'put'));
  const fit = await F.p.evaluate(() => { const r = document.querySelector('.byob-ocr').getBoundingClientRect(); return { left: r.left, right: r.right, width: innerWidth, overflow: document.documentElement.scrollWidth - innerWidth } });
  check('phone: the line fits within 16 px gutters, no sideways scroll', fit.left >= 16 && fit.right <= fit.width - 16 && fit.overflow <= 0, fit);
  await shot(F.p, '07-free-line');
  await F.ctx.close();

  /* ---- The monthly limit, and failed pages tried again ---- */
  const limited = makeAccount('premium');
  const L = await device(browser, limited);
  const LIM = book('L'), RETRY = book('R');
  await addBook(L.p, limited, LIM);
  await addBook(L.p, limited, RETRY);
  limited.jobs.set(LIM.hex, { pages: PAGES, missing: new Set(), ready: new Set([9, 10, 11, 12]), done: new Set([1, 2, 3, 4, 6, 7, 8]), failed: new Set(), blank: new Set([BLANK]), failOnce: new Set(), paused: 'account_pages' });
  await L.p.goto(viewer(LIM.hex));
  await inViewer(L.p, LIM.hex);
  const paused = await banner(L.p, 'paused');
  check('at the monthly limit: "Continues on 1 November"', paused === 'Continues on 1 November', paused);
  await shot(L.p, '08-monthly-limit');
  limited.jobs.get(LIM.hex).paused = 'global_usd';
  await L.p.reload();
  await inViewer(L.p, LIM.hex);
  check('at the shared pool’s limit: "Continues later"', await banner(L.p, 'paused') === 'Continues later');

  limited.jobs.set(RETRY.hex, { pages: PAGES, missing: new Set(), ready: new Set(), done: new Set([1, 2, 4, 6, 8, 9, 10, 11, 12]), failed: new Set([3, 7]), blank: new Set([BLANK]), failOnce: new Set(), paused: null });
  // Recognised on another device, two pages not: opened here it stays in its pages (PR D), its recognised
  // words over them; the offer to try the two again.
  await L.p.goto(viewer(RETRY.hex));
  await inViewer(L.p, RETRY.hex);
  check('recognised elsewhere: the scan opens here, in its pages, with its recognised words over them', await L.p.waitForFunction(() => /The recognised letter on page 1/.test(document.querySelector('.pdf-sheet[data-page="1"] .text-layer')?.textContent || ''), null, { timeout: 15000 }).then(() => true).catch(() => false) && /\/lab\/addbook\//.test(L.p.url()));
  await L.p.goto(viewer(RETRY.hex) + '&pages=1');
  await inViewer(L.p, RETRY.hex);
  const failedLine = await banner(L.p, 'failed');
  check('failed pages: "2 pages could not be read. Try them again"', /^2 pages could not be read\. Try them again$/.test(failedLine.trim()), failedLine);
  await shot(L.p, '09-failed-pages');
  await L.p.click('.byob-ocr [data-ocr="retry"]');
  await bannerText(L.p, /Tinct text is ready/, 60000).catch(async e => { console.log('  banner:', await L.p.textContent('.byob-ocr').catch(() => null), JSON.stringify(limited.log.filter(([, h]) => h === RETRY.hex))); throw e });
  const retried = puts(limited, RETRY.hex);
  check('"Try them again" re-runs the failed pages, sending only those pages again', JSON.stringify(retried.sort((a, b) => a - b)) === '[3,7]' && limited.log.some(([k, h, body]) => k === 'start' && h === RETRY.hex && body.rerun === 'failed'), retried);
  await L.ctx.close();

  /* ---- Switched off: nothing but the scan's own note ---- */
  const off = makeAccount('premium');
  off.on = false;
  const O = await device(browser, off);
  const OFF = book('O');
  await addBook(O.p, off, OFF);
  await O.p.goto(viewer(OFF.hex));
  await inViewer(O.p, OFF.hex);
  await O.p.waitForTimeout(3000);
  const note = await O.p.textContent('.byob-toast').catch(() => '');
  check('recognition switched off (404): no banner, the scan’s note as before', !(await O.p.$('.byob-ocr')) && /scan without text/.test(note), note);
  await O.ctx.close();
} finally {
  await browser.close();
}
const failed = results.filter(r => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
