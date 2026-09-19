// Warm Fish narration for whole chapters through the deployed Worker.
//
//   NARRATION_ADMIN_TOKEN=… node scripts/narration-warm.mjs --chapter 1 --voices a,b [--books odyssey,hamlet] [--first 3] [--concurrency 4]
//
// Uses POST /api/narration/warm (admin token; same generation path, locks,
// validation and ceilings as the reader's ensure) and GET /api/narration/chapter
// to see what is already cached. `--first N` warms only the first N paragraphs
// of each chapter (a fast pass so every featured book opens instantly); without
// it every paragraph is completed. Safe to re-run: cached chunks cost nothing.
import fs from 'node:fs'
import path from 'node:path'

const args = Object.fromEntries(process.argv.slice(2).map((arg, i, all) => (arg.startsWith('--') ? [arg.slice(2), all[i + 1]?.startsWith('--') || all[i + 1] === undefined ? '1' : all[i + 1]] : [])).filter(Boolean))
const origin = process.env.TINCT_ORIGIN || 'https://tinct.app'
const token = process.env.NARRATION_ADMIN_TOKEN || readDotEnv('NARRATION_ADMIN_TOKEN')
if (!token) { console.error('NARRATION_ADMIN_TOKEN is required'); process.exit(2) }
const chapter = Number(args.chapter || 1)
const voices = String(args.voices || 'a,b').split(',').filter(Boolean)
const firstN = args.first ? Number(args.first) : null
const concurrency = Number(args.concurrency || 4)
const FEATURED = ['odyssey', 'hamlet', 'the-republic', 'pride-and-prejudice', 'bible', 'frankenstein', 'the-art-of-war', 'the-histories', 'crime-and-punishment', 'jane-eyre', 'meditations', 'moby-dick', 'divine-comedy', 'iliad', 'walden', 'frederick-douglass']
const books = args.books ? String(args.books).split(',').filter(Boolean) : FEATURED
const editionsFor = book => (book === 'bible' ? ['kjv-en', 'web-en'] : ['original-en', 'modern-en'])

function readDotEnv(key) {
  try {
    const line = fs.readFileSync(path.resolve('.env'), 'utf8').split('\n').find(l => l.startsWith(`${key}=`))
    return line ? line.slice(key.length + 1).trim() : ''
  } catch { return '' }
}

async function listChapter(book, edition, voice) {
  // The admin header exempts the listing from the public per-address throttle;
  // a 429 or transient error is retried with backoff rather than aborting the run.
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const res = await fetch(`${origin}/api/narration/chapter?bookId=${book}&editionKey=${edition}&chapter=${chapter}&voice=${voice}`, { headers: { 'x-narration-admin': token } })
    if (res.ok) return (await res.json()).paragraphs
    if (res.status === 429 || res.status >= 500) { await new Promise(r => setTimeout(r, 3000 * (attempt + 1))); continue }
    throw new Error(`chapter ${book}/${edition} ${voice}: HTTP ${res.status}`)
  }
  throw new Error(`chapter ${book}/${edition} ${voice}: gave up after retries`)
}

async function warm(book, edition, voice, indexes) {
  const res = await fetch(`${origin}/api/narration/warm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-narration-admin': token },
    body: JSON.stringify({ bookId: book, editionKey: edition, chapter, voice, mode: 'all', paragraphs: indexes.map(index => ({ index })) }),
  })
  if (!res.ok) throw new Error(`warm ${book}/${edition} ${voice} ${indexes}: HTTP ${res.status} ${await res.text()}`)
  return (await res.json()).paragraphs
}

const totals = { generated: 0, requests: 0, failures: 0, startedAt: Date.now() }
const MAX_REQUESTS_PER_TARGET = 120
const STALL_ROUNDS = 5

async function warmTarget(book, edition, voice) {
  const label = `${book}/${edition}/${voice}`
  let paragraphs = await listChapter(book, edition, voice)
  if (firstN != null) paragraphs = paragraphs.slice(0, firstN)
  let incomplete = paragraphs.filter(p => p.status !== 'ready').map(p => p.paragraph)
  let stalled = 0
  // Progress is the ready-chunk count of the first incomplete paragraph; a
  // target that generates without ever advancing it is stalled, not busy.
  let progressed = { paragraph: -1, ready: -1, rounds: 0 }
  let requests = 0
  while (incomplete.length > 0) {
    if (requests >= MAX_REQUESTS_PER_TARGET) { console.error(`  ${label}: gave up after ${requests} requests`); return 'stalled' }
    const batch = incomplete.slice(0, 3)
    const started = Date.now()
    let results
    try { results = await warm(book, edition, voice, batch) } catch (error) { console.error(`  ${label}: ${error.message}`); totals.failures += 1; if (++stalled >= 3) break; await new Promise(r => setTimeout(r, 5000)); continue }
    totals.requests += 1
    requests += 1
    const first = results.find(r => r.paragraph === batch[0])
    const ready = first?.readyChunks ?? (first?.status === 'ready' ? Infinity : -1)
    if (first && progressed.paragraph === first.paragraph && ready <= progressed.ready) {
      if (++progressed.rounds >= STALL_ROUNDS) { console.error(`  ${label}: p${first.paragraph} stuck at ${first.readyChunks}/${first.chunkCount} ready for ${STALL_ROUNDS} rounds`); return 'stalled' }
    } else progressed = { paragraph: first?.paragraph ?? -1, ready, rounds: 0 }
    const failed = results.filter(r => r.status === 'failed' || r.failure)
    const done = results.filter(r => r.status === 'ready').map(r => r.paragraph)
    const generated = results.reduce((sum, r) => sum + (r.source === 'generated' ? 1 : 0), 0)
    totals.generated += generated
    const notes = results.flatMap(r => [r.waited ? 'waited' : null, r.raced ? 'raced' : null, r.retryAfterMs ? `retry ${r.retryAfterMs}ms` : null]).filter(Boolean)
    console.log(`  ${label}: p${batch.join(',p')} → ${results.map(r => `${r.status}${r.readyChunks != null ? ` ${r.readyChunks}/${r.chunkCount}` : ''}`).join(' | ')} (${((Date.now() - started) / 1000).toFixed(1)}s${generated ? `, +${generated}` : ''}${notes.length ? `, ${notes.join(' ')}` : ''})`)
    if (failed.length > 0) {
      const reason = failed[0].reason || failed[0].failure?.reason
      console.error(`  ${label}: stop, ${reason}${failed[0].detail ? ` (${failed[0].detail})` : ''}`)
      totals.failures += 1
      if (reason === 'budget_exhausted' || reason === 'provider_auth' || reason === 'provider_payment') return reason
      if (++stalled >= 3) break
      continue
    }
    const before = incomplete.length
    incomplete = incomplete.filter(index => !done.includes(index))
    if (incomplete.length === before && generated === 0) { if (++stalled >= 3) break } else stalled = 0
  }
  return incomplete.length === 0 ? 'done' : 'incomplete'
}

const queue = []
for (const book of books) for (const edition of editionsFor(book)) for (const voice of voices) queue.push({ book, edition, voice })
console.log(`warming chapter ${chapter} for ${queue.length} (book, edition, voice) targets via ${origin}${firstN != null ? `, first ${firstN} paragraphs` : ''}`)
const outcomes = []
let halt = null
await Promise.all(Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
  while (queue.length > 0 && !halt) {
    const target = queue.shift()
    const outcome = await warmTarget(target.book, target.edition, target.voice)
    outcomes.push({ ...target, outcome })
    if (outcome === 'budget_exhausted' || outcome === 'provider_auth' || outcome === 'provider_payment') halt = outcome
  }
}))
console.log(JSON.stringify({ ...totals, elapsedMinutes: Number(((Date.now() - totals.startedAt) / 60000).toFixed(1)), halt, outcomes }, null, 2))
process.exit(halt || outcomes.some(o => o.outcome !== 'done') ? 1 : 0)
