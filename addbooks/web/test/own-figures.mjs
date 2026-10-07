// A reader's own EPUB laid out like a commercial one (make-epub.mjs makeCommercialEpub):
// every figure draws (or, where this browser cannot draw the format, shows its caption
// with a placeholder), never a broken image -- in Chromium and in WebKit (Safari's
// engine), after a reload, after the browser is closed and opened again, and on a
// second device that opens the account copy.
//   node addbooks/web/test/own-figures.mjs      (needs both builds, as e2e.mjs does)
// Also run at the end of e2e.mjs. Playwright comes from app/node_modules; browsers from
// /opt/pw-browsers when present (never installed by this test).
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { makeCommercialEpub } from './make-epub.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const REPO = join(HERE, '../../..');
const require = createRequire(join(REPO, 'app/package.json'));
if (!process.env.PLAYWRIGHT_BROWSERS_PATH && existsSync('/opt/pw-browsers')) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const { chromium, webkit } = require('@playwright/test');
const OUT = join(HERE, 'output'); mkdirSync(OUT, { recursive: true });
const FIX = join(HERE, 'fixtures'); mkdirSync(FIX, { recursive: true });
const SESSION_KEY = 'sb-yazjyiqsxjystvpkyouk-auth-token';
const RIGHTS_READER = /\/reader\?userBook=([0-9a-f]{24})$/;

// Every figure in the Figures tab, and the ones on the page: drawn, a placeholder, or broken.
const FIGURE_STATE = () => {
  const state = el => {
    const img = el.querySelector('img');
    if (img) return img.complete ? (img.naturalWidth > 0 ? 'drawn' : 'broken') : 'loading';
    return el.querySelector('[data-testid="lab-figure-missing"]') ? 'placeholder' : 'empty';
  };
  return {
    page: [...document.querySelectorAll('.lab-page-wrap [data-testid="lab-figure"]')].map(el => ({ caption: el.querySelector('.lab-figure-caption')?.textContent || '', state: state(el) })),
    listed: [...document.querySelectorAll('[data-testid="lab-contents-figure"]')].map(el => ({ text: el.textContent.replace(/\s+/g, ' ').trim(), state: state(el) })),
  };
};

export async function ownFigureChecks({ base, check, browsers = ['chromium', 'webkit'] }) {
  const epub = join(FIX, 'quiet-experiments.epub');
  writeFileSync(epub, makeCommercialEpub());
  for (const name of browsers) {
    const type = name === 'webkit' ? webkit : chromium;
    const exec = name === 'chromium' && existsSync('/opt/pw-browsers/chromium') && !process.env.PLAYWRIGHT_BROWSERS_PATH ? '/opt/pw-browsers/chromium' : undefined;
    const label = `own figures (${name})`;
    const dir = mkdtempSync(join(tmpdir(), `tinct-figures-${name}-`));
    const token = name === 'webkit' ? 'other-token' : 'cloud-token', user = name === 'webkit' ? 'u-other' : 'u-cloud';
    const problems = [];
    const prepare = async ctx => {
      await ctx.route(/^https:\/\/[a-z0-9]+\.supabase\.co\//, route => route.abort());
      const p = ctx.pages()[0] || await ctx.newPage();
      // WebKit reports a script load cut short by leaving the page (here: the test's own
      // navigations) as an "access control" error; it is not the page's.
      p.on('pageerror', e => { if (!/due to access control checks/.test(e.message)) problems.push('pageerror: ' + e.message) });
      p.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource|supabase/i.test(m.text())) problems.push('console: ' + m.text()) });
      await p.addInitScript(() => document.addEventListener('securitypolicyviolation', e => console.error('CSP violation: ' + e.violatedDirective + ' ' + e.blockedURI)));
      return p;
    };
    const signIn = async p => {
      await p.evaluate(([key, token, user]) => localStorage.setItem(key, JSON.stringify({ access_token: token, refresh_token: 'refresh-' + token, token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, user: { id: user, email: 'reader@example.com' } })), [SESSION_KEY, token, user]);
      await p.reload();
      await p.waitForSelector('#doorOwn');
    };
    const ready = async p => {
      await p.waitForURL(RIGHTS_READER, { timeout: 60000 });
      await p.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true' && document.querySelectorAll('.lab-page-wrap [data-testid="lab-word"]').length > 3, null, { timeout: 60000 });
    };
    // The page's figures and every figure in the Figures tab, once their images have settled.
    const figures = async (p, shot) => {
      await p.click('[data-testid="lab-header-chapter"]');
      await p.waitForSelector('[data-testid="lab-contents-tab-figures"]', { timeout: 10000 });
      await p.click('[data-testid="lab-contents-tab-figures"]');
      await p.waitForSelector('[data-testid="lab-contents-figure"]', { timeout: 10000 });
      await p.waitForFunction(() => [...document.querySelectorAll('[data-testid="lab-contents-figure"] img, .lab-page-wrap [data-testid="lab-figure"] img')].every(img => img.complete), null, { timeout: 15000 }).catch(() => {});
      const shown = await p.evaluate(FIGURE_STATE);
      if (shot) await p.screenshot({ path: join(OUT, shot) });
      await p.keyboard.press('Escape');
      return shown;
    };
    const judge = (when, shown) => {
      const listed = shown.listed;
      const byNumber = n => listed.find(item => new RegExp(`Figure ${n}:`).test(item.text))?.state;
      const drawnAll = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12].every(n => byNumber(n) === 'drawn');
      check(`${label}, ${when}: all 13 figures listed; every one drawn but the TIFF (drawn or a placeholder) and the missing file (a placeholder); none broken`,
        listed.length === 13 && drawnAll && ['drawn', 'placeholder'].includes(byNumber(10)) && byNumber(13) === 'placeholder'
          && !listed.some(item => item.state === 'broken') && shown.page.length > 0 && shown.page.every(item => item.state === 'drawn' || item.state === 'placeholder')
          // Opened at the start, the first page shows Figure 1 (later opens resume at the reader's place).
          && (!/just added|second device/.test(when) || shown.page.some(item => /Double slit/.test(item.caption) && item.state === 'drawn')),
        { listed: listed.map(item => `${(/Figure (\d+):/.exec(item.text) || [])[1]}:${item.state}`).join(" "), page: shown.page });
    };

    // ---- First device: add the book, read it, reload, close the browser and come back ----
    let ctx = await type.launchPersistentContext(dir, { executablePath: exec, viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
    let p = await prepare(ctx);
    let hex = '';
    try {
      await p.goto(base);
      await signIn(p);
      const chooser = p.waitForEvent('filechooser');
      await p.click('#abDrop');
      await (await chooser).setFiles(epub);
      await Promise.race([p.waitForSelector('#attestBox', { timeout: 30000 }), p.waitForURL(RIGHTS_READER, { timeout: 30000 })]);
      if (!RIGHTS_READER.test(p.url())) { await p.check('#attestBox'); await p.click('#attestOk') }
      await ready(p);
      hex = RIGHTS_READER.exec(p.url())[1];
      await p.screenshot({ path: join(OUT, `own-figures-${name}.png`) });
      judge('just added', await figures(p, `own-figures-tab-${name}.png`));
      // The missing picture on its page: its caption under a placeholder, never a broken image.
      await p.click('[data-testid="lab-header-chapter"]');
      await p.click('[data-testid="lab-contents-tab-figures"]');
      await p.locator('[data-testid="lab-contents-figure"]', { hasText: 'Figure 13:' }).click();
      await p.waitForSelector('.lab-page-wrap [data-testid="lab-figure-missing"]', { timeout: 10000 });
      const missing = await p.evaluate(() => { const el = document.querySelector('.lab-page-wrap [data-testid="lab-figure-missing"]').closest('[data-testid="lab-figure"]'); return { caption: el.querySelector('.lab-figure-caption')?.textContent, img: !!el.querySelector('img'), height: el.querySelector('.lab-figure-frame')?.getBoundingClientRect().height } });
      check(`${label}: a picture the book lacks stands on its page as a placeholder with its caption`, /does not contain/.test(missing.caption || '') && !missing.img && missing.height > 40, missing);
      await p.screenshot({ path: join(OUT, `own-figures-missing-${name}.png`) });
      // Pictures are kept as bytes (never Blobs), the very large one redrawn for phones.
      const kept = await p.evaluate(async key => {
        const db = await new Promise((resolve, reject) => { const r = indexedDB.open('tinct-addbook', 1); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error) });
        const record = await new Promise(resolve => { const r = db.transaction('books').objectStore('books').get(key); r.onsuccess = () => resolve(r.result) });
        db.close();
        const data = Object.values(record?.figureData || {});
        const figures = (record?.edition?.chapters || []).flatMap(chapter => chapter.figures || []);
        const huge = figures.find(figure => /very large/.test(figure.caption || ''));
        const hugeImage = huge && record.figureData?.[huge.id];
        let hugeSize = null;
        if (hugeImage) { const bitmap = await createImageBitmap(new Blob([hugeImage.data], { type: hugeImage.type })); hugeSize = [bitmap.width, bitmap.height] }
        return { count: data.length, bytes: data.every(item => item.data instanceof ArrayBuffer && typeof item.type === 'string'), blobs: !!record?.figureImages, huge: huge && [huge.width, huge.height, !!huge.large], hugeSize, missing: figures.filter(figure => figure.unavailable).map(figure => figure.caption) };
      }, 'epub:' + hex);
      check(`${label}: pictures are kept on the device as bytes; the 5000×3200 plate is redrawn at most 2400 px wide and stays a strip`,
        kept.count >= 11 && kept.bytes && !kept.blobs && kept.hugeSize && Math.max(...kept.hugeSize) <= 2400 && kept.huge?.[2] === true && kept.missing.some(caption => /does not contain/.test(caption)), kept);

      await p.reload();
      await ready(p);
      judge('after a reload', await figures(p));

      // A book added before this fix: converter 4, its pictures kept as Blobs typed as the
      // manifest said (the SVG as image/jpeg, which draws as a broken image). Opening it
      // again converts it from the EPUB kept on the device: it heals without re-adding.
      await p.evaluate(async key => {
        const db = await new Promise((resolve, reject) => { const r = indexedDB.open('tinct-addbook', 1); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error) });
        await new Promise((resolve, reject) => {
          const tx = db.transaction('books', 'readwrite'), store = tx.objectStore('books'), r = store.get(key);
          r.onsuccess = () => {
            const { figureData, ...record } = r.result;
            const figureImages = Object.fromEntries(Object.entries(figureData).map(([id, image]) => [id, new Blob([image.data], { type: image.type === 'image/svg+xml' ? 'image/jpeg' : image.type })]));
            store.put({ ...record, edition: { ...record.edition, converter: 4 }, figureImages });
          };
          tx.oncomplete = resolve; tx.onerror = () => reject(tx.error);
        });
        db.close();
      }, 'epub:' + hex);
      await p.reload();
      await ready(p);
      judge('a book added before the fix, opened again', await figures(p));
      const healed = await p.evaluate(async key => {
        const db = await new Promise(resolve => { const r = indexedDB.open('tinct-addbook', 1); r.onsuccess = () => resolve(r.result) });
        const record = await new Promise(resolve => { const r = db.transaction('books').objectStore('books').get(key); r.onsuccess = () => resolve(r.result) });
        db.close();
        return { converter: record.edition.converter, legacy: 'figureImages' in record, kept: Object.keys(record.figureData || {}).length };
      }, 'epub:' + hex);
      check(`${label}: an earlier conversion is redone from the kept EPUB, its Blobs replaced by bytes`, healed.converter > 4 && !healed.legacy && healed.kept >= 11, healed);
      await ctx.close();

      ctx = await type.launchPersistentContext(dir, { executablePath: exec, viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
      p = await prepare(ctx);
      await p.goto(new URL('/reader?userBook=' + hex, base).href);
      await ready(p);
      judge('after the browser was closed and opened again', await figures(p));
      // Back and forward through the browser's page cache: the figures draw from fresh URLs.
      await p.goto(base);
      await p.waitForSelector('#doorOwn');
      await p.goBack();
      await ready(p);
      judge('back from another page', await figures(p));
    } catch (error) {
      check(`${label}: first device ran`, false, String(error?.stack || error).slice(0, 600));
    } finally {
      await ctx.close().catch(() => {});
      rmSync(dir, { recursive: true, force: true });
    }

    // ---- Second device: nothing in this browser; the book comes from the account copy ----
    const browser = await type.launch({ executablePath: exec });
    try {
      const two = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
      p = await prepare(two);
      await p.goto(base);
      await signIn(p);
      await p.waitForSelector('#abShelf:not([hidden]) .ab-book[data-cloud-only]', { timeout: 15000 });
      const row = p.locator('.ab-book[data-cloud-only]', { hasText: 'Quiet Experiments' });
      await row.locator('.ab-book-open').click();
      await ready(p);
      check(`${label}, second device: the account copy opens as the same book`, RIGHTS_READER.exec(p.url())?.[1] === hex, p.url());
      judge('second device', await figures(p));
      await two.close();
    } catch (error) {
      check(`${label}: second device ran`, false, String(error?.stack || error).slice(0, 600));
    } finally {
      await browser.close();
    }
    check(`${label}: no page errors or CSP violations`, !problems.length, problems.slice(0, 6));
  }
}

// Standalone: its own stand-in server.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { start } = await import('./serve.mjs');
  const PORT = 4723;
  const server = await start(PORT);
  const results = [];
  const check = (name, ok, detail) => { results.push({ name, ok: !!ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail && !ok ? '  ' + JSON.stringify(detail).slice(0, 600) : ''}`) };
  try {
    await ownFigureChecks({ base: `http://127.0.0.1:${PORT}/lab/addbook/`, check, browsers: (process.env.BROWSERS || 'chromium,webkit').split(',') });
  } finally {
    server.close();
    const failed = results.filter(r => !r.ok).length;
    console.log(`\n${results.length - failed}/${results.length} checks passed`);
    process.exit(failed ? 1 : 0);
  }
}
