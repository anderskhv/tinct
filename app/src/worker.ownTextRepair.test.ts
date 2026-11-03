import { afterEach, describe, expect, it, vi } from 'vitest'
import { handleOwnTextRepair, parseOwnTextRepairRequest, type OwnTextRepairDeps, type OwnTextRepairEnv } from './worker/routes/ownTextRepair'
import { fakeUserBooksBucket } from './worker/fakeUserBooksBucket'
import { acceptedRepair, boundedEditDistance, suspectReason } from './ownTextRepair'
import { applyRepairs, flaggedParagraphs, repairOwnEdition } from './lab/userBook/ownTextRepair'
import type { UserBookEdition } from './lab/userBook/userEdition'
import { hyphenLangForEdition } from './lab/labHyphenate'

/**
 * Scanning-error repair for converted own PDFs (Anders, 2 Nov 2026: "J&sus").
 * The model is a stub: no request leaves the test.
 */
const A = '11111111-1111-4111-8111-111111111111'
const SHA = 'ab12cd34ef56ab12cd34ef56'.padEnd(64, '0')
const HEX = SHA.slice(0, 24)

afterEach(() => vi.unstubAllGlobals())

describe('which paragraphs are flagged', () => {
  it('flags words that cannot be right and leaves clean prose, numbers, URLs and abbreviations alone', () => {
    expect(suspectReason('He spoke of J&sus and the disciples.')).toBe('symbol')
    expect(suspectReason('The wor1d was quiet.')).toBe('digit')
    expect(suspectReason('I 1ike the idea.')).toBe('digit')
    expect(suspectReason('when we are not sure on.some of the details')).toBe('glued')
    expect(suspectReason('The story con- tinued for pages.')).toBe('hyphen')
    expect(suspectReason('A stray � mark.')).toBe('debris')
    for (const clean of [
      'In 1990s Denmark, the 4th edition sold 2,000 copies at 3pm.',
      'See www.example.com or e.g. the appendix, i.e. page 12.',
      'Both pre- and post-war editions agree.',
      'Matthew and Luke can both be right at the same time.',
      'It costs £5 and weighs 2kg.',
    ]) expect(suspectReason(clean), clean).toBeNull()
    expect(suspectReason('x'.repeat(1501) + ' J&sus')).toBeNull()
    expect(suspectReason('Figure ￼fig-1 shows J&sus')).toBeNull()
  })
})

describe('what a repair may change', () => {
  it('accepts small character fixes and refuses rewrites, changed numbers and lost figure marks', () => {
    expect(acceptedRepair('He spoke of J&sus and the disciples.', 'He spoke of Jesus and the disciples.')).toBe('He spoke of Jesus and the disciples.')
    expect(acceptedRepair('we are not sure on.some of the details', 'we are not sure on some of the details')).toBe('we are not sure on some of the details')
    expect(acceptedRepair('He spoke of J&sus and the disciples.', 'He spoke of J&sus and the disciples.')).toBeNull()
    expect(acceptedRepair('He spoke of J&sus and the disciples.', 'Jesus talked with his followers about many things.')).toBeNull()
    expect(acceptedRepair('In 1990 he spoke of J&sus.', 'In 1991 he spoke of Jesus.')).toBeNull()
    expect(acceptedRepair('He spoke of J&sus.', '')).toBeNull()
    expect(acceptedRepair('He spoke of J&sus.', 42)).toBeNull()
    expect(boundedEditDistance('kitten', 'sitting', 10)).toBe(3)
    expect(boundedEditDistance('a'.repeat(50), 'b'.repeat(50), 5)).toBe(6)
  })
})

describe('the device pass', () => {
  const edition = (paragraphs: string[][]): UserBookEdition => ({
    format: 1 as never, converter: 1, title: 'A Journalist', author: '', language: 'en', droppedImages: 0,
    chapters: paragraphs.map((list, i) => ({ number: i + 1, title: `Chapter ${i + 1}`, paragraphs: list })) as never,
  })
  const book = edition([['A clean opening paragraph.', 'He spoke of J&sus.'], ['Nothing wrong here.', 'not sure on.some of it']])

  it('sends only flagged paragraphs and applies only checked repairs', async () => {
    expect(flaggedParagraphs(book).map(item => item.id)).toEqual(['c0p1', 'c1p1'])
    const bodies: unknown[] = []
    const fetchImpl = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      bodies.push(JSON.parse(String(init?.body)))
      return Response.json({ items: [{ id: 'c0p1', text: 'He spoke of Jesus.' }, { id: 'c1p1', text: 'A complete rewrite that should never be accepted.' }] })
    }) as unknown as typeof fetch
    const result = await repairOwnEdition(book, { book: HEX, token: 't', fetchImpl })
    expect(bodies).toEqual([{ book: HEX, items: [{ id: 'c0p1', text: 'He spoke of J&sus.' }, { id: 'c1p1', text: 'not sure on.some of it' }] }])
    expect(result.repaired).toBe(1)
    expect(result.edition.chapters[0].paragraphs).toEqual(['A clean opening paragraph.', 'He spoke of Jesus.'])
    expect(result.edition.chapters[1].paragraphs).toEqual(['Nothing wrong here.', 'not sure on.some of it'])
    expect(book.chapters[0].paragraphs[1]).toBe('He spoke of J&sus.')
  })

  it('for a book already read, keeps only repairs that leave each paragraph\'s word count, and says when every batch was answered', async () => {
    const fetchImpl = vi.fn(async () => Response.json({ items: [{ id: 'c0p1', text: 'He spoke of Jesus.' }, { id: 'c1p1', text: 'not sure on some of it' }] })) as unknown as typeof fetch
    const result = await repairOwnEdition(book, { book: HEX, token: 't', fetchImpl, keepWordCount: true })
    expect(result.edition.chapters[0].paragraphs[1]).toBe('He spoke of Jesus.')
    expect(result.edition.chapters[1].paragraphs[1]).toBe('not sure on.some of it')
    expect(result.complete).toBe(true)
    const signedOut = await repairOwnEdition(book, { book: HEX, token: null })
    expect(signedOut.complete).toBe(false)
    expect((await repairOwnEdition(edition([['Clean text only.']]), { book: HEX, token: null })).complete).toBe(true)
  })

  it('keeps the text as converted when signed out, refused or offline', async () => {
    const never = vi.fn() as unknown as typeof fetch
    expect((await repairOwnEdition(book, { book: HEX, token: null, fetchImpl: never })).edition).toBe(book)
    expect(never).not.toHaveBeenCalled()
    const refused = vi.fn(async () => new Response('{}', { status: 503 })) as unknown as typeof fetch
    expect((await repairOwnEdition(book, { book: HEX, token: 't', fetchImpl: refused })).edition).toBe(book)
    const offline = vi.fn(async () => { throw new TypeError('Failed to fetch') }) as unknown as typeof fetch
    expect((await repairOwnEdition(book, { book: HEX, token: 't', fetchImpl: offline })).repaired).toBe(0)
    expect(applyRepairs(book, new Map())).toBe(book)
  })
})

describe('POST /api/own-text-repair', () => {
  function setup() {
    const userBooks = fakeUserBooksBucket()
    userBooks.objects.set(`u/${A}/${'a'.repeat(32)}`, {
      key: `u/${A}/${'a'.repeat(32)}`, bytes: new Uint8Array(100), uploaded: new Date('2026-10-01T00:00:00Z'),
      customMetadata: { name: 'Scan.pdf', title: 'Scan', author: '', type: 'pdf', sha256: SHA, createdAt: '2026-10-01T00:00:00.000Z' },
    })
    const env = { ANTHROPIC_API_KEY: 'k', SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 's', USER_BOOKS: userBooks.bucket } as unknown as OwnTextRepairEnv
    const ledger: Record<string, unknown>[] = []
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input).endsWith('/rest/v1/ai_usage_events')) { ledger.push(JSON.parse(String(init?.body))); return new Response(null, { status: 201 }) }
      throw new Error(`unexpected fetch ${String(input)}`)
    }))
    const calls: Record<string, unknown>[] = []
    const deps: OwnTextRepairDeps = {
      verifyUser: async (_env, request) => request.headers.get('authorization') === 'Bearer a' ? { id: A } : null,
      checkRateLimit: async () => true,
      reserveGuestSpend: vi.fn(async () => true),
      fetchAnthropic: vi.fn(async (payload: Record<string, unknown>) => {
        calls.push(payload)
        return Response.json({ content: [{ type: 'tool_use', name: 'repaired_paragraphs', input: { items: [
          { id: 'c0p1', text: 'He spoke of Jesus.' }, { id: 'c0p2', text: 'Something else entirely, rewritten by the model.' },
        ] } }], usage: { input_tokens: 300, output_tokens: 60 } })
      }),
    }
    const ctx = { waited: [] as Promise<unknown>[], waitUntil(p: Promise<unknown>) { this.waited.push(p) }, passThroughOnException() {} } as unknown as ExecutionContext & { waited: Promise<unknown>[] }
    return { env, deps, ctx, calls, ledger }
  }
  const post = (body: unknown, token = 'a') => new Request('https://tinct.app/api/own-text-repair', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body),
  })

  it('returns only accepted repairs for the owner and meters the call without the book', async () => {
    const w = setup()
    const response = await handleOwnTextRepair(post({ book: HEX, items: [{ id: 'c0p1', text: 'He spoke of J&sus.' }, { id: 'c0p2', text: 'The wor1d turned.' }] }), w.env, w.ctx, w.deps)
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ items: [{ id: 'c0p1', text: 'He spoke of Jesus.' }] })
    expect(w.calls[0]).toMatchObject({ tool_choice: { type: 'tool', name: 'repaired_paragraphs' } })
    await Promise.all(w.ctx.waited)
    expect(w.ledger[0]).toMatchObject({ feature: 'ocr', book_id: 'userbook' })
  })

  it('refuses strangers, other books, oversize batches and malformed bodies', async () => {
    const w = setup()
    expect((await handleOwnTextRepair(post({ book: HEX, items: [{ id: 'x', text: 'J&sus' }] }, 'nobody'), w.env, w.ctx, w.deps)).status).toBe(401)
    expect((await handleOwnTextRepair(post({ book: 'f'.repeat(24), items: [{ id: 'x', text: 'J&sus' }] }), w.env, w.ctx, w.deps)).status).toBe(404)
    expect(parseOwnTextRepairRequest({ book: HEX, items: Array.from({ length: 13 }, (_, i) => ({ id: `p${i}`, text: 'J&sus' })) })).toBeNull()
    expect(parseOwnTextRepairRequest({ book: HEX, items: [{ id: 'a', text: 'x' }, { id: 'a', text: 'y' }] })).toBeNull()
    expect(parseOwnTextRepairRequest({ book: HEX, items: [{ id: 'a', text: 'x'.repeat(1501) }] })).toBeNull()
    expect(w.calls).toHaveLength(0)
  })
})

describe('hyphenation language for a reader\'s own book', () => {
  it('uses the book\'s language when its edition key names none', () => {
    expect(hyphenLangForEdition('own')).toBeNull()
    expect(hyphenLangForEdition('own', 'en')).toBe('en')
    expect(hyphenLangForEdition('own', 'da-DK')).toBe('da')
    expect(hyphenLangForEdition('own', 'fr')).toBeNull()
    expect(hyphenLangForEdition('frankenstein-modern-en', 'da')).toBe('en')
  })
})
