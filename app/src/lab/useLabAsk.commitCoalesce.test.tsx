// @vitest-environment jsdom

/**
 * Disk IO (22 Oct 2026): a typed question and its answer reach the account
 * row in one commit instead of two, and leaving the page (hide) sends a
 * waiting turn at once. Real storage code, a mocked account row and a mocked
 * companion (/api/chat; no provider is called).
 */

import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import type { ChatConversation } from '../types'

const USER = '22222222-2222-4222-8222-222222222222'

const cloud = vi.hoisted(() => ({
  row: null as null | { value: unknown; rev: number },
  /** The next read answers with this older copy of the row (a stale replica / cache). */
  staleNextRead: null as null | { value: unknown; rev: number },
  commits: 0,
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
    cloud.commits += 1
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
import { LAB_CHAT_COMMIT_COALESCE_MS } from './labChatHistory'

const answers = new Map([
  ['Why does he mention Phinehas?', 'Phinehas is the model of zeal for the law.'],
])

const options: UseLabAskOptions = {
  bookId: 'bible',
  editionKey: 'web-en',
  bookTitle: 'The Bible',
  bookAuthor: 'Various',
  chapterLabel: '1 Maccabees 2',
  chapterNumber: 820,
  paragraphs: ['In those days arose Mattathias the son of John.'],
  paragraphIndex: 0,
  signedIn: true,
  authToken: 'fixture',
  userId: USER,
  voiceToolAdapter: {} as UseLabAskOptions['voiceToolAdapter'],
}

function companion(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = String(input)
  if (!url.includes('/api/chat')) return Promise.resolve(new Response('{}', { status: 404 }))
  const body = JSON.parse(String(init?.body)) as { messages: Array<{ content: string }> }
  const last = String(body.messages[body.messages.length - 1].content)
  const question = [...answers.keys()].find(q => last.endsWith(q)) ?? ''
  return Promise.resolve(new Response(JSON.stringify({ content: [{ text: answers.get(question) ?? 'An answer.' }] }), { headers: { 'Content-Type': 'application/json' } }))
}

const storedIds = (value: unknown) => ((value ?? []) as ChatConversation[]).flatMap(c => c.messages.map(m => m.id))

function setVisibility(state: 'visible' | 'hidden') {
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => state })
  document.dispatchEvent(new Event('visibilitychange'))
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  vi.stubGlobal('fetch', vi.fn(companion))
  cloud.row = null
  cloud.staleNextRead = null
  cloud.commits = 0
})
afterEach(() => { cleanup(); localStorage.clear(); vi.unstubAllGlobals(); vi.useRealTimers(); vi.restoreAllMocks() })

it('opening a book with no chat on either side writes nothing', async () => {
  const { result } = renderHook(() => useLabAsk(options))
  await vi.waitFor(() => expect(result.current.historyStatus).toBe('ready'))
  await act(async () => { await vi.advanceTimersByTimeAsync(1_000) })
  expect(cloud.commits).toBe(0)
  expect(cloud.row).toBeNull()
})

it('a question and its answer are one commit of the account row, after the window', async () => {
  const { result } = renderHook(() => useLabAsk(options))
  await vi.waitFor(() => expect(result.current.historyStatus).toBe('ready'))
  const before = cloud.commits
  expect(before).toBe(0)
  await act(async () => { await result.current.sendTyped('Why does he mention Phinehas?') })
  expect(result.current.turns.map(turn => turn.content)).toEqual(['Why does he mention Phinehas?', 'Phinehas is the model of zeal for the law.'])
  expect(cloud.commits).toBe(before)
  // The device copy has both turns at once.
  expect(storedIds(JSON.parse(localStorage.getItem('tinct:chat-history:bible')!))).toHaveLength(2)
  await act(async () => { await vi.advanceTimersByTimeAsync(LAB_CHAT_COMMIT_COALESCE_MS + 100) })
  expect(cloud.commits).toBe(before + 1)
  expect(storedIds(cloud.row?.value)).toHaveLength(2)
})

it('hiding the page sends the waiting turns at once', async () => {
  const { result } = renderHook(() => useLabAsk(options))
  await vi.waitFor(() => expect(result.current.historyStatus).toBe('ready'))
  await act(async () => { await result.current.sendTyped('Why does he mention Phinehas?') })
  expect(storedIds(cloud.row?.value)).toHaveLength(0)
  await act(async () => { setVisibility('hidden') })
  await act(async () => { await vi.advanceTimersByTimeAsync(10) })
  expect(storedIds(cloud.row?.value)).toHaveLength(2)
  setVisibility('visible')
})

it('unmounting sends the waiting turns', async () => {
  const { result, unmount } = renderHook(() => useLabAsk(options))
  await vi.waitFor(() => expect(result.current.historyStatus).toBe('ready'))
  await act(async () => { await result.current.sendTyped('Why does he mention Phinehas?') })
  unmount()
  await act(async () => { await vi.advanceTimersByTimeAsync(10) })
  expect(storedIds(cloud.row?.value)).toHaveLength(2)
})
