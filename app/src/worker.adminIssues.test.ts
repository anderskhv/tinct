import { afterEach, describe, expect, it, vi } from 'vitest'
import { handleAdminIssues } from './worker/routes/adminIssues'

const env = {
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'service-role',
}

function supabaseJson(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('admin issues route', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns plain not configured before admin auth when Supabase is missing', async () => {
    let adminChecks = 0
    const response = await handleAdminIssues(
      new Request('https://tinct.app/api/admin/issues'),
      {},
      async () => {
        adminChecks += 1
        return true
      },
    )

    expect(response.status).toBe(500)
    expect(await response.text()).toBe('Not configured')
    expect(adminChecks).toBe(0)
  })

  it('requires site admin access', async () => {
    const response = await handleAdminIssues(
      new Request('https://tinct.app/api/admin/issues'),
      env,
      async () => false,
    )

    expect(response.status).toBe(403)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(await response.text()).toBe('Forbidden')
  })

  it('renders escaped issue rows and review links', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      expect(url).toContain('/rest/v1/issue_reports?')
      expect(url).toContain('book_id=eq.odyssey%20%26%20more')
      return supabaseJson([
        {
          id: 'report-1',
          status: 'pending_review',
          book_id: 'odyssey & more',
          edition_key: 'modern-en',
          chapter_number: 3,
          paragraph_index: 4,
          selected_text: '<selected text that is intentionally long>',
          comment: '<script>alert(1)</script>',
          ai_confidence: 0.875,
          ai_explanation: 'Looks <unsafe>',
          proposed_fix: 'fixed text',
          review_token: 'tok&en',
          created_at: '2026-06-16T10:00:00Z',
        },
      ])
    })
    vi.stubGlobal('fetch', fetchMock)

    const response = await handleAdminIssues(
      new Request('https://tinct.app/api/admin/issues?book=odyssey%20%26%20more'),
      env,
      async () => true,
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    const html = await response.text()
    expect(html).toContain('<title>Issue Reports — Tinct Admin</title>')
    expect(html).toContain('odyssey &amp; more')
    expect(html).toContain('&lt;selected text that is intent')
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(html).toContain('Looks &lt;unsafe&gt;')
    expect(html).toContain('88%')
    expect(html).toContain('/api/approve-fix?id=report-1&action=approve&token=tok%26en')
    expect(html).not.toContain('<script>alert(1)</script>')
  })
})
