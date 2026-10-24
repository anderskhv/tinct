// Capture reviewed private reader chrome from an immutable built directory.
// All browser API/provider requests are mocked; only loopback static files load.
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import fs from 'node:fs/promises'
import path from 'node:path'
import { chromium } from '@playwright/test'
import { markInternal } from './lib/internalTraffic.cjs'

const dist = path.resolve(process.env.SHARED_VISUAL_DIST || 'dist')
const prefix = process.env.SHARED_VISUAL_PREFIX || 'shared-reader'
const out = path.resolve('../docs/assets/shared-reader-2026-10-23')
const mime = file => ({ '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.wasm': 'application/wasm' }[path.extname(file)] || 'application/octet-stream')
await fs.mkdir(out, { recursive: true })
const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', 'http://127.0.0.1')
  const pathname = url.pathname === '/reader' ? '/app.html' : url.pathname === '/library' ? '/lab/library_2/index.html' : url.pathname
  const file = path.resolve(dist, '.' + pathname)
  if (!file.startsWith(dist + path.sep)) { res.writeHead(403); res.end(); return }
  try { const body = await fs.readFile(file); res.writeHead(200, { 'Content-Type': mime(file) }); res.end(body) }
  catch { res.writeHead(404); res.end() }
})
server.on('connect', (_req, socket) => socket.end('HTTP/1.1 403 Forbidden\r\n\r\n'))
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const origin = `http://127.0.0.1:${server.address().port}`
try {
  // Run the existing keyboard/selection fixture against these exact built bytes.
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['scripts/check-shared-reader-menu.mjs'], { env: { ...process.env, TINCT_ORIGIN: origin }, stdio: 'inherit' })
    child.on('error', reject); child.on('exit', code => code === 0 ? resolve() : reject(new Error(`menu fixture exit ${code}`)))
  })
  const browser = await markInternal(await chromium.launch({ headless: true, proxy: { server: origin }, args: ['--mute-audio', '--no-sandbox'] }))
  try {
    for (const theme of ['light', 'book', 'dark']) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' })
      try {
        const page = await context.newPage(), denied = [], errors = []
        page.on('pageerror', error => errors.push(error.message))
        await page.route('**/*', route => {
          const url = new URL(route.request().url())
          if (url.origin !== origin) { denied.push(url.origin); return route.abort() }
          if (url.pathname.startsWith('/api/')) return route.fulfill({ status: 404, contentType: 'application/json', body: '{}' })
          return route.continue()
        })
        await page.addInitScript(value => localStorage.setItem('tinct-lab-prefs', JSON.stringify({ fontFamily: 'garamond', fontSize: 1, fontSizeExplicit: true, theme: value, compareOpen: false })), theme)
        await page.goto(`${origin}/reader?book=frankenstein&sharedReader=1`, { waitUntil: 'domcontentloaded' })
        await page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true', null, { timeout: 45000 })
        await page.evaluate(() => document.fonts.ready)
        if (await page.getByTestId('lab-chapter-cover').isVisible().catch(() => false)) await page.keyboard.press('ArrowRight')
        await page.getByTestId('lab-super').click()
        await page.getByRole('menu', { name: /menu/i }).waitFor().catch(() => {})
        assert.equal(await page.locator('.lab').getAttribute('data-shared-reader'), 'true')
        assert.deepEqual(denied, []); assert.deepEqual(errors, [])
        await page.screenshot({ path: path.join(out, `${prefix}-desktop-${theme}-reader-menu-1440x900.png`) })
      } finally { await context.close() }
    }
  } finally { await browser.close() }
  const menu = path.resolve('artifacts/shared-reader-menu')
  for (const theme of ['light', 'book', 'dark']) {
    await fs.copyFile(path.join(menu, `desktop-${theme}.png`), path.join(out, `${prefix}-desktop-${theme}-selection-1440x900.png`))
  }
  await fs.copyFile(path.join(menu, 'phone-book.png'), path.join(out, `${prefix}-phone-book-selection-390x844.png`))
  console.log(`${prefix} visual captures saved under ${out}`)
} finally { await new Promise(resolve => server.close(resolve)) }
