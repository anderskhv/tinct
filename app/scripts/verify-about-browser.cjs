const { chromium } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const origin = process.argv[2] || 'http://127.0.0.1:8793';
const out = process.argv[3] || '/tmp/tinct-about-qa';
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const report = [];
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
    await page.goto(origin + '/mission');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(out, `${viewport.width}-opening.png`) });
    for (const [id, progress, name] of [
      ['chapter-infinite', .55, 'slop'], ['chapter-books', .75, 'books'],
      ['chapter-difficult', .65, 'questions'], ['chapter-introducing', .15, 'voice'],
      ['chapter-introducing', .29, 'edition'], ['chapter-introducing', .55, 'recap'],
      ['chapter-introducing', .80, 'audio'], ['chapter-introducing', .88, 'couch'],
      ['chapter-invitation', .55, 'ending']
    ]) {
      await page.evaluate(({ id, progress }) => {
        const e = document.getElementById(id);
        window.scrollTo(0, e.offsetTop + e.offsetHeight * progress);
      }, { id, progress });
      await page.waitForTimeout(650);
      if (['books', 'audio', 'ending'].includes(name)) await page.screenshot({ path: path.join(out, `${viewport.width}-${name}.png`) });
    }
    const state = await page.evaluate(() => ({
      horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
      brokenImages: [...document.images].filter(i => i.complete && !i.naturalWidth).map(i => i.src),
      title: document.title,
    }));
    report.push({ viewport, ...state, errors: [...new Set(errors)] });
    await page.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  if (report.some(r => r.errors.length || r.horizontalOverflow || r.brokenImages.length)) process.exitCode = 1;
})();
