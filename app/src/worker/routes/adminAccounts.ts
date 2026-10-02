/**
 * Admin-only account export (access/portability) and deletion (erasure).
 * Operator guide: docs/account-deletion.md.
 *
 * Both routes are POST, gated by the site-admin check, and act on exactly one
 * account. Deletion requires the operator to type the account's email, runs
 * every step idempotently, and removes the auth user only after every earlier
 * step succeeded, so a partial run can simply be repeated.
 */
import type { ReaderPositionCoordinator } from '../readerPositionCoordinator'
import type { RecapPreparationCoordinator } from '../recapPreparationCoordinator'
import { corsHeaders } from '../lib/responses'
import { isValidUUID } from '../lib/security'
import { supabaseAuthAdminUser, supabaseDelete, supabaseGet, type SupabaseEnv } from '../lib/supabase'
import { kvKey as chatHistoryKvKey } from './labChatHistory'
import { kvKey as positionKvKey } from './labPosition'

export type AdminAccountsEnv = SupabaseEnv & {
  STRIPE_SECRET_KEY?: string
  RATE_LIMIT?: KVNamespace
  READER_POSITION?: DurableObjectNamespace<ReaderPositionCoordinator>
  RECAP_PREPARATION?: DurableObjectNamespace<RecapPreparationCoordinator>
}

type VerifySiteAdmin = (env: AdminAccountsEnv, request: Request) => Promise<boolean>

export type StepStatus = 'ok' | 'failed' | 'skipped'
export type DeletionStep = { step: string; status: StepStatus; detail?: string }

type AuthUser = {
  id: string
  email?: string | null
  phone?: string | null
  created_at?: string
  updated_at?: string
  last_sign_in_at?: string | null
  email_confirmed_at?: string | null
  user_metadata?: Record<string, unknown>
  app_metadata?: Record<string, unknown>
  identities?: { provider?: string; created_at?: string; last_sign_in_at?: string }[]
}

type Profile = Record<string, unknown> & { id: string; email?: string | null; stripe_customer_id?: string | null }

type Account = { userId: string; email: string | null; authUser: AuthUser | null; profile: Profile | null }

/** Every Supabase table holding rows for one account, with a stable page order. */
const USER_TABLES: { table: string; column: string; order: string }[] = [
  { table: 'profiles', column: 'id', order: 'id' },
  { table: 'user_data', column: 'user_id', order: 'key' },
  { table: 'user_data_audit', column: 'user_id', order: 'created_at,id' },
  { table: 'token_usage', column: 'user_id', order: 'created_at,id' },
  { table: 'payments', column: 'user_id', order: 'created_at,id' },
  { table: 'reading_memory_sessions', column: 'user_id', order: 'session_id' },
  { table: 'analytics_events', column: 'user_id', order: 'created_at,id' },
  { table: 'issue_reports', column: 'user_id', order: 'created_at,id' },
  { table: 'ai_usage_events', column: 'user_id', order: 'id' },
  { table: 'site_admins', column: 'user_id', order: 'user_id' },
]

/** ON DELETE SET NULL tables: rows must be deleted before the auth user goes. */
const SET_NULL_TABLES = ['analytics_events', 'issue_reports', 'ai_usage_events'] as const

const PAGE = 1000
const MAX_PAGES = 100
const DEVICE_ID = /^[A-Za-z0-9_-]{8,64}$/
const STRIPE_CUSTOMER_ID = /^cus_[A-Za-z0-9]+$/
const STRIPE_SUBSCRIPTION_ID = /^sub_[A-Za-z0-9]+$/

function reply(data: unknown, status: number, request: Request): Response {
  return Response.json(data, { status, headers: { ...corsHeaders(request), 'Cache-Control': 'no-store' } })
}

function normalizeEmail(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

async function gate(request: Request, env: AdminAccountsEnv, verifySiteAdmin: VerifySiteAdmin): Promise<Response | null> {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return reply({ error: 'Not configured' }, 500, request)
  if (request.method !== 'POST') return reply({ error: 'Method not allowed' }, 405, request)
  if (!await verifySiteAdmin(env, request)) return reply({ error: 'Forbidden' }, 403, request)
  return null
}

async function readBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json()
    return body && typeof body === 'object' && !Array.isArray(body) ? body as Record<string, unknown> : null
  } catch {
    return null
  }
}

async function getAll(env: AdminAccountsEnv, table: string, filter: string, order: string, select = '*'): Promise<{ rows: Record<string, unknown>[]; truncated: boolean }> {
  const rows: Record<string, unknown>[] = []
  for (let page = 0; page < MAX_PAGES; page++) {
    const res = await supabaseGet(env, `${table}?${filter}&select=${select}&order=${order}&limit=${PAGE}&offset=${page * PAGE}`)
    if (!res.ok) throw new Error(`${table} read failed (${res.status})`)
    const batch = await res.json() as Record<string, unknown>[]
    rows.push(...batch)
    if (batch.length < PAGE) return { rows, truncated: false }
  }
  return { rows, truncated: true }
}

type Resolved = { account: Account } | { error: string; status: number }

async function resolveAccount(env: AdminAccountsEnv, body: Record<string, unknown>): Promise<Resolved> {
  let userId = typeof body.userId === 'string' ? body.userId.trim() : ''
  const email = normalizeEmail(body.email)
  if (!userId && email) {
    const res = await supabaseGet(env, `profiles?email=eq.${encodeURIComponent(email)}&select=id&limit=2`)
    if (!res.ok) return { error: 'Profile lookup failed', status: 502 }
    const rows = await res.json() as { id: string }[]
    if (rows.length === 0) return { error: 'Account not found', status: 404 }
    if (rows.length > 1) return { error: 'Email matches more than one profile; pass userId', status: 409 }
    userId = rows[0].id
  }
  if (!isValidUUID(userId)) return { error: 'Pass a valid userId or email', status: 400 }

  const authRes = await supabaseAuthAdminUser(env, userId, 'GET')
  let authUser: AuthUser | null = null
  if (authRes.ok) authUser = await authRes.json() as AuthUser
  else if (authRes.status !== 404) return { error: `Auth lookup failed (${authRes.status})`, status: 502 }

  const profileRes = await supabaseGet(env, `profiles?id=eq.${userId}&select=*&limit=1`)
  if (!profileRes.ok) return { error: 'Profile lookup failed', status: 502 }
  const profile = (await profileRes.json() as Profile[])[0] ?? null

  if (!authUser && !profile) return { error: 'Account not found', status: 404 }
  return { account: { userId, email: normalizeEmail(authUser?.email ?? profile?.email) || null, authUser, profile } }
}

// ===== Stripe =====

async function stripe(env: AdminAccountsEnv, method: 'GET' | 'DELETE', path: string): Promise<Response> {
  return fetch(`https://api.stripe.com/v1/${path}`, {
    method,
    headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` },
  })
}

/** Customer ids from the profile plus any customer tagged with this account in Stripe metadata. */
async function stripeCustomerIds(env: AdminAccountsEnv, account: Account): Promise<string[]> {
  const ids = new Set<string>()
  const fromProfile = account.profile?.stripe_customer_id
  if (typeof fromProfile === 'string' && STRIPE_CUSTOMER_ID.test(fromProfile)) ids.add(fromProfile)
  if (!env.STRIPE_SECRET_KEY) {
    if (ids.size) throw new Error('Stripe is not configured')
    return []
  }
  const query = encodeURIComponent(`metadata['supabase_user_id']:'${account.userId}'`)
  const res = await stripe(env, 'GET', `customers/search?query=${query}&limit=100`)
  if (!res.ok) throw new Error(`Stripe customer search failed (${res.status})`)
  const found = await res.json() as { data?: { id: string }[] }
  for (const customer of found.data ?? []) if (STRIPE_CUSTOMER_ID.test(customer.id)) ids.add(customer.id)
  return [...ids]
}

async function stripeSubscriptions(env: AdminAccountsEnv, customerId: string): Promise<Record<string, unknown>[]> {
  const res = await stripe(env, 'GET', `subscriptions?customer=${customerId}&status=all&limit=100`)
  if (res.status === 404) return []
  if (!res.ok) throw new Error(`Stripe subscription list failed (${res.status})`)
  return ((await res.json()) as { data?: Record<string, unknown>[] }).data ?? []
}

async function exportStripe(env: AdminAccountsEnv, account: Account): Promise<unknown> {
  const ids = await stripeCustomerIds(env, account)
  const customers = []
  for (const id of ids) {
    const res = await stripe(env, 'GET', `customers/${id}`)
    const customer = res.ok ? await res.json() as Record<string, unknown> : null
    const subscriptions = customer && !customer.deleted ? await stripeSubscriptions(env, id) : []
    const invoicesRes = customer && !customer.deleted ? await stripe(env, 'GET', `invoices?customer=${id}&limit=100`) : null
    const invoices = invoicesRes?.ok ? ((await invoicesRes.json()) as { data?: Record<string, unknown>[] }).data ?? [] : []
    customers.push({
      id,
      customer: customer && {
        id: customer.id, email: customer.email ?? null, name: customer.name ?? null,
        created: customer.created ?? null, deleted: customer.deleted ?? false, metadata: customer.metadata ?? null,
      },
      subscriptions: subscriptions.map(sub => ({
        id: sub.id, status: sub.status, created: sub.created, current_period_end: sub.current_period_end ?? null,
        cancel_at_period_end: sub.cancel_at_period_end ?? null, canceled_at: sub.canceled_at ?? null,
      })),
      invoices: invoices.map(invoice => ({
        id: invoice.id, number: invoice.number ?? null, status: invoice.status, created: invoice.created,
        amount_paid: invoice.amount_paid, currency: invoice.currency,
      })),
    })
  }
  return { customers }
}

// ===== Export =====

function authBasics(user: AuthUser | null) {
  if (!user) return null
  return {
    id: user.id,
    email: user.email ?? null,
    phone: user.phone || null,
    created_at: user.created_at ?? null,
    updated_at: user.updated_at ?? null,
    last_sign_in_at: user.last_sign_in_at ?? null,
    email_confirmed_at: user.email_confirmed_at ?? null,
    user_metadata: user.user_metadata ?? {},
    app_metadata: user.app_metadata ?? {},
    identities: (user.identities ?? []).map(identity => ({
      provider: identity.provider ?? null, created_at: identity.created_at ?? null, last_sign_in_at: identity.last_sign_in_at ?? null,
    })),
  }
}

/** Anonymous-device ids seen on this account's analytics rows (server-side ids excluded). */
function deviceIdsFrom(rows: Record<string, unknown>[]): string[] {
  const ids = new Set<string>()
  for (const row of rows) {
    const payload = row.payload as Record<string, unknown> | null | undefined
    const id = typeof row.device_id === 'string' ? row.device_id : payload?.device_id
    if (typeof id === 'string' && DEVICE_ID.test(id) && !id.startsWith('server-')) ids.add(id)
  }
  return [...ids]
}

function chunks<T>(values: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < values.length; i += size) out.push(values.slice(i, i + size))
  return out
}

export async function handleAdminExportUser(request: Request, env: AdminAccountsEnv, verifySiteAdmin: VerifySiteAdmin): Promise<Response> {
  const denied = await gate(request, env, verifySiteAdmin)
  if (denied) return denied
  const body = await readBody(request)
  if (!body) return reply({ error: 'Invalid JSON' }, 400, request)
  const resolved = await resolveAccount(env, body)
  if ('error' in resolved) return reply({ error: resolved.error }, resolved.status, request)
  const { account } = resolved
  const errors: string[] = []
  const truncated: string[] = []
  const attempt = async <T>(label: string, run: () => Promise<T>): Promise<T | null> => {
    try { return await run() } catch (error) {
      errors.push(`${label}: ${error instanceof Error ? error.message : 'failed'}`)
      return null
    }
  }

  const supabase: Record<string, unknown> = {}
  for (const { table, column, order } of USER_TABLES) {
    const result = await attempt(table, () => getAll(env, table, `${column}=eq.${account.userId}`, order))
    supabase[table] = result?.rows ?? null
    if (result?.truncated) truncated.push(table)
  }
  const devices = deviceIdsFrom((supabase.analytics_events as Record<string, unknown>[] | null) ?? [])
  const anonymousRows: Record<string, unknown>[] = []
  for (const group of chunks(devices, 50)) {
    const result = await attempt('analytics_events (anonymous device rows)', () =>
      getAll(env, 'analytics_events', `user_id=is.null&payload->>device_id=in.(${group.join(',')})`, 'created_at,id'))
    if (result) anonymousRows.push(...result.rows)
    if (result?.truncated) truncated.push('analytics_events (anonymous device rows)')
  }
  supabase.analytics_events_device_anonymous = anonymousRows

  const kv: Record<string, unknown> = {}
  if (!env.RATE_LIMIT) errors.push('kv: RATE_LIMIT binding missing')
  else {
    kv.labChatHistory = await attempt('kv lab-chat-history', () => env.RATE_LIMIT!.get(chatHistoryKvKey(account.userId), 'json'))
    kv.labPosition = await attempt('kv lab-position', () => env.RATE_LIMIT!.get(positionKvKey(account.userId), 'json'))
  }

  const durableObjects: Record<string, unknown> = {
    readerPosition: env.READER_POSITION
      ? await attempt('do reader-position', async () => env.READER_POSITION!.getByName(account.userId).exportState())
      : (errors.push('do: READER_POSITION binding missing'), null),
    recapPreparation: env.RECAP_PREPARATION
      ? await attempt('do recap-preparation', async () => env.RECAP_PREPARATION!.getByName(account.userId).exportState())
      : (errors.push('do: RECAP_PREPARATION binding missing'), null),
  }

  const stripeSummary = await attempt('stripe', () => exportStripe(env, account))

  console.log(JSON.stringify({ event: 'admin_account_export', user: account.userId.slice(0, 8), errors: errors.length }))
  return reply({
    exportedAt: new Date().toISOString(),
    userId: account.userId,
    complete: errors.length === 0 && truncated.length === 0,
    errors,
    truncated,
    auth: authBasics(account.authUser),
    supabase,
    kv,
    durableObjects,
    stripe: stripeSummary,
  }, 200, request)
}

// ===== Delete =====

async function runStep(steps: DeletionStep[], step: string, run: () => Promise<string | void | { skipped: string }>): Promise<boolean> {
  try {
    const result = await run()
    if (result && typeof result === 'object') steps.push({ step, status: 'skipped', detail: result.skipped })
    else steps.push(result ? { step, status: 'ok', detail: result } : { step, status: 'ok' })
    return true
  } catch (error) {
    steps.push({ step, status: 'failed', detail: error instanceof Error ? error.message : 'failed' })
    return false
  }
}

async function expectOk(res: Response, label: string): Promise<void> {
  if (!res.ok) throw new Error(`${label} failed (${res.status})`)
}

function purgeAndKvSteps(env: AdminAccountsEnv, userId: string, prefix: string): [string, () => Promise<void>][] {
  // Recap first: its alarm reads the position coordinator, which would
  // re-import the legacy KV record if the position object were already empty.
  return [
    [`${prefix}do:recap-preparation`, async () => {
      if (!env.RECAP_PREPARATION) throw new Error('RECAP_PREPARATION binding missing')
      await env.RECAP_PREPARATION.getByName(userId).purge()
    }],
    [`${prefix}do:reader-position`, async () => {
      if (!env.READER_POSITION) throw new Error('READER_POSITION binding missing')
      await env.READER_POSITION.getByName(userId).purge()
    }],
    [`${prefix}kv:lab-chat-history`, async () => {
      if (!env.RATE_LIMIT) throw new Error('RATE_LIMIT binding missing')
      await env.RATE_LIMIT.delete(chatHistoryKvKey(userId))
    }],
    [`${prefix}kv:lab-position`, async () => {
      if (!env.RATE_LIMIT) throw new Error('RATE_LIMIT binding missing')
      await env.RATE_LIMIT.delete(positionKvKey(userId))
    }],
  ]
}

export async function handleAdminDeleteUser(request: Request, env: AdminAccountsEnv, verifySiteAdmin: VerifySiteAdmin): Promise<Response> {
  const denied = await gate(request, env, verifySiteAdmin)
  if (denied) return denied
  const body = await readBody(request)
  if (!body) return reply({ error: 'Invalid JSON' }, 400, request)
  if (typeof body.userId !== 'string' || !isValidUUID(body.userId.trim())) return reply({ error: 'userId is required' }, 400, request)
  const confirmEmail = normalizeEmail(body.confirmEmail)
  if (!confirmEmail) return reply({ error: 'confirmEmail is required' }, 400, request)

  const resolved = await resolveAccount(env, { userId: body.userId.trim() })
  let account: Account
  if ('error' in resolved) {
    if (resolved.status !== 404) return reply({ error: resolved.error }, resolved.status, request)
    // Neither auth user nor profile exists: an earlier run already removed the
    // account. Re-running only clears leftovers still keyed by its id.
    account = { userId: body.userId.trim(), email: null, authUser: null, profile: null }
  } else {
    account = resolved.account
    if (!account.email) return reply({ error: 'Account has no email to confirm against' }, 409, request)
    if (confirmEmail !== account.email) return reply({ error: 'confirmEmail does not match the account' }, 400, request)
  }
  const accountAlreadyDeleted = !account.authUser && !account.profile

  const userId = account.userId
  const steps: DeletionStep[] = []
  let allOk = true
  const step = async (name: string, run: () => Promise<string | void | { skipped: string }>) => {
    if (!await runStep(steps, name, run)) allOk = false
  }

  // 1. Durable Objects, then the KV records they mirror.
  for (const [name, run] of purgeAndKvSteps(env, userId, '')) await step(name, run)

  // 2. Rows that would otherwise survive the auth delete as SET NULL orphans.
  //    Device ids are collected before the account's own rows are removed.
  await step('supabase:analytics_events(anonymous device rows)', async () => {
    const { rows } = await getAll(env, 'analytics_events', `user_id=eq.${userId}`, 'created_at,id', 'device_id:payload->>device_id')
    const devices = deviceIdsFrom(rows)
    if (!devices.length) return { skipped: 'no device ids' }
    for (const group of chunks(devices, 50)) {
      await expectOk(await supabaseDelete(env, `analytics_events?user_id=is.null&payload->>device_id=in.(${group.join(',')})`), 'delete')
    }
    return `${devices.length} device id(s)`
  })
  for (const table of SET_NULL_TABLES) {
    await step(`supabase:${table}`, async () => expectOk(await supabaseDelete(env, `${table}?user_id=eq.${userId}`), 'delete'))
  }

  // 3. Billing. Deleting the customer also ends its subscriptions; cancelling
  //    first keeps the order explicit and the report readable.
  let customers: string[] = []
  const lookedUp = await runStep(steps, 'stripe:lookup', async () => {
    customers = await stripeCustomerIds(env, account)
    return customers.length ? `${customers.length} customer(s)` : { skipped: 'no Stripe customer' }
  })
  if (!lookedUp) allOk = false
  for (const customerId of customers) {
    await step(`stripe:${customerId}`, async () => {
      let canceled = 0
      for (const sub of await stripeSubscriptions(env, customerId)) {
        if (typeof sub.id !== 'string' || !STRIPE_SUBSCRIPTION_ID.test(sub.id)) continue
        if (sub.status === 'canceled' || sub.status === 'incomplete_expired') continue
        const res = await stripe(env, 'DELETE', `subscriptions/${sub.id}`)
        if (!res.ok && res.status !== 404) throw new Error(`subscription cancel failed (${res.status})`)
        canceled++
      }
      const res = await stripe(env, 'DELETE', `customers/${customerId}`)
      if (!res.ok && res.status !== 404) throw new Error(`customer delete failed (${res.status})`)
      return `canceled ${canceled} subscription(s), customer deleted`
    })
  }

  // 4. The auth user last, and only after everything above succeeded, so the
  //    account (and its email confirmation) still exists for a re-run.
  if (!allOk) {
    steps.push({ step: 'auth:delete-user', status: 'skipped', detail: 'an earlier step failed; fix and re-run' })
  } else if (!account.authUser) {
    steps.push({ step: 'auth:delete-user', status: 'skipped', detail: 'auth user already deleted' })
  } else {
    await step('auth:delete-user', async () => {
      const res = await supabaseAuthAdminUser(env, userId, 'DELETE')
      if (!res.ok && res.status !== 404) throw new Error(`auth delete failed (${res.status})`)
    })
  }

  // 5. Once sign-in is impossible, sweep again for anything a live session or
  //    an in-flight alarm wrote meanwhile, and confirm the cascade.
  const authGone = steps.some(s => s.step === 'auth:delete-user' && (s.status === 'ok' || s.detail === 'auth user already deleted'))
  if (authGone) {
    for (const [name, run] of purgeAndKvSteps(env, userId, 'sweep:')) await step(name, run)
    await step('verify:cascade', async () => {
      const leftovers: string[] = []
      for (const { table, column } of USER_TABLES) {
        const res = await supabaseGet(env, `${table}?${column}=eq.${userId}&select=${column}&limit=1`)
        if (!res.ok) throw new Error(`${table} check failed (${res.status})`)
        if ((await res.json() as unknown[]).length) leftovers.push(table)
      }
      if (leftovers.length) throw new Error(`rows remain in ${leftovers.join(', ')}`)
    })
  }

  const ok = authGone && allOk
  console.log(JSON.stringify({ event: 'admin_account_delete', user: userId.slice(0, 8), ok, failed: steps.filter(s => s.status === 'failed').map(s => s.step) }))
  return reply({ ok, userId, accountAlreadyDeleted, completedAt: new Date().toISOString(), steps }, ok ? 200 : 500, request)
}
