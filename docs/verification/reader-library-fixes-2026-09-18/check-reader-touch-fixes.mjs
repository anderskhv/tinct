import { chromium, webkit } from 'playwright';
import { createServer } from 'http';
import { readFileSync, existsSync, statSync } from 'fs';
import { join, extname } from 'path';
const S = process.env.S; const root = process.cwd() + '/dist'; const PORT = Number(process.env.PORT || 4190);
const types = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp'};
const srv = createServer((req,res)=>{
  let p = decodeURIComponent(req.url.split('?')[0]); let f = join(root,p);
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f,'index.html');
  if (!existsSync(f) && (p.startsWith('/read') || p === '/reader')) f = join(root,'app.html');
  if (!existsSync(f) && p.startsWith('/api/')) { res.writeHead(503, {'content-type':'application/json'}); return res.end('{"error":"offline test"}'); }
  if (!existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200,{'content-type':types[extname(f)]||'application/octet-stream'}); res.end(readFileSync(f));
}).listen(PORT);
const engineName = process.env.ENGINE || 'chromium';
const engine = engineName === 'webkit' ? webkit : chromium;
const b = await engine.launch(engineName === 'chromium' ? {executablePath: process.env.PW_EXE, args:['--mute-audio']} : {});
const failures = []; const results = [];
const check = (item, cond, msg) => { if (!cond) failures.push(`[${item}] ${msg}`); results.push({item, ok: !!cond, msg}); console.log((cond?'  ok   ':'  FAIL ')+`[${item}] `+msg); };
const wait = (ms) => new Promise(r => setTimeout(r, ms));

// Synthetic touch pointer events through the DOM at a page point. This is
// the handler logic under the engine's own layout, NOT the iOS gesture stack.
const pointer = (pg, type, x, y) => pg.evaluate(([type, x, y]) => {
  const el = document.elementFromPoint(x, y); if (!el) return null;
  const ev = new PointerEvent(type, { bubbles: true, cancelable: true, composed: true, pointerType: 'touch', pointerId: 1, isPrimary: true, clientX: x, clientY: y, button: type === 'pointermove' ? -1 : 0, buttons: type === 'pointerup' ? 0 : 1 });
  el.dispatchEvent(ev);
  return { tag: el.tagName, cls: el.className, word: el.closest('[data-testid="lab-word"]')?.getAttribute('data-word-index') ?? null };
}, [type, x, y]);
const selecting = (pg) => pg.evaluate(() => [...document.querySelectorAll('[data-testid="lab-word"].is-selecting')].map(w => ({ p: +w.dataset.paragraphIndex, w: +w.dataset.wordIndex, line: [...document.querySelectorAll('.lab-hearing-line')].indexOf(w.closest('.lab-hearing-line')), text: w.textContent.replace(/ /g, ' ') })));
const dismiss = async (pg) => { await pg.keyboard.press('Escape'); await wait(200); if (await pg.locator('.selection-popup').count()) { await pg.mouse.click(5, 300); await wait(200); } };

const ctx = await b.newContext({ viewport: {width:390, height:844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const pg = await ctx.newPage();
const pageErrors = []; pg.on('pageerror', e => pageErrors.push(String(e)));
await pg.goto(`http://localhost:${PORT}/reader`, { waitUntil: 'networkidle' });
await pg.waitForSelector('[data-testid="lab-word"]'); await wait(2500);
await pg.evaluate(() => { for (const a of document.querySelectorAll('audio,video')) { a.muted = true; a.volume = 0; } });
console.log(`\n=== ${engineName} 390x844 reader`, await pg.evaluate(() => ({ words: document.querySelectorAll('[data-testid="lab-word"]').length, verse: document.querySelectorAll('.lab-verse-unit').length, title: document.querySelector('[data-testid="lab-passage-headline"]')?.textContent })));
await pg.screenshot({ path: `${S}/shots/${engineName}-reader-page.png` });

// ---- Item 2: verse marker separator / baseline, and a highlight painted from the word after the marker ----
{
  const v = await pg.evaluate(() => {
    const unit = document.querySelector('.lab-verse-unit'); const cs = getComputedStyle(unit);
    const [marker, next] = unit.children; const m = marker.getBoundingClientRect(); const n = next.getBoundingClientRect();
    const range = document.createRange(); range.selectNodeContents(next); const rr = range.getClientRects()[0];
    return { align: cs.verticalAlign, pad: cs.paddingTop, display: cs.display, markerText: marker.textContent, nextText: next.textContent, nextStartsWithNbsp: next.textContent.startsWith(' '), gap: Math.round((rr.left - m.right) * 100) / 100, markerTop: m.top, nextTop: n.top, nextWordIndex: next.dataset.wordIndex, nextParagraph: next.dataset.paragraphIndex, nx: n.left + n.width * 0.7, ny: n.top + n.height / 2 };
  });
  console.log('  verse:', JSON.stringify(v));
  check(2, v.align === 'baseline' && v.pad === '0px', `verse unit sits on the baseline with no padding (${v.align}, ${v.pad})`);
  check(2, v.nextStartsWithNbsp, 'separator after the verse marker belongs to the following word\'s span');
  check(2, v.gap <= 0.5, `following word's box starts where the marker ends (gap ${v.gap}px)`);
  // Long-press the word after the marker, apply a highlight, and confirm the painted span reaches the marker.
  await pointer(pg, 'pointerdown', v.nx, v.ny); await wait(450);
  let sel = await selecting(pg);
  if (!sel.length) { await pointer(pg, 'pointercancel', v.nx, v.ny); await wait(200); await pointer(pg, 'pointerdown', v.nx, v.ny); await wait(600); sel = await selecting(pg); console.log('  (retried long-press)'); }
  check(2, sel.length === 1 && String(sel[0].w) === v.nextWordIndex, `long-press on the word after the marker starts selection there (${JSON.stringify(sel)})`);
  await pointer(pg, 'pointerup', v.nx, v.ny); await wait(400);
  const popup = pg.locator('.selection-popup');
  check(2, await popup.count() === 1, 'selection popup opens on release');
  console.log('  popup buttons:', JSON.stringify(await popup.locator('button').evaluateAll(bs => bs.map(b => b.getAttribute('aria-label') || b.textContent.trim()))));
  if (!(await popup.getByRole('button', { name: 'Highlight', exact: true }).count())) { const more = popup.getByRole('button', { name: 'More actions' }); if (await more.count()) { await more.first().click(); await wait(250); } }
  console.log('  popup buttons now:', JSON.stringify(await popup.locator('button').evaluateAll(bs => bs.map(b => b.getAttribute('aria-label') || b.textContent.trim()))));
  await popup.getByRole('button', { name: 'Highlight', exact: true }).click({ timeout: 5000 }); await wait(250);
  // ---- Item 3: picking a colour applies and dismisses ----
  check(3, await popup.locator('.popup-color-dot').count() >= 3, 'Highlight opens the colour palette');
  await popup.locator('.popup-color-dot').nth(1).click(); await wait(400);
  check(3, await pg.locator('.selection-popup').count() === 0, 'picking a colour closes the popup');
  const painted = await pg.evaluate(([p, w]) => {
    const word = document.querySelector(`[data-testid="lab-word"][data-paragraph-index="${p}"][data-word-index="${w}"]`);
    const unit = word.closest('.lab-verse-unit'); const marker = unit.children[0];
    const cs = getComputedStyle(word); const wr = word.getBoundingClientRect(); const mr = marker.getBoundingClientRect();
    return { cls: word.className, bg: cs.backgroundColor, left: wr.left, markerRight: mr.right, gap: Math.round((wr.left - mr.right) * 100) / 100, dTop: Math.round((wr.top - mr.top) * 100) / 100, dBottom: Math.round((wr.bottom - mr.bottom) * 100) / 100 };
  }, [v.nextParagraph, v.nextWordIndex]);
  console.log('  painted:', JSON.stringify(painted));
  check(3, /is-hl-/.test(painted.cls), `the word carries the highlight class (${painted.cls})`);
  check(2, painted.gap <= 0.5, `highlight paint starts flush against the verse marker, no notch (gap ${painted.gap}px)`);
  check(2, Math.abs(painted.dTop) < 1.5 && Math.abs(painted.dBottom) < 1.5, `highlighted word sits level with the marker (top ${painted.dTop}px, bottom ${painted.dBottom}px)`);
  await pg.screenshot({ path: `${S}/shots/${engineName}-reader-verse-highlight.png` });
  // remove that highlight to leave the page clean: long-press the word again → Remove highlight
  await pointer(pg, 'pointerdown', v.nx, v.ny); await wait(260); await pointer(pg, 'pointerup', v.nx, v.ny); await wait(400);
  const remove = pg.locator('.selection-popup').getByRole('button', { name: /Remove highlight|Delete highlight/ });
  if (await remove.count()) { await remove.first().click(); await wait(300); }
  await dismiss(pg);
}

// ---- Item 8: a touch on the line but off a short word's own box still starts a selection ----
{
  const t = await pg.evaluate(() => {
    const words = [...document.querySelectorAll('[data-testid="lab-word"]')];
    const nearest = (line, x, y) => { let best = Infinity, hit = null; for (const w of line.querySelectorAll('[data-testid="lab-word"]')) { const b = w.getBoundingClientRect(); if (!b.width) continue; const dx = Math.max(b.left - x, 0, x - b.right), dy = Math.max(b.top - y, 0, y - b.bottom); const d = dy * dy * 10000 + dx * dx; if (d < best) { best = d; hit = w; } } return hit; };
    for (const w of words) {
      const text = w.textContent.replace(/[\u00a0\s.,;:!?"'’“”()]/g, '');
      if (text.length > 2) continue;
      const line = w.closest('.lab-hearing-line'); const r = w.getBoundingClientRect();
      if (!r.width || r.top < 60 || r.bottom > innerHeight - 120) continue;
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      for (const [x, y] of [[r.right + 1.5, cy], [r.left - 1.5, cy], [cx, r.top - 1.5], [cx, r.bottom + 1.5], [r.right + 3, cy], [r.left - 3, cy]]) {
        const hit = document.elementFromPoint(x, y);
        if (hit && !hit.closest('[data-testid="lab-word"]') && hit.closest('.lab-hearing-line') === line && nearest(line, x, y) === w) { const box = w.getBoundingClientRect(); return { text, x, y, hit: hit.tagName + '.' + hit.className, p: w.dataset.paragraphIndex, w: w.dataset.wordIndex, wordBox: [box.left, box.top, box.right, box.bottom].map(Math.round), alt: [[r.right + 1.5, cy], [r.left - 1.5, cy], [cx, r.top - 1.5], [cx, r.bottom + 1.5]] }; }
      }
    }
    return null;
  });
  console.log('  short word target:', JSON.stringify(t));
  check(8, !!t, 'found a one/two-letter word with a touchable point on its line but off its box');
  if (t) {
    let hitInfo = await pointer(pg, 'pointerdown', t.x, t.y); await wait(450);
    let sel = await selecting(pg);
    console.log('  dispatched on', JSON.stringify(hitInfo), 'selecting', JSON.stringify(sel));
    if (!sel.length) { await pointer(pg, 'pointercancel', t.x, t.y); await wait(100); for (const [x, y] of t.alt) { const h = await pointer(pg, 'pointerdown', x, y); await wait(260); sel = await selecting(pg); console.log('  retry at', x, y, JSON.stringify(h), '->', JSON.stringify(sel)); if (sel.length) { t.x = x; t.y = y; break; } await pointer(pg, 'pointercancel', x, y); await wait(100); } }
    check(8, sel.length === 1 && String(sel[0].w) === t.w && String(sel[0].p) === t.p, `long-press beside "${t.text}" selects that word (${JSON.stringify(sel)})`);
    await pointer(pg, 'pointerup', t.x, t.y); await wait(400);
    check(8, await pg.locator('.selection-popup').count() === 1, 'and the popup opens for it');
    await pg.screenshot({ path: `${S}/shots/${engineName}-reader-short-word.png` });
    await dismiss(pg);
  }
  // control: a touch in the page margin (no line) must not arm selection
  const margin = await pg.evaluate(() => { const stage = (document.querySelector('[data-testid="lab-reading-stage"], [data-testid="lab-hearing-stage"], [data-testid="lab-book"]')).getBoundingClientRect(); const lines = [...document.querySelectorAll('.lab-hearing-line')]; const first = lines[0].getBoundingClientRect(); const last = lines[lines.length-1].getBoundingClientRect(); for (const [x, y] of [[stage.left + stage.width/2, first.top - 3], [stage.left + stage.width/2, last.bottom + 3], [stage.left + 2, first.top + 20]]) { const hit = document.elementFromPoint(x, y); if (hit && !hit.closest('.lab-hearing-line') && stage.top <= y && y <= stage.bottom) return { x, y, hit: hit.tagName + '.' + hit.className }; } return null; });
  if (margin) {
    await pointer(pg, 'pointerdown', margin.x, margin.y); await wait(260);
    const marginSel = await selecting(pg);
    await pointer(pg, 'pointercancel', margin.x, margin.y); await wait(100);
    check(8, marginSel.length === 0, `a touch outside any line (${margin.hit}) does not start a selection`);
  } else console.log('  (no off-line point inside the stage at this width; margin control skipped)');
}

// ---- Item 4: note panel reuses the palette row (any multi-word selection) ----
{
  const t = await pg.evaluate(() => { const ws = [...document.querySelectorAll('[data-testid="lab-word"]')].filter(w => { const r = w.getBoundingClientRect(); return r.width > 20 && r.top > 120 && r.bottom < innerHeight - 160; }); const a = ws[2].getBoundingClientRect(); const z = ws[6].getBoundingClientRect(); return { ax: a.left + a.width/2, ay: a.top + a.height/2, zx: z.left + z.width/2, zy: z.top + z.height/2 }; });
  await pointer(pg, 'pointerdown', t.ax, t.ay); await wait(450);
  for (let i = 1; i <= 5; i++) await pointer(pg, 'pointermove', t.ax + (t.zx - t.ax) * i / 5, t.ay + (t.zy - t.ay) * i / 5);
  await pointer(pg, 'pointerup', t.zx, t.zy); await wait(400);
  const popup = pg.locator('.selection-popup');
  check(4, await popup.count() === 1, 'multi-word touch selection opens the popup');
  if (await popup.count()) {
    if (!(await popup.getByRole('button', { name: 'Highlight', exact: true }).count())) { const more = popup.getByRole('button', { name: 'More actions' }); if (await more.count()) { await more.first().click(); await wait(250); } }
    await popup.getByRole('button', { name: 'Highlight', exact: true }).click({ timeout: 5000 }); await wait(250);
    const dots = () => popup.evaluate(p => { const pr = p.getBoundingClientRect(); return { popup: [Math.round(pr.left), Math.round(pr.top), Math.round(pr.width), Math.round(pr.height)], dots: [...p.querySelectorAll('.popup-color-dot')].map(d => { const r = d.getBoundingClientRect(); return [Math.round(r.left - pr.left), Math.round(r.top - pr.top), Math.round(r.width), Math.round(r.height)]; }) }; });
    const before = await dots(); const dotsBefore = before.dots;
    const addNote = popup.getByRole('button', { name: /Add note|Edit note/ });
    check(4, await addNote.count() === 1, 'Add note sits in the palette row');
    await addNote.first().click(); await wait(500);
    const after = await dots(); const dotsAfter = after.dots;
    console.log('  palette before', JSON.stringify(before), 'after', JSON.stringify(after));
    const noteField = popup.locator('textarea, [aria-label="Highlight note"]');
    check(4, JSON.stringify(dotsBefore) === JSON.stringify(dotsAfter) && dotsBefore.length > 0, `colour dots neither move nor resize within the popup when the note opens (${JSON.stringify(dotsBefore)} -> ${JSON.stringify(dotsAfter)})`);
    check(4, after.popup[2] === before.popup[2] && after.popup[0] === before.popup[0] && after.popup[1] === before.popup[1], `popup keeps its width and place when the note opens (${before.popup.slice(0,3)} -> ${after.popup.slice(0,3)})`);
    const fieldW = await popup.locator('textarea').first().evaluate(t => Math.round(t.getBoundingClientRect().width));
    check(4, fieldW >= 220, `note field is usable width (${fieldW}px)`);
    check(4, await noteField.count() >= 1, 'note field opens beneath the row');
    const fit = await popup.evaluate(p => { const r = p.getBoundingClientRect(); const inner = [...p.querySelectorAll('*')].map(e => e.getBoundingClientRect()); return { w: Math.round(r.width), h: Math.round(r.height), overflowRight: Math.max(0, ...inner.map(i => i.right - r.right)), overflowBottom: Math.max(0, ...inner.map(i => i.bottom - r.bottom)), inViewport: r.left >= 0 && r.right <= innerWidth }; });
    check(4, fit.overflowRight < 1 && fit.overflowBottom < 1 && fit.inViewport, `note panel stays inside its frame and the viewport (${JSON.stringify(fit)})`);
    await pg.screenshot({ path: `${S}/shots/${engineName}-reader-note-panel.png` });
  }
  await dismiss(pg);
}

// ---- Item 7: dragging past the ragged end of a short last line stays on that line ----
{
  const finder = () => pg.evaluate(() => {
    // Paragraph elements hold many visual lines; group the words by their top edge.
    const paras = [...document.querySelectorAll('.lab-hearing-line')];
    const allTops = [...document.querySelectorAll('[data-testid="lab-word"]')].map(w => w.getBoundingClientRect().top);
    for (let i = 0; i < paras.length; i++) {
      const p = paras[i]; const pr = p.getBoundingClientRect();
      const words = [...p.querySelectorAll('[data-testid="lab-word"]')].filter(w => w.getBoundingClientRect().width > 0);
      if (words.length < 3) continue;
      const rows = new Map(); for (const w of words) { const top = Math.round(w.getBoundingClientRect().top); if (!rows.has(top)) rows.set(top, []); rows.get(top).push(w); }
      if (rows.size < 2) continue;
      const lastTop = Math.max(...rows.keys()); const row = rows.get(lastTop); const lastR = row[row.length - 1].getBoundingClientRect(); const firstR = row[0].getBoundingClientRect();
      if (lastR.top < 60 || lastR.bottom > innerHeight - 120) continue;
      if (pr.right - lastR.right < 90) continue; // needs a ragged end to drag into
      if (!allTops.some(t => t > lastTop + 5)) continue; // there must be a line below to get it wrong
      return { para: i, startX: firstR.left + firstR.width / 2, startY: firstR.top + firstR.height / 2, endX: pr.right - 12, endY: lastR.top + lastR.height / 2, rowWords: row.map(w => +w.dataset.wordIndex), lastText: row[row.length - 1].textContent, ragged: Math.round(pr.right - lastR.right) };
    }
    return null;
  });
  let t = await finder(); let paged = 0;
  while (!t && paged < 14) {
    // page forward with a quick touch tap in the right edge zone
    const x = 390 - 14, y = 420; await pointer(pg, 'pointerdown', x, y); await wait(60); await pointer(pg, 'pointerup', x, y); await wait(700); paged++;
    t = await finder();
  }
  console.log('  paged forward', paged, 'times; headline', await pg.evaluate(() => document.querySelector('[data-testid="lab-passage-headline"]')?.textContent));
  console.log('  short last line target:', JSON.stringify(t));
  check(7, !!t, 'found a short paragraph-ending line with a ragged end');
  if (t) {
    await pointer(pg, 'pointerdown', t.startX, t.startY); await wait(450);
    for (let i = 1; i <= 6; i++) await pointer(pg, 'pointermove', t.startX + (t.endX - t.startX) * i / 6, t.startY + (t.endY - t.startY) * i / 6);
    await wait(150);
    const sel = await selecting(pg);
    const linesTouched = [...new Set(sel.map(s => s.line))];
    const selIdx = sel.map(s => s.w);
    check(7, JSON.stringify(selIdx) === JSON.stringify(t.rowWords), `drag into the ragged end selects exactly that visual line and nothing below (got ${JSON.stringify(selIdx)}, expected ${JSON.stringify(t.rowWords)}, ends "${sel[sel.length-1]?.text}")`);
    await pointer(pg, 'pointerup', t.endX, t.endY); await wait(400);
    await pg.screenshot({ path: `${S}/shots/${engineName}-reader-short-line.png` });
    await dismiss(pg);
  }
}

// ---- Item 1 + 5: Explain card close control; Ask composer reachable with a highlight attached ----
{
  const t = await pg.evaluate(() => { const ws = [...document.querySelectorAll('[data-testid="lab-word"]')].filter(w => { const r = w.getBoundingClientRect(); return r.width > 20 && r.top > 120 && r.bottom < innerHeight - 160; }); const a = ws[3].getBoundingClientRect(); const z = ws[9].getBoundingClientRect(); return { ax: a.left + a.width/2, ay: a.top + a.height/2, zx: z.left + z.width/2, zy: z.top + z.height/2 }; });
  await pointer(pg, 'pointerdown', t.ax, t.ay); await wait(450);
  for (let i = 1; i <= 5; i++) await pointer(pg, 'pointermove', t.ax + (t.zx - t.ax) * i / 5, t.ay + (t.zy - t.ay) * i / 5);
  await pointer(pg, 'pointerup', t.zx, t.zy); await wait(400);
  const popup = pg.locator('.selection-popup');
  check(1, await popup.count() === 1, 'multi-word touch selection opens the popup');
  await popup.getByRole('button', { name: 'Explain', exact: true }).click(); await wait(800);
  const expand = popup.getByRole('button', { name: 'Expand explanation' });
  check(1, await expand.count() === 1, 'explanation card shows the expand control');
  if (await expand.count()) {
    await expand.click(); await wait(300);
    const close = popup.getByRole('button', { name: 'Close explanation' });
    check(1, await close.count() === 1, 'expanded, the control becomes Close');
    await pg.screenshot({ path: `${S}/shots/${engineName}-reader-explain-expanded.png` });
    await close.click(); await wait(400);
    check(1, await pg.locator('.selection-popup').count() === 0, 'Close dismisses the card and the popup');
  }
  await dismiss(pg);
  // Item 5: Ask with the highlight attached
  await pointer(pg, 'pointerdown', t.ax, t.ay); await wait(450);
  for (let i = 1; i <= 5; i++) await pointer(pg, 'pointermove', t.ax + (t.zx - t.ax) * i / 5, t.ay + (t.zy - t.ay) * i / 5);
  await pointer(pg, 'pointerup', t.zx, t.zy); await wait(400);
  await pg.locator('.selection-popup').getByRole('button', { name: 'Ask', exact: true }).click(); await wait(1200);
  const pane = pg.locator('[data-testid="lab-ask-pane"]');
  check(5, await pane.count() === 1, 'Ask opens the conversation pane');
  const composer = await pg.evaluate(() => {
    const c = document.querySelector('[data-testid="lab-ask-composer"]'); const input = document.querySelector('[data-testid="lab-ask-input"]'); const att = document.querySelector('[data-testid="lab-ask-attachment"]');
    if (!c || !input) return null; const cr = c.getBoundingClientRect(); const ir = input.getBoundingClientRect(); const ar = att?.getBoundingClientRect();
    return { composerH: cr.height, inputH: ir.height, inputMin: getComputedStyle(input).minHeight, attached: !!att, attH: ar?.height, inputInViewport: ir.top >= 0 && ir.bottom <= innerHeight, tapX: cr.left + 6, tapY: ir.top + ir.height / 2 - 0, attTapX: ar ? ar.left + 8 : 0, attTapY: ar ? ar.top + 8 : 0 };
  });
  console.log('  composer:', JSON.stringify(composer));
  check(5, composer && composer.attached, 'the highlighted passage is attached');
  check(5, composer && composer.inputH >= 44, `input keeps a 44px floor with the attachment (${composer?.inputH}px)`);
  check(5, composer && composer.inputInViewport, 'input is on screen');
  // a press on the composer's own padding, not on a control, puts the caret in the field
  await pg.evaluate(() => document.activeElement?.blur());
  await pg.evaluate(([x, y]) => { const el = document.elementFromPoint(x, y); el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerType: 'touch', pointerId: 2, isPrimary: true, clientX: x, clientY: y, button: 0, buttons: 1 })); return el.tagName; }, [composer.tapX, composer.tapY]); await wait(150);
  const focused = await pg.evaluate(() => document.activeElement?.getAttribute('data-testid'));
  check(5, focused === 'lab-ask-input', `a press on the composer focuses the input (active: ${focused})`);
  await pg.screenshot({ path: `${S}/shots/${engineName}-reader-ask-attached.png` });
}
check(0, pageErrors.length === 0, `no page errors (${pageErrors.slice(0,3).join(' | ')})`);
await ctx.close();

// ---- Item 11 (desktop): companion panel resizes by its inner edge within 30–70% ----
if (engineName === 'chromium') {
  const dctx = await b.newContext({ viewport: {width:1280, height:800} }); const dp = await dctx.newPage();
  await dp.goto(`http://localhost:${PORT}/reader`, { waitUntil: 'networkidle' }); await dp.waitForSelector('[data-testid="lab-word"]'); await wait(2000);
  const words = dp.locator('[data-testid="lab-word"]'); const a = await words.nth(3).boundingBox(); const z = await words.nth(8).boundingBox();
  await dp.mouse.move(a.x + a.width/2, a.y + a.height/2); await dp.mouse.down(); await dp.mouse.move(z.x + z.width/2, z.y + z.height/2, { steps: 10 }); await dp.mouse.up(); await wait(400);
  await dp.locator('.selection-popup').getByRole('button', { name: 'Ask', exact: true }).click(); await wait(1200);
  const resizer = dp.locator('[data-testid="lab-ask-resizer"]');
  check(11, await resizer.count() === 1, 'desktop companion has a resize handle');
  if (await resizer.count()) {
    const w0 = await dp.locator('.lab-ask.is-desktop-companion').evaluate(n => n.getBoundingClientRect().width);
    const rb = await resizer.boundingBox();
    console.log('  at handle centre:', await dp.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? e.tagName + '.' + e.className + ' testid=' + e.getAttribute('data-testid') : null; }, [rb.x + rb.width/2, rb.y + rb.height/2]), 'lab classes:', await dp.evaluate(() => document.querySelector('.lab')?.className));
    await dp.mouse.move(rb.x + rb.width/2, rb.y + rb.height/2); await dp.mouse.down(); await dp.mouse.move(rb.x + rb.width/2 - 200, rb.y + rb.height/2, { steps: 10 }); await dp.mouse.up(); await wait(300);
    const w1 = await dp.locator('.lab-ask.is-desktop-companion').evaluate(n => n.getBoundingClientRect().width);
    await dp.mouse.move(rb.x + rb.width/2 - 200, rb.y + rb.height/2); await dp.mouse.down(); await dp.mouse.move(rb.x + rb.width/2 - 1200, rb.y + rb.height/2, { steps: 10 }); await dp.mouse.up(); await wait(300);
    const w2 = await dp.locator('.lab-ask.is-desktop-companion').evaluate(n => n.getBoundingClientRect().width);
    console.log('  companion widths:', w0, w1, w2, 'of 1280');
    check(11, Math.abs(w1 - w0) > 100, `dragging the inner edge resizes the panel (${w0} -> ${w1}px)`);
    await resizer.focus(); for (let i = 0; i < 4; i++) await dp.keyboard.press('ArrowLeft'); await wait(200);
    const wk = await dp.locator('.lab-ask.is-desktop-companion').evaluate(n => n.getBoundingClientRect().width);
    check(11, wk > w2 + 10, `arrow keys on the divider widen the panel (${w2} -> ${wk}px)`);
    check(11, w2 <= 1280 * 0.7 + 1 && w2 >= 1280 * 0.3 - 1, `width is clamped to 30–70% of the window (${w2}px)`);
    await dp.screenshot({ path: `${S}/shots/chromium-desktop-companion-resized.png` });
  }
  await dctx.close();
}
await b.close(); srv.close();
console.log(`\n${failures.length ? 'FAILURES:\n  ' + failures.join('\n  ') : 'ALL CHECKS PASSED'}`);
process.exit(failures.length ? 1 : 0);
