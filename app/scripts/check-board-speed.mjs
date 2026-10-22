#!/usr/bin/env node
// The Leaderboard, the You card and readers' profiles, measured (21 Oct 2026: "We want stable
// leaderboards … buttons that respond instantaneously"). Local only: the built dist/ is served by a
// small server on 127.0.0.1 with every Worker route the cards read mocked here (shapes as
// src/worker/routes/social.ts and profiles.ts answer them), Supabase's auth answered in the
// browser, and every other origin refused. Nothing reaches production; no test account is needed.
//
//   CI=1 npm run build && node scripts/check-board-speed.mjs
//   ENGINES=chromium PORT=5981 node scripts/check-board-speed.mjs
//
// Chromium runs as an iPhone 13 with 4x CPU throttling; WebKit as an iPhone 13 (no CPU throttling
// there). Each engine, in a fresh context:
//   cold     the library just loaded, nothing cached; tap the picture, then Leaderboard
//   reopen   the cards closed and opened again on the same page
//   revisit  the library opened again (HTTP cache and this device's storage kept)
//   quick    a cold start: the library opened again and the picture tapped as soon as it is there,
//            before the idle warm-up has read anything, with the board answering 3 s late
//            (QUICK_BOARD_EXTRA; 22 Oct 2026: the board kept on the device)
// and measures, from the tap (in-page, per frame):
//   - time to the You card, its name, its rank, and to the first and the final leaderboard rows;
//   - jumps: an element already on screen moving inside its card, the sheet resizing, a painted
//     avatar going blank (flicker), and the numbers a row showed on the way (wrong or zero values);
//     Chromium's layout-shift total as well (it leaves out shifts within 0.5 s of a tap);
//   - avatar bytes against the size they are drawn at, their Cache-Control, and which avatars were
//     downloaded again on reopen and on a revisit (the server's own log);
//   - the Worker requests after each tap and how many waves they form (a wave starts only after a
//     request before it has ended: a sequential chain);
//   - tap-to-response for every Leaderboard and profile button (first meaningful change on screen);
//   - time to open another reader's profile and its figures;
//   - stats agreement: You card, Your reading, your board row and rank, and another reader's board
//     row against their profile.
// The Worker latencies are synthetic (LATENCY_* below, scaled by LATENCY_SCALE), so the numbers
// show what the browser waits for and in which order, not production server time.
// Prints a summary and writes OUT/board-speed.json. Exit 1 only on a broken run, not on slow numbers.
import { chromium, webkit, devices } from 'playwright'
import http2 from 'node:http2'
import { execFileSync } from 'node:child_process'
import { createReadStream, existsSync, mkdirSync, statSync, readFileSync, writeFileSync } from 'node:fs'
import { extname, join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { staticCacheControl } from '../src/worker/lib/staticCache.ts'

const here = dirname(fileURLToPath(import.meta.url))
const DIST = resolve(process.env.DIST || join(here, '..', 'dist'))
const PORT = Number(process.env.PORT || 5980)
if (PORT < 5980 || PORT > 5989) throw new Error('PORT must be 5980-5989')
const ORIGIN = `https://127.0.0.1:${PORT}`
const OUT = resolve(process.env.OUT || join(here, '..', 'artifacts', 'board-speed'))
const ENGINES = (process.env.ENGINES || 'chromium,webkit').split(',').filter(Boolean)
const SCALE = Number(process.env.LATENCY_SCALE || 1)
const LATENCY = {
  '/api/profile': 200, '/api/reading-time': 250, '/api/reading-time/flush': 200, '/api/reading-time/status': 50,
  '/api/lab-position': 200, '/api/social/board': 450, '/api/social/rank': 450, '/api/social/find': 350,
  '/api/social/profile': 400, '/api/social/follow': 250, '/api/social/unfollow': 250, '/api/social/remove-follower': 250,
  '/api/social/blocked': 150, '/api/profile/image': 150, '/api/subscription-info': 150, '/api/ai-allowance': 150,
}
const SUPABASE_REF = 'yazjyiqsxjystvpkyouk'
const USER_ID = '11111111-1111-4111-8111-111111111111'
if (!existsSync(join(DIST, 'lab', 'library_2', 'index.html'))) throw new Error(`no built library in ${DIST}: run CI=1 npm run build first`)
mkdirSync(OUT, { recursive: true })

// ===== Mocked data =====

const pad = n => String(n).padStart(2, '0')
const localDay = (offset = 0) => { const d = new Date(Date.now() - offset * 86_400_000); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` }
/** The Worker's formatDuration (src/readingTime/model.ts), which the profile route answers with. */
function formatDuration(total) {
  const minutes = Math.floor(Math.max(0, Math.floor(total)) / 60), hours = Math.floor(minutes / 60), m = minutes % 60
  if (hours === 0) return `${m} m`
  if (hours >= 10) return `${hours} h`
  return m ? `${hours} h ${m} m` : `${hours} h`
}
const ASSETS = '/lab/library_2/assets'
const PHOTO_V = 'abcdef1234'
const pic = { initial: initial => ({ src: null, pos: '50% 50%', cover: false, private: false, initial }) }
const set = (cover, pos, initial) => ({ src: `${ASSETS}/${cover}.jpg`, pos, cover: true, private: false, initial })
const coverPic = (id, initial) => ({ src: `${ASSETS}/${id}.jpg`, pos: '50% 38%', cover: true, private: false, initial })
const photo = (id, initial) => ({ src: `/api/profile/image?user=${id}&slot=picture&v=${PHOTO_V}`, pos: '50% 50%', cover: false, private: true, initial })
// The viewer's ledger: 2 h 05 m over the last 7 days (the Worker's board reads the same rows).
const OWN_ROWS = [{ day: localDay(0), bookId: 'frankenstein', read: 2700, listen: 0 }, { day: localDay(1), bookId: 'frankenstein', read: 3600, listen: 0 }, { day: localDay(2), bookId: 'odyssey', read: 1200, listen: 0 }, { day: localDay(20), bookId: 'odyssey', read: 5400, listen: 0 }]
const OWN_SECONDS = 2700 + 3600 + 1200
const READERS = [
  { handle: 'karl', name: 'Karl Ny', seconds: 12 * 3600 + 34 * 60, picture: coverPic('niels-lyhne', 'K'), friend: true },
  { handle: 'ellen', name: 'Ellen Ravn', seconds: 9 * 3600 + 5 * 60, picture: photo('22222222-2222-4222-8222-222222222222', 'E'), friend: true },
  { handle: 'maria', name: 'Maria Holm', seconds: 4 * 3600 + 40 * 60, picture: coverPic('frankenstein', 'M'), friend: true },
  { handle: 'sofie', name: 'Sofie Dahl', seconds: 3 * 3600 + 2 * 60, picture: set('odyssey', '30% 60%', 'S'), friend: true },
  { handle: 'jon', name: 'Jon Berg', seconds: 95 * 60, picture: pic.initial('J'), friend: true },
  { handle: 'per', name: 'Per Vik', seconds: 50 * 60, picture: coverPic('notes-from-underground', 'P'), friend: true },
  { handle: 'lise', name: 'Lise Kro', seconds: 20 * 60, picture: set('the-prince', '40% 55%', 'L'), friend: true },
  { handle: 'ida', name: 'Ida Lund', seconds: 15 * 3600, picture: coverPic('the-awakening', 'I'), friend: false },
  { handle: 'ole', name: 'Ole Sand', seconds: 7 * 3600, picture: coverPic('candide', 'O'), friend: false },
  { handle: 'eva', name: 'Eva Strand', seconds: 6 * 3600 + 1 * 60, picture: set('crime-and-punishment', '50% 38%', 'E'), friend: false },
  { handle: 'tor', name: 'Tor Mo', seconds: 2 * 3600, picture: coverPic('jane-eyre', 'T'), friend: false },
]
const ME_PICTURE = set('meditations', '50% 34%', 'A')
function board(tab) {
  const rows = READERS.filter(r => tab === 'everyone' || r.friend).map(r => ({ name: r.name, picture: r.picture, seconds: r.seconds, me: false, handle: r.handle }))
  rows.push({ name: 'You', picture: ME_PICTURE, seconds: OWN_SECONDS, me: true })
  rows.sort((a, b) => b.seconds - a.seconds || a.name.localeCompare(b.name))
  const entries = rows.map((row, i) => ({ rank: i + 1, ...row, duration: formatDuration(row.seconds) }))
  const end = localDay(0)
  return { tab, window: { start: localDay(6), end }, refreshedAt: new Date().toISOString(), total: entries.length, me: entries.find(e => e.me), meShown: true, friends: READERS.filter(r => r.friend).length, everyoneOpen: true, entries }
}
const ownProfile = () => ({
  handle: 'anders', link: 'tinct.app/@anders', name: 'Anders', picture: { kind: 'set', value: 'stoic', url: null, review: 'none' },
  background: { kind: 'set', value: 'stoic', url: null, review: 'none' }, visibility: 'friends', effectiveVisibility: 'friends',
  showReading: true, showTime: true, onLeaderboard: true, newBooksOpenIn: 'modern', setUp: true, needsSetup: false, shouldPrompt: false,
  emailConfirmed: true, emailOptIn: false, googlePhoto: false, uploads: false,
})
const relations = new Map(READERS.map(r => [r.handle, r.friend ? 'friend' : 'stranger']))
relations.set('nora', 'followed')
function readerProfile(handle) {
  const r = READERS.find(x => x.handle === handle) ?? { handle, name: 'Nora Lund', seconds: 3600, picture: pic.initial('N') }
  const year = r.seconds * 9
  return {
    handle, name: r.name, link: `tinct.app/@${handle}`, picture: r.picture, banner: { src: `${ASSETS}/room-odyssey-phone.jpg`, private: false },
    relation: relations.get(handle) ?? 'stranger', followsYou: true, limited: false,
    // Strings as the Worker's buildProfile writes them; seconds as well (read by a client that knows them).
    time: { last7: formatDuration(r.seconds), year: formatDuration(year), last7Seconds: r.seconds, yearSeconds: year },
    readingNow: [{ bookId: 'odyssey', title: 'The Odyssey', cover: null, progress: 'chapter 4', hours: '3 h' }],
    finished: [{ bookId: 'frankenstein', title: 'Frankenstein', cover: null, progress: null, hours: '6 h' }, { bookId: 'candide', title: 'Candide', cover: null, progress: null, hours: '2 h' }],
  }
}
const PHOTO = await sharp({ create: { width: 512, height: 512, channels: 3, background: { r: 120, g: 90, b: 70 } } }).composite([{ input: Buffer.from('<svg width="512" height="512"><circle cx="256" cy="200" r="120" fill="#d9b48f"/><rect x="96" y="340" width="320" height="200" rx="120" fill="#335"/></svg>') }]).jpeg({ quality: 86 }).toBuffer()

// ===== The server =====

/** Supabase, answered locally: auth says the stored session is good; table reads have no rows. */
function supabaseAnswer(path) {
  if (path === '/auth/v1/user') return { status: 200, json: { id: USER_ID, email: 'reader@example.test', user_metadata: { full_name: 'Anders' }, app_metadata: { provider: 'email' } } }
  if (path.startsWith('/rest/v1/') && !path.startsWith('/rest/v1/rpc/')) return { status: 200, json: [] }
  return { status: 200, json: {} }
}

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' }
const MARKERS = '<meta name="tinct-social" content="1"><meta name="tinct-friends" content="1">'
/** Every request: path, phase, start and end (ms, server clock), bytes. */
const log = []
let phase = 'boot'
const sleep = ms => new Promise(r => setTimeout(r, ms))
/** Quick: the board answers slowly (a phone on a poor network, a cold Worker), so what the Leaderboard shows meanwhile is seen. */
const QUICK_BOARD_EXTRA = Number(process.env.QUICK_BOARD_EXTRA || 3000)
function latencyOf(path) {
  if (path === '/api/social/board' && phase === 'quick') return LATENCY[path] + QUICK_BOARD_EXTRA
  if (path.startsWith('/api/social/profile/')) return LATENCY['/api/social/profile']
  return LATENCY[path] ?? 30
}
async function api(req, url, body) {
  const path = url.pathname
  await sleep(latencyOf(path) * SCALE)
  const json = (data, status = 200) => ({ status, type: 'application/json', body: JSON.stringify(data), cache: 'private, no-store' })
  if (path === '/api/profile' && req.method === 'GET') return json({ enabled: true, available: true, profile: ownProfile() })
  if (path === '/api/reading-time/status') return json({ enabled: true })
  if (path === '/api/reading-time/flush') return json({ ok: true })
  if (path === '/api/reading-time') return json({ enabled: true, rows: OWN_ROWS })
  if (path === '/api/social/board') return json(board(url.searchParams.get('tab') === 'everyone' ? 'everyone' : 'friends'))
  if (path === '/api/social/rank') { const b = board('friends'); return json({ rank: b.me.rank, total: b.total, seconds: OWN_SECONDS }) }
  if (path === '/api/social/find') return json({ followingYou: [{ handle: 'nora', name: 'Nora Lund', link: 'tinct.app/@nora', picture: pic.initial('N'), relation: relations.get('nora'), book: null }], alsoReading: [], link: 'tinct.app/@anders', everyoneOpen: true })
  if (path.startsWith('/api/social/profile/')) return json({ profile: readerProfile(decodeURIComponent(path.slice('/api/social/profile/'.length))) })
  if (path === '/api/social/blocked') return json({ blocked: [] })
  if (['/api/social/follow', '/api/social/unfollow', '/api/social/remove-follower'].includes(path)) {
    const handle = JSON.parse(body || '{}').handle
    const before = relations.get(handle) ?? 'stranger'
    const followsYou = before === 'friend' || before === 'followed'
    const next = path.endsWith('/follow') ? (followsYou ? 'friend' : 'follower') : path.endsWith('/unfollow') ? (followsYou ? 'followed' : 'stranger') : 'stranger'
    relations.set(handle, next)
    return json({ ok: true, relation: next, followsYou: path.endsWith('remove-follower') ? false : followsYou })
  }
  if (path === '/api/profile/image') {
    // The Worker's serveImage: the owner's own copy a year, immutable; another viewer's five minutes.
    const owner = url.searchParams.get('user')
    return { status: 200, type: 'image/jpeg', body: PHOTO, cache: owner === USER_ID ? 'private, max-age=31536000, immutable' : 'private, max-age=300' }
  }
  if (path === '/api/subscription-info') return json({ subscription_status: 'active' })
  return json({ error: 'mock' }, 404)
}
function staticFile(url) {
  let path = decodeURIComponent(url.pathname)
  if (path === '/library' || path === '/library/') return { file: join(DIST, 'lab', 'library_2', 'index.html'), marked: true }
  const file = join(DIST, path)
  if (file.startsWith(DIST) && existsSync(file) && statSync(file).isFile()) return { file }
  if (existsSync(join(file, 'index.html'))) return { file: join(file, 'index.html') }
  return null
}
// A throwaway self-signed certificate for 127.0.0.1, so the browser speaks HTTP/2 as it does to Cloudflare.
const keyFile = join(OUT, 'local-key.pem'), certFile = join(OUT, 'local-cert.pem')
if (!existsSync(certFile)) execFileSync('openssl', ['req', '-x509', '-newkey', 'ec', '-pkeyopt', 'ec_paramgen_curve:prime256v1', '-nodes', '-days', '30', '-subj', '/CN=127.0.0.1', '-addext', 'subjectAltName=IP:127.0.0.1', '-keyout', keyFile, '-out', certFile], { stdio: 'ignore' })
// Chromium trusts it by its key (a page under a certificate error is never cached, so caching could not be seen otherwise).
const SPKI = execFileSync('sh', ['-c', `openssl x509 -in '${certFile}' -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | base64`]).toString().trim()
const server = http2.createSecureServer({ key: readFileSync(keyFile), cert: readFileSync(certFile), allowHTTP1: true }, async (req, res) => {
  const url = new URL(req.url || '/', ORIGIN)
  const host = String(req.headers[':authority'] || req.headers.host || '')
  if (host.startsWith(`${SUPABASE_REF}.supabase.co`)) {
    const cors = { 'Access-Control-Allow-Origin': ORIGIN, 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS', 'Access-Control-Allow-Credentials': 'true' }
    if (req.method === 'OPTIONS') { res.writeHead(204, cors); return res.end() }
    for await (const _ of req) { /* drain */ }
    const answer = supabaseAnswer(url.pathname)
    res.writeHead(answer.status, { ...cors, 'Content-Type': 'application/json' }); return res.end(JSON.stringify(answer.json))
  }
  const entry = { path: url.pathname + (url.pathname.startsWith('/api/') ? url.search.replace(/today=[\d-]+&?/, '') : ''), phase, start: Date.now(), end: 0, bytes: 0, status: 200, cache: '' }
  log.push(entry)
  let body = ''
  for await (const chunk of req) body += chunk
  const finish = (status, headers, payload) => {
    entry.status = status; entry.end = Date.now(); entry.bytes = payload ? payload.length : 0; entry.cache = headers['Cache-Control'] || ''
    res.writeHead(status, headers); res.end(payload)
    entry.proto = req.httpVersion
  }
  if (url.pathname.startsWith('/api/')) {
    const answer = await api(req, url, body)
    return finish(answer.status, { 'Content-Type': answer.type, 'Cache-Control': answer.cache }, typeof answer.body === 'string' ? Buffer.from(answer.body) : answer.body)
  }
  const found = staticFile(url)
  if (!found) return finish(404, { 'Content-Type': 'text/plain' }, Buffer.from('not found'))
  const type = TYPES[extname(found.file).toLowerCase()] || 'application/octet-stream'
  let payload = readFileSync(found.file)
  if (found.marked || type.startsWith('text/html')) payload = Buffer.from(payload.toString('utf8').replace('</head>', `${found.marked ? MARKERS : ''}</head>`))
  // The Worker's static policy (src/worker/lib/staticCache.ts); else what the assets binding answers.
  const cache = staticCacheControl(url, 200, type) ?? (type.startsWith('text/html') ? 'no-store' : 'public, max-age=0, must-revalidate')
  finish(200, { 'Content-Type': type, 'Cache-Control': cache }, payload)
})
await new Promise(r => server.listen(PORT, '127.0.0.1', r))
// SERVE_ONLY=1: just the mocked server, for looking around by hand.
if (process.env.SERVE_ONLY) { console.log(`serving ${ORIGIN}/library`); await new Promise(() => {}) }

// ===== In the page =====

/** Installed before any script: tap times and a per-frame watcher (window.__watch / __watchResult). */
function pageProbe({ ref, userId }) {
  localStorage.setItem('tinct:wipe-v1-done', '1')
  if (!localStorage.getItem(`sb-${ref}-auth-token`)) {
    localStorage.setItem(`sb-${ref}-auth-token`, JSON.stringify({ access_token: 'tok', refresh_token: 'r', token_type: 'bearer', expires_in: 360000, expires_at: Math.floor(Date.now() / 1000) + 360000, user: { id: userId, email: 'reader@example.test', user_metadata: { full_name: 'Anders' } } }))
  }
  document.cookie = 'tinct_auth=1; path=/'
  HTMLMediaElement.prototype.play = async function () { this.muted = true }
  window.__shift = { total: 0, input: 0 }
  try {
    new PerformanceObserver(list => { for (const e of list.getEntries()) { if (e.hadRecentInput) window.__shift.input += e.value; else window.__shift.total += e.value } }).observe({ type: 'layout-shift', buffered: true })
  } catch { window.__shift = null }
  window.__tapAt = 0
  for (const type of ['pointerdown', 'touchstart', 'mousedown']) addEventListener(type, () => { if (!window.__tapAt) window.__tapAt = performance.now() }, true)
  window.__taps = []
  addEventListener('pointerdown', () => { window.__taps.push(performance.now()) }, true)
  const top = () => document.querySelector('.tc-card:not(.is-under)')
  const q = sel => top()?.querySelector(sel)
  const text = sel => q(sel)?.textContent?.trim() ?? null
  const preds = {
    youCard: () => Boolean(document.querySelector('[data-testid="account-cards"] [data-testid="you-picture"]')),
    youName: () => Boolean(q('.tc-nm b') || q('.tc-nm input') || q('.tc-nm [data-testid="you-name"]')) && !q('[data-testid="you-name-skeleton"]'),
    youReading: () => Boolean(q('[data-testid="you-reading"]')),
    youRank: () => /\d/.test(text('[data-testid="you-leaderboard"] .tc-v') || ''),
    boardCard: () => top()?.querySelector('.tc-nav .tc-title')?.textContent?.includes('Leaderboard') ?? false,
    boardRows: () => (top()?.querySelectorAll('[data-testid="board-rows"] .tc-r').length ?? 0) > 0,
    boardPainted: () => { const avs = [...(top()?.querySelectorAll('[data-testid="board-rows"] .tc-av') ?? [])]; return avs.length > 0 && avs.every(a => a.classList.contains('is-init') || a.style.backgroundImage) },
    profileCard: () => Boolean(q('[data-testid="profile-body"]')),
    profileFacts: () => Boolean(q('[data-testid="profile-body"] [data-testid="card-facts"]')),
  }
  /** Watch named predicates from the next tap (or now): first-true times, jumps, flicker, the values rows showed. */
  window.__watch = names => {
    window.__tapAt = 0
    window.__taps = []
    if (window.__shift) window.__shift = { total: 0, input: 0 }
    const started = performance.now()
    const state = { names, times: {}, jumps: [], sheet: [], flicker: 0, values: { me: [], youReading: [], youRank: [], buttons: [] }, done: false, frames: 0 }
    const pos = new Map(), painted = new Map()
    let lastCard = null, lastHeight = null
    const keyOf = node => node.dataset.testid ? `${node.dataset.testid}:${[...node.parentElement.children].filter(n => n.dataset?.testid === node.dataset.testid).indexOf(node)}` : null
    const note = (list, value) => { if (value !== null && list[list.length - 1] !== value) list.push(value) }
    const frame = () => {
      state.frames++
      const now = performance.now()
      for (const name of names) if (!(name in state.times) && preds[name]()) state.times[name] = now
      const card = top()
      if (card) {
        const box = card.getBoundingClientRect()
        if (card !== lastCard) { pos.clear(); painted.clear(); lastCard = card; lastHeight = null }
        // Inside the card: rows and controls must not move once shown (the slide-in moves the card, not them).
        for (const node of card.querySelectorAll('[data-testid]')) {
          const key = keyOf(node); if (!key) continue
          const r = node.getBoundingClientRect(); if (!r.height) continue
          const y = Math.round(r.top - box.top + card.scrollTop)
          const was = pos.get(key)
          if (was !== undefined && Math.abs(was - y) > 1) state.jumps.push({ key, from: was, to: y, at: Math.round(now - started) })
          pos.set(key, y)
        }
        const h = Math.round(box.height)
        if (lastHeight !== null && Math.abs(h - lastHeight) > 1 && !card.getAnimations?.().length) state.sheet.push({ from: lastHeight, to: h, at: Math.round(now - started) })
        lastHeight = h
        card.querySelectorAll('[data-testid="board-rows"] .tc-r').forEach((row, i) => {
          const av = row.querySelector('.tc-av'); if (!av) return
          const on = av.classList.contains('is-init') || Boolean(av.style.backgroundImage)
          if (painted.get(i) && !on) state.flicker++
          painted.set(i, on)
        })
        note(state.values.me, text('[data-testid="board-me"] .tc-v'))
        note(state.values.youReading, text('[data-testid="you-reading"] .tc-v'))
        note(state.values.youRank, text('[data-testid="you-leaderboard"] .tc-v'))
      }
      if (!state.done) requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
    window.__watchState = state
    window.__watchStarted = started
  }
  window.__watchResult = async (timeout = 8000) => {
    const state = window.__watchState
    const until = performance.now() + timeout
    while (performance.now() < until && !state.names.every(n => n in state.times)) await new Promise(r => setTimeout(r, 30))
    // A little longer: what changes after everything first showed (a refresh replacing the rows).
    await new Promise(r => setTimeout(r, 1200))
    state.done = true
    const from = window.__tapAt || window.__watchStarted
    const times = Object.fromEntries(state.names.map(n => [n, n in state.times ? Math.round(state.times[n] - from) : null]))
    return { times, taps: window.__taps.map(t => Math.round(t - from)), jumps: state.jumps, sheet: state.sheet, flicker: state.flicker, values: state.values, shift: window.__shift ? { ...window.__shift } : null }
  }
  /** Avatars on the top card: drawn size (device px), the image behind and its own size. */
  window.__avatars = async () => {
    const out = []
    for (const av of top()?.querySelectorAll('.tc-av') ?? []) {
      const m = /url\("?([^")]+)"?\)/.exec(av.style.backgroundImage || '')
      if (!m) continue
      const img = new Image(); img.src = m[1]
      try { await img.decode() } catch {}
      const r = av.getBoundingClientRect()
      out.push({ src: m[1].startsWith('blob:') ? 'blob:(private photo)' : m[1], drawn: Math.round(Math.max(r.width, r.height) * devicePixelRatio), natural: img.naturalWidth, size: av.style.backgroundSize })
    }
    return out
  }
}

// ===== The run =====

const results = { latency: Object.fromEntries(Object.entries(LATENCY).map(([k, v]) => [k, v * SCALE])), engines: {} }
const since = (t, kind = 'api') => log.filter(e => e.start >= t && (kind === 'api' ? e.path.startsWith('/api/') : true))
/** Waves of Worker requests: 1 + the latest wave that ended before this one started. */
function waves(entries) {
  const sorted = [...entries].sort((a, b) => a.start - b.start)
  const out = []
  for (const e of sorted) {
    const before = out.filter(o => o.end && o.end <= e.start)
    out.push({ ...e, wave: before.length ? Math.max(...before.map(o => o.wave)) + 1 : 1 })
  }
  return out
}
const shortPath = path => path.replace(/\?$/, '').replace(/&$/, '').replace(/user=[0-9a-f-]+&slot=picture&v=\w+/, 'photo')
const brief = (entries, t0) => waves(entries).map(e => `${shortPath(e.path)} +${e.start - t0}..${e.end ? e.end - t0 : '(open)'} w${e.wave}`)
/** Until no request has been open for `quietMs` (the library's own loading done), at most `maxMs`. */
async function settled(quietMs = 600, maxMs = 20000) {
  const until = Date.now() + maxMs
  while (Date.now() < until) {
    const busy = log.some(e => !e.end) || log.some(e => Date.now() - e.end < quietMs)
    if (!busy) return
    await sleep(100)
  }
}

async function run(engineName) {
  const engine = engineName === 'webkit' ? webkit : chromium
  // WebKit has no way to trust it: its HTTP cache is not seen (a revisit re-downloads everything there).
  const browser = await engine.launch(engineName === 'chromium' ? { args: [`--ignore-certificate-errors-spki-list=${SPKI}`, `--host-resolver-rules=MAP ${SUPABASE_REF}.supabase.co 127.0.0.1:${PORT}, MAP * ~NOTFOUND, EXCLUDE 127.0.0.1`] } : {})
  const context = await browser.newContext({ ...devices['iPhone 13'], serviceWorkers: 'block', ignoreHTTPSErrors: engineName !== 'chromium' })
  // Playwright turns the HTTP cache off while any route is set, so Chromium routes nothing: its
  // resolver sends Supabase to this server and every other host nowhere. WebKit has no such switch.
  if (engineName !== 'chromium') {
    await context.route('**/*', async route => {
      const url = new URL(route.request().url())
      if (url.origin === ORIGIN) return route.continue()
      if (url.hostname === `${SUPABASE_REF}.supabase.co`) { const answer = supabaseAnswer(url.pathname); return route.fulfill({ status: answer.status, json: answer.json }) }
      return route.abort()
    })
  }
  await context.addInitScript(pageProbe, { ref: SUPABASE_REF, userId: USER_ID })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(String(e).slice(0, 200)))
  if (process.env.DEBUG) {
    page.on('request', r => { if (r.isNavigationRequest()) console.log('navigation request', r.url()) })
    page.on('console', m => { if (m.type() === 'error') console.log('console', m.type(), m.text().slice(0, 300)) })
  }
  if (engineName === 'chromium') { const cdp = await context.newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 }) }
  const out = { phases: {}, buttons: {}, avatars: null, consistency: null, errors, protocol: null }

  async function openLibrary(reload = false, quick = false) {
    phase = quick ? 'quick' : reload ? 'revisit' : 'cold'
    // A returning visit is a new navigation (a reload asks for every file again).
    if (reload) await page.goto(`${ORIGIN}/library?again=${quick ? 2 : 1}`, { waitUntil: 'domcontentloaded' }); else await page.goto(`${ORIGIN}/library`, { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('#sign-in.cards-you', { timeout: 30000 })
    // The library's own loading first (shelves, covers, catalogue): the cards' cost on its own.
    // Quick: tapped at once, as a reader who opens the app to look at the board does.
    if (!quick) await settled()
  }
  /** Tap the picture, then Leaderboard as soon as its row is there. */
  async function measureOpen(name) {
    phase = name
    if (name === 'quick') return measureQuick(name)
    const t0 = Date.now()
    await page.evaluate(() => window.__watch(['youCard', 'youName', 'youReading', 'youRank']))
    await page.tap('#sign-in')
    const you = await page.evaluate(() => window.__watchResult(6000))
    await page.waitForSelector('[data-testid="you-leaderboard"]', { timeout: 10000 })
    const t1 = Date.now()
    await page.evaluate(() => window.__watch(['boardCard', 'boardRows', 'boardPainted']))
    await page.tap('[data-testid="you-leaderboard"]')
    const boardResult = await page.evaluate(() => window.__watchResult(8000))
    const all = since(t0, 'all')
    out.phases[name] = {
      you: you.times, board: boardResult.times,
      jumps: [...you.jumps, ...boardResult.jumps], sheet: [...you.sheet, ...boardResult.sheet], flicker: boardResult.flicker,
      values: { youReading: you.values.youReading, youRank: you.values.youRank, boardMe: boardResult.values.me },
      shift: you.shift && boardResult.shift ? { total: you.shift.total + boardResult.shift.total, input: you.shift.input + boardResult.shift.input } : null,
      requestsAfterYouTap: brief(since(t0).filter(e => e.start < t1), t0),
      requestsAfterBoardTap: brief(since(t1), t1),
      wavesToBoard: Math.max(0, ...waves(since(t0)).filter(e => e.path.startsWith('/api/social/board')).map(e => e.wave)),
      avatarDownloads: all.filter(e => /\/lab\/library_2\/assets\/|\/api\/profile\/image/.test(e.path) && e.start >= t1).map(e => `${shortPath(e.path.split('/').pop())} ${Math.round(e.bytes / 1024)} KB`),
    }
  }
  /**
   * Quick: one watch from the picture tap, and Leaderboard tapped the moment its row shows (not
   * after the You card has settled), so every time here is from the picture tap.
   */
  async function measureQuick(name) {
    const t0 = Date.now()
    await page.evaluate(() => window.__watch(['youCard', 'youRank', 'boardCard', 'boardRows', 'boardPainted']))
    await page.tap('#sign-in')
    await page.waitForSelector('[data-testid="you-leaderboard"]', { timeout: 10000 })
    const t1 = Date.now()
    await page.tap('[data-testid="you-leaderboard"]')
    const r = await page.evaluate(() => window.__watchResult(8000))
    out.phases[name] = {
      you: { youCard: r.times.youCard, youName: '-', youRank: r.times.youRank }, board: { boardCard: r.times.boardCard, boardRows: r.times.boardRows, boardPainted: r.times.boardPainted },
      jumps: r.jumps, sheet: r.sheet, flicker: r.flicker,
      values: { youReading: r.values.youReading, youRank: r.values.youRank, boardMe: r.values.me },
      shift: r.shift, requestsAfterYouTap: brief(since(t0).filter(e => e.start < t1), t0), requestsAfterBoardTap: brief(since(t1), t1),
      wavesToBoard: Math.max(0, ...waves(since(t0)).filter(e => e.path.startsWith('/api/social/board')).map(e => e.wave)),
      avatarDownloads: [],
      leaderboardTapAt: r.taps[1] ?? null,
      rowsAfterLeaderboardTap: r.taps[1] != null && r.times.boardRows != null ? r.times.boardRows - r.taps[1] : null,
    }
  }
  async function closeCards() {
    await page.keyboard.press('Escape')
    await page.waitForSelector('[data-testid="account-cards"]', { state: 'detached', timeout: 5000 }).catch(() => {})
    await page.waitForTimeout(300)
  }
  /**
   * Tap `selector` on the top card; for each named predicate (in-page source, read from the tap on),
   * the time from the tap until it first holds. `first` is the first change on screen of any kind.
   */
  async function tapTime(name, selector, preds, { settle = 4000 } = {}) {
    const node = page.locator(`.tc-card:not(.is-under) ${selector}`).first()
    if (!(await node.count())) { out.buttons[name] = { missing: selector }; return }
    const t0 = Date.now()
    await page.evaluate(sources => {
      window.__tapAt = 0
      const fns = Object.fromEntries(Object.entries(sources).map(([k, src]) => [k, new Function(`return (${src})`)()]))
      const at = {}
      const snapshot = () => document.querySelector('[data-testid="account-cards"]')?.innerHTML ?? ''
      const before = snapshot()
      window.__tapProbe = { at, keys: Object.keys(fns) }
      const tick = () => {
        // Only after the tap: a predicate already true before it is not a response.
        if (window.__tapAt) {
          if (!('first' in at) && snapshot() !== before) at.first = performance.now()
          for (const [k, fn] of Object.entries(fns)) if (!(k in at) && fn()) at[k] = performance.now()
        }
        if (Object.keys(fns).some(k => !(k in at)) || !('first' in at)) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, preds)
    await node.tap()
    const ms = await page.evaluate(async limit => {
      const until = performance.now() + limit
      const { at, keys } = window.__tapProbe
      while ((keys.some(k => !(k in at)) || !('first' in at)) && performance.now() < until) await new Promise(r => setTimeout(r, 20))
      return Object.fromEntries(['first', ...keys].map(k => [k, k in at ? Math.round(at[k] - window.__tapAt) : null]))
    }, settle)
    out.buttons[name] = { ms, requests: brief(since(t0), t0) }
  }
  const TOP = `.tc-card:not(.is-under)`
  const has = sel => `() => Boolean(document.querySelector('${TOP} ${sel}'))`
  const textOf = sel => `document.querySelector('${TOP} ${sel}')?.textContent ?? ''`
  const rowsCount = `document.querySelectorAll('${TOP} [data-testid="board-rows"] .tc-r').length`
  const followLabels = []

  // Cold: a fresh context, the picture tapped once the library has loaded.
  await openLibrary(false)
  out.protocol = log.find(e => e.path === '/library')?.proto ?? null
  await measureOpen('cold')
  out.avatars = await page.evaluate(() => window.__avatars())
  // The Leaderboard's buttons.
  await tapTime('tab: Everyone', '[data-testid="board-tabs"] [data-value="everyone"]', {
    selected: `() => document.querySelector('${TOP} [data-testid="board-tabs"] [data-value="everyone"]')?.getAttribute('aria-checked') === 'true'`,
    rows: `() => ${rowsCount} > 9`,
  })
  await page.waitForTimeout(800)
  await tapTime('tab: Friends', '[data-testid="board-tabs"] [data-value="friends"]', {
    selected: `() => document.querySelector('${TOP} [data-testid="board-tabs"] [data-value="friends"]')?.getAttribute('aria-checked') === 'true'`,
    rows: `() => { const n = ${rowsCount}; return n > 0 && n <= 9 }`,
  })
  await page.waitForTimeout(800)
  await tapTime('tab: Everyone again (seen)', '[data-testid="board-tabs"] [data-value="everyone"]', { rows: `() => ${rowsCount} > 9` })
  await page.waitForTimeout(800)
  await tapTime('tab: Friends again (seen)', '[data-testid="board-tabs"] [data-value="friends"]', { rows: `() => { const n = ${rowsCount}; return n > 0 && n <= 9 }` })
  await page.waitForTimeout(800)
  const boardKarl = await page.evaluate(() => [...document.querySelectorAll('.tc-card:not(.is-under) [data-testid="board-row"]')].find(r => r.textContent.includes('Karl'))?.querySelector('.tc-v')?.textContent ?? null)
  // A reader's profile: what the follow button says while it loads, and once loaded.
  await page.evaluate(() => {
    window.__labels = []
    const tick = () => { const b = document.querySelector('.tc-card:not(.is-under) [data-testid="profile-follow"]'); const t = b ? b.textContent : null; if (t !== null && window.__labels[window.__labels.length - 1] !== t) window.__labels.push(t); if (!window.__stopLabels) requestAnimationFrame(tick) }
    window.__stopLabels = false; requestAnimationFrame(tick)
  })
  await tapTime('board row -> profile', '[data-testid="board-row"]', { card: has('[data-testid="profile-body"]'), figures: has('[data-testid="profile-body"] [data-testid="card-facts"]') })
  await page.waitForTimeout(600)
  followLabels.push(...await page.evaluate(() => { window.__stopLabels = true; return window.__labels }))
  const profileKarl = await page.evaluate(() => [...document.querySelectorAll('.tc-card:not(.is-under) [data-testid="profile-body"] [data-testid="card-facts"] > div')].map(n => n.textContent).join('|'))
  const followNow = await page.evaluate(`(() => ${textOf('[data-testid="profile-follow"]')})()`)
  await tapTime('profile: Following -> unfollow', '[data-testid="profile-follow"]', { label: `() => (${textOf('[data-testid="profile-follow"]')}) !== ${JSON.stringify(followNow)}` })
  await page.waitForTimeout(1500)
  const followThen = await page.evaluate(`(() => ${textOf('[data-testid="profile-follow"]')})()`)
  await tapTime('profile: Follow again', '[data-testid="profile-follow"]', { label: `() => (${textOf('[data-testid="profile-follow"]')}) !== ${JSON.stringify(followThen)}` })
  await page.waitForTimeout(1500)
  await tapTime('profile: back', '[data-testid="card-back"]', { board: has('[data-testid="board-rows"]') })
  await page.waitForTimeout(500)
  await tapTime('board row -> same profile again', '[data-testid="board-row"]', { card: has('[data-testid="profile-body"]'), figures: has('[data-testid="profile-body"] [data-testid="card-facts"]') })
  await page.waitForTimeout(500)
  await tapTime('profile: back (2)', '[data-testid="card-back"]', { board: has('[data-testid="board-rows"]') })
  await page.waitForTimeout(500)
  await tapTime('board: Find readers', '[data-testid="board-find"]', { card: has('[data-testid="find-search"]') })
  await page.waitForSelector(`${TOP} [data-testid="following-you-row-button"]`, { timeout: 5000 }).catch(() => {})
  const findNow = await page.evaluate(`(() => ${textOf('[data-testid="following-you-row-button"]')})()`)
  await tapTime('find: Follow back', '[data-testid="following-you-row-button"]', { label: `() => (${textOf('[data-testid="following-you-row-button"]')}) !== ${JSON.stringify(findNow)}` })
  await page.waitForTimeout(1500)
  await tapTime('find: back', '[data-testid="card-back"]', { board: has('[data-testid="board-rows"]') })
  await page.waitForTimeout(500)
  await tapTime('board: own row -> You', '[data-testid="board-me"]', { card: has('[data-testid="you-picture"]') })
  await page.waitForTimeout(500)
  const youReading = await page.evaluate(`(() => ${textOf('[data-testid="you-reading"] .tc-v')})()`)
  const youRank = await page.evaluate(`(() => ${textOf('[data-testid="you-leaderboard"] .tc-v')})()`)
  await tapTime('you: Your reading', '[data-testid="you-reading"]', { card: has('[data-testid="reading-total"]') })
  await page.waitForTimeout(500)
  const readingFacts = await page.evaluate(() => [...document.querySelectorAll('.tc-card:not(.is-under) [data-testid="card-facts"] > div')].map(n => n.textContent).join('|'))
  await tapTime('reading: back', '[data-testid="card-back"]', { card: has('[data-testid="you-picture"]') })
  await page.waitForTimeout(500)
  await tapTime('you: Find readers', '[data-testid="you-find"]', { card: has('[data-testid="find-search"]') })
  await page.waitForTimeout(500)
  await page.locator(`${TOP} [data-testid="card-back"]`).first().tap().catch(() => {})
  await page.waitForTimeout(500)
  await tapTime('you: Settings', '[data-testid="you-settings"]', { card: `() => !document.querySelector('${TOP} [data-testid="you-picture"]')` })
  await page.waitForTimeout(500)
  await page.locator(`${TOP} [data-testid="card-back"]`).first().tap().catch(() => {})
  await page.waitForTimeout(500)
  await tapTime('you: Leaderboard (seen)', '[data-testid="you-leaderboard"]', { rows: `() => ${rowsCount} > 0` })
  await page.waitForTimeout(800)
  const boardMe = await page.evaluate(`(() => ${textOf('[data-testid="board-me"] .tc-v')})()`)
  const boardMeRank = await page.evaluate(`(() => ${textOf('[data-testid="board-me"] .tc-rank')})()`)
  const boardRows = await page.evaluate(`(() => ${rowsCount})()`)
  out.consistency = { youReading, readingFacts, boardMe, youRank, boardMeRank, boardRows, karlBoard: boardKarl, karlProfile: profileKarl, profileFollowLabelsWhileLoading: followLabels }
  await closeCards()
  // Reopen on the same page.
  await measureOpen('reopen')
  await closeCards()
  // Revisit: the library opened again (HTTP cache and storage kept).
  await openLibrary(true)
  await measureOpen('revisit')
  await closeCards()
  // Quick: a cold start of the page, the cards opened before the idle warm-up.
  await openLibrary(true, true)
  await measureOpen('quick')
  await closeCards()
  await browser.close()
  return out
}

let broken = false
for (const name of ENGINES) {
  try {
    console.log(`\n=== ${name} ${name === 'chromium' ? '(iPhone 13, 4x CPU)' : '(iPhone 13)'} ===`)
    const r = await run(name)
    console.log(`protocol: HTTP/${r.protocol}`)
    results.engines[name] = r
    for (const [phaseName, p] of Object.entries(r.phases)) {
      console.log(`${phaseName.padEnd(7)} You card ${p.you.youCard} ms · name ${p.you.youName} · rank ${p.you.youRank} | Leaderboard card ${p.board.boardCard} · first rows ${p.board.boardRows} · avatars painted ${p.board.boardPainted} | board waves ${p.wavesToBoard} | jumps ${p.jumps.length} sheet ${p.sheet.length} flicker ${p.flicker}${p.shift ? ` CLS ${p.shift.total.toFixed(3)} (+${p.shift.input.toFixed(3)} after input)` : ''}`)
      if (p.leaderboardTapAt !== undefined) console.log(`        (times from the picture tap; Leaderboard tapped at ${p.leaderboardTapAt} ms; its rows ${p.rowsAfterLeaderboardTap} ms after that tap)`)
      console.log(`        values: you ${JSON.stringify(p.values.youReading)} rank ${JSON.stringify(p.values.youRank)} board-me ${JSON.stringify(p.values.boardMe)}`)
      console.log(`        after You tap: ${p.requestsAfterYouTap.join(', ') || '-'}`)
      console.log(`        after Leaderboard tap: ${p.requestsAfterBoardTap.join(', ') || '-'}`)
      if (p.avatarDownloads.length) console.log(`        avatar downloads: ${p.avatarDownloads.join('; ')}`)
      if (p.jumps.length) console.log(`        jumps: ${JSON.stringify(p.jumps.slice(0, 6))}`)
      if (p.sheet.length) console.log(`        sheet: ${JSON.stringify(p.sheet.slice(0, 6))}`)
    }
    console.log('buttons (tap to response):')
    for (const [label, b] of Object.entries(r.buttons)) console.log(`  ${label.padEnd(34)} ${b.missing ? 'missing ' + b.missing : `${Object.entries(b.ms).map(([k, v]) => `${k} ${v ?? 'never'}`).join(' · ')} ms${b.requests.length ? '  [' + b.requests.join(', ') + ']' : ''}`}`)
    console.log('avatars (drawn device px vs image px):')
    for (const a of r.avatars ?? []) {
      const served = log.find(e => e.path === a.src || (a.src.startsWith('blob:') && e.path.startsWith('/api/profile/image')))
      console.log(`  ${a.src.split('/').pop().padEnd(36)} drawn ${a.drawn}px, image ${a.natural}px (${a.size}), ${served ? Math.round(served.bytes / 1024) + ' KB, ' + served.cache : '?'}`)
    }
    console.log('consistency:', JSON.stringify(r.consistency))
    if (r.errors.length) console.log('page errors:', r.errors.slice(0, 5))
  } catch (error) {
    broken = true
    console.log(`FAIL ${name}: ${error.stack || error}`)
  }
}
writeFileSync(join(OUT, 'board-speed.json'), JSON.stringify(results, null, 2))
console.log(`\nwrote ${join(OUT, 'board-speed.json')}`)
server.close()
process.exit(broken ? 1 : 0)
