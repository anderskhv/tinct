// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { useLabAsk, type UseLabAskOptions } from './useLabAsk'

vi.mock('../data/editionLoader', () => ({ loadEditionWindow: vi.fn() }))
vi.mock('../hooks/useAuth', () => ({ useAuth: () => ({ session: null, likelyAuthenticated: false }) }))
vi.mock('../hooks/useVoiceSession', () => ({ useVoiceSession: () => ({ state: 'idle', activity: 'idle', connection: 'idle', isActive: false, stop: vi.fn(), setAssistantPace: vi.fn() }) }))

const options = (authToken: string | null): UseLabAskOptions => ({ bookId: 'userbook-0123456789abcdef01234567', editionKey: 'own-en', bookTitle: 'Lanterns Illustrated', bookAuthor: 'Ada Lampwright', chapterLabel: 'The Workshop', chapterNumber: 1, paragraphs: ['Paragraph one.'], paragraphIndex: 0, signedIn: !!authToken, authToken, userId: null, voiceToolAdapter: {} as UseLabAskOptions['voiceToolAdapter'] })
const reply = () => new Response(JSON.stringify({ content: [{ text: 'It shows a workbench.' }] }), { headers: { 'Content-Type': 'application/json' } })
const block = { type: 'image', source: { type: 'base64', media_type: 'image/png', data: 'iVBORw0KGgo=' } }

afterEach(() => { cleanup(); localStorage.clear(); vi.unstubAllGlobals(); vi.clearAllMocks() })

it('sends a figure’s picture with the question when signed in, through the picture path', async () => {
  const fetcher = vi.fn().mockResolvedValue(reply())
  vi.stubGlobal('fetch', fetcher)
  const image = vi.fn().mockResolvedValue(block)
  const { result } = renderHook(() => useLabAsk(options('token')))
  await act(async () => { await result.current.sendTyped('Explain this figure.', undefined, undefined, { highlightedText: '[Figure 1: The workbench.]', image }) })
  expect(fetcher.mock.calls[0][0]).toMatch(/\/api\/chat$/)
  const payload = JSON.parse(fetcher.mock.calls[0][1].body)
  const last = payload.messages.at(-1)
  expect(last.content[0]).toEqual(block)
  expect(last.content[1].type).toBe('text')
  expect(last.content[1].text).toContain('[The reader highlighted this passage:\n[Figure 1: The workbench.]]')
  expect(last.content[1].text).toContain('Explain this figure.')
  // The picture is never kept in the chat history.
  expect(JSON.stringify(result.current.turns)).not.toContain('iVBORw0KGgo=')
})

it('sends only the caption when signed out (guests send no pictures)', async () => {
  const fetcher = vi.fn().mockResolvedValue(reply())
  vi.stubGlobal('fetch', fetcher)
  const image = vi.fn().mockResolvedValue(block)
  const { result } = renderHook(() => useLabAsk(options(null)))
  await act(async () => { await result.current.sendTyped('Explain this figure.', undefined, undefined, { highlightedText: '[Figure 1: The workbench.]', image }) })
  expect(image).not.toHaveBeenCalled()
  const payload = JSON.parse(fetcher.mock.calls[0][1].body)
  expect(typeof payload.messages.at(-1).content).toBe('string')
  expect(payload.messages.at(-1).content).toContain('[Figure 1: The workbench.]')
})
