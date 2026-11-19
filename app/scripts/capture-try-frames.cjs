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
const keep = id => KEEP.includes(id) || (Number(id) >= 11 && Number(id) <= 24)
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
  // The phone frame is wider than the page shows it, so the reader's chrome (the selection menu) reads at its real size
  // on a phone, not enlarged (Anders, 19 Nov).
  const size = phone ? 'width:430px;height:520px' : 'width:1056px;height:611px'
  await page.route(ORIGIN + '/try', route => route.fulfill({ contentType: 'text/html', body:
    `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><body style="margin:0;padding:16px;background:#ece7db">` +
    `<iframe data-try-frame src="/reader?${params}" style="${size};border:0;display:block"></iframe>` }))
  await page.goto(ORIGIN + '/try', { waitUntil: 'domcontentloaded' })
  const frameEl = page.locator('[data-try-frame]')
  const f = page.frameLocator('[data-try-frame]')
  const word = i => f.locator(`[data-testid="lab-word"][data-paragraph-index="0"][data-word-index="${i}"]`).first()
  await word(1).waitFor({ timeout: 45000 })
  await page.waitForTimeout(3000)
  let n = 0
  // Phone: the Explain and Summary cards are shown as a peek, lowered so only their top shows over the page (Anders,
  // 19 Nov: "too big, just hint them"). The card's fixed sheet is moved down and the dimming behind it lifted.
  const PEEK_SHOWN = Number(process.env.PEEK || 140)
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
  await shot('start')
  // 1. Explain the first sentence (the page's scripted answer: no AI call).
  const a = await word(1).boundingBox(), b = await word(19).boundingBox()
  if (kind === 'phone') {
    const fr = page.frame({ url: /\/reader/ })
    await fr.evaluate(([a, b]) => {
      const w = i => document.querySelector(`[data-testid="lab-word"][data-paragraph-index="0"][data-word-index="${i}"]`)
      const pos = el => { const rs = el.getClientRects(); const r = rs[rs.length - 1]; return { clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 } }
      const ev = (el, type) => el.dispatchEvent(new PointerEvent(type, { pointerId: 9, pointerType: 'touch', isPrimary: true, bubbles: true, button: 0, ...pos(el) }))
      ev(w(1), 'pointerdown'); return new Promise(r => setTimeout(() => { ev(w(19), 'pointermove'); ev(w(19), 'pointerup'); r() }, 320))
    }, [1, 19])
    await page.waitForTimeout(700)
    await shot('selected')
    await f.getByTestId('lab-pbar-explain').click()
  } else {
    await page.mouse.move(a.x + 2, a.y + a.height / 2)
    await page.mouse.down()
    await page.mouse.move(b.x + b.width - 2, b.y + b.height / 2, { steps: 12 })
    await page.mouse.up()
    await page.waitForTimeout(700)
    await shot('selected')
    await f.locator('.selection-popup').getByRole('button', { name: /^Explain/ }).first().click()
  }
  await page.waitForTimeout(1600); await shot('explain-typing')
  await page.waitForTimeout(3500); await peek(); await shot('explain')
  // The heading must not move from the Explain frame to Modern (Anders, 19 Nov): note where it sits now, and after
  // the switch scroll the reader so it sits there again.
  const reader = page.frame({ url: /\/reader/ })
  const headingEl = () => [...document.querySelectorAll('body *')].find(e => !e.children.length && e.textContent.trim() === 'Book 2' && e.getBoundingClientRect().top > 60)
  const headingTop = () => reader.evaluate(src => { const h = (0, eval)(src)(); return h ? h.getBoundingClientRect().top : null }, '(' + headingEl.toString() + ')')
  const before = await headingTop()
  console.log(kind, 'heading before switch', before)
  // Close the card.
  if (kind === 'phone') { await page.keyboard.press('Escape').catch(() => {}); await page.waitForTimeout(800) }
  // 2. Modern (Anders, 19 Nov: the second move, before Listen).
  if (phone) await page.evaluate(() => document.querySelector('[data-try-frame]').contentWindow.postMessage({ source: 'tinct-try-page', cmd: 'edition', kind: 'modern' }, location.origin))
  else await f.getByTestId('lab-try-editions').locator('button').last().click()
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
  // 3. Listen to the modern English (Modern Book 2 is recorded).
  const playBtn = f.locator('[data-testid="lab-v2-play"]').first()
  for (let i = 0; i < 3; i++) {
    await playBtn.click()
    try { await f.locator('[data-testid="lab-v2-play"][aria-label="Pause"]').first().waitFor({ timeout: 6000 }); break } catch (e) { console.log(kind, 'play retry', await playBtn.getAttribute('aria-label')) }
  }
  await page.waitForTimeout(2000)
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
  await f.locator('[data-testid="margin-start-summary"], [data-testid="lab-unit-summary"]').first().click()
  await page.waitForTimeout(1500); await shot('summary-typing')
  await page.waitForTimeout(3000); await peek(); await shot('summary')
  await browser.close()
  for (const file of fs.readdirSync(RAW).filter(f => f.startsWith(kind + '-')).sort()) {
    const number = file.split('-')[1]
    if (!keep(number)) continue
    const meta = await sharp(RAW + file).metadata()
    const width = kind === 'phone' ? Math.round(meta.width * 2 / 3) : meta.width
    await sharp(RAW + file).resize({ width }).webp({ quality: 82 }).toFile(`${OUT}${kind}-${number}.webp`)
  }
  console.log(kind, 'frames written to', OUT)
}
;(async () => { for (const k of ['desktop', 'phone']) if (!only || only === k) await run(k).catch(e => console.log(k, 'ERR', e.message.split('\n')[0])) })()
