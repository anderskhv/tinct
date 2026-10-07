// @vitest-environment jsdom

/**
 * Desktop already open, phone chatting (2026-10-07): the desktop Chat must
 * pick up turns the phone committed when the tab is shown again, even when
 * an earlier cloud read on that page never answered.
 */

import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import type { ChatConversation } from '../types'

const USER = '11111111-1111-4111-8111-111111111111'

const cloud = vi.hoisted(() => ({
  row: null as null | { value: unknown; rev: number },
  reads: 0,
  hangNextRead: false,
}))

vi.mock('../services/supabase', () => {
  const query = () => {
    const builder = {
      select: () => builder,
      eq: () => builder,
      maybeSingle: () => {
        cloud.reads += 1
        if (cloud.hangNextRead) { cloud.hangNextRead = false; return Object.assign(new Promise(() => {}), { abortSignal: () => new Promise(() => {}) }) }
        const result = Promise.resolve({ data: cloud.row ? { key: 'chat-history:bible', value: cloud.row.value, rev: cloud.row.rev } : null, error: null })
        return Object.assign(result, { abortSignal: () => result })
      },
    }
    return builder
  }
  const rpc = (_name: string, args: { p_value: unknown; p_expected_rev: number | null }) => {
    const current = cloud.row
    const conflict = current ? args.p_expected_rev !== null && args.p_expected_rev !== current.rev : args.p_expected_rev !== null && args.p_expected_rev !== 0
    if (!conflict) cloud.row = { value: args.p_value, rev: (current?.rev ?? 0) + 1 }
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
import { LAB_CHAT_CLOUD_TIMEOUT_MS } from './labChatHistory'

const options: UseLabAskOptions = {
  bookId: 'bible',
  editionKey: 'web-en',
  bookTitle: 'The Bible',
  bookAuthor: 'Various',
  chapterLabel: 'Psalms 19',
  chapterNumber: 497,
  paragraphs: ['The heavens declare the glory of God.'],
  paragraphIndex: 0,
  signedIn: true,
  authToken: 'fixture',
  userId: USER,
  voiceToolAdapter: {} as UseLabAskOptions['voiceToolAdapter'],
}

function conv(id: string, messageId: string, timestamp: number, content: string): ChatConversation {
  return {
    id, bookId: 'bible', chapterNumber: 497, startTimestamp: timestamp, endTimestamp: timestamp, preview: content,
    messages: [{ id: messageId, role: 'user', content, timestamp, bookId: 'bible', chapterNumber: 497, isComplete: true, source: 'text' }],
  }
}

const desktopTurn = conv('desktop', 'desktop-0918', Date.UTC(2026, 8, 18, 4, 23), 'Desktop question, 18 Sept')
const phoneTurn = conv('phone', 'phone-1007', Date.UTC(2026, 9, 7, 6, 0), 'Phone question, 7 Oct')

function showTab() {
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' })
  window.dispatchEvent(new Event('focus'))
  document.dispatchEvent(new Event('visibilitychange'))
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 404 })))
  cloud.row = { value: [desktopTurn], rev: 3 }
  cloud.reads = 0
  cloud.hangNextRead = false
  localStorage.setItem('tinct:chat-history:bible', JSON.stringify([desktopTurn]))
})
afterEach(() => { cleanup(); localStorage.clear(); vi.unstubAllGlobals(); vi.useRealTimers() })

it('shows a phone turn when the open desktop tab becomes visible, with one refresh per burst', async () => {
  const { result } = renderHook(() => useLabAsk(options))
  await vi.waitFor(() => expect(result.current.historyStatus).toBe('ready'))
  expect(cloud.reads).toBe(1)
  expect(result.current.turns.map(t => t.id)).toEqual(['desktop-0918'])

  cloud.row = { value: [desktopTurn, phoneTurn], rev: 4 } // the phone committed
  await act(async () => { showTab(); showTab() })
  await act(async () => { await vi.advanceTimersByTimeAsync(1_000) })
  await vi.waitFor(() => expect(result.current.turns.map(t => t.id)).toEqual(['desktop-0918', 'phone-1007']))
  expect(cloud.reads).toBe(2)
  expect(JSON.parse(localStorage.getItem('tinct:chat-history:bible')!).flatMap((c: ChatConversation) => c.messages.map(m => m.id))).toEqual(['desktop-0918', 'phone-1007'])
})

it('a cloud read that never answered does not stop later refreshes on the same page', async () => {
  cloud.hangNextRead = true
  const { result } = renderHook(() => useLabAsk(options))
  await act(async () => { await vi.advanceTimersByTimeAsync(LAB_CHAT_CLOUD_TIMEOUT_MS + 100) })
  await vi.waitFor(() => expect(result.current.historyStatus).toBe('unavailable'))

  cloud.row = { value: [desktopTurn, phoneTurn], rev: 4 }
  await act(async () => { showTab() })
  await act(async () => { await vi.advanceTimersByTimeAsync(1_000) })
  await vi.waitFor(() => expect(result.current.turns.map(t => t.id)).toEqual(['desktop-0918', 'phone-1007']))
  expect(result.current.historyStatus).toBe('ready')
})
