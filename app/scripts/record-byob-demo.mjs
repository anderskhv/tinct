// The /byob recording of the margin reader (Anders, 4 Nov 2026: "make one using my examples"; the
// highlight and typing should be perfect). Plays Anders's own take as a script against the built
// reader (dist/): The Republic, Book 1, in the dark paper and the Margin view; the opening
// sentence selected in one sweep, "why does he open like this?" asked, then "The servant took
// hold of me by the cloak behind…" explained. The answers are the ones Tinct gave in his
// recording, streamed here word by word: no AI request is made.
//
// Run after `npm run build` from app/: node scripts/record-byob-demo.mjs <out-dir>
// It writes <out-dir>/raw.webm (1440x900); ffmpeg makes public/media/byob-margin.{mp4,jpg}.
import { chromium } from '@playwright/test'
import { createServer } from 'node:http'
import fs from 'node:fs/promises'
import path from 'node:path'

const DIST = path.resolve('dist')
const OUT = path.resolve(process.argv[2] || 'artifacts/byob-demo')
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.wasm': 'application/wasm' }

const ASK = 'why does he open like this?'
const ANSWERS = {
  ask: "Plato opens with Socrates descending to the Piraeus for a religious festival because the whole dialogue is staged as a kind of descent and return — a structural echo that becomes explicit later in Book 10's image of the soul's journey, and most famously in the cave allegory of Book 7, where the philosopher must go back down among people still watching shadows. The Piraeus is literally \"down\" from Athens; Socrates goes down, gets detained, and the detention itself becomes the occasion for the whole inquiry into justice.\n\nThe festival detail matters too: Bendis, a Thracian goddess newly admitted into Athenian worship, signals a city encountering something foreign and new, mirroring the dialogue's own work of examining inherited opinions (Cephalus's conventional piety, Simonides's maxims) under fresh questioning. Starting with a \"new thing\" being celebrated primes the reader for old definitions of justice being tested and found wanting. It's a quiet, realistic opening — ordinary piety and civic life — before Socrates turns it into relentless philosophical pressure.",
  explain: "Socrates is being physically detained by a servant to prevent his departure from the Piraeus.\n\nThe servant's action is both polite and insistent. By taking Socrates' cloak, he creates a gentle but unmistakable barrier to leaving—Socrates cannot walk away without acknowledging the summons or breaking free. This detail matters because it sets up the entire dialogue: Socrates will stay, and the conversation about justice that follows will emerge not from his intention but from Polemarchus's insistence.\n\nThe passage also establishes the social dynamics at work. Polemarchus sends his servant rather than calling out himself, which suggests both courtesy and social rank—a man of means delegates the task of summoning someone of apparent status. Socrates accepts the delay without resistance, showing willingness to engage with those who seek him out.",
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

function serve() {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://local')
    if (/\/api\/(?:lab-chat|chat)$/.test(url.pathname)) {
      let body = ''
      for await (const chunk of req) body += chunk
      const answer = body.includes(ASK) ? ANSWERS.ask : ANSWERS.explain
      res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-store' })
      await sleep(700)
      for (const piece of answer.match(/\S+\s*/g)) {
        res.write(`data: ${JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text: piece } })}\n\n`)
        await sleep(22)
      }
      res.end('data: {"type":"message_stop"}\n\n')
      return
    }
    if (url.pathname.startsWith('/api/')) { res.writeHead(404, { 'content-type': 'application/json' }); res.end('{}'); return }
    let pathname = decodeURIComponent(url.pathname)
    if (pathname === '/reader' || pathname === '/qa-seed') pathname = '/app.html'
    const file = path.join(DIST, path.normalize(pathname))
    try {
      if (!file.startsWith(DIST + path.sep) || !(await fs.stat(file)).isFile()) throw new Error('missing')
      res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' })
      res.end(await fs.readFile(file))
    } catch { res.writeHead(404); res.end() }
  })
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)))
}

// Headless Chromium paints no pointer: an arrow (an I-beam over text) drawn where the mouse is.
const CURSOR = () => {
  const draw = () => {
    const el = document.createElement('div')
    el.id = '__demo_cursor'
    el.style.cssText = 'position:fixed;left:0;top:0;width:22px;height:22px;z-index:2147483647;pointer-events:none;transform:translate(-100px,-100px)'
    const arrow = '<svg width="22" height="22" viewBox="0 0 22 22"><path d="M3 2l14 9-6.2 1.2L14 19l-2.6 1.2-3.2-6.8L3 18z" fill="#fff" stroke="#111" stroke-width="1.2" stroke-linejoin="round"/></svg>'
    const beam = '<svg width="22" height="22" viewBox="0 0 22 22"><path d="M8 3h2.5c.9 0 1.5.5 1.5 1.5V17.5c0 1 .6 1.5 1.5 1.5H16M14 3h-2.5c-.9 0-1.5.5-1.5 1.5V17.5c0 1-.6 1.5-1.5 1.5H6" fill="none" stroke="#111" stroke-width="3"/><path d="M8 3h2.5c.9 0 1.5.5 1.5 1.5V17.5c0 1 .6 1.5 1.5 1.5H16M14 3h-2.5c-.9 0-1.5.5-1.5 1.5V17.5c0 1-.6 1.5-1.5 1.5H6" fill="none" stroke="#fff" stroke-width="1.3"/></svg>'
    el.innerHTML = arrow
    document.documentElement.append(el)
    addEventListener('mousemove', event => {
      const overText = event.target?.closest?.('[data-testid="lab-word"], .lab-hearing-line')
      const want = overText ? 'beam' : 'arrow'
      if (el.dataset.kind !== want) { el.dataset.kind = want; el.innerHTML = want === 'beam' ? beam : arrow }
      el.style.transform = want === 'beam' ? `translate(${event.clientX - 11}px,${event.clientY - 11}px)` : `translate(${event.clientX - 3}px,${event.clientY - 2}px)`
    }, { capture: true, passive: true })
  }
  if (document.documentElement) draw(); else addEventListener('DOMContentLoaded', draw)
}

let at = { x: 720, y: 450 }
const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
/** The mouse glides to (x, y) over `ms`, eased, one move per frame. */
async function glide(page, x, y, ms = 650) {
  const from = at, frames = Math.max(8, Math.round(ms / 16))
  for (let i = 1; i <= frames; i++) {
    const k = ease(i / frames)
    await page.mouse.move(from.x + (x - from.x) * k, from.y + (y - from.y) * k)
    await sleep(ms / frames)
  }
  at = { x, y }
}

/** The words of the paragraph `p` (0-based among the reading lines) from `first` to `last` (inclusive, by text). */
const span = (page, p, first, last) => page.evaluate(({ p, first, last }) => {
  const line = document.querySelectorAll('[data-testid="continuous-reader"] .lab-hearing-line')[p]
  const words = [...line.querySelectorAll('[data-testid="lab-word"]')]
  const clean = w => w.textContent.replace(/[^\p{L}\p{N}]/gu, '')
  const start = words.findIndex(w => clean(w) === first)
  let end = -1
  for (let i = start; i < words.length; i++) if (clean(words[i]) === last) { end = i; break }
  const a = words[start].getBoundingClientRect(), b = words[end].getBoundingClientRect()
  return { from: { x: a.left + 1, y: a.top + a.height / 2 }, to: { x: b.right - 1, y: b.top + b.height / 2 } }
}, { p, first, last })

/** A selection as a reader makes it: press, one steady sweep along the lines, release. */
async function sweep(page, { from, to }) {
  await glide(page, from.x, from.y, 700)
  await sleep(250)
  await page.mouse.down()
  const frames = 70
  for (let i = 1; i <= frames; i++) {
    const k = ease(i / frames)
    await page.mouse.move(from.x + (to.x - from.x) * k, from.y + (to.y - from.y) * k)
    await sleep(16)
  }
  at = to
  await sleep(120)
  await page.mouse.up()
  await page.getByTestId('lab-desk-bar').waitFor({ timeout: 5000 })
}

async function clickOn(page, locator) {
  const box = await locator.boundingBox()
  await glide(page, box.x + box.width / 2, box.y + box.height / 2, 600)
  await sleep(180)
  await page.mouse.down(); await sleep(70); await page.mouse.up()
}

async function main() {
  await fs.mkdir(OUT, { recursive: true })
  const server = await serve(), origin = `http://127.0.0.1:${server.address().port}`
  const browser = await chromium.launch({ args: ['--mute-audio'] })
  const viewport = { width: 1440, height: 900 }
  // A first context loads the reader once (fonts, the book), unrecorded.
  const context = await browser.newContext({ viewport, colorScheme: 'dark', serviceWorkers: 'block', recordVideo: { dir: OUT, size: viewport } })
  await context.addInitScript(CURSOR)
  await context.addInitScript(() => { try { localStorage.setItem('tinct-lab-prefs', JSON.stringify({ theme: 'dark', primaryEdition: 'original-en' })) } catch {} })
  const page = await context.newPage()
  const started = Date.now()
  await page.goto(`${origin}/reader?book=the-republic&chapter=1&paragraph=0&word=0&edition=original-en&sharedReader=1&layout=desktop&view=margin`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady === 'true'
    && document.querySelectorAll('[data-testid="continuous-reader"] [data-testid="lab-word"]').length > 40, null, { timeout: 60000 })
  await page.evaluate(() => document.fonts.ready)
  await sleep(1500)
  const loaded = (Date.now() - started) / 1000
  await page.mouse.move(at.x, at.y)
  await sleep(900)

  // 1. Ask about the opening sentence.
  await sweep(page, await span(page, 0, 'I', 'thing'))
  await sleep(500)
  await clickOn(page, page.getByTestId('lab-dbar-ask'))
  const field = page.getByTestId('lab-dbar-ask-field')
  await field.waitFor()
  { const box = await field.boundingBox(); await glide(page, 1130, box.y + box.height + 120, 600) }
  await sleep(250)
  for (const ch of ASK) { await page.keyboard.type(ch); await sleep(ch === ' ' ? 95 : 62 + ((ch.charCodeAt(0) * 7) % 30)) }
  await sleep(450)
  await page.keyboard.press('Enter')
  await page.locator('[data-testid="source-margin-item"][data-open="true"]').getByText('relentless philosophical pressure', { exact: false }).waitFor({ timeout: 60000 })
  await glide(page, 1180, 760, 900)
  await sleep(2600)

  // 2. Explain the servant's grip.
  await sweep(page, await span(page, 0, 'The', 'wait'))
  await sleep(450)
  await clickOn(page, page.getByTestId('lab-desk-bar').getByRole('button', { name: /^Explain$/ }))
  await page.locator('[data-testid="source-margin-item"][data-open="true"]').getByText('those who seek him out', { exact: false }).waitFor({ timeout: 60000 })
  await glide(page, 760, 820, 900)
  await sleep(3200)

  const video = page.video()
  await context.close()
  await fs.rename(await video.path(), path.join(OUT, 'raw.webm'))
  await fs.writeFile(path.join(OUT, 'start.txt'), `${(loaded + 0.9).toFixed(2)}\n`)
  await browser.close()
  server.close()
  console.log(`raw.webm written; the take starts at ${(loaded + 0.6).toFixed(2)} s`)
}

await main()
