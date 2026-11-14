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

// The account: a fake `user_data` table with the server's commit rules. Chat is one row per chapter since
// 14 Nov 2026 (userDataShards.ts); `cloud` (fakeChatAccount) shows the book's rows merged as one thread.
vi.mock('../services/supabase', async () => ({ supabase: (await import('./fakeUserDataTable.test-helpers')).fakeUserDataTable.client, isSupabaseConfigured: () => true }))
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ session: { access_token: 'fixture', user: { id: USER } }, likelyAuthenticated: true }),
}))
vi.mock('../data/editionLoader', () => ({ loadEditionWindow: vi.fn() }))
vi.mock('../hooks/useVoiceSession', () => ({
  useVoiceSession: () => ({ state: 'idle', activity: 'idle', connection: 'idle', isActive: false, stop: vi.fn(), setAssistantPace: vi.fn() }),
}))
vi.mock('../utils/analytics', () => ({ trackEvent: vi.fn() }))

import { useLabAsk, type UseLabAskOptions } from './useLabAsk'
import { fakeUserDataTable as table } from './fakeUserDataTable.test-helpers'
import { fakeChatAccount } from './fakeChatAccount.test-helpers'

const cloud = fakeChatAccount(table)
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
  table.clear()
  cloud.row = { value: [desktopTurn], rev: 3 }
  table.calls.length = 0
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
