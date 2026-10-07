// Paid Modern English editions of added public-domain books. No real model or
// Stripe call is made: the generator, Stripe and Supabase are all stand-ins.
import { afterEach, describe, expect, it, vi } from 'vitest'
import { handlePublicBooks, handlePublicEditionData, type PublicBooksDeps } from './worker/routes/publicBooks'
import { grantModernEdition, runModernEditionJobs, type ModernDeps } from './worker/routes/publicBookModern'
import { handleWebhook } from './worker/routes/billing'
import {
  HOLD_MS,
  LEASE_MS,
  MAX_ATTEMPTS,
  MAX_PARALLEL,
  MODERN_TIERS,
  modernStep,
  modernTierCents,
  modernTierFor,
  nextChapter,
  paidJob,
  prioritise,
  publicChapterStates,
  readJob,
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
  return { r2, env, deps, clock, stripe, call, status, buy, grant, calls, generator }
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

  it('is not offered for a reader’s private book (not an added public book)', async () => {
    const t = setup()
    const response = await t.call('/api/public-books/userbook-abc/modern-en')
    expect(response.status).toBe(404)
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
    const event = { type: 'checkout.session.completed', data: { object: { id: 'cs_paid', payment_intent: 'pi_1', metadata: { type: 'modern_edition', book_id: BOOK, tier: '2', chapter: '3', supabase_user_id: USER } } } }
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

  it('fails (so Stripe retries) when the grant is not wired', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({})))
    const env = { STRIPE_WEBHOOK_SECRET: 'whsec_1', SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'srk' }
    const payload = JSON.stringify({ type: 'checkout.session.completed', data: { object: { id: 'cs_x', metadata: { type: 'modern_edition', book_id: BOOK, supabase_user_id: USER } } } })
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
    await t.grant('cs_a')
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
