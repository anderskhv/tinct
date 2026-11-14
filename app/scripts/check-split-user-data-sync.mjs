// Highlights and chat in one user_data row per chapter (Disk IO, 14 Nov 2026; src/lab/userDataShards.ts).
// Two isolated devices (a desktop and a phone) and an old reader tab that still writes the whole-book rows share
// one mocked account (lib/fakeUserData.mjs: user_data reads and commit_user_data with the server's rules). The
// built reader (dist/) is served as https://tinct.app through request routing; nothing leaves the machine and no
// model is called.
//
//   CI=true npm run build && node scripts/check-split-user-data-sync.mjs
//
// It checks that the account starts as an old one (one row per book), that each device's marks and chats reach
// their chapter rows (and only those), that a mark made on the phone and hidden at once is sent before its
// debounce ends, that the old tab's additions, edit and deletion reach both devices, that no highlight or card
// is lost anywhere, that the Notebook on both devices lists every one of them, and that the old rows are never
// written by the reader. It prints the bytes each commit sent next to the size of the whole-book row it replaces.
import { chromium, webkit } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import { markInternal } from './lib/internalTraffic.cjs'
import { bookChats, bookMarks, createUserDataFake } from './lib/fakeUserData.mjs'

const origin = 'https://tinct.app', out = 'artifacts/split-user-data-sync'
fs.mkdirSync(out, { recursive: true })
const assets = fs.readdirSync('dist/assets').filter(f => f.endsWith('.js')).map(f => fs.readFileSync('dist/assets/' + f, 'utf8')).join('\n')
const supabaseUrl = assets.match(/https:\/\/[a-z0-9-]+\.supabase\.co/)?.[0]
assert(supabaseUrl, 'Built client includes its account endpoint')
const user = { id: '11111111-1111-4111-8111-111111111111', email: 'fixture@example.invalid', aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {} }
const exp = Math.floor(Date.now() / 1000) + 3600
const token = [{ alg: 'HS256', typ: 'JWT' }, { sub: user.id, exp, role: 'authenticated' }, 'fixture'].map(x => typeof x === 'string' ? x : Buffer.from(JSON.stringify(x)).toString('base64url')).join('.')
const authKey = 'sb-' + new URL(supabaseUrl).hostname.split('.')[0] + '-auth-token'
const H = 'lab-highlights:bible', C = 'chat-history:bible'
const ENGINES = (process.env.ENGINES || 'chromium,webkit').split(',')

const T = Date.now() - 3 * 86400000
const mark = (n, chapterNumber, extra = {}) => ({ id: `hl-${T + n}-${extra.tag || 'm' + n}`, bookId: 'bible', editionKey: 'web-en', chapterNumber, paragraphIndex: 1, fromWord: 1 + (n % 4), endParagraphIndex: 1, toWord: 3 + (n % 4), color: 'gold', updatedAt: T + n, ...extra })
const conv = (id, chapterNumber, at, text, extra = {}) => ({ id, bookId: 'bible', chapterNumber, startTimestamp: at, endTimestamp: at + 1, preview: text, messages: [
  { id: id + ':q', role: 'user', content: text, timestamp: at, bookId: 'bible', chapterNumber, isComplete: true, source: 'text' },
  { id: id + ':a', role: 'assistant', content: 'Answer to: ' + text, timestamp: at + 1, bookId: 'bible', chapterNumber, isComplete: true },
], ...extra })

const results = []
for (const name of ENGINES) {
  const engine = { chromium, webkit }[name]
  const browser = await markInternal(await engine.launch({ args: name === 'chromium' ? ['--mute-audio'] : [] }))
  const account = createUserDataFake()
  // An account from before the split: one highlights row and one chat row for the Bible, rewritten many times.
  const oldA = mark(1, 412, { tag: 'oldA', note: 'Old note in Ezra.' }), oldB = mark(2, 923, { tag: 'oldB' }), oldGone = mark(3, 412, { tag: 'oldGone' })
  account.set(H, { v: 1, highlights: [oldA, oldB, oldGone], deleted: [] }, 672)
  const convOld = conv('conv-old-412', 412, T + 10, 'Why does Ezra tear his garment?')
  const cardOld = conv('mc_card-old-923', 923, T + 20, 'Explain this passage.', { card: { id: 'card-old-923', kind: 'explain', chapterNumber: 923, at: T + 20, u: T + 20, anchor: { editionKey: 'web-en', chapterNumber: 923, paragraphIndex: 1, fromWord: 1, endParagraphIndex: 1, toWord: 3 }, text: 'fixture' } })
  account.set(C, [convOld, cardOld], 2827)
  const oldRows = { [H]: JSON.stringify(account.get(H).value), [C]: JSON.stringify(account.get(C).value) }
  // What each device holds that the account does not yet have.
  const deskMark = mark(4, 412, { tag: 'desk', note: 'Desktop note.' }), deskConv = conv('conv-desk-412', 412, T + 30, 'Desktop question in Ezra 9')
  const phoneMark = mark(5, 923, { tag: 'phone' }), phoneConv = conv('conv-phone-923', 923, T + 40, 'Phone question')
  const now = Date.now()
  const position = { owner: user.id, books: { ezra: { bookId: 'ezra', headerBook: 'Ezra', chapterNumber: 9, sequentialChapter: 412, paragraphIndex: 1, wordIndex: 0, primaryEditionKey: 'web-en', updatedAt: now - 100000, deviceId: 'desktop', rev: 1 } }, finished: {}, hidden: {}, lastSettledBookId: 'ezra', lastSettledAt: now - 100000, updatedAt: now - 100000, deviceId: 'desktop' }
  const contexts = []
  async function device(phone, seed) {
    const context = await browser.newContext({ serviceWorkers: 'block', viewport: phone ? { width: 390, height: 844 } : { width: 1450, height: 813 }, hasTouch: phone })
    contexts.push(context)
    await context.route('**/*', async route => {
      const req = route.request(), u = new URL(req.url())
      if (u.origin === supabaseUrl) {
        if (u.pathname.startsWith('/auth/')) return route.fulfill({ json: user })
        if (await account.handle(route)) return
        return route.fulfill({ json: [] })
      }
      if (u.origin !== origin) return route.abort()
      if (u.pathname === '/api/lab-position') return route.fulfill({ json: position })
      if (u.pathname.startsWith('/api/')) return route.fulfill({ status: 404, json: {} })
      if (req.method() !== 'GET') return route.abort()
      const file = path.resolve('dist', '.' + (u.pathname === '/reader' ? '/app.html' : u.pathname))
      if (file.startsWith(path.resolve('dist') + '/') && fs.existsSync(file) && fs.statSync(file).isFile()) return route.fulfill({ path: file })
      return route.fulfill({ status: 404, body: '' })
    })
    await context.addInitScript(({ authKey, user, token, exp, position, seed, phone }) => {
      if (sessionStorage.getItem('split-fixture-seeded')) return
      sessionStorage.setItem('split-fixture-seeded', '1')
      localStorage.setItem(authKey, JSON.stringify({ access_token: token, refresh_token: 'fixture', expires_at: exp, expires_in: 3600, token_type: 'bearer', user }))
      localStorage.setItem('tinct-lab-position', JSON.stringify(position))
      localStorage.setItem('tinct-lab-prefs', JSON.stringify({ theme: 'book', fontFamily: 'garamond', fontSize: 1.3, fontSizeExplicit: true, primaryEdition: 'web-en' }))
      localStorage.setItem('tinct-lab-highlights', JSON.stringify(seed.highlights))
      localStorage.setItem('tinct:chat-history:bible', JSON.stringify(seed.chats))
      if (phone) sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({ kind: 'open-reader', bookId: 'bible', primaryEditionKey: 'web-en', savedPlace: { bookId: 'bible', chapterNumber: 923, paragraphIndex: 1, wordIndex: 0, page: 0 } }))
      HTMLMediaElement.prototype.play = async () => {}
    }, { authKey, user, token, exp, position, seed, phone })
    const page = await context.newPage()
    page.setDefaultTimeout(30000)
    page.errors = []
    page.on('pageerror', error => page.errors.push(String(error)))
    await page.goto(origin + '/reader', { waitUntil: 'domcontentloaded' })
    await page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true')
    await page.evaluate(() => document.fonts.ready)
    return page
  }
  const until = async (label, test, ms = 15000) => {
    const start = Date.now()
    while (Date.now() - start < ms) { if (test()) return; await new Promise(resolve => setTimeout(resolve, 50)) }
    assert.fail(label)
  }
  const markIds = () => bookMarks(account, H).map(h => h.id).sort()
  const chatIds = () => bookChats(account, C).filter(c => !c.card?.gone).map(c => c.id).sort()
  const pageCommits = () => account.commits.filter(c => c.who === 'page')
  const localMarks = page => page.evaluate(() => JSON.parse(localStorage.getItem('tinct-lab-highlights') || '[]').filter(h => h.bookId === 'bible').map(h => h.id).sort())
  const localChats = page => page.evaluate(() => JSON.parse(localStorage.getItem('tinct:chat-history:bible') || '[]').map(c => c.id).sort())
  async function notebook(page, phone) {
    if (phone) {
      // A first tap may only dismiss what the new highlight left open; tap again until the menu opens.
      for (let attempt = 0; attempt < 3; attempt++) {
        await page.getByTestId('lab-super').click()
        if (await page.getByTestId('lab-super-menu').waitFor({ timeout: 2000 }).then(() => true, () => false)) break
      }
      await page.getByTestId('lab-super-row-notebook').click()
    } else {
      await page.getByTestId('lab-header-notebook').click()
    }
    const region = page.getByRole('region', { name: 'Notebook', exact: true })
    await region.waitFor()
    await page.waitForTimeout(400)
    return region
  }
  try {
    // 1. The desktop opens: its local mark and chat go to chapter 412's rows, with that chapter's old items.
    const desktop = await device(false, { highlights: [oldA, oldB, oldGone, deskMark], chats: [convOld, deskConv] })
    await until('desktop mark reached chapter 412 row', () => (account.get(H + ':412')?.value?.highlights ?? []).some(h => h.id === deskMark.id))
    await until('desktop chat reached chapter 412 row', () => (account.get(C + ':412')?.value ?? []).some(c => c.id === deskConv.id))
    assert.deepEqual(account.get(H + ':412').value.highlights.map(h => h.id).sort(), [oldA.id, oldGone.id, deskMark.id].sort(), 'chapter 412 row holds that chapter only, the old row\'s items with it')
    assert(!account.get(H + ':923'), 'chapter 923 was not touched by the desktop')

    // 2. The phone opens on chapter 923: its mark and chat go to chapter 923's rows; the desktop's stay.
    const phone = await device(true, { highlights: [phoneMark], chats: [phoneConv] })
    await until('phone mark reached chapter 923 row', () => (account.get(H + ':923')?.value?.highlights ?? []).some(h => h.id === phoneMark.id))
    await until('phone chat reached chapter 923 row', () => (account.get(C + ':923')?.value ?? []).some(c => c.id === phoneConv.id))
    assert.deepEqual(markIds(), [oldA.id, oldB.id, oldGone.id, deskMark.id, phoneMark.id].sort(), 'account holds every mark after both devices')
    await phone.waitForFunction(id => JSON.parse(localStorage.getItem('tinct-lab-highlights') || '[]').some(h => h.id === id), deskMark.id)

    // 3. A mark made on the phone, the page hidden at once: sent before its debounce (2.5 s) would have.
    const before = new Set(await localMarks(phone))
    const words = phone.locator('[data-testid="lab-page-wrap"] .lab-passage [data-testid="lab-word"]')
    const at = box => ({ clientX: box.x + box.width / 2, clientY: box.y + box.height / 2 })
    const a = await words.nth(6).boundingBox(), b = await words.nth(10).boundingBox()
    await words.nth(6).dispatchEvent('pointerdown', { pointerId: 9, pointerType: 'touch', isPrimary: true, bubbles: true, button: 0, ...at(a) })
    await phone.waitForTimeout(320)
    await words.nth(10).dispatchEvent('pointermove', { pointerId: 9, pointerType: 'touch', isPrimary: true, bubbles: true, ...at(b) })
    await phone.waitForTimeout(60)
    await words.nth(10).dispatchEvent('pointerup', { pointerId: 9, pointerType: 'touch', isPrimary: true, bubbles: true, ...at(b) })
    // The selection menu (Explain, Chat, Highlight, Copy).
    const highlight = phone.getByRole('button', { name: 'Highlight', exact: true }).or(phone.getByTestId('lab-pbar-highlight')).first()
    await highlight.waitFor({ timeout: 5000 })
    await phone.waitForTimeout(250)
    await highlight.click()
    await phone.waitForFunction(n => JSON.parse(localStorage.getItem('tinct-lab-highlights') || '[]').filter(h => h.bookId === 'bible').length > n, before.size)
    const uiMark = (await localMarks(phone)).find(id => !before.has(id))
    assert(uiMark, 'the phone made a highlight')
    const hiddenAt = Date.now()
    await phone.evaluate(() => window.dispatchEvent(new Event('pagehide')))
    await until('hidden phone sent its new mark at once', () => markIds().includes(uiMark), 1800)
    const flushMs = Date.now() - hiddenAt
    const uiChapter = bookMarks(account, H).find(h => h.id === uiMark).chapterNumber
    assert(account.get(`${H}:${uiChapter}`).value.highlights.some(h => h.id === uiMark), 'the new mark is in its chapter row')

    // 4. An old reader tab writes the whole-book rows: a new mark and chat in chapter 500, an edit, a deletion.
    const oldTabMark = mark(6, 500, { tag: 'oldtab', note: 'From an old tab.' }), oldTabConv = conv('conv-oldtab-500', 500, T + 60, 'Old tab question')
    account.oldTabCommit(H, value => ({ ...value, highlights: [...value.highlights.filter(h => h.id !== oldGone.id).map(h => h.id === oldB.id ? { ...h, color: 'rose', updatedAt: Date.now() } : h), oldTabMark], deleted: [...value.deleted, { id: oldGone.id, bookId: 'bible', deletedAt: Date.now() }] }))
    account.oldTabCommit(C, value => [...value, oldTabConv])
    const expectedMarks = [oldA.id, oldB.id, deskMark.id, phoneMark.id, uiMark, oldTabMark.id].sort()
    const expectedChats = [convOld.id, cardOld.id, deskConv.id, phoneConv.id, oldTabConv.id].sort()
    assert.deepEqual(markIds(), expectedMarks, 'account: every mark, the deleted one gone')
    assert.deepEqual(chatIds(), expectedChats, 'account: every conversation and card')

    // 5. Both devices come back to the front: everything arrives, nothing is lost, the deletion holds.
    const shown = []
    for (const [page, isPhone, label] of [[desktop, false, 'desktop'], [phone, true, 'phone']]) {
      await page.evaluate(() => { window.dispatchEvent(new Event('pageshow')); window.dispatchEvent(new Event('focus')); document.dispatchEvent(new Event('visibilitychange')) })
      await page.waitForFunction(ids => { const have = JSON.parse(localStorage.getItem('tinct-lab-highlights') || '[]').filter(h => h.bookId === 'bible').map(h => h.id); return ids.every(id => have.includes(id)) && have.length === ids.length }, expectedMarks)
      await page.waitForFunction(ids => { const have = JSON.parse(localStorage.getItem('tinct:chat-history:bible') || '[]').map(c => c.id); return ids.every(id => have.includes(id)) }, expectedChats)
      assert.equal((await page.evaluate(id => JSON.parse(localStorage.getItem('tinct-lab-highlights')).find(h => h.id === id)?.color, oldB.id)), 'rose', label + ': the old tab\'s edit arrived')
      // The Notebook lists every highlight and every card or conversation, and not the deleted mark.
      const region = await notebook(page, isPhone)
      for (const id of expectedMarks) await region.getByTestId('contents-highlight-' + id).waitFor({ timeout: 10000 })
      for (const id of expectedChats) await region.getByTestId('contents-chat-' + id).waitFor({ timeout: 10000 })
      assert.equal(await region.getByTestId('contents-highlight-' + oldGone.id).count(), 0, label + ': the deleted mark is not in the Notebook')
      shown.push({ device: label, highlights: await region.locator('[data-testid^="contents-highlight-"]').count(), chats: await region.locator('[data-testid^="contents-chat-"]').count() })
      await page.screenshot({ path: path.join(out, `${name}-${label}-notebook.png`) })
      assert.deepEqual(page.errors, [], label + ': no page errors')
    }

    // 6. The old rows were never written by the reader; every reader write was one chapter row.
    assert(pageCommits().every(c => c.key !== H && c.key !== C), 'the reader never writes the old whole-book rows')
    assert(pageCommits().every(c => /^(lab-highlights|chat-history):bible:\d+$/.test(c.key) || !c.key.startsWith('lab-highlights:bible') && !c.key.startsWith('chat-history:bible')), 'reader writes go to chapter rows')
    assert(pageCommits().filter(c => /^(lab-highlights|chat-history):/.test(c.key)).every(c => c.expectedRev !== null), 'every highlight and chat commit carries an expected rev')
    assert.notEqual(JSON.stringify(account.get(H).value), oldRows[H], 'the old tab did write the old row (fixture sanity)')
    const sizes = (prefix, base) => ({ commits: pageCommits().filter(c => c.key.startsWith(prefix)).map(c => c.bytes), wholeBookRowBytes: Buffer.byteLength(JSON.stringify(prefix.startsWith('lab') ? { v: 1, highlights: bookMarks(account, base), deleted: [] } : bookChats(account, base))) })
    results.push({ engine: name, flushOnHideMs: flushMs, notebook: shown, highlightRows: account.book(H).map(r => r.key), chatRows: account.book(C).map(r => r.key), bytes: { highlights: sizes(H + ':', H), chat: sizes(C + ':', C) } })
  } catch (error) {
    for (let i = 0; i < contexts.length; i++) for (const page of contexts[i].pages()) await page.screenshot({ path: path.join(out, `${name}-${i}-failure.png`) }).catch(() => {})
    console.log(JSON.stringify({ engine: name, rows: [...account.rows.keys()], commits: account.commits.map(c => [c.who, c.key, c.expectedRev]) }))
    throw error
  } finally { await browser.close() }
}
fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(results, null, 2))
console.log(JSON.stringify(results, null, 1))
