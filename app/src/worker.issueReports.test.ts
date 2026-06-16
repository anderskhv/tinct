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
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ success: true, reportId: 'report-1' })
    expect(waits).toHaveLength(1)
    await Promise.all(waits)
  })
})
