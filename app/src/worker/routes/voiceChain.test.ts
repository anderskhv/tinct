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
it('creates a transcription-only session with a more patient turn boundary', async () => {
  const fetch_ = vi.fn().mockResolvedValue(new Response('sdp')); vi.stubGlobal('fetch', fetch_)
  await handleVoiceChain(request({ action: 'transcription', sdp: 'offer' }), env, admin, rate)
  expect(fetch_.mock.calls[0][0]).toContain('/realtime/calls')
  const session = JSON.parse(fetch_.mock.calls[0][1].body.get('session'))
  expect(session.type).toBe('transcription')
  expect(session.audio.input.turn_detection.silence_duration_ms).toBe(900)
  expect(session.audio.input.transcription.model).toBe('gpt-live-transcribe')
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
