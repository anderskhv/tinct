/**
 * Modern English editions of added public-domain books, bought once and
 * shared by everyone (lib/modernEdition.ts holds the job model).
 *
 *   GET  /api/public-books/{id}/modern-en           state, per-chapter states, and the offer (if any)
 *   POST /api/public-books/{id}/modern-en/checkout  { chapter } → { url } (signed in, Premium or the 30-day
 *                                                   trial; 402 premium_required otherwise): Stripe Checkout
 *   POST /api/public-books/{id}/modern-en/priority  { chapter, paragraph? }: a reader is waiting there (written next)
 *   POST /api/public-books/{id}/modern-en/cancel    (signed in) the buyer came back from Checkout without paying:
 *                                                   their own open session is expired and the hold released
 *   GET  /data/editions/{id}-modern-en.json         the edition (finished chapters modern, the rest original)
 *
 * Who may buy (Anders, 2026-10-08): Premium readers, the 30-day trial included
 * (lib/aiAllowance.ts hasPremiumAccess). A signed-in account without it is
 * offered nothing (the status carries no offer when it sends its token) and
 * its checkout is refused with 402. Anyone can read an edition already bought.
 *
 * Kill switch: PUBLIC_BOOK_MODERN_EDITIONS=1 offers purchases and runs
 * generation; otherwise nothing is offered or generated (an edition already
 * written stays readable, and a paid job waits until the switch is on again).
 * Prices: STRIPE_PRICE_MODERN_T1..T4 (Worker secrets). Generation: xAI with
 * XAI_API_KEY; book text only, no reader data. The webhook grants a paid
 * session through grantModernEdition (billing.ts WebhookHooks).
 *
 * Spend (Anders, 2026-10-10; lib/modernBudget.ts): every call is settled on
 * xAI's reported cost, kept as the job's costUsd and written to the AI ledger
 * as 'modern_edition' with no reader on the row (never charged). A monthly
 * ceiling, MODERN_EDITION_MONTHLY_USD ($100), gates new purchases only: the
 * offer is not shown and checkout refuses (404 not_available) before any
 * Stripe session when the book's expected cost does not fit. A paid book is
 * always finished (chunks the model cannot write fall back to the original
 * text and flag the job for review: GET /api/admin/modern-diagnostics?review=1).
 */
import { corsHeaders, getAllowedOrigin } from '../lib/responses'
import { isValidUUID } from '../lib/security'
import type { CheckRateLimit } from '../lib/rateLimit'
import { ensureStripeCustomer, type BillingEnv, type CheckoutSessionObject } from './billing'
import { bucketOf, editionChapter, editionObjectKey, metaKey, readJson, upsertIndexEntry, type PublicBooksEnv, type StoredMeta } from './publicBooks'
import {
  HOLD_MS,
  MAX_PARALLEL,
  MODERN_JOB_PREFIX,
  MODERN_KEY,
  SESSION_EXPIRES_S,
  assembleChapter,
  assembleEdition,
  holdLive,
  jobComplete,
  markerKey,
  modernStep,
  modernTierCents,
  modernTierFor,
  needsAudit,
  FAILED_REVIVAL,
  publicFailures,
  reviveFailedChapters,
  paidJob,
  prioritise,
  publicChapterStates,
  publicProgress,
  purchaseOpen,
  readJob,
  releaseHold,
  repairEchoedEdition,
  releaseRunner,
  updateJob,
  wholeKey,
  xaiModernGenerator,
  XAI_MODERN_MODEL,
  MODERN_REVIEW_PREFIX,
  type ModernCost,
  type ModernGenerator,
  type ModernJob,
  type ModernTier,
  type SourceChapter,
} from '../lib/modernEdition'
import { isPublicBookId } from '../../../public/lab/public-books.js'
import { recordAiUsage, type LedgerEnv } from '../lib/aiUsage'
import {
  chargeModernOverrun,
  modernBookExpectedUsd,
  modernMonthHasRoom,
  modernMonthMicros,
  modernMonthlyMicros,
  refundModernReservation,
  reserveModernBook,
  usdToMicros,
  type ModernBudgetEnv,
  type ModernReservation,
} from '../lib/modernBudget'

export type ModernEnv = PublicBooksEnv & BillingEnv & ModernBudgetEnv & LedgerEnv & {
  /** "1" offers Modern English editions and runs their generation. Off by default. */
  PUBLIC_BOOK_MODERN_EDITIONS?: string
  /** Optional xAI model override for generation. */
  PUBLIC_BOOK_MODERN_MODEL?: string
  /** 'text' asks without JSON mode (numbered paragraphs); JSON mode otherwise. Paragraphs asked for again always use text. */
  PUBLIC_BOOK_MODERN_FORMAT?: string
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
  /** Premium or in the 30-day trial (lib/aiAllowance.ts loadPremiumAccess); null when unknown. Buying is Premium only; without it, nobody may buy. */
  premiumAccess?: (userId: string) => Promise<boolean | null>
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
  return env.XAI_API_KEY ? xaiModernGenerator(env.XAI_API_KEY, { model: env.PUBLIC_BOOK_MODERN_MODEL, format: env.PUBLIC_BOOK_MODERN_FORMAT === 'text' ? 'text' : 'json' }) : null
}

function offerFor(env: ModernEnv, meta: StoredMeta, job: ModernJob | null, now: number): { tier: ModernTier; cents: number } | null {
  if (!modernSwitchOn(env) || !env.STRIPE_SECRET_KEY || !purchaseOpen(job, now)) return null
  const tier = modernTierFor(meta.book.wordCount)
  return modernPriceId(env, tier) ? { tier, cents: modernTierCents(tier) } : null
}

/** What writing the book is expected to cost, from its word count (lib/modernBudget.ts). */
const bookExpectedUsd = (meta: StoredMeta) => modernBookExpectedUsd(meta.book.wordCount ?? meta.entry.wordCount)

/** The offer, only while the month's ceiling has room for this book's expected cost (new purchases only). */
async function availableOffer(env: ModernEnv, meta: StoredMeta, job: ModernJob | null, now: number): Promise<{ tier: ModernTier; cents: number } | null> {
  const offer = offerFor(env, meta, job, now)
  if (!offer) return null
  return await modernMonthHasRoom(env, now, usdToMicros(bookExpectedUsd(meta))) ? offer : null
}

function statusBody(meta: StoredMeta, job: ModernJob | null, now: number, offer: { tier: ModernTier; cents: number } | null) {
  const state = !job ? 'none' : job.state === 'paid' ? (jobComplete(job) ? 'complete' : 'paid') : holdLive(job, now) ? 'checkout' : 'none'
  const totals = Object.fromEntries(meta.entry.readingStructure.chapters.map(c => [c.number, c.paragraphCount]))
  return {
    state, chapters: publicChapterStates(job, now), offer,
    // While the edition is being written: how far each chapter is, and an estimate of when it is done.
    ...(state === 'paid' ? { progress: publicProgress(job, totals), failures: publicFailures(job, now) } : {}),
  }
}

/** Premium (trial included) for the signed-in account; null when unknown. Never throws. */
async function buyerPremium(userId: string, deps: ModernDeps): Promise<boolean | null> {
  return deps.premiumAccess ? deps.premiumAccess(userId).catch(() => null) : null
}

/**
 * The status as this reader may see it: a signed-in account that sends its
 * token and is neither Premium nor in its trial gets no offer. Premium is
 * looked up only when there is an offer to show.
 */
async function statusFor(request: Request, env: ModernEnv, meta: StoredMeta, job: ModernJob | null, now: number, deps: ModernDeps) {
  const offer = await availableOffer(env, meta, job, now)
  if (!offer || !request.headers.get('Authorization')) return statusBody(meta, job, now, offer)
  const user = await deps.verifyUser(request).catch(() => null)
  if (!user || !isValidUUID(user.id)) return statusBody(meta, job, now, offer)
  return statusBody(meta, job, now, await buyerPremium(user.id, deps) === true ? offer : null)
}

// ===== Generation =====

/**
 * Once per paid job written before outputs were checked for echoes: text that
 * is the source handed back is discarded and queued again (lib/modernEdition.ts
 * repairEchoedEdition). Returns the job as it now stands.
 */
async function auditedJob(bucket: R2Bucket, bookId: string, meta: StoredMeta, checked: ModernJob | null, now: number): Promise<ModernJob | null> {
  let job = checked
  // Chapters left failed before failure reasons were recorded go again now (lib reviveFailedChapters).
  if (job?.state === 'paid' && job.revived !== FAILED_REVIVAL) {
    await reviveFailedChapters(bucket, bookId, now)
    job = (await readJob(bucket, bookId))?.job ?? null
  }
  if (!needsAudit(job)) return job
  const source = (await readJson<{ chapters?: SourceChapter[] }>(bucket, editionObjectKey(bookId, meta.editionKey)))?.chapters
  if (!source?.length) return job
  await repairEchoedEdition(bucket, bookId, source, now)
  return (await readJob(bucket, bookId))?.job ?? null
}

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
  await auditedJob(bucket, bookId, meta, (await readJob(bucket, bookId))?.job ?? null, now())
  // Ledger rows are written in the background; this run waits for them before it ends.
  const ledger: Promise<unknown>[] = []
  const onCost = (cost: ModernCost) => recordModernCost(env, { waitUntil: promise => { ledger.push(promise) } }, bookId, cost)
  try {
    await runModernWorkers(env, bucket, bookId, meta, options, now, onCost)
  } finally {
    await settleModernMonth(env, bucket, bookId, now()).catch(() => {})
    await Promise.allSettled(ledger)
  }
}

/** One ledger row per provider call: Tinct's own cost, no reader on it, never charged (lib/aiAllowance.ts NEVER_CHARGED_AI_FEATURES). */
function recordModernCost(env: ModernEnv, ctx: { waitUntil(promise: Promise<unknown>): void }, bookId: string, cost: ModernCost): void {
  recordAiUsage(env, ctx, {}, {
    feature: 'modern_edition', provider: 'xai', model: cost.model || env.PUBLIC_BOOK_MODERN_MODEL || XAI_MODERN_MODEL, book_id: bookId,
    input_tokens: cost.inputTokens, output_tokens: cost.outputTokens, cost_usd: cost.costUsd,
  })
}

/**
 * The month's budget follows the paid book: what it has cost beyond its
 * reservation is added to this month (never refused; logged when the month
 * goes over), once each, on the job's etag; once the book is finished, what
 * the reservation did not use is given back.
 */
export async function settleModernMonth(env: ModernEnv, bucket: R2Bucket, bookId: string, now: number): Promise<void> {
  let overrun = 0
  let unused: ModernReservation | null = null
  let unusedMicros = 0
  const result = await updateJob(bucket, bookId, job => {
    overrun = 0; unused = null; unusedMicros = 0
    if (!job || job.state !== 'paid') return null
    const cost = usdToMicros(job.costUsd ?? 0)
    const reserved = job.budget?.micros ?? 0
    const beyond = Math.max(0, cost - reserved)
    overrun = beyond - (job.overrunMicros ?? 0)
    const settle = jobComplete(job) && !!job.budget && !job.budgetSettled
    if (settle) { unused = job.budget!; unusedMicros = Math.max(0, reserved - cost) }
    if (overrun <= 0 && !settle) return null
    return { ...job, ...(overrun > 0 ? { overrunMicros: beyond } : {}), ...(settle ? { budgetSettled: true } : {}), updatedAt: now }
  })
  if (!result.wrote) return
  if (overrun > 0) await chargeModernOverrun(env, now, overrun, bookId)
  if (unused && unusedMicros > 0) await refundModernReservation(env, unused, unusedMicros)
}

async function runModernWorkers(env: ModernEnv, bucket: R2Bucket, bookId: string, meta: StoredMeta, options: { deadline: number; generate: ModernGenerator }, now: () => number, onCost: (cost: ModernCost) => void): Promise<void> {
  let source: Promise<Array<{ number: number; title: string; paragraphs: string[] }>> | null = null
  const loadSource = () => source ??= readJson<{ chapters: SourceChapter[] }>(bucket, editionObjectKey(bookId, meta.editionKey)).then(data => data?.chapters ?? [])
  const worker = async () => {
    // Each runner has its own id: it keeps its chapter from chunk to chunk and hands it back when it stops.
    const owner = crypto.randomUUID()
    let failures = 0
    let longest = 0
    try {
      while (now() < options.deadline) {
        // Never start a chunk that would not finish in time (a request's waitUntil is cut off): it would be paid for and lost.
        if (longest && options.deadline - now() < longest) return
        const began = now()
        const result = await modernStep(bucket, { bookId, title: meta.book.title, author: meta.book.author, source: loadSource, generate: options.generate, now, owner, onCost })
        longest = Math.max(longest, now() - began)
        // 'backoff': the provider asked us to wait (429/5xx); the next request or the cron goes on after it.
        if (result === 'idle' || result === 'complete' || result === 'backoff') return
        if (result === 'failed') { if (++failures >= 3) return } else failures = 0
      }
    } finally {
      // Handing the chapter back lets the next request or cron go on at once, not after the lease lapses.
      await releaseRunner(bucket, bookId, owner, now()).catch(() => {})
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
  const ids = page.objects.map((object: { key: string }) => object.key.slice(MODERN_JOB_PREFIX.length)).filter((id: string) => isPublicBookId(id))
  for (const [i, bookId] of ids.entries()) {
    if (now() >= deadline) break
    // An equal share of what is left for each book still to go: one long book never starves the rest.
    const share = Math.min(deadline, now() + (deadline - now()) / (ids.length - i))
    await runModernBook(env, bookId, { deadline: share, generate, now })
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
  const expectedUsd = bookExpectedUsd(meta)
  const result = await updateJob(bucket, bookId, job => {
    previous = job
    if (job?.state === 'paid') return null
    // This session's checkout reserved the book's expected cost in the month: the paid job carries it.
    const budget = job?.state === 'checkout' && job.sessionId === session.id ? job.budget : undefined
    return paidJob({ bookId, tier, sessionId: session.id, chapters: meta.entry.readingStructure.chapters.map(c => c.number), anchor: Number.isInteger(chapter) ? chapter : null, now: now(), expectedUsd, budget })
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
  if (held?.state === 'checkout' && held.sessionId !== session.id) await refundModernReservation(env, held.budget)
  if (!result.job?.budget) {
    // Paid without a reservation of its own (its hold had lapsed): reserved now, never refused, since it is paid.
    const budget = await reserveModernBook(env, now(), usdToMicros(expectedUsd), { force: true, bookId })
    if (budget) {
      const kept = await updateJob(bucket, bookId, job => job?.state === 'paid' && job.sessionId === session.id && !job.budget ? { ...job, budget, updatedAt: now() } : null)
      if (!kept.wrote) await refundModernReservation(env, budget)
    }
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
  // Premium (or the 30-day trial) only, like adding a book: the same 402 (publicBooks.ts PREMIUM_REQUIRED).
  const premium = await buyerPremium(user.id, deps)
  if (premium === null) return reply({ error: 'unavailable' }, 503, request)
  if (!premium) return reply({ error: 'premium_required' }, 402, request)
  let chapter: number | null = null
  try { const n = Number((await request.json() as { chapter?: unknown }).chapter); chapter = Number.isInteger(n) && n >= 0 ? n : null } catch { chapter = null }
  const now = deps.now ?? Date.now
  const stripeFetch = deps.stripeFetch ?? fetch
  const current = await readJob(bucket, bookId)
  // The month's ceiling (new purchases only) hides the offer like any other unavailability: 404 not_available.
  const offer = await availableOffer(env, meta, current?.job ?? null, now())
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
  // The month's budget first, strictly, before any Stripe session exists: no room, no payment.
  const budget = await reserveModernBook(env, now(), usdToMicros(bookExpectedUsd(meta)), { bookId })
  if (!budget) return reply({ error: 'not_available' }, 404, request)
  // Hold the book: of two buyers racing, only one conditional put wins.
  const holdId = `hold_${crypto.randomUUID()}`
  let lapsed: ModernJob | null = null
  const hold = await updateJob(bucket, bookId, job => {
    lapsed = job?.state === 'checkout' ? job : null
    return purchaseOpen(job, now())
      ? { version: 1, bookId, state: 'checkout', tier: offer.tier, sessionId: holdId, holdUntil: now() + HOLD_MS, priority: [], chapters: [], budget, updatedAt: now() }
      : null
  })
  if (!hold.wrote) { await refundModernReservation(env, budget); return reply({ error: hold.job?.state === 'paid' ? 'exists' : 'in_progress' }, 409, request) }
  // A lapsed hold taken over gives back what it reserved.
  await refundModernReservation(env, (lapsed as ModernJob | null)?.budget)
  const release = async () => { await refundModernReservation(env, (await releaseHold(bucket, bookId, holdId))?.budget) }

  const customer = await (deps.ensureCustomer ?? (u => ensureStripeCustomer(env, u)))({ id: user.id, email: user.email }).catch(() => ({ error: 'customer' }))
  if ('error' in customer) { await release(); return reply({ error: 'payment_unavailable' }, 502, request) }
  const origin = getAllowedOrigin(request)
  const params = new URLSearchParams()
  params.set('customer', customer.id)
  params.set('mode', 'payment')
  params.set('line_items[0][price]', priceId)
  params.set('line_items[0][quantity]', '1')
  // The return names the book, so the reader opens it (and switches to the edition once
  // granted) in whatever tab or browser Checkout ends in (labModernReturn.ts).
  const book = encodeURIComponent(bookId)
  params.set('success_url', `${origin}/reader?book=${book}&modern=1&session_id={CHECKOUT_SESSION_ID}`)
  params.set('cancel_url', `${origin}/reader?book=${book}&modern=cancel`)
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
  if (!session?.id || !session.url) { await release(); return reply({ error: 'payment_unavailable' }, 502, request) }
  const sessionId = session.id
  const bound = await updateJob(bucket, bookId, job => job?.state === 'checkout' && job.sessionId === holdId ? { ...job, sessionId, updatedAt: now() } : null)
  if (!bound.wrote) {
    // The hold was lost (it cannot be, short of a clock jump): never leave a payable session behind.
    await stripeFetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}/expire`, { method: 'POST', headers: stripeHeaders(env) }).catch(() => null)
    return reply({ error: 'in_progress' }, 409, request)
  }
  return reply({ url: session.url }, 200, request)
}

/**
 * The buyer came back from Checkout without paying (the cancel return). Only the
 * caller's own session, as Stripe records it, is ended: it is expired first (so it can
 * no longer be paid), then the hold on the book is released for other buyers.
 */
async function cancelCheckout(request: Request, env: ModernEnv, bucket: R2Bucket, bookId: string, deps: ModernDeps): Promise<Response> {
  const user = await deps.verifyUser(request)
  if (!user || !isValidUUID(user.id)) return reply({ error: 'Unauthorized' }, 401, request)
  if (!await deps.checkRateLimit(`public-modern-checkout:${user.id}`, undefined, CHECKOUT_PER_MINUTE)) return reply({ error: 'rate_limited' }, 429, request)
  const now = deps.now ?? Date.now
  const stripeFetch = deps.stripeFetch ?? fetch
  const current = await readJob(bucket, bookId)
  const job = current?.job
  if (!job || job.state !== 'checkout' || !holdLive(job, now()) || !/^cs_[A-Za-z0-9_]+$/.test(job.sessionId) || !env.STRIPE_SECRET_KEY) return reply({ released: false }, 200, request)
  const sessionId = job.sessionId
  const open = await stripeFetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, { headers: stripeHeaders(env) })
    .then(r => r.ok ? r.json() as Promise<{ status?: string; metadata?: Record<string, string> }> : null).catch(() => null)
  if (open?.metadata?.supabase_user_id !== user.id || open.metadata?.book_id !== bookId) return reply({ released: false }, 200, request)
  if (open.status === 'open') {
    const expired = await stripeFetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}/expire`, { method: 'POST', headers: stripeHeaders(env) })
      .then(r => r.ok).catch(() => false)
    // Not expired (it may have just been paid): the hold stays until the webhook decides.
    if (!expired) return reply({ released: false }, 200, request)
  } else if (open.status !== 'expired') {
    return reply({ released: false }, 200, request)
  }
  await refundModernReservation(env, (await releaseHold(bucket, bookId, sessionId))?.budget)
  return reply({ released: true }, 200, request)
}

/**
 * checkout.session.expired and checkout.session.async_payment_failed for a Modern
 * English edition: that session's hold on the book is released (never a paid job's,
 * nor another session's). Idempotent.
 */
export async function releaseModernCheckout(env: ModernEnv, session: CheckoutSessionObject): Promise<'released' | 'ignored'> {
  const bookId = session.metadata?.book_id || ''
  const bucket = bucketOf(env)
  if (!isPublicBookId(bookId) || !bucket) return 'ignored'
  const current = await readJob(bucket, bookId)
  if (!current || current.job.state !== 'checkout' || current.job.sessionId !== session.id) return 'ignored'
  await refundModernReservation(env, (await releaseHold(bucket, bookId, session.id))?.budget)
  return 'released'
}

async function priority(request: Request, env: ModernEnv, bucket: R2Bucket, bookId: string, meta: StoredMeta, deps: ModernDeps): Promise<Response> {
  const ip = request.headers.get('cf-connecting-ip') || 'unknown'
  if (!await deps.checkRateLimit(`public-modern-priority:${ip}`, undefined, PRIORITY_PER_MINUTE)) return reply({ error: 'rate_limited' }, 429, request)
  let chapter = NaN
  let paragraph: number | undefined
  try {
    const body = await request.json() as { chapter?: unknown; paragraph?: unknown }
    chapter = Number(body.chapter)
    const p = Number(body.paragraph)
    paragraph = body.paragraph !== undefined && Number.isInteger(p) && p >= 0 ? p : undefined
  } catch { /* below */ }
  if (!Number.isInteger(chapter)) return reply({ error: 'bad_request' }, 400, request)
  const now = deps.now ?? Date.now
  const focusOf = (job: ModernJob) => job.chapters.find(c => c.number === chapter)?.focus ?? 0
  const { job } = await updateJob(bucket, bookId, current => {
    if (current?.state !== 'paid') return null
    const next = prioritise(current, chapter, paragraph)
    return next === current || (next.priority.join() === current.priority.join() && focusOf(next) === focusOf(current)) ? null : { ...next, updatedAt: now() }
  })
  if (job?.state === 'paid' && !jobComplete(job)) kick(env, bookId, deps)
  return reply(await statusFor(request, env, meta, job, now(), deps), 200, request)
}

/** `/api/public-books/{id}/modern-en[/…]`. */
export async function handleModernEdition(request: Request, env: ModernEnv, bookId: string, rest: string[], deps: ModernDeps): Promise<Response> {
  const bucket = bucketOf(env)
  if (!bucket) return reply({ error: 'Not configured' }, 503, request)
  const meta = await readJson<StoredMeta>(bucket, metaKey(bookId))
  if (!modernEligible(meta)) return reply({ error: 'Not found' }, 404, request)
  const now = deps.now ?? Date.now
  if (request.method === 'GET' && rest.length === 0) {
    const job = await auditedJob(bucket, bookId, meta, (await readJob(bucket, bookId))?.job ?? null, now())
    if (job?.state === 'paid' && !jobComplete(job)) kick(env, bookId, deps)
    return reply(await statusFor(request, env, meta, job, now(), deps), 200, request)
  }
  if (request.method === 'POST' && rest.length === 1 && rest[0] === 'checkout') return checkout(request, env, bucket, bookId, meta, deps)
  if (request.method === 'POST' && rest.length === 1 && rest[0] === 'cancel') return cancelCheckout(request, env, bucket, bookId, deps)
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
  // Checked before the finished object is served: an echoed edition must not be handed out (auditedJob).
  const unchecked = (await readJob(bucket, bookId))?.job ?? null
  const meta = needsAudit(unchecked) ? await readJson<StoredMeta>(bucket, metaKey(bookId)) : null
  if (meta && modernEligible(meta)) await auditedJob(bucket, bookId, meta, unchecked, now)
  const whole = await bucket.get(wholeKey(bookId))
  if (whole) return new Response(whole.body, { status: 200, headers: headers('public, max-age=300') })
  const stored = meta ?? await readJson<StoredMeta>(bucket, metaKey(bookId))
  const job = (await readJob(bucket, bookId))?.job ?? null
  if (!modernEligible(stored) || job?.state !== 'paid') return reply({ error: 'Not found' }, 404, request)
  const original = await readJson<{ chapters: SourceChapter[]; collection?: boolean }>(bucket, editionObjectKey(bookId, stored.editionKey))
  if (!original?.chapters?.length) return reply({ error: 'Not found' }, 404, request)
  return new Response(JSON.stringify(await assembleEdition(bucket, bookId, original.chapters, job, now, original.collection === true)), { status: 200, headers: headers('no-store') })
}

/**
 * One chapter of the Modern English edition exactly as serveModernEdition
 * hands it to the reader, without assembling every other chapter (narration
 * asks for one chapter per request). `pending` is the reader's own rule
 * (labModernEdition.ts modernChapterPending): the chapter came in its
 * original text because its Modern English text is not written yet.
 */
export async function modernEditionChapter(env: Pick<PublicBooksEnv, 'PUBLIC_BOOKS' | 'AUDIO_BUCKET'>, bookId: string, chapterNumber: number, now = Date.now()): Promise<(SourceChapter & { pending: boolean }) | null> {
  const bucket = bucketOf(env)
  if (!bucket) return null
  const unchecked = (await readJob(bucket, bookId))?.job ?? null
  if (needsAudit(unchecked)) {
    const meta = await readJson<StoredMeta>(bucket, metaKey(bookId))
    if (modernEligible(meta)) await auditedJob(bucket, bookId, meta, unchecked, now)
  }
  const whole = await readJson<{ chapters?: SourceChapter[] }>(bucket, wholeKey(bookId))
  if (whole) {
    const chapter = editionChapter(whole.chapters, chapterNumber)
    return chapter ? { ...chapter, pending: false } : null
  }
  const meta = await readJson<StoredMeta>(bucket, metaKey(bookId))
  const job = (await readJob(bucket, bookId))?.job ?? null
  if (!modernEligible(meta) || job?.state !== 'paid') return null
  const original = await readJson<{ chapters?: SourceChapter[] }>(bucket, editionObjectKey(bookId, meta.editionKey))
  const source = editionChapter(original?.chapters, chapterNumber)
  if (!source) return null
  const state = publicChapterStates(job, now)[source.number]
  return { ...await assembleChapter(bucket, bookId, source, state), pending: state !== 'ready' }
}

/**
 * `GET /api/admin/modern-diagnostics?book=<pd-id>` (site admins only): the job's
 * per-chapter generation state, including the start of the last refused reply
 * and the chunk size it was refused at (lastReject), what it has cost against
 * what it was expected to cost, and the paragraphs written in the original
 * text (fallback, review). `?review=1` lists every book flagged for review,
 * with the month's Modern English spend. Public-domain book text, book
 * progress and Tinct's own cost only; never part of the public status.
 */
export async function handleModernDiagnostics(request: Request, env: ModernEnv, verifySiteAdmin: (env: ModernEnv, request: Request) => Promise<boolean>): Promise<Response> {
  if (request.method !== 'GET') return reply({ error: 'Method not allowed' }, 405, request)
  if (!await verifySiteAdmin(env, request).catch(() => false)) return reply({ error: 'Forbidden' }, 403, request)
  const params = new URL(request.url).searchParams
  const bookId = params.get('book') || ''
  const bucket = bucketOf(env)
  if (!bucket) return reply({ error: 'Not configured' }, 503, request)
  if (params.get('review') === '1') {
    const page = await bucket.list({ prefix: MODERN_REVIEW_PREFIX, limit: 1000 })
    const used = await modernMonthMicros(env, Date.now())
    return reply({
      review: page.objects.map((object: { key: string }) => object.key.slice(MODERN_REVIEW_PREFIX.length)).filter((id: string) => isPublicBookId(id)),
      month: { usedUsd: used === null ? null : used / 1_000_000, limitUsd: modernMonthlyMicros(env) / 1_000_000 },
    }, 200, request)
  }
  if (!isPublicBookId(bookId)) return reply({ error: 'bad_request' }, 400, request)
  const job = (await readJob(bucket, bookId))?.job
  if (!job) return reply({ error: 'Not found' }, 404, request)
  return reply({
    bookId, state: job.state, backoffUntil: job.backoffUntil ?? null, slowUntil: job.slowUntil ?? null, pace: job.pace ?? null, revived: job.revived ?? null,
    costUsd: job.costUsd ?? null, expectedUsd: job.expectedUsd ?? null, budget: job.budget ?? null, overrunMicros: job.overrunMicros ?? null, review: job.review ?? null,
    chapters: job.chapters.map(c => ({
      number: c.number, state: c.state, attempts: c.attempts, rounds: c.rounds ?? 0, chunkWords: c.chunkWords ?? null,
      done: (c.ranges ?? []).reduce((sum, [a, b]) => sum + b - a, 0), total: c.total ?? null,
      lastFailure: c.lastFailure ?? null, lastReject: c.lastReject ?? null, spentHere: c.spentHere ?? null, fallback: c.fallback ?? null,
    })),
  }, 200, request)
}
