#!/usr/bin/env node
/**
 * Weekly position-jump check: aggregate counts only (approved 17 Nov 2026).
 *
 *   SUPABASE_SERVICE_ROLE_KEY=… VITE_SUPABASE_URL=… node scripts/report-position-jumps.mjs [--days 7]
 *
 * Reads every account's `user_data` row `reading-memory` with the service
 * role (read-only GETs), leaves out Tinct's own test accounts
 * (`profiles.is_test`, or a reserved test address such as @test.tinct.app,
 * the same rule as admin metrics), and counts the
 * three kinds of place jump defined in scripts/lib/positionJumps.mjs over the
 * last N days.
 *
 * Output is counts only: events, accounts and books per kind, and per-day
 * totals. No user id, email, name, book title or text is printed, written or
 * logged; errors print an HTTP status, never a response body. Rows are
 * processed one page at a time and dropped.
 */
import { countPositionJumps, isTestProfile } from './lib/positionJumps.mjs'

const PAGE = 100

function arg(name, fallback) {
  const i = process.argv.indexOf(name)
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback
}

const url = process.env.VITE_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment.')
  process.exit(1)
}
const days = Number(arg('--days', '7'))
if (!Number.isInteger(days) || days < 1 || days > 60) {
  console.error('--days must be a whole number from 1 to 60.')
  process.exit(1)
}

async function get(path) {
  const res = await fetch(`${url}/rest/v1/${path}`, { headers: { apikey: key, Authorization: `Bearer ${key}` } })
  if (!res.ok) {
    const error = new Error(`Supabase read failed (${res.status})`)
    error.status = res.status
    throw error
  }
  return res.json()
}

async function* pages(path) {
  for (let offset = 0; ; offset += PAGE) {
    const rows = await get(`${path}&limit=${PAGE}&offset=${offset}`)
    yield rows
    if (rows.length < PAGE) return
  }
}

/**
 * Which of these accounts are test accounts (lib/positionJumps.mjs
 * isTestProfile). profiles.is_test exists once 20261010_profiles_is_test.sql
 * has run; until then the address alone tells, as in admin metrics.
 */
let withTestFlag = true
async function testAccountsAmong(ids) {
  const test = new Set()
  for (let i = 0; i < ids.length; i += 50) {
    const group = ids.slice(i, i + 50).join(',')
    let rows
    try {
      rows = await get(`profiles?id=in.(${group})&select=id,email${withTestFlag ? ',is_test' : ''}`)
    } catch (error) {
      if (!withTestFlag || error.status !== 400) throw error
      withTestFlag = false
      rows = await get(`profiles?id=in.(${group})&select=id,email`)
    }
    for (const row of rows) if (isTestProfile(row)) test.add(row.id)
  }
  return test
}

function slim(session) {
  const a = session?.anchor ?? {}
  return {
    startedAt: session?.startedAt, lastActiveAt: session?.lastActiveAt, endedAt: session?.endedAt, deviceId: session?.deviceId,
    anchor: { bookId: a.bookId, editionKey: a.editionKey, chapterNumber: a.chapterNumber, paragraphIndex: a.paragraphIndex,
      range: { startParagraphIndex: a.range?.startParagraphIndex, endParagraphIndex: a.range?.endParagraphIndex } },
  }
}

const now = Date.now()
const accounts = []
let skippedTest = 0
for await (const rows of pages('user_data?key=eq.reading-memory&select=user_id,value&order=user_id')) {
  const excluded = await testAccountsAmong(rows.map(row => row.user_id))
  for (const row of rows) {
    if (excluded.has(row.user_id)) { skippedTest++; continue }
    const raw = row.value && typeof row.value === 'object' ? row.value.sessions : null
    const list = Array.isArray(raw) ? raw : Object.values(raw ?? {})
    // Only the clock and place fields go on (no text, summaries or ids);
    // the account is known by its position in the list.
    accounts.push({ sessions: list.map(slim) })
  }
}

const report = countPositionJumps(accounts, { now, days })
console.log(JSON.stringify({ ...report, testAccountsSkipped: skippedTest, testFlagColumn: withTestFlag }, null, 2))
