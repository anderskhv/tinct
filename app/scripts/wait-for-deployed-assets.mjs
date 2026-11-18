// After a deploy, wait until every content-hashed script and stylesheet the new build ships is served by the
// edge, byte for byte, before any live check runs (18 Nov 2026: three releases rolled back with a page stuck
// on its own /assets files right after the version went live, while the existing step only verified
// index-*.js). Logs how long the edge took and which files were late, so the evidence stays in the run.
//   TINCT_ORIGIN=https://tinct.app node scripts/wait-for-deployed-assets.mjs [distDir]
import fs from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
const { checkHeaders } = createRequire(import.meta.url)('./lib/internalTraffic.cjs')

const origin = (process.env.TINCT_ORIGIN || 'https://tinct.app').replace(/\/+$/, '')
const dist = path.resolve(process.argv[2] || 'dist')
const deadlineMs = Number(process.env.ASSET_WAIT_MS || 180_000)
const concurrency = 16
const files = (await fs.readdir(path.join(dist, 'assets'))).filter(name => /\.(js|css)$/.test(name))
const sha = buf => createHash('sha256').update(buf).digest('hex')
const expected = new Map(await Promise.all(files.map(async name => [name, sha(await fs.readFile(path.join(dist, 'assets', name)))])))
const started = Date.now()
const readyAt = new Map()
const lastProblem = new Map()

async function check(name) {
  try {
    const response = await fetch(`${origin}/assets/${name}`, { headers: checkHeaders({ 'User-Agent': 'Tinct-deploy-asset-wait' }), signal: AbortSignal.timeout(20_000) })
    const body = Buffer.from(await response.arrayBuffer())
    if (response.status === 200 && sha(body) === expected.get(name)) { readyAt.set(name, Date.now() - started); return }
    lastProblem.set(name, `status ${response.status}${response.status === 200 ? ' (different bytes)' : ''} cache ${response.headers.get('cf-cache-status')} ray ${response.headers.get('cf-ray')}`)
  } catch (error) { lastProblem.set(name, String(error)) }
}

let pending = [...files]
let round = 0
while (pending.length && Date.now() - started < deadlineMs) {
  round += 1
  const queue = [...pending]
  await Promise.all(Array.from({ length: concurrency }, async () => { while (queue.length) await check(queue.shift()) }))
  pending = pending.filter(name => !readyAt.has(name))
  if (pending.length) await new Promise(resolve => setTimeout(resolve, 5000))
}
const times = [...readyAt.values()].sort((a, b) => a - b)
const late = [...readyAt.entries()].filter(([, ms]) => ms > 5000).sort((a, b) => b[1] - a[1])
console.log(JSON.stringify({ origin, files: files.length, ready: readyAt.size, rounds: round, slowestMs: times.at(-1) ?? null,
  late: late.slice(0, 20).map(([name, ms]) => ({ name, ms, firstProblem: lastProblem.get(name) })) }))
if (pending.length) {
  console.log(`::error::${pending.length} of ${files.length} assets not served after ${Math.round((Date.now() - started) / 1000)} s: ` +
    pending.slice(0, 10).map(name => `${name} (${lastProblem.get(name)})`).join('; '))
  process.exit(1)
}
console.log(`all ${files.length} assets served after ${Math.round((Date.now() - started) / 1000)} s (${round} round(s))`)
