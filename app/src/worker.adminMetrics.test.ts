import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { handleAdminMetricsUsers } from './worker/routes/adminMetrics'

const env = {
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'service-role',
}

const readerId = '11111111-1111-4111-8111-111111111111'
const excludedId = '22222222-2222-4222-8222-222222222222'

function supabaseJson(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('admin metrics route', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-16T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('returns not configured before auth work when Supabase is missing', async () => {
    let adminChecks = 0
    const response = await handleAdminMetricsUsers(
      new Request('https://tinct.app/api/admin/metrics-users'),
      {},
      async () => {
        adminChecks += 1
        return true
      },
    )

    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ error: 'Not configured' })
    expect(adminChecks).toBe(0)
  })

  it('requires GET and admin access', async () => {
    const post = await handleAdminMetricsUsers(
      new Request('https://tinct.app/api/admin/metrics-users', { method: 'POST' }),
      env,
      async () => true,
    )
    const forbidden = await handleAdminMetricsUsers(
      new Request('https://tinct.app/api/admin/metrics-users'),
      env,
      async () => false,
    )

    expect(post.status).toBe(405)
    expect(await post.json()).toEqual({ error: 'Method not allowed' })
    expect(forbidden.status).toBe(403)
    expect(await forbidden.json()).toEqual({ error: 'Forbidden' })
  })

  it('aggregates users while excluding internal accounts and their sessions', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('/rest/v1/analytics_events?')) {
        return supabaseJson([
          {
            event_type: 'pageview',
            path: '/read/odyssey',
            duration_ms: null,
            user_id: readerId,
            session_id: 'reader-session-1',
            payload: null,
            created_at: '2026-06-16T10:00:00.000Z',
          },
          {
            event_type: 'page_duration',
            path: '/read/odyssey',
            duration_ms: 120000,
            user_id: readerId,
            session_id: 'reader-session-1',
            payload: null,
            created_at: '2026-06-16T10:02:00.000Z',
          },
          {
            event_type: 'event',
            path: '/app',
            duration_ms: null,
            user_id: readerId,
            session_id: 'reader-session-2',
            payload: { type: 'chat_message_sent', book_id: 'iliad' },
            created_at: '2026-06-16T11:00:00.000Z',
          },
          {
            event_type: 'event',
            path: '/app',
            duration_ms: null,
            user_id: excludedId,
            session_id: 'excluded-session',
            payload: { type: 'checkout_started' },
            created_at: '2026-06-16T11:10:00.000Z',
          },
          {
            event_type: 'page_duration',
            path: '/read/hamlet',
            duration_ms: 600000,
            user_id: null,
            session_id: 'excluded-session',
            payload: null,
            created_at: '2026-06-16T11:11:00.000Z',
          },
        ])
      }
      if (url.includes('/rest/v1/profiles?')) {
        return supabaseJson([
          { id: readerId, email: 'reader@example.com' },
          { id: excludedId, email: 'tinct12@fastmail.com' },
        ])
      }
      return supabaseJson({ error: 'unexpected URL' }, 500)
    })
    vi.stubGlobal('fetch', fetchMock)

    const response = await handleAdminMetricsUsers(
      new Request('https://tinct.app/api/admin/metrics-users?days=30'),
      env,
      async () => true,
    )

    expect(response.status).toBe(200)
    const body = await response.json() as {
      days: number
      generatedAt: string
      excludedAccounts: number
      excludedSessions: number
      users: Array<Record<string, unknown>>
    }
    expect(body.days).toBe(30)
    expect(body.generatedAt).toBe('2026-06-16T12:00:00.000Z')
    expect(body.excludedAccounts).toBe(1)
    expect(body.excludedSessions).toBe(1)
    expect(body.users).toEqual([
      {
        userId: readerId,
        email: 'reader@example.com',
        sessions: 1,
        sessions2Min: 1,
        sessions10Min: 0,
        readingMinutes: 2,
        longestSessionMinutes: 2,
        pageviews: 1,
        books: 2,
        chatInteractions: 1,
        feedInteractions: 0,
        audioBookInteractions: 0,
        castInteractions: 0,
        checkoutStarts: 0,
        firstSeen: '2026-06-16T10:00:00.000Z',
        lastSeen: '2026-06-16T11:00:00.000Z',
      },
    ])
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('created_at=gte.2026-05-17T12%3A00%3A00.000Z'),
      expect.any(Object),
    )
  })
})
