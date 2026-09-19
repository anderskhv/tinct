import { chromium, webkit } from 'playwright';
import { createServer } from 'http';
import { readFileSync, existsSync, statSync } from 'fs';
import { join, extname } from 'path';
const S = process.env.S; const root = process.cwd() + '/dist';
const types = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp'};
const srv = createServer((req,res)=>{
  let p = decodeURIComponent(req.url.split('?')[0]); let f = join(root,p);
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f,'index.html');
  if (!existsSync(f) && p.startsWith('/lab/') && !extname(p)) f = join(root,'lab/index.html');
  if (!existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200,{'content-type':types[extname(f)]||'application/octet-stream'}); res.end(readFileSync(f));
}).listen(Number(process.env.PORT || 4180));
const engineName = process.env.ENGINE || 'chromium';
const engine = engineName === 'webkit' ? webkit : chromium;
const b = await engine.launch(engineName === 'chromium' ? {executablePath: process.env.PW_EXE} : {});
const failures = [];
const check = (cond, msg) => { if (!cond) failures.push(msg); console.log((cond?'  ok   ':'  FAIL ')+msg); };
const NOW = Date.now();
const place = (bookId, sequentialChapter, chapterNumber, paragraphIndex, editionKey, ago) => ({ bookId, headerBook: bookId, sequentialChapter, chapterNumber, paragraphIndex, wordIndex: 0, pageIndex: 0, primaryEditionKey: editionKey, readerMode: 'read', deviceId: 'device-a', rev: 1, updatedAt: NOW - ago });
const positions = { books: { 'moby-dick': place('moby-dick', 3, 3, 5, 'original-en', 3*3600e3), 'odyssey': place('odyssey', 3, 3, 4, 'original-en', 2*86400e3) }, finished: {}, hidden: {}, lastSettledBookId: 'moby-dick', lastSettledAt: NOW - 3*3600e3, updatedAt: NOW - 3*3600e3, deviceId: 'device-a' };

for (const [name, vp] of [['phone', {width:390,height:844}], ['narrow', {width:320,height:700}], ['desktop', {width:1280,height:800}]]) {
  console.log(`\n=== ${engineName} ${name} ${vp.width}x${vp.height}`);
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 2, isMobile: name !== 'desktop', hasTouch: name !== 'desktop' });
  let pg = await ctx.newPage();
  // ---------- Featured shelf ----------
  await pg.goto(`http://localhost:${process.env.PORT || 4180}/lab/`, { waitUntil: 'networkidle' }); await pg.waitForTimeout(1500);
  const pick = pg.getByText('Pick your book').first();
  if (await pick.count()) { await pick.click(); await pg.waitForTimeout(1500); }
  await pg.waitForSelector('[data-popular-blurb]');
  const shelfCount = await pg.evaluate(() => document.querySelectorAll('[data-shelf-index]').length);
  const rows = [];
  for (let i = 0; i < shelfCount; i++) {
    await pg.evaluate((i) => { const btn = document.querySelector(`[data-shelf-index="${i}"]`); btn && btn.click(); }, i);
    await pg.waitForTimeout(250);
    const m = await pg.evaluate(() => {
      const r = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { top: Math.round(b.top*10)/10, h: Math.round(b.height*10)/10 }; };
      const blurb = document.querySelector('[data-popular-blurb]'); const more = document.querySelector('[data-blurb-more]');
      const cs = getComputedStyle(blurb);
      return { title: document.querySelector('[data-popular-title]').textContent, titleH: r('[data-popular-title]').h, blurbH: r('[data-popular-blurb]').h, clamp: cs.webkitLineClamp, overflow: cs.overflow, lines: Math.round(blurb.clientHeight / parseFloat(cs.lineHeight)), scrollH: blurb.scrollHeight, moreText: more.textContent, moreDisabled: more.disabled, moreH: r('[data-blurb-more]').h, captionH: r('[data-popular-caption]').h, browseTop: r('.lib-browse-label')?.top, houseTop: r('.lib-catalogue-house')?.top, descLen: blurb.textContent.length };
    });
    rows.push(m);
  }
  const uniq = k => [...new Set(rows.map(r => r[k]))];
  console.log('  books', rows.length, 'blurbH', uniq('blurbH'), 'lines', uniq('lines'), 'clamp', uniq('clamp'), 'moreH', uniq('moreH'), 'captionH', uniq('captionH'), 'browseTop', uniq('browseTop'), 'houseTop', uniq('houseTop'), 'titleH', uniq('titleH'));
  console.log('  expandable:', rows.filter(r => r.moreText === 'Expand').map(r => r.title).length, 'of', rows.length, '| clamped-but-no-control:', rows.filter(r => r.scrollH > r.blurbH + 1 && r.moreText !== 'Expand').length);
  check(uniq('blurbH').length === 1, 'blurb height identical for every featured book');
  check(uniq('lines')[0] === 5 && uniq('lines').length === 1, 'blurb shows exactly 5 lines');
  check(uniq('clamp')[0] === '5', 'computed line-clamp is 5');
  check(uniq('captionH').length === 1, 'caption height identical for every featured book');
  check(uniq('browseTop').length === 1 && uniq('houseTop').length === 1, 'Browse the library / first shelf never move between books');
  const rowMism = rows.filter(r => (r.scrollH > r.blurbH + 1) !== (r.moreText === 'Expand')); if (rowMism.length) console.log('  row mismatches:', JSON.stringify(rowMism.map(r => ({ t: r.title, scrollH: r.scrollH, blurbH: r.blurbH, more: r.moreText }))));
  check(rowMism.length === 0, 'Expand shown exactly when the description is cut');
  check(rows.every(r => r.moreH === rows[0].moreH), 'affordance row keeps its height with and without a word');
  // every catalogue title through the one-line title: same box height for all, fitted by font size
  const titles = await pg.evaluate(async () => {
    const cat = await (await fetch('/lab/catalogue.json')).json();
    const h1 = document.querySelector('[data-popular-title]'); const keep = h1.textContent; const out = [];
    for (const book of cat.books) { h1.textContent = ''; const span = document.createElement('span'); span.className = 'lib-h1-fit'; span.setAttribute('data-popular-title-text', ''); span.textContent = book.title; h1.appendChild(span); await new Promise(r => requestAnimationFrame(r)); window.dispatchEvent(new Event('resize')); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r)))); out.push({ t: book.title, boxH: Math.round(h1.getBoundingClientRect().height * 10) / 10, size: h1.querySelector('[data-popular-title-text]').style.fontSize || 'base', cut: h1.scrollWidth > h1.clientWidth + 0.5 }); }
    h1.textContent = ''; const keepSpan = document.createElement('span'); keepSpan.className = 'lib-h1-fit'; keepSpan.setAttribute('data-popular-title-text', ''); keepSpan.textContent = keep; h1.appendChild(keepSpan); window.dispatchEvent(new Event('resize')); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); return out;
  });
  console.log('  titles:', titles.length, 'boxH', [...new Set(titles.map(t=>t.boxH))], 'stepped down:', titles.filter(t=>t.size!=='base').map(t=>`${t.t} (${t.size})`).join('; ') || 'none', '| cut:', titles.filter(t=>t.cut).map(t=>t.t));
  check(new Set(titles.map(t=>t.boxH)).size === 1, 'title box is one height for all titles');
  check(titles.every(t => !t.cut), 'no title is cut at this width');
  // every catalogue description through the fixed block
  const descs = await pg.evaluate(async () => {
    const cat = await (await fetch('/lab/catalogue.json')).json();
    const bl = document.querySelector('[data-popular-blurb]'); const keep = bl.textContent; const out = [];
    for (const book of cat.books) { bl.textContent = book.summary || book.blurb || ''; await new Promise(r => requestAnimationFrame(r)); window.dispatchEvent(new Event('resize')); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r)))); out.push({ id: book.id, h: bl.getBoundingClientRect().height, cut: bl.scrollHeight > bl.clientHeight + 1, more: document.querySelector('[data-blurb-more]').textContent, browse: document.querySelector('.lib-browse-label')?.getBoundingClientRect().top }); }
    bl.textContent = keep; window.dispatchEvent(new Event('resize')); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); return out;
  });
  console.log('  descriptions:', descs.length, 'cut at this width:', descs.filter(d=>d.cut).length, 'heights', [...new Set(descs.map(d=>d.h))], 'browseTop', [...new Set(descs.map(d=>d.browse))]);
  check(new Set(descs.map(d=>d.h)).size === 1 && new Set(descs.map(d=>d.browse)).size === 1, 'all 101 descriptions: block height and Browse position identical');
  const mism = descs.filter(d => d.cut !== (d.more === 'Expand')); if (mism.length) console.log('  mismatches:', JSON.stringify(mism.slice(0,5)));
  check(mism.length === 0, 'all 101 descriptions: Expand exactly when cut');
  // shortest and longest description screenshots + expand toggle
  const sorted = [...rows.keys()].sort((a, b) => rows[a].descLen - rows[b].descLen);
  for (const [tag, idx] of [['short', sorted[0]], ['long', sorted[sorted.length - 1]]]) {
    await pg.evaluate((i) => document.querySelector(`[data-shelf-index="${i}"]`).click(), idx); await pg.waitForTimeout(400);
    await pg.evaluate(() => document.querySelector('[data-popular-caption]').scrollIntoView({ block: 'center' })); await pg.waitForTimeout(200);
    await pg.screenshot({ path: `${S}/shots/${engineName}-${name}-featured-${tag}.png` });
    console.log(`  ${tag}: "${rows[idx].title}" descLen=${rows[idx].descLen} more="${rows[idx].moreText}"`);
  }
  // Expand on the longest
  const before = await pg.evaluate(() => ({ h: document.querySelector('[data-popular-blurb]').getBoundingClientRect().height, browse: document.querySelector('.lib-browse-label')?.getBoundingClientRect().top }));
  let longIdx = sorted[sorted.length-1];
  if (rows[longIdx].moreText !== 'Expand') {
    // None of the six featured books is cut at this width: stand the longest catalogue description in for the toggle test.
    await pg.evaluate(async () => { const cat = await (await fetch('/lab/catalogue.json')).json(); const longest = cat.books.map(b => b.summary || b.blurb || '').sort((a, b) => b.length - a.length)[0]; document.querySelector('[data-popular-blurb]').textContent = longest; window.dispatchEvent(new Event('resize')); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); });
    rows[longIdx].moreText = await pg.evaluate(() => document.querySelector('[data-blurb-more]').textContent);
    console.log('  injected longest description; control now:', rows[longIdx].moreText);
  }
  if (rows[longIdx].moreText === 'Expand') {
    await pg.click('[data-blurb-more]'); await pg.waitForTimeout(300);
    const open = await pg.evaluate(() => { const m = document.querySelector('[data-blurb-more]'); const bl = document.querySelector('[data-popular-blurb]'); return { h: bl.getBoundingClientRect().height, text: m.textContent, expanded: m.getAttribute('aria-expanded'), open: bl.classList.contains('is-open'), scrollH: bl.scrollHeight, clientH: bl.clientHeight }; });
    check(open.text === 'Collapse' && open.expanded === 'true' && open.h > before.h && open.scrollH <= open.clientH + 1, `Expand opens the full description (${before.h} -> ${open.h}px)`);
    await pg.screenshot({ path: `${S}/shots/${engineName}-${name}-featured-expanded.png` });
    await pg.click('[data-blurb-more]'); await pg.waitForTimeout(300);
    const closed = await pg.evaluate(() => ({ h: document.querySelector('[data-popular-blurb]').getBoundingClientRect().height, text: document.querySelector('[data-blurb-more]').textContent, browse: document.querySelector('.lib-browse-label')?.getBoundingClientRect().top }));
    check(closed.text === 'Expand' && Math.abs(closed.h - before.h) < 0.5, 'Collapse restores the five-line block');
    // switching book while open collapses again
    await pg.click('[data-blurb-more]'); await pg.waitForTimeout(200);
    await pg.evaluate((i) => document.querySelector(`[data-shelf-index="${i}"]`).click(), sorted[0]); await pg.waitForTimeout(400);
    const after = await pg.evaluate(() => ({ h: document.querySelector('[data-popular-blurb]').getBoundingClientRect().height, open: document.querySelector('[data-popular-blurb]').classList.contains('is-open') }));
    check(!after.open && Math.abs(after.h - before.h) < 0.5, 'switching book resets an expanded description');
  }
  await pg.close();

  // ---------- Reading-now recap card ----------
  const measureRecap = async (pg) => pg.evaluate(() => {
    const sec = document.querySelector('[data-reading-memory-recap]'); if (!sec || sec.hidden) return null;
    const r = s => { const e = sec.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { top: Math.round(b.top*10)/10, h: Math.round(b.height*10)/10 }; };
    const block = sec.querySelector('.lib-recap-summary'); const text = block?.querySelector('.lib-recap-summary-text');
    return { boot: sec.getAttribute('data-boot-recap'), book: sec.dataset.book, kind: block?.dataset.summaryKind, line: sec.dataset.summaryLine, text: text?.textContent, more: block?.querySelector('.lib-recap-summary-more')?.textContent, blockH: r('.lib-recap-summary')?.h, textH: r('.lib-recap-summary-text')?.h, captionH: r('[data-now-caption]')?.h, sectionH: sec.getBoundingClientRect().height, key: block?.getAttribute('data-recap-summary-key'), nextTop: (sec.nextElementSibling && sec.nextElementSibling.getBoundingClientRect().top) || (document.querySelector('[data-finished-section]')?.getBoundingClientRect().top), headline: sec.querySelector('[data-testid=lab-recap-headline]')?.textContent, titleText: sec.querySelector('[data-testid=lab-recap-book]')?.textContent };
  });
  pg = await ctx.newPage();
  await pg.goto(`http://localhost:${process.env.PORT || 4180}/lab/`, { waitUntil: 'domcontentloaded' });
  await pg.evaluate((positions) => { localStorage.clear(); localStorage.setItem('tinct-lab-position', JSON.stringify(positions)); }, positions);
  await pg.goto(`http://localhost:${process.env.PORT || 4180}/lab/library`, { waitUntil: 'networkidle' }); await pg.waitForTimeout(2500);
  let noRecap = await measureRecap(pg);
  console.log('  no-recap:', JSON.stringify(noRecap));
  check(noRecap && noRecap.kind === 'fallback' && noRecap.text && noRecap.text.length > 0, `fallback aside shown: "${noRecap?.text}"`);
  check(noRecap && noRecap.more === '', 'fallback is not a control');
  if (noRecap) { await pg.evaluate(() => document.querySelector('[data-reading-memory-recap]').scrollIntoView({ block: 'start' })); await pg.waitForTimeout(200); await pg.screenshot({ path: `${S}/shots/${engineName}-${name}-recap-none.png` }); }
  // Switch focused book in the row (odyssey) — card must not change height
  const switched = await pg.evaluate(async () => { const b = document.querySelector('[data-now-book="odyssey"] [data-recap-open]'); if (!b) return false; b.click(); await new Promise(r => setTimeout(r, 900)); return true; });
  const other = await measureRecap(pg);
  console.log('  switched:', switched, JSON.stringify(other));
  if (switched) check(other && other.captionH === noRecap.captionH && other.sectionH === noRecap.sectionH, 'switching the focused book keeps the card height');
  // seed a cached recap for the hero's key and reload
  const key = noRecap?.key;
  if (key) {
    const long = 'Ishmael, restless and broke, has left Manhattan for New Bedford meaning to go whaling. He spends a cold night at the Spouter-Inn, where the landlord puts him in a bed with a harpooneer who has not yet come home; the stranger turns out to be Queequeg, a tattooed islander whose arrival terrifies him before the two settle into an unlikely friendship.';
    await pg.evaluate(([k, s]) => { localStorage.setItem('tinct:lab-recap-summaries', JSON.stringify({ v: 1, entries: { [k]: { summary: s, at: Date.now() - 86400e3 } } })); }, [key, long]);
    await pg.goto(`http://localhost:${process.env.PORT || 4180}/lab/library`, { waitUntil: 'networkidle' }); await pg.waitForTimeout(2500);
    const withRecap = await measureRecap(pg);
    console.log('  recap:', JSON.stringify(withRecap));
    check(withRecap && withRecap.kind === 'summary' && withRecap.text.startsWith('Ishmael'), 'cached recap replaces the aside');
    check(withRecap && withRecap.blockH === noRecap.blockH && withRecap.captionH === noRecap.captionH && withRecap.sectionH === noRecap.sectionH, `card geometry identical with and without recap (block ${noRecap.blockH} vs ${withRecap?.blockH}, caption ${noRecap.captionH} vs ${withRecap?.captionH})`);
    check(withRecap && withRecap.more === 'Expand', 'long recap gets an Expand control');
    await pg.evaluate(() => document.querySelector('[data-reading-memory-recap]').scrollIntoView({ block: 'start' })); await pg.waitForTimeout(200);
    await pg.screenshot({ path: `${S}/shots/${engineName}-${name}-recap-summary.png` });
    await pg.click('[data-reading-memory-recap] .lib-recap-summary'); await pg.waitForTimeout(500);
    const opened = await measureRecap(pg);
    check(opened.more === 'Collapse' && opened.textH > withRecap.textH, `recap Expand opens (${withRecap.textH} -> ${opened.textH}px)`);
    await pg.screenshot({ path: `${S}/shots/${engineName}-${name}-recap-expanded.png` });
  }
  await pg.close(); await ctx.close();
}
await b.close(); srv.close();
console.log(`\n${failures.length ? 'FAILURES:\n  ' + failures.join('\n  ') : 'ALL CHECKS PASSED'}`);
process.exit(failures.length ? 1 : 0);
