/**
 * The OCR job coordinator (ownOcrCoordinator.ts) and its xAI vision client
 * (lib/ocrVision.ts). The provider is never called: the coordinator gets a fake
 * recognizer and the client a fake fetch. Ceilings run on real
 * NarrationCoordinator objects over in-memory SQLite.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
vi.mock('cloudflare:workers', () => ({
  DurableObject: class {
    ctx: any; env: any
    constructor(ctx: any, env: any) { this.ctx = ctx; this.env = env }
  },
}))
import { NarrationCoordinator } from './narrationCoordinator'
import { ABANDON_MS, BACKOFF_429_MS, BACKOFF_5XX_MS, MAX_ATTEMPTS, OwnOcrCoordinator, type OcrDeps } from './ownOcrCoordinator'
import { durableNamespace } from './fakeDurableStorage'
import { fakeUserBooksBucket } from './fakeUserBooksBucket'
import type { PremiumTier } from './lib/aiAllowance'
import { OCR_CALL_RESERVE_MICROS, ocrEditionKey, ocrImageKey, ocrJobKey, ocrPageKey, type OwnOcrEnv } from './lib/ownOcr'
import { OCR_DEFAULT_MODEL, OCR_MAX_REPLY_CHARS, OcrProviderError, xaiOcrRecognizer, type OcrRecognition, type OcrRecognizeInput } from './lib/ocrVision'

const USER = '11111111-1111-4111-8111-111111111111'
const HEX = 'ab'.repeat(12)
const OCT = Date.UTC(2026, 9, 9, 12)
const NOV = Date.UTC(2026, 10, 1)
const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 0xff, 0xd9])
/** 2,000 in + 500 out tokens = $0.00065 = 650 micro-dollars. */
const USAGE = { input: 2000, output: 500 }
const PAGE_MICROS = 650

const okReply = (n: number): OcrRecognition => ({ reply: { printed_page: String(n), blocks: [{ t: 'p', x: `Text of page ${n}.` }] }, usage: USAGE })

type Recognize = (input: OcrRecognizeInput) => Promise<OcrRecognition>

function world(options: { vars?: Partial<OwnOcrEnv>; tier?: PremiumTier | null; rate?: () => boolean } = {}) {
  let now = OCT
  let tier: PremiumTier | null = options.tier === undefined ? 'premium' : options.tier
  const calls: OcrRecognizeInput[] = []
  let recognize: Recognize = async input => okReply(input.page)
  const r2 = fakeUserBooksBucket()
  const spend = durableNamespace(state => new NarrationCoordinator(state, {}))
  const usage = { getByName: (name: string) => { expect(name).toBe('rl:ocr-xai'); return { hit: async () => (options.rate ? options.rate() : true) } } }
  const env = { USER_BOOKS: r2.bucket, NARRATION_COORDINATOR: spend.namespace, USAGE_COORDINATOR: usage, XAI_API_KEY: 'test-key', ...options.vars } as unknown as OwnOcrEnv
  class TestCoordinator extends OwnOcrCoordinator {
    protected deps(): OcrDeps {
      return {
        recognizer: async input => { calls.push(input); return recognize(input) },
        now: () => now,
        loadTier: async () => tier,
      }
    }
  }
  const ocr = durableNamespace(state => new TestCoordinator(state, env))
  const job = () => ocr.getByName('job') as OwnOcrCoordinator
  const fake = () => ocr.instances.get('job')!.fake
  const start = (pages: number, extra: Partial<Parameters<OwnOcrCoordinator['start']>[0]> = {}) =>
    job().start({ userId: USER, hex: HEX, pages, title: 'Scanned', author: 'Jo', tier: 'premium', ...extra })
  const upload = async (...ns: number[]) => {
    for (const n of ns) {
      await r2.bucket.put(ocrImageKey(USER, HEX, n), JPEG)
      expect(await job().pageUploaded(n)).toBe(true)
    }
  }
  /** As the runtime does, the alarm is cleared before its handler runs. */
  const run = async () => { await fake().storage.deleteAlarm(); await job().alarm() }
  const usageOf = (name: string) => (spend.getByName(name) as NarrationCoordinator).usage().reduce((sum, row) => sum + row.bytes, 0)
  return {
    r2, env, job, fake, start, upload, calls, usageOf, run,
    setNow: (at: number) => { now = at },
    setTier: (value: PremiumTier | null) => { tier = value },
    setRecognize: (fn: Recognize) => { recognize = fn },
  }
}

afterEach(() => { vi.restoreAllMocks() })

describe('OwnOcrCoordinator: a job from upload to Tinct text', () => {
  it('recognises each uploaded page, deletes its image, keeps its page file and assembles edition.json', async () => {
    const w = world()
    const started = await w.start(3)
    expect(started).toMatchObject({ state: 'uploading', pages: 3, uploaded: 0, done: 0, month: { used: 0, limit: 1500 } })
    expect(w.r2.objects.get(ocrJobKey(USER, HEX))?.customMetadata).toMatchObject({ pages: '3', state: 'running' })
    await w.upload(1, 2, 3)
    expect(w.fake().alarm()).not.toBeNull()
    await w.run()

    const status = await w.job().status()
    expect(status).toMatchObject({ state: 'done', pages: 3, done: 3, failed: 0, month: { used: 3, limit: 1500 } })
    for (const n of [1, 2, 3]) {
      expect(w.r2.objects.has(ocrImageKey(USER, HEX, n))).toBe(false)
      expect(w.r2.objects.has(ocrPageKey(USER, HEX, n))).toBe(true)
    }
    const edition = JSON.parse(new TextDecoder().decode(w.r2.objects.get(ocrEditionKey(USER, HEX))!.bytes))
    expect(edition).toMatchObject({ source: 'ocr', title: 'Scanned', author: 'Jo' })
    expect(edition.chapters[0].paragraphs).toEqual(['Text of page 1.', 'Text of page 2.', 'Text of page 3.'])
    expect(edition.chapters[0].pages).toEqual([1, 2, 3])
    expect(w.r2.objects.get(ocrJobKey(USER, HEX))?.customMetadata).toMatchObject({ state: 'done' })
    expect(w.fake().alarm()).toBeNull()
    // Each call reserved $0.0012 and was settled to what it cost.
    expect(OCR_CALL_RESERVE_MICROS).toBe(1200)
    expect(w.usageOf(`ocr-user:${USER}`)).toBe(3 * PAGE_MICROS)
    expect(w.usageOf('ocr-budget:2026-10')).toBe(3 * PAGE_MICROS)
    expect(w.usageOf(`ocr-pages:${USER}`)).toBe(3)
  })

  it('sends the previous page\'s last paragraph as context, JSON first', async () => {
    const w = world()
    await w.start(2)
    await w.upload(1)
    await w.run()
    await w.upload(2)
    await w.run()
    expect(w.calls.map(call => [call.page, call.format, call.context])).toEqual([[1, 'json', ''], [2, 'json', 'Text of page 1.']])
  })

  it('never sends or charges blank pages, and waits for missing ones', async () => {
    const w = world()
    await w.start(3, { blank: [2] })
    await w.upload(1)
    await w.run()
    expect(await w.job().status()).toMatchObject({ state: 'uploading', done: 1, blank: 1, uploaded: 1 })
    await w.upload(3)
    await w.run()
    expect(await w.job().status()).toMatchObject({ state: 'done', done: 2, blank: 1 })
    expect(w.calls.map(call => call.page)).toEqual([1, 3])
    expect(w.usageOf(`ocr-pages:${USER}`)).toBe(2)
    expect(await w.job().pageUploaded(2)).toBe(false)
  })

  it('lists the pages still to upload, so a device resumes where it stopped', async () => {
    const w = world()
    await w.start(5, { blank: [3] })
    expect(await w.job().status()).toMatchObject({ state: 'uploading', missing: [1, 2, 4, 5] })
    await w.upload(1, 4)
    expect(await w.job().status()).toMatchObject({ missing: [2, 5] })
    await w.upload(2, 5)
    await w.run()
    const done = await w.job().status()
    expect(done).toMatchObject({ state: 'done' })
    expect(done.missing).toBeUndefined()
  })

  it('takes blank pages the device finds after the start (never sent, never charged), and finishes', async () => {
    const w = world()
    await w.start(3)
    await w.upload(1)
    await w.run()
    // Found blank while uploading: told with the same start.
    expect(await w.start(3, { blank: [2] })).toMatchObject({ blank: 1, missing: [3] })
    // A page already uploaded is not made blank.
    expect(await w.start(3, { blank: [1] })).toMatchObject({ blank: 1, done: 1 })
    await w.upload(3)
    await w.run()
    expect(await w.job().status()).toMatchObject({ state: 'done', done: 2, blank: 1 })
    expect(w.calls.map(call => call.page)).toEqual([1, 3])
    expect(w.usageOf(`ocr-pages:${USER}`)).toBe(2)
  })

  it('finishes when the last missing pages turn out blank', async () => {
    const w = world()
    await w.start(2)
    await w.upload(1)
    await w.run()
    expect(await w.job().status()).toMatchObject({ state: 'uploading' })
    await w.start(2, { blank: [2] })
    await w.run()
    expect(await w.job().status()).toMatchObject({ state: 'done', done: 1, blank: 1 })
  })

  it('names the month of the account asking: its own pages, and the trial ceiling in the trial, with or without a job', async () => {
    const w = world()
    expect(await w.job().status({ userId: USER, tier: 'trial' })).toMatchObject({ state: 'none', month: { used: 0, limit: 300 } })
    await w.start(2)
    await w.upload(1, 2)
    await w.run()
    expect(await w.job().status({ userId: USER, tier: 'trial' })).toMatchObject({ state: 'done', month: { used: 2, limit: 300 } })
    expect(await w.job().status({ userId: USER, tier: 'premium' })).toMatchObject({ month: { used: 2, limit: 1500 } })
  })

  it('processes at most 24 pages a run, four at a time, and runs again a second later', async () => {
    const w = world()
    let inFlight = 0
    let most = 0
    w.setRecognize(async input => { inFlight++; most = Math.max(most, inFlight); await Promise.resolve(); inFlight--; return okReply(input.page) })
    await w.start(30)
    await w.upload(...Array.from({ length: 30 }, (_, i) => i + 1))
    await w.run()
    const first = await w.job().status()
    expect(first.done).toBeGreaterThan(0)
    expect(first.done).toBeLessThanOrEqual(24)
    expect(most).toBeLessThanOrEqual(4)
    expect(w.fake().alarm()).toBe(OCT + 1000)
    for (let i = 0; i < 5 && (await w.job().status()).state !== 'done'; i++) await w.run()
    expect(await w.job().status()).toMatchObject({ state: 'done', done: 30 })
  })
})

describe('OwnOcrCoordinator: ceilings', () => {
  it('pauses at the account page ceiling with the page given back, and resumes at the month boundary', async () => {
    const w = world({ vars: { OWN_PDF_OCR_MONTHLY_PAGES: '2' } })
    await w.start(3)
    await w.upload(1, 2, 3)
    await w.run()
    const paused = await w.job().status()
    expect(paused).toMatchObject({ state: 'paused', reason: 'account_pages', resumesAt: NOV, done: 2, month: { used: 2, limit: 2 } })
    expect(w.usageOf(`ocr-pages:${USER}`)).toBe(2)
    // No dollars are held for the page that was refused.
    expect(w.usageOf(`ocr-user:${USER}`)).toBe(2 * PAGE_MICROS)
    expect(w.fake().alarm()).toBe(NOV)
    // Still October: nothing happens.
    await w.run()
    expect((await w.job().status()).state).toBe('paused')
    w.setNow(NOV)
    await w.run()
    expect(await w.job().status()).toMatchObject({ state: 'done', done: 3, month: { used: 1, limit: 2 } })
  })

  it('caps a trial account at the trial pages', async () => {
    const w = world({ tier: 'trial', vars: { OWN_PDF_OCR_TRIAL_MONTHLY_PAGES: '1' } })
    await w.start(2, { tier: 'trial' })
    await w.upload(1, 2)
    await w.run()
    expect(await w.job().status()).toMatchObject({ state: 'paused', reason: 'account_pages', done: 1, month: { used: 1, limit: 1 } })
  })

  it('pauses at the account dollar ceiling, giving back the page count and the refused reservation', async () => {
    // $0.0013: the first call ($0.0012 reserved, $0.00065 spent) fits, the second reservation does not.
    const w = world({ vars: { OWN_PDF_OCR_MONTHLY_USD: '0.0013' } })
    await w.start(2)
    await w.upload(1)
    await w.run()
    await w.upload(2)
    await w.run()
    expect(await w.job().status()).toMatchObject({ state: 'paused', reason: 'account_usd', resumesAt: NOV, done: 1 })
    expect(w.usageOf(`ocr-pages:${USER}`)).toBe(1)
    expect(w.usageOf(`ocr-user:${USER}`)).toBe(PAGE_MICROS)
    expect(w.usageOf('ocr-budget:2026-10')).toBe(PAGE_MICROS)
    expect(w.calls).toHaveLength(1)
  })

  it('pauses at the global dollar ceiling and gives the account its share back', async () => {
    const w = world({ vars: { OWN_PDF_OCR_GLOBAL_MONTHLY_USD: '0.0013' } })
    await w.start(2)
    await w.upload(1)
    await w.run()
    await w.upload(2)
    await w.run()
    expect(await w.job().status()).toMatchObject({ state: 'paused', reason: 'global_usd', done: 1 })
    expect(w.usageOf(`ocr-user:${USER}`)).toBe(PAGE_MICROS)
    expect(w.usageOf('ocr-budget:2026-10')).toBe(PAGE_MICROS)
    expect(w.usageOf(`ocr-pages:${USER}`)).toBe(1)
    w.setNow(NOV)
    await w.run()
    expect((await w.job().status()).state).toBe('done')
    // The new month's pool is its own object.
    expect(w.usageOf('ocr-budget:2026-11')).toBe(PAGE_MICROS)
  })

  it('adds what a call cost beyond its reservation', async () => {
    const w = world()
    w.setRecognize(async input => ({ ...okReply(input.page), usage: { input: 10_000, output: 2_000 } }))
    await w.start(1)
    await w.upload(1)
    await w.run()
    // 10,000 x $0.20 + 2,000 x $0.50 per MTok = $0.003.
    expect(w.usageOf(`ocr-user:${USER}`)).toBe(3000)
    expect(w.usageOf('ocr-budget:2026-10')).toBe(3000)
  })

  it('pauses when Premium has lapsed, and goes on when the owner starts it again with Premium', async () => {
    const w = world()
    await w.start(1)
    await w.upload(1)
    w.setTier('none')
    w.setNow(OCT + 11 * 60_000)
    await w.run()
    expect(await w.job().status()).toMatchObject({ state: 'paused', reason: 'premium_required' })
    expect(w.calls).toHaveLength(0)
    w.setTier('premium')
    await w.start(1)
    await w.run()
    expect((await w.job().status()).state).toBe('done')
  })
})

describe('OwnOcrCoordinator: retries, backoff and stopping', () => {
  it('backs off 30 s after a 429 (or its Retry-After) and 15 s after a 5xx, without counting a failed try or holding dollars', async () => {
    const w = world()
    w.setRecognize(async () => { throw new OcrProviderError('provider_429') })
    await w.start(1)
    await w.upload(1)
    await w.run()
    expect(await w.job().status()).toMatchObject({ state: 'running', done: 0, failed: 0 })
    expect(w.fake().alarm()).toBe(OCT + BACKOFF_429_MS)
    expect(w.usageOf(`ocr-user:${USER}`)).toBe(0)
    expect(w.usageOf('ocr-budget:2026-10')).toBe(0)
    // Before the backoff ends nothing is sent.
    await w.run()
    expect(w.calls).toHaveLength(1)

    w.setNow(OCT + BACKOFF_429_MS)
    w.setRecognize(async () => { throw new OcrProviderError('provider_5xx') })
    await w.run()
    expect(w.fake().alarm()).toBe(OCT + BACKOFF_429_MS + BACKOFF_5XX_MS)

    w.setNow(OCT + BACKOFF_429_MS + BACKOFF_5XX_MS)
    w.setRecognize(async () => { throw new OcrProviderError('provider_429', 90_000) })
    await w.run()
    expect(w.fake().alarm()).toBe(OCT + BACKOFF_429_MS + BACKOFF_5XX_MS + 90_000)

    w.setNow(OCT + BACKOFF_429_MS + BACKOFF_5XX_MS + 90_000)
    w.setRecognize(async input => okReply(input.page))
    await w.run()
    expect(await w.job().status()).toMatchObject({ state: 'done', done: 1, failed: 0 })
  })

  it('waits when the shared provider rate window is full', async () => {
    let open = false
    const w = world({ rate: () => open })
    await w.start(1)
    await w.upload(1)
    await w.run()
    expect(w.calls).toHaveLength(0)
    expect(w.fake().alarm()).toBe(OCT + 5000)
    open = true
    w.setNow(OCT + 5000)
    await w.run()
    expect((await w.job().status()).state).toBe('done')
  })

  it('asks once more in text mode when a reply is no page', async () => {
    const w = world()
    w.setRecognize(async input => input.format === 'json'
      ? { reply: null, invalid: 'parse', usage: USAGE }
      : { reply: { printed_page: null, blocks: [{ t: 'p', x: 'Recognised in text mode.' }] }, usage: USAGE })
    await w.start(1)
    await w.upload(1)
    await w.run()
    expect(w.calls.map(call => call.format)).toEqual(['json', 'text'])
    expect(await w.job().status()).toMatchObject({ state: 'done', done: 1 })
    expect(w.usageOf(`ocr-user:${USER}`)).toBe(2 * PAGE_MICROS)
    expect(w.usageOf(`ocr-pages:${USER}`)).toBe(1)
  })

  it(`gives a page up after ${MAX_ATTEMPTS} failed tries: a placeholder in the text, its page count given back`, async () => {
    const w = world()
    w.setRecognize(async input => input.page === 2 ? { reply: null, invalid: 'refusal', usage: USAGE } : okReply(input.page))
    await w.start(2)
    await w.upload(1, 2)
    for (let i = 0; i < MAX_ATTEMPTS; i++) { w.setNow(OCT + i * 2000); await w.run() }
    expect(await w.job().status()).toMatchObject({ state: 'done', done: 1, failed: 1 })
    expect(w.calls.filter(call => call.page === 2).map(call => call.format)).toEqual(['json', 'text', 'json', 'text', 'json', 'text'])
    expect(w.usageOf(`ocr-pages:${USER}`)).toBe(1)
    const edition = JSON.parse(new TextDecoder().decode(w.r2.objects.get(ocrEditionKey(USER, HEX))!.bytes))
    expect(edition.chapters[0].paragraphs).toEqual(['Text of page 1.', 'Page 2 could not be recognised. It is in Original pages.'])
    // Its image went with the finished job; a re-run asks the device for it again.
    expect(w.r2.objects.has(ocrImageKey(USER, HEX, 2))).toBe(false)
    expect(await w.start(2, { rerun: 'failed' })).toMatchObject({ state: 'uploading', failed: 0 })
    w.setRecognize(async input => okReply(input.page))
    await w.upload(2)
    await w.run()
    expect(await w.job().status()).toMatchObject({ state: 'done', done: 2, failed: 0 })
  })

  it('counts provider errors (not limits) as failed tries', async () => {
    const w = world()
    w.setRecognize(async () => { throw new OcrProviderError('provider_error') })
    await w.start(1)
    await w.upload(1)
    for (let i = 0; i < MAX_ATTEMPTS; i++) await w.run()
    expect(await w.job().status()).toMatchObject({ state: 'done', failed: 1 })
    expect(w.calls).toHaveLength(MAX_ATTEMPTS)
  })

  it('stops itself once job.json is gone: deletes everything it holds and gives back pages it counted', async () => {
    const w = world()
    w.setRecognize(async () => ({ reply: null, invalid: 'parse', usage: USAGE }))
    await w.start(2)
    await w.upload(1, 2)
    await w.run()
    expect(w.usageOf(`ocr-pages:${USER}`)).toBe(2)
    w.r2.objects.delete(ocrJobKey(USER, HEX))
    const sent = w.calls.length
    await w.run()
    expect(w.calls).toHaveLength(sent)
    expect(w.fake().alarm()).toBeNull()
    expect(await w.job().status()).toMatchObject({ state: 'none' })
    expect(w.usageOf(`ocr-pages:${USER}`)).toBe(0)
  })

  it('cancel gives back counted pages and forgets the job', async () => {
    const w = world()
    w.setRecognize(async () => ({ reply: null, invalid: 'parse', usage: USAGE }))
    await w.start(1)
    await w.upload(1)
    await w.run()
    expect(await w.job().cancel()).toEqual({ refunded: 1 })
    expect(w.usageOf(`ocr-pages:${USER}`)).toBe(0)
    expect((await w.job().status()).state).toBe('none')
    expect(w.fake().alarm()).toBeNull()
  })

  it('deletes the images of a job nobody touched for 14 days', async () => {
    const w = world()
    w.setTier('none')
    await w.start(3)
    await w.upload(1, 2)
    w.setNow(OCT + 11 * 60_000)
    await w.run()
    expect((await w.job().status()).reason).toBe('premium_required')
    expect(w.fake().alarm()).toBe(OCT + ABANDON_MS)
    w.setNow(OCT + ABANDON_MS)
    await w.run()
    expect(w.r2.objects.has(ocrImageKey(USER, HEX, 1))).toBe(false)
    expect(w.r2.objects.has(ocrImageKey(USER, HEX, 2))).toBe(false)
    expect(w.r2.objects.get(ocrJobKey(USER, HEX))?.customMetadata.state).toBe('abandoned')
    expect(await w.job().status()).toMatchObject({ state: 'paused', uploaded: 0 })
    expect(w.fake().alarm()).toBeNull()
  })

  it('re-runs every page on request', async () => {
    const w = world()
    await w.start(1)
    await w.upload(1)
    await w.run()
    expect(await w.start(1, { rerun: 'all' })).toMatchObject({ state: 'uploading', done: 0 })
    expect(w.r2.objects.has(ocrPageKey(USER, HEX, 1))).toBe(false)
    await w.upload(1)
    await w.run()
    expect((await w.job().status()).state).toBe('done')
    expect(w.usageOf(`ocr-pages:${USER}`)).toBe(2)
  })
})

describe('xaiOcrRecognizer', () => {
  const reply = (content: string, status = 200, headers: Record<string, string> = {}) =>
    new Response(JSON.stringify({ choices: [{ message: { content } }], usage: { prompt_tokens: 2100, completion_tokens: 300 } }), { status, headers })
  const failing = (status: number, headers: Record<string, string> = {}) => new Response('{}', { status, headers })

  it('posts one page image and the context to xAI chat completions in JSON mode', async () => {
    const fetchImpl = vi.fn(async () => reply(JSON.stringify({ printed_page: '7', columns: 1, starts_mid_paragraph: true, ends_mid_paragraph: false, blocks: [{ t: 'p', x: 'Hello.' }, { t: 'bogus', x: 'x' }, { t: 'num', x: '7' }] })))
    const recognize = xaiOcrRecognizer('key-1', { fetchImpl: fetchImpl as unknown as typeof fetch })
    const result = await recognize({ image: JPEG, page: 7, context: 'The end of page six.', format: 'json' })
    expect(result).toEqual({
      reply: { printed_page: '7', columns: 1, starts_mid_paragraph: true, ends_mid_paragraph: false, blocks: [{ t: 'p', x: 'Hello.' }, { t: 'num', x: '7' }] },
      usage: { input: 2100, output: 300 },
    })
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://api.x.ai/v1/chat/completions')
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer key-1')
    const body = JSON.parse(init.body as string)
    expect(body.model).toBe(OCR_DEFAULT_MODEL)
    expect(body.response_format).toEqual({ type: 'json_object' })
    expect(body.messages[1].content[0].image_url.url).toBe(`data:image/jpeg;base64,${btoa(String.fromCharCode(...JPEG))}`)
    expect(body.messages[1].content[1].text).toContain('The end of page six.')
  })

  it('uses OCR_MODEL when given, and text mode without JSON', async () => {
    const fetchImpl = vi.fn(async () => reply('# Chapter One\n\nFirst paragraph\ncontinues.\n\n[fn] 1 A note.'))
    const recognize = xaiOcrRecognizer('k', { fetchImpl: fetchImpl as unknown as typeof fetch, model: 'grok-other' })
    const result = await recognize({ image: JPEG, page: 1, context: '', format: 'text' })
    expect(result.reply?.blocks).toEqual([{ t: 'h1', x: 'Chapter One' }, { t: 'p', x: 'First paragraph\ncontinues.' }, { t: 'fn', x: '1 A note.' }])
    const body = JSON.parse((fetchImpl.mock.calls[0] as unknown as [string, RequestInit])[1].body as string)
    expect(body.model).toBe('grok-other')
    expect(body.response_format).toBeUndefined()
  })

  it('tells a bad reply (non-JSON, too long, a refusal) from provider trouble', async () => {
    const run = (response: Response, format: 'json' | 'text' = 'json') => xaiOcrRecognizer('k', { fetchImpl: (async () => response) as unknown as typeof fetch })({ image: JPEG, page: 1, context: '', format })
    expect(await run(reply('not json'))).toMatchObject({ reply: null, invalid: 'parse' })
    expect(await run(reply('x'.repeat(OCR_MAX_REPLY_CHARS + 1)), 'text')).toMatchObject({ reply: null, invalid: 'too_long' })
    expect(await run(reply("I'm sorry, I can't help with that."), 'text')).toMatchObject({ reply: null, invalid: 'refusal' })
    await expect(run(failing(429, { 'Retry-After': '12' }))).rejects.toMatchObject({ reason: 'provider_429', retryAfterMs: 12_000 })
    await expect(run(failing(503))).rejects.toMatchObject({ reason: 'provider_5xx' })
    await expect(run(failing(401))).rejects.toMatchObject({ reason: 'provider_error' })
  })
})
