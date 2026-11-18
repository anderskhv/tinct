// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import type { ChatConversation } from '../types'
import type { LabChatCloudCommitResult } from './labChatHistory'

const account = vi.hoisted(() => ({
  read: vi.fn(async () => null),
  commit: vi.fn(async (_bookId: string, _rows: ChatConversation[], _rev: number | null): Promise<LabChatCloudCommitResult> =>
    ({ applied: false, conflict: false, row: null })),
}))
vi.mock('./labChatHistory', async importOriginal => ({
  ...await importOriginal<typeof import('./labChatHistory')>(),
  createLabChatHistoryCloud: () => account,
  migrateLegacyLabChatHistoryCloud: async () => {},
}))
vi.mock('../hooks/useAuth', () => ({ useAuth: () => ({ session: null, likelyAuthenticated: false }) }))
vi.mock('../hooks/useVoiceSession', () => ({
  useVoiceSession: () => ({ state: 'idle', activity: 'idle', connection: 'idle', isActive: false, stop: vi.fn(), setAssistantPace: vi.fn() }),
}))
vi.mock('../utils/analytics', () => ({ trackEvent: vi.fn() }))

import { useLabAsk, type UseLabAskOptions } from './useLabAsk'
import type { SharedReaderCard } from './sharedReader/sharedReaderCards'
import { readLabBookChat } from './labChatHistory'
import type { OwnTextCardsSync } from './userBook/ownTextCardsSync'

const key = 'tinct:chat-history:bible'
const options: UseLabAskOptions = {
  bookId: 'bible', bookTitle: 'The Bible', bookAuthor: 'Various', editionKey: 'web-en',
  chapterLabel: 'Sirach 1', chapterNumber: 900, paragraphs: ['All wisdom comes from the Lord.'],
  paragraphIndex: 0, userId: null, sharedReader: true,
  voiceToolAdapter: {} as UseLabAskOptions['voiceToolAdapter'],
}
const card: SharedReaderCard = {
  source: { kind: 'catalogue', bookId: 'bible' }, id: 'sirach_explain_fixture', kind: 'explain',
  chapterNumber: 900, text: 'All wisdom comes from the Lord.',
  anchor: { editionKey: 'web-en', chapterNumber: 900, paragraphIndex: 0, fromWord: 0, endParagraphIndex: 0, toWord: 7 },
  turns: [{ role: 'assistant', content: 'This synthetic answer explains the source of wisdom.' }], at: 1000, u: 1001,
}
function denyDeviceWrites() {
  const write = Storage.prototype.setItem
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  return vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, name, value) {
    if (name === key) throw new DOMException('Synthetic full device storage', 'QuotaExceededError')
    write.call(this, name, value)
  })
}
beforeEach(() => {
  account.read.mockReset().mockResolvedValue(null)
  account.commit.mockReset().mockResolvedValue({ applied: false, conflict: false, row: null })
})
afterEach(() => { cleanup(); vi.restoreAllMocks(); localStorage.clear() })

it('saves a synthetic Sirach Explain with healthy storage and no error notice', () => {
  const { result } = renderHook(() => useLabAsk(options))
  let saved = false
  act(() => { saved = result.current.saveCard(card) })
  expect(saved).toBe(true)
  expect(readLabBookChat('bible')[0].messages.at(-1)?.content).toBe(card.turns[0].content)
  expect(result.current.notice).toBeNull()
})

it('retains a quota-failed answer in memory, reports failure on identical retries, and retries durable storage', () => {
  const { result } = renderHook(() => useLabAsk(options))
  const blocked = denyDeviceWrites()
  let saved = true
  act(() => { saved = result.current.saveCard(card) })
  expect(saved).toBe(false)
  expect(localStorage.getItem(key)).toBeNull()
  expect(result.current.conversations).toHaveLength(1)
  expect(result.current.conversations[0].messages.at(-1)?.content).toBe(card.turns[0].content)
  // The active card renders the failure; do not add a second global banner.
  expect(result.current.notice).toBeNull()
  act(() => { saved = result.current.saveCard(card) })
  expect(saved).toBe(false)
  blocked.mockRestore()
  act(() => { saved = result.current.saveCard(card) })
  expect(saved).toBe(true)
  expect(readLabBookChat('bible')).toHaveLength(1)
})

it.each([false, true])('attempts account backup immediately after local failure without claiming local save (account applies: %s)', async applied => {
  account.commit.mockImplementation(async (_bookId, rows) => ({ applied, conflict: false,
    row: applied ? { conversations: rows, rev: 1 } : null }))
  const { result } = renderHook(() => useLabAsk({ ...options, userId: 'synthetic-reader' }))
  await vi.waitFor(() => expect(result.current.historyStatus).toBe('ready'))
  denyDeviceWrites()
  let saved = true
  await act(async () => { saved = result.current.saveCard(card) })
  expect(saved).toBe(false)
  expect(account.commit).toHaveBeenCalledTimes(1)
  expect(account.commit.mock.calls[0][0]).toBe('bible')
  expect(account.commit.mock.calls[0][1][0].messages.at(-1)?.content).toBe(card.turns[0].content)
  expect(result.current.conversations).toHaveLength(1)
  expect(localStorage.getItem(key)).toBeNull()
  expect(result.current.notice).toBeNull()
})

it('reports an account copy only after the exact failed answer is acknowledged', async () => {
  let acknowledge!: () => void
  account.commit.mockImplementation((_bookId, rows) => new Promise(resolve => {
    acknowledge = () => resolve({ applied: true, conflict: false, row: { conversations: rows, rev: 1 } })
  }))
  const { result } = renderHook(() => useLabAsk({ ...options, userId: 'synthetic-reader' }))
  await vi.waitFor(() => expect(result.current.historyStatus).toBe('ready'))
  denyDeviceWrites()
  act(() => { expect(result.current.saveCard(card)).toBe(false) })
  expect(result.current.cardAccountSaved).toBe(false)
  await act(async () => { acknowledge() })
  expect(result.current.cardAccountSaved).toBe(true)
  expect(result.current.cardSaveFailure).toBe('quota')
  expect(localStorage.getItem(key)).toBeNull()
})

it('does not credit an old account acknowledgment to the current account', async () => {
  let acknowledge!: () => void
  account.commit.mockImplementation((_bookId, rows) => new Promise(resolve => {
    acknowledge = () => resolve({ applied: true, conflict: false, row: { conversations: rows, rev: 1 } })
  }))
  const { result, rerender } = renderHook(({ userId }) => useLabAsk({ ...options, userId }),
    { initialProps: { userId: 'first-reader' } })
  await vi.waitFor(() => expect(result.current.historyStatus).toBe('ready'))
  denyDeviceWrites()
  act(() => { result.current.saveCard(card) })
  rerender({ userId: 'second-reader' })
  await act(async () => { acknowledge() })
  expect(result.current.cardAccountSaved).toBe(false)
})

it('does not credit an older card revision while a newer answer is unsaved', async () => {
  let acknowledge!: () => void
  account.commit.mockImplementationOnce((_bookId, rows) => new Promise(resolve => {
    acknowledge = () => resolve({ applied: true, conflict: false, row: { conversations: rows, rev: 1 } })
  })).mockResolvedValue({ applied: false, conflict: false, row: null })
  const { result } = renderHook(() => useLabAsk({ ...options, userId: 'synthetic-reader' }))
  await vi.waitFor(() => expect(result.current.historyStatus).toBe('ready'))
  denyDeviceWrites()
  act(() => { result.current.saveCard(card) })
  act(() => { result.current.saveCard({ ...card, u: card.u + 1, turns: [{ role: 'assistant', content: 'A corrected answer.' }] }) })
  await act(async () => { acknowledge() })
  expect(result.current.cardAccountSaved).toBe(false)
})

it('does not retain or upload another book’s card, or carry unsaved cards across book changes', async () => {
  const { result, rerender } = renderHook(({ bookId }) => useLabAsk({ ...options, bookId, userId: 'synthetic-reader' }),
    { initialProps: { bookId: 'bible' } })
  await vi.waitFor(() => expect(result.current.historyStatus).toBe('ready'))
  let saved = true
  act(() => { saved = result.current.saveCard({ ...card, source: { kind: 'catalogue', bookId: 'odyssey' } }) })
  expect(saved).toBe(false)
  expect(result.current.conversations).toEqual([])
  expect(account.commit).not.toHaveBeenCalled()
  denyDeviceWrites()
  await act(async () => { result.current.saveCard(card) })
  rerender({ bookId: 'odyssey' })
  expect(result.current.conversations).toEqual([])
  await vi.waitFor(() => expect(result.current.historyStatus).toBe('ready'))
  expect(account.commit.mock.calls.every(call => call[0] === 'bible')).toBe(true)
})

it('keeps a saved card when deletion fails and still emits the deletion notice', () => {
  const { result } = renderHook(() => useLabAsk(options))
  act(() => { result.current.saveCard(card) })
  const id = result.current.conversations[0].id
  denyDeviceWrites()
  let undo: (() => boolean) | null = null
  act(() => { undo = result.current.deleteCard(id) })
  expect(undo).toBeNull()
  expect(result.current.conversations[0].card?.gone).not.toBe(true)
  expect(readLabBookChat('bible')[0].card?.gone).not.toBe(true)
  expect(result.current.notice).toContain('could not be saved')
})

it('leaves a rejected private card with its owner controller and never sends it to catalogue backup', () => {
  const hex = 'a'.repeat(24), bookId = `userbook-${hex}`
  const owned = { read: () => [], subscribe: () => () => {}, isTrusted: () => false,
    saveCard: vi.fn(() => null) } as unknown as OwnTextCardsSync
  const { result } = renderHook(() => useLabAsk({ ...options, bookId, userId: 'synthetic-reader',
    privateChatGuard: true, ownCardController: owned }))
  const privateCard: SharedReaderCard = { ...card, anchor: undefined,
    source: { kind: 'own-text', bookId, ownHex: hex, converter: 1, editionKey: 'own-en' } }
  let saved = true
  act(() => { saved = result.current.saveCard(privateCard) })
  expect(saved).toBe(false)
  expect(result.current.conversations).toEqual([])
  expect(account.commit).not.toHaveBeenCalled()
  expect(localStorage.getItem(`tinct:chat-history:${bookId}`)).toBeNull()
})

it.each([
  ['QuotaExceededError', 'quota'],
  ['SecurityError', 'access'],
  ['UnknownError', 'write'],
] as const)('reports %s without recording the answer or exception text in diagnostics', (name, expected) => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const { result } = renderHook(() => useLabAsk(options))
  const write = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('private exception content', name) })
  act(() => { expect(result.current.saveCard(card)).toBe(false) })
  expect(result.current.cardSaveFailure).toBe(expected)
  expect(JSON.stringify(warn.mock.calls)).not.toContain('private exception content')
  expect(JSON.stringify(warn.mock.calls)).not.toContain(card.turns[0].content)
  write.mockRestore()
  act(() => { expect(result.current.saveCard(card)).toBe(true) })
  expect(result.current.cardSaveFailure).toBeNull()
})

it('distinguishes rejected card coordinates from a failed device write', () => {
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  const { result } = renderHook(() => useLabAsk(options))
  const write = vi.spyOn(Storage.prototype, 'setItem')
  act(() => { expect(result.current.saveCard({ ...card, anchor: { ...card.anchor!, toWord: 0 } })).toBe(false) })
  expect(result.current.cardSaveFailure).toBe('invalid-card')
  expect(write).not.toHaveBeenCalled()
  act(() => { expect(result.current.saveCard({ ...card, source: { kind: 'catalogue', bookId: 'odyssey' } })).toBe(false) })
  expect(result.current.cardSaveFailure).toBe('book-mismatch')
  expect(write).not.toHaveBeenCalled()
})

it('distinguishes a silent storage write failure from quota or invalid card data', () => {
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  const { result } = renderHook(() => useLabAsk(options))
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {})
  act(() => { expect(result.current.saveCard(card)).toBe(false) })
  expect(result.current.cardSaveFailure).toBe('readback')
  expect(result.current.conversations[0].messages.at(-1)?.content).toBe(card.turns[0].content)
})
