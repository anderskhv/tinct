// Browser checks for the PDF viewer as a Tinct book: the scan's title, author and chapters,
// the reader's theme on the whole viewer, the reader's Settings sheet, the book switcher on
// the title, the back arrow to My shelf, and a reload that keeps the PDF and its page.
//   node addbooks/web/test/pdf-polish.mjs [screenshot dir]
// Needs the page built (node addbooks/web/scripts/build.mjs) and the app's build (app/dist).
// Fixtures: addbooks/web/test/pdf-fixtures/ (written by make-pdf.mjs, committed).
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { start } from './serve.mjs';
import { pdfFixtures } from './make-pdf.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const REPO = join(HERE, '../../..');
const require = createRequire(join(REPO, 'app/package.json'));
const { chromium } = require('@playwright/test');
const OUT = process.argv[2] || join(HERE, 'output/pdf-polish'); mkdirSync(OUT, { recursive: true });
const FIX = join(HERE, 'pdf-fixtures'); mkdirSync(FIX, { recursive: true });
for (const [name, bytes] of Object.entries(pdfFixtures())) writeFileSync(join(FIX, name), bytes);
const PORT = 4731, ORIGIN = `http://127.0.0.1:${PORT}`, BASE = `${ORIGIN}/lab/addbook/`;
const EXEC = process.env.CHROMIUM_PATH || (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
const SESSION_KEY = 'sb-yazjyiqsxjystvpkyouk-auth-token';
const BOOK_URL = /\/lab\/addbook\/\?userBook=[0-9a-f]{24}$/;
const results = [];
const check = (name, ok, detail) => { results.push({ name, ok: !!ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail !== undefined ? '  ' + JSON.stringify(detail).slice(0, 300) : ''}`) };
const prefsFor = theme => JSON.stringify({ version: 2, shared: { primaryEdition: 'original-en', compareEdition: '', audioEdition: 'original-en', audioSpeed: 1, compareOpen: false, voicePersona: 'female' }, phone: { theme }, desktop: { theme } });

async function page(browser, viewport) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  await ctx.route(/^https:\/\/[a-z0-9]+\.supabase\.co\//, route => route.abort());
  const p = await ctx.newPage();
  const problems = [];
  p.on('pageerror', e => problems.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && /CSP violation|TypeError|ReferenceError/.test(m.text())) problems.push('console: ' + m.text()) });
  await p.addInitScript(() => document.addEventListener('securitypolicyviolation', e => console.error('CSP violation: ' + e.violatedDirective + ' ' + e.blockedURI)));
  return { ctx, p, problems };
}
async function signIn(p) {
  await p.goto(BASE + '?mode=file');
  await p.evaluate(key => localStorage.setItem(key, JSON.stringify({ access_token: 'test-token', refresh_token: 'refresh-test-token', token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, user: { id: 'u-test', email: 'reader@example.com' } })), SESSION_KEY);
  await p.reload();
  await p.waitForSelector('#doorOwn');
}
async function openFile(p, file) {
  const chooser = p.waitForEvent('filechooser');
  await p.click('#abDrop');
  await (await chooser).setFiles(file);
  await p.waitForSelector('#attestBox, .pdf-sheet', { timeout: 30000 });
  const box = await p.$('#attestBox');
  if (box) { await box.check(); await p.click('#attestOk') }
  await ready(p);
}
async function ready(p) {
  await p.waitForSelector('.pdf-sheet canvas', { timeout: 30000 });
  // The scan is done once the chapter pill shows a page count or a chapter.
  await p.waitForFunction(() => /of \d|[A-Za-z]{4}/.test(document.getElementById('pageLabel')?.textContent || ''), null, { timeout: 30000 });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(400);
}
const label = p => p.textContent('#pageLabel');
const shot = (p, name) => p.screenshot({ path: join(OUT, name + '.png') });

const server = await start(PORT);
const browser = await chromium.launch({ executablePath: EXEC, args: ['--mute-audio'] });
try {
  const essay = join(FIX, 'PossibleMinds Deutsch (1).pdf');

  // ---- Desktop: the essay ----
  {
    const { ctx, p, problems } = await page(browser, { width: 1440, height: 900 });
    await signIn(p);
    await openFile(p, essay);
    check('title: the printed title, not the file name', await p.textContent('#bookTitle') === 'Beyond Reward and Punishment', await p.textContent('#bookTitle'));
    check('the PDF has its own address', BOOK_URL.test(p.url()), p.url());
    const hex = p.url().split('userBook=')[1];
    check('the chapter pill shows the page before the first real heading', await label(p) === 'p. 1 of 5', await label(p));
    const stored = await p.evaluate(async key => { const r = await window.TinctReader.library.get(key); return r && { title: r.title, author: r.author, pages: r.pages, v: r.scan?.v, nav: r.scan?.nav } }, 'pdf:' + hex);
    check('the scan is kept with the book: title, author, pages', stored?.title === 'Beyond Reward and Punishment' && stored.author === 'David Deutsch' && stored.pages === 5 && stored.v >= 1 && stored.nav === 'headings', stored);
    const acct = (await (await fetch(`${ORIGIN}/__books`)).json()).users['u-test']?.find(b => b.name === 'PossibleMinds Deutsch (1).pdf');
    check('the account copy is named by the document title and author', acct?.title === 'Beyond Reward and Punishment' && acct.author === 'David Deutsch', acct && { title: acct.title, author: acct.author });

    await p.click('#pageBtn');
    await p.waitForSelector('.lab-contents-v2 .tree');
    const toc = await p.$$eval('.lab-contents-v2 .tree .text', els => els.map(e => e.textContent));
    check('contents: the real headings only (no epigraph, no running head)', toc.join(' | ') === 'Misconceptions of Thinking | What It Means to Think', toc);
    await shot(p, 'desktop-light-contents');
    await p.click('.lab-contents-v2 [data-go="h0"]');
    await p.waitForTimeout(700);
    check('a chapter opens at its page; the pill names it', await label(p) === 'Misconceptions of Thinking' && /p\. 3 · \d+%/.test(await p.textContent('#progress')), [await label(p), await p.textContent('#progress')]);

    // Reload: the same PDF, at the same page.
    await p.waitForTimeout(400);
    await p.reload();
    await ready(p);
    const place = await p.evaluate(() => { const top = document.getElementById('scroll').getBoundingClientRect().top; return [...document.querySelectorAll('.pdf-sheet')].find(s => s.getBoundingClientRect().bottom > top + 1)?.dataset.page });
    check('reload keeps the PDF and its page', BOOK_URL.test(p.url()) && place === '3' && await p.textContent('#bookTitle') === 'Beyond Reward and Punishment', { url: p.url(), place });

    // The title opens the book switcher.
    await p.click('#bookBtn');
    await p.waitForSelector('.lab-book-switcher .lab-book-switcher-row.is-active');
    await p.waitForFunction(() => !document.querySelector('.lab-book-switcher-status')?.textContent?.includes('Loading'), null, { timeout: 15000 });
    const sw = await p.evaluate(() => ({ head: document.querySelector('.lab-book-switcher-head span')?.textContent, active: document.querySelector('.lab-book-switcher-row.is-active')?.textContent, library: !!document.querySelector('.lab-book-switcher-library'), contents: !!document.querySelector('.lab-contents-v2') }));
    check('the title opens the reader’s book switcher (Reading now, this PDF first, Library)', sw.head === 'Reading now' && /Beyond Reward and Punishment/.test(sw.active) && /p\. 3 of 5/.test(sw.active) && sw.library && !sw.contents, sw);
    await shot(p, 'desktop-light-switcher');
    await p.keyboard.press('Escape');

    // The library's lists: the PDF is being read, at its page.
    const own = await p.evaluate(async () => { await import('/lab/library-add.js'); const api = window.__tinctLibraryAdd; const books = await api.ownBooks(); const rows = (await api.switcherRows()).rows; return { books: books.filter(b => b.kind === 'pdf').map(b => ({ title: b.title, readingAt: b.readingAt, href: b.href })), rows: rows.map(r => ({ title: r.title, chapterLabel: r.chapterLabel, href: r.href })) } });
    const ownBook = own.books.find(b => b.title === 'Beyond Reward and Punishment');
    check('My shelf lists the PDF as being read, opening at its own address', ownBook && ownBook.readingAt > 0 && BOOK_URL.test(ORIGIN + ownBook.href), own.books);
    check('Reading now lists the PDF with its page in place of a chapter', own.rows.some(r => r.title === 'Beyond Reward and Punishment' && r.chapterLabel === 'p. 3 of 5' && BOOK_URL.test(ORIGIN + r.href)), own.rows);

    // The library's reading table (libraryTwoReading): the PDF beside Tinct's books.
    const table = await p.evaluate(async () => {
      try { const m = await import('/lab/library-2-reading.js'); return { keys: Object.keys(m) } } catch (e) { return { error: String(e) } }
    });
    check('the library reading module loads beside the viewer', !table.error, table);

    // /reader?userBook=<hex> (the reader's own-book address) goes on to the PDF viewer.
    await p.goto(`${ORIGIN}/reader?userBook=${hex}`);
    await p.waitForURL(BOOK_URL, { timeout: 30000 });
    await ready(p);
    check('/reader?userBook=<pdf> opens the PDF in its viewer, at its page', await label(p) === 'Misconceptions of Thinking', [p.url(), await label(p)]);

    // Back: to My shelf in the library.
    const went = [];
    p.on('request', r => { if (r.isNavigationRequest()) went.push(r.url()) });
    await p.click('#backBtn');
    await p.waitForTimeout(800);
    check('the back arrow goes to My shelf in the library', went[0] === `${ORIGIN}/library?shelf=mine`, went);
    check('desktop: no page errors', problems.length === 0, problems);
    await ctx.close();
  }

  // ---- Themes and Settings: desktop and phone ----
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const size = viewport.width < 700 ? 'phone' : 'desktop';
    const { ctx, p, problems } = await page(browser, viewport);
    await signIn(p);
    await openFile(p, essay);
    for (const theme of ['light', 'dark', 'book']) {
      await p.evaluate(([k, v]) => localStorage.setItem(k, v), ['tinct-lab-prefs', prefsFor(theme)]);
      await p.reload();
      await ready(p);
      const look = await p.evaluate(() => {
        const root = document.querySelector('.lab.byob'), hdr = document.getElementById('hdr'), bar = getComputedStyle(hdr).backgroundColor, sheet = document.querySelector('.pdf-sheet'), canvas = sheet.querySelector('canvas');
        return { theme: document.documentElement.dataset.pdfTheme, night: root.classList.contains('is-night'), book: root.classList.contains('is-book-theme'), header: bar === 'rgba(0, 0, 0, 0)' ? getComputedStyle(root).backgroundColor : bar, pill: getComputedStyle(document.getElementById('pageBtn')).backgroundColor, sheet: getComputedStyle(sheet).backgroundColor, blend: getComputedStyle(canvas).mixBlendMode, raw: canvas.classList.contains('is-raw'), titleColour: getComputedStyle(document.getElementById('bookTitle')).color };
      });
      const want = { light: 'rgb(236, 231, 219)', dark: 'rgb(23, 20, 17)', book: 'rgb(231, 220, 199)' }[theme];
      const room = size === 'desktop' && theme === 'dark' ? 'rgb(16, 14, 12)' : want;
      check(`${size} ${theme}: the top bar and the page take the theme's paper`, look.theme === theme && look.header === room && look.sheet === want && look.night === (theme === 'dark') && look.book === (theme === 'book') && (theme === 'dark' ? look.blend === 'normal' && !look.raw : look.blend === 'multiply'), look);
      await shot(p, `${size}-${theme}-page`);
      await p.click('#superBtn');
      await p.click('.lab-super-row[data-row="settings"]');
      await p.waitForSelector('.byob-settings .lab-v2-sheet');
      const sheetLook = await p.evaluate(() => {
        const s = document.querySelector('.byob-settings .lab-v2-sheet');
        const fonts = new Set([...s.querySelectorAll('*')].filter(e => e.offsetParent && e.textContent.trim()).map(e => getComputedStyle(e).fontFamily));
        return { rows: [...s.querySelectorAll('.lab-v2-row:not([hidden]) .lab-v2-row-label')].map(e => e.textContent), themes: [...s.querySelectorAll('.lab-v2-theme')].map(e => e.textContent.replace('Aa', '').trim()), active: s.querySelector('.lab-v2-theme.is-active')?.textContent, mono: [...fonts].filter(f => /mono/i.test(f)), families: [...new Set([...fonts].map(f => f.split(',')[0].replace(/"/g, '').trim()))] };
      });
      check(`${size} ${theme}: Settings is the reader's sheet (theme, page size, rows), no mono, no Dark pages / Paper tone`, sheetLook.themes.join() === 'Book,Light,Dark' && sheetLook.active?.includes({ light: 'Light', dark: 'Dark', book: 'Book' }[theme]) && sheetLook.rows.join() === 'Full width,Trim page margins,Full screen,Voice,Speed' && sheetLook.mono.length === 0 && sheetLook.families.length <= 2, sheetLook);
      await shot(p, `${size}-${theme}-settings`);
      await p.click('.byob-settings .lab-v2-dismiss');
    }
    // Choosing a theme in the sheet is the reader's own setting.
    await p.click('#superBtn'); await p.click('.lab-super-row[data-row="settings"]');
    await p.click('.byob-settings [data-theme-choice="dark"]');
    await p.waitForTimeout(300);
    const chosen = await p.evaluate(size => ({ stored: JSON.parse(localStorage.getItem('tinct-lab-prefs'))[size].theme, night: document.querySelector('.lab.byob').classList.contains('is-night') }), size);
    check(`${size}: Dark in Settings sets the reader's theme and darkens the viewer`, chosen.stored === 'dark' && chosen.night, chosen);
    check(`${size}: no page errors`, problems.length === 0, problems);
    await ctx.close();
  }

  // ---- The report (metadata + outline) and the scan (no text) ----
  {
    const { ctx, p, problems } = await page(browser, { width: 1280, height: 860 });
    await signIn(p);
    await openFile(p, join(FIX, 'scan_0042.pdf'));
    check('report: title from the metadata', await p.textContent('#bookTitle') === 'Notes on Natural Philosophy');
    await p.click('#pageBtn'); await p.waitForSelector('.lab-contents-v2 .tree');
    const tops = await p.$$eval('.lab-contents-v2 .tree > ul > li > .node .text', els => els.map(e => e.textContent));
    check('report: contents from the bookmarks (in the house style)', tops.join(' | ') === 'Preface | Part 1: Motion | Part 2: Light', tops);
    await p.keyboard.press('Escape');
    // Dark: the text turns light, the picture keeps its own tones (not a negative).
    await p.evaluate(([k, v]) => localStorage.setItem(k, v), ['tinct-lab-prefs', prefsFor('dark')]);
    await p.reload(); await ready(p);
    await p.click('#pageBtn'); await p.fill('.lab-contents-v2 #jumpInput', '4'); await p.press('.lab-contents-v2 #jumpInput', 'Enter');
    await p.waitForTimeout(1200);
    await shot(p, 'desktop-dark-picture');
    await p.goto(BASE + '?mode=file'); await p.waitForSelector('#doorOwn');
    await openFile(p, join(FIX, 'IMG_20240512_scan.pdf'));
    check('scan: a readable file name, page navigation', await p.textContent('#bookTitle') === 'IMG 20240512 scan' && await label(p) === 'p. 1 of 2', [await p.textContent('#bookTitle'), await label(p)]);
    await p.evaluate(([k, v]) => localStorage.setItem(k, v), ['tinct-lab-prefs', prefsFor('dark')]);
    await p.reload(); await ready(p);
    await p.click('#pageBtn'); await p.waitForSelector('.lab-contents-v2 .byob-pages');
    const pages = await p.$$eval('.lab-contents-v2 .byob-pages .text', els => els.map(e => e.textContent));
    check('scan: the contents list its pages', pages.join() === 'p. 1,p. 2', pages);
    await shot(p, 'desktop-dark-scan-pages');
    check('report and scan: no page errors', problems.length === 0, problems);
    await ctx.close();
  }
} finally {
  await browser.close();
  server.close();
}
const failed = results.filter(r => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed. Screenshots: ${OUT}`);
process.exit(failed.length ? 1 : 0);
