import { afterEach, describe, expect, it, vi } from 'vitest'
import { handleReportIssue } from './worker/routes/issueReports'

const env = {
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'service-role',
  ASSETS: { fetch: vi.fn() },
}

function supabaseJson(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function ctx() {
  const waits: Promise<unknown>[] = []
  return {
    waits,
    context: {
      waitUntil(promise: Promise<unknown>) {
        waits.push(promise)
      },
    } as unknown as ExecutionContext,
  }
}

describe('issue report route', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('rejects missing report context before inserting', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { context } = ctx()

    const response = await handleReportIssue(
      new Request('https://tinct.app/api/report-issue', {
        method: 'POST',
        body: JSON.stringify({ tag: 'typo', selectedText: 'bad' }),
      }),
      env,
      context,
      async () => null,
      async () => true,
      { checkRateLimit: async () => true },
    )

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'Missing report context' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('inserts trimmed reports and schedules background evaluation', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      expect(url).toContain('/rest/v1/issue_reports')
      expect(init?.method).toBe('POST')
      expect(JSON.parse(String(init?.body))).toMatchObject({
        user_id: 'reader-1',
        book_id: 'odyssey',
        edition_key: 'modern-en',
        chapter_number: 2,
        paragraph_index: 3,
        selected_text: 'selected',
        tag: 'typo',
        comment: 'fix this',
        status: 'open',
      })
      return supabaseJson([{ id: 'report-1' }], 201)
    })
    vi.stubGlobal('fetch', fetchMock)
    const { context, waits } = ctx()

    const response = await handleReportIssue(
      new Request('https://tinct.app/api/report-issue', {
        method: 'POST',
        body: JSON.stringify({
          bookId: ' odyssey ',
          editionKey: ' modern-en ',
          chapterNumber: 2,
          paragraphIndex: 3,
          selectedText: ' selected ',
          tag: ' typo ',
          comment: ' fix this ',
        }),
      }),
      env,
      context,
      async () => ({ id: 'reader-1', email: 'reader@example.com' }),
      async () => true,
      { checkRateLimit: async () => true },
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ success: true, reportId: 'report-1' })
    expect(waits).toHaveLength(1)
    await Promise.all(waits)
  })

  it('rate limits reports and fails closed without a limiter', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const body = JSON.stringify({ bookId: 'odyssey', editionKey: 'modern-en', chapterNumber: 2, paragraphIndex: 3, selectedText: 'x', tag: 'typo' })
    const keys: string[] = []
    const limited = await handleReportIssue(new Request('https://tinct.app/api/report-issue', { method: 'POST', body, headers: { 'cf-connecting-ip': '1.2.3.4' } }),
      env, ctx().context, async () => null, async () => true, { checkRateLimit: async key => { keys.push(key); return false } })
    expect(limited.status).toBe(429)
    expect(keys).toEqual(['report-issue:1.2.3.4'])
    const unguarded = await handleReportIssue(new Request('https://tinct.app/api/report-issue', { method: 'POST', body }), env, ctx().context, async () => null, async () => true)
    expect(unguarded.status).toBe(429)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('issue report evaluation never applies a fix', () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks() })

  const paragraph = 'She was beh ager to go home, and the ship was ready for the long voyage.'
  const evalEnv = {
    ...env,
    ANTHROPIC_API_KEY: 'anthropic-key',
    ASSETS: { fetch: vi.fn(async () => Response.json({ chapters: [{ number: 2, paragraphs: ['a', 'b', 'c', paragraph] }] })) },
  }

  function supabaseFake(anthropicReply?: unknown) {
    const calls: Array<{ method: string; url: string; body: unknown }> = []
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      const method = init?.method || 'GET'
      calls.push({ method, url, body: init?.body ? JSON.parse(String(init.body)) : null })
      if (url.includes('/rest/v1/issue_reports') && method === 'POST') return supabaseJson([{ id: 'report-9' }], 201)
      if (url.includes('/rest/v1/edition_patches') && method === 'GET') return supabaseJson([])
      if (url === 'https://api.anthropic.com/v1/messages') return Response.json(anthropicReply)
      return supabaseJson({})
    })
    vi.stubGlobal('fetch', fetchMock)
    return calls
  }

  async function report(selectedText: string, comment: string, user: { id: string; email: string } | null, guards: Parameters<typeof handleReportIssue>[5]) {
    const { context, waits } = ctx()
    const sendEmail = vi.fn(async () => true)
    const response = await handleReportIssue(new Request('https://tinct.app/api/report-issue', {
      method: 'POST',
      body: JSON.stringify({ bookId: 'odyssey', editionKey: 'modern-en', chapterNumber: 2, paragraphIndex: 3, selectedText, tag: 'typo', comment }),
    }), evalEnv, context, async () => user, sendEmail, guards)
    expect(response.status).toBe(200)
    await Promise.all(waits)
    return sendEmail
  }

  it('sends a word-split fix to review instead of applying it', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    const calls = supabaseFake()
    const sendEmail = await report('beh ager', '', { id: 'reader-1', email: 'r@example.com' }, { checkRateLimit: async () => true })
    expect(calls.some(call => call.url.includes('/edition_patches') && call.method !== 'GET')).toBe(false)
    expect(calls.some(call => call.url.includes('/pending_audio_regen'))).toBe(false)
    const update = calls.find(call => call.method === 'PATCH' && call.url.includes('/issue_reports'))!
    expect(update.body).toMatchObject({ status: 'pending_review', proposed_fix: paragraph.replace('beh ager', 'behager') })
    expect(sendEmail).toHaveBeenCalledWith(expect.anything(), 'contact@tinct.app', expect.stringContaining('[Review: word split]'), expect.stringContaining('action=approve'))
  })

  it('sends a high-confidence AI fix to review instead of applying it', async () => {
    const corrected = paragraph.replace('beh ager', 'eager')
    const calls = supabaseFake({ content: [{ text: JSON.stringify({ is_error: true, confidence: 0.99, proposed_action: 'apply', explanation: 'Typo.', corrected_paragraph: corrected, related_corrections: [] }) }] })
    const sendEmail = await report('was beh ager', 'eager', { id: 'reader-1', email: 'r@example.com' }, { checkRateLimit: async () => true })
    expect(calls.some(call => call.url.includes('/edition_patches') && call.method !== 'GET')).toBe(false)
    expect(calls.some(call => call.url.includes('/pending_audio_regen'))).toBe(false)
    expect(calls.some(call => call.url.includes('/profiles'))).toBe(false)
    const update = calls.find(call => call.method === 'PATCH' && call.url.includes('/issue_reports'))!
    expect(update.body).toMatchObject({ status: 'pending_review', proposed_fix: corrected, ai_confidence: 0.99 })
    expect(sendEmail).toHaveBeenCalledWith(expect.anything(), 'contact@tinct.app', expect.stringContaining('[Review]'), expect.stringContaining('Approve fix'))
  })

  it('leaves an anonymous report for a person when the signed-out ceiling is spent', async () => {
    const calls = supabaseFake()
    await report('was beh ager', 'eager', null, { checkRateLimit: async () => true, reserveGuestSpend: async () => false })
    expect(calls.some(call => call.url === 'https://api.anthropic.com/v1/messages')).toBe(false)
    expect(calls.find(call => call.method === 'PATCH')?.body).toEqual({ status: 'needs_review' })
  })
})
