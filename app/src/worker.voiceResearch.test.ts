import { afterEach, expect, it, vi } from 'vitest'
import { handleVoiceResearch } from './worker/routes/voiceResearch'
const env = { OPENAI_API_KEY: 'test-key', SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'test-service' }
const user = async () => ({ id: '11111111-1111-4111-8111-111111111111' })
const request = () => new Request('https://tinct.app/api/voice-research', { method: 'POST', body: JSON.stringify({ query: 'Tim Keller on Genesis 1' }) })
afterEach(() => vi.unstubAllGlobals())
it('requires authentication before any paid request', async () => {
  const fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher)
  expect((await handleVoiceResearch(request(), env, async () => null, async () => true)).status).toBe(401)
  expect(fetcher).not.toHaveBeenCalled()
})
it('returns bounded cited evidence using server-owned search settings', async () => {
  const fetcher = vi.fn().mockResolvedValueOnce(Response.json([{ message_balance: 100 }])).mockResolvedValueOnce(Response.json({ status: 'completed', output: [{ type: 'message', content: [{ text: 'A sourced research note.', annotations: [{ type: 'url_citation', url: 'https://gospelinlife.com/example', title: 'Sermon archive' }] }] }] }))
  vi.stubGlobal('fetch', fetcher)
  const response = await handleVoiceResearch(request(), env, user, async () => true)
  expect(await response.json()).toMatchObject({ ok: true, sources: [{ url: 'https://gospelinlife.com/example' }] })
  const sent = JSON.parse(fetcher.mock.calls[1][1].body)
  expect(sent).toMatchObject({ store: false, tool_choice: 'required', input: 'Tim Keller on Genesis 1', tools: [{ type: 'web_search' }] })
})
it('does not present uncited or incomplete search text as verified evidence', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(Response.json([{ message_balance: 100 }])).mockResolvedValueOnce(Response.json({ status: 'completed', output: [{ type: 'message', content: [{ text: 'Unsupported claim.' }] }] })))
  expect((await handleVoiceResearch(request(), env, user, async () => true)).status).toBe(502)
})
