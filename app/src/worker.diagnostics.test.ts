import { afterEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { reconstructDiagnosticSequence, recordServerDiagnosticEvent, sanitizeDiagnosticMetadata } from './worker/lib/diagnostics'
import { handleAdminDiagnostics, handleDiagnosticConsent, handleDiagnosticEvent } from './worker/routes/diagnostics'

const ownerId = '11111111-1111-4111-8111-111111111111'
const otherId = '22222222-2222-4222-8222-222222222222'
const env = {
  OWNER_DIAGNOSTIC_USER_ID: ownerId,
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'service-role',
}
const verify = (id: string | null) => async () => id ? ({ id, email: 'not-used' }) : null
const json = (body: unknown, status = 200) => Response.json(body, { status })

describe('owner conversation diagnostics', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('fails closed when the immutable owner allowlist is missing', async () => {
    const response = await handleDiagnosticEvent(new Request('https://tinct.app/api/diagnostics/events', { method: 'POST' }), {
      SUPABASE_URL: env.SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY,
    }, verify(ownerId))
    expect(response.status).toBe(503)
  })

  it('denies non-owner and ignores a spoofed client admin flag', async () => {
    const response = await handleDiagnosticEvent(new Request('https://tinct.app/api/diagnostics/events', {
      method: 'POST', body: JSON.stringify({ sessionId: 's1', type: 'submitted', admin: true }),
    }), env, verify(otherId))
    expect(response.status).toBe(403)
  })

  it('allows owner opt-in and forces raw capture off when disabled', async () => {
    const bodies: string[] = []
    vi.stubGlobal('fetch', vi.fn(async (_input, init?: RequestInit) => {
      bodies.push(String(init?.body || ''))
      return new Response(null, { status: 201 })
    }))
    const enabled = await handleDiagnosticConsent(new Request('https://tinct.app/api/diagnostics/consent', {
      method: 'PUT', body: JSON.stringify({ enabled: true, rawContentEnabled: true }),
    }), env, verify(ownerId))
    expect(enabled.status).toBe(200)
    expect(bodies[0]).toContain('"raw_content_enabled":true')

    const disabled = await handleDiagnosticConsent(new Request('https://tinct.app/api/diagnostics/consent', {
      method: 'PUT', body: JSON.stringify({ enabled: false, rawContentEnabled: true }),
    }), env, verify(ownerId))
    expect(await disabled.json()).toEqual({ enabled: false, raw_content_enabled: false })
  })

  it('opt-out stops future capture and ordinary users can never capture raw content', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      if (String(input).includes('diagnostic_consents')) return json([{ enabled: false, raw_content_enabled: false }])
      throw new Error('no insert expected')
    })
    vi.stubGlobal('fetch', fetchMock)
    expect(await recordServerDiagnosticEvent(env, ownerId, { sessionId: 's1', type: 'submitted', raw: { prompt: 'private' } })).toBe(false)
    expect(await recordServerDiagnosticEvent(env, otherId, { sessionId: 's1', type: 'submitted', raw: { prompt: 'private' } })).toBe(false)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('separates opted-in raw content and strips secrets from operational metadata', async () => {
    const inserts: Array<{ url: string; body: Record<string, unknown> }> = []
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      if (url.includes('diagnostic_consents')) return json([{ enabled: true, raw_content_enabled: true }])
      inserts.push({ url, body: JSON.parse(String(init?.body)) })
      return json([{}], 201)
    }))
    const captured = await recordServerDiagnosticEvent(env, ownerId, {
      sessionId: 'session_opaque', turnId: 'turn_opaque', providerId: 'provider_opaque', type: 'provider_error',
      metadata: { latency_ms: 123, error_class: 'timeout', authorization: 'Bearer secret', email: 'private' },
      raw: { prompt: 'owner prompt', response: 'owner response', token: 'must-not-copy' },
    })
    expect(captured).toBe(true)
    expect(inserts).toHaveLength(2)
    expect(inserts[0].url).toContain('diagnostic_events')
    expect(inserts[0].body.metadata).toEqual({ latency_ms: 123, error_class: 'timeout' })
    expect(inserts[1].url).toContain('diagnostic_payloads')
    expect(inserts[1].body.payload).toEqual({ prompt: 'owner prompt', response: 'owner response' })
  })

  it('requires both owner authentication and site-admin authorization to read', async () => {
    const denied = await handleAdminDiagnostics(new Request('https://tinct.app/api/admin/diagnostics'), env, verify(ownerId), async () => false)
    expect(denied.status).toBe(403)

    const calls: string[] = []
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      calls.push(String(input))
      if (String(input).includes('diagnostic_events?')) return json([{ event_type: 'submitted' }])
      return json([{}], 201)
    }))
    const allowed = await handleAdminDiagnostics(new Request('https://tinct.app/api/admin/diagnostics'), env, verify(ownerId), async () => true)
    expect(allowed.status).toBe(200)
    expect(await allowed.json()).toEqual({ events: [{ event_type: 'submitted' }] })
    expect(calls.some(call => call.includes('diagnostic_access_audit'))).toBe(true)
    expect(calls.some(call => call.includes('diagnostic_payloads'))).toBe(false)
  })

  it('supports auditable retention deletion', async () => {
    const calls: Array<{ url: string; method?: string }> = []
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      calls.push({ url: String(input), method: init?.method })
      return new Response(null, { status: init?.method === 'DELETE' ? 204 : 201 })
    }))
    const response = await handleAdminDiagnostics(new Request('https://tinct.app/api/admin/diagnostics?scope=expired', { method: 'DELETE' }), env, verify(ownerId), async () => true)
    expect(response.status).toBe(204)
    expect(calls.filter(call => call.method === 'DELETE')).toHaveLength(2)
    expect(calls.every(call => !call.url.includes(ownerId) || call.url.includes('audit'))).toBe(true)
  })

  it('reconstructs fallback followed by a speech cutoff', () => {
    expect(reconstructDiagnosticSequence([
      { event_type: 'submitted' }, { event_type: 'provider_error' }, { event_type: 'fallback' },
      { event_type: 'tts_started' }, { event_type: 'tts_interrupted' },
    ])).toEqual({ hadFallback: true, speechCutOff: true, completed: false })
  })

  it('only accepts explicitly safe metadata fields', () => {
    expect(sanitizeDiagnosticMetadata({
      status: 'ok',
      book_id: 'phaedo',
      chapter_number: 1,
      phase: 'checking_text',
      token: 'x',
      cookie: 'y',
      nested: { secret: 'z' },
    })).toEqual({ status: 'ok', book_id: 'phaedo', chapter_number: 1, phase: 'checking_text' })
  })

  it('keeps every diagnostic table behind RLS with no authenticated read policy', () => {
    const migration = readFileSync(new URL('../supabase/migrations/20260904_owner_conversation_diagnostics.sql', import.meta.url), 'utf8')
    for (const table of ['diagnostic_consents', 'diagnostic_events', 'diagnostic_payloads', 'diagnostic_access_audit']) {
      expect(migration).toContain(`alter table public.${table} enable row level security`)
      expect(migration).toContain(`revoke all on public.${table} from anon, authenticated`)
    }
    expect(migration).not.toMatch(/create\s+policy/i)
  })
})
