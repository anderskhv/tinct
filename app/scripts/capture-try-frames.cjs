// The /try page's frames (public/try.html, public/lab/try/try.js): one run of the real reader in /try's demo mode,
// Meditations Book 2: Explain (the scripted answer), Modern, Listen to the modern English (the recorded Helios narration), Summary (scripted),
// at 1440x900 and on an iPhone 13. Run it after a reader change that shows in the frames, then check them by eye:
//   node scripts/capture-try-frames.cjs            (both)   node scripts/capture-try-frames.cjs phone
// It reads https://tinct.app (the only place with the recordings), marked as internal traffic, a few page loads, no AI:
// if the Explain answer is not the scripted one, the selection is off and the run must be fixed, not kept.
const { chromium, devices } = require('playwright')
const path = require('path')
const fs = require('fs')
const sharp = require('sharp')
const { markInternal } = require('./lib/internalTraffic.cjs')
const RAW = fs.mkdtempSync(path.join(require('os').tmpdir(), 'try-frames-')) + '/'
const OUT = path.join(__dirname, '../public/lab/try/frames/')
// The frames try.js plays (the near-duplicate 'typing' frames 03 and 09 are captured but not kept).
// Listen is a run of short frames ('11'…'24'), so the marked word moves word by word (Anders, 19 Nov: it lagged).
const KEEP = ['01', '02', '04', '08', '10']
// The selection growing under the finger, one frame per word (Anders, 19 Nov: highlight it, smoothly and quickly):
// frames 29-45 hold words 1-2 … 1-18; the full selection with its menu is frame 02. Desktop only: the phone
// selects with a press, the sentence and its menu at once, as in the launch film.
const DRAG_STEPS = Array.from({ length: 17 }, (_, i) => [i + 2, String(i + 29)])
// The top share of the frame a drag frame keeps: the selection ends at about a third of the way down.
const DRAG_CROP = { phone: 0.34, desktop: 0.42 }
// 46-50: the Explain answer typing itself in; 51: the card closed again, before the switch to modern English.
const TYPING = ['46', '47', '48', '49', '50']
const keep = id => KEEP.includes(id) || (Number(id) >= 11 && Number(id) <= 24) || (Number(id) >= 29 && Number(id) <= 51)
const ORIGIN = process.env.ORIGIN || 'https://tinct.app'
const only = process.argv[2]
async function run(kind) {
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {})
  const opts = kind === 'phone' ? { ...devices['iPhone 13'] } : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 }
  const ctx = await browser.newContext(opts)
  await markInternal(ctx)
  const page = await ctx.newPage()
  // The reader's demo mode runs only when framed by /try (public/lab/try/reader-demo.js), so /try is answered here
  // with a bare frame the size the page used to give the reader.
  const phone = kind === 'phone'
  const params = new URLSearchParams({ book: 'meditations', chapter: '2', edition: 'original-en', demo: 'try', layout: phone ? 'phone' : 'desktop' })
  if (!phone) params.set('view', 'margin')
  // The phone frame is a phone's own screen (390 wide, tall), so the page can show it in a real phone shape and zoom in
  // on it like the launch film (Anders, 19 Nov).
  const size = phone ? 'width:390px;height:760px' : 'width:1056px;height:611px'
  // Phone: the frame sits at the page's corner with nothing around it, so it fits the 390-wide phone exactly and the
  // pointer marks (measured on the page) line up with the screenshots (a 16px pad shifted them, 19 Nov).
  await page.route(ORIGIN + '/try', route => route.fulfill({ contentType: 'text/html', body:
    `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><body style="margin:0;padding:${phone ? 0 : 16}px;background:#ece7db">` +
    `<iframe data-try-frame src="/reader?${params}" style="${size};border:0;display:block"></iframe>` }))
  await page.goto(ORIGIN + '/try', { waitUntil: 'domcontentloaded' })
  const frameEl = page.locator('[data-try-frame]')
  const f = page.frameLocator('[data-try-frame]')
  const word = i => f.locator(`[data-testid="lab-word"][data-paragraph-index="0"][data-word-index="${i}"]`).first()
  await word(1).waitFor({ timeout: 45000 })
  await page.waitForTimeout(3000)
  let n = 0
  // Where the visitor's pointer goes before each change (Anders, 19 Nov: show the click), as fractions of the frame,
  // written beside the frames for try.js.
  const marks = {}
  const mark = async (name, locator, edge) => {
    const box = await locator.boundingBox(), fr = await frameEl.boundingBox()
    if (!box || !fr) return
    const x = edge === 'start' ? box.x + 2 : edge === 'end' ? box.x + box.width - 2 : box.x + box.width / 2
    marks[name] = [+((x - fr.x) / fr.width).toFixed(4), +((box.y + box.height / 2 - fr.y) / fr.height).toFixed(4)]
  }
  // Phone: the Explain and Summary cards are shown as a peek, lowered so only their top shows over the page (Anders,
  // 19 Nov: "too big, just hint them"). The card's fixed sheet is moved down and the dimming behind it lifted.
  const PEEK_SHOWN = Number(process.env.PEEK || (phone ? 330 : 140))
  const peek = async () => {
    if (!phone) return
    await page.frame({ url: /\/reader/ }).evaluate(px => {
      const fixed = el => { for (let e = el; e && e !== document.body; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.position === 'fixed') return e } return null }
      const card = [...document.querySelectorAll('*')].find(e => /^(Explain|Summary) · Book 2$/.test((e.textContent || '').trim()) && e.children.length === 0)
      const sheet = card && fixed(card)
      if (!sheet) return 'no sheet'
      sheet.style.transition = 'none'; sheet.style.transform = `translateY(${innerHeight - px - (card.getBoundingClientRect().top - 30)}px)`
      for (const e of document.querySelectorAll('body *')) {
        if (e === sheet || sheet.contains(e) || e.contains(sheet)) continue
        const cs = getComputedStyle(e), r = e.getBoundingClientRect()
        if (cs.position === 'fixed' && r.width >= innerWidth - 2 && r.height >= innerHeight * .6 && cs.backgroundColor !== 'rgba(0, 0, 0, 0)') e.style.opacity = '0'
      }
      return 'ok'
    }, PEEK_SHOWN).then(r => console.log('peek', r))
    await page.waitForTimeout(250)
  }
  const shot = async (name, id) => { id = id || String(++n).padStart(2, '0'); await frameEl.screenshot({ path: `${RAW}${kind}-${id}-${name}.png` }) }
  // Desktop: the margin starts blank (Anders, 19 Nov): its "Highlight any passage" hint and Primer link are hidden.
  if (!phone) await page.frame({ url: /\/reader/ }).evaluate(() => {
    const hint = [...document.querySelectorAll('body *')].find(e => !e.children.length && /^Highlight any passage/.test(e.textContent.trim()))
    let box = hint
    while (box && box.parentElement && !/Primer for/.test(box.textContent)) box = box.parentElement
    if (box) box.style.visibility = 'hidden'
  })
  // The book's font must be in before the first frame, or it shows a fallback face and the next frame jumps.
  await page.frame({ url: /\/reader/ }).evaluate(() => document.fonts.ready.then(() => true))
  await page.waitForTimeout(1500)
  await shot('start', '01')
  await mark('selectFrom', word(1), 'start'); await mark('selectTo', word(19), 'end')
  // 1. Explain the first sentence (the page's scripted answer: no AI call).
  const a = await word(1).boundingBox(), b = await word(19).boundingBox()
  if (kind === 'phone') {
    const fr = page.frame({ url: /\/reader/ })
    await fr.evaluate(([a, b]) => {
      const w = i => document.querySelector(`[data-testid="lab-word"][data-paragraph-index="0"][data-word-index="${i}"]`)
      const pos = el => { const rs = el.getClientRects(); const r = rs[rs.length - 1]; return { clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 } }
      const ev = (el, type) => el.dispatchEvent(new PointerEvent(type, { pointerId: 9, pointerType: 'touch', isPrimary: true, bubbles: true, button: 0, ...pos(el) }))
      ev(w(1), 'pointerdown'); return new Promise(r => setTimeout(r, 320))
    }, [1, 19])
    for (const [k, id] of []) {
      await fr.evaluate(k => {
        const el = document.querySelector(`[data-testid="lab-word"][data-paragraph-index="0"][data-word-index="${k}"]`)
        const rs = el.getClientRects(), rc = rs[rs.length - 1]
        el.dispatchEvent(new PointerEvent('pointermove', { pointerId: 9, pointerType: 'touch', isPrimary: true, bubbles: true, button: 0, clientX: rc.right - 2, clientY: rc.top + rc.height / 2 }))
      }, k)
      await page.waitForTimeout(160)
      await mark('drag' + id, word(k), 'end')
      await shot('drag', id)
    }
    await fr.evaluate(() => {
      const el = document.querySelector('[data-testid="lab-word"][data-paragraph-index="0"][data-word-index="19"]')
      const rs = el.getClientRects(), rc = rs[rs.length - 1]
      const at = { pointerId: 9, pointerType: 'touch', isPrimary: true, bubbles: true, button: 0, clientX: rc.right - 2, clientY: rc.top + rc.height / 2 }
      el.dispatchEvent(new PointerEvent('pointermove', at)); el.dispatchEvent(new PointerEvent('pointerup', at))
    })
    await page.waitForTimeout(700)
    await shot('selected', '02')
    await mark('explain', f.getByTestId('lab-pbar-explain'))
    await f.getByTestId('lab-pbar-explain').click()
  } else {
    // The selection menu waits for the drag to end, as in a real drag (the reader shows it on any pause).
    const reader0 = page.frame({ url: /\/reader/ })
    await reader0.evaluate(() => { const st = document.createElement('style'); st.id = 'try-hold-menu'; st.textContent = '.selection-popup{visibility:hidden!important}'; document.head.appendChild(st) })
    await page.mouse.move(a.x + 2, a.y + a.height / 2)
    await page.mouse.down()
    for (const [k, id] of DRAG_STEPS) {
      const c = await word(k).boundingBox()
      await page.mouse.move(c.x + c.width - 2, c.y + c.height / 2, { steps: 2 })
      await page.waitForTimeout(120)
      await mark('drag' + id, word(k), 'end')
      await shot('drag', id)
    }
    await page.mouse.move(b.x + b.width - 2, b.y + b.height / 2, { steps: 4 })
    await page.mouse.up()
    await reader0.evaluate(() => document.getElementById('try-hold-menu')?.remove())
    await page.waitForTimeout(700)
    await shot('selected', '02')
    await mark('explain', f.locator('.selection-popup').getByRole('button', { name: /^Explain/ }).first())
    await f.locator('.selection-popup').getByRole('button', { name: /^Explain/ }).first().click()
  }
  // The answer typing itself in, as it streams in the reader (the demo's scripted answer arrives whole, so the
  // frames show its first words, then more): the card is settled first, so it never moves between frames.
  await page.waitForTimeout(4000); await peek()
  const cardText = (frac) => page.frame({ url: /\/reader/ }).evaluate(frac => {
    if (!window.__tryNodes) {
      // The card: the largest box around its answer that holds none of the page's words.
      const lead = [...document.querySelectorAll('*')].find(e => !e.children.length && /^Marcus is rehearsing/.test((e.textContent || '').trim()))
      let card = lead; while (card && card.parentElement && card.parentElement !== document.body && !card.parentElement.querySelector('[data-testid="lab-word"]')) card = card.parentElement
      if (!card) return 'no card'
      // The answer's text: from the lead sentence on, not the card's label, buttons or field.
      const walker = document.createTreeWalker(card, NodeFilter.SHOW_TEXT)
      const nodes = []; let started = false
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        if (lead.contains(n)) started = true
        if (!started || n.parentElement.closest('button, input, textarea, [contenteditable]') || !n.textContent.trim()) continue
        nodes.push(n)
      }
      window.__tryNodes = nodes; window.__tryText = nodes.map(n => n.textContent)
    }
    const nodes = window.__tryNodes, texts = window.__tryText
    const total = texts.reduce((sum, t) => sum + t.split(/\s+/).filter(Boolean).length, 0)
    let left = frac >= 1 ? Infinity : Math.round(total * frac)
    // The words not yet typed stay in place, invisible, so the card keeps its size and nothing around it moves.
    document.querySelectorAll('[data-try-untyped]').forEach(e => e.remove())
    nodes.forEach((n, i) => {
      let out = ''
      const parts = texts[i].split(/(\s+)/)
      let j = 0
      for (; j < parts.length; j++) { if (left <= 0) break; out += parts[j]; if (parts[j].trim()) left-- }
      n.textContent = out
      const rest = parts.slice(j).join('')
      if (rest) { const span = document.createElement('span'); span.setAttribute('data-try-untyped', ''); span.style.visibility = 'hidden'; span.textContent = rest; n.parentNode.insertBefore(span, n.nextSibling) }
    })
    if (frac >= 1) { window.__tryNodes = null; window.__tryText = null }
    return total
  }, frac)
  const fractions = [0.08, 0.25, 0.45, 0.65, 0.85]
  for (let i = 0; i < TYPING.length; i++) { console.log(kind, 'typing words', await cardText(fractions[i])); await page.waitForTimeout(120); await shot('typing', TYPING[i]) }
  await cardText(1); await page.waitForTimeout(150)
  await shot('explain', '04')
  // The heading must not move from the Explain frame to Modern (Anders, 19 Nov): note where it sits now, and after
  // the switch scroll the reader so it sits there again.
  const reader = page.frame({ url: /\/reader/ })
  const headingEl = () => [...document.querySelectorAll('body *')].find(e => !e.children.length && e.textContent.trim() === 'Book 2' && e.getBoundingClientRect().top > 60)
  const headingTop = () => reader.evaluate(src => { const h = (0, eval)(src)(); return h ? h.getBoundingClientRect().top : null }, '(' + headingEl.toString() + ')')
  const before = await headingTop()
  console.log(kind, 'heading before switch', before)
  // Close the card.
  if (kind === 'phone') { await page.keyboard.press('Escape').catch(() => {}); await page.waitForTimeout(800) }
  // Phone: the card put away before the switch (Escape does not close the phone's sheet in the demo), so the
  // switch shows only the page changing, as in the launch film.
  if (phone) await page.frame({ url: /\/reader/ }).evaluate(() => {
    const label = [...document.querySelectorAll('*')].find(e => /^Explain · Book 2$/.test((e.textContent || '').trim()) && e.children.length === 0)
    let sheet = label; while (sheet && sheet !== document.body && getComputedStyle(sheet).position !== 'fixed') sheet = sheet.parentElement
    if (sheet && sheet !== document.body) sheet.style.visibility = 'hidden'
  })
  await page.waitForTimeout(200)
  await shot('closed', '51')
  // Phone: the page's pointer taps Aa for the switch (Anders, 19 Nov: "just show and click on Aa"); no menu is shown.
  if (phone) await mark('modern', f.getByTestId('lab-header-aa'))
  // 2. Modern (Anders, 19 Nov: the second move, before Listen).
  if (phone) await page.evaluate(() => document.querySelector('[data-try-frame]').contentWindow.postMessage({ source: 'tinct-try-page', cmd: 'edition', kind: 'modern' }, location.origin))
  else { await mark('modern', f.getByTestId('lab-try-editions').locator('button').last()); await f.getByTestId('lab-try-editions').locator('button').last().click() }
  await page.waitForTimeout(2500)
  const after = await headingTop()
  if (before != null && after != null && Math.abs(after - before) > 1) {
    await reader.evaluate(([src, delta]) => {
      const h = (0, eval)(src)()
      for (let e = h && h.parentElement; e; e = e.parentElement) {
        const cs = getComputedStyle(e)
        if (/(auto|scroll)/.test(cs.overflowY) && e.scrollHeight > e.clientHeight) { e.scrollTop += delta; return }
      }
      window.scrollBy(0, delta)
    }, ['(' + headingEl.toString() + ')', after - before])
    await page.waitForTimeout(400)
    console.log(kind, 'heading held: moved', Math.round(after - before), 'now', Math.round(await headingTop() - before))
  }
  await shot('modern', '08')
  // Where the modern page's paragraphs break, as fractions of the frame: the switch dissolves paragraph by
  // paragraph, top to bottom, between these lines (the launch film's switch).
  marks.modernBands = await reader.evaluate(() => {
    const rows = new Map()
    for (const w of document.querySelectorAll('[data-testid="lab-word"][data-paragraph-index]')) {
      const r = w.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight || !r.height) continue
      const k = w.getAttribute('data-paragraph-index'), cur = rows.get(k) || [r.top, r.bottom]
      rows.set(k, [Math.min(cur[0], r.top), Math.max(cur[1], r.bottom)])
    }
    const paras = [...rows.values()].sort((a, b) => a[0] - b[0])
    const cuts = []
    for (let i = 1; i < paras.length; i++) cuts.push(+(((paras[i - 1][1] + paras[i][0]) / 2) / innerHeight).toFixed(4))
    return cuts
  })
  // 3. Listen to the modern English (Modern Book 2 is recorded).
  const playBtn = f.locator('[data-testid="lab-v2-play"]').first()
  await mark('play', playBtn)
  for (let i = 0; i < 3; i++) {
    await playBtn.click()
    try { await f.locator('[data-testid="lab-v2-play"][aria-label="Pause"]').first().waitFor({ timeout: 6000 }); break } catch (e) { console.log(kind, 'play retry', await playBtn.getAttribute('aria-label')) }
  }
  // Start on the first word (Anders, 19 Nov): the frames begin the moment the reader marks a word, which is
  // the first word read.
  const reading = page.frame({ url: /\/reader/ })
  for (let t = 0; t < 60; t++) {
    const marked = await reading.evaluate(() => [...document.querySelectorAll('[data-testid="lab-word"]')].some(w => {
      const bg = getComputedStyle(w).backgroundColor
      return bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent'
    }))
    if (marked) break
    await page.waitForTimeout(50)
  }
  const listenTimes = []
  for (let i = 1; i <= 14; i++) {
    const t = Date.now()
    await shot('listen', String(10 + i))
    listenTimes.push(t)
    await page.waitForTimeout(Math.max(0, t + 280 - Date.now()))
  }
  console.log(kind, 'listen frame ms', listenTimes.slice(1).map((t, i) => t - listenTimes[i]).join(','))
  await playBtn.click().catch(() => {})
  await page.waitForTimeout(800)
  // Close the player so it does not linger in the Summary frames.
  const close = f.getByRole('button', { name: 'Close audio controls' }).last()
  if (await close.count()) await close.click().catch(() => {})
  await page.waitForTimeout(1000)
  n = 8
  // 4. Summary (scripted).
  await mark('summary', f.locator('[data-testid="margin-start-summary"], [data-testid="lab-unit-summary"]').first())
  await f.locator('[data-testid="margin-start-summary"], [data-testid="lab-unit-summary"]').first().click()
  await page.waitForTimeout(1500); await shot('summary-typing', '09')
  await page.waitForTimeout(3000); await peek(); await shot('summary', '10')
  await browser.close()
  fs.writeFileSync(`${OUT}${kind}-pointer.json`, JSON.stringify(marks) + '\n')
  console.log(kind, 'pointer', JSON.stringify(marks))
  for (const file of fs.readdirSync(RAW).filter(f => f.startsWith(kind + '-')).sort()) {
    const number = file.split('-')[1]
    if (!keep(number)) continue
    const meta = await sharp(RAW + file).metadata()
    const width = kind === 'phone' ? Math.round(meta.width * 2 / 3) : meta.width
    // Drag frames keep only the strip the selection grows in; the page shows them over frame 01 (try.js).
    const crop = Number(number) >= 29 && Number(number) <= 45 ? DRAG_CROP[kind] : 1
    const source = crop < 1 ? sharp(RAW + file).extract({ left: 0, top: 0, width: meta.width, height: Math.round(meta.height * crop) }) : sharp(RAW + file)
    await source.resize({ width }).webp({ quality: 82 }).toFile(`${OUT}${kind}-${number}.webp`)
  }
  console.log(kind, 'frames written to', OUT)
}
;(async () => { for (const k of ['desktop', 'phone']) if (!only || only === k) await run(k).catch(e => console.log(k, 'ERR', e.message.split('\n')[0])) })()
