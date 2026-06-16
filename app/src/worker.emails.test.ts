import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { handleScheduled, sendEmail } from './worker/routes/emails'

const env = {
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'service-role',
  BREVO_API_KEY: 'brevo-key',
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('email worker helpers', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-16T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('does not call Brevo without an API key', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    await expect(sendEmail({}, 'reader@example.com', 'Subject', '<p>Hello</p>')).resolves.toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('sends Brevo transactional email with sender defaults', async () => {
    const fetchMock = vi.fn(async () => new Response('{}', { status: 202 }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(sendEmail(env, 'reader@example.com', 'Subject', '<p>Hello</p>', { replyTo: 'reply@example.com' })).resolves.toBe(true)

    expect(fetchMock).toHaveBeenCalledWith('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': 'brevo-key',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'Tinct', email: 'contact@tinct.app' },
        to: [{ email: 'reader@example.com' }],
        subject: 'Subject',
        htmlContent: '<p>Hello</p>',
        replyTo: { email: 'reply@example.com' },
      }),
    })
  })

  it('sends lifecycle and anomaly emails on schedule', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      if (url.includes('/rest/v1/profiles?')) {
        if (url.includes('created_at=gte.2026-06-16T00:00:00.000Z')) {
          return json([{ id: 'u1', email: 'new@example.com' }])
        }
        return json([])
      }
      if (url.includes('/rest/v1/rpc/issue_anomalies')) {
        expect(init?.method).toBe('POST')
        expect(JSON.parse(String(init?.body))).toEqual({ since_ts: '2026-06-15T12:00:00.000Z' })
        return json([{ book_id: 'odyssey', chapter_number: 1, n: 3 }])
      }
      if (url === 'https://api.brevo.com/v3/smtp/email') {
        return new Response('{}', { status: 202 })
      }
      return json({ error: 'unexpected URL' }, 500)
    })
    vi.stubGlobal('fetch', fetchMock)

    await handleScheduled(env)

    const brevoCalls = fetchMock.mock.calls.filter(([input]) => String(input) === 'https://api.brevo.com/v3/smtp/email')
    expect(brevoCalls).toHaveLength(2)
    expect(JSON.parse(String(brevoCalls[0][1]?.body))).toMatchObject({
      to: [{ email: 'new@example.com' }],
      subject: 'Welcome to Tinct',
    })
    expect(JSON.parse(String(brevoCalls[1][1]?.body))).toMatchObject({
      to: [{ email: 'contact@tinct.app' }],
      subject: '[Tinct Anomaly] High issue volume detected',
    })
  })
})
