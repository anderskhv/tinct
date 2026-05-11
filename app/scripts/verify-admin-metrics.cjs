#!/usr/bin/env node
/**
 * Verify the beta metrics dashboard plumbing.
 *
 * Local/service checks:
 *   npm run admin:verify
 *
 * Live route check:
 *   npm run admin:verify -- --base=https://tinct.app
 *
 * Verify a specific admin:
 *   npm run admin:verify -- --email=anders@example.com
 *   npm run admin:verify -- --user-id=00000000-0000-0000-0000-000000000000
 */

const fs = require('fs')
const path = require('path')

const APP_DIR = path.resolve(__dirname, '..')
const ENV_FILE = path.join(APP_DIR, '.env')

function readEnv() {
  const env = {}
  if (!fs.existsSync(ENV_FILE)) return env
  for (const line of fs.readFileSync(ENV_FILE, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (!match) continue
    env[match[1]] = match[2].replace(/^["']|["']$/g, '')
  }
  return env
}

function parseArgs(argv) {
  const args = { base: '', email: '', userId: '' }
  for (const arg of argv) {
    if (arg.startsWith('--base=')) args.base = arg.slice('--base='.length).replace(/\/+$/, '')
    else if (arg.startsWith('--email=')) args.email = arg.slice('--email='.length).trim().toLowerCase()
    else if (arg.startsWith('--user-id=')) args.userId = arg.slice('--user-id='.length).trim()
    else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }
  return args
}

async function supabaseFetch(env, pathAndQuery, init = {}) {
  const res = await fetch(`${env.VITE_SUPABASE_URL}/rest/v1/${pathAndQuery}`, {
    ...init,
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  })
  const text = await res.text()
  let body = null
  try { body = text ? JSON.parse(text) : null } catch { body = text }
  if (!res.ok) {
    throw new Error(`${pathAndQuery}: ${res.status} ${res.statusText}: ${typeof body === 'string' ? body : JSON.stringify(body)}`)
  }
  return body
}

async function findUserId(env, email) {
  const rows = await supabaseFetch(env, `profiles?email=eq.${encodeURIComponent(email)}&select=id,email&limit=1`)
  return Array.isArray(rows) && rows[0]?.id ? rows[0].id : ''
}

async function verifyLiveRoute(base) {
  if (!base) return
  const res = await fetch(`${base}/admin/metrics`, {
    headers: { 'User-Agent': 'Tinct admin metrics verifier' },
  })
  if (res.status !== 200) throw new Error(`${base}/admin/metrics returned ${res.status}`)
  const robots = res.headers.get('x-robots-tag') || ''
  if (!robots.includes('noindex')) {
    throw new Error(`${base}/admin/metrics is missing X-Robots-Tag noindex`)
  }
  const html = await res.text()
  if (!html.includes('<div id="root">')) {
    throw new Error(`${base}/admin/metrics did not serve the SPA shell`)
  }
  console.log(`✓ ${base}/admin/metrics serves the app shell with noindex`)
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const env = readEnv()
  if (!env.VITE_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in app/.env')
  }

  await verifyLiveRoute(args.base)

  const admins = await supabaseFetch(env, 'site_admins?select=user_id,created_at&limit=20')
  console.log(`✓ site_admins readable with service role (${Array.isArray(admins) ? admins.length : 0} rows sampled)`)

  const analytics = await supabaseFetch(env, 'analytics_events?select=id,event_type,path,created_at&order=created_at.desc&limit=1')
  console.log(`✓ analytics_events readable with service role (${Array.isArray(analytics) ? analytics.length : 0} recent rows sampled)`)

  const targetUserId = args.userId || (args.email ? await findUserId(env, args.email) : '')
  if (args.email && !targetUserId) throw new Error(`No profile found for ${args.email}`)

  if (targetUserId) {
    const rows = await supabaseFetch(env, `site_admins?user_id=eq.${encodeURIComponent(targetUserId)}&select=user_id&limit=1`)
    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error(`${targetUserId} is not in public.site_admins. Run: npm run admin:grant -- ${args.email || targetUserId}`)
    }
    console.log(`✓ ${targetUserId} is authorized for /admin/metrics`)
  } else {
    console.log('! No --email or --user-id supplied; skipped specific admin check')
  }

  console.log('✓ Admin metrics plumbing verified')
}

main().catch(err => {
  console.error(`✗ ${err.message}`)
  process.exit(1)
})
