/**
 * Test accounts for Tinct's own checks against production.
 *
 * On 8–9 October 2026, QA sessions signed up 21 accounts through the live
 * sign-up form (qa-…@example.com), made profiles, followed each other and
 * used recap and narration; their AI use landed in the cost ledger under
 * those accounts as if they were readers. Every tool that needs a production
 * account must now use this helper:
 *
 *   - the address is always `qa-<label>-<random>@test.tinct.app`
 *     (TEST_ACCOUNT_DOMAIN; nobody can receive mail there, so no reader can
 *     sign up with it, and the Worker and SQL recognise it without reading
 *     anyone else's address: socialRules.isReservedTestEmail, public.is_test_email);
 *   - the account is created confirmed through the admin API with
 *     `app_metadata.is_test = true` (only the service role can set that), and
 *     its profile is marked `profiles.is_test = true` once the
 *     20261010_profiles_is_test.sql migration has run (before that the
 *     address alone excludes it);
 *   - every Tinct API call it makes carries `x-tinct-check: 1`
 *     (`checkFetch` / `checkHeaders`), and browsers it drives go through
 *     `markInternal` (internalTraffic.cjs), which adds the same header to the
 *     page's own /api/ calls.
 *
 * Deleting a test account goes through the normal account-deletion path
 * (docs/account-deletion.md); `deleteTestAccount` refuses any address that is
 * not a test address.
 *
 * CommonJS so both the .cjs and the .mjs scripts can load it. Never prints
 * passwords or keys.
 */
const { checkHeaders, checkFetch } = require('./internalTraffic.cjs')
const { randomBytes } = require('node:crypto')

const TEST_ACCOUNT_DOMAIN = 'test.tinct.app'
const TEST_ACCOUNT_PATTERN = /^qa-[a-z0-9-]{1,40}@test\.tinct\.app$/

function isTestAccountEmail(email) {
  return TEST_ACCOUNT_PATTERN.test(String(email || '').trim().toLowerCase())
}

/** `qa-<label>-<6 hex>@test.tinct.app`; the label says which tool made it (e.g. "soc-a"). */
function testAccountEmail(label) {
  const clean = String(label || 'check').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 30) || 'check'
  return `qa-${clean}-${randomBytes(3).toString('hex')}@${TEST_ACCOUNT_DOMAIN}`
}

function assertTestAccountEmail(email) {
  if (!isTestAccountEmail(email)) throw new Error(`Not a test account address (must match qa-*@${TEST_ACCOUNT_DOMAIN})`)
  return email
}

function adminHeaders(serviceKey) {
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required to create a test account')
  return checkHeaders({ apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' })
}

/** A new random sign-in secret for one throwaway test account (never stored). */
function freshTestSecret() {
  return randomBytes(18).toString('base64url')
}

/**
 * Create one confirmed test account and mark it. Returns { id, email, password }.
 * `fetchImpl` is a test seam.
 */
async function createTestAccount({ supabaseUrl, serviceKey, label, password, fetchImpl = fetch } = {}) {
  if (!supabaseUrl) throw new Error('supabaseUrl is required')
  const email = assertTestAccountEmail(testAccountEmail(label))
  const secret = password || freshTestSecret()
  const response = await fetchImpl(`${supabaseUrl}/auth/v1/admin/users`, {
    method: 'POST',
    headers: adminHeaders(serviceKey),
    body: JSON.stringify({ email, password: secret, email_confirm: true, app_metadata: { is_test: true }, user_metadata: { is_test: true } }),
  })
  if (!response.ok) throw new Error(`Test account was not created (HTTP ${response.status})`)
  const user = await response.json()
  await markTestProfile({ supabaseUrl, serviceKey, userId: user.id, fetchImpl })
  return { id: user.id, email, password: secret }
}

/**
 * profiles.is_test = true. Before the migration has run the column is missing
 * and PostgREST answers 400; the address still excludes the account then.
 * Returns whether the flag was written.
 */
async function markTestProfile({ supabaseUrl, serviceKey, userId, fetchImpl = fetch }) {
  const response = await fetchImpl(`${supabaseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`, {
    method: 'PATCH',
    headers: { ...adminHeaders(serviceKey), Prefer: 'return=minimal' },
    body: JSON.stringify({ is_test: true }),
  })
  return response.ok
}

/** Delete a test account through the Worker's account-deletion route (admin). Refuses any other address. */
async function deleteTestAccount({ origin, adminToken, userId, email, fetchImpl = fetch }) {
  assertTestAccountEmail(email)
  const response = await fetchImpl(`${origin}/api/admin/delete-user`, {
    method: 'POST',
    headers: checkHeaders({ Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' }),
    body: JSON.stringify({ userId, confirmEmail: email }),
  })
  if (!response.ok) throw new Error(`Test account was not deleted (HTTP ${response.status})`)
  return true
}

exports.TEST_ACCOUNT_DOMAIN = TEST_ACCOUNT_DOMAIN
exports.TEST_ACCOUNT_PATTERN = TEST_ACCOUNT_PATTERN
exports.isTestAccountEmail = isTestAccountEmail
exports.testAccountEmail = testAccountEmail
exports.assertTestAccountEmail = assertTestAccountEmail
exports.checkHeaders = checkHeaders
exports.checkFetch = checkFetch
exports.createTestAccount = createTestAccount
exports.markTestProfile = markTestProfile
exports.deleteTestAccount = deleteTestAccount
