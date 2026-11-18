#!/usr/bin/env node
// The simple first page (Anders, 16 Nov 2026), in real browsers against a local Vite server with every API mocked
// (nothing leaves the machine; no AI is called):
//   Desktop (Chromium, 1440×900, Margin reader, Frankenstein):
//     1. a first visit's margin holds only the hint and "✧ Primer for Letter 1" (no Before you start, no angle row);
//     2. Explain on a selection opens its card and the hint goes; closed, the margin is today's without the angle row;
//     3. reloaded, the hint stays gone; the t menu has Reading angle ("Not set");
//     4. the end of Letter 1 offers "✧ Read with an angle"; once an angle is set it goes, and the t menu shows the angle;
//     5. dark and e-ink first visits.
//   Phone (iPhone 13, WebKit and Chromium, paginated):
//     6. the first page: title and author, Letter 1 with one ✧ Primer, the line, then the text; no book pill;
//     7. Explain from a press-and-hold selection: after the card closes the line is gone, the book pill is
//        Primer · Summary, and the page and the reading place are what they were before;
//     8. the same from page 2 (the line's removal re-lays out the chapter under the reader);
//     9. dark and e-ink first pages.
//   Signed in (Chromium desktop and WebKit phone): an account with saved places and past Explain use (its chat rows)
//     and nothing on this device: no hint at any point, no angle row, and the reader opens at the saved place.
//
//   cd app && PLAYWRIGHT_BROWSERS_PATH=<browsers> node scripts/check-simple-first-page.mjs
// FIRST_PAGE_SHOTS=<dir> sets where screenshots go (default artifacts/simple-first-page).
// FIRST_PAGE_ENGINES=webkit,chromium picks the phone engines.
import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'

// Always the QA project: the account is mocked, and nothing may reach a real one.
process.env.VITE_SHARED_READER_DEFAULT = '1'
process.env.VITE_SUPABASE_URL = 'https://qa.supabase.co'
process.env.VITE_SUPABASE_ANON_KEY = 'qa'
const { createServer } = await import('vite')
const { chromium, webkit, devices } = await import('playwright')

const shots = resolve(process.env.FIRST_PAGE_SHOTS || 'artifacts/simple-first-page')
await mkdir(shots, { recursive: true })
const HINT_DESKTOP = 'Highlight any passage to have it explained, simplified, or to ask about it.'
const HINT_PHONE = 'Press and hold any passage to have it explained, simplified, or to ask about it.'
const USER = 'u-first-page-qa'
const ANSWER = 'The passage sets the scene in plain terms. This local answer is a UI fixture.'
const sse = text => `data: ${JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text } })}\n\ndata: {"type":"message_stop"}\n\n`
const results = []
const check = (name, ok, detail = '') => { results.push({ name, ok: !!ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  ' + detail : ''}`) }

const server = await createServer({ configFile: resolve('vite.config.ts'), server: { host: '127.0.0.1', port: 0, strictPort: false }, logLevel: 'error' })
await server.listen()
const address = server.httpServer.address()
assert(address && typeof address !== 'string')
const origin = `http://127.0.0.1:${address.port}`
const browsers = []

/** Mocks: the companion answers locally; signed in, the account's rows as given; everything else off the machine is refused. */
async function serve(context, { account = null } = {}) {
  const log = { chat: [], commits: [], positionPuts: [] }
  await context.route('**/*', route => {
    const request = route.request(), url = new URL(request.url())
    if (url.hostname.endsWith('supabase.co')) {
      if (process.env.FIRST_PAGE_DEBUG) console.log('supabase', request.method(), url.pathname + url.search)
      if (!account) return route.fulfill({ status: 503, contentType: 'application/json', body: '{}' })
      if (url.pathname.startsWith('/auth/v1/user')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(account.user) })
      if (url.pathname === '/rest/v1/rpc/commit_user_data') {
        const body = request.postDataJSON()
        log.commits.push(body)
        if (body.p_key === 'preferences') account.preferences = body.p_value
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ applied: true, conflict: false, rev: 2, value: body.p_value }]) })
      }
      if (url.pathname === '/rest/v1/user_data') return new Promise(done => setTimeout(done, account.delay ?? 0)).then(() => {
        const key = url.searchParams.get('key') || ''
        const single = (request.headers().accept || '').includes('vnd.pgrst.object')
        let rows = []
        if (key === 'eq.preferences') rows = [{ key: 'preferences', value: account.preferences, rev: 1 }]
        else if (key.startsWith('like.chat-history')) rows = account.chatRows.map(k => ({ key: k }))
        else if (key.startsWith('eq.chat-history:') || key.startsWith('like.') || key.startsWith('in.')) rows = []
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(single ? (rows[0] ?? null) : rows) })
      })
      return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    }
    if (url.origin !== origin) return route.abort()
    if (/^\/api\/(chat|lab-chat)$/.test(url.pathname) && request.method() === 'POST') {
      const body = request.postDataJSON()
      log.chat.push(body?.companion?.intent || 'chat')
      return route.fulfill({ status: 200, contentType: 'text/event-stream', body: sse(ANSWER) })
    }
    if (url.pathname === '/api/lab-position' && account?.position) {
      if (request.method() === 'PUT') log.positionPuts.push(request.postDataJSON())
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(account.position) })
    }
    if (url.pathname.startsWith('/api/')) return route.fulfill({ status: 404, contentType: 'application/json', body: '{}' })
    return route.continue()
  })
  return log
}

async function newContext(browser, { phone = false, theme = null, account = null, seed = null } = {}) {
  const context = await browser.newContext({ ...(phone ? { ...devices['iPhone 13'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 } : { viewport: { width: 1440, height: 900 } }),
    serviceWorkers: 'block', reducedMotion: 'reduce' })
  const log = await serve(context, { account })
  await context.addInitScript(({ theme, account, seed }) => {
    if (sessionStorage.getItem('qa-seeded')) return
    sessionStorage.setItem('qa-seeded', '1')
    localStorage.setItem('tinct:wipe-v1-done', '1')
    if (theme) localStorage.setItem('tinct-lab-prefs', JSON.stringify({ theme }))
    if (account) {
      const now = Math.floor(Date.now() / 1000)
      localStorage.setItem('sb-qa-auth-token', JSON.stringify({ access_token: 'qa-token', refresh_token: 'qa-refresh', token_type: 'bearer', expires_in: 360000, expires_at: now + 360000, user: account.user }))
      document.cookie = 'tinct_auth=1; path=/'
    }
    if (seed) for (const [key, value] of Object.entries(seed)) localStorage.setItem(key, value)
    HTMLMediaElement.prototype.play = async function () { this.muted = true }
  }, { theme, account: account ? { user: account.user } : null, seed })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.setDefaultTimeout(15000)
  return { context, page, log, errors }
}

async function waitReady(page) {
  await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady === 'true', null, { timeout: 90000 })
  await page.evaluate(() => document.fonts.ready)
}

const shot = async (page, name) => { const path = resolve(shots, name + '.png'); await page.screenshot({ path }); return path }

/** What the first-visit hint and the start card look like in the desktop margin now. */
const desktopMargin = page => page.evaluate(() => ({
  hint: document.querySelector('[data-testid="margin-first-hint"]')?.textContent ?? null,
  startCard: !!document.querySelector('[data-testid="margin-start-card"]'),
  startLabel: [...document.querySelectorAll('[data-testid="source-margin-item"]')].map(node => node.querySelector('.source-margin-label')?.textContent).filter(Boolean),
  angle: !!document.querySelector('[data-testid="margin-reading-angle"], .lab-start-angle-link'),
  openCards: document.querySelectorAll('[data-testid="source-margin-item"][data-open="true"]').length,
}))

async function desktopSelect(page, from = 5, to = 16) {
  const words = page.locator('[data-testid="continuous-reader"] [data-testid="lab-word"]:visible')
  await words.nth(to).waitFor()
  const a = await words.nth(from).boundingBox(), b = await words.nth(to).boundingBox()
  assert(a && b)
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2)
  await page.mouse.down()
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 12 })
  await page.mouse.up()
}

try {
  const desktopBrowser = await chromium.launch({ headless: true, args: ['--mute-audio', '--autoplay-policy=user-gesture-required'] })
  browsers.push(desktopBrowser)
  const DESKTOP_URL = `${origin}/reader?book=frankenstein&edition=original-en&chapter=1&view=margin&sharedReader=1`

  if (!process.env.FIRST_PAGE_SKIP_DESKTOP) {
  // ---------- Desktop, signed out, first visit ----------
  {
    const { context, page, log, errors } = await newContext(desktopBrowser)
    await page.goto(DESKTOP_URL, { waitUntil: 'domcontentloaded' })
    await page.getByTestId('continuous-reader').waitFor({ timeout: 90000 })
    await waitReady(page)
    await page.getByTestId('margin-first-hint').waitFor()
    const first = await desktopMargin(page)
    check('desktop first visit: the margin holds only the hint and the Primer link', first.hint === HINT_DESKTOP + '✧Primer for Letter 1' && !first.startCard && !first.angle && first.startLabel.length === 0, JSON.stringify(first))
    await shot(page, 'desktop-first-visit-light')

    await desktopSelect(page)
    await page.getByTestId('lab-dbar-explain').click()
    await page.locator('[data-testid="source-margin-item"][data-open="true"] [data-testid="lab-phone-card-answer"]').waitFor()
    await page.getByText(ANSWER).first().waitFor()
    const open = await desktopMargin(page)
    check('desktop: Explain opens its card and the hint goes', open.openCards === 1 && open.hint === null, JSON.stringify(open))
    check('desktop: the first answered Explain is recorded on this device', await page.evaluate(() => localStorage.getItem('tinct:selection-actions-used')) === '1')
    await shot(page, 'desktop-explain-card-light')
    await page.keyboard.press('Escape')
    await page.waitForFunction(() => !document.querySelector('[data-testid="source-margin-item"][data-open="true"]'))
    const after = await desktopMargin(page)
    check('desktop after first use: Before you start, no hint, no angle row', after.hint === null && after.startCard && !after.angle && after.startLabel.includes('Before you start'), JSON.stringify(after))

    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.getByTestId('continuous-reader').waitFor({ timeout: 90000 })
    await waitReady(page)
    await page.locator('[data-testid="source-margin-item"].is-start').waitFor()
    await page.locator('[data-testid="source-margin-item"].is-start [data-testid="source-margin-expand"]').click()
    await page.getByTestId('margin-start-card').waitFor()
    const reloaded = await desktopMargin(page)
    const startActs = await page.getByTestId('margin-start-card').evaluate(node => [...node.querySelectorAll('button')].map(button => button.textContent))
    check('desktop reloaded: the hint stays gone; the start card has no angle row', reloaded.hint === null && !reloaded.angle && startActs.join('|') === '✧Primer|✧Summary|✧Primer|✧Summary|✧Quiz me', JSON.stringify({ reloaded, startActs }))
    await shot(page, 'desktop-after-first-use-light')

    await page.getByTestId('lab-super').click()
    await page.getByTestId('lab-super-menu').waitFor()
    const menu = await page.getByTestId('lab-super-menu').evaluate(node => [...node.querySelectorAll('.lab-super-row-label')].map(label => label.textContent))
    const detail = await page.getByTestId('lab-super-row-angle-detail').textContent()
    check('desktop t menu: Reading angle after AI settings, "Not set"', menu.join('|') === 'Chat|Talk|Catch me up|Appearance|Book settings|Audio settings|AI settings|Reading angle|Profile' && detail === 'Not set', menu.join('|'))
    await shot(page, 'desktop-t-menu')
    await page.getByTestId('lab-super-row-angle').click()
    const angleField = page.locator('[role="dialog"] textarea, [role="dialog"] input[type="text"]').first()
    await angleField.waitFor()
    check('desktop t menu: Reading angle opens AI settings with the caret in the angle', await angleField.evaluate(node => document.activeElement === node))
    await page.keyboard.press('Escape')
    await page.locator('[role="dialog"]').first().waitFor({ state: 'detached' }).catch(() => {})

    // The end of Letter 1.
    const offer = page.getByTestId('lab-chapter-angle')
    await page.evaluate(() => { const end = document.querySelector('[data-testid="lab-chapter-angle"]')?.closest('[data-testid="lab-chapter-end"]'); end?.scrollIntoView({ block: 'center' }) })
    await offer.waitFor()
    await page.waitForTimeout(400)
    check('desktop: only the end of Letter 1 offers it (painted neighbours do not)', await offer.count() === 1)
    const endActions = await page.locator('[data-testid="lab-chapter-end"]', { has: offer }).evaluate(node => [...node.querySelectorAll('button')].map(button => button.textContent.trim()))
    check('desktop: the end of Letter 1 offers "Read with an angle" beside Summary and Quiz me', endActions.slice(0, 3).join('|') === '✧Summary|✧Quiz me|✧Read with an angle', endActions.join('|'))
    await shot(page, 'desktop-chapter-end-offer')
    await offer.click()
    await angleField.waitFor()
    await angleField.fill('Ambition and what it costs the people around it')
    await page.waitForTimeout(500)
    await page.keyboard.press('Escape')
    await page.waitForFunction(() => !document.querySelector('[data-testid="lab-chapter-angle"]'))
    check('desktop: once an angle is set the offer goes', await page.getByTestId('lab-chapter-angle').count() === 0)
    await page.getByTestId('lab-super').click()
    const setDetail = await page.getByTestId('lab-super-row-angle-detail').textContent()
    check('desktop t menu: the angle is shown once set', setDetail === 'Ambition and what it costs the people around it', setDetail)
    await page.keyboard.press('Escape')
    check('desktop: the companion was asked only for the Explain (mocked)', log.chat.join(',') === 'explain', log.chat.join(','))
    check('desktop: no page errors', errors.length === 0, errors.join(' | '))
    await context.close()
  }

  // ---------- Desktop, dark and e-ink first visits ----------
  for (const [name, theme, query] of [['dark', 'dark', ''], ['eink', null, '&eink=1']]) {
    const { context, page, errors } = await newContext(desktopBrowser, { theme })
    await page.goto(DESKTOP_URL + query, { waitUntil: 'domcontentloaded' })
    await page.getByTestId('continuous-reader').waitFor({ timeout: 90000 })
    await waitReady(page)
    await page.getByTestId('margin-first-hint').waitFor()
    const look = await page.evaluate(() => {
      const hint = document.querySelector('.lab-first-hint-text'), root = document.querySelector('[data-testid="lab-root"]')
      const style = getComputedStyle(hint)
      return { font: style.fontFamily, color: style.color, page: getComputedStyle(root).backgroundColor, night: root.classList.contains('is-night'), eink: document.documentElement.dataset.eink === 'true' }
    })
    check(`desktop ${name}: the hint in the UI face, in the theme's ink`, /system-ui/.test(look.font) && (name === 'dark' ? look.night : look.eink), JSON.stringify(look))
    await shot(page, `desktop-first-visit-${name}`)
    await desktopSelect(page)
    await page.getByTestId('lab-dbar-explain').click()
    await page.getByText(ANSWER).first().waitFor()
    await page.keyboard.press('Escape')
    await page.waitForFunction(() => !document.querySelector('[data-testid="source-margin-item"][data-open="true"]'))
    await page.locator('[data-testid="source-margin-item"].is-start [data-testid="source-margin-expand"]').click()
    await page.getByTestId('margin-start-card').waitFor()
    await shot(page, `desktop-after-first-use-${name}`)
    check(`desktop ${name}: no page errors`, errors.length === 0, errors.join(' | '))
    await context.close()
  }
  }

  // ---------- Phone ----------
  const PHONE_URL = `${origin}/reader?book=frankenstein&edition=original-en&chapter=1&sharedReader=1&layout=phone`
  const engines = (process.env.FIRST_PAGE_ENGINES || 'webkit,chromium').split(',').map(name => name.trim()).filter(Boolean)
  /** The painted page: its first and last word, the reader's place (data-place and the stored record) and the folio. */
  const phonePage = page => page.evaluate(() => {
    const words = [...document.querySelectorAll('[data-testid="lab-page-wrap"] .lab-passage [data-testid="lab-word"]')]
      .filter(node => !node.closest('.lab-page-measure, .lab-native-measure, [aria-hidden="true"]') && node.getBoundingClientRect().height > 0)
      .filter(node => { const r = node.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth })
    const at = node => node ? `${node.dataset.paragraphIndex}:${node.dataset.wordIndex}` : null
    const stored = JSON.parse(localStorage.getItem('tinct-lab-position') || '{}')?.books?.frankenstein ?? null
    const root = document.querySelector('[data-testid="lab-root"]')
    return {
      first: at(words[0]), last: at(words.at(-1)), words: words.length,
      place: root?.dataset.place ?? null, chapter: root?.dataset.chapter ?? null,
      stored: stored ? `${stored.chapterNumber}/${stored.paragraphIndex}:${stored.wordIndex}` : null,
      folio: [...document.querySelectorAll('[data-testid="lab-root"] span, [data-testid="lab-root"] p, [data-testid="lab-root"] div')].map(node => node.textContent.trim()).find(text => /^[\d,]+ \/ [\d,]+ of book/.test(text)) ?? null,
      // The page's text stays inside the page: nothing under the foot or past the edge.
      overflow: (() => { const wrap = document.querySelector('[data-testid="lab-page-wrap"]')?.getBoundingClientRect(); const last = words.at(-1)?.getBoundingClientRect(); return wrap && last ? Math.round(last.bottom - wrap.bottom) : null })(),
      hint: document.querySelector('[data-testid="lab-first-hint"]')?.textContent ?? null,
      bookPill: [...document.querySelectorAll('[data-testid="lab-book-start"] .lab-start-seg')].map(node => node.textContent),
      unitPills: [...document.querySelectorAll('[data-testid="lab-unit-start"] .lab-chapter-preview')].map(node => node.textContent),
      opening: document.querySelector('[data-testid="lab-book-opening"]')?.textContent ?? null,
    }
  })
  async function phoneSelect(page) {
    const words = page.locator('[data-testid="lab-page-wrap"] .lab-passage [data-testid="lab-word"]:visible')
    await words.nth(30).waitFor()
    const a = await words.nth(20).boundingBox(), b = await words.nth(30).boundingBox()
    assert(a && b)
    const pos = box => ({ clientX: box.x + box.width / 2, clientY: box.y + box.height / 2 })
    await words.nth(20).dispatchEvent('pointerdown', { pointerId: 9, pointerType: 'touch', isPrimary: true, bubbles: true, button: 0, ...pos(a) })
    await page.waitForTimeout(320)
    await words.nth(30).dispatchEvent('pointermove', { pointerId: 9, pointerType: 'touch', isPrimary: true, bubbles: true, ...pos(b) })
    await words.nth(30).dispatchEvent('pointerup', { pointerId: 9, pointerType: 'touch', isPrimary: true, bubbles: true, ...pos(b) })
    await page.getByTestId('lab-phone-bar').waitFor()
  }
  async function openPhone(browser, options = {}) {
    const opened = await newContext(browser, { phone: true, ...options })
    await opened.page.goto(PHONE_URL + (options.query ?? ''), { waitUntil: 'domcontentloaded' })
    await waitReady(opened.page)
    if (await opened.page.getByTestId('lab-chapter-cover').isVisible().catch(() => false)) await opened.page.keyboard.press('ArrowRight')
    await opened.page.locator('[data-testid="lab-page-wrap"] .lab-passage [data-testid="lab-word"]:visible').first().waitFor()
    await opened.page.waitForTimeout(800)
    return opened
  }
  /** Explain on a press-and-hold selection, then close the card: the first use. */
  async function phoneExplainAndClose(page) {
    await phoneSelect(page)
    await page.getByTestId('lab-pbar-explain').click()
    await page.getByTestId('lab-phone-card-answer').waitFor()
    await page.keyboard.press('Escape')
    await page.getByTestId('lab-phone-card').waitFor({ state: 'hidden' })
    await page.waitForFunction(() => !document.querySelector('[data-testid="lab-first-hint"]'))
    await page.waitForTimeout(1200)
  }

  for (const name of process.env.FIRST_PAGE_SKIP_PHONE ? [] : engines) {
    const engine = name === 'chromium' ? chromium : name === 'webkit' ? webkit : null
    assert(engine, `unsupported engine ${name}`)
    const browser = await engine.launch({ headless: true, ...(name === 'chromium' ? { args: ['--mute-audio', '--autoplay-policy=user-gesture-required'] } : {}) })
    browsers.push(browser)

    // First page, then first use from it.
    {
      const { context, page, errors } = await openPhone(browser)
      const before = await phonePage(page)
      check(`phone ${name}: first page is title and author, Letter 1 with one Primer, the line; no book pill`,
        before.hint === HINT_PHONE && before.bookPill.length === 0 && before.unitPills.join('|') === '✧Primer' && /Frankenstein/.test(before.opening ?? ''), JSON.stringify(before))
      const order = await page.evaluate(() => {
        const header = [...document.querySelectorAll('[data-testid="lab-page-wrap"] .lab-passage-header')].find(node => !node.closest('.lab-page-measure') && node.getBoundingClientRect().height > 0)
        const hint = header?.querySelector('[data-testid="lab-first-hint"]')?.getBoundingClientRect()
        const heading = header?.querySelector('[data-testid="lab-passage-headline"]')?.getBoundingClientRect()
        const firstWord = [...document.querySelectorAll('[data-testid="lab-page-wrap"] .lab-passage [data-testid="lab-word"]')].find(node => node.getBoundingClientRect().height > 0)?.getBoundingClientRect()
        return hint && heading && firstWord ? { headingBottom: heading.bottom, hintTop: hint.top, hintBottom: hint.bottom, textTop: firstWord.top, hintRight: hint.right, width: innerWidth } : null
      })
      check(`phone ${name}: the line sits between the heading and the text, inside the page`, order && order.hintTop >= order.headingBottom && order.textTop >= order.hintBottom && order.hintRight <= order.width, JSON.stringify(order))
      await shot(page, `phone-${name}-first-visit`)
      await phoneExplainAndClose(page)
      const after = await phonePage(page)
      check(`phone ${name}: after first use the line is gone, the book pill is Primer · Summary, the chapter pills Primer · Summary`,
        after.hint === null && after.bookPill.join('|') === 'Primer|Summary' && after.unitPills.join('|') === '✧Primer|✧Summary', JSON.stringify(after))
      check(`phone ${name}: from page 1, the page and the place are unchanged, the page whole`, after.first === before.first && after.folio === before.folio && after.place === before.place && after.stored === before.stored && after.chapter === before.chapter && before.overflow <= 0 && after.overflow <= 0,
        JSON.stringify({ before: { first: before.first, last: before.last, place: before.place, stored: before.stored, folio: before.folio, overflow: before.overflow }, after: { first: after.first, last: after.last, place: after.place, stored: after.stored, folio: after.folio, overflow: after.overflow } }))
      await shot(page, `phone-${name}-after-first-use`)
      await page.reload({ waitUntil: 'domcontentloaded' })
      await waitReady(page)
      await page.waitForTimeout(800)
      const reloaded = await phonePage(page)
      check(`phone ${name}: reloaded, the line stays gone and the place is kept`, reloaded.hint === null && reloaded.place === before.place, JSON.stringify(reloaded))
      // The t menu.
      await page.getByTestId('lab-super').click()
      await page.getByTestId('lab-super-menu').waitFor()
      const menu = await page.getByTestId('lab-super-menu').evaluate(node => [...node.querySelectorAll('.lab-super-row-label')].map(label => label.textContent))
      check(`phone ${name}: the t menu has Reading angle after AI settings ("Not set")`, menu.includes('Reading angle') && menu.indexOf('Reading angle') === menu.indexOf('AI settings') + 1
        && await page.getByTestId('lab-super-row-angle-detail').textContent() === 'Not set', menu.join('|'))
      await shot(page, `phone-${name}-t-menu`)
      await page.getByTestId('lab-super').click()
      check(`phone ${name}: no page errors`, errors.length === 0, errors.join(' | '))
      await context.close()
    }

    // First use from page 2: the line's removal lays page 1 out again under the reader.
    {
      const { context, page, errors } = await openPhone(browser)
      await page.keyboard.press('ArrowRight')
      await page.waitForTimeout(900)
      const before = await phonePage(page)
      await phoneExplainAndClose(page)
      const after = await phonePage(page)
      const placeShown = await page.evaluate(place => !![...document.querySelectorAll('[data-testid="lab-page-wrap"] .lab-passage [data-testid="lab-word"]')]
        .find(node => `${node.dataset.paragraphIndex}:${node.dataset.wordIndex}` === place && node.getBoundingClientRect().height > 0), before.place)
      check(`phone ${name}: from page 2, the reading place is unchanged and still on the page`, after.place === before.place && after.stored === before.stored && placeShown && after.chapter === before.chapter,
        JSON.stringify({ before: { first: before.first, last: before.last, place: before.place, stored: before.stored, folio: before.folio }, after: { first: after.first, last: after.last, place: after.place, stored: after.stored, folio: after.folio } }))
      check(`phone ${name}: from page 2, the same page stays open`, after.folio === before.folio && after.first === before.first && after.overflow <= 0, `${before.folio} ${before.first} → ${after.folio} ${after.first}, overflow ${after.overflow}`)
      check(`phone ${name}: page 2 no page errors`, errors.length === 0, errors.join(' | '))
      await context.close()
    }

    // Dark and e-ink first pages.
    for (const [look, theme, query] of [['dark', 'dark', ''], ['eink', null, '&eink=1']]) {
      const { context, page, errors } = await openPhone(browser, { theme, query })
      const state = await phonePage(page)
      const style = await page.evaluate(() => { const node = document.querySelector('[data-testid="lab-first-hint"]'); const s = node && getComputedStyle(node); return s ? { font: s.fontFamily, color: s.color, bg: s.backgroundColor } : null })
      check(`phone ${name} ${look}: the line on the first page, in the UI face`, state.hint === HINT_PHONE && /system-ui/.test(style?.font ?? ''), JSON.stringify(style))
      await shot(page, `phone-${name}-first-visit-${look}`)
      check(`phone ${name} ${look}: no page errors`, errors.length === 0, errors.join(' | '))
      await context.close()
    }
  }

  // ---------- Signed in: an account with saved places and past Explain use, nothing on this device ----------
  {
    const savedAt = Date.now() - 60 * 60 * 1000
    const place = { bookId: 'frankenstein', headerBook: 'Frankenstein', chapterNumber: 3, sequentialChapter: 3, paragraphIndex: 2, wordIndex: 0, primaryEditionKey: 'original-en', updatedAt: savedAt, deviceId: 'qa-other', rev: 4 }
    const accountFor = () => ({
      user: { id: USER, email: 'reader@example.com', aud: 'authenticated', role: 'authenticated', user_metadata: {}, app_metadata: {} },
      preferences: { aiSettings: { at: 1, settings: {} } },
      // Saved conversations from before the flag existed: the account's own history.
      chatRows: ['chat-history:frankenstein:3', 'chat-history:emma:1'],
      position: { owner: USER, books: { frankenstein: place }, finished: {}, hidden: {}, lastSettledBookId: 'frankenstein', lastSettledAt: savedAt, updatedAt: savedAt, deviceId: 'qa-other' },
      // The account answers late, as on a slow network: the hint must not flash meanwhile.
      delay: 2500,
    })
    const watchHint = () => { window.__hintSeen = false; new MutationObserver(() => { if (document.querySelector('[data-testid="margin-first-hint"], [data-testid="lab-first-hint"], .lab-first-hint-line')) window.__hintSeen = true }).observe(document, { childList: true, subtree: true }) }
    const runs = [['desktop', chromium, false, `${origin}/reader?book=frankenstein&view=margin&sharedReader=1`], ['phone', engines.includes('webkit') ? webkit : chromium, true, `${origin}/reader?book=frankenstein&sharedReader=1&layout=phone`]]
    for (const [label, engine, phone, url] of runs) {
      const browser = await engine.launch({ headless: true })
      browsers.push(browser)
      const account = accountFor()
      const { context, page, log, errors } = await newContext(browser, { phone, account })
      await context.addInitScript(watchHint)
      await page.goto(url, { waitUntil: 'domcontentloaded' })
      await waitReady(page)
      if (phone && await page.getByTestId('lab-chapter-cover').isVisible().catch(() => false)) await page.keyboard.press('ArrowRight')
      await page.waitForTimeout(4500)
      const state = await page.evaluate(() => ({
        chapter: document.querySelector('[data-testid="lab-root"]')?.dataset.chapter, place: document.querySelector('[data-testid="lab-root"]')?.dataset.place,
        hintSeen: window.__hintSeen, angle: !!document.querySelector('.lab-start-angle-link, [data-testid="lab-book-angle"], [data-testid="margin-reading-angle"]'),
        startActions: [...document.querySelectorAll('[data-testid="margin-start-card"] button, [data-testid="lab-unit-start"] button')].map(node => node.textContent),
        flag: localStorage.getItem('tinct:selection-actions-used'),
      }))
      check(`signed in ${label}: no hint at any point, no angle row; the chapter actions are today's`, !state.hintSeen && !state.angle && state.startActions.length > 0, JSON.stringify(state))
      check(`signed in ${label}: opens at the saved place (Letter 3, paragraph 3)`, state.chapter === '3' && state.place === '2:0', JSON.stringify(state))
      for (let waited = 0; waited < 30000 && !log.commits.some(commit => commit.p_key === 'preferences' && commit.p_value?.selectionActionsUsed === true); waited += 250) await page.waitForTimeout(250)
      check(`signed in ${label}: the account's history marks the reader as having used the actions, and the account is told`, state.flag === '1' && log.commits.some(commit => commit.p_key === 'preferences' && commit.p_value?.selectionActionsUsed === true && commit.p_value?.aiSettings),
        JSON.stringify(log.commits.map(commit => commit.p_key === 'preferences' ? { key: commit.p_key, selectionActionsUsed: commit.p_value?.selectionActionsUsed ?? null, kept: Object.keys(commit.p_value ?? {}) } : commit.p_key)))
      await shot(page, `signed-in-${label}-saved-place`)
      check(`signed in ${label}: no page errors`, errors.length === 0, errors.join(' | '))
      await context.close()
    }
  }
} finally {
  for (const browser of browsers) await browser.close().catch(() => {})
  await server.close()
}
const failed = results.filter(result => !result.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed. Screenshots: ${shots}`)
if (failed.length) process.exit(1)
