// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ChatMessage } from '../types'
import {
  LAB_CHAT_HISTORY_STORAGE_KEY,
  clearLabChatHistoryLocal,
  createLabChatHistorySync,
  persistLabTalkTurn,
  readLabAskTurns,
  readLabChatHistoryLocal,
  readLabTalkHistory,
} from './labTalkHistory'

afterEach(() => {
  clearLabChatHistoryLocal()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

function turn(patch: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: 't1',
    role: 'user',
    content: 'What would Keller say about this?',
    timestamp: 1_777_300_000_000,
    isComplete: true,
    source: 'text',
    ...patch,
  }
}

describe('lab talk history', () => {
  it('hydrates a book thread after a write, as on open', () => {
    persistLabTalkTurn(turn({ id: 'keller' }), 8, 0, { bookId: 'romans', headerBook: 'Romans' })
    persistLabTalkTurn(turn({
      id: 'a1',
      role: 'assistant',
      content: 'Keller would start with the gospel, not the law.',
      timestamp: 1_777_300_000_100,
    }), 8, 0, { bookId: 'romans', headerBook: 'Romans' })

    const hydrated = readLabAskTurns('romans')
    expect(hydrated.map(item => item.content)).toEqual([
      'What would Keller say about this?',
      'Keller would start with the gospel, not the law.',
    ])
    expect(localStorage.getItem(LAB_CHAT_HISTORY_STORAGE_KEY)).toContain('romans')
    expect(localStorage.getItem(LAB_CHAT_HISTORY_STORAGE_KEY)).not.toContain('"bible"')
  })

  it('keeps Romans and Genesis threads isolated', () => {
    persistLabTalkTurn(turn({ id: 'r1' }), 8, 0, { bookId: 'romans', headerBook: 'Romans' })
    persistLabTalkTurn(turn({
      id: 'g1',
      content: 'Who is speaking in the beginning?',
      timestamp: 1_777_300_000_200,
    }), 1, 0, { bookId: 'genesis', headerBook: 'Genesis' })

    expect(readLabAskTurns('romans').map(item => item.content)).toEqual([
      'What would Keller say about this?',
    ])
    expect(readLabAskTurns('genesis').map(item => item.content)).toEqual([
      'Who is speaking in the beginning?',
    ])
    expect(readLabAskTurns('romans').some(item => item.content.includes('beginning'))).toBe(false)
    expect(readLabTalkHistory('romans')[0].bookId).toBe('romans')
    expect(readLabTalkHistory('genesis')[0].bookId).toBe('genesis')
    expect(readLabChatHistoryLocal().books.bible).toBeUndefined()
  })

  it('writes voice turns under the biblical book and never into odyssey or bible', () => {
    persistLabTalkTurn({
      id: 'g1',
      role: 'assistant',
      content: "I'm listening.",
      timestamp: 1_777_300_000_000,
      bookId: 'lab',
      isComplete: true,
      source: 'voice',
    }, 1, 0, { bookId: 'romans', headerBook: 'Romans' })
    persistLabTalkTurn({
      id: 'u1',
      role: 'user',
      content: 'Why is this interesting for gardening?',
      timestamp: 1_777_300_000_100,
      bookId: 'lab',
      isComplete: true,
      source: 'voice',
    }, 1, 0, { bookId: 'romans', headerBook: 'Romans' })
    persistLabTalkTurn({
      id: 'a1',
      role: 'assistant',
      content: 'Absolutely, the chapter opens on homecoming.',
      timestamp: 1_777_300_000_200,
      bookId: 'lab',
      isComplete: false,
      source: 'voice',
    }, 1, 0, { bookId: 'romans', headerBook: 'Romans' })

    const history = readLabTalkHistory('romans')
    expect(history).toHaveLength(1)
    expect(history[0].bookId).toBe('romans')
    expect(history[0].messages.map(item => item.content)).toEqual([
      "I'm listening.",
      'Why is this interesting for gardening?',
      'Absolutely, the chapter opens on homecoming.',
    ])
    expect(history[0].messages[2].isComplete).toBe(false)
    expect(localStorage.getItem('tinct:chat-history:bible')).toBeNull()
    expect(localStorage.getItem('tinct:chat-history:odyssey')).toBeNull()
    expect(JSON.parse(localStorage.getItem(LAB_CHAT_HISTORY_STORAGE_KEY) || '{}').books.bible).toBeUndefined()
  })

  it('appends a later user turn instead of replacing the first', () => {
    persistLabTalkTurn({
      id: 'u1',
      role: 'user',
      content: 'Hey, how are you?',
      timestamp: 1_777_400_000_000,
      bookId: 'lab',
      isComplete: true,
      source: 'voice',
    }, 1, 0, { bookId: 'romans', headerBook: 'Romans' })
    persistLabTalkTurn({
      id: 'u2',
      role: 'user',
      content: "I'm thinking about reading the Bible",
      timestamp: 1_777_400_000_100,
      bookId: 'lab',
      isComplete: true,
      source: 'voice',
    }, 1, 0, { bookId: 'romans', headerBook: 'Romans' })
    const history = readLabTalkHistory('romans')
    expect(history[0].messages.map(item => item.content)).toEqual([
      'Hey, how are you?',
      "I'm thinking about reading the Bible",
    ])
  })

  it('does not persist a greeting finalized twice or stuck to itself', () => {
    persistLabTalkTurn({
      id: 'g1',
      role: 'assistant',
      content: "I'm listening.",
      timestamp: 1_777_500_000_000,
      bookId: 'lab',
      isComplete: true,
      source: 'voice',
    }, 1, 0, { bookId: 'romans', headerBook: 'Romans' })
    persistLabTalkTurn({
      id: 'g2',
      role: 'assistant',
      content: "I'm listening.",
      timestamp: 1_777_500_000_050,
      bookId: 'lab',
      isComplete: true,
      source: 'voice',
    }, 1, 0, { bookId: 'romans', headerBook: 'Romans' })
    persistLabTalkTurn({
      id: 'g3',
      role: 'assistant',
      content: "I'm listening.I'm listening.",
      timestamp: 1_777_500_000_080,
      bookId: 'lab',
      isComplete: true,
      source: 'voice',
    }, 1, 0, { bookId: 'romans', headerBook: 'Romans' })
    const history = readLabTalkHistory('romans')
    expect(history[0].messages.map(item => item.content)).toEqual(["I'm listening."])
  })

  it('rejects bible as a persist key', () => {
    persistLabTalkTurn(turn({ id: 'bad' }), 1, 0, { bookId: 'bible', headerBook: 'Bible' })
    expect(readLabChatHistoryLocal().books).toEqual({})
    expect(readLabAskTurns('bible')).toEqual([])
  })

  it('guest has no cloud write', async () => {
    const put = vi.fn(async () => true)
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const sync = createLabChatHistorySync({ token: null, put })
    expect(sync.canWriteCloud()).toBe(false)
    persistLabTalkTurn(turn(), 8, 0, { bookId: 'romans', headerBook: 'Romans' })
    sync.persist(readLabChatHistoryLocal())
    expect(put).not.toHaveBeenCalled()
    expect(fetchMock).not.toHaveBeenCalled()
    expect(await sync.flush()).toBe(false)
    expect(put).not.toHaveBeenCalled()
    expect(readLabAskTurns('romans')).toHaveLength(1)
  })

  it('signed-in queues a PUT and keeps local as the written truth', async () => {
    const put = vi.fn(async () => true)
    const sync = createLabChatHistorySync({ token: 'signed-in-token', put, online: () => true })
    expect(sync.canWriteCloud()).toBe(true)
    persistLabTalkTurn(turn(), 8, 0, { bookId: 'romans', headerBook: 'Romans' })
    sync.persist(readLabChatHistoryLocal())
    expect(put).toHaveBeenCalledTimes(1)
    expect(readLabAskTurns('romans')[0].content).toContain('Keller')
  })
})
