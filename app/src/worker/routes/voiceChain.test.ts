import { afterEach, expect, it, vi } from 'vitest'
import { handleVoiceChain } from './voiceChain'
const env = { OPENAI_API_KEY: 'secret-test-key' }
const request = (body: unknown) => new Request('https://preview.test/api/voice-chain', { method: 'POST', body: JSON.stringify(body) })
const admin = async () => true, rate = async () => true
afterEach(() => vi.unstubAllGlobals())
it('rejects non-admin access before any provider request', async () => {
  const fetch_ = vi.fn(); vi.stubGlobal('fetch', fetch_)
  expect((await handleVoiceChain(request({ action: 'speech', text: 'test' }), env, async () => false, rate)).status).toBe(403)
  expect(fetch_).not.toHaveBeenCalled()
})
it('streams Sol with explicit low reasoning and native search only', async () => {
  const stream = new ReadableStream()
  const fetch_ = vi.fn().mockResolvedValue(new Response(stream)); vi.stubGlobal('fetch', fetch_)
  const response = await handleVoiceChain(request({ action: 'answer', instructions: 'Be insightful.', messages: [{ role: 'user', content: 'Why?' }], tools: [] }), env, admin, rate)
  expect(response.body).toBe(stream)
  const [url, init] = fetch_.mock.calls[0], body = JSON.parse(init.body)
  expect(url).toBe('https://api.openai.com/v1/responses')
  expect(body).toMatchObject({ model: 'gpt-5.6-sol', reasoning: { effort: 'low' }, stream: true, store: false, tools: [{ type: 'web_search', search_context_size: 'low' }] })
  expect(response.headers.get('cache-control')).toBe('no-store')
})
it('configures transcription on client_secrets then exchanges raw SDP with the ephemeral credential', async () => {
  const fetch_ = vi.fn()
    .mockResolvedValueOnce(new Response(JSON.stringify({ value: 'ephemeral-secret', session: { type: 'transcription' } })))
    .mockResolvedValueOnce(new Response('answer-sdp'))
  vi.stubGlobal('fetch', fetch_)
  const result = await handleVoiceChain(request({ action: 'transcription', sdp: 'offer' }), env, admin, rate)
  expect(fetch_.mock.calls[0][0]).toBe('https://api.openai.com/v1/realtime/client_secrets')
  const session = JSON.parse(fetch_.mock.calls[0][1].body).session
  expect(session.type).toBe('transcription')
  expect(session.audio.input.turn_detection.silence_duration_ms).toBe(900)
  expect(session.audio.input.transcription.model).toBe('gpt-live-transcribe')
  expect(fetch_.mock.calls[1][0]).toBe('https://api.openai.com/v1/realtime/calls')
  expect(fetch_.mock.calls[1][1]).toMatchObject({ headers: { Authorization: 'Bearer ephemeral-secret', 'Content-Type': 'application/sdp' }, body: 'offer' })
  expect(await result.text()).toBe('answer-sdp')
})
it('never exchanges SDP after a rejected transcription session or exposes its secret', async () => {
  const fetch_ = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({ error: { code: 'invalid_value', param: 'session.type', message: 'private detail' } }), { status: 400 }))
  vi.stubGlobal('fetch', fetch_)
  const result = await handleVoiceChain(request({ action: 'transcription', sdp: 'offer' }), env, admin, rate)
  expect(fetch_).toHaveBeenCalledTimes(1)
  expect(result.status).toBe(502)
  expect(await result.json()).toEqual({ error: 'Could not create the transcription session.', stage: 'transcription_session', code: 'invalid_value', param: 'session.type' })
})

it('rejects arbitrary hosted tools, model injection and oversized speech', async () => {
  const fetch_ = vi.fn(); vi.stubGlobal('fetch', fetch_)
  const result = await handleVoiceChain(request({ action: 'answer', instructions: '', messages: [], tools: [{ type: 'mcp', server_url: 'https://evil.test' }] }), env, admin, rate)
  expect(result.status).toBe(400)
  expect((await handleVoiceChain(request({ action: 'speech', text: 'x'.repeat(4001) }), env, admin, rate)).status).toBe(400)
  expect(fetch_).not.toHaveBeenCalled()
})
it('returns generic provider failures without leaking provider payloads', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: { message: 'secret provider details', code: 'bad_request' } }), { status: 400 })))
  const result = await handleVoiceChain(request({ action: 'speech', text: 'A thought.' }), env, admin, rate)
  expect(result.status).toBe(502)
  expect(await result.text()).not.toContain('secret')
})

it('does not expose unknown parameter names or private provider messages', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
    error: { code: 'invalid_value', param: 'private-value', message: 'private provider message' }
  }), { status: 400 })))
  const result = await handleVoiceChain(request({ action: 'transcription', sdp: 'offer' }), env, admin, rate)
  expect(await result.json()).toEqual({
    error: 'Could not create the transcription session.', stage: 'transcription_session', code: 'invalid_value'
  })
})
