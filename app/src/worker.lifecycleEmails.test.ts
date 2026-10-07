import { afterEach, describe, expect, it, vi } from 'vitest'
import worker from './worker'
import { handleScheduled, sendEmail } from './worker/routes/emails'
import { handleEmailLink, isEmailLinkRequest } from './worker/routes/emailLinks'
import { handleAdminAnnounceEmail } from './worker/routes/adminAnnounce'
import { confirmUrl, signLink, unsubscribeHeaders, unsubscribeUrl } from './worker/lifecycle/links'
import { runLifecycleCron } from './worker/lifecycle/runtime'

const SECRET = 'link-secret'
const UID = '55555555-5555-4555-8555-555555555555'
const BASE = { SUPABASE_URL: 'https://db.example', SUPABASE_SERVICE_ROLE_KEY: 'service', BREVO_API_KEY: 'brevo' }
const ctx = { waitUntil: () => undefined } as unknown as ExecutionContext

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('one-click unsubscribe', () => {
  it('builds Gmail/Yahoo header values from the signed link', async () => {
    const url = await unsubscribeUrl(SECRET, UID)
    expect(url).toMatch(/^https:\/\/tinct\.app\/unsubscribe\?t=[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/)
    expect(unsubscribeHeaders(url)).toEqual({
      'List-Unsubscribe': `<${url}>, <mailto:contact@tinct.app?subject=unsubscribe>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    })
  })

  it('POST (the one click) switches reading emails off at once and records the opt-out', async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = []
    vi.stubGlobal('fetch', vi.fn(async (url: string, init?: RequestInit) => { calls.push({ url: String(url), init }); return json([{ id: UID }]) }))
    const url = await unsubscribeUrl(SECRET, UID)
    const response = await handleEmailLink(new Request(url, { method: 'POST', body: 'List-Unsubscribe=One-Click', headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }), { ...BASE, EMAIL_LINK_SECRET: SECRET })
    expect(response.status).toBe(200)
    expect(await response.text()).toContain('Reading emails are off')
    expect(calls).toHaveLength(1)
    expect(calls[0].url).toBe(`https://db.example/rest/v1/profiles?id=eq.${UID}`)
    expect(calls[0].init?.method).toBe('PATCH')
    const body = JSON.parse(String(calls[0].init?.body))
    expect(body.email_opt_in).toBe(false)
    expect(Date.parse(body.email_opt_out_at)).toBeGreaterThan(0)
  })

  it('GET answers with a page that posts itself (one click for people, nothing for link scanners)', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const url = await unsubscribeUrl(SECRET, UID)
    const response = await handleEmailLink(new Request(url), { ...BASE, EMAIL_LINK_SECRET: SECRET })
    const html = await response.text()
    expect(response.status).toBe(200)
    expect(response.headers.get('X-Robots-Tag')).toContain('noindex')
    expect(html).toContain('<form method="post"')
    expect(html).toContain("document.getElementById('stop').submit()")
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('rejects a tampered or foreign-purpose token and writes nothing', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const url = new URL(await unsubscribeUrl(SECRET, UID))
    const tampered = url.searchParams.get('t')!.replace(/.$/, c => (c === 'A' ? 'B' : 'A'))
    for (const token of [tampered, await signLink('other-secret', { p: 'u', u: UID }), await signLink(SECRET, { p: 'c', u: UID, e: 'x', x: Date.now() + 1e6 })]) {
      const response = await handleEmailLink(new Request(`https://tinct.app/unsubscribe?t=${token}`, { method: 'POST' }), { ...BASE, EMAIL_LINK_SECRET: SECRET })
      expect(response.status).toBe(400)
    }
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('is not handled at all without the link secret (behaviour as before)', () => {
    expect(isEmailLinkRequest(new URL('https://tinct.app/unsubscribe?t=x'), {})).toBe(false)
    expect(isEmailLinkRequest(new URL('https://tinct.app/unsubscribe'), { EMAIL_LINK_SECRET: SECRET })).toBe(false)
    expect(isEmailLinkRequest(new URL('https://tinct.app/unsubscribe?t=x'), { EMAIL_LINK_SECRET: SECRET })).toBe(true)
  })
})

describe('one-click confirm', () => {
  it('sets email_confirmed_at for the address the link was sent to, once', async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = []
    vi.stubGlobal('fetch', vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({ url: String(url), init })
      if (!init?.method) return json([{ id: UID, email: 'tinct4@fastmail.com', email_confirmed_at: null }])
      return json([{ id: UID }])
    }))
    const response = await handleEmailLink(new Request(await confirmUrl(SECRET, UID, 'Tinct4@fastmail.com')), { ...BASE, EMAIL_LINK_SECRET: SECRET })
    expect(response.status).toBe(200)
    expect(await response.text()).toContain('Your email is confirmed')
    expect(calls[1].url).toBe(`https://db.example/rest/v1/profiles?id=eq.${UID}&email_confirmed_at=is.null`)
    expect(Object.keys(JSON.parse(String(calls[1].init?.body)))).toEqual(['email_confirmed_at'])
  })

  it('refuses a link for an address the account no longer has, or an expired one', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => json([{ id: UID, email: 'new@fastmail.com', email_confirmed_at: null }])))
    const changed = await handleEmailLink(new Request(await confirmUrl(SECRET, UID, 'tinct4@fastmail.com')), { ...BASE, EMAIL_LINK_SECRET: SECRET })
    expect(changed.status).toBe(400)
    const expired = await handleEmailLink(new Request(await confirmUrl(SECRET, UID, 'new@fastmail.com', Date.now() - 31 * 86_400_000)), { ...BASE, EMAIL_LINK_SECRET: SECRET })
    expect(expired.status).toBe(400)
  })
})

describe('Brevo payload', () => {
  it('carries the text part and the unsubscribe headers when given, and nothing new otherwise', async () => {
    const fetchMock = vi.fn(async () => new Response('{}', { status: 201 }))
    vi.stubGlobal('fetch', fetchMock)
    await sendEmail(BASE, 'tinct1@fastmail.com', 'S', '<p>h</p>', { senderName: 'Anders at Tinct', text: 'h', headers: { 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' } })
    await sendEmail(BASE, 'tinct1@fastmail.com', 'S', '<p>h</p>')
    const [withParts, plain] = fetchMock.mock.calls.map(call => JSON.parse(String((call as unknown as [string, RequestInit])[1].body)))
    expect(withParts).toMatchObject({ sender: { name: 'Anders at Tinct', email: 'contact@tinct.app' }, textContent: 'h', headers: { 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' } })
    expect(plain).toEqual({ sender: { name: 'Tinct', email: 'contact@tinct.app' }, to: [{ email: 'tinct1@fastmail.com' }], subject: 'S', htmlContent: '<p>h</p>' })
  })
})

describe('LIFECYCLE_EMAILS switch', () => {
  it('off: the cron does nothing new, and the 09:00 job still sends the legacy emails', async () => {
    const fetchMock = vi.fn(async () => json([]))
    vi.stubGlobal('fetch', fetchMock)
    await runLifecycleCron({ ...BASE, LIFECYCLE_EMAILS: '0' }, Date.now())
    await runLifecycleCron({ ...BASE }, Date.now())
    expect(fetchMock).not.toHaveBeenCalled()
    await handleScheduled({ ...BASE })
    expect(fetchMock.mock.calls.some(call => String((call as unknown[])[0]).includes('/rest/v1/profiles?'))).toBe(true)
  })

  it('on: the 09:00 job leaves the legacy trial-day emails to the engine but keeps the anomaly alert', async () => {
    const urls: string[] = []
    vi.stubGlobal('fetch', vi.fn(async (url: string) => { urls.push(String(url)); return json([]) }))
    await handleScheduled({ ...BASE, LIFECYCLE_EMAILS: '1' })
    expect(urls.some(url => url.includes('/rest/v1/profiles?'))).toBe(false)
    expect(urls.some(url => url.includes('/rpc/issue_anomalies'))).toBe(true)
  })

  it('on: the sweep reads only the test aliases\' profiles and sends through the gate', async () => {
    const urls: string[] = []
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      urls.push(String(url))
      if (String(url).includes('/rest/v1/profiles?')) return json([{ id: UID, email: 'stranger@example.com', created_at: new Date().toISOString() }])
      return json([])
    }))
    await runLifecycleCron({ ...BASE, LIFECYCLE_EMAILS: '1', EMAIL_LINK_SECRET: SECRET }, Date.parse('2026-10-14T08:02:00Z'))
    const profileQueries = urls.filter(url => url.includes('/rest/v1/profiles?'))
    expect(profileQueries).toHaveLength(2) // welcome + hourly sweep
    for (const url of profileQueries) expect(decodeURIComponent(url)).toContain('or=(email.ilike.tinct*@fastmail.com,email.eq.ahvelplund@fastmail.com)')
    expect(urls.some(url => url.includes('brevo'))).toBe(false)
    expect(urls.some(url => url.includes('email_log'))).toBe(false)
  })

  it('the announcement route is absent while off and admin-only while on', async () => {
    const off = await worker.fetch(new Request('https://tinct.app/api/admin/announce-email', { method: 'POST', body: '{}' }), { ASSETS: { fetch: async () => new Response('nf', { status: 404 }) } } as never, ctx)
    expect(off.status).not.toBe(403)
    const notAdmin = await handleAdminAnnounceEmail(new Request('https://tinct.app/api/admin/announce-email', { method: 'POST', body: JSON.stringify({ campaign: 'add-any-book' }) }), { ...BASE, LIFECYCLE_EMAILS: '1' }, async () => false)
    expect(notAdmin.status).toBe(403)
    vi.stubGlobal('fetch', vi.fn(async () => json([{ id: UID, email: 'tinct2@fastmail.com', created_at: new Date().toISOString() }])))
    const bad = await handleAdminAnnounceEmail(new Request('https://tinct.app/api/admin/announce-email', { method: 'POST', body: JSON.stringify({ campaign: 'x', omitFeatures: ['nope'] }) }), { ...BASE, LIFECYCLE_EMAILS: '1' }, async () => true)
    expect(bad.status).toBe(400)
    const dry = await handleAdminAnnounceEmail(new Request('https://tinct.app/api/admin/announce-email', { method: 'POST', body: JSON.stringify({ campaign: 'add-any-book', omitFeatures: ['search'], dryRun: true }) }), { ...BASE, LIFECYCLE_EMAILS: '1' }, async () => true)
    const preview = await dry.json() as { recipients: number; html: string; text: string }
    expect(preview.recipients).toBe(1)
    expect(preview.html).not.toContain('Better search')
    expect(preview.text).not.toMatch(/\{\{/)
  })

  it('without the secret, /unsubscribe falls through to the site exactly as before', async () => {
    const seen: string[] = []
    const response = await worker.fetch(new Request('https://tinct.app/unsubscribe?t=abc'), { ASSETS: { fetch: async (request: Request) => { seen.push(new URL(request.url).pathname); return new Response('asset', { status: 404 }) } } } as never, ctx)
    expect(response.headers.get('X-Robots-Tag') ?? '').not.toContain('nofollow')
    expect(seen.length).toBeGreaterThan(0)
  })
})
