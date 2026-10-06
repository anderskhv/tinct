/**
 * Modern English editions of added public-domain books, bought once and
 * shared by everyone (lib/modernEdition.ts holds the job model).
 *
 *   GET  /api/public-books/{id}/modern-en           state, per-chapter states, and the offer (if any)
 *   POST /api/public-books/{id}/modern-en/checkout  { chapter } → { url } (signed in): Stripe Checkout
 *   POST /api/public-books/{id}/modern-en/priority  { chapter }: a reader opened a chapter not yet written
 *   GET  /data/editions/{id}-modern-en.json         the edition (finished chapters modern, the rest original)
 *
 * Kill switch: PUBLIC_BOOK_MODERN_EDITIONS=1 offers purchases and runs
 * generation; otherwise nothing is offered or generated (an edition already
 * written stays readable, and a paid job waits until the switch is on again).
 * Prices: STRIPE_PRICE_MODERN_T1..T4 (Worker secrets). Generation: xAI with
 * XAI_API_KEY; book text only, no reader data. The webhook grants a paid
 * session through grantModernEdition (billing.ts WebhookHooks).
 */
import { corsHeaders, getAllowedOrigin } from '../lib/responses'
import { isValidUUID } from '../lib/security'
import type { CheckRateLimit } from '../lib/rateLimit'
import { ensureStripeCustomer, type BillingEnv, type CheckoutSessionObject } from './billing'
import { bucketOf, editionObjectKey, metaKey, readJson, upsertIndexEntry, type PublicBooksEnv, type StoredMeta } from './publicBooks'
import {
  HOLD_MS,
  MAX_PARALLEL,
  MODERN_JOB_PREFIX,
  MODERN_KEY,
  SESSION_EXPIRES_S,
  assembleEdition,
  holdLive,
  jobComplete,
  markerKey,
  modernStep,
  modernTierCents,
  modernTierFor,
  paidJob,
  prioritise,
  publicChapterStates,
  purchaseOpen,
  readJob,
  releaseHold,
  updateJob,
  wholeKey,
  xaiModernGenerator,
  type ModernGenerator,
  type ModernJob,
  type ModernTier,
} from '../lib/modernEdition'
import { isPublicBookId } from '../../../public/lab/public-books.js'

export type ModernEnv = PublicBooksEnv & BillingEnv & {
  /** "1" offers Modern English editions and runs their generation. Off by default. */
  PUBLIC_BOOK_MODERN_EDITIONS?: string
  /** Optional xAI model override for generation. */
  PUBLIC_BOOK_MODERN_MODEL?: string
  STRIPE_PRICE_MODERN_T1?: string
  STRIPE_PRICE_MODERN_T2?: string
  STRIPE_PRICE_MODERN_T3?: string
  STRIPE_PRICE_MODERN_T4?: string
}

export interface ModernDeps {
  verifyUser: (request: Request) => Promise<{ id: string; email?: string } | null>
  checkRateLimit: CheckRateLimit
  waitUntil?: (promise: Promise<unknown>) => void
  now?: () => number
  /** Replaces the xAI generator (tests). */
  generator?: ModernGenerator
  /** Stripe API fetch (tests). */
  stripeFetch?: typeof fetch
  /** Replaces the Supabase-backed customer lookup (tests). */
  ensureCustomer?: (user: { id: string; email: string }) => Promise<{ id: string } | { error: string }>
}

/** The background batch: every ten minutes, chapters left on any paid edition are written. */
export const MODERN_EDITION_CRON = '*/10 * * * *'
/** Seconds of work one request may start after its response (a Worker's waitUntil budget). */
const REQUEST_WORK_MS = 25_000
const PRIORITY_PER_MINUTE = 30
const CHECKOUT_PER_MINUTE = 5

export const modernSwitchOn = (env: ModernEnv) => env.PUBLIC_BOOK_MODERN_EDITIONS === '1'

export function modernPriceId(env: ModernEnv, tier: ModernTier): string | null {
  return ({ 1: env.STRIPE_PRICE_MODERN_T1, 2: env.STRIPE_PRICE_MODERN_T2, 3: env.STRIPE_PRICE_MODERN_T3, 4: env.STRIPE_PRICE_MODERN_T4 })[tier] || null
}

function reply(data: unknown, status: number, request: Request): Response {
  return Response.json(data, { status, headers: { ...corsHeaders(request), 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } })
}

const stripeHeaders = (env: ModernEnv, idempotencyKey?: string) => ({
  Authorization: `Basic ${btoa(env.STRIPE_SECRET_KEY + ':')}`,
  'Content-Type': 'application/x-www-form-urlencoded',
  ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
})

/** Only English originals get a Modern English edition; never a reader's private upload (not a pd- id). */
function modernEligible(meta: StoredMeta | null): meta is StoredMeta {
  return !!meta && isPublicBookId(meta.book.id) && meta.editionKey === 'original-en'
}

function generatorFor(env: ModernEnv, deps: Pick<ModernDeps, 'generator'>): ModernGenerator | null {
  if (deps.generator) return deps.generator
  return env.XAI_API_KEY ? xaiModernGenerator(env.XAI_API_KEY, { model: env.PUBLIC_BOOK_MODERN_MODEL }) : null
}

function offerFor(env: ModernEnv, meta: StoredMeta, job: ModernJob | null, now: number): { tier: ModernTier; cents: number } | null {
  if (!modernSwitchOn(env) || !env.STRIPE_SECRET_KEY || !purchaseOpen(job, now)) return null
  const tier = modernTierFor(meta.book.wordCount)
  return modernPriceId(env, tier) ? { tier, cents: modernTierCents(tier) } : null
}

function statusBody(env: ModernEnv, meta: StoredMeta, job: ModernJob | null, now: number) {
  const state = !job ? 'none' : job.state === 'paid' ? (jobComplete(job) ? 'complete' : 'paid') : holdLive(job, now) ? 'checkout' : 'none'
  return { state, chapters: publicChapterStates(job, now), offer: offerFor(env, meta, job, now) }
}

// ===== Generation =====

/**
 * Work on one book until it is done, idle, or the deadline passes: up to
 * MAX_PARALLEL chapters at once, each step one saved chunk. Safe to run from
 * several requests at once: chapters are claimed in the job record.
 */
export async function runModernBook(env: ModernEnv, bookId: string, options: { deadline: number; generate: ModernGenerator; now?: () => number }): Promise<void> {
  const bucket = bucketOf(env)
  if (!bucket) return
  const now = options.now ?? Date.now
  const meta = await readJson<StoredMeta>(bucket, metaKey(bookId))
  if (!modernEligible(meta)) return
  let source: Promise<Array<{ number: number; title: string; paragraphs: string[] }>> | null = null
  const loadSource = () => source ??= readJson<{ chapters: Array<{ number: number; title: string; paragraphs: string[] }> }>(bucket, editionObjectKey(bookId, meta.editionKey)).then(data => data?.chapters ?? [])
  const worker = async () => {
    let failures = 0
    while (now() < options.deadline) {
      const result = await modernStep(bucket, { bookId, title: meta.book.title, author: meta.book.author, source: loadSource, generate: options.generate, now })
      if (result === 'idle' || result === 'complete') return
      if (result === 'failed' && ++failures >= 3) return
    }
  }
  await Promise.all(Array.from({ length: MAX_PARALLEL }, worker))
}

/** Cron: every book with chapters left, while the switch is on and the key is set. */
export async function runModernEditionJobs(env: ModernEnv, options: { budgetMs: number; generator?: ModernGenerator; now?: () => number }): Promise<number> {
  const bucket = bucketOf(env)
  const generate = generatorFor(env, options)
  if (!modernSwitchOn(env) || !bucket || !generate) return 0
  const now = options.now ?? Date.now
  const deadline = now() + options.budgetMs
  const page = await bucket.list({ prefix: MODERN_JOB_PREFIX, limit: 20 })
  let books = 0
  for (const object of page.objects) {
    if (now() >= deadline) break
    const bookId = object.key.slice(MODERN_JOB_PREFIX.length)
    if (!isPublicBookId(bookId)) continue
    await runModernBook(env, bookId, { deadline, generate, now })
    books++
  }
  return books
}

function kick(env: ModernEnv, bookId: string, deps: ModernDeps): void {
  const generate = generatorFor(env, deps)
  if (!modernSwitchOn(env) || !generate || !deps.waitUntil) return
  const now = deps.now ?? Date.now
  deps.waitUntil(runModernBook(env, bookId, { deadline: now() + REQUEST_WORK_MS, generate, now }).catch(() => {}))
}

// ===== Grant (webhook) =====

/** Adds the modern-en edition to the book's records, once. */
async function publishEditionRecords(bucket: R2Bucket, bookId: string): Promise<void> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const object = await bucket.get(metaKey(bookId))
    if (!object) return
    const meta = JSON.parse(await new Response(object.body).text()) as StoredMeta
    if (meta.book.editions.some(edition => edition.key === MODERN_KEY)) { await upsertIndexEntry(bucket, meta.entry); return }
    meta.book = { ...meta.book, editions: [...meta.book.editions, { key: MODERN_KEY, language: 'en', style: 'modern', label: 'Modern English', aligned: true, hasAudio: false }] }
    meta.entry = {
      ...meta.entry,
      editions: [...meta.entry.editions, {
        key: MODERN_KEY, language: 'en', style: 'modern', label: 'Modern English', translator: null, year: null, aligned: true,
        group: 'modern', provenance: 'tinct-ai-adaptation', provenanceLabel: 'Tinct AI adaptation',
        availability: { chapterText: true, audio: false, compare: false }, discoveryAvailable: true,
        wordCount: meta.entry.wordCount, readingStructure: meta.entry.readingStructure,
      }],
    }
    const put = await bucket.put(metaKey(bookId), JSON.stringify(meta), { httpMetadata: { contentType: 'application/json' }, onlyIf: { etagMatches: object.etag } })
    if (put) { await upsertIndexEntry(bucket, meta.entry); return }
  }
  throw new Error('meta update contended')
}

async function refund(env: ModernEnv, session: CheckoutSessionObject, stripeFetch: typeof fetch): Promise<void> {
  if (!session.payment_intent || !env.STRIPE_SECRET_KEY) throw new Error('refund impossible')
  const response = await stripeFetch('https://api.stripe.com/v1/refunds', {
    method: 'POST', headers: stripeHeaders(env, `modern-refund-${session.id}`),
    body: new URLSearchParams({ payment_intent: session.payment_intent, 'metadata[reason]': 'modern_edition_already_paid' }).toString(),
  })
  if (!response.ok) throw new Error(`refund ${response.status}`)
}

/**
 * checkout.session.completed for a Modern English edition. Idempotent: a
 * redelivered event is 'already'. A second payment for a book that is already
 * paid (which the hold should prevent) is refunded, never kept.
 */
export async function grantModernEdition(env: ModernEnv, session: CheckoutSessionObject, deps: Pick<ModernDeps, 'waitUntil' | 'now' | 'generator' | 'stripeFetch'> = {}): Promise<{ outcome: 'granted' | 'already' | 'refunded' | 'invalid'; amountCents: number }> {
  const bookId = session.metadata?.book_id || ''
  const bucket = bucketOf(env)
  if (!isPublicBookId(bookId)) return { outcome: 'invalid', amountCents: 0 }
  if (!bucket) throw new Error('public books not configured')
  const now = deps.now ?? Date.now
  const stripeFetch = deps.stripeFetch ?? fetch
  const meta = await readJson<StoredMeta>(bucket, metaKey(bookId))
  const tierValue = Number(session.metadata?.tier)
  const tier = ([1, 2, 3, 4].includes(tierValue) ? tierValue : modernTierFor(meta?.book.wordCount)) as ModernTier
  const amountCents = modernTierCents(tier)
  if (!modernEligible(meta)) { await refund(env, session, stripeFetch); return { outcome: 'refunded', amountCents } }
  const chapter = Number(session.metadata?.chapter)
  let previous: ModernJob | null = null
  const result = await updateJob(bucket, bookId, job => {
    previous = job
    if (job?.state === 'paid') return null
    return paidJob({ bookId, tier, sessionId: session.id, chapters: meta.entry.readingStructure.chapters.map(c => c.number), anchor: Number.isInteger(chapter) ? chapter : null, now: now() })
  })
  if (!result.wrote) {
    if (result.job?.sessionId !== session.id) { await refund(env, session, stripeFetch); return { outcome: 'refunded', amountCents } }
    await publishEditionRecords(bucket, bookId)
    if (!jobComplete(result.job)) await bucket.put(markerKey(bookId), '', {})
    return { outcome: 'already', amountCents }
  }
  // Another buyer's checkout that never completed must not be payable now.
  const held = previous as ModernJob | null
  if (held?.state === 'checkout' && held.sessionId !== session.id && held.sessionId.startsWith('cs_') && env.STRIPE_SECRET_KEY) {
    await stripeFetch(`https://api.stripe.com/v1/checkout/sessions/${held.sessionId}/expire`, { method: 'POST', headers: stripeHeaders(env) }).catch(() => null)
  }
  await bucket.put(markerKey(bookId), '', {})
  await publishEditionRecords(bucket, bookId)
  kick(env, bookId, { ...deps, verifyUser: async () => null, checkRateLimit: async () => true })
  return { outcome: 'granted', amountCents }
}

// ===== Handlers =====

async function checkout(request: Request, env: ModernEnv, bucket: R2Bucket, bookId: string, meta: StoredMeta, deps: ModernDeps): Promise<Response> {
  const user = await deps.verifyUser(request)
  if (!user || !isValidUUID(user.id) || !user.email) return reply({ error: 'Unauthorized' }, 401, request)
  if (!await deps.checkRateLimit(`public-modern-checkout:${user.id}`, undefined, CHECKOUT_PER_MINUTE)) return reply({ error: 'rate_limited' }, 429, request)
  let chapter: number | null = null
  try { const n = Number((await request.json() as { chapter?: unknown }).chapter); chapter = Number.isInteger(n) && n >= 0 ? n : null } catch { chapter = null }
  const now = deps.now ?? Date.now
  const stripeFetch = deps.stripeFetch ?? fetch
  const current = await readJob(bucket, bookId)
  const offer = offerFor(env, meta, current?.job ?? null, now())
  if (!offer) {
    // The buyer's own open session (a second tap, another tab) is returned, never doubled.
    if (current && holdLive(current.job, now()) && current.job.sessionId.startsWith('cs_')) {
      const open = await stripeFetch(`https://api.stripe.com/v1/checkout/sessions/${current.job.sessionId}`, { headers: stripeHeaders(env) }).then(r => r.ok ? r.json() as Promise<{ status?: string; url?: string; metadata?: Record<string, string> }> : null).catch(() => null)
      if (open?.status === 'open' && open.url && open.metadata?.supabase_user_id === user.id) return reply({ url: open.url }, 200, request)
    }
    const state = current?.job.state === 'paid' ? 'exists' : current && holdLive(current.job, now()) ? 'in_progress' : 'not_available'
    return reply({ error: state }, state === 'not_available' ? 404 : 409, request)
  }
  const priceId = modernPriceId(env, offer.tier)!
  // Hold the book first: of two buyers racing, only one conditional put wins.
  const holdId = `hold_${crypto.randomUUID()}`
  const hold = await updateJob(bucket, bookId, job => purchaseOpen(job, now())
    ? { version: 1, bookId, state: 'checkout', tier: offer.tier, sessionId: holdId, holdUntil: now() + HOLD_MS, priority: [], chapters: [], updatedAt: now() }
    : null)
  if (!hold.wrote) return reply({ error: hold.job?.state === 'paid' ? 'exists' : 'in_progress' }, 409, request)

  const customer = await (deps.ensureCustomer ?? (u => ensureStripeCustomer(env, u)))({ id: user.id, email: user.email }).catch(() => ({ error: 'customer' }))
  if ('error' in customer) { await releaseHold(bucket, bookId, holdId); return reply({ error: 'payment_unavailable' }, 502, request) }
  const origin = getAllowedOrigin(request)
  const params = new URLSearchParams()
  params.set('customer', customer.id)
  params.set('mode', 'payment')
  params.set('line_items[0][price]', priceId)
  params.set('line_items[0][quantity]', '1')
  params.set('success_url', `${origin}/reader`)
  params.set('cancel_url', `${origin}/reader`)
  params.set('expires_at', String(Math.floor(now() / 1000) + SESSION_EXPIRES_S))
  if (env.STRIPE_AUTOMATIC_TAX === 'on') {
    params.set('automatic_tax[enabled]', 'true')
    params.set('customer_update[address]', 'auto')
  }
  const metadata: Record<string, string> = { type: 'modern_edition', book_id: bookId, tier: String(offer.tier), amount_cents: String(offer.cents), supabase_user_id: user.id, ...(chapter !== null ? { chapter: String(chapter) } : {}) }
  for (const [key, value] of Object.entries(metadata)) {
    params.set(`metadata[${key}]`, value)
    params.set(`payment_intent_data[metadata][${key}]`, value)
  }
  let session: { id?: string; url?: string } | null = null
  try {
    const response = await stripeFetch('https://api.stripe.com/v1/checkout/sessions', { method: 'POST', headers: stripeHeaders(env, `modern-${bookId}-${holdId}`), body: params.toString() })
    session = response.ok ? await response.json() as { id?: string; url?: string } : null
  } catch { session = null }
  if (!session?.id || !session.url) { await releaseHold(bucket, bookId, holdId); return reply({ error: 'payment_unavailable' }, 502, request) }
  const sessionId = session.id
  const bound = await updateJob(bucket, bookId, job => job?.state === 'checkout' && job.sessionId === holdId ? { ...job, sessionId, updatedAt: now() } : null)
  if (!bound.wrote) {
    // The hold was lost (it cannot be, short of a clock jump): never leave a payable session behind.
    await stripeFetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}/expire`, { method: 'POST', headers: stripeHeaders(env) }).catch(() => null)
    return reply({ error: 'in_progress' }, 409, request)
  }
  return reply({ url: session.url }, 200, request)
}

async function priority(request: Request, env: ModernEnv, bucket: R2Bucket, bookId: string, meta: StoredMeta, deps: ModernDeps): Promise<Response> {
  const ip = request.headers.get('cf-connecting-ip') || 'unknown'
  if (!await deps.checkRateLimit(`public-modern-priority:${ip}`, undefined, PRIORITY_PER_MINUTE)) return reply({ error: 'rate_limited' }, 429, request)
  let chapter = NaN
  try { chapter = Number((await request.json() as { chapter?: unknown }).chapter) } catch { /* below */ }
  if (!Number.isInteger(chapter)) return reply({ error: 'bad_request' }, 400, request)
  const now = deps.now ?? Date.now
  const { job } = await updateJob(bucket, bookId, current => {
    if (current?.state !== 'paid') return null
    const next = prioritise(current, chapter)
    return next === current || next.priority.join() === current.priority.join() ? null : { ...next, updatedAt: now() }
  })
  if (job?.state === 'paid' && !jobComplete(job)) kick(env, bookId, deps)
  return reply(statusBody(env, meta, job, now()), 200, request)
}

/** `/api/public-books/{id}/modern-en[/…]`. */
export async function handleModernEdition(request: Request, env: ModernEnv, bookId: string, rest: string[], deps: ModernDeps): Promise<Response> {
  const bucket = bucketOf(env)
  if (!bucket) return reply({ error: 'Not configured' }, 503, request)
  const meta = await readJson<StoredMeta>(bucket, metaKey(bookId))
  if (!modernEligible(meta)) return reply({ error: 'Not found' }, 404, request)
  const now = deps.now ?? Date.now
  if (request.method === 'GET' && rest.length === 0) {
    const job = (await readJob(bucket, bookId))?.job ?? null
    if (job?.state === 'paid' && !jobComplete(job)) kick(env, bookId, deps)
    return reply(statusBody(env, meta, job, now()), 200, request)
  }
  if (request.method === 'POST' && rest.length === 1 && rest[0] === 'checkout') return checkout(request, env, bucket, bookId, meta, deps)
  if (request.method === 'POST' && rest.length === 1 && rest[0] === 'priority') {
    if (!modernSwitchOn(env)) return reply({ error: 'Not found' }, 404, request)
    return priority(request, env, bucket, bookId, meta, deps)
  }
  return reply({ error: 'Not found' }, 404, request)
}

/** `/data/editions/{id}-modern-en.json`: the whole edition once finished, else assembled per request. */
export async function serveModernEdition(request: Request, env: ModernEnv, bookId: string, now = Date.now()): Promise<Response> {
  const bucket = bucketOf(env)
  const headers = (cache: string) => ({ ...corsHeaders(request), 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': cache, 'X-Content-Type-Options': 'nosniff' })
  if (!bucket) return reply({ error: 'Not configured' }, 503, request)
  const whole = await bucket.get(wholeKey(bookId))
  if (whole) return new Response(whole.body, { status: 200, headers: headers('public, max-age=300') })
  const meta = await readJson<StoredMeta>(bucket, metaKey(bookId))
  const job = (await readJob(bucket, bookId))?.job ?? null
  if (!modernEligible(meta) || job?.state !== 'paid') return reply({ error: 'Not found' }, 404, request)
  const original = await readJson<{ chapters: Array<{ number: number; title: string; paragraphs: string[] }> }>(bucket, editionObjectKey(bookId, meta.editionKey))
  if (!original?.chapters?.length) return reply({ error: 'Not found' }, 404, request)
  return new Response(JSON.stringify(await assembleEdition(bucket, bookId, original.chapters, job, now)), { status: 200, headers: headers('no-store') })
}
