// Paid Modern English editions of added public-domain books. No real model or
// Stripe call is made: the generator, Stripe and Supabase are all stand-ins.
import { afterEach, describe, expect, it, vi } from 'vitest'
import { handlePublicBooks, handlePublicEditionData, type PublicBooksDeps } from './worker/routes/publicBooks'
import { grantModernEdition, releaseModernCheckout, runModernBook, runModernEditionJobs, type ModernDeps } from './worker/routes/publicBookModern'
import { handleWebhook } from './worker/routes/billing'
import {
  CHUNK_WORDS,
  FAILED_RETRY_MS,
  HOLD_MS,
  LEASE_MS,
  MAX_ATTEMPTS,
  MAX_PARALLEL,
  MAX_ROUNDS,
  OPENING_WORDS,
  chunkStart,
  nextChunk,
  publicProgress,
  writtenRanges,
  MODERN_TIERS,
  modernStep,
  modernTierCents,
  modernTierFor,
  nextChapter,
  paidJob,
  prioritise,
  publicChapterStates,
  readJob,
  updateJob,
  validChunk,
  workOrder,
  type ModernGenerator,
} from './worker/lib/modernEdition'

const USER = '11111111-1111-4111-8111-111111111111'
const OTHER = '22222222-2222-4222-8222-222222222222'
const BOOK = 'pd-pg-99999'

/** An R2 stand-in with etags and conditional puts (onlyIf), like R2's. */
function fakeBucket() {
  const objects = new Map<string, { bytes: Uint8Array; etag: string }>()
  let version = 0
  const view = (key: string) => {
    const o = objects.get(key)!
    return { key, size: o.bytes.byteLength, etag: o.etag, body: new Response(o.bytes.slice()).body }
  }
  const bucket = {
    async put(key: string, value: string | Uint8Array, opts: { onlyIf?: { etagMatches?: string; etagDoesNotMatch?: string } } = {}) {
      const current = objects.get(key)
      const cond = opts.onlyIf
      if (cond?.etagMatches !== undefined && current?.etag !== cond.etagMatches) return null
      if (cond?.etagDoesNotMatch === '*' && current) return null
      objects.set(key, { bytes: typeof value === 'string' ? new TextEncoder().encode(value) : value, etag: `e${++version}` })
      return view(key)
    },
    async get(key: string) { return objects.has(key) ? view(key) : null },
    async head(key: string) { return objects.has(key) ? view(key) : null },
    async delete(keys: string | string[]) { for (const key of ([] as string[]).concat(keys)) objects.delete(key) },
    async list(opts: { prefix?: string; limit?: number } = {}) {
      const keys = [...objects.keys()].filter(key => key.startsWith(opts.prefix ?? '')).sort().slice(0, opts.limit ?? 1000)
      return { objects: keys.map(view), truncated: false, delimitedPrefixes: [] }
    },
  }
  const json = (key: string) => objects.has(key) ? JSON.parse(new TextDecoder().decode(objects.get(key)!.bytes)) : null
  return { bucket: bucket as unknown as R2Bucket, objects, json }
}

const SOURCE = [1, 2, 3, 4, 5].map(number => ({
  number,
  title: `Chapter ${number}`,
  paragraphs: [`It was the ${number} morning, and the old house on the hill stood dark against a cold grey sky.`, `“Come in,” she said.`, `He went in.`],
}))

function seed(r2: ReturnType<typeof fakeBucket>, wordCount = 60_000) {
  const book = { id: BOOK, title: 'The River House', author: 'Ann Example', wordCount, editions: [{ key: 'original-en', language: 'en', style: 'original', label: 'Original', aligned: false, hasAudio: false }] }
  const readingStructure = { totalParagraphs: 15, chapters: SOURCE.map(c => ({ number: c.number, title: c.title, paragraphCount: 3 })) }
  const entry = { id: BOOK, title: book.title, author: book.author, wordCount, editions: [{ key: 'original-en' }], readingStructure }
  void r2.bucket.put(`public-books/${BOOK}/meta.json`, JSON.stringify({ version: 1, book, entry, editionKey: 'original-en' }))
  void r2.bucket.put(`public-books/${BOOK}/original-en.json`, JSON.stringify({ chapters: SOURCE }))
}

/** Echo "generator": keeps every paragraph (with a marker), as a model would return them. */
const modernise: ModernGenerator = async input => input.paragraphs.map(p => `[m] ${p}`)

const PRICES = { STRIPE_PRICE_MODERN_T1: 'price_t1', STRIPE_PRICE_MODERN_T2: 'price_t2', STRIPE_PRICE_MODERN_T3: 'price_t3', STRIPE_PRICE_MODERN_T4: 'price_t4' }

function setup(options: { switchOn?: boolean; prices?: Record<string, string>; now?: { t: number }; generator?: ModernGenerator; stripeFails?: boolean } = {}) {
  const r2 = fakeBucket()
  seed(r2)
  const clock = options.now ?? { t: Date.UTC(2026, 9, 6) }
  const env = {
    AUDIO_BUCKET: r2.bucket, ASSETS: { fetch: async () => new Response('') },
    STRIPE_SECRET_KEY: 'sk_test_x', XAI_API_KEY: undefined as string | undefined,
    ...(options.switchOn === false ? {} : { PUBLIC_BOOK_MODERN_EDITIONS: '1' }),
    ...(options.prices ?? PRICES),
  }
  const stripe = { created: [] as URLSearchParams[], expired: [] as string[], refunds: [] as Array<{ body: string; key: string | null }>, sessions: new Map<string, { status: string; url: string; metadata: Record<string, string> }>() }
  const stripeFetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input)
    if (url === 'https://api.stripe.com/v1/checkout/sessions' && init?.method === 'POST') {
      if (options.stripeFails) return Response.json({ error: { message: 'no' } }, { status: 400 })
      const params = new URLSearchParams(String(init.body))
      stripe.created.push(params)
      const id = `cs_test_${stripe.created.length}`
      const metadata: Record<string, string> = {}
      for (const [key, value] of params) { const m = key.match(/^metadata\[(.+)\]$/); if (m) metadata[m[1]] = value }
      const session = { status: 'open', url: `https://checkout.stripe.com/c/pay/${id}`, metadata }
      stripe.sessions.set(id, session)
      return Response.json({ id, ...session })
    }
    const expire = url.match(/checkout\/sessions\/(cs_[a-z_0-9]+)\/expire$/)
    if (expire) { stripe.expired.push(expire[1]); return Response.json({}) }
    const get = url.match(/checkout\/sessions\/(cs_[a-z_0-9]+)$/)
    if (get) return stripe.sessions.has(get[1]) ? Response.json({ id: get[1], ...stripe.sessions.get(get[1]) }) : Response.json({}, { status: 404 })
    if (url === 'https://api.stripe.com/v1/refunds') { stripe.refunds.push({ body: String(init?.body), key: new Headers(init?.headers).get('Idempotency-Key') }); return Response.json({ id: 're_1' }) }
    throw new Error(`unexpected ${url}`)
  }) as typeof fetch
  const waits: Promise<unknown>[] = []
  const calls: string[][] = []
  const generator: ModernGenerator = options.generator ?? (async input => { calls.push(input.paragraphs); return modernise(input) })
  const modern: Partial<ModernDeps> = {
    now: () => clock.t, generator, stripeFetch,
    ensureCustomer: async () => ({ id: 'cus_1' }),
  }
  const deps: PublicBooksDeps = {
    verifyUser: async request => {
      const auth = request.headers.get('authorization')
      return auth === 'Bearer a' ? { id: USER, email: 'a@example.com' } : auth === 'Bearer b' ? { id: OTHER, email: 'b@example.com' } : null
    },
    checkRateLimit: async () => true,
    countDaily: async () => true,
    acquireLock: async () => true,
    premiumAccess: async () => true,
    waitUntil: promise => { waits.push(promise) },
    modern,
  }
  const call = (path: string, init: RequestInit & { token?: string; json?: unknown } = {}) => {
    const headers = new Headers(init.headers)
    if (init.token) headers.set('Authorization', `Bearer ${init.token}`)
    const body = init.json !== undefined ? JSON.stringify(init.json) : init.body
    return handlePublicBooks(new Request(`https://tinct.app${path}`, { method: init.method ?? (body ? 'POST' : 'GET'), headers, body }), env, deps)
  }
  const status = async () => (await call(`/api/public-books/${BOOK}/modern-en`)).json() as Promise<{ state: string; chapters: Record<string, string>; offer: { tier: number; cents: number } | null }>
  const buy = (token: string, chapter = 3) => call(`/api/public-books/${BOOK}/modern-en/checkout`, { token, json: { chapter } })
  const grant = (sessionId: string, metadata: Record<string, string> = {}) => grantModernEdition(env, { id: sessionId, payment_intent: `pi_${sessionId}`, metadata: { type: 'modern_edition', book_id: BOOK, tier: '2', chapter: '3', supabase_user_id: USER, ...metadata } }, { now: () => clock.t, generator, stripeFetch, waitUntil: p => { waits.push(p) } })
  return { r2, env, deps, clock, stripe, call, status, buy, grant, calls, generator, waits }
}

afterEach(() => vi.unstubAllGlobals())

describe('price tiers', () => {
  it('picks the tier from the word count at the documented ceilings', () => {
    expect(modernTierFor(0)).toBe(1)
    expect(modernTierFor(null)).toBe(1)
    expect(modernTierFor(40_000)).toBe(1)
    expect(modernTierFor(40_001)).toBe(2)
    expect(modernTierFor(100_000)).toBe(2)
    expect(modernTierFor(100_001)).toBe(3)
    expect(modernTierFor(200_000)).toBe(3)
    expect(modernTierFor(200_001)).toBe(4)
    expect(modernTierFor(1_500_000)).toBe(4)
    expect([1, 2, 3, 4].map(t => modernTierCents(t as 1))).toEqual([299, 499, 799, 1199])
    expect(MODERN_TIERS.map(t => t.cents)).toEqual([299, 499, 799, 1199])
  })

  it('offers the book’s tier, and only with the switch on and the tier’s price configured', async () => {
    expect((await setup().status()).offer).toEqual({ tier: 2, cents: 499 })
    expect((await setup({ switchOn: false }).status()).offer).toBeNull()
    expect((await setup({ prices: { STRIPE_PRICE_MODERN_T1: 'price_t1' } }).status()).offer).toBeNull()
  })

  it('charges the tier’s price, never one from the request', async () => {
    const t = setup()
    const response = await t.call(`/api/public-books/${BOOK}/modern-en/checkout`, { token: 'a', json: { chapter: 1, price: 'price_t1', tier: 1 } })
    expect(response.status).toBe(200)
    expect(t.stripe.created[0].get('line_items[0][price]')).toBe('price_t2')
    expect(t.stripe.created[0].get('mode')).toBe('payment')
    expect(t.stripe.created[0].get('metadata[type]')).toBe('modern_edition')
    expect(t.stripe.created[0].get('metadata[book_id]')).toBe(BOOK)
  })
})

describe('purchase guard', () => {
  it('requires a signed-in reader', async () => {
    const t = setup()
    expect((await t.buy('')).status).toBe(401)
    expect(t.stripe.created).toHaveLength(0)
  })

  it('holds the book for one checkout: a second buyer is refused, the same buyer gets the same session', async () => {
    const t = setup()
    const first = await t.buy('a')
    const { url } = await first.json() as { url: string }
    expect(url).toMatch(/^https:\/\/checkout\.stripe\.com\//)
    expect((await t.status())).toMatchObject({ state: 'checkout', offer: null })
    const other = await t.buy('b')
    expect(other.status).toBe(409)
    expect(await other.json()).toEqual({ error: 'in_progress' })
    const again = await t.buy('a')
    expect(await again.json()).toEqual({ url })
    expect(t.stripe.created).toHaveLength(1)
  })

  it('lets only one of two simultaneous buyers start a checkout', async () => {
    const t = setup()
    const results = await Promise.all([t.buy('a'), t.buy('b'), t.buy('b')])
    expect(results.filter(r => r.status === 200)).toHaveLength(1)
    expect(t.stripe.created).toHaveLength(1)
  })

  it('a session expires before its hold does, and an expired hold frees the book', async () => {
    const t = setup()
    await t.buy('a')
    const expiresAt = Number(t.stripe.created[0].get('expires_at')) * 1000
    expect(expiresAt).toBeLessThan(t.clock.t + HOLD_MS)
    t.clock.t += HOLD_MS + 1
    expect((await t.status()).offer).toEqual({ tier: 2, cents: 499 })
    expect((await t.buy('b')).status).toBe(200)
    expect(t.stripe.created).toHaveLength(2)
  })

  it('releases the hold when Stripe fails', async () => {
    const t = setup({ stripeFails: true })
    expect((await t.buy('a')).status).toBe(502)
    expect((await t.status()).offer).not.toBeNull()
  })

  it('never offers or sells a book that is already paid', async () => {
    const t = setup()
    await t.buy('a')
    expect((await t.grant('cs_test_1')).outcome).toBe('granted')
    expect((await t.status())).toMatchObject({ state: 'paid', offer: null })
    const late = await t.buy('b')
    expect(late.status).toBe(409)
    expect(await late.json()).toEqual({ error: 'exists' })
    expect(t.stripe.created).toHaveLength(1)
  })

  it('refunds a second payment for the same book instead of keeping it', async () => {
    const t = setup()
    expect((await t.grant('cs_a')).outcome).toBe('granted')
    expect((await t.grant('cs_b')).outcome).toBe('refunded')
    expect(t.stripe.refunds).toEqual([{ body: expect.stringContaining('payment_intent=pi_cs_b'), key: 'modern-refund-cs_b' }])
    expect((await readJob(t.r2.bucket, BOOK))!.job.sessionId).toBe('cs_a')
  })

  it('Checkout returns to the book in the reader: paid with its session id, cancelled with modern=cancel', async () => {
    const t = setup()
    await t.buy('a')
    expect(t.stripe.created[0].get('success_url')).toBe(`https://tinct.app/reader?book=${BOOK}&modern=1&session_id={CHECKOUT_SESSION_ID}`)
    expect(t.stripe.created[0].get('cancel_url')).toBe(`https://tinct.app/reader?book=${BOOK}&modern=cancel`)
  })

  it('the cancel return expires the buyer’s own open session and frees the book at once', async () => {
    const t = setup()
    await t.buy('a')
    const cancel = (token: string) => t.call(`/api/public-books/${BOOK}/modern-en/cancel`, { token, method: 'POST' })
    expect((await cancel('')).status).toBe(401)
    // Another reader cannot release someone else's checkout.
    expect(await (await cancel('b')).json()).toEqual({ released: false })
    expect(t.stripe.expired).toEqual([])
    expect((await t.status()).state).toBe('checkout')
    expect(await (await cancel('a')).json()).toEqual({ released: true })
    expect(t.stripe.expired).toEqual(['cs_test_1'])
    expect(await t.status()).toMatchObject({ state: 'none', offer: { tier: 2, cents: 499 } })
    expect((await t.buy('b')).status).toBe(200)
    // Nothing to release once the book is free, or once it is paid.
    expect(await (await cancel('a')).json()).toEqual({ released: false })
    expect((await t.grant('cs_test_2', { supabase_user_id: OTHER })).outcome).toBe('granted')
    expect(await (await cancel('b')).json()).toEqual({ released: false })
    expect((await t.status()).state).toBe('paid')
  })

  it('the cancel return keeps the hold when the session can no longer be expired (it may have just been paid)', async () => {
    const t = setup()
    await t.buy('a')
    t.stripe.sessions.get('cs_test_1')!.status = 'complete'
    expect(await (await t.call(`/api/public-books/${BOOK}/modern-en/cancel`, { token: 'a', method: 'POST' })).json()).toEqual({ released: false })
    expect(t.stripe.expired).toEqual([])
    expect((await t.status()).state).toBe('checkout')
  })

  it('an expired or failed checkout releases only its own hold', async () => {
    const t = setup()
    await t.buy('a')
    const session = (id: string) => ({ id, metadata: { type: 'modern_edition', book_id: BOOK, supabase_user_id: USER } })
    expect(await releaseModernCheckout(t.env, session('cs_other'))).toBe('ignored')
    expect((await t.status()).state).toBe('checkout')
    expect(await releaseModernCheckout(t.env, { id: 'cs_test_1', metadata: { book_id: '../x' } })).toBe('ignored')
    expect(await releaseModernCheckout(t.env, session('cs_test_1'))).toBe('released')
    expect((await t.status()).state).toBe('none')
    expect(await releaseModernCheckout(t.env, session('cs_test_1'))).toBe('ignored')
    await t.grant('cs_paid_1')
    expect(await releaseModernCheckout(t.env, session('cs_paid_1'))).toBe('ignored')
    expect((await t.status()).state).toBe('paid')
  })

  it('is not offered for a reader’s private book (not an added public book)', async () => {
    const t = setup()
    const response = await t.call('/api/public-books/userbook-abc/modern-en')
    expect(response.status).toBe(404)
  })
})

// Modern English purchase is for Premium readers only, the 30-day trial included
// (Anders, 2026-10-08; lib/aiAllowance.ts hasPremiumAccess, read by the Worker as premiumAccess).
describe('Premium only', () => {
  // Reader a: a free account past its trial. Reader b: Premium or in the trial.
  const freeAndPremium = (t: ReturnType<typeof setup>) => { t.deps.premiumAccess = async id => id !== USER }
  const statusAs = async (t: ReturnType<typeof setup>, token?: string) =>
    (await t.call(`/api/public-books/${BOOK}/modern-en`, { token })).json() as Promise<{ state: string; offer: { tier: number; cents: number } | null }>

  it('shows no offer to a signed-in free account past its trial, and the offer to Premium or the trial', async () => {
    const t = setup()
    freeAndPremium(t)
    expect((await statusAs(t, 'a')).offer).toBeNull()
    expect((await statusAs(t, 'b')).offer).toEqual({ tier: 2, cents: modernTierCents(2) })
    // Not signed in: unchanged (the reader shows no offer until a reader signs in).
    expect((await statusAs(t)).offer).toEqual({ tier: 2, cents: modernTierCents(2) })
  })

  it('the priority answer carries no offer for a free account either', async () => {
    const t = setup()
    freeAndPremium(t)
    const response = await t.call(`/api/public-books/${BOOK}/modern-en/priority`, { token: 'a', json: { chapter: 2 } })
    expect(response.status).toBe(200)
    expect(((await response.json()) as { offer: unknown }).offer).toBeNull()
  })

  it('refuses checkout to a free account past its trial with the Premium 402, before any hold or Stripe call', async () => {
    const t = setup()
    freeAndPremium(t)
    const refused = await t.buy('a')
    expect(refused.status).toBe(402)
    expect(await refused.json()).toEqual({ error: 'premium_required' })
    expect(t.stripe.created).toHaveLength(0)
    expect(await readJob(t.r2.bucket, BOOK)).toBeNull()
    // Premium (or the trial) buys as before.
    const bought = await t.buy('b')
    expect(bought.status).toBe(200)
    expect(t.stripe.created).toHaveLength(1)
  })

  it('refuses checkout when Premium cannot be told (fails closed)', async () => {
    const t = setup()
    t.deps.premiumAccess = async () => null
    expect((await t.buy('a')).status).toBe(503)
    t.deps.premiumAccess = async () => { throw new Error('down') }
    expect((await t.buy('a')).status).toBe(503)
    expect(t.stripe.created).toHaveLength(0)
    expect((await statusAs(t, 'a')).offer).toBeNull()
  })

  it('a free account still reads an edition someone already bought', async () => {
    const t = setup()
    freeAndPremium(t)
    await t.grant('cs_a')
    expect(await statusAs(t, 'a')).toMatchObject({ state: 'paid', offer: null })
    const edition = await handlePublicEditionData(new Request(`https://tinct.app/data/editions/${BOOK}-modern-en.json`, { headers: { Authorization: 'Bearer a' } }), t.env)
    expect(edition!.status).toBe(200)
    expect(((await edition!.json()) as { chapters: unknown[] }).chapters).toHaveLength(SOURCE.length)
  })
})

describe('webhook grant', () => {
  const sign = async (payload: string) => {
    const timestamp = Math.floor(Date.now() / 1000)
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode('whsec_1'), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${timestamp}.${payload}`))
    return `t=${timestamp},v1=${[...new Uint8Array(mac)].map(b => b.toString(16).padStart(2, '0')).join('')}`
  }

  it('grants once however often Stripe delivers the event, and records one payment', async () => {
    const t = setup()
    const sessionIds = new Set<string>()
    const inserts: Array<Record<string, unknown>> = []
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input).includes('/rest/v1/payments')) {
        const row = JSON.parse(String(init?.body)) as Record<string, unknown>
        inserts.push(row)
        if (sessionIds.has(String(row.stripe_session_id))) return new Response('dup', { status: 409 })
        sessionIds.add(String(row.stripe_session_id))
        return new Response(null, { status: 201 })
      }
      return Response.json({})
    }))
    const env = { STRIPE_WEBHOOK_SECRET: 'whsec_1', SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'srk' }
    const hooks = { modernEdition: (session: { id: string; metadata?: Record<string, string>; payment_intent?: string | null }) => grantModernEdition(t.env, session, { now: () => t.clock.t, generator: t.generator }) }
    const event = { type: 'checkout.session.completed', data: { object: { id: 'cs_paid', payment_intent: 'pi_1', payment_status: 'paid', metadata: { type: 'modern_edition', book_id: BOOK, tier: '2', chapter: '3', supabase_user_id: USER } } } }
    for (let i = 0; i < 3; i++) {
      const payload = JSON.stringify(event)
      const response = await handleWebhook(new Request('https://tinct.app/api/webhook', { method: 'POST', body: payload, headers: { 'stripe-signature': await sign(payload) } }), env, undefined, hooks)
      expect(response.status).toBe(200)
    }
    expect(inserts).toHaveLength(3)
    expect(inserts[0]).toMatchObject({ user_id: USER, stripe_session_id: 'cs_paid', amount_cents: 499, type: 'modern_edition', status: 'completed' })
    expect(sessionIds.size).toBe(1)
    const meta = t.r2.json(`public-books/${BOOK}/meta.json`)
    expect(meta.book.editions.filter((e: { key: string }) => e.key === 'modern-en')).toHaveLength(1)
    expect(meta.entry.editions.filter((e: { key: string }) => e.key === 'modern-en')).toHaveLength(1)
    expect((await readJob(t.r2.bucket, BOOK))!.job).toMatchObject({ state: 'paid', sessionId: 'cs_paid', anchor: 3, priority: [3, 4, 5] })
    expect(t.stripe.refunds).toHaveLength(0)
  })

  /** Supabase payments inserts, recorded; a repeated session id is a conflict (409), as the table's unique key. */
  const paymentsStub = () => {
    const inserts: Array<Record<string, unknown>> = []
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input).includes('/rest/v1/payments')) {
        const row = JSON.parse(String(init?.body)) as Record<string, unknown>
        const dup = inserts.some(r => r.stripe_session_id === row.stripe_session_id)
        inserts.push(row)
        return new Response(dup ? 'dup' : null, { status: dup ? 409 : 201 })
      }
      return Response.json({})
    }))
    return inserts
  }
  const webhookEnv = { STRIPE_WEBHOOK_SECRET: 'whsec_1', SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'srk' }
  const modernHooks = (t: ReturnType<typeof setup>) => ({
    modernEdition: (session: { id: string; metadata?: Record<string, string>; payment_intent?: string | null }) => grantModernEdition(t.env, session, { now: () => t.clock.t, generator: t.generator }),
    modernRelease: (session: { id: string; metadata?: Record<string, string> }) => releaseModernCheckout(t.env, session),
  })
  const deliver = async (type: string, object: Record<string, unknown>, hooks: Parameters<typeof handleWebhook>[3]) => {
    const payload = JSON.stringify({ type, data: { object } })
    return handleWebhook(new Request('https://tinct.app/api/webhook', { method: 'POST', body: payload, headers: { 'stripe-signature': await sign(payload) } }), webhookEnv, undefined, hooks)
  }
  const sessionObject = (id: string, payment_status: string) => ({ id, payment_intent: `pi_${id}`, payment_status, metadata: { type: 'modern_edition', book_id: BOOK, tier: '2', chapter: '3', supabase_user_id: USER } })

  it('grants nothing for a completed checkout whose delayed payment has not cleared, then grants when it succeeds', async () => {
    const t = setup()
    const inserts = paymentsStub()
    await t.buy('a')
    expect((await deliver('checkout.session.completed', sessionObject('cs_test_1', 'unpaid'), modernHooks(t))).status).toBe(200)
    expect(inserts).toHaveLength(0)
    expect((await t.status()).state).toBe('checkout')
    expect(t.r2.json(`public-books/${BOOK}/meta.json`).book.editions.map((e: { key: string }) => e.key)).toEqual(['original-en'])
    expect((await deliver('checkout.session.async_payment_succeeded', sessionObject('cs_test_1', 'paid'), modernHooks(t))).status).toBe(200)
    expect((await t.status()).state).toBe('paid')
    expect(inserts).toEqual([expect.objectContaining({ stripe_session_id: 'cs_test_1', amount_cents: 499, type: 'modern_edition', status: 'completed' })])
    expect(t.r2.json(`public-books/${BOOK}/meta.json`).book.editions.map((e: { key: string }) => e.key)).toEqual(['original-en', 'modern-en'])
  })

  it('a failed delayed payment grants nothing and frees the book', async () => {
    const t = setup()
    const inserts = paymentsStub()
    await t.buy('a')
    await deliver('checkout.session.completed', sessionObject('cs_test_1', 'unpaid'), modernHooks(t))
    expect((await deliver('checkout.session.async_payment_failed', sessionObject('cs_test_1', 'unpaid'), modernHooks(t))).status).toBe(200)
    expect(inserts).toHaveLength(0)
    expect(await t.status()).toMatchObject({ state: 'none', offer: { tier: 2, cents: 499 } })
  })

  it('an expired checkout frees the book at once, not after the 35-minute hold', async () => {
    const t = setup()
    paymentsStub()
    await t.buy('a')
    expect((await t.buy('b')).status).toBe(409)
    expect((await deliver('checkout.session.expired', sessionObject('cs_test_1', 'unpaid'), modernHooks(t))).status).toBe(200)
    expect((await t.buy('b')).status).toBe(200)
    // Other products' expired sessions are left alone, and an unwired release fails so Stripe retries.
    expect((await deliver('checkout.session.expired', { id: 'cs_pack', metadata: { type: 'chat_pack' } }, {})).status).toBe(200)
    expect((await deliver('checkout.session.expired', sessionObject('cs_test_2', 'unpaid'), {})).status).toBe(503)
  })

  it('fails (so Stripe retries) when the grant is not wired', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({})))
    const env = { STRIPE_WEBHOOK_SECRET: 'whsec_1', SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'srk' }
    const payload = JSON.stringify({ type: 'checkout.session.completed', data: { object: { id: 'cs_x', payment_status: 'paid', metadata: { type: 'modern_edition', book_id: BOOK, supabase_user_id: USER } } } })
    const response = await handleWebhook(new Request('https://tinct.app/api/webhook', { method: 'POST', body: payload, headers: { 'stripe-signature': await sign(payload) } }), env)
    expect(response.status).toBe(503)
  })
})

describe('job ordering', () => {
  const job = () => paidJob({ bookId: BOOK, tier: 2, sessionId: 'cs', chapters: [1, 2, 3, 4, 5, 6, 7], anchor: 3, now: 0 })

  it('writes the reader’s chapter and the next two first, then on from there, then the start', () => {
    const j = job()
    expect(j.priority).toEqual([3, 4, 5])
    expect(workOrder(j)).toEqual([3, 4, 5, 6, 7, 1, 2])
    expect(nextChapter(j, 0)).toBe(3)
  })

  it('puts a chapter the reader jumps to (and the one after it) at the front of the queue', () => {
    const j = prioritise(job(), 1)
    expect(workOrder(j)).toEqual([1, 2, 3, 4, 5, 6, 7])
    expect(nextChapter(j, 0)).toBe(1)
    const k = prioritise(j, 7)
    expect(workOrder(k).slice(0, 3)).toEqual([7, 1, 2])
  })

  it('ignores a jump to a finished chapter', () => {
    const j = job()
    const done = { ...j, chapters: j.chapters.map(c => c.number === 6 ? { ...c, state: 'ready' as const } : c) }
    expect(prioritise(done, 6)).toBe(done)
  })

  it('claims at most MAX_PARALLEL chapters at once and takes back a lapsed claim', () => {
    const j = job()
    const busy = { ...j, chapters: j.chapters.map(c => c.number === 3 || c.number === 4 ? { ...c, state: 'preparing' as const, leaseUntil: 1000 } : c) }
    expect(MAX_PARALLEL).toBe(2)
    expect(nextChapter(busy, 0)).toBeNull()
    expect(nextChapter(busy, 1000)).toBe(3)
    expect(publicChapterStates(busy, 0)).toMatchObject({ 3: 'preparing', 4: 'preparing', 5: 'queued', 1: 'queued' })
  })

  it('a reader’s jump is honoured by the running job', async () => {
    const t = setup()
    await t.grant('cs_a')
    const response = await t.call(`/api/public-books/${BOOK}/modern-en/priority`, { json: { chapter: 5 } })
    expect(response.status).toBe(200)
    expect((await readJob(t.r2.bucket, BOOK))!.job.priority.slice(0, 1)).toEqual([5])
  })
})

describe('generation', () => {
  it('writes every chapter, resumably, and serves finished chapters in place of the original', async () => {
    const t = setup()
    // Granted without the request's own burst of work: these steps are the only runner, so
    // which step finishes the book is not a race with a background runner (see the next test).
    await grantQuiet(t)
    const source = async () => SOURCE
    const step = () => modernStep(t.r2.bucket, { bookId: BOOK, title: 'T', author: 'A', source, generate: t.generator, now: () => t.clock.t })
    expect(await step()).toBe('chapter-ready')
    // Chapter 3 first (the buyer's chapter); the edition shows it modern and the rest original.
    const partial = await (await handlePublicEditionData(new Request(`https://tinct.app/data/editions/${BOOK}-modern-en.json`), t.env))!.json() as { chapters: Array<{ paragraphs: string[] }>; modern: { complete: boolean; chapters: Record<string, string> } }
    expect(partial.chapters[2].paragraphs[0]).toMatch(/^\[m\] /)
    expect(partial.chapters[0].paragraphs[0]).toBe(SOURCE[0].paragraphs[0])
    expect(partial.chapters[0].paragraphs).toHaveLength(3)
    expect(partial.modern).toMatchObject({ complete: false, chapters: { 3: 'ready', 1: 'queued' } })
    let result = ''
    for (let i = 0; i < 10 && result !== 'complete'; i++) result = await step()
    expect(result).toBe('complete')
    expect(await step()).toBe('idle')
    expect((await t.status()).state).toBe('complete')
    const whole = await (await handlePublicEditionData(new Request(`https://tinct.app/data/editions/${BOOK}-modern-en.json`), t.env))!.json() as { chapters: Array<{ paragraphs: string[] }>; modern?: unknown }
    expect(whole.modern).toBeUndefined()
    expect(whole.chapters.every(c => c.paragraphs.every(p => p.startsWith('[m] ')))).toBe(true)
    expect(t.r2.objects.has(`public-books/modern-jobs/${BOOK}`)).toBe(false)
    // Each chapter was asked for exactly once: nothing generated twice.
    expect(t.calls).toHaveLength(5)
  })

  it('the grant’s own burst and another runner at the same time write each chapter once and finish the book', async () => {
    const t = setup()
    // The grant starts a runner after its response (waitUntil); a second one (a status request, the cron) steps alongside.
    await t.grant('cs_a')
    expect(t.waits).toHaveLength(1)
    const step = () => modernStep(t.r2.bucket, { bookId: BOOK, title: 'T', author: 'A', source: async () => SOURCE, generate: t.generator, now: () => t.clock.t })
    const results: string[] = []
    const alongside = (async () => { for (let i = 0; i < 10 && results.at(-1) !== 'complete'; i++) results.push(await step()) })()
    await Promise.all([...t.waits, alongside])
    // Either runner may finish the book; while the other holds both chapters in hand, a step is 'idle'.
    expect((await t.status()).state).toBe('complete')
    expect(t.calls).toHaveLength(5)
    const whole = await (await handlePublicEditionData(new Request(`https://tinct.app/data/editions/${BOOK}-modern-en.json`), t.env))!.json() as { chapters: Array<{ paragraphs: string[] }> }
    expect(whole.chapters.every(c => c.paragraphs.every(p => p.startsWith('[m] ')))).toBe(true)
    const job = (await readJob(t.r2.bucket, BOOK))!.job
    expect(job.chapters.every(c => c.state === 'ready' && c.leaseBy === undefined)).toBe(true)
  })

  it('rejects output that drops, merges or truncates paragraphs', () => {
    const src = ['one two three four five six seven eight nine ten eleven twelve thirteen', 'b']
    expect(validChunk(src, ['x'])).toBeNull()
    expect(validChunk(src, ['one two', 'b'])).toBeNull()
    expect(validChunk(src, [src[0], ''])).toBeNull()
    expect(validChunk(src, [src[0], 'B <i>'])).toEqual([src[0], 'B i'])
  })

  it('retries a failed chapter and leaves it in the original text after MAX_ATTEMPTS', async () => {
    const t = setup({ generator: async () => ['too short'] })
    await t.grant('cs_a')
    const step = () => modernStep(t.r2.bucket, { bookId: BOOK, title: 'T', author: 'A', source: async () => SOURCE, generate: t.generator, now: () => t.clock.t })
    for (let i = 0; i < MAX_ATTEMPTS; i++) expect(await step()).toBe('failed')
    const job = (await readJob(t.r2.bucket, BOOK))!.job
    expect(job.chapters.find(c => c.number === 3)).toMatchObject({ state: 'failed', attempts: MAX_ATTEMPTS })
    expect(publicChapterStates(job, t.clock.t)[3]).toBeUndefined()
  })

  it('the cron does nothing while the switch is off', async () => {
    const t = setup({ switchOn: false })
    await t.grant('cs_a')
    const generator = vi.fn(modernise)
    expect(await runModernEditionJobs(t.env, { budgetMs: 1000, generator, now: () => t.clock.t })).toBe(0)
    expect(generator).not.toHaveBeenCalled()
    expect((await t.call(`/api/public-books/${BOOK}/modern-en/priority`, { json: { chapter: 1 } })).status).toBe(404)
  })

  it('the cron finishes a paid edition while the switch is on', async () => {
    const t = setup()
    // Granted without a request's own burst of work (no generator, no xAI key): the cron does it all.
    await grantModernEdition(t.env, { id: 'cs_a', metadata: { type: 'modern_edition', book_id: BOOK, chapter: '1' } }, { now: () => t.clock.t })
    expect(t.r2.objects.has(`public-books/modern-jobs/${BOOK}`)).toBe(true)
    t.clock.t += LEASE_MS + 1
    const ticking = { t: t.clock.t }
    const now = () => ticking.t++
    expect(await runModernEditionJobs(t.env, { budgetMs: 10_000, generator: modernise, now })).toBe(1)
    expect((await t.status()).state).toBe('complete')
  })
})

// ===== Long chapters (Gorgias: two chapters, one of them about 36,000 words) =====

/** Chapter 3 made long: 60 paragraphs of 100 words. */
const LONG = Array.from({ length: 60 }, (_, i) => `P${i} ${'word '.repeat(99).trim()}`)
const longSource = () => SOURCE.map(c => c.number === 3 ? { ...c, paragraphs: LONG } : c)
const wordsIn = (paragraphs: string[]) => paragraphs.join(' ').split(/\s+/).filter(Boolean).length

function useLong(t: ReturnType<typeof setup>) {
  void t.r2.bucket.put(`public-books/${BOOK}/original-en.json`, JSON.stringify({ chapters: longSource() }))
}
/** Granted with no request burst of its own (no generator in the grant), so each test drives the work. */
const grantQuiet = (t: ReturnType<typeof setup>, chapter = 3) => grantModernEdition(t.env, { id: 'cs_long', metadata: { type: 'modern_edition', book_id: BOOK, chapter: String(chapter) } }, { now: () => t.clock.t })
const stepOf = (t: ReturnType<typeof setup>, owner?: string, generate: ModernGenerator = t.generator) => modernStep(t.r2.bucket, { bookId: BOOK, title: 'T', author: 'A', source: async () => longSource(), generate, now: () => t.clock.t, owner })
/** Only chapter 3 left to write. */
const onlyChapterThree = (t: ReturnType<typeof setup>) => updateJob(t.r2.bucket, BOOK, job => job && { ...job, chapters: job.chapters.map(c => c.number === 3 ? c : { ...c, state: 'ready' as const }) })
const edition = async (t: ReturnType<typeof setup>) => (await (await handlePublicEditionData(new Request(`https://tinct.app/data/editions/${BOOK}-modern-en.json`), t.env))!.json()) as { chapters: Array<{ paragraphs: string[] }>; modern: { complete: boolean; chapters: Record<string, string>; written: Record<string, Array<[number, number]>> } }
type Progress = { chapters: Record<string, { done: number; total: number | null; ranges: Array<[number, number]>; startsIn: number | null; eta: number | null }>; wordsPerMinute: number | null }
const progressOf = async (t: ReturnType<typeof setup>) => ((await t.status()) as unknown as { progress: Progress }).progress

describe('long chapters', () => {
  it('chunks: the opening is short, then CHUNK_WORDS, from the focus to the end and then from the start', () => {
    const slots: Array<string | null> = LONG.map(() => null)
    expect(chunkStart(60, slots)).toBe(0)
    const opening = nextChunk(LONG, 0, slots)
    expect(wordsIn(opening)).toBeLessThanOrEqual(OPENING_WORDS)
    opening.forEach((_, i) => { slots[i] = 'm' })
    const next = nextChunk(LONG, opening.length, slots)
    expect(wordsIn(next)).toBeLessThanOrEqual(CHUNK_WORDS)
    expect(next.length).toBeGreaterThan(opening.length)
    // A reader waiting at paragraph 40: written from there (a short chunk again), stopping before written text.
    expect(chunkStart(60, slots, 40)).toBe(40)
    expect(wordsIn(nextChunk(LONG, 40, slots))).toBeLessThanOrEqual(OPENING_WORDS)
    for (let i = 40; i < 60; i++) slots[i] = 'm'
    expect(chunkStart(60, slots, 40)).toBe(opening.length)
    expect(nextChunk(LONG, 38, slots)).toEqual([LONG[38], LONG[39]])
    expect(writtenRanges(slots)).toEqual([[0, opening.length], [40, 60]])
  })

  it('one runner writes a long chapter chunk after chunk without waiting for its own lease, each paragraph once', async () => {
    const t = setup()
    useLong(t)
    await grantQuiet(t)
    const results: string[] = []
    for (let i = 0; i < 20 && results.at(-1) !== 'chapter-ready'; i++) results.push(await stepOf(t, 'runner-a'))
    // The clock never moved: before the fix the second step was 'idle' until the lease lapsed (3 minutes).
    expect(results.at(-1)).toBe('chapter-ready')
    expect(results).not.toContain('idle')
    expect(t.calls.flat()).toEqual(LONG)
    expect(wordsIn(t.calls[0])).toBeLessThanOrEqual(OPENING_WORDS)
    for (const call of t.calls.slice(1)) expect(wordsIn(call)).toBeLessThanOrEqual(CHUNK_WORDS)
    const data = await edition(t)
    expect(data.chapters[2].paragraphs).toEqual(LONG.map(p => `[m] ${p}`))
    expect(data.modern.chapters[3]).toBe('ready')
    expect(t.r2.objects.has(`public-books/${BOOK}/modern-en/ch-3.part.json`)).toBe(false)
  })

  it('a runner that stops hands its chapter back, and the next runner goes on at once from the saved chunks', async () => {
    const clock = { t: Date.UTC(2026, 9, 8) }
    const sent: string[][] = []
    const generator: ModernGenerator = async input => { clock.t += 4000; sent.push(input.paragraphs); return modernise(input) }
    const t = setup({ now: clock, generator, switchOn: false })
    useLong(t)
    await grantQuiet(t)
    await onlyChapterThree(t)
    const deadline = clock.t + 10_000
    await runModernBook(t.env, BOOK, { deadline, generate: generator, now: () => clock.t })
    // 4 s a chunk: the third would end past the deadline, so it is never started (it would be cut off and lost).
    expect(sent).toHaveLength(2)
    expect(clock.t).toBeLessThanOrEqual(deadline)
    const job = (await readJob(t.r2.bucket, BOOK))!.job.chapters.find(c => c.number === 3)!
    expect(job.state).toBe('queued')
    expect(job.leaseBy).toBeUndefined()
    expect(job.ranges).toEqual([[0, sent.flat().length]])
    expect((await t.status()).chapters[3]).toBe('preparing')
    // A request a moment later (no lease to wait out) carries on where the last one stopped.
    await runModernBook(t.env, BOOK, { deadline: clock.t + 10_000, generate: generator, now: () => clock.t })
    expect(sent).toHaveLength(4)
    while ((await readJob(t.r2.bucket, BOOK))!.job.chapters.find(c => c.number === 3)!.state !== 'ready') {
      await runModernBook(t.env, BOOK, { deadline: clock.t + 10_000, generate: generator, now: () => clock.t })
    }
    expect(sent.flat()).toEqual(LONG)
  })

  it('a second runner on the same chapter (a lapsed lease) never doubles or drops a chunk', async () => {
    const t = setup()
    useLong(t)
    await grantQuiet(t)
    await onlyChapterThree(t)
    let open: () => void = () => {}
    const gate = new Promise<void>(resolve => { open = resolve })
    let first = true
    const slow: ModernGenerator = async input => { if (first) { first = false; await gate } return input.paragraphs.map(p => `[slow] ${p}`) }
    const stalled = stepOf(t, 'runner-a', slow)
    await new Promise(resolve => setTimeout(resolve, 0))
    t.clock.t += LEASE_MS + 1
    expect(await stepOf(t, 'runner-b')).toBe('progress')
    open()
    expect(await stalled).toBe('progress')
    let result = ''
    for (let i = 0; i < 20 && result !== 'complete'; i++) result = await stepOf(t, 'runner-b')
    expect(result).toBe('complete')
    // Runner A's late chunk was dropped: every paragraph is runner B's, in place, once.
    expect((await edition(t)).chapters[2].paragraphs).toEqual(LONG.map(p => `[m] ${p}`))
    expect(t.calls.flat()).toEqual(LONG)
  })

  it('a reader waiting mid-chapter is written first from there, and the edition says which paragraphs are Modern English', async () => {
    const t = setup()
    useLong(t)
    await grantQuiet(t)
    await onlyChapterThree(t)
    await updateJob(t.r2.bucket, BOOK, job => job && prioritise(job, 3, 30))
    expect(await stepOf(t, 'runner-a')).toBe('progress')
    expect(t.calls[0][0]).toBe(LONG[30])
    const end = 30 + t.calls[0].length
    const data = await edition(t)
    expect(data.modern.written[3]).toEqual([[30, end]])
    expect(data.chapters[2].paragraphs[30]).toBe(`[m] ${LONG[30]}`)
    expect(data.chapters[2].paragraphs[29]).toBe(LONG[29])
    expect(data.chapters[2].paragraphs[end]).toBe(LONG[end])
    expect(data.chapters[2].paragraphs).toHaveLength(60)
    const progress = await progressOf(t)
    expect(progress.chapters[3]).toMatchObject({ done: end - 30, total: 60, ranges: [[30, end]] })
    // On to the chapter's end, then from its start.
    let result = ''
    for (let i = 0; i < 20 && result !== 'complete'; i++) result = await stepOf(t, 'runner-a')
    expect(t.calls.flat()).toEqual([...LONG.slice(30), ...LONG.slice(0, 30)])
  })

  it('the priority request records where the reader is waiting', async () => {
    // The request's own burst of work never finishes here, so the record is read as the request left it.
    const t = setup({ generator: () => new Promise(() => {}) })
    useLong(t)
    await grantQuiet(t)
    const response = await t.call(`/api/public-books/${BOOK}/modern-en/priority`, { json: { chapter: 3, paragraph: 45 } })
    expect(response.status).toBe(200)
    const job = (await readJob(t.r2.bucket, BOOK))!.job
    expect(job.priority[0]).toBe(3)
    expect(job.chapters.find(c => c.number === 3)!.focus).toBe(45)
    // A bad paragraph is ignored, never stored.
    await t.call(`/api/public-books/${BOOK}/modern-en/priority`, { json: { chapter: 3, paragraph: -2 } })
    expect((await readJob(t.r2.bucket, BOOK))!.job.chapters.find(c => c.number === 3)!.focus).toBe(45)
  })

  it('a chunk that fails now and then does not fail a long chapter (failures count only in a row)', async () => {
    let n = 0
    const flaky: ModernGenerator = async input => (++n % 2 === 0 ? ['bad'] : modernise(input))
    const t = setup({ generator: flaky })
    useLong(t)
    await grantQuiet(t)
    await onlyChapterThree(t)
    let result = ''
    for (let i = 0; i < 40 && result !== 'complete'; i++) result = await stepOf(t, 'runner-a')
    expect(result).toBe('complete')
    expect(n).toBeGreaterThan(MAX_ATTEMPTS * 2)
  })

  it('a failed chapter is tried again later, a bounded number of times, and shows no state meanwhile', async () => {
    const t = setup({ generator: async () => ['too short'] })
    useLong(t)
    await grantQuiet(t)
    await onlyChapterThree(t)
    for (let i = 0; i < MAX_ATTEMPTS; i++) expect(await stepOf(t)).toBe('failed')
    let job = (await readJob(t.r2.bucket, BOOK))!.job
    expect(job.chapters.find(c => c.number === 3)).toMatchObject({ state: 'failed', rounds: 1, retryAt: t.clock.t + FAILED_RETRY_MS })
    expect(publicChapterStates(job, t.clock.t)[3]).toBeUndefined()
    expect(await stepOf(t)).toBe('idle')
    t.clock.t += FAILED_RETRY_MS
    expect(nextChapter(job, t.clock.t)).toBe(3)
    for (let round = 2; round <= MAX_ROUNDS; round++) {
      for (let i = 0; i < MAX_ATTEMPTS; i++) expect(await stepOf(t)).toBe('failed')
      t.clock.t += FAILED_RETRY_MS
    }
    job = (await readJob(t.r2.bucket, BOOK))!.job
    expect(job.chapters.find(c => c.number === 3)).toMatchObject({ state: 'failed', rounds: MAX_ROUNDS })
    expect(nextChapter(job, t.clock.t + FAILED_RETRY_MS)).toBeNull()
  })

  it('reports progress and an estimate from the pace so far, book-level only', async () => {
    const clock = { t: Date.UTC(2026, 9, 8) }
    // 100 words a second of model time.
    const timed: ModernGenerator = async input => { clock.t += wordsIn(input.paragraphs) * 10; return modernise(input) }
    const t = setup({ now: clock, generator: timed, switchOn: false })
    useLong(t)
    await grantQuiet(t)
    const before = await progressOf(t)
    expect(before.wordsPerMinute).toBeNull()
    expect(before.chapters[3]).toMatchObject({ done: 0, eta: null })
    await stepOf(t, 'runner-a')
    await stepOf(t, 'runner-a')
    const status = await t.status() as unknown as Record<string, unknown> & { progress: Progress }
    expect(Object.keys(status).sort()).toEqual(['chapters', 'offer', 'progress', 'state'])
    expect(status.progress.wordsPerMinute).toBe(6000)
    const three = status.progress.chapters[3]
    const written = three.ranges.reduce((sum, [a, b]) => sum + wordsIn(LONG.slice(a, b)), 0)
    expect(three).toMatchObject({ total: 60, startsIn: 0, eta: Math.round((6000 - written) / 100) })
    expect(status.progress.chapters[4].startsIn).toBe(0)
    // The short chapters share the second runner, one after another: chapter 2 comes last (4 x 25 words at 100 a second).
    expect(status.progress.chapters[2]).toMatchObject({ startsIn: 1, eta: 1 })
    expect(JSON.stringify(status)).not.toMatch(/runner|leaseBy|sessionId|cs_/)
  })

  it('an older part file (a written prefix) is picked up where it stopped', async () => {
    const t = setup()
    useLong(t)
    await grantQuiet(t)
    await onlyChapterThree(t)
    await t.r2.bucket.put(`public-books/${BOOK}/modern-en/ch-3.part.json`, JSON.stringify({ paragraphs: LONG.slice(0, 5).map(p => `[m] ${p}`) }))
    await updateJob(t.r2.bucket, BOOK, job => job && { ...job, chapters: job.chapters.map(c => c.number === 3 ? { ...c, state: 'preparing' as const, leaseUntil: t.clock.t - 1 } : c) })
    expect(await stepOf(t)).toBe('progress')
    expect(t.calls[0][0]).toBe(LONG[5])
    expect(wordsIn(t.calls[0])).toBeGreaterThan(OPENING_WORDS)
  })

  it('progress for a job not started yet takes the chapter sizes from the book', () => {
    const job = paidJob({ bookId: BOOK, tier: 1, sessionId: 'cs', chapters: [1, 2], anchor: 1, now: 0 })
    expect(publicProgress(job, { 1: 126, 2: 1119 })).toEqual({
      chapters: { 1: { done: 0, total: 126, ranges: [], startsIn: null, eta: null }, 2: { done: 0, total: 1119, ranges: [], startsIn: null, eta: null } },
      wordsPerMinute: null,
    })
  })
})
