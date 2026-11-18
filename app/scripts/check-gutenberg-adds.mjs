#!/usr/bin/env node
// "Add to Tinct" for Project Gutenberg books, run offline on downloaded EPUBs
// through the exact path a reader's tap takes (src/libraryAdd.ts importWork):
//
//   POST /api/public-books/import            the Worker's prepare: catalogue lookup,
//                                            importableWork, downloadWork (allowlist,
//                                            25 MB limit, the no-images fallback)
//   GET  …/import/{bookId}/source            the staged EPUB
//   browser: epubToEdition(bytes, { sourceTitles: true }) → publicChapters
//   POST …/import/{bookId}/commit            the Worker's commit: 15 MB body, parseChapters
//                                            (LIMITS), the check against the EPUB, titles,
//                                            shelf rules, publication
//
// The Worker's own handler (handlePublicBooks) runs in-process with an in-memory
// R2 bucket and a one-work catalogue served the way the asset would be; its
// downloads are answered from local files. No AI: the shelf chooser is off and
// no cover is painted. Nothing is written anywhere but --out and --epub-dir.
//
//   node scripts/check-gutenberg-adds.mjs --ids 3600,1342 --epub-dir /tmp/epubs [--download] [--out results.json]
//   node scripts/check-gutenberg-adds.mjs --sample 340 --seed 20261009 --epub-dir /tmp/epubs --download --out results.json
//   node scripts/check-gutenberg-adds.mjs --ids-file previous.json --failed-only …
//
// --download fetches a missing EPUB from www.gutenberg.org (the Worker's own URL; honours
// HTTPS_PROXY). --keep failing|all|none (default failing) says which EPUBs stay on disk
// after their check. --out also gets <out>.jsonl, one line per book as it lands; --resume
// continues from it. --workers (default 2) and --heap-mb (default 2048, per book: a book
// needing more fails as `crash`) bound memory; --recycle (default 20) books per thread. Run from app/.
import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync, mkdirSync, unlinkSync } from 'node:fs'
import { gunzipSync, gzipSync } from 'node:zlib'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads'

const SCRIPT = fileURLToPath(import.meta.url)
const USER = '11111111-1111-4111-8111-111111111111'
const ORIGIN = 'https://tinct.app'

// ===== Worker thread: one book through the add path =====

if (!isMainThread) {
  const P = await import(pathToFileURL(workerData.bundle).href)
  const { JSDOM } = await import('jsdom')
  globalThis.DOMParser = new JSDOM('').window.DOMParser
  parentPort.on('message', async job => {
    let row
    try { row = await addOne(P, job) } catch (error) { row = { id: job.work.id, ok: false, stage: 'harness', error: String(error?.stack || error) } }
    parentPort.postMessage(row)
  })
}

/** An R2 stand-in (get/put/head/delete/list), enough for the import routes. */
function memoryBucket() {
  const objects = new Map()
  const view = key => {
    const o = objects.get(key)
    return { key, size: o.bytes.byteLength, etag: o.etag, uploaded: new Date(), customMetadata: o.customMetadata, httpMetadata: o.httpMetadata, body: new Response(o.bytes.slice()).body, arrayBuffer: async () => o.bytes.slice().buffer }
  }
  let version = 0
  return {
    objects,
    async put(key, value, opts = {}) {
      const current = objects.get(key)
      if (opts.onlyIf?.etagMatches !== undefined && current?.etag !== opts.onlyIf.etagMatches) return null
      if (opts.onlyIf?.etagDoesNotMatch === '*' && current) return null
      const bytes = typeof value === 'string' ? new TextEncoder().encode(value) : new Uint8Array(value)
      objects.set(key, { bytes, etag: `e${++version}`, customMetadata: { ...(opts.customMetadata ?? {}) }, httpMetadata: opts.httpMetadata ?? {} })
      return view(key)
    },
    async get(key) { return objects.has(key) ? view(key) : null },
    async head(key) { return objects.has(key) ? view(key) : null },
    async delete(keys) { for (const key of [].concat(keys)) objects.delete(key) },
    async list(opts = {}) { return { objects: [...objects.keys()].filter(k => k.startsWith(opts.prefix ?? '')).sort().map(view), truncated: false, delimitedPrefixes: [] } },
  }
}

/** Which Worker limit an upload breaks (publicBooks.ts parseChapters), for the report. */
function limitBroken(P, chapters) {
  const L = P.LIMITS
  if (!chapters.length) return 'no chapters'
  if (chapters.length > L.chapters) return `chapters ${chapters.length} > ${L.chapters}`
  let total = 0
  for (const c of chapters) {
    if (c.paragraphs.length > L.paragraphsPerChapter) return `chapter "${c.title.slice(0, 60)}" has ${c.paragraphs.length} paragraphs > ${L.paragraphsPerChapter}`
    const longest = Math.max(0, ...c.paragraphs.map(p => p.length))
    if (longest > L.paragraphChars) return `paragraph of ${longest} chars > ${L.paragraphChars}`
    total += c.paragraphs.length
    if (total > L.totalParagraphs) return `total paragraphs > ${L.totalParagraphs}`
  }
  return 'unknown'
}

async function addOne(P, { work, files }) {
  const row = { id: work.id, title: work.title, author: (work.authors || []).map(a => a.name).join('; '), group: work.group, ok: false, stage: 'prepare' }
  const started = Date.now()
  P.resetCatalogueLookupCache()
  const bucket = memoryBucket()
  const gz = gzipSync(Buffer.from(JSON.stringify({ version: 1, builtAt: 'check', works: [work] })))
  const env = { AUDIO_BUCKET: bucket, ASSETS: { fetch: async () => new Response(new Uint8Array(gz)) } }
  const downloads = []
  const deps = {
    verifyUser: async () => ({ id: USER }),
    checkRateLimit: async () => true,
    countDaily: async () => true,
    acquireLock: async () => true,
    premiumAccess: async () => true,
    chooser: null,
    // The library's answers, from the files the main thread downloaded for these URLs.
    fetchSource: async url => {
      downloads.push(String(url))
      const file = files[String(url)]
      if (!file) return new Response('not here', { status: 404 })
      if (file.oversize) return new Response(new Uint8Array(0), { headers: { 'content-length': String(file.oversize) } })
      const bytes = readFileSync(file.path)
      return new Response(bytes, { headers: { 'content-length': String(bytes.byteLength), 'content-type': 'application/epub+zip' } })
    },
  }
  const call = (path, init = {}) => P.handlePublicBooks(new Request(ORIGIN + path, { ...init, headers: { Authorization: 'Bearer t', 'Content-Type': 'application/json' } }), env, deps)

  // Worker: prepare.
  const prepared = await call('/api/public-books/import', { method: 'POST', body: JSON.stringify({ workId: work.id }) })
  const step = await prepared.json().catch(() => ({}))
  row.downloads = downloads
  if (!prepared.ok || step.status !== 'convert') { row.status = prepared.status; row.error = step.error || step.status || 'prepare'; return finish(row, started) }
  row.stage = 'source'
  const source = await call(step.source, { method: 'GET' })
  if (!source.ok) { row.status = source.status; row.error = 'source'; return finish(row, started) }
  const bytes = new Uint8Array(await source.arrayBuffer())
  row.epubBytes = bytes.byteLength
  row.usedUrl = downloads.at(-1)

  // Browser: the reader's converter, as libraryAdd.ts calls it.
  row.stage = 'convert'
  let edition, chapters
  const convertStart = Date.now()
  try {
    edition = await P.epubToEdition(bytes, { sourceTitles: true })
    chapters = P.publicChapters(edition.chapters)
  } catch (error) {
    row.error = 'unreadable'
    row.detail = `${error?.code || error?.name || 'Error'}: ${String(error?.message || error).slice(0, 300)}`
    return finish(row, started)
  }
  row.convertMs = Date.now() - convertStart
  row.chapters = chapters.length
  row.paragraphs = chapters.reduce((n, c) => n + c.paragraphs.length, 0)
  row.longestParagraph = Math.max(0, ...chapters.flatMap(c => c.paragraphs.map(p => p.length)))
  const body = JSON.stringify({ chapters })
  row.commitBytes = Buffer.byteLength(body)

  // Worker: commit.
  row.stage = 'commit'
  const commitStart = Date.now()
  const committed = await call(`/api/public-books/import/${encodeURIComponent(step.bookId)}/commit`, { method: 'POST', body })
  row.commitMs = Date.now() - commitStart
  const done = await committed.json().catch(() => ({}))
  row.status = committed.status
  if (committed.status !== 201 || !done.entry) {
    row.error = done.error || `status ${committed.status}`
    if (row.error === 'bad_edition') row.detail = limitBroken(P, chapters)
    if (row.error === 'edition_mismatch') {
      // Which paragraphs the check could not find (verifyEditionAgainstSource, with the misses kept).
      const letters = await P.epubSourceLetters(bytes)
      const parsed = P.parseChapters({ chapters }) || []
      const missing = []
      let total = 0
      for (const c of parsed) for (const p of c.paragraphs) { total++; const n = P.letters(p); if (n && !letters.includes(n)) missing.push(p) }
      row.detail = `${missing.length}/${total} paragraphs not found (limit ${Math.max(3, Math.floor(total * P.MAX_UNVERIFIED_SHARE))})`
      row.missingSample = missing.slice(0, 5).map(p => p.slice(0, 200))
    }
    return finish(row, started)
  }
  const meta = JSON.parse(new TextDecoder().decode(bucket.objects.get(`public-books/${step.bookId}/meta.json`)?.bytes ?? new Uint8Array()) || '{}')
  row.removed = meta.verification?.removed ?? done.verification?.removed
  row.renamed = meta.verification?.renamed
  row.shelf = done.entry.shelfIds?.[0]
  row.stage = 'done'
  row.ok = true
  return finish(row, started)
}

function finish(row, started) {
  row.ms = Date.now() - started
  return row
}

// ===== Main thread =====

if (isMainThread) {
  const args = process.argv.slice(2)
  const opt = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : fallback }
  const flag = name => args.includes(name)
  const ROOT = resolve('.')
  const CATALOG = resolve(opt('--catalog', 'public/lab/addbook/data/catalog.json.gz'))
  const EPUB_DIR = resolve(opt('--epub-dir', join(tmpdir(), 'tinct-gutenberg-epubs')))
  const OUT = opt('--out', null)
  const KEEP = opt('--keep', 'failing')
  const WORKERS = Number(opt('--workers', '2'))
  const TIMEOUT_MS = Number(opt('--timeout', '300')) * 1000
  const DOWNLOAD = flag('--download')
  const SEED = Number(opt('--seed', '20261009'))
  mkdirSync(EPUB_DIR, { recursive: true })

  // The pipeline's own modules, bundled once (TypeScript).
  const { build } = await import('esbuild')
  const scratch = mkdtempSync(join(tmpdir(), 'tinct-gutenberg-adds-'))
  const entry = join(scratch, 'entry.ts')
  writeFileSync(entry, `
export { handlePublicBooks, parseChapters, LIMITS, MAX_EPUB_BYTES } from ${JSON.stringify(join(ROOT, 'src/worker/routes/publicBooks.ts'))}
export { resetCatalogueLookupCache } from ${JSON.stringify(join(ROOT, 'src/worker/lib/publicBookCatalogue.ts'))}
export { epubSourceLetters, letters, MAX_UNVERIFIED_SHARE } from ${JSON.stringify(join(ROOT, 'src/worker/lib/epubSource.ts'))}
export { epubToEdition } from ${JSON.stringify(join(ROOT, 'src/lab/userBook/epubEdition.ts'))}
export { publicChapters } from ${JSON.stringify(join(ROOT, 'src/lab/userBook/publicChapters.ts'))}
export { importableWork, importEditions, inTinct } from ${JSON.stringify(join(ROOT, 'public/lab/public-books.js'))}
`)
  const bundle = join(scratch, 'pipeline.mjs')
  await build({ entryPoints: [entry], bundle: true, format: 'esm', platform: 'node', target: 'node20', outfile: bundle, logLevel: 'error', loader: { '.wasm': 'empty' } })
  const P = await import(pathToFileURL(bundle).href)

  // ---- Which works ----
  const catalogue = JSON.parse(gunzipSync(readFileSync(CATALOG)).toString('utf8'))
  const byId = new Map(catalogue.works.map(w => [w.id, w]))
  const SELECTION = /^(quotes and images from|widger'?s quotations from)\b/i
  // What a reader can add: a Gutenberg work offered under "Not yet in Tinct" (public-books.js groupSearchResults).
  const offered = w => /^pg:\d+$/.test(w.id) && P.importableWork(w) && !P.inTinct(w, []) && !SELECTION.test(String(w.title || ''))
  let picks = []
  const idsArg = opt('--ids', null)
  const idsFile = opt('--ids-file', null)
  if (idsArg || idsFile) {
    let list = []
    if (idsArg) list = idsArg.split(',').map(s => s.trim()).filter(Boolean).map(id => ({ id: /^pg:/.test(id) ? id : `pg:${id}` }))
    if (idsFile) {
      const data = JSON.parse(readFileSync(idsFile, 'utf8'))
      const rows = Array.isArray(data) ? data : data.results
      list = rows.filter(r => !flag('--failed-only') || !r.ok).map(r => (typeof r === 'string' ? { id: r } : { id: r.id, group: r.group }))
    }
    picks = list.map(({ id, group }) => { const w = byId.get(id); return w ? { ...w, group: group || 'listed' } : { id, title: '(not in catalogue)', missing: true, group: group || 'listed' } })
  } else {
    // Top downloads, then deliberate variety, then a random spread (deterministic for a seed).
    const SAMPLE = Number(opt('--sample', '340'))
    let state = SEED >>> 0
    const random = () => { state = (Math.imul(state ^ (state >>> 15), 0x2c1b3c6d) + 0x9e3779b9) >>> 0; return state / 4294967296 }
    const pool = catalogue.works.filter(offered).sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    const tags = w => [...(w.subjects || []), ...(w.bookshelves || [])].join(' | ')
    // --wide: the whole catalogue rather than its most-read works (no top group), leaving out
    // the works of earlier runs (--exclude results.json or .jsonl), for a second, harder sample.
    const WIDE = flag('--wide')
    const chosen = new Set()
    const excluded = opt('--exclude', null)
    if (excluded) {
      const text = readFileSync(excluded, 'utf8')
      const rows = excluded.endsWith('.jsonl') ? text.split('\n').filter(Boolean).map(line => JSON.parse(line)) : JSON.parse(text).results
      for (const row of rows) chosen.add(row.id)
    }
    const take = (group, list, n, top = WIDE ? Infinity : 1500) => {
      const candidates = list.slice(0, top).filter(w => !chosen.has(w.id))
      for (let i = 0; i < n && candidates.length; i++) {
        const w = candidates.splice(Math.floor(random() * candidates.length), 1)[0]
        chosen.add(w.id)
        picks.push({ ...w, group })
      }
    }
    const top = WIDE ? 0 : Math.round(SAMPLE * 0.42)
    for (const w of pool.filter(w => !chosen.has(w.id)).slice(0, top)) { chosen.add(w.id); picks.push({ ...w, group: 'top' }) }
    const groups = [
      ['poetry', w => /poetry|poems|\bverse\b|sonnets|ballads/i.test(tags(w) + ' ' + w.title)],
      ['drama', w => /drama|\bplays\b|tragedies|comedies|tragedy|comedy/i.test(tags(w))],
      ['letters', w => /correspondence|\bletters\b|diaries|journals/i.test(tags(w) + ' ' + w.title)],
      ['essays', w => /essays|addresses|sermons|lectures/i.test(tags(w) + ' ' + w.title)],
      ['history-scholarly', w => /history|philosophy|law|theology|commentar|criticism/i.test(tags(w))],
      ['long-collected', w => /complete|collected|works of|\bvol\.|volume|\(of \d+\)|bible|encyclop|dictionary/i.test(w.title + ' ' + tags(w))],
    ]
    const each = Math.round(SAMPLE * (WIDE ? 0.12 : 0.08))
    for (const [group, test] of groups) take(group, pool.filter(test), each)
    take('random', pool, SAMPLE - picks.length, pool.length)
    // Montaigne's Essays: the add that failed in production (#371).
    if (!chosen.has('pg:3600') && byId.get('pg:3600')) picks.push({ ...byId.get('pg:3600'), group: 'regression' })
  }
  process.stderr.write(`${picks.length} works; EPUBs in ${EPUB_DIR}\n`)

  // ---- Downloads (the Worker's own URLs; each redirect followed like downloadEpub) ----
  let fetchImpl = globalThis.fetch
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy
  if (proxy) {
    const undici = await import('undici')
    const dispatcher = new undici.ProxyAgent(proxy)
    fetchImpl = (url, init = {}) => undici.fetch(url, { ...init, dispatcher })
  }
  const fileFor = url => join(EPUB_DIR, url.replace(/^https:\/\/www\.gutenberg\.org\/ebooks\//, '').replace(/[^A-Za-z0-9._-]/g, '_'))
  async function fetchFile(url) {
    const path = fileFor(url)
    if (existsSync(path)) return { path }
    if (existsSync(path + '.oversize')) return { oversize: Number(readFileSync(path + '.oversize', 'utf8')) }
    if (!DOWNLOAD) return null
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetchImpl(url, { headers: { 'User-Agent': 'Tinct (https://tinct.app; public-domain import check)', Accept: 'application/epub+zip,*/*;q=0.5' }, signal: AbortSignal.timeout(120_000) })
        if (response.status === 404) return null
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const declared = Number(response.headers.get('content-length') || '')
        if (declared > P.MAX_EPUB_BYTES) { await response.body?.cancel(); writeFileSync(path + '.oversize', String(declared)); return { oversize: declared } }
        const bytes = new Uint8Array(await response.arrayBuffer())
        if (bytes.byteLength > P.MAX_EPUB_BYTES) { writeFileSync(path + '.oversize', String(bytes.byteLength)); return { oversize: bytes.byteLength } }
        writeFileSync(path, bytes)
        return { path }
      } catch (error) {
        if (attempt === 2) { process.stderr.write(`download failed ${url}: ${error.message}\n`); return null }
        await new Promise(r => setTimeout(r, 2000 * (attempt + 1)))
      }
    }
    return null
  }
  /** Every URL the Worker may ask for, in its order: the images EPUB, then the no-images one only if needed. */
  async function filesFor(work) {
    const files = {}
    for (const edition of P.importEditions(work)) {
      if (edition.source !== 'Gutenberg') continue
      for (const url of edition.epubUrls) {
        const file = await fetchFile(url)
        if (file) files[url] = file
        if (file && !file.oversize) return files
      }
    }
    return files
  }

  // ---- Checks, in worker threads (each book bounded in time and memory) ----
  // Each result is appended to <out>.jsonl as it lands, so a run can be resumed (--resume).
  const results = []
  const progress = OUT ? OUT.replace(/\.json$/, '') + '.jsonl' : null
  if (progress && flag('--resume') && existsSync(progress)) {
    for (const line of readFileSync(progress, 'utf8').split('\n')) if (line.trim()) results.push(JSON.parse(line))
  } else if (progress) writeFileSync(progress, '')
  const groupOf = new Map(picks.map(w => [w.id, w.group]))
  for (const r of results) r.group ??= groupOf.get(r.id)
  const done = new Set(results.map(r => r.id))
  const queue = picks.filter(w => !done.has(w.id))
  let active = 0
  const prefetch = new Map()
  const prefetchAhead = () => {
    for (const w of queue.slice(0, WORKERS * 2)) if (!w.missing && !prefetch.has(w.id)) prefetch.set(w.id, filesFor(w))
  }
  const record = (row, files = {}) => {
    results.push(row)
    if (progress) writeFileSync(progress, JSON.stringify(row) + '\n', { flag: 'a' })
    const keep = KEEP === 'all' || (KEEP === 'failing' && !row.ok)
    if (!keep) for (const file of Object.values(files)) if (file.path && existsSync(file.path)) unlinkSync(file.path)
    process.stderr.write(`${results.length}/${picks.length} ${row.id} ${row.ok ? 'ok' : `FAIL ${row.stage} ${row.error}${row.detail ? ' — ' + row.detail : ''}`} ${((row.ms || 0) / 1000).toFixed(1)}s\n`)
  }
  // A heap like a browser tab's: a book that needs more fails as `crash` here, as it would on a phone.
  const RECYCLE = Number(opt('--recycle', '20'))
  function spawn() { return new Worker(SCRIPT, { workerData: { bundle }, resourceLimits: { maxOldGenerationSizeMb: Number(opt('--heap-mb', '2048')) } }) }
  await new Promise(resolveAll => {
    const next = worker => {
      if (!queue.length) { worker.terminate(); if (--active === 0) resolveAll(); return }
      const work = queue.shift()
      prefetchAhead()
      ;(async () => {
        if (work.missing) { record({ id: work.id, group: work.group, ok: false, stage: 'catalogue', error: 'not_in_catalogue' }); return next(worker) }
        const files = await (prefetch.get(work.id) ?? filesFor(work))
        prefetch.delete(work.id)
        const { group, ...plain } = work
        let settled = false
        const timer = setTimeout(() => {
          if (settled) return
          settled = true
          worker.removeAllListeners('message')
          worker.removeAllListeners('error')
          worker.terminate()
          record({ id: work.id, title: work.title, group, ok: false, stage: 'timeout', error: 'timeout', detail: `over ${TIMEOUT_MS / 1000}s` }, files)
          next(spawn())
        }, TIMEOUT_MS)
        worker.removeAllListeners('message')
        worker.removeAllListeners('error')
        worker.once('error', error => {
          if (settled) return
          settled = true
          clearTimeout(timer)
          record({ id: work.id, title: work.title, group, ok: false, stage: 'crash', error: 'crash', detail: String(error?.message || error).slice(0, 300) }, files)
          next(spawn())
        })
        worker.once('message', row => {
          if (settled) return
          settled = true
          clearTimeout(timer)
          row.group = group
          record(row, files)
          // A fresh thread every few books: memory outside the heap (the books' bytes) is let go of
          // only slowly, and long runs otherwise grew past the machine's memory at ~300 books.
          worker.books = (worker.books || 0) + 1
          if (worker.books >= RECYCLE) { worker.terminate(); next(spawn()) } else next(worker)
        })
        worker.postMessage({ work: { ...plain, group }, files })
      })()
    }
    prefetchAhead()
    const n = Math.min(WORKERS, queue.length)
    if (!n) resolveAll()
    for (let i = 0; i < n; i++) { active++; next(spawn()) }
  })
  rmSync(scratch, { recursive: true, force: true })

  // ---- Report ----
  const passed = results.filter(r => r.ok).length
  const causes = {}
  for (const r of results.filter(r => !r.ok)) {
    const key = `${r.stage}: ${r.error}`
    ;(causes[key] ??= []).push(r.id)
  }
  const byGroup = {}
  for (const r of results) { const g = (byGroup[r.group] ??= { sampled: 0, passed: 0 }); g.sampled++; if (r.ok) g.passed++ }
  const slow = results.filter(r => (r.commitMs || 0) > 10_000).map(r => ({ id: r.id, commitMs: r.commitMs }))
  console.log(`Gutenberg Add to Tinct check · ${new Date().toISOString()} · ${results.length} works · passed ${passed} (${(100 * passed / Math.max(1, results.length)).toFixed(1)}%)`)
  for (const [group, g] of Object.entries(byGroup)) console.log(`  ${group}: ${g.passed}/${g.sampled}`)
  for (const [cause, ids] of Object.entries(causes).sort((a, b) => b[1].length - a[1].length)) console.log(`  FAIL ${cause}: ${ids.length} (${ids.slice(0, 8).join(', ')})`)
  if (slow.length) console.log(`  commits over 10 s (Worker CPU risk): ${slow.map(s => `${s.id} ${(s.commitMs / 1000).toFixed(1)}s`).join(', ')}`)
  if (OUT) writeFileSync(OUT, JSON.stringify({ at: new Date().toISOString(), seed: SEED, sampled: results.length, passed, byGroup, causes, results }, null, 2))
}
