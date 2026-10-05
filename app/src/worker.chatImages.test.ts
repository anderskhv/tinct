import { afterEach, describe, expect, it, vi } from 'vitest'
import { handleChat, handleLabChat } from './worker/routes/chat'
import { estimateAiCostMicros } from './worker/lib/aiSpend'
import {
  IMAGE_TOKENS_CAP,
  MAX_IMAGE_BYTES,
  imageDimensions,
  imageTokenEstimate,
  parseUserBlocks,
  sniffImageType,
} from './worker/lib/chatImages'

const userId = '11111111-1111-4111-8111-111111111111'
const env = {
  ANTHROPIC_API_KEY: 'anthropic-key',
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'service-role',
}
const signedIn = async () => ({ id: userId, email: 'reader@example.com' })

function ctx() {
  const pending: Promise<unknown>[] = []
  return { ctx: { waitUntil: (p: Promise<unknown>) => { pending.push(Promise.resolve(p)) } } as unknown as ExecutionContext, pending }
}

const toBase64 = (bytes: Uint8Array) => Buffer.from(bytes).toString('base64')

/** A PNG header (signature + IHDR) of the given size, padded to `total` bytes. */
function png(width: number, height: number, total = 64): string {
  const bytes = new Uint8Array(total)
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52])
  new DataView(bytes.buffer).setUint32(16, width)
  new DataView(bytes.buffer).setUint32(20, height)
  return toBase64(bytes)
}

/** A JPEG with an APP0 segment, then SOF0 giving the size. */
function jpeg(width: number, height: number): string {
  const bytes = new Uint8Array(48)
  bytes.set([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00])
  bytes.set([0xff, 0xc0, 0x00, 0x11, 0x08, height >> 8, height & 0xff, width >> 8, width & 0xff, 0x03], 20)
  return toBase64(bytes)
}

function webpVp8x(width: number, height: number): string {
  const bytes = new Uint8Array(32)
  bytes.set([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50, 0x56, 0x50, 0x38, 0x58])
  const w = width - 1, h = height - 1
  bytes.set([w & 0xff, (w >> 8) & 0xff, (w >> 16) & 0xff, h & 0xff, (h >> 8) & 0xff, (h >> 16) & 0xff], 24)
  return toBase64(bytes)
}

const image = (data: string, mediaType = 'image/png') => ({ type: 'image', source: { type: 'base64', media_type: mediaType, data } })
const text = (value: string) => ({ type: 'text', text: value })

function companionBody(messages: unknown[]) {
  return {
    stream: false,
    messages,
    companion: { intent: 'ask', context: { bookTitle: 'Your book', bookAuthor: '', chapterLabel: 'Figure 2', paragraphs: ['Figure 2 shows the apparatus.'], lookups: false } },
  }
}

function post(body: unknown, path = '/api/chat') {
  return new Request(`https://tinct.app${path}`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  })
}

function mockUpstream() {
  const anthropicBodies: Array<Record<string, unknown>> = []
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    if (url.includes('/rest/v1/profiles')) {
      return Response.json([{ messages_used_this_period: 0, message_balance: 0, subscription_status: 'active', subscription_period_end: null, created_at: '2026-06-01T12:00:00Z' }])
    }
    if (url === 'https://api.anthropic.com/v1/messages') {
      anthropicBodies.push(JSON.parse(String(init?.body)) as Record<string, unknown>)
      return Response.json({ content: [{ type: 'text', text: 'The figure shows a pump.' }], usage: { input_tokens: 1400, output_tokens: 20 } })
    }
    if (url.includes('/rest/v1/')) return Response.json({})
    return Response.json({ error: 'unexpected fetch' }, { status: 500 })
  })
  vi.stubGlobal('fetch', fetchMock)
  return { fetchMock, anthropicBodies }
}

describe('chat images: header parsing and estimates', () => {
  it('reads PNG, JPEG and WebP sizes from their headers', () => {
    const bytes = (b64: string) => new Uint8Array(Buffer.from(b64, 'base64'))
    expect(sniffImageType(bytes(png(800, 600)))).toBe('image/png')
    expect(imageDimensions(bytes(png(800, 600)), 'image/png')).toEqual({ width: 800, height: 600 })
    expect(sniffImageType(bytes(jpeg(1024, 768)))).toBe('image/jpeg')
    expect(imageDimensions(bytes(jpeg(1024, 768)), 'image/jpeg')).toEqual({ width: 1024, height: 768 })
    expect(sniffImageType(bytes(webpVp8x(640, 480)))).toBe('image/webp')
    expect(imageDimensions(bytes(webpVp8x(640, 480)), 'image/webp')).toEqual({ width: 640, height: 480 })
  })

  it('estimates width × height / 750 tokens per image, capped, and the cap when the size is unknown', () => {
    expect(imageTokenEstimate({ width: 750, height: 100 })).toBe(100)
    expect(imageTokenEstimate({ width: 1568, height: 1568 })).toBe(IMAGE_TOKENS_CAP)
    expect(imageTokenEstimate(null)).toBe(IMAGE_TOKENS_CAP)
  })

  it('adds image tokens to the cost estimate', () => {
    const base = estimateAiCostMicros({ inputChars: 4_000, maxTokens: 100 })
    expect(estimateAiCostMicros({ inputChars: 4_000, maxTokens: 100, imageTokens: 1_600 })).toBe(base + 1_600 * 3)
    const parsed = parseUserBlocks([image(png(750, 200)), image(jpeg(1568, 1200), 'image/jpeg'), text('What is this?')], 10_000)
    expect(parsed).toMatchObject({ ok: true, imageCount: 2, imageTokens: 200 + IMAGE_TOKENS_CAP })
  })
})

describe('chat images: signed-in /api/chat', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('passes a valid image block to Anthropic unchanged and charges the reader', async () => {
    const { fetchMock, anthropicBodies } = mockUpstream()
    const { ctx: context, pending } = ctx()
    const blocks = [image(png(800, 600)), text('What does this figure show?')]
    const response = await handleChat(post(companionBody([
      { role: 'user', content: 'Earlier question' },
      { role: 'assistant', content: 'Earlier answer' },
      { role: 'user', content: blocks },
    ])), env, context, signedIn, async () => true)
    expect(response.status).toBe(200)
    expect(anthropicBodies).toHaveLength(1)
    const messages = anthropicBodies[0].messages as Array<{ role: string; content: unknown }>
    expect(messages[0]).toEqual({ role: 'user', content: 'Earlier question' })
    expect(messages[2]).toEqual({ role: 'user', content: blocks })
    await Promise.all(pending)
    expect(fetchMock.mock.calls.some(call => String(call[0]).includes('/rpc/use_message'))).toBe(true)
    // The usage ledger records the provider's input tokens, which include the picture.
    const ledger = fetchMock.mock.calls.find(call => String(call[0]).includes('/rest/v1/ai_usage_events'))
    expect(ledger).toBeTruthy()
    expect(JSON.parse(String((ledger![1] as RequestInit).body))).toMatchObject({ input_tokens: 1400 })
  })

  it('accepts a request above the text-only size cap when it carries pictures', async () => {
    const { anthropicBodies } = mockUpstream()
    const big = png(1568, 1200, 1_200_000)
    const response = await handleChat(post(companionBody([{ role: 'user', content: [image(big), text('Read the table.')] }])), env, ctx().ctx, signedIn, async () => true)
    expect(response.status).toBe(200)
    expect(anthropicBodies).toHaveLength(1)
  })

  it('still caps text-only requests at the normal size', async () => {
    const { anthropicBodies } = mockUpstream()
    const long = Array.from({ length: 60 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: 'x'.repeat(9_000) }))
    const response = await handleChat(post({ messages: long, system: 'y'.repeat(30_000) }), env, ctx().ctx, signedIn, async () => true)
    expect(response.status).toBe(413)
    expect(anthropicBodies).toHaveLength(0)
  })

  it('rejects more than four images', async () => {
    const { anthropicBodies } = mockUpstream()
    const content = [...Array.from({ length: 5 }, () => image(png(100, 100))), text('Compare these.')]
    const response = await handleChat(post(companionBody([{ role: 'user', content }])), env, ctx().ctx, signedIn, async () => true)
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'image_rejected' })
    expect(anthropicBodies).toHaveLength(0)
  })

  it('rejects an image over the decoded size limit', async () => {
    const { anthropicBodies } = mockUpstream()
    const oversized = png(4000, 4000, MAX_IMAGE_BYTES + 3)
    const response = await handleChat(post(companionBody([{ role: 'user', content: [image(oversized), text('Too big?')] }])), env, ctx().ctx, signedIn, async () => true)
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'image_rejected' })
    expect(anthropicBodies).toHaveLength(0)
  })

  it('rejects an unsupported media type, a mismatched header and malformed base64', async () => {
    mockUpstream()
    for (const bad of [
      image(png(10, 10), 'image/gif'),
      image(png(10, 10), 'image/jpeg'),
      image('not base64 at all!!', 'image/png'),
      { type: 'image', source: { type: 'url', url: 'https://example.com/a.png' } },
    ]) {
      const response = await handleChat(post(companionBody([{ role: 'user', content: [bad, text('What is it?')] }])), env, ctx().ctx, signedIn, async () => true)
      expect(response.status).toBe(400)
      expect(await response.json()).toEqual({ error: 'image_rejected' })
    }
  })

  it('rejects unknown blocks, extra fields and pictures in earlier turns', async () => {
    const { anthropicBodies } = mockUpstream()
    const cases = [
      [{ role: 'user', content: [{ type: 'document', source: {} }, text('Hi')] }],
      [{ role: 'user', content: [{ ...text('Hi'), cache_control: { type: 'ephemeral' } }] }],
      [{ role: 'user', content: [image(png(10, 10))] }],
      [{ role: 'user', content: [image(png(10, 10)), text('First')] }, { role: 'assistant', content: 'Answer' }, { role: 'user', content: 'Again' }],
    ]
    for (const messages of cases) {
      const response = await handleChat(post(companionBody(messages)), env, ctx().ctx, signedIn, async () => true)
      expect(response.status).toBe(400)
      expect(await response.json()).toEqual({ error: 'Invalid message content' })
    }
    expect(anthropicBodies).toHaveLength(0)
  })

  it('leaves string-only requests unchanged', async () => {
    const { anthropicBodies } = mockUpstream()
    const response = await handleChat(post(companionBody([{ role: 'user', content: 'What is the apparatus?' }])), env, ctx().ctx, signedIn, async () => true)
    expect(response.status).toBe(200)
    expect((anthropicBodies[0].messages as unknown[])).toEqual([{ role: 'user', content: 'What is the apparatus?' }])
  })
})

describe('chat images: guests', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('refuses pictures on /api/lab-chat with images_unavailable before reserving spend', async () => {
    const { anthropicBodies } = mockUpstream()
    const reserve = vi.fn(async () => true)
    const response = await handleLabChat(
      post(companionBody([{ role: 'user', content: [image(png(100, 100)), text('What is this?')] }]), '/api/lab-chat'),
      { ANTHROPIC_API_KEY: 'anthropic-key' }, ctx().ctx, async () => true, reserve,
    )
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'images_unavailable' })
    expect(reserve).not.toHaveBeenCalled()
    expect(anthropicBodies).toHaveLength(0)
  })
})
