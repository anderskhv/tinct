// Phone reader: returning to the book from Chat must land on the page the
// reader left, never an earlier page or the start of the chapter.
//   CI=1 npm run build && node scripts/check-chat-return-place.mjs
// Serves the local dist build in an isolated 390x844 headless context. No
// account, provider, synthesis or microphone calls: /api/* is mocked or 404,
// and audio is muted (or a silent stand-in).
// Knobs: TEST_BOOK, TEST_CHAPTER, TEST_EDITION, TEST_COMPARE_EDITION,
// TEST_TURNS, TEST_SAVED_PARAGRAPH/TEST_SAVED_WORD (open at a saved place),
// TEST_VIEWS=read,compare, TEST_AUDIO=none|paused|playing, TEST_COMPARE=0,
// TEST_REAL_PLAY=1, TEST_TRACE=1 / TEST_CONSOLE=1 (layout trace logs).
import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { createRequire } from 'node:module'
import esbuild from 'esbuild'

const origin = 'https://tinct.app'
const dist = path.resolve('dist')
const book = process.env.TEST_BOOK || 'to-the-lighthouse'
const chapter = Number(process.env.TEST_CHAPTER || 1)
const turns = Number(process.env.TEST_TURNS || 5)
const primaryEdition = process.env.TEST_EDITION || 'original-en'
const compareEdition = process.env.TEST_COMPARE_EDITION || 'modern-en'
// TEST_AUDIO: 'none' (audio never started), 'paused' (played, then paused), 'playing'.
const audioMode = process.env.TEST_AUDIO || 'none'
const narrationCore = (() => {
  const out = path.resolve('artifacts/chat-return-place')
  fs.mkdirSync(out, { recursive: true })
  esbuild.buildSync({ entryPoints: ['src/narration/narrationCore.ts'], bundle: true, platform: 'node', format: 'cjs', outfile: path.join(out, 'narration-core.cjs'), logLevel: 'silent' })
  return createRequire(import.meta.url)(path.join(out, 'narration-core.cjs'))
})()
const chapterText = n => JSON.parse(fs.readFileSync(`public/data/editions-chapters/${book}-${primaryEdition}/ch${String(n).padStart(4, '0')}.json`, 'utf8')).paragraphs
// Ready, silent fixture narration: two words a second, no synthesis.
function narrationFixture(body) {
  const paragraphs = chapterText(body.chapter)
  return {
    paragraphs: body.paragraphs.map(item => {
      const source = paragraphs[item.index], text = narrationCore.narrationTextForParagraph(source), tokens = text.split(' ')
      const timed = list => list.map((word, i) => ({ text: word, start: i / 2, end: (i + 1) / 2 }))
      const chunks = narrationCore.chunkNarrationText(source).map(chunk => ({ ...chunk, ready: true, hash: `${body.chapter}-${item.index}-${chunk.index}`,
        url: `${origin}/api/audio-file?fixture=${body.chapter}-${item.index}-${chunk.index}`, duration: (chunk.wordTo - chunk.wordFrom) / 2,
        words: timed(tokens.slice(chunk.wordFrom, chunk.wordTo)), timingsUsable: true }))
      return { paragraph: item.index, status: 'ready', textHash: crypto.createHash('sha256').update(text).digest('hex'), chunkCount: chunks.length, readyChunks: chunks.length, duration: tokens.length / 2, words: timed(tokens), timingsUsable: true, chunks }
    }),
  }
}
const executablePath = process.env.PW_CHROMIUM || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined)

async function boot(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, serviceWorkers: 'block', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1' })
  const page = await context.newPage()
  const errors = []
  page.setDefaultTimeout(15000)
  page.on('pageerror', e => errors.push(e.message))
  if (process.env.TEST_CONSOLE === '1') page.on('console', m => console.log('  console:', m.type(), m.text().slice(0, 300)))
  await page.route('**/*', async route => {
    const req = route.request(), url = new URL(req.url())
    if (['/api/chat', '/api/lab-chat'].includes(url.pathname) && req.method() === 'POST') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ content: [{ text: 'A short mocked reply.' }] }) })
    }
    if (url.pathname === '/api/lab-chapter-notes' && req.method() === 'POST') {
      return route.fulfill({ json: { beats: [{ title: 'Opening', text: 'A mocked beat of the chapter.' }, { title: 'Turn', text: 'A second mocked beat.' }] } })
    }
    if (url.pathname === '/api/narration/voices') return route.fulfill({ json: { enabled: true, provider: 'grok', model: 'grok-tts', voices: [{ key: 'f', label: 'Ara', persona: 'female' }, { key: 'm', label: 'Helios', persona: 'male' }] } })
    if (url.pathname === '/api/narration/ensure') {
      if (audioMode === 'none') return route.fulfill({ status: 401, json: { error: 'unauthenticated' } })
      return route.fulfill({ json: narrationFixture(req.postDataJSON()) })
    }
    if (url.pathname.startsWith('/api/')) return route.fulfill({ status: 404, body: '{}' })
    if (req.method() !== 'GET') return route.abort()
    if (url.origin === origin) {
      const name = url.pathname === '/reader' ? '/app.html' : url.pathname
      const file = path.resolve(dist, '.' + name)
      if (file.startsWith(dist + '/') && fs.existsSync(file) && fs.statSync(file).isFile()) return route.fulfill({ path: file })
      return route.abort()
    }
    return route.abort()
  })
  await page.addInitScript(({ book, chapter, compare, realPlay, fakeAudio, savedParagraph, savedWord, primaryEdition, compareEdition }) => {
    if (fakeAudio) {
      // A silent stand-in for the narration element: it plays and pauses but
      // never advances, so the listening place stays on the page it began on.
      class SilentAudio extends EventTarget {
        constructor() { super(); this.src = ''; this.currentTime = 0; this.duration = 100; this.paused = true; this.ended = false; this.playbackRate = 1; this.preload = 'auto'; this.muted = true }
        play() { this.paused = false; this.ended = false; queueMicrotask(() => { this.dispatchEvent(new Event('play')); this.dispatchEvent(new Event('playing')) }); return Promise.resolve() }
        pause() { if (!this.paused) { this.paused = true; queueMicrotask(() => this.dispatchEvent(new Event('pause'))) } }
        load() {}
        setAttribute() {}
        removeAttribute() { this.src = '' }
      }
      window.Audio = SilentAudio
    }
    localStorage.setItem('tinct:wipe-v1-done', '1')
    localStorage.setItem('tinct-lab-prefs', JSON.stringify({ primaryEdition, compareEdition, compareOpen: compare, voicePersona: 'female', voicePersonaChosen: true }))
    if (!sessionStorage.getItem('chat-return-booted')) {
      sessionStorage.setItem('chat-return-booted', '1')
      sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({ kind: 'open-reader', bookId: book, primaryEditionKey: primaryEdition, compareEditionKey: compareEdition, savedPlace: { bookId: book, chapterNumber: chapter, paragraphIndex: savedParagraph, wordIndex: savedWord, page: 0 } }))
    }
    if (!realPlay) HTMLMediaElement.prototype.play = async function () { this.muted = true }
    if (navigator.mediaDevices) Object.defineProperty(navigator.mediaDevices, 'getUserMedia', { configurable: true, value: async () => { throw Error('Microphone disabled') } })
  }, { book, chapter, compare: process.env.TEST_COMPARE !== '0', realPlay: process.env.TEST_REAL_PLAY === '1', fakeAudio: audioMode !== 'none', savedParagraph: Number(process.env.TEST_SAVED_PARAGRAPH || 0), savedWord: Number(process.env.TEST_SAVED_WORD || 0), primaryEdition, compareEdition })
  await page.goto(origin + '/reader' + (process.env.TEST_TRACE === '1' ? '?qaLayoutTrace=1' : ''), { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady === 'true', null, { timeout: 60000 })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(800)
  return { context, page, errors }
}

async function snapshot(page) {
  return page.evaluate(() => {
    const root = document.querySelector('[data-testid="lab-root"]')
    const wrap = document.querySelector('[data-testid="lab-page-wrap"]')
    const word = wrap?.querySelector('[data-testid="lab-word"]')
    return {
      chapter: root?.dataset.chapter,
      place: root?.dataset.place,
      firstWord: word ? `${word.dataset.paragraphIndex}:${word.dataset.wordIndex} ${word.textContent}` : null,
      progress: document.querySelector('[data-testid="lab-chapter-progress"]')?.textContent?.replace(/\s+/g, ' ').trim() ?? null,
    }
  })
}

async function turnForward(page, n) {
  for (let i = 0; i < n; i++) {
    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(350)
  }
  await page.waitForTimeout(500)
}

async function showControls(page) {
  if (await page.getByTestId('lab-super').isVisible()) return
  await page.touchscreen.tap(195, 420)
  await page.getByTestId('lab-super').waitFor({ state: 'visible', timeout: 3000 })
}

async function openChat(page) {
  await showControls(page)
  await page.getByTestId('lab-super').click()
  await page.getByTestId('lab-super-row-chat').click()
  await page.getByTestId('lab-ask-pane').waitFor()
  await page.waitForTimeout(400)
}

async function openAskAbout(page) {
  const word = page.locator('[data-testid="lab-reading-stage"] .lab-hearing-word').nth(8)
  const box = await word.boundingBox()
  const at = { pointerType: 'touch', clientX: box.x + box.width / 2, clientY: box.y + box.height / 2, bubbles: true }
  await word.dispatchEvent('pointerdown', { pointerId: 7, ...at })
  await page.waitForTimeout(450)
  await word.dispatchEvent('pointerup', { pointerId: 7, ...at })
  await page.locator('.selection-popup').waitFor()
  const more = page.getByRole('button', { name: 'More actions', exact: true })
  if (await more.isVisible()) await more.click()
  await page.locator('.popup-menu-action', { hasText: /^Ask$/ }).click()
  await page.getByTestId('lab-ask-pane').waitFor()
  await page.waitForTimeout(400)
}

async function openSummarizeChat(page) {
  await showControls(page)
  await page.getByTestId('lab-super').click()
  await page.getByTestId('lab-super-row-summarize').click()
  await page.getByTestId('lab-chapter-notes-beat').first().waitFor()
  await page.getByTestId('lab-chapter-notes-chat').click()
  await page.getByTestId('lab-ask-pane').waitFor()
  await page.waitForTimeout(400)
}

const entries = { menu: openChat, 'ask-about-selection': openAskAbout, 'summarize-chat': openSummarizeChat }
const returns = {
  done: async page => page.getByTestId('lab-ask-done').click(),
  escape: async page => page.keyboard.press('Escape'),
  'done-after-send': async page => {
    await page.getByTestId('lab-ask-input').fill('What is happening here?')
    await page.getByTestId('lab-ask-send').click()
    await page.getByTestId('lab-ask-turn-assistant').waitFor()
    await page.waitForTimeout(300)
    await page.getByTestId('lab-ask-done').click()
  },
}

const browser = await chromium.launch({ executablePath, args: ['--mute-audio'] })
const results = []
let failed = false
try {
  // Read, and Compare (swiped to the other edition). Every Chat entry point
  // returns by "Back to book"; the menu entry also by Escape and after a reply.
  const views = process.env.TEST_VIEWS ? process.env.TEST_VIEWS.split(',') : ['read', 'compare']
  const cases = views.flatMap(view => Object.entries(entries).flatMap(([entry, open]) => Object.entries(returns)
    .filter(([back]) => entry === 'menu' || back === 'done')
    .map(([back, close]) => [`${view}/${entry}/${back}`, view, open, close])))
  for (const [name, view, open, close] of cases) {
    const { context, page, errors } = await boot(browser)
    try {
      if (view === 'compare') {
        await page.getByTestId('lab-book').evaluate(el => {
          el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 71, pointerType: 'touch', clientX: 190, clientY: 400 }))
          el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 71, pointerType: 'touch', clientX: 190, clientY: 270 }))
        })
        await page.waitForTimeout(1500)
      }
      await turnForward(page, turns)
      if (audioMode !== 'none') {
        await page.getByTestId('lab-v2-play').click()
        await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.playing === 'true', null, { timeout: 10000 })
        await page.waitForTimeout(1200)
        if (audioMode === 'paused') {
          await showControls(page)
          await page.getByTestId('lab-v2-play').click()
          await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.playing === 'false')
          await page.waitForTimeout(800)
        }
      }
      const before = await snapshot(page)
      assert.ok(before.firstWord && (turns === 0 || !before.firstWord.startsWith('0:0 ')), `turned past the opening page (${JSON.stringify(before)})`)
      await open(page)
      await close(page)
      await page.getByTestId('lab-ask-pane').waitFor({ state: 'detached' })
      await page.waitForFunction(() => document.querySelector('[data-testid="lab-page-wrap"] [data-testid="lab-word"]'))
      await page.waitForTimeout(1200)
      const after = await snapshot(page)
      // Audio that was playing resumes, by design, from the first word of the
      // sentence it was in (which may begin on the previous page); the page
      // follows it there. Never further back, and never the chapter start.
      const pageOf = snap => Number(String(snap.progress).match(/^(\d+)/)?.[1])
      const pass = audioMode === 'playing'
        ? after.chapter === before.chapter && pageOf(after) >= pageOf(before) - 1 && pageOf(after) > 1
        : before.firstWord === after.firstWord && before.place === after.place && before.progress === after.progress
      if (!pass) failed = true
      results.push({ case: name, pass, before, after, errors })
      console.log(JSON.stringify({ case: name, audio: audioMode, pass, before, after, errors }))
    } finally {
      await context.close()
    }
  }
} finally {
  await browser.close()
}
if (failed) {
  console.error('FAIL: returning from Chat moved the reader')
  process.exitCode = 1
} else console.log(`PASS: ${results.length} Chat returns kept the page`)
