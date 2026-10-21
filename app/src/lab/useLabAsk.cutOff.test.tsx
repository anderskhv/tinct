// @vitest-environment jsdom
/**
 * Bible chat, 21 Oct 2026: an answer that ended on its length bound was shown
 * and saved as finished. Still cut off after the Worker's own continuation, it
 * is shown with Continue and saved as incomplete; Continue streams the rest on
 * to the same answer and saves the joined answer once.
 */
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { useLabAsk, type UseLabAskOptions } from './useLabAsk'
import { readLabBookChat } from './labChatHistory'

vi.mock('../data/editionLoader', () => ({ loadEditionWindow: vi.fn() }))
vi.mock('../hooks/useAuth', () => ({ useAuth: () => ({ session: null, likelyAuthenticated: false }) }))
vi.mock('../hooks/useVoiceSession', () => ({
  useVoiceSession: () => ({ state: 'idle', activity: 'idle', connection: 'idle', isActive: false, stop: vi.fn(), setAssistantPace: vi.fn() }),
}))
vi.mock('../utils/analytics', () => ({ trackEvent: vi.fn() }))

const base: UseLabAskOptions = {
  bookId: 'bible',
  editionKey: 'web-en',
  bookTitle: 'The Bible',
  bookAuthor: 'Various',
  chapterLabel: '1 Maccabees 13',
  chapterNumber: 900,
  paragraphs: ['Simon gathered the people.'],
  paragraphIndex: 0,
  signedIn: true,
  authToken: 'fixture',
  userId: null,
  voiceToolAdapter: {} as UseLabAskOptions['voiceToolAdapter'],
}

function stream(text: string, stopReason: string) {
  const body = [
    `data: ${JSON.stringify({ type: 'message_start', message: {} })}`,
    `data: ${JSON.stringify({ type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text } })}`,
    `data: ${JSON.stringify({ type: 'message_delta', delta: { stop_reason: stopReason } })}`,
    `data: ${JSON.stringify({ type: 'message_stop' })}`,
    '',
  ].join('\n')
  return new Response(body, { headers: { 'content-type': 'text/event-stream' } })
}

afterEach(() => { cleanup(); localStorage.clear(); vi.unstubAllGlobals(); vi.clearAllMocks() })

const PARTIAL = 'Polybius for the earlier background, then Diodorus Siculus, Justin/Trog'

it('shows and saves a cut-off answer as incomplete, then Continue joins the rest on to it', async () => {
  const fetcher = vi.fn()
    .mockResolvedValueOnce(stream(PARTIAL, 'max_tokens'))
    .mockResolvedValueOnce(stream('us for the Seleucid side.', 'end_turn'))
  vi.stubGlobal('fetch', fetcher)
  const { result } = renderHook(() => useLabAsk(base))

  await act(async () => { await result.current.sendTyped('Which ancient sources tell this story?') })
  const answer = result.current.turns.find(turn => turn.role === 'assistant')!
  expect(answer).toMatchObject({ content: PARTIAL, cutOff: true })
  expect(result.current.notice).toBeNull()
  const saved = readLabBookChat('bible').flatMap(conversation => conversation.messages).find(message => message.id === answer.id)
  expect(saved).toMatchObject({ content: PARTIAL, isComplete: false, cutOff: true })

  await act(async () => { await result.current.continueAnswer(answer.id) })
  const request = JSON.parse(String(fetcher.mock.calls[1][1]?.body)) as { continue?: boolean; companion: { intent: string }; messages: Array<{ role: string; content: string }> }
  expect(request.continue).toBe(true)
  expect(request.companion.intent).toBe('ask')
  expect(request.messages.at(-1)).toEqual({ role: 'assistant', content: PARTIAL })

  const joined = `${PARTIAL}us for the Seleucid side.`
  const answers = result.current.turns.filter(turn => turn.role === 'assistant')
  expect(answers).toHaveLength(1)
  expect(answers[0].content).toBe(joined)
  expect(answers[0].cutOff).toBeFalsy()
  const stored = readLabBookChat('bible').flatMap(conversation => conversation.messages).filter(message => message.role === 'assistant')
  expect(stored).toHaveLength(1)
  expect(stored[0]).toMatchObject({ id: answer.id, content: joined, isComplete: true })
  expect(stored[0].cutOff).toBeUndefined()
})

it('saves a whole answer as complete, with no Continue', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(stream('Simon was the last of the brothers.', 'end_turn')))
  const { result } = renderHook(() => useLabAsk(base))
  await act(async () => { await result.current.sendTyped('Who was Simon?') })
  const answer = result.current.turns.find(turn => turn.role === 'assistant')!
  expect(answer.cutOff).toBeUndefined()
  const saved = readLabBookChat('bible').flatMap(conversation => conversation.messages).find(message => message.id === answer.id)
  expect(saved).toMatchObject({ isComplete: true })
  expect(saved?.cutOff).toBeUndefined()
})
