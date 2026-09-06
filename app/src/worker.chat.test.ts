import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { COMPANION_MODEL } from './companionModel'
import { handleChat, handleLabChat, MAX_SYSTEM_PROMPT_LENGTH, MAX_TOOL_ROUNDS } from './worker/routes/chat'

const userId = '11111111-1111-4111-8111-111111111111'
const env = {
  ANTHROPIC_API_KEY: 'anthropic-key',
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'service-role',
}

function makeExecutionContext() {
  const pending: Promise<unknown>[] = []
  const waitUntil = vi.fn((promise: Promise<unknown>) => {
    pending.push(Promise.resolve(promise))
  })
  return {
    ctx: { waitUntil } as unknown as ExecutionContext,
    pending,
    waitUntil,
  }
}

function chatRequest(body: unknown, init: RequestInit = {}) {
  return new Request('https://tinct.app/api/chat', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json', ...(init.headers || {}) },
    ...init,
  })
}

describe('chat route', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-16T12:00:00Z'))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('rejects non-POST requests', async () => {
    const { ctx } = makeExecutionContext()
    const response = await handleChat(
      new Request('https://tinct.app/api/chat'),
      env,
      ctx,
      async () => ({ id: userId, email: 'reader@example.com' }),
      async () => true,
    )

    expect(response.status).toBe(405)
    expect(await response.json()).toEqual({ error: 'Method not allowed' })
  })

  it('requires auth before rate limiting or upstream calls', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const rateLimit = vi.fn(async () => true)
    const { ctx } = makeExecutionContext()

    const response = await handleChat(
      chatRequest({ messages: [] }),
      env,
      ctx,
      async () => null,
      rateLimit,
    )

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Authentication required' })
    expect(rateLimit).not.toHaveBeenCalled()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns 429 when the route-specific rate limit blocks', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('/rest/v1/profiles')) {
        return Response.json([{
          messages_used_this_period: 0,
          message_balance: 0,
          subscription_status: 'active',
          subscription_period_end: null,
          created_at: '2026-06-01T12:00:00Z',
        }])
      }
      return Response.json({ error: 'unexpected fetch' }, { status: 500 })
    })
    vi.stubGlobal('fetch', fetchMock)
    const { ctx } = makeExecutionContext()

    const response = await handleChat(
      chatRequest({ messages: [] }),
      env,
      ctx,
      async () => ({ id: userId, email: 'reader@example.com' }),
      async (key) => {
        expect(key).toBe(`chat:${userId}`)
        return false
      },
    )

    expect(response.status).toBe(429)
    expect(await response.json()).toEqual({ error: 'Rate limit exceeded. Try again in a minute.' })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('allows trial users and caps the Anthropic request payload', async () => {
    let anthropicBody: Record<string, unknown> | null = null
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      if (url.includes('/rest/v1/profiles')) {
        return Response.json([{
          messages_used_this_period: 0,
          message_balance: 0,
          subscription_status: null,
          subscription_period_end: null,
          created_at: '2026-06-01T12:00:00Z',
        }])
      }
      if (url === 'https://api.anthropic.com/v1/messages') {
        anthropicBody = JSON.parse(String(init?.body)) as Record<string, unknown>
        return Response.json({ content: [], usage: { input_tokens: 1, output_tokens: 1 } })
      }
      if (url.includes('/rest/v1/rpc/use_message')) {
        return Response.json({})
      }
      return Response.json({ error: 'unexpected fetch' }, { status: 500 })
    })
    vi.stubGlobal('fetch', fetchMock)
    const { ctx, pending, waitUntil } = makeExecutionContext()

    const response = await handleChat(
      chatRequest({
        max_tokens: 99_999,
        system: [{ type: 'text', text: 'reader context', cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: 'hello' }],
      }),
      env,
      ctx,
      async () => ({ id: userId, email: 'reader@example.com' }),
      async () => true,
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ content: [], usage: { input_tokens: 1, output_tokens: 1 } })
    expect(anthropicBody).toMatchObject({
      model: COMPANION_MODEL,
      max_tokens: 2048,
      system: [{ type: 'text', text: 'reader context', cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: 'hello' }],
    })
    expect(waitUntil).toHaveBeenCalledTimes(1)
    await Promise.all(pending)
    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.supabase.co/rest/v1/rpc/use_message',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('allows a lab guest companion without a session and does not charge', async () => {
    let anthropicBody: Record<string, unknown> | null = null
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      if (url === 'https://api.anthropic.com/v1/messages') {
        anthropicBody = JSON.parse(String(init?.body)) as Record<string, unknown>
        return Response.json({ content: [{ text: 'Paul wrote Romans.' }], usage: { input_tokens: 1, output_tokens: 1 } })
      }
      return Response.json({ error: 'unexpected fetch' }, { status: 500 })
    })
    vi.stubGlobal('fetch', fetchMock)
    const rateLimit = vi.fn(async (key: string) => {
      expect(key.startsWith('lab-chat:')).toBe(true)
      return true
    })
    const { ctx, waitUntil } = makeExecutionContext()

    const response = await handleLabChat(
      chatRequest({ messages: [{ role: 'user', content: 'Who wrote Romans?' }] }),
      { ANTHROPIC_API_KEY: 'anthropic-key' },
      ctx,
      rateLimit,
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      content: [{ text: 'Paul wrote Romans.' }],
      usage: { input_tokens: 1, output_tokens: 1 },
    })
    expect(anthropicBody).toMatchObject({
      model: COMPANION_MODEL,
      messages: [{ role: 'user', content: 'Who wrote Romans?' }],
    })
    expect(waitUntil).not.toHaveBeenCalled()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('streams lab-chat tokens as Anthropic emits them', async () => {
    const encoder = new TextEncoder()
    const sse = [
      'event: message_start\ndata: {"type":"message_start","message":{"usage":{}}}\n\n',
      'event: content_block_delta\ndata: {"type":"content_block_delta","delta":{"type":"text_delta","text":"Athena "}}\n\n',
      'event: content_block_delta\ndata: {"type":"content_block_delta","delta":{"type":"text_delta","text":"is beside him."}}\n\n',
      'event: message_stop\ndata: {"type":"message_stop"}\n\n',
    ]
    let pullCount = 0
    let anthropicBody: Record<string, unknown> | null = null
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      if (url === 'https://api.anthropic.com/v1/messages') {
        anthropicBody = JSON.parse(String(init?.body)) as Record<string, unknown>
        const stream = new ReadableStream<Uint8Array>({
          pull(controller) {
            if (pullCount >= sse.length) {
              controller.close()
              return
            }
            controller.enqueue(encoder.encode(sse[pullCount]))
            pullCount += 1
          },
        })
        return new Response(stream, {
          status: 200,
          headers: { 'content-type': 'text/event-stream; charset=utf-8' },
        })
      }
      return Response.json({ error: 'unexpected fetch' }, { status: 500 })
    })
    vi.stubGlobal('fetch', fetchMock)
    const { ctx, waitUntil } = makeExecutionContext()

    const response = await handleLabChat(
      chatRequest({
        stream: true,
        messages: [{ role: 'user', content: 'Who is Athena here?' }],
      }),
      { ANTHROPIC_API_KEY: 'anthropic-key' },
      ctx,
      async () => true,
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type') || '').toContain('event-stream')
    expect(anthropicBody).toMatchObject({
      model: COMPANION_MODEL,
      stream: true,
      messages: [{ role: 'user', content: 'Who is Athena here?' }],
    })
    const reader = response.body?.getReader()
    expect(reader).toBeTruthy()
    const first = await reader!.read()
    expect(first.done).toBe(false)
    expect(new TextDecoder().decode(first.value)).toContain('message_start')
    expect(pullCount).toBeLessThan(sse.length)
    const leftover: string[] = []
    while (true) {
      const next = await reader!.read()
      if (next.done) break
      leftover.push(new TextDecoder().decode(next.value))
    }
    expect(leftover.join('')).toContain('is beside him.')
    expect(waitUntil).not.toHaveBeenCalled()
  })

  it('rejects invalid system blocks before calling Anthropic', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('/rest/v1/profiles')) return Response.json(null)
      return Response.json({ error: 'unexpected fetch' }, { status: 500 })
    })
    vi.stubGlobal('fetch', fetchMock)
    const { ctx } = makeExecutionContext()

    const response = await handleChat(
      chatRequest({ system: [{ type: 'image', text: 'not allowed' }], messages: [] }),
      { ANTHROPIC_API_KEY: 'anthropic-key' },
      ctx,
      async () => ({ id: userId, email: 'reader@example.com' }),
      async () => true,
    )

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'Invalid system prompt block type' })
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

// ===== Book-grounded chat: reading trail + in-book retrieval tool loop =====

function bibleAssets(chapters: Record<number, { title: string; paragraphs: string[] }>, options: { total?: number } = {}) {
  const total = options.total ?? Math.max(...Object.keys(chapters).map(Number))
  const manifestChapters = Array.from({ length: total }, (_, index) => ({
    number: index + 1,
    title: chapters[index + 1]?.title ?? `Chapter ${index + 1}`,
    path: `ch${String(index + 1).padStart(4, '0')}.json`,
  }))
  const fetches: string[] = []
  const assets = {
    fetch: async (request: Request) => {
      const path = new URL(request.url).pathname
      fetches.push(path)
      if (path.endsWith('/manifest.json')) {
        return Response.json({ chapters: manifestChapters, sections: [{ title: 'Jeremiah', chapters: [777, 778, 779, 780, 781, 782] }] })
      }
      const match = path.match(/ch(\d{4})\.json$/)
      const number = match ? Number(match[1]) : NaN
      const chapter = chapters[number]
      if (!chapter) return new Response('not found', { status: 404 })
      return Response.json({ number, title: chapter.title, paragraphs: chapter.paragraphs })
    },
  }
  return { assets, fetches }
}

const JEREMIAH = {
  777: { title: 'Jeremiah 32', paragraphs: ['¹ The word that came to Jeremiah from the LORD in the tenth year of Zedekiah king of Judah.', '² For then the king of Babylon\'s army besieged Jerusalem: and Jeremiah the prophet was shut up in the court of the prison.'] },
  781: { title: 'Jeremiah 36', paragraphs: ['¹ And it came to pass in the fourth year of Jehoiakim.'] },
  782: { title: 'Jeremiah 37', paragraphs: ['¹ And king Zedekiah the son of Josiah reigned.', '²¹ Then Zedekiah the king commanded that they should commit Jeremiah into the court of the prison.'] },
}

function anthropicReply(content: unknown[], stopReason: string) {
  return Response.json({ id: 'msg', type: 'message', role: 'assistant', content, stop_reason: stopReason, usage: { input_tokens: 1, output_tokens: 1 } })
}

function sseResponse(chunks: string[]) {
  const encoder = new TextEncoder()
  let index = 0
  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (index >= chunks.length) {
        controller.close()
        return
      }
      controller.enqueue(encoder.encode(chunks[index]))
      index += 1
    },
  })
  return new Response(stream, { status: 200, headers: { 'content-type': 'text/event-stream; charset=utf-8' } })
}

function sse(type: string, data: Record<string, unknown>) {
  return `event: ${type}\ndata: ${JSON.stringify({ type, ...data })}\n\n`
}

async function readAll(response: Response): Promise<string> {
  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let text = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    text += decoder.decode(value, { stream: true })
  }
  return text
}

describe('book-grounded lab chat', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('executes read_chapter server-side and injects the chapter as a tool result', async () => {
    const { assets, fetches } = bibleAssets(JEREMIAH, { total: 1189 })
    const bodies: Array<Record<string, unknown>> = []
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input) !== 'https://api.anthropic.com/v1/messages') return Response.json({ error: 'unexpected fetch' }, { status: 500 })
      const body = JSON.parse(String(init?.body)) as Record<string, unknown>
      bodies.push(body)
      if (bodies.length === 1) {
        return anthropicReply([{ type: 'tool_use', id: 'toolu_1', name: 'read_chapter', input: { chapter: 'Jeremiah 32' } }], 'tool_use')
      }
      return anthropicReply([{ type: 'text', text: 'In chapter 32, Jeremiah was shut up in the court of the prison while Babylon besieged Jerusalem.' }], 'end_turn')
    })
    vi.stubGlobal('fetch', fetchMock)
    const { ctx, waitUntil } = makeExecutionContext()

    const response = await handleLabChat(
      chatRequest({
        system: 'You are the companion.',
        messages: [{ role: 'user', content: 'How did Jeremiah get out of prison?' }],
        book: { bookId: 'bible', editionKey: 'kjv-en', chapterNumber: 782 },
        readingTrail: [{ chapterNumber: 777, label: 'Jeremiah 32' }, { chapterNumber: 781, label: 'Jeremiah 36' }],
      }),
      { ANTHROPIC_API_KEY: 'anthropic-key', ASSETS: assets },
      ctx,
      async () => true,
    )

    expect(response.status).toBe(200)
    const data = await response.json() as { content: Array<{ type: string; text: string }>; stop_reason: string }
    expect(data.content).toEqual([{ type: 'text', text: 'In chapter 32, Jeremiah was shut up in the court of the prison while Babylon besieged Jerusalem.' }])
    expect(data.stop_reason).toBe('end_turn')
    expect(bodies).toHaveLength(2)
    const tools = (bodies[0].tools as Array<{ name: string }>).map(tool => tool.name)
    expect(tools).toEqual(['read_chapter', 'find_in_book'])
    expect(bodies[0].system).toEqual([{ type: 'text', text: 'You are the companion.', cache_control: { type: 'ephemeral' } }])
    const second = bodies[1].messages as Array<{ role: string; content: unknown }>
    expect(second).toHaveLength(3)
    expect(second[1]).toEqual({ role: 'assistant', content: [{ type: 'tool_use', id: 'toolu_1', name: 'read_chapter', input: { chapter: 'Jeremiah 32' } }] })
    const result = (second[2].content as Array<{ type: string; tool_use_id: string; content: string; is_error?: boolean }>)[0]
    expect(result.type).toBe('tool_result')
    expect(result.tool_use_id).toBe('toolu_1')
    expect(result.is_error).toBeUndefined()
    expect(result.content).toContain('Chapter 777 — Jeremiah 32')
    expect(result.content).toContain('[2] ² For then the king of Babylon')
    expect(fetches).toEqual(['/data/editions-chapters/bible-kjv-en/manifest.json', '/data/editions-chapters/bible-kjv-en/ch0777.json'])
    expect(waitUntil).not.toHaveBeenCalled()
  })

  it('answers directly with one call when the model does not use a tool', async () => {
    const { assets } = bibleAssets(JEREMIAH, { total: 1189 })
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      if (String(input) !== 'https://api.anthropic.com/v1/messages') return Response.json({ error: 'unexpected fetch' }, { status: 500 })
      return anthropicReply([{ type: 'text', text: 'Zedekiah is the king.' }], 'end_turn')
    })
    vi.stubGlobal('fetch', fetchMock)
    const { ctx } = makeExecutionContext()
    const response = await handleLabChat(
      chatRequest({ messages: [{ role: 'user', content: 'Who is the king?' }], book: { bookId: 'bible', editionKey: 'kjv-en', chapterNumber: 782 } }),
      { ANTHROPIC_API_KEY: 'anthropic-key', ASSETS: assets },
      ctx,
      async () => true,
    )
    expect(response.status).toBe(200)
    expect((await response.json() as { content: Array<{ text: string }> }).content[0].text).toBe('Zedekiah is the king.')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('rejects malformed tool input safely and lets the model answer', async () => {
    const { assets } = bibleAssets(JEREMIAH, { total: 1189 })
    const bodies: Array<Record<string, unknown>> = []
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input) !== 'https://api.anthropic.com/v1/messages') return Response.json({ error: 'unexpected fetch' }, { status: 500 })
      bodies.push(JSON.parse(String(init?.body)) as Record<string, unknown>)
      if (bodies.length === 1) {
        return anthropicReply([
          { type: 'tool_use', id: 'toolu_bad', name: 'read_chapter', input: { chapter: 'thirty-two' } },
          { type: 'tool_use', id: 'toolu_find', name: 'find_in_book', input: {} },
          { type: 'tool_use', id: 'toolu_far', name: 'read_chapter', input: { chapter: '99999' } },
        ], 'tool_use')
      }
      return anthropicReply([{ type: 'text', text: 'I could not check that chapter.' }], 'end_turn')
    }))
    const { ctx } = makeExecutionContext()
    const response = await handleLabChat(
      chatRequest({ messages: [{ role: 'user', content: 'Earlier?' }], book: { bookId: 'bible', editionKey: 'kjv-en', chapterNumber: 782 } }),
      { ANTHROPIC_API_KEY: 'anthropic-key', ASSETS: assets },
      ctx,
      async () => true,
    )
    expect(response.status).toBe(200)
    const results = ((bodies[1].messages as Array<{ content: unknown }>)[2].content) as Array<{ tool_use_id: string; is_error?: boolean; content: string }>
    expect(results.map(item => item.tool_use_id)).toEqual(['toolu_bad', 'toolu_find', 'toolu_far'])
    expect(results.every(item => item.is_error === true)).toBe(true)
    expect(results[0].content).toMatch(/No chapter titled "thirty-two"/)
    expect(results[1].content).toMatch(/find_in_book needs/)
    expect(results[2].content).toMatch(/positive integer|not in this edition/)
  })

  it('stops after MAX_TOOL_ROUNDS and forces a text answer', async () => {
    const { assets } = bibleAssets(JEREMIAH, { total: 1189 })
    const bodies: Array<Record<string, unknown>> = []
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input) !== 'https://api.anthropic.com/v1/messages') return Response.json({ error: 'unexpected fetch' }, { status: 500 })
      const body = JSON.parse(String(init?.body)) as Record<string, unknown>
      bodies.push(body)
      if (body.tool_choice) return anthropicReply([{ type: 'text', text: 'Final answer.' }], 'end_turn')
      return anthropicReply([{ type: 'tool_use', id: `toolu_${bodies.length}`, name: 'read_chapter', input: { chapter: '777' } }], 'tool_use')
    }))
    const { ctx } = makeExecutionContext()
    const response = await handleLabChat(
      chatRequest({ messages: [{ role: 'user', content: 'Keep looking.' }], book: { bookId: 'bible', editionKey: 'kjv-en', chapterNumber: 782 } }),
      { ANTHROPIC_API_KEY: 'anthropic-key', ASSETS: assets },
      ctx,
      async () => true,
    )
    expect(response.status).toBe(200)
    expect((await response.json() as { content: Array<{ text: string }> }).content[0].text).toBe('Final answer.')
    expect(bodies).toHaveLength(MAX_TOOL_ROUNDS + 1)
    expect(bodies.slice(0, MAX_TOOL_ROUNDS).every(body => body.tool_choice === undefined)).toBe(true)
    expect(bodies[MAX_TOOL_ROUNDS].tool_choice).toEqual({ type: 'none' })
  })

  it('streams only the final answer to the client and charges a signed-in reader once', async () => {
    const { assets } = bibleAssets(JEREMIAH, { total: 1189 })
    const bodies: Array<Record<string, unknown>> = []
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      if (url.includes('/rest/v1/profiles')) {
        return Response.json([{ messages_used_this_period: 0, message_balance: 0, subscription_status: 'active', subscription_period_end: null, created_at: '2026-06-01T12:00:00Z' }])
      }
      if (url.includes('/rest/v1/rpc/use_message')) return Response.json({})
      if (url !== 'https://api.anthropic.com/v1/messages') return Response.json({ error: 'unexpected fetch' }, { status: 500 })
      const body = JSON.parse(String(init?.body)) as Record<string, unknown>
      bodies.push(body)
      expect(body.stream).toBe(true)
      if (bodies.length === 1) {
        return sseResponse([
          sse('message_start', { message: { usage: { input_tokens: 5 } } }),
          sse('content_block_start', { index: 0, content_block: { type: 'tool_use', id: 'toolu_s', name: 'find_in_book', input: {} } }),
          sse('content_block_delta', { index: 0, delta: { type: 'input_json_delta', partial_json: '{"query": "court of' } }),
          sse('content_block_delta', { index: 0, delta: { type: 'input_json_delta', partial_json: ' the prison"}' } }),
          sse('content_block_stop', { index: 0 }),
          sse('message_delta', { delta: { stop_reason: 'tool_use' }, usage: { output_tokens: 3 } }),
          sse('message_stop', {}),
        ])
      }
      return sseResponse([
        sse('message_start', { message: { usage: { input_tokens: 7 } } }),
        sse('content_block_start', { index: 0, content_block: { type: 'text', text: '' } }),
        sse('content_block_delta', { index: 0, delta: { type: 'text_delta', text: 'In chapter 37, verse 21, ' } }),
        sse('content_block_delta', { index: 0, delta: { type: 'text_delta', text: 'Zedekiah moved him to the court of the prison.' } }),
        sse('content_block_stop', { index: 0 }),
        sse('message_delta', { delta: { stop_reason: 'end_turn' }, usage: { output_tokens: 9 } }),
        sse('message_stop', {}),
      ])
    })
    vi.stubGlobal('fetch', fetchMock)
    const { ctx, pending, waitUntil } = makeExecutionContext()

    const response = await handleChat(
      chatRequest({
        stream: true,
        messages: [{ role: 'user', content: 'Where was the court of the prison mentioned?' }],
        book: { bookId: 'bible', editionKey: 'kjv-en', chapterNumber: 782 },
      }),
      { ...env, ASSETS: assets },
      ctx,
      async () => ({ id: userId, email: 'reader@example.com' }),
      async () => true,
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type') || '').toContain('event-stream')
    const text = await readAll(response)
    await Promise.all(pending)
    expect(bodies).toHaveLength(2)
    const toolResult = ((bodies[1].messages as Array<{ content: unknown }>)[2].content) as Array<{ content: string; is_error?: boolean }>
    expect(toolResult[0].is_error).toBeUndefined()
    const found = JSON.parse(toolResult[0].content) as { query: string; matches: Array<{ chapterNumber: number; label: string }> }
    expect(found.query).toBe('court of the prison')
    expect(found.matches.map(match => match.chapterNumber)).toEqual([777, 782])
    expect((text.match(/^event: message_start$/gm) || []).length).toBe(1)
    expect((text.match(/^event: message_stop$/gm) || []).length).toBe(1)
    expect(text).not.toContain('tool_use')
    expect(text).not.toContain('input_json_delta')
    expect(text).toContain('Zedekiah moved him to the court of the prison.')
    expect(text).toContain('"stop_reason":"end_turn"')
    expect(waitUntil).toHaveBeenCalled()
    expect(fetchMock.mock.calls.filter(call => String(call[0]).includes('/rest/v1/rpc/use_message'))).toHaveLength(1)
  })

  it('keeps the plain path when no book is named and caps the system prompt with one', async () => {
    const { assets } = bibleAssets(JEREMIAH, { total: 1189 })
    const bodies: Array<Record<string, unknown>> = []
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input) !== 'https://api.anthropic.com/v1/messages') return Response.json({ error: 'unexpected fetch' }, { status: 500 })
      bodies.push(JSON.parse(String(init?.body)) as Record<string, unknown>)
      return anthropicReply([{ type: 'text', text: 'ok' }], 'end_turn')
    }))
    const { ctx } = makeExecutionContext()
    await handleLabChat(
      chatRequest({ messages: [{ role: 'user', content: 'hi' }], book: { bookId: 'Bad Id!', editionKey: 'kjv-en' } }),
      { ANTHROPIC_API_KEY: 'anthropic-key', ASSETS: assets },
      ctx,
      async () => true,
    )
    expect(bodies[0].tools).toBeUndefined()
    await handleLabChat(
      chatRequest({ system: 'x'.repeat(40_000), messages: [{ role: 'user', content: 'hi' }], book: { bookId: 'bible', editionKey: 'kjv-en' } }),
      { ANTHROPIC_API_KEY: 'anthropic-key', ASSETS: assets },
      ctx,
      async () => true,
    )
    const system = bodies[1].system as Array<{ text: string; cache_control: unknown }>
    expect(system[0].text).toHaveLength(MAX_SYSTEM_PROMPT_LENGTH)
    expect(system[0].cache_control).toEqual({ type: 'ephemeral' })
  })
})
