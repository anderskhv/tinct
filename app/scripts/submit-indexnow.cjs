#!/usr/bin/env node
/**
 * Submit sitemap URLs to IndexNow.
 *
 * Usage:
 *   INDEXNOW_KEY=... npm run indexnow
 *   INDEXNOW_KEY=... npm run indexnow -- --limit=25 --dry-run
 *
 * The Worker serves the verification file at:
 *   https://tinct.app/{INDEXNOW_KEY}.txt
 */

const fs = require('fs')
const path = require('path')

const APP_DIR = path.resolve(__dirname, '..')
const SITEMAP = path.join(APP_DIR, 'public/sitemap.xml')
const DEFAULT_ENDPOINT = 'https://api.indexnow.org/indexnow'
const DEFAULT_HOST = 'tinct.app'
const DEFAULT_ORIGIN = `https://${DEFAULT_HOST}`
const KEY_RE = /^[A-Za-z0-9-]{8,128}$/

function loadEnvValue(name) {
  if (process.env[name]) return process.env[name]

  const envPath = path.join(APP_DIR, '.env')
  if (!fs.existsSync(envPath)) return ''

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (!match || match[1] !== name) continue
    const raw = match[2].trim()
    return raw.replace(/^(['"])([\s\S]*)\1$/, '$2')
  }

  return ''
}

function usage() {
  console.log(`Usage: INDEXNOW_KEY=... node scripts/submit-indexnow.cjs [options]

Options:
  --sitemap=PATH       Sitemap XML path (default: public/sitemap.xml)
  --endpoint=URL       IndexNow endpoint (default: ${DEFAULT_ENDPOINT})
  --host=HOST          Host in the IndexNow payload (default: ${DEFAULT_HOST})
  --origin=URL         URL origin allowed in submissions (default: ${DEFAULT_ORIGIN})
  --limit=N            Submit only the first N sitemap URLs
  --batch-size=N       URLs per POST, max 10000 (default: 10000)
  --dry-run            Print what would be submitted without posting
  --skip-key-check     Do not preflight the live key file
  --help               Show this help
`)
}

function parseArgs(argv) {
  const args = {
    sitemap: SITEMAP,
    endpoint: DEFAULT_ENDPOINT,
    host: DEFAULT_HOST,
    origin: DEFAULT_ORIGIN,
    limit: 0,
    batchSize: 10_000,
    dryRun: false,
    skipKeyCheck: false,
  }

  for (const arg of argv) {
    if (arg === '--help' || arg === '-h') {
      usage()
      process.exit(0)
    } else if (arg === '--dry-run') {
      args.dryRun = true
    } else if (arg === '--skip-key-check') {
      args.skipKeyCheck = true
    } else if (arg.startsWith('--sitemap=')) {
      args.sitemap = path.resolve(APP_DIR, arg.slice('--sitemap='.length))
    } else if (arg.startsWith('--endpoint=')) {
      args.endpoint = arg.slice('--endpoint='.length)
    } else if (arg.startsWith('--host=')) {
      args.host = arg.slice('--host='.length)
    } else if (arg.startsWith('--origin=')) {
      args.origin = arg.slice('--origin='.length).replace(/\/+$/, '')
    } else if (arg.startsWith('--limit=')) {
      args.limit = Math.max(0, Number(arg.slice('--limit='.length)) || 0)
    } else if (arg.startsWith('--batch-size=')) {
      args.batchSize = Math.max(1, Math.min(10_000, Number(arg.slice('--batch-size='.length)) || 10_000))
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }

  return args
}

function sitemapUrls(xml, origin) {
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1])
  return [...new Set(urls)].filter(url => url.startsWith(`${origin}/`) || url === `${origin}/`)
}

function chunks(items, size) {
  const out = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}

async function verifyKeyFile(key, keyLocation) {
  const resp = await fetch(keyLocation, {
    headers: { 'User-Agent': 'Tinct IndexNow submitter' },
  })
  if (resp.status !== 200) {
    throw new Error(`IndexNow key file returned HTTP ${resp.status}: ${keyLocation}`)
  }
  const body = (await resp.text()).trim()
  if (body !== key) {
    throw new Error(`IndexNow key file did not contain the configured key: ${keyLocation}`)
  }
}

async function submitBatch(endpoint, payload) {
  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'User-Agent': 'Tinct IndexNow submitter',
    },
    body: JSON.stringify(payload),
  })
  const text = await resp.text()
  if (!resp.ok) {
    throw new Error(`IndexNow POST failed with HTTP ${resp.status}: ${text || resp.statusText}`)
  }
  return { status: resp.status, body: text }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const key = loadEnvValue('INDEXNOW_KEY')
  if (!KEY_RE.test(key)) {
    throw new Error('INDEXNOW_KEY must be 8-128 characters and contain only letters, numbers, or hyphens.')
  }

  const xml = fs.readFileSync(args.sitemap, 'utf8')
  let urls = sitemapUrls(xml, args.origin)
  if (args.limit > 0) urls = urls.slice(0, args.limit)
  if (urls.length === 0) throw new Error(`No URLs found for ${args.origin} in ${args.sitemap}`)

  const keyLocation = `${args.origin}/${key}.txt`
  console.log(`[indexnow] ${urls.length} URL${urls.length === 1 ? '' : 's'} from ${path.relative(APP_DIR, args.sitemap)}`)
  console.log(`[indexnow] keyLocation: ${keyLocation}`)

  if (!args.dryRun && !args.skipKeyCheck) {
    await verifyKeyFile(key, keyLocation)
    console.log('[indexnow] key file verified')
  }

  const batches = chunks(urls, args.batchSize)
  for (let i = 0; i < batches.length; i++) {
    const payload = {
      host: args.host,
      key,
      keyLocation,
      urlList: batches[i],
    }

    if (args.dryRun) {
      console.log(`[indexnow] dry run batch ${i + 1}/${batches.length}: ${payload.urlList.length} URLs`)
      continue
    }

    const result = await submitBatch(args.endpoint, payload)
    console.log(`[indexnow] submitted batch ${i + 1}/${batches.length}: ${payload.urlList.length} URLs (HTTP ${result.status})`)
  }
}

main().catch(err => {
  console.error(`[indexnow] FAILED: ${err.message}`)
  process.exit(1)
})
