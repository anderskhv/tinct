import { describe, expect, it, vi } from 'vitest'
import { createVoiceDiagnosticReporter, nextVoiceDiagnosticId } from './diagnostics'

describe('voice diagnostics reporter', () => {
  it('does not exist without both the server-issued session and authenticated token', () => {
    expect(createVoiceDiagnosticReporter({ sessionId: null, authToken: 'token' })).toBeNull()
    expect(createVoiceDiagnosticReporter({ sessionId: 'session', authToken: null })).toBeNull()
  })

  it('posts opaque timeline events without putting credentials in the body', async () => {
    const fetchImpl = vi.fn(async () => new Response(null, { status: 202 }))
    const reporter = createVoiceDiagnosticReporter({
      sessionId: 'server_session',
      authToken: 'private-token',
      fetchImpl: fetchImpl as typeof fetch,
    })!
    reporter.report('submitted', {
      turnId: 'turn_one',
      metadata: { input_characters: 12, phase: 'listening', reason: undefined },
      raw: { transcript: 'What should I notice?' },
    })
    await vi.waitFor(() => expect(fetchImpl).toHaveBeenCalledOnce())
    const init = fetchImpl.mock.calls[0][1] as RequestInit
    expect(init.headers).toEqual({ 'Content-Type': 'application/json', Authorization: 'Bearer private-token' })
    expect(String(init.body)).toContain('What should I notice?')
    expect(String(init.body)).not.toContain('private-token')
    expect(init.keepalive).toBe(true)
  })

  it('generates opaque turn and provider correlation ids', () => {
    expect(nextVoiceDiagnosticId('turn')).toMatch(/^turn_[A-Za-z0-9_-]+$/)
    expect(nextVoiceDiagnosticId('provider')).toMatch(/^provider_[A-Za-z0-9_-]+$/)
  })
})
