import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  DICTATION_MAX_BYTES,
  DICTATION_NOT_CONFIGURED_ERROR,
  XAI_STT_MODEL,
  XAI_STT_URL,
  dictationLanguage,
  handleDictation,
  sanitizeKeyterms,
} from './worker/routes/dictation'
import { dictationCostUsd } from './worker/lib/aiUsage'

const userId = '11111111-1111-4111-8111-111111111111'
const env = { XAI_API_KEY: 'xai-test-key', SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'service-role' }
const signedIn = async () => ({ id: userId, email: 'reader@example.com' })
const allow = async () => true

function makeCtx() {
  const pending: Promise<unknown>[] = []
  return { ctx: { waitUntil: (promise: Promise<unknown>) => { pending.push(Promise.resolve(promise)) } } as unknown as ExecutionContext, pending }
}

function dictationRequest(fields: Record<string, string | Blob> = {}, init: { method?: string; headers?: Record<string, string> } = {}) {
  const form = new FormData()
  const all: Record<string, string | Blob> = { audio: new Blob([new Uint8Array(2000)], { type: 'audio/webm;codecs=opus' }), ...fields }
  for (const [key, value] of Object.entries(all)) {
    if (value instanceof Blob) form.append(key, value, 'clip')
    else form.append(key, value)
  }
  return new Request('https://tinct.app/api/dictation', { method: init.method ?? 'POST', body: init.method === 'GET' ? undefined : form, headers: init.headers })
}

function sttResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
}

describe('dictation route (xAI speech-to-text)', () => {
  afterEach(() => { vi.unstubAllGlobals() })

  it('rejects non-POST', async () => {
    const response = await handleDictation(new Request('https://tinct.app/api/dictation'), env, makeCtx().ctx, signedIn, allow)
    expect(response.status).toBe(405)
  })

  it('fails clearly without XAI_API_KEY and never calls out', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const response = await handleDictation(dictationRequest(), {}, makeCtx().ctx, signedIn, allow)
    expect(response.status).toBe(503)
    expect(await response.json()).toEqual({ error: DICTATION_NOT_CONFIGURED_ERROR })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('requires sign-in', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const response = await handleDictation(dictationRequest(), env, makeCtx().ctx, async () => null, allow)
    expect(response.status).toBe(401)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('rate limits per reader under its own key', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const limiter = vi.fn(async () => false)
    const response = await handleDictation(dictationRequest(), env, makeCtx().ctx, signedIn, limiter)
    expect(response.status).toBe(429)
    expect(limiter).toHaveBeenCalledWith(`dictation:${userId}`, undefined, expect.any(Number))
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('refuses missing, empty, oversized and unsupported audio without calling xAI', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const missing = new FormData()
    missing.append('language', 'en')
    const cases: [Request, number][] = [
      [new Request('https://tinct.app/api/dictation', { method: 'POST', body: missing }), 400],
      [dictationRequest({ audio: new Blob([], { type: 'audio/webm' }) }), 400],
      [dictationRequest({ audio: new Blob([new Uint8Array(DICTATION_MAX_BYTES + 1)], { type: 'audio/webm' }) }), 413],
      [dictationRequest({}, { headers: { 'content-length': String(DICTATION_MAX_BYTES * 2) } }), 413],
      [dictationRequest({ audio: new Blob([new Uint8Array(10)], { type: 'video/quicktime' }) }), 415],
    ]
    for (const [request, status] of cases) {
      const response = await handleDictation(request, env, makeCtx().ctx, signedIn, allow)
      expect(response.status).toBe(status)
    }
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('forwards the clip with language and capped keyterms, file last, and returns only the text', async () => {
    const calls: { url: string; init: RequestInit }[] = []
    vi.stubGlobal('fetch', vi.fn(async (url: string, init: RequestInit) => {
      calls.push({ url, init })
      if (url === XAI_STT_URL) return sttResponse({ text: ' Who was Zerubbabel? ', language: 'en', duration: 3.6, words: [] })
      return new Response(null, { status: 201 })
    }))
    const { ctx, pending } = makeCtx()
    const terms = ['Zerubbabel', 'Ezra', 'ezra', 'x'.repeat(51), ...Array.from({ length: 150 }, (_, i) => `Term${i}`)]
    const response = await handleDictation(dictationRequest({ keyterms: JSON.stringify(terms), language: 'en', bookId: 'bible' }), env, ctx, signedIn, allow)
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ text: 'Who was Zerubbabel?' })
    const stt = calls.find(call => call.url === XAI_STT_URL)!
    expect((stt.init.headers as Record<string, string>).Authorization).toBe('Bearer xai-test-key')
    const sent = stt.init.body as FormData
    expect(sent.get('model')).toBe(XAI_STT_MODEL)
    expect(sent.get('language')).toBe('en')
    const keyterms = sent.getAll('keyterm')
    expect(keyterms).toHaveLength(100)
    expect(keyterms.slice(0, 3)).toEqual(['Zerubbabel', 'Ezra', 'Term0'])
    expect([...sent.keys()].at(-1)).toBe('file')
    expect((sent.get('file') as File).name).toBe('dictation.webm')

    await Promise.all(pending)
    const ledger = calls.find(call => call.url.includes('ai_usage_events'))!
    const row = JSON.parse(String(ledger.init.body))
    expect(row).toMatchObject({ user_id: userId, feature: 'dictation', provider: 'xai', model: XAI_STT_MODEL, seconds: 3.6, book_id: 'bible', cost_usd: dictationCostUsd(3.6) })
    // Dictation never charges a message.
    expect(calls.some(call => call.url.includes('use_message'))).toBe(false)
  })

  it('maps provider credit or rate limits to the resting state and other failures to a calm error', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => sttResponse({ error: 'out of credit' }, 429)))
    const resting = await handleDictation(dictationRequest(), env, makeCtx().ctx, signedIn, allow)
    expect(resting.status).toBe(503)
    expect((await resting.json()).code).toBeTruthy()
    vi.stubGlobal('fetch', vi.fn(async () => sttResponse({ error: 'Unsupported audio' }, 400)))
    const failed = await handleDictation(dictationRequest(), env, makeCtx().ctx, signedIn, allow)
    expect(failed.status).toBe(502)
    expect(await failed.json()).toEqual({ error: 'Could not transcribe the recording.' })
  })
})

describe('dictation input helpers', () => {
  it('accepts only string arrays of short, distinct terms', () => {
    expect(sanitizeKeyterms('not json')).toEqual([])
    expect(sanitizeKeyterms('{"a":1}')).toEqual([])
    expect(sanitizeKeyterms(['  Mordecai ', 'MORDECAI', 7, '', 'Ahasuerus\nking'])).toEqual(['Mordecai', 'Ahasuerus king'])
  })

  it('defaults the language to English', () => {
    expect(dictationLanguage(undefined)).toBe('en')
    expect(dictationLanguage('da')).toBe('da')
    expect(dictationLanguage('en-GB')).toBe('en-GB')
    expect(dictationLanguage('en; drop')).toBe('en')
  })

  it('prices speech-to-text at $0.10 per hour', () => {
    expect(dictationCostUsd(3600)).toBe(0.1)
    expect(dictationCostUsd(-5)).toBe(0)
  })
})
