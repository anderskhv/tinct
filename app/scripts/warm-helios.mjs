// Warm Grok narration in the Helios voice (public key 'm') for the first
// chapters of the most-read books, through the deployed Worker.
//
// Bundle, then run (see .github/workflows/helios-warm.yml):
//   npx esbuild scripts/warm-helios.mjs --bundle --platform=node --format=esm --outfile=/tmp/tinct-warm-helios.mjs
//   HELIOS_DRY_RUN=true  node /tmp/tinct-warm-helios.mjs   # plan and estimate, no network
//   HELIOS_DRY_RUN=false XAI_API_KEY=… node /tmp/tinct-warm-helios.mjs
//
// Auth is the same expiring, body-bound HMAC the approved-openings warmer uses
// (narrationReleaseAuth.ts); the xAI secret never leaves the runner. The Worker
// owns the daily/monthly ceilings and the synthesis leases; this script stops
// cleanly on a ceiling, 429 or provider auth/payment failure. Cached chunks
// cost nothing, so re-running is safe. Only voice 'm' (Helios) is ever sent.
import fs from 'node:fs/promises'
import { BOOKS } from '../src/data/bookRegistry.ts'
import { defaultPrimaryEditionKey } from '../src/data/editionDefaults.ts'
import { editionHold, isBookTemporarilyHeld } from '../src/data/editionAvailability.ts'
import { isEditionWithheld } from '../src/data/withheldEditions.ts'
import { narrationTokens, chunkNarrationTokens, utf8ByteLength, isPilotScope, NARRATION_MAX_PARAGRAPHS_PER_REQUEST } from '../src/narration/narrationCore.ts'
import { releaseWarmSignature } from '../src/narration/narrationReleaseAuth.ts'

const VOICE = 'm' // Helios. Never parameterised: this job must not warm other voices.
const USD_PER_MILLION_CHARS = 15 // xAI TTS, src/worker/lib/aiUsage.ts AI_PRICING.xai.ttsPerMChars
const origin = process.env.NARRATION_ORIGIN || 'https://tinct.app'
const dryRun = (process.env.HELIOS_DRY_RUN ?? 'true') !== 'false'
const bookIds = (process.env.HELIOS_BOOKS || '').split(',').map(s => s.trim()).filter(Boolean)
const chapterNumbers = (process.env.HELIOS_CHAPTERS || '1,2,3').split(',').map(s => Number(s.trim()))
const outDir = 'artifacts/helios-warm'
const MAX_REQUESTS_PER_TARGET = 400
const CONCURRENCY = 3

if (bookIds.length === 0) throw new Error('HELIOS_BOOKS is required')
if (chapterNumbers.length === 0 || chapterNumbers.some(n => !Number.isInteger(n) || n < 1)) throw new Error('HELIOS_CHAPTERS must be positive integers')
if (!dryRun && !process.env.XAI_API_KEY) throw new Error('Missing cloud release credential')

const wrangler = await fs.readFile('wrangler.jsonc', 'utf8')
const ceiling = name => Number(new RegExp(`"${name}"\\s*:\\s*"(\\d+)"`).exec(wrangler)?.[1] || 0)
const ceilings = { dailyBytes: ceiling('NARRATION_DAILY_BYTES'), monthlyBytes: ceiling('NARRATION_MONTHLY_BYTES') }

// ---- Plan: default primary edition, held/withheld editions skipped ----
const targets = []
const skipped = []
for (const bookId of bookIds) {
  const book = BOOKS.find(b => b.id === bookId)
  if (!book) { skipped.push({ bookId, reason: 'unknown book id' }); continue }
  if (isBookTemporarilyHeld(bookId)) { skipped.push({ bookId, reason: 'book held' }); continue }
  const editionKey = defaultPrimaryEditionKey(bookId, book.editions)
  if (!editionKey || editionHold(bookId, editionKey) || isEditionWithheld(bookId, editionKey)) { skipped.push({ bookId, reason: `edition unavailable (${editionKey})` }); continue }
  let data
  try { data = JSON.parse(await fs.readFile(`public/data/editions/${bookId}-${editionKey}.json`, 'utf8')) } catch { skipped.push({ bookId, editionKey, reason: 'edition text missing' }); continue }
  for (const chapter of chapterNumbers) {
    if (!isPilotScope(bookId, editionKey, chapter)) { skipped.push({ bookId, editionKey, chapter, reason: 'outside narration scope (non-English edition)' }); continue }
    // Same lookup as the Worker: chapter by number, else by position.
    const entry = data.chapters.find(c => c.number === chapter) ?? data.chapters[chapter - 1]
    if (!entry || !Array.isArray(entry.paragraphs)) { skipped.push({ bookId, editionKey, chapter, reason: 'chapter missing' }); continue }
    const paragraphs = entry.paragraphs.map(p => {
      const chunks = chunkNarrationTokens(narrationTokens(typeof p === 'string' ? p : ''))
      return { chunks: chunks.map(c => ({ chars: c.text.length, bytes: utf8ByteLength(c.text) })) }
    })
    const spoken = paragraphs.filter(p => p.chunks.length > 0)
    targets.push({
      bookId, editionKey, chapter, title: entry.title || '', paragraphs,
      paragraphCount: spoken.length,
      chunkCount: spoken.reduce((n, p) => n + p.chunks.length, 0),
      chars: spoken.reduce((n, p) => n + p.chunks.reduce((m, c) => m + c.chars, 0), 0),
      bytes: spoken.reduce((n, p) => n + p.chunks.reduce((m, c) => m + c.bytes, 0), 0),
    })
  }
}
const planned = {
  chars: targets.reduce((n, t) => n + t.chars, 0),
  bytes: targets.reduce((n, t) => n + t.bytes, 0),
  paragraphs: targets.reduce((n, t) => n + t.paragraphCount, 0),
}
const estimate = {
  ...planned,
  usdAtFullSynthesis: Number((planned.chars / 1e6 * USD_PER_MILLION_CHARS).toFixed(2)),
  ceilings,
  fitsDailyCeiling: planned.bytes <= ceilings.dailyBytes,
  fitsMonthlyCeiling: planned.bytes <= ceilings.monthlyBytes,
}

const fmt = n => n.toLocaleString('en-US')
const summaryMd = rows => [
  `# Helios warm (${dryRun ? 'dry run' : 'real run'})`,
  '',
  `Origin ${origin}. Voice Helios (key m). Chapters ${chapterNumbers.join(',')}.`,
  '',
  `Estimate if nothing is cached: ${fmt(estimate.chars)} characters (${fmt(estimate.bytes)} UTF-8 bytes) in ${fmt(estimate.paragraphs)} paragraphs, about $${estimate.usdAtFullSynthesis} at $${USD_PER_MILLION_CHARS} per million characters.`,
  `Worker ceilings: ${fmt(ceilings.dailyBytes)} bytes/day, ${fmt(ceilings.monthlyBytes)} bytes/month. Fits daily: ${estimate.fitsDailyCeiling}. Fits monthly: ${estimate.fitsMonthlyCeiling}.`,
  '',
  '| Book | Edition | Ch | Paragraphs | Cached before | Generated | Failures | Characters | Bytes generated | Outcome |',
  '|---|---|---|---|---|---|---|---|---|---|',
  ...rows.map(r => `| ${r.bookId} | ${r.editionKey} | ${r.chapter} | ${r.paragraphs} | ${r.cachedBefore ?? '-'} | ${r.generated ?? '-'} | ${r.failures ?? '-'} | ${fmt(r.chars)} | ${r.bytesGenerated ?? '-'} | ${r.outcome} |`),
  ...(skipped.length ? ['', 'Skipped:', ...skipped.map(s => `- ${JSON.stringify(s)}`)] : []),
].join('\n')

async function writeSummary(report, rows) {
  await fs.mkdir(outDir, { recursive: true })
  await fs.writeFile(`${outDir}/summary.json`, JSON.stringify(report, null, 2))
  const md = summaryMd(rows)
  await fs.writeFile(`${outDir}/summary.md`, md)
  if (process.env.GITHUB_STEP_SUMMARY) await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, md + '\n')
}

const baseRow = t => ({ bookId: t.bookId, editionKey: t.editionKey, chapter: t.chapter, title: t.title, paragraphs: t.paragraphCount, chars: t.chars, bytes: t.bytes })

if (dryRun) {
  const rows = targets.map(t => ({ ...baseRow(t), outcome: 'planned' }))
  for (const r of rows) console.log(`${r.bookId}/${r.editionKey} ch${r.chapter} "${r.title}": ${r.paragraphs} paragraphs, ${fmt(r.chars)} chars`)
  console.log(JSON.stringify({ dryRun, estimate, skipped }, null, 2))
  await writeSummary({ dryRun, origin, voice: VOICE, estimate, skipped, targets: rows }, rows)
  process.exit(0)
}

// ---- Real run ----
async function releaseFetch(path, init = {}) {
  const method = init.method || 'GET'
  const timestamp = String(Date.now())
  const signature = await releaseWarmSignature(process.env.XAI_API_KEY, method, path, timestamp, init.body || '')
  return fetch(origin + path, {
    ...init, method,
    headers: { 'Content-Type': 'application/json', 'x-narration-provider': 'grok', 'x-narration-release-time': timestamp, 'x-narration-release-signature': signature },
    signal: AbortSignal.timeout(95000),
  })
}
const sleep = ms => new Promise(r => setTimeout(r, ms))
let halt = null // set once; every worker stops at its next request
const HALT_REASONS = new Set(['budget_exhausted', 'provider_auth', 'provider_payment'])

async function listChapter(t) {
  const path = `/api/narration/chapter?bookId=${t.bookId}&editionKey=${t.editionKey}&chapter=${t.chapter}&voice=${VOICE}`
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const res = await releaseFetch(path)
    if (res.ok) return (await res.json()).paragraphs
    if (res.status === 429) { halt = 'rate_limited'; throw new Error('HTTP 429 listing chapter') }
    if (res.status >= 500) { await sleep(3000 * (attempt + 1)); continue }
    if (res.status === 401 || res.status === 403) { halt = 'unauthorized'; throw new Error(`HTTP ${res.status} listing chapter`) }
    throw new Error(`HTTP ${res.status} listing chapter`)
  }
  throw new Error('listing gave up after retries')
}

async function warmTarget(t) {
  const row = { ...baseRow(t), cachedBefore: 0, generated: 0, failures: 0, bytesGenerated: 0, outcome: 'done' }
  let listing
  try { listing = await listChapter(t) } catch (error) { return { ...row, failures: 1, outcome: halt || 'list_failed', note: error.message } }
  const readyBefore = new Map() // paragraph -> Set of ready chunk indexes
  for (const p of listing) readyBefore.set(p.paragraph, new Set((p.chunks || []).filter(c => c.ready).map(c => c.index)))
  const readyNow = new Map([...readyBefore].map(([k, v]) => [k, new Set(v)]))
  const spokenIndexes = t.paragraphs.map((p, i) => (p.chunks.length > 0 ? i : -1)).filter(i => i >= 0)
  const complete = i => (readyNow.get(i)?.size ?? 0) >= t.paragraphs[i].chunks.length
  row.cachedBefore = spokenIndexes.filter(complete).length
  let incomplete = spokenIndexes.filter(i => !complete(i))
  let requests = 0
  let stalls = 0
  while (incomplete.length > 0 && !halt) {
    if (++requests > MAX_REQUESTS_PER_TARGET) { row.outcome = 'request_cap'; break }
    const batch = incomplete.slice(0, NARRATION_MAX_PARAGRAPHS_PER_REQUEST)
    let res
    try {
      res = await releaseFetch('/api/narration/warm', { method: 'POST', body: JSON.stringify({ bookId: t.bookId, editionKey: t.editionKey, chapter: t.chapter, voice: VOICE, mode: 'all', paragraphs: batch.map(index => ({ index })) }) })
    } catch (error) { row.failures += 1; if (++stalls >= 3) { row.outcome = 'stalled'; break } await sleep(5000); continue }
    if (res.status === 429) { halt = 'rate_limited'; row.outcome = halt; break }
    if (res.status === 401 || res.status === 403) { halt = 'unauthorized'; row.outcome = halt; break }
    if (res.status !== 200) { row.failures += 1; if (++stalls >= 3) { row.outcome = `http_${res.status}`; break } await sleep(5000); continue }
    const body = await res.json()
    let progressed = false
    for (const p of body.paragraphs) {
      const ready = new Set((p.chunks || []).filter(c => c.ready).map(c => c.index))
      const before = readyNow.get(p.paragraph) ?? new Set()
      for (const index of ready) if (!before.has(index)) { progressed = true; row.bytesGenerated += t.paragraphs[p.paragraph].chunks[index]?.bytes ?? 0 }
      if (ready.size > 0) readyNow.set(p.paragraph, ready)
      if (p.status === 'failed' || p.failure) {
        row.failures += 1
        const reason = p.reason || p.failure?.reason
        console.error(`  ${t.bookId} ch${t.chapter} p${p.paragraph}: ${reason}${p.detail ? ` (${p.detail})` : ''}`)
        if (HALT_REASONS.has(reason)) { halt = reason; row.outcome = reason }
      }
    }
    row.generated += body.generated || 0
    console.log(`  ${t.bookId} ch${t.chapter} p${batch.join(',')}: +${body.generated || 0} generated`)
    incomplete = spokenIndexes.filter(i => !complete(i))
    if (!progressed && !(body.generated > 0)) { if (++stalls >= 5) { row.outcome = 'stalled'; break } await sleep(1500) } else stalls = 0
  }
  if (incomplete.length > 0 && row.outcome === 'done') row.outcome = halt || 'incomplete'
  return row
}

const queue = [...targets]
const rows = []
const report = { dryRun, origin, voice: VOICE, startedAt: new Date().toISOString(), estimate, skipped, halt: null, usageBefore: null, targets: rows }
try {
  const res = await releaseFetch('/api/narration/usage')
  if (res.ok) report.usageBefore = await res.json()
} catch { /* informational only */ }
console.log(`warming Helios for ${targets.length} chapters via ${origin}; estimate ${fmt(estimate.chars)} chars, about $${estimate.usdAtFullSynthesis}`)
await Promise.all(Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
  while (queue.length > 0 && !halt) {
    const t = queue.shift()
    rows.push(await warmTarget(t))
  }
}))
for (const t of queue) rows.push({ ...baseRow(t), outcome: 'not_started' })
rows.sort((a, b) => targets.findIndex(t => t.bookId === a.bookId && t.chapter === a.chapter) - targets.findIndex(t => t.bookId === b.bookId && t.chapter === b.chapter))
report.halt = halt
report.completedAt = new Date().toISOString()
report.totals = {
  generated: rows.reduce((n, r) => n + (r.generated || 0), 0),
  failures: rows.reduce((n, r) => n + (r.failures || 0), 0),
  bytesGenerated: rows.reduce((n, r) => n + (r.bytesGenerated || 0), 0),
}
report.totals.usdGenerated = Number((report.totals.bytesGenerated / 1e6 * USD_PER_MILLION_CHARS).toFixed(2)) // bytes ~ chars (ASCII-heavy); ceiling accounting is bytes
await writeSummary(report, rows)
console.log(JSON.stringify({ halt, totals: report.totals }, null, 2))
if (halt) console.log(`::warning::Helios warm stopped early: ${halt}. Re-run after the ceiling resets (idempotent).`)
// A ceiling stop is expected and reported; anything else incomplete fails the job.
const ceilingStop = halt === 'budget_exhausted' || halt === 'rate_limited'
process.exit(rows.every(r => r.outcome === 'done') || ceilingStop ? 0 : 1)
