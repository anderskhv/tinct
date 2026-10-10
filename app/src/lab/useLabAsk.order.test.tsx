// @vitest-environment jsdom

/**
 * Anders, iPhone, The Bible, 1 Maccabees 2 (10 Oct 2026): "I had multiple
 * chats — the chat window seemed to reload and the latest chats appear to be
 * from an old session." Reproduced end to end through the hook: real storage
 * code, a mocked account row (Supabase) and a mocked companion (/api/chat; no
 * provider is called). The "reload" is the refresh the hook runs whenever the
 * tab comes back (visible / focus / pageshow), which re-reads the account row
 * and replaces the thread.
 */

import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import type { ChatConversation, ChatMessage } from '../types'

const USER = '22222222-2222-4222-8222-222222222222'

const cloud = vi.hoisted(() => ({
  row: null as null | { value: unknown; rev: number },
  /** The next read answers with this older copy of the row (a stale replica / cache). */
  staleNextRead: null as null | { value: unknown; rev: number },
}))

vi.mock('../services/supabase', () => {
  const query = () => {
    const builder = {
      select: () => builder,
      eq: () => builder,
      maybeSingle: () => {
        const source = cloud.staleNextRead ?? cloud.row
        cloud.staleNextRead = null
        const result = Promise.resolve({ data: source ? { key: 'chat-history:bible', value: source.value, rev: source.rev } : null, error: null })
        return Object.assign(result, { abortSignal: () => result })
      },
    }
    return builder
  }
  const rpc = (_name: string, args: { p_value: unknown; p_expected_rev: number | null }) => {
    const current = cloud.row
    const conflict = current ? args.p_expected_rev !== null && args.p_expected_rev !== current.rev : args.p_expected_rev !== null && args.p_expected_rev !== 0
    if (!conflict) cloud.row = { value: JSON.parse(JSON.stringify(args.p_value)), rev: (current?.rev ?? 0) + 1 }
    const row = cloud.row
    const result = Promise.resolve({ data: [{ key: 'chat-history:bible', value: row?.value ?? null, rev: row?.rev ?? null, applied: !conflict, conflict }], error: null })
    return Object.assign(result, { abortSignal: () => result })
  }
  return { supabase: { from: query, rpc }, isSupabaseConfigured: () => true }
})
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ session: { access_token: 'fixture', user: { id: USER } }, likelyAuthenticated: true }),
}))
vi.mock('../data/editionLoader', () => ({ loadEditionWindow: vi.fn() }))
vi.mock('../hooks/useVoiceSession', () => ({
  useVoiceSession: () => ({ state: 'idle', activity: 'idle', connection: 'idle', isActive: false, stop: vi.fn(), setAssistantPace: vi.fn() }),
}))
vi.mock('../utils/analytics', () => ({ trackEvent: vi.fn() }))

import { useLabAsk, type UseLabAskOptions } from './useLabAsk'

const DAY = 24 * 60 * 60 * 1000
const MACCABEES_2 = 820
const MATTHEW_14 = 944

const options: UseLabAskOptions = {
  bookId: 'bible',
  editionKey: 'web-en',
  bookTitle: 'The Bible',
  bookAuthor: 'Various',
  chapterLabel: '1 Maccabees 2',
  chapterNumber: MACCABEES_2,
  paragraphs: ['In those days arose Mattathias the son of John.'],
  paragraphIndex: 0,
  signedIn: true,
  authToken: 'fixture',
  userId: USER,
  voiceToolAdapter: {} as UseLabAskOptions['voiceToolAdapter'],
}

function msg(id: string, role: 'user' | 'assistant', content: string, timestamp: number, chapterNumber: number, extra: Partial<ChatMessage> = {}): ChatMessage {
  return { id, role, content, timestamp, bookId: 'bible', chapterNumber, isComplete: true, source: 'text', ...extra }
}
function conv(id: string, chapterNumber: number, messages: ChatMessage[]): ChatConversation {
  return { id, bookId: 'bible', chapterNumber, startTimestamp: messages[0].timestamp, endTimestamp: messages[messages.length - 1].timestamp, messages, preview: messages[0].content }
}

const now = Date.now()
const oldMaccabees = conv('conv-mac-old', MACCABEES_2, [
  msg('mac-old-u', 'user', 'Who was Mattathias?', now - 5 * DAY, MACCABEES_2),
  msg('mac-old-a', 'assistant', 'A priest of Modein.', now - 5 * DAY + 1000, MACCABEES_2),
])
const matthew = conv('conv-matthew', MATTHEW_14, [
  msg('mt-u', 'user', 'Why doesn’t he scold his disciples for their lack of faith.', now - 2 * DAY, MATTHEW_14, { highlightedText: 'He gave thanks and broke them' }),
  msg('mt-a', 'assistant', 'He feeds them first.', now - 2 * DAY + 1000, MATTHEW_14),
])

const answers = new Map([
  ['Why does he mention Phinehas?', 'Phinehas is the model of zeal for the law.'],
  ['What did Mattathias do next?', 'He fled with his sons to the hills.'],
])

function companion(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = String(input)
  if (!url.includes('/api/chat')) return Promise.resolve(new Response('{}', { status: 404 }))
  const body = JSON.parse(String(init?.body)) as { messages: Array<{ content: string }> }
  const last = String(body.messages[body.messages.length - 1].content)
  const question = [...answers.keys()].find(q => last.endsWith(q)) ?? ''
  return Promise.resolve(new Response(JSON.stringify({ content: [{ text: answers.get(question) ?? 'An answer.' }] }), { headers: { 'Content-Type': 'application/json' } }))
}

function showTab() {
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' })
  window.dispatchEvent(new Event('focus'))
  document.dispatchEvent(new Event('visibilitychange'))
}

async function refresh() {
  await act(async () => { showTab() })
  await act(async () => { await vi.advanceTimersByTimeAsync(1_000) })
}

const contents = (texts: { turns: Array<{ content: string }> }) => texts.turns.map(turn => turn.content)
const storedIds = (value: unknown) => (value as ChatConversation[]).flatMap(c => c.messages.map(m => m.id))

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  vi.stubGlobal('fetch', vi.fn(companion))
  cloud.row = { value: [oldMaccabees, matthew], rev: 7 }
  cloud.staleNextRead = null
  localStorage.setItem('tinct:chat-history:bible', JSON.stringify([oldMaccabees, matthew]))
})
afterEach(() => { cleanup(); localStorage.clear(); vi.unstubAllGlobals(); vi.useRealTimers(); vi.restoreAllMocks() })

it('continuing a chapter’s conversation, then a refresh: the new Maccabees exchanges stay last, the Matthew one stays where it was', async () => {
  // Contents → continue the 1 Maccabees 2 conversation from five days ago.
  const { result, rerender } = renderHook((props: UseLabAskOptions) => useLabAsk(props), { initialProps: { ...options, conversationId: 'conv-mac-old' } })
  await vi.waitFor(() => expect(result.current.historyStatus).toBe('ready'))
  await act(async () => { await result.current.sendTyped('Why does he mention Phinehas?') })
  // The sheet closed and reopened with the Chat button: no explicit continuation any more.
  rerender({ ...options, conversationId: undefined })
  await act(async () => { await vi.advanceTimersByTimeAsync(30_000) })
  await act(async () => { await result.current.sendTyped('What did Mattathias do next?') })
  const live = contents(result.current)
  expect(live.slice(-4)).toEqual([
    'Why does he mention Phinehas?', 'Phinehas is the model of zeal for the law.',
    'What did Mattathias do next?', 'He fled with his sons to the hills.',
  ])

  await refresh()
  // Before the fix the refresh rebuilt the thread conversation by conversation
  // (by start time), so the Matthew exchange came last ("the latest chats
  // appear to be from an old session") and today's turns moved up out of sight.
  expect(contents(result.current)).toEqual(live)
  expect(result.current.turns.at(-1)?.content).toBe('He fled with his sons to the hills.')
  // Nothing was lost: the account row and the device copy hold every turn.
  expect(storedIds(cloud.row?.value)).toHaveLength(8)
  expect(storedIds(JSON.parse(localStorage.getItem('tinct:chat-history:bible')!))).toHaveLength(8)
})

it('a refresh whose read answers with an older copy of the row never replaces or reorders newer turns', async () => {
  const { result } = renderHook(() => useLabAsk(options))
  await vi.waitFor(() => expect(result.current.historyStatus).toBe('ready'))
  await act(async () => { await result.current.sendTyped('Why does he mention Phinehas?') })
  await act(async () => { await result.current.sendTyped('What did Mattathias do next?') })
  const live = contents(result.current)
  // The read behind the refresh returns the row as it was before today.
  cloud.staleNextRead = { value: [oldMaccabees, matthew], rev: 7 }
  await refresh()
  expect(contents(result.current)).toEqual(live)
  expect(storedIds(cloud.row?.value)).toEqual(['mac-old-u', 'mac-old-a', 'mt-u', 'mt-a', ...result.current.turns.slice(-4).map(turn => turn.id)])
})

it('a phone whose device storage is full still keeps every turn in the account row, in order', async () => {
  const setItem = Storage.prototype.setItem
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key: string, value: string) {
    if (key === 'tinct:chat-history:bible') throw new DOMException('The quota has been exceeded.', 'QuotaExceededError')
    return setItem.call(this, key, value)
  })
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  const { result } = renderHook(() => useLabAsk(options))
  await vi.waitFor(() => expect(result.current.historyStatus).toBe('ready'))
  await act(async () => { await result.current.sendTyped('Why does he mention Phinehas?') })
  await act(async () => { await vi.advanceTimersByTimeAsync(10) })
  await act(async () => { await result.current.sendTyped('What did Mattathias do next?') })
  await act(async () => { await vi.advanceTimersByTimeAsync(10) })
  const newest = result.current.turns.slice(-4).map(turn => turn.id)
  // Before the fix each turn was appended to the stale device copy, and that
  // copy was committed over the row: every turn erased the one before it.
  expect(storedIds(cloud.row?.value).slice(-4)).toEqual(newest)
  await refresh()
  expect(result.current.turns.slice(-4).map(turn => turn.id)).toEqual(newest)
})
