// Built production bridges, isolated Chromium/WebKit devices, synthetic account only.
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import fs from 'node:fs/promises'
import path from 'node:path'
import { chromium, webkit } from '@playwright/test'
const dist = path.resolve('dist'), hex = 'd'.repeat(24), id = `userbook-${hex}`, owner = 'shelf-owner'
const assets = await fs.readdir(path.join(dist, 'assets'))
let ref
for (const file of assets.filter(f => f.endsWith('.js'))) {
  ref = /https:\/\/([a-z0-9]+)\.supabase\.co/.exec(await fs.readFile(path.join(dist, 'assets', file), 'utf8'))?.[1]
  if (ref) break
}
assert(ref, 'built auth project')
const rows = new Map(), requests = [], external = []
let present = true
const mime = { '.js': 'text/javascript', '.html': 'text/html', '.json': 'application/json', '.css': 'text/css' }
const server = createServer(async (req, res) => {
  const p = new URL(req.url, 'http://localhost').pathname
  const json = value => { res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify(value)) }
  if (p === '/fixture') { res.writeHead(200, { 'content-type': 'text/html' }); res.end('<!doctype html><title>Isolated shelf test</title>'); return }
  if (p === '/api/user-books') return json({ books: present ? [{ id: 'e'.repeat(32), type: 'pdf', sha256: hex + '0'.repeat(40), name: 'Synthetic.pdf', title: 'Synthetic PDF', createdAt: '2026-10-01T00:00:00Z' }] : [] })
  if (p === '/api/user-books/places') return json({ places: {} })
  if (p.startsWith('/api/')) return json({ cover: null, places: {} })
  const file = path.resolve(dist, '.' + p)
  if (!file.startsWith(dist + path.sep)) { res.writeHead(403).end(); return }
  try { const data = await fs.readFile(file); res.writeHead(200, { 'content-type': mime[path.extname(file)] || 'application/octet-stream' }); res.end(data) }
  catch { res.writeHead(404).end() }
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const origin = `http://127.0.0.1:${server.address().port}`
async function device(engine) {
  const browser = await engine.launch({ headless: true, ...(engine === chromium ? { args: ['--mute-audio'] } : {}) })
  const context = await browser.newContext({ serviceWorkers: 'block' })
  await context.route(url => url.origin !== origin, async route => {
    const req = route.request(), url = new URL(req.url())
    if (url.hostname !== `${ref}.supabase.co`) { external.push(req.url()); return route.abort() }
    let result = []
    if (url.pathname.endsWith('/rpc/commit_user_data')) {
      const p = req.postDataJSON(); requests.push(p)
      assert.equal(p.p_user_id, owner)
      const prior = rows.get(p.p_key)
      if ((prior?.rev ?? null) !== p.p_expected_rev) result = [{ ...prior, applied: false }]
      else { const row = { key: p.p_key, value: p.p_value, rev: (prior?.rev ?? 0) + 1, updated_at: new Date().toISOString() }; rows.set(p.p_key, row); result = [{ ...row, applied: true }] }
    } else if (url.pathname.endsWith('/user_data')) result = [...rows.values()]
    else if (url.pathname.endsWith('/user')) result = { id: owner, aud: 'authenticated' }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(result) })
  })
  const page = await context.newPage()
  await page.goto(origin + '/fixture')
  await page.evaluate(async ({ ref, owner, hex }) => {
    localStorage.setItem(`sb-${ref}-auth-token`, JSON.stringify({ access_token: 'synthetic-token', refresh_token: 'synthetic-refresh', expires_at: Math.floor(Date.now()/1000)+3600, token_type: 'bearer', user: { id: owner, aud: 'authenticated' } }))
    localStorage.setItem(`tinct-addbook:pos:pdf:${hex}`, JSON.stringify({ page: 14, frac: .37, at: Date.now()-10000, pages: 100, zoom: 1.25 }))
    await new Promise((resolve, reject) => {
      const open = indexedDB.open('tinct-addbook', 1)
      open.onupgradeneeded = () => open.result.createObjectStore('books', { keyPath: 'key' })
      open.onerror = () => reject(open.error)
      open.onsuccess = () => { const db = open.result, tx = db.transaction('books', 'readwrite'); tx.objectStore('books').put({ key: `pdf:${hex}`, kind: 'pdf', owner, cloudId: 'e'.repeat(32), name: 'Synthetic.pdf', title: 'Synthetic PDF', pages: 100 }); tx.oncomplete = () => { db.close(); resolve() }; tx.onerror = () => reject(tx.error) }
    })
  }, { ref, owner, hex })
  return { page, browser }
}
const list = page => page.evaluate(async () => { await import('/lab/library-add.js'); return window.__tinctLibraryAdd.ownBooks() })
try {
  const a = await device(chromium), b = await device(webkit)
  try {
    assert.equal((await list(a.page))[0].readingAt > 0, true)
    assert.equal((await list(b.page))[0].readingAt > 0, true)
    const place = await b.page.evaluate(hex => localStorage.getItem(`tinct-addbook:pos:pdf:${hex}`), hex)
    await a.page.evaluate(async id => { await import('/lab/library-2-reading.js'); return window.__tinctLibraryTwoReading.hideFromReadingNow(id) }, id)
    let books = await list(b.page)
    assert.equal(books[0].readingAt, null); assert(books[0].savedAt > 0)
    await b.page.evaluate(async id => { await import('/lab/library-2-reading.js'); return window.__tinctLibraryTwoReading.hideFromReadingNow(id, { saved: false }) }, id)
    books = await list(a.page)
    assert.equal(books[0].readingAt, null); assert.equal(books[0].savedAt, null)
    assert.equal(await b.page.evaluate(hex => localStorage.getItem(`tinct-addbook:pos:pdf:${hex}`), hex), place)
    await a.page.reload()
    assert.equal((await list(a.page))[0].readingAt, null)
    // Deletion is separate: only the verified uploaded copy is reconciled away.
    present = false
    assert.equal((await list(a.page)).length, 0); assert.equal((await list(b.page)).length, 0)
    assert.equal(external.length, 0)
    console.log(JSON.stringify({ pass: true, devices: ['Chromium', 'WebKit'], checked: ['read later', 'remove from reading', 'exact place preserved', 'reload', 'account deletion convergence'], writes: requests.length, external }))
  } finally { await a.browser.close(); await b.browser.close() }
} finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)) }
