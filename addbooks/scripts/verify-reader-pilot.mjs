// Run from app/: node ../addbooks/scripts/verify-reader-pilot.mjs
// Serves the actual production bundle locally. API calls are blocked in QA.
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const { chromium, expect } = createRequire(path.join(root, 'app/package.json'))('@playwright/test');
const dist = path.join(root, 'app/dist');
const out = path.join(root, 'addbooks/qa/reader-pilot');
await mkdir(out, { recursive: true });
const mime = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.woff2':'font/woff2', '.svg':'image/svg+xml', '.png':'image/png', '.webp':'image/webp' };
const server = createServer(async (req, res) => {
  try {
    let name = new URL(req.url, 'http://localhost').pathname;
    if (name === '/reader') name = '/app.html';
    if (name === '/library' || name === '/') name = '/lab/library_2/index.html';
    const file = path.resolve(dist, '.' + decodeURIComponent(name));
    if (!file.startsWith(dist + path.sep)) { res.writeHead(403); res.end(); return; }
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true, args: ['--mute-audio'] });
const results = [];
try {
  for (const [name, viewport] of [['desktop', {width:1365,height:900}], ['phone', {width:390,height:844}]]) {
    const context = await browser.newContext({ viewport, isMobile: name === 'phone', hasTouch: name === 'phone', serviceWorkers: 'block' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await context.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.origin !== origin || url.pathname.startsWith('/api/')) {
        return route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
      }
      await route.continue();
    });
    const ready = async () => {
      await expect(page.getByTestId('lab-header-book')).toHaveText('The Time Machine');
      await expect(page.locator('[data-position-resolving="false"][data-reader-ready="true"]')).toBeVisible({timeout:20000});
      await page.evaluate(() => document.fonts.ready);
      // Allow the reader's existing first-reveal transition to finish.
      await page.waitForTimeout(700);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'horizontal overflow');
    };
    await page.goto(origin + '/reader?add=1');
    await expect(page.getByRole('button', { name:'Add and read' })).toBeVisible();
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path:path.join(out, `${name}-add.png`), fullPage:true });
    // A failed download stays on Add and is retryable, with no reader handoff.
    await page.route('**/data/editions/pd-35-original-en.json*', r => r.fulfill({status:503, body:'Unavailable'}));
    await page.getByRole('button', {name:'Add and read'}).click();
    await expect(page.getByRole('alert')).toContainText('could not be opened');
    assert.equal(await page.evaluate(() => sessionStorage.getItem('tinct:lab-reader-handoff')), null);
    await page.screenshot({ path:path.join(out, `${name}-retry.png`), fullPage:true });
    await page.unroute('**/data/editions/pd-35-original-en.json*');
    await page.getByRole('button', {name:'Try again'}).click();
    await page.waitForURL(origin + '/reader');
    await ready();
    await expect(page.getByTestId('lab-header-chapter')).toContainText('I. Introduction');
    await expect(page.locator('body')).toContainText('The Time Traveller');
    await page.screenshot({ path:path.join(out, `${name}-reader.png`), fullPage:true });
    await page.getByTestId('lab-header-chapter').click();
    await expect(page.getByTestId('lab-toc')).toBeVisible();
    await expect(page.locator('[data-testid^="lab-tree-chapter-"]')).toHaveCount(17);
    await page.screenshot({ path:path.join(out, `${name}-contents.png`), fullPage:true });
    await page.getByTestId('lab-tree-chapter-2').click();
    await ready();
    await expect(page.getByTestId('lab-header-chapter')).toContainText('II. The Machine');
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(1000);
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('tinct-lab-position')));
    assert.equal(saved.books['pd-35'].sequentialChapter, 2);
    assert.equal(saved.books['pd-35'].bookId, 'pd-35');
    await page.reload();
    await ready();
    await expect(page.getByTestId('lab-header-chapter')).toContainText('II. The Machine');
    const restored = await page.evaluate(() => JSON.parse(localStorage.getItem('tinct-lab-position')).books['pd-35']);
    assert.equal(restored.sequentialChapter, 2);
    assert.equal(restored.paragraphIndex, saved.books['pd-35'].paragraphIndex);
    await page.screenshot({ path:path.join(out, `${name}-resumed.png`), fullPage:true });
    // Add a second time resumes this book, rather than restarting or duplicating it.
    await page.goto(origin + '/reader?add=1');
    await page.getByRole('button', {name:'Add and read'}).click();
    await page.waitForURL(origin + '/reader');
    await ready();
    await expect(page.getByTestId('lab-header-chapter')).toContainText('II. The Machine');
    await page.getByTestId('lab-header-chapter').click();
    await page.getByTestId('lab-tree-chapter-17').click();
    await ready();
    await expect(page.getByTestId('lab-header-chapter')).toContainText('Epilogue');
    await page.screenshot({ path:path.join(out, `${name}-epilogue.png`), fullPage:true });
    assert.deepEqual(errors, []);
    results.push({ viewport:name, add:true, retry:true, chapters:17, navigation:true, resume:true, repeatAdd:true, epilogue:true, horizontalOverflow:false, pageErrors:errors });
    await context.close();
  }
  await writeFile(path.join(out,'report.json'), JSON.stringify({ testedAt:new Date().toISOString(), target:'local production build', externalAPIs:'blocked', results }, null, 2)+'\n');
  console.log(JSON.stringify(results, null, 2));
} finally { await browser.close(); server.close(); }
