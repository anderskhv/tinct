// Checks the built freeepubs.fyi site in headless Chromium, served the way Cloudflare Pages
// serves it: the CSP from _headers, folder index pages and 404.html.
//   node addbooks/web/test/freeepubs.mjs     (needs: node addbooks/web/scripts/build-freeepubs.mjs)
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const REPO = join(HERE, '../../..');
const SITE = join(REPO, 'addbooks/web/dist/freeepubs');
const require = createRequire(join(REPO, 'app/package.json'));
const { chromium } = require('@playwright/test');
const OUT = join(HERE, 'output'); mkdirSync(OUT, { recursive: true });
const EXEC = existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined;
const PORT = 4722, BASE = `http://127.0.0.1:${PORT}`;
if (!existsSync(join(SITE, 'index.html'))) { console.error('Build first: node addbooks/web/scripts/build-freeepubs.mjs'); process.exit(1) }

const CSP = /Content-Security-Policy: (.*)/.exec(readFileSync(join(SITE, '_headers'), 'utf8'))[1];
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain', '.gz': 'application/octet-stream', '.json': 'application/json' };
const server = createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, BASE).pathname);
  let file = join(SITE, normalize(path));
  if (existsSync(file) && statSync(file).isDirectory()) {
    if (!path.endsWith('/')) { res.writeHead(308, { Location: path + '/' }); res.end(); return }
    file = join(file, 'index.html');
  }
  const found = file.startsWith(SITE) && existsSync(file) && statSync(file).isFile();
  res.writeHead(found ? 200 : 404, { 'Content-Type': TYPES[found ? extname(file) : '.html'] || 'application/octet-stream', 'Content-Security-Policy': CSP, 'X-Content-Type-Options': 'nosniff' });
  res.end(readFileSync(found ? file : join(SITE, '404.html')));
});
await new Promise(r => server.listen(PORT, '127.0.0.1', r));

const results = [];
const check = (name, ok, detail) => { results.push({ name, ok: !!ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail !== undefined ? '  ' + JSON.stringify(detail).slice(0, 240) : ''}`) };
const browser = await chromium.launch({ executablePath: EXEC });
async function page(viewport) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const p = await ctx.newPage(), problems = [];
  p.on('pageerror', e => problems.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) problems.push('console: ' + m.text()) });
  p.on('response', r => { if (r.status() >= 400 && !r.url().includes('/no-such-page')) problems.push(`http ${r.status()}: ${r.url()}`) });
  await p.addInitScript(() => document.addEventListener('securitypolicyviolation', e => console.error('CSP violation: ' + e.violatedDirective + ' ' + e.blockedURI)));
  return { ctx, p, problems };
}
const noSideways = p => p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);

try {
  const { ctx, p, problems } = await page({ width: 1280, height: 900 });
  await p.goto(BASE + '/');
  check('home: title and search', /Free EPUB books/.test(await p.title()) && await p.isVisible('#q'));
  check('home: lists popular books', await p.locator('.grid .card').count() >= 24);
  await p.screenshot({ path: join(OUT, 'freeepubs-home.png') });

  // A book page: real HTML content, canonical URL, valid JSON-LD.
  await p.goto(BASE + '/books/the-time-machine-pg35/');
  const book = await p.evaluate(() => ({
    h1: document.querySelector('h1')?.textContent, canonical: document.querySelector('link[rel=canonical]')?.href,
    ld: [...document.querySelectorAll('script[type="application/ld+json"]')].map(s => JSON.parse(s.textContent)),
    epub: document.querySelector('.get .go')?.href, tinct: document.querySelector('.tinct a')?.href, author: document.querySelector('.by a')?.getAttribute('href'),
  }));
  check('book page: heading and canonical', book.h1 === 'The Time Machine' && book.canonical === 'https://freeepubs.fyi/books/the-time-machine-pg35/', book);
  check('book page: schema.org Book', book.ld.some(o => o['@type'] === 'Book' && o.name === 'The Time Machine' && o.author?.[0]?.name === 'H. G. Wells'), book.ld[0]?.author);
  check('book page: EPUB from the library, Tinct link with the work id', /gutenberg\.org\/ebooks\/35\.epub/.test(book.epub) && /\/lab\/addbook\/\?work=pg%3A35/.test(book.tinct), { epub: book.epub, tinct: book.tinct });
  await p.screenshot({ path: join(OUT, 'freeepubs-book.png'), fullPage: true });
  await p.goto(BASE + book.author);
  check('author page lists the author’s books', /Wells/.test(await p.textContent('h1')) && await p.locator('.grid .card').count() >= 5, book.author);

  // Search from the header form.
  await p.goto(BASE + '/topics/');
  await p.fill('#q-top', 'time machine wells'); await p.press('#q-top', 'Enter');
  await p.waitForSelector('#results .card', { timeout: 30000 });
  const first = await p.evaluate(() => ({ title: document.querySelector('#results .t')?.textContent, href: document.querySelector('#results .t')?.getAttribute('href'), status: document.getElementById('status').textContent }));
  check('search finds the book and links to its page', first.title === 'The Time Machine' && first.href === '/books/the-time-machine-pg35/', first);
  await p.fill('#q', 'dostoevsky'); await p.waitForFunction(() => /dostoevsky/i.test(document.getElementById('status').textContent), null, { timeout: 8000 });
  check('search as you type', await p.locator('#results .card').count() > 0, await p.textContent('#status'));
  await p.screenshot({ path: join(OUT, 'freeepubs-search.png') });

  const r404 = await p.goto(BASE + '/no-such-page/');
  check('unknown paths get the 404 page', r404.status() === 404 && /not found/i.test(await p.textContent('h1')));
  const robots = await (await fetch(BASE + '/robots.txt')).text(), sitemap = await (await fetch(BASE + '/sitemap.xml')).text();
  check('robots.txt points to the sitemap', /Sitemap: https:\/\/freeepubs\.fyi\/sitemap\.xml/.test(robots));
  const firstMap = await (await fetch(BASE + '/sitemap-1.xml')).text();
  check('sitemap lists book pages', /sitemapindex/.test(sitemap) && firstMap.includes('https://freeepubs.fyi/books/the-time-machine-pg35/'));
  check('desktop: no errors or CSP violations', !problems.length, problems);
  await ctx.close();

  const ph = await page({ width: 390, height: 844 });
  for (const path of ['/', '/books/the-time-machine-pg35/', '/topics/novels/']) { await ph.p.goto(BASE + path); check(`phone ${path}: no sideways scroll`, await noSideways(ph.p)) }
  await ph.p.goto(BASE + '/books/the-time-machine-pg35/'); await ph.p.screenshot({ path: join(OUT, 'freeepubs-book-phone.png'), fullPage: true });
  check('phone: no errors or CSP violations', !ph.problems.length, ph.problems);
} catch (e) {
  check('run completed', false, String(e?.stack || e));
} finally {
  await browser.close(); server.close();
}
const failed = results.filter(r => !r.ok).length;
writeFileSync(join(OUT, 'freeepubs-report.json'), JSON.stringify(results, null, 2));
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
