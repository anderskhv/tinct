import { afterEach, describe, expect, it, vi } from 'vitest'
import { handleApproveFix, type IssueReviewDeps } from './worker/routes/issueReview'

const env = {
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'service-role',
}

const baseReport = {
  id: 'report-1',
  review_token: 'token-1',
  status: 'pending_review',
  proposed_fix: 'Corrected <paragraph>',
  original_paragraph: 'Original paragraph',
  book_id: 'odyssey',
  edition_key: 'modern-en',
  chapter_number: 2,
  paragraph_index: 3,
  user_id: null,
  selected_text: '<selected>',
  comment: '<comment>',
}

function supabaseJson(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function deps(overrides: Partial<IssueReviewDeps> = {}): IssueReviewDeps {
  return {
    fetchParagraphContext: vi.fn(async () => ({ fullParagraph: 'Loaded paragraph', paragraphIndex: 3 })),
    tryCommentReplacement: vi.fn(() => null),
    validateCorrectedParagraph: vi.fn(() => null),
    upsertEditionPatch: vi.fn(async () => new Response('', { status: 201 })),
    queueAudioRegen: vi.fn(async () => new Response('', { status: 201 })),
    sendEmail: vi.fn(async () => true),
    ...overrides,
  }
}

describe('issue review route', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('rejects missing review parameters before querying Supabase', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const response = await handleApproveFix(
      new Request('https://tinct.app/api/approve-fix?action=approve'),
      env,
      deps(),
    )

    expect(response.status).toBe(400)
    expect(await response.text()).toContain('This review link is invalid or expired.')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('renders the manual edit form with escaped report content', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => supabaseJson([{ ...baseReport }])))

    const response = await handleApproveFix(
      new Request('https://tinct.app/api/approve-fix?id=report-1&action=edit&token=token-1'),
      env,
      deps(),
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    const html = await response.text()
    expect(html).toContain('<title>Manual edit — Tinct</title>')
    expect(html).toContain('&lt;selected&gt;')
    expect(html).toContain('&lt;comment&gt;')
    expect(html).toContain('Corrected &lt;paragraph&gt;')
    expect(html).not.toContain('<selected>')
  })

  it('applies approved fixes through injected patch and audio helpers', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      if (url.includes('/rest/v1/issue_reports?id=eq.report-1&select=*')) {
        return supabaseJson([{ ...baseReport }])
      }
      if (url.includes('/rest/v1/issue_reports?id=eq.report-1') && init?.method === 'PATCH') {
        return new Response(null, { status: 204 })
      }
      return supabaseJson({ error: 'unexpected request' }, 500)
    })
    vi.stubGlobal('fetch', fetchMock)
    const routeDeps = deps()

    const response = await handleApproveFix(
      new Request('https://tinct.app/api/approve-fix?id=report-1&action=approve&token=token-1'),
      env,
      routeDeps,
    )

    expect(response.status).toBe(200)
    expect(await response.text()).toContain('The fix has been applied and deployed.')
    expect(routeDeps.validateCorrectedParagraph).toHaveBeenCalledWith('Original paragraph', 'Corrected <paragraph>')
    expect(routeDeps.upsertEditionPatch).toHaveBeenCalledWith(env, {
      book_id: 'odyssey',
      edition_key: 'modern-en',
      chapter_number: 2,
      paragraph_index: 3,
      original_text: 'Original paragraph',
      patched_text: 'Corrected <paragraph>',
      issue_report_id: 'report-1',
      applied_by: 'anders-review',
    })
    expect(routeDeps.queueAudioRegen).toHaveBeenCalledWith(env, {
      book_id: 'odyssey',
      edition_key: 'modern-en',
      chapter_number: 2,
      paragraph_index: 3,
      patched_text: 'Corrected <paragraph>',
    })
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/rest/v1/issue_reports?id=eq.report-1'),
      expect.objectContaining({ method: 'PATCH' }),
    )
  })
})
