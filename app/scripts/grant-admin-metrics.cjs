#!/usr/bin/env node
/**
 * Grant access to /admin/metrics.
 *
 * Usage:
 *   npm run admin:grant -- anders@example.com
 *   npm run admin:grant -- 00000000-0000-0000-0000-000000000000
 *
 * Requires app/.env:
 *   VITE_SUPABASE_URL=
 *   SUPABASE_SERVICE_ROLE_KEY=
 */

const fs = require('fs')
const path = require('path')

const APP_DIR = path.resolve(__dirname, '..')
const ENV_FILE = path.join(APP_DIR, '.env')

function readEnv() {
  const env = {}
  if (!fs.existsSync(ENV_FILE)) throw new Error(`Missing ${ENV_FILE}`)
  for (const line of fs.readFileSync(ENV_FILE, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (!match) continue
    env[match[1]] = match[2].replace(/^["']|["']$/g, '')
  }
  return env
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
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
    throw new Error(`${res.status} ${res.statusText}: ${typeof body === 'string' ? body : JSON.stringify(body)}`)
  }
  return body
}

async function findUserId(env, identifier) {
  if (isUuid(identifier)) return identifier
  const email = identifier.trim().toLowerCase()
  const rows = await supabaseFetch(env, `profiles?email=eq.${encodeURIComponent(email)}&select=id,email&limit=1`)
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error(`No profile found for ${email}. Sign in once, then rerun this command.`)
  }
  return rows[0].id
}

async function main() {
  const identifier = process.argv[2]
  if (!identifier) {
    console.error('Usage: npm run admin:grant -- <email-or-user-id>')
    process.exit(1)
  }

  const env = readEnv()
  if (!env.VITE_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in app/.env')
  }

  const userId = await findUserId(env, identifier)
  await supabaseFetch(env, 'site_admins?on_conflict=user_id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify([{ user_id: userId }]),
  })

  console.log(`✓ Granted /admin/metrics access to ${userId}`)
}

main().catch(err => {
  console.error(`✗ ${err.message}`)
  process.exit(1)
})
